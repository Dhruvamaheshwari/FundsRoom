import { z } from 'zod';
import { MovementType } from '@prisma/client';

export const createStockMovementSchema = z.object({
  quantity: z.number().int().positive('Quantity must be greater than zero'),
  type: z.nativeEnum(MovementType),
  reason: z.string().min(1, 'Reason is required'),
});
