import { prisma } from '../utils/prisma';
import { MovementType, Prisma } from '@prisma/client';

export const createStockMovement = async (
  productId: string,
  quantity: number,
  type: MovementType,
  reason: string,
  createdById: string
) => {
  // Use a transaction to ensure atomic update
  return prisma.$transaction(async (tx) => {
    // 1. Fetch current product stock (using a lock to prevent race conditions if possible, 
    // but Prisma doesn't natively support SELECT FOR UPDATE easily across all DBs without raw SQL.
    // For this assignment, checking current stock and atomically decrementing is enough).
    
    const product = await tx.product.findUnique({ where: { id: productId } });
    
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    if (type === MovementType.OUT && product.currentStock < quantity) {
      throw new Error('INSUFFICIENT_STOCK');
    }

    // 2. Create the movement record
    const movement = await tx.stockMovement.create({
      data: {
        productId,
        quantity,
        type,
        reason,
        createdById,
      },
    });

    // 3. Update the product stock
    const stockChange = type === MovementType.IN ? quantity : -quantity;
    
    await tx.product.update({
      where: { id: productId },
      data: {
        currentStock: {
          increment: stockChange
        }
      }
    });

    return movement;
  });
};

export const getProductStockMovements = async (productId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  
  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where: { productId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    }),
    prisma.stockMovement.count({ where: { productId } })
  ]);

  return {
    currentPage: page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    movements,
  };
};

export const getAllStockMovements = async (
  page: number, 
  limit: number, 
  productId?: string, 
  type?: MovementType
) => {
  const skip = (page - 1) * limit;
  const where: Prisma.StockMovementWhereInput = {};

  if (productId) {
    where.productId = productId;
  }
  if (type) {
    where.type = type;
  }

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, sku: true } },
        user: { select: { name: true, email: true } }
      }
    }),
    prisma.stockMovement.count({ where })
  ]);

  return {
    currentPage: page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    movements,
  };
};
