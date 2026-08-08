import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  currentStock: z.number().int().min(0, 'Stock cannot be negative'),
  minimumStock: z.number().int().min(0, 'Minimum stock cannot be negative'),
  warehouseLocation: z.string().min(1, 'Warehouse location is required'),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  sku: z.string().min(1, 'SKU is required').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  unitPrice: z.number().min(0, 'Unit price must be non-negative').optional(),
  minimumStock: z.number().int().min(0, 'Minimum stock cannot be negative').optional(),
  warehouseLocation: z.string().min(1, 'Warehouse location is required').optional(),
  // Explicitly omitting currentStock from updates, as it should be managed via movements
});
