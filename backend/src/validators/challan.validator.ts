import { z } from 'zod';

export const createChallanSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      quantity: z.number().int().positive('Quantity must be greater than zero'),
    })
  ).min(1, 'At least one item is required')
  .refine(
    (items) => {
      const productIds = items.map((i) => i.productId);
      const uniqueProductIds = new Set(productIds);
      return uniqueProductIds.size === productIds.length;
    },
    { message: 'Duplicate products are not allowed in the same challan' }
  ),
});
