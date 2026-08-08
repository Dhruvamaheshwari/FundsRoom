import { Request, Response } from 'express';
import * as customerService from '../services/customer.service';
import { createCustomerSchema, updateCustomerSchema, addFollowUpSchema } from '../validators/customer.validator';
import { CustomerType, CustomerStatus } from '@prisma/client';

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = createCustomerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Invalid input', errors: parseResult.error.issues });
      return;
    }

    const customer = await customerService.createCustomer(parseResult.data, req.user!.id);
    res.status(201).json({ success: true, customer });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const customerType = req.query.customerType as CustomerType | undefined;
    const status = req.query.status as CustomerStatus | undefined;

    const result = await customerService.getCustomers(page, limit, search, customerType, status);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const customer = await customerService.getCustomerById(id);
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }
    res.status(200).json({ success: true, customer });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = updateCustomerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Invalid input', errors: parseResult.error.issues });
      return;
    }

    const id = req.params.id as string;
    const customer = await customerService.getCustomerById(id);
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    const updatedCustomer = await customerService.updateCustomer(id, parseResult.data);
    res.status(200).json({ success: true, customer: updatedCustomer });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const customer = await customerService.getCustomerById(id);
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    await customerService.deleteCustomer(id);
    res.status(200).json({ success: true, message: 'Customer soft deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const addFollowUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = addFollowUpSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Invalid input', errors: parseResult.error.issues });
      return;
    }

    const id = req.params.id as string;
    const customer = await customerService.getCustomerById(id);
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    const followUp = await customerService.addFollowUp(
      id,
      parseResult.data.note,
      parseResult.data.followUpDate,
      req.user!.id
    );

    res.status(201).json({ success: true, followUp });
  } catch (error) {
    console.error('Add follow up error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getFollowUps = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const customer = await customerService.getCustomerById(id);
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    const followUps = await customerService.getFollowUps(id);
    res.status(200).json({ success: true, followUps });
  } catch (error) {
    console.error('Get follow ups error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
