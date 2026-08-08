import { Request, Response } from 'express';
import * as productService from '../services/product.service';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';
import { CustomerType, CustomerStatus } from '@prisma/client';

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = createProductSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Invalid input', errors: parseResult.error.issues });
      return;
    }

    const existingProduct = await productService.getProductBySku(parseResult.data.sku);
    if (existingProduct) {
      res.status(409).json({ success: false, message: 'Product with this SKU already exists' });
      return;
    }

    const product = await productService.createProduct(parseResult.data, req.user!.id);
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const warehouseLocation = req.query.warehouseLocation as string | undefined;
    const lowStock = req.query.lowStock === 'true';

    const result = await productService.getProducts(page, limit, search, category, warehouseLocation, lowStock);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await productService.getProductById(req.params.id as string);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = updateProductSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Invalid input', errors: parseResult.error.issues });
      return;
    }

    const id = req.params.id as string;
    const product = await productService.getProductById(id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    if (parseResult.data.sku && parseResult.data.sku !== product.sku) {
      const existingProduct = await productService.getProductBySku(parseResult.data.sku);
      if (existingProduct) {
        res.status(409).json({ success: false, message: 'Product with this SKU already exists' });
        return;
      }
    }

    const updatedProduct = await productService.updateProduct(id, parseResult.data);
    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const product = await productService.getProductById(id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    await productService.deleteProduct(id);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    if (error.message === 'HAS_MOVEMENTS') {
      res.status(409).json({ success: false, message: 'Cannot delete product because it has historical stock movements' });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};
