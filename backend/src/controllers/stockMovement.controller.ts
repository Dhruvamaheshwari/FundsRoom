import { Request, Response } from 'express';
import * as stockMovementService from '../services/stockMovement.service';
import { createStockMovementSchema } from '../validators/stockMovement.validator';
import { MovementType } from '@prisma/client';

export const createStockMovement = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = createStockMovementSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Invalid input', errors: parseResult.error.issues });
      return;
    }

    const { quantity, type, reason } = parseResult.data;
    const productId = req.params.id as string;

    const movement = await stockMovementService.createStockMovement(
      productId,
      quantity,
      type,
      reason,
      req.user!.id
    );

    res.status(201).json({ success: true, movement });
  } catch (error: any) {
    console.error('Create stock movement error:', error);
    if (error.message === 'PRODUCT_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'Product not found' });
    } else if (error.message === 'INSUFFICIENT_STOCK') {
      res.status(400).json({ success: false, message: 'Insufficient stock' });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

export const getProductStockMovements = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const productId = req.params.id as string;

    const result = await stockMovementService.getProductStockMovements(productId, page, limit);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Get product stock movements error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAllStockMovements = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const productId = req.query.productId as string | undefined;
    const type = req.query.type as MovementType | undefined;

    const result = await stockMovementService.getAllStockMovements(page, limit, productId, type);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Get all stock movements error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
