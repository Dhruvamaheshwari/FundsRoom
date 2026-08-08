import { prisma } from '../utils/prisma';
import { CustomerType, CustomerStatus, Prisma } from '@prisma/client';

export const createCustomer = async (data: any, createdById: string) => {
  if (data.followUpDate) {
    data.followUpDate = new Date(data.followUpDate);
  }
  return prisma.customer.create({
    data: {
      ...data,
      createdById,
    },
  });
};

export const getCustomers = async (
  page: number,
  limit: number,
  search?: string,
  customerType?: CustomerType,
  status?: CustomerStatus
) => {
  const skip = (page - 1) * limit;

  const where: Prisma.CustomerWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { mobile: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (customerType) {
    where.customerType = customerType;
  }

  if (status) {
    where.status = status;
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    currentPage: page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    customers,
  };
};

export const getCustomerById = async (id: string) => {
  return prisma.customer.findUnique({
    where: { id },
    include: { followUps: { orderBy: { createdAt: 'desc' } } },
  });
};

export const updateCustomer = async (id: string, data: any) => {
  if (data.followUpDate) {
    data.followUpDate = new Date(data.followUpDate);
  }
  return prisma.customer.update({
    where: { id },
    data,
  });
};

export const deleteCustomer = async (id: string) => {
  await prisma.customer.findUniqueOrThrow({ where: { id } });
  
  return prisma.customer.update({
    where: { id },
    data: { status: CustomerStatus.INACTIVE },
  });
};

export const addFollowUp = async (customerId: string, note: string, followUpDate: string, createdById: string) => {
  return prisma.followUp.create({
    data: {
      customerId,
      note,
      followUpDate: new Date(followUpDate),
      createdById,
    },
  });
};

export const getFollowUps = async (customerId: string) => {
  return prisma.followUp.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
  });
};
