import { z } from 'zod';
import { CustomerType, CustomerStatus } from '@prisma/client';

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().min(10, 'Valid mobile number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  businessName: z.string().min(1, 'Business name is required'),
  gstNumber: z.string().optional(),
  customerType: z.nativeEnum(CustomerType),
  address: z.string().min(1, 'Address is required'),
  status: z.nativeEnum(CustomerStatus),
  followUpDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const addFollowUpSchema = z.object({
  note: z.string().min(1, 'Note is required'),
  followUpDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});
