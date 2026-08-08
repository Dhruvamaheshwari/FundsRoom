import { prisma } from '../utils/prisma';
import { ChallanStatus, MovementType, Prisma } from '@prisma/client';

export const createDraftChallan = async (
  customerId: string,
  items: { productId: string; quantity: number }[],
  createdById: string
) => {
  await prisma.customer.findUniqueOrThrow({ where: { id: customerId } });

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  if (products.length !== productIds.length) {
    throw new Error('INVALID_PRODUCT');
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  let totalQuantity = 0;
  const challanItemsData = items.map((item) => {
    const product = productMap.get(item.productId)!;
    totalQuantity += item.quantity;

    return {
      productId: product.id,
      quantity: item.quantity,
      productNameSnapshot: product.name,
      skuSnapshot: product.sku,
      unitPriceSnapshot: product.unitPrice,
    };
  });

  const count = await prisma.challan.count();
  const challanNumber = `CH-2026-${String(count + 1).padStart(5, '0')}`;

  return prisma.challan.create({
    data: {
      challanNumber,
      customerId,
      totalQuantity,
      status: ChallanStatus.DRAFT,
      createdById,
      items: {
        create: challanItemsData,
      },
    },
    include: { items: true },
  });
};

export const getChallans = async (
  page: number,
  limit: number,
  search?: string,
  status?: ChallanStatus,
  customerId?: string
) => {
  const skip = (page - 1) * limit;
  const where: Prisma.ChallanWhereInput = {};

  if (search) {
    where.challanNumber = { contains: search, mode: 'insensitive' };
  }
  if (status) {
    where.status = status;
  }
  if (customerId) {
    where.customerId = customerId;
  }

  const [challans, total] = await Promise.all([
    prisma.challan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, businessName: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.challan.count({ where }),
  ]);

  return {
    currentPage: page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    challans,
  };
};

export const getChallanById = async (id: string) => {
  return prisma.challan.findUnique({
    where: { id },
    include: {
      items: true,
      customer: { select: { name: true, businessName: true, email: true, mobile: true } },
      user: { select: { name: true, email: true } },
    },
  });
};

export const confirmChallan = async (id: string, createdById: string) => {
  return prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan) throw new Error('CHALLAN_NOT_FOUND');
    if (challan.status === ChallanStatus.CONFIRMED) throw new Error('ALREADY_CONFIRMED');
    if (challan.status === ChallanStatus.CANCELLED) throw new Error('ALREADY_CANCELLED');

    const productIds = challan.items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const insufficientDetails: any[] = [];

    for (const item of challan.items) {
      const product = productMap.get(item.productId);
      if (!product || product.currentStock < item.quantity) {
        insufficientDetails.push({
          productId: item.productId,
          productName: item.productNameSnapshot,
          available: product ? product.currentStock : 0,
          requested: item.quantity,
        });
      }
    }

    if (insufficientDetails.length > 0) {
      const error: any = new Error('INSUFFICIENT_STOCK');
      error.details = insufficientDetails;
      throw error;
    }

    for (const item of challan.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: { decrement: item.quantity } },
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: MovementType.OUT,
          reason: `Sales Challan ${challan.challanNumber}`,
          createdById,
        },
      });
    }

    const confirmedChallan = await tx.challan.update({
      where: { id },
      data: { status: ChallanStatus.CONFIRMED },
    });

    return confirmedChallan;
  });
};

export const cancelChallan = async (id: string) => {
  const challan = await prisma.challan.findUnique({ where: { id } });
  if (!challan) throw new Error('CHALLAN_NOT_FOUND');
  if (challan.status === ChallanStatus.CONFIRMED) throw new Error('CANNOT_CANCEL_CONFIRMED');
  if (challan.status === ChallanStatus.CANCELLED) throw new Error('ALREADY_CANCELLED');

  return prisma.challan.update({
    where: { id },
    data: { status: ChallanStatus.CANCELLED },
  });
};
