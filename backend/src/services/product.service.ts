import { prisma } from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const createProduct = async (data: any, createdById: string) => {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        ...data,
        createdById,
      },
    });

    if (product.currentStock > 0) {
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          quantity: product.currentStock,
          type: 'IN',
          reason: 'Initial Stock Setup',
          createdById,
        },
      });
    }

    return product;
  });
};

export const getProducts = async (
  page: number,
  limit: number,
  search?: string,
  category?: string,
  warehouseLocation?: string,
  lowStock?: boolean
) => {
  const skip = (page - 1) * limit;
  const where: Prisma.ProductWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.category = category;
  }

  if (warehouseLocation) {
    where.warehouseLocation = warehouseLocation;
  }

  if (lowStock) {
    // Identify low stock products: currentStock <= minimumStock
    const lowStockRecords = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "Product" WHERE "currentStock" <= "minimumStock"
    `;
    const lowStockIds = lowStockRecords.map(r => r.id);
    where.id = { in: lowStockIds };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    currentPage: page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    products,
  };
};

export const getProductById = async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
  });
};

export const getProductBySku = async (sku: string) => {
  return prisma.product.findUnique({
    where: { sku },
  });
};

export const updateProduct = async (id: string, data: any) => {
  return prisma.product.update({
    where: { id },
    data,
  });
};

export const deleteProduct = async (id: string) => {
  const product = await prisma.product.findUniqueOrThrow({
    where: { id },
    include: { _count: { select: { stockMovements: true } } }
  });

  if (product._count.stockMovements > 0) {
    throw new Error('HAS_MOVEMENTS');
  }

  return prisma.product.delete({
    where: { id },
  });
};
