import { Request, Response } from 'express';
import * as challanService from '../services/challan.service';
import { createChallanSchema } from '../validators/challan.validator';
import { ChallanStatus } from '@prisma/client';

export const createChallan = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = createChallanSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Invalid input', errors: parseResult.error.issues });
      return;
    }

    const { customerId, items } = parseResult.data;
    const challan = await challanService.createDraftChallan(customerId, items, req.user!.id);
    
    res.status(201).json({ success: true, challan });
  } catch (error: any) {
    console.error('Create challan error:', error);
    if (error.code === 'P2025' || error.message === 'INVALID_PRODUCT') {
      res.status(400).json({ success: false, message: 'Invalid customer or product provided' });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

export const getChallans = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const status = req.query.status as ChallanStatus | undefined;
    const customerId = req.query.customerId as string | undefined;

    const result = await challanService.getChallans(page, limit, search, status, customerId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Get challans error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getChallanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const challan = await challanService.getChallanById(req.params.id as string);
    if (!challan) {
      res.status(404).json({ success: false, message: 'Challan not found' });
      return;
    }
    res.status(200).json({ success: true, challan });
  } catch (error) {
    console.error('Get challan error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const confirmChallan = async (req: Request, res: Response): Promise<void> => {
  try {
    const challan = await challanService.confirmChallan(req.params.id as string, req.user!.id);
    res.status(200).json({ success: true, challan });
  } catch (error: any) {
    console.error('Confirm challan error:', error);
    if (error.message === 'CHALLAN_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'Challan not found' });
    } else if (error.message === 'ALREADY_CONFIRMED') {
      res.status(400).json({ success: false, message: 'Challan is already confirmed' });
    } else if (error.message === 'ALREADY_CANCELLED') {
      res.status(400).json({ success: false, message: 'Challan is cancelled and cannot be confirmed' });
    } else if (error.message === 'INSUFFICIENT_STOCK') {
      res.status(400).json({ 
        success: false, 
        message: 'Insufficient stock', 
        details: error.details 
      });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

export const cancelChallan = async (req: Request, res: Response): Promise<void> => {
  try {
    const challan = await challanService.cancelChallan(req.params.id as string);
    res.status(200).json({ success: true, challan });
  } catch (error: any) {
    console.error('Cancel challan error:', error);
    if (error.message === 'CHALLAN_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'Challan not found' });
    } else if (error.message === 'CANNOT_CANCEL_CONFIRMED') {
      res.status(400).json({ success: false, message: 'Cannot cancel a confirmed challan' });
    } else if (error.message === 'ALREADY_CANCELLED') {
      res.status(400).json({ success: false, message: 'Challan is already cancelled' });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};
