import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/moves (Immutable Stock Ledger)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, locationId, search, limit = '100', offset = '0', warehouseId } = req.query;

    const andConditions: any[] = [];

    if (productId) {
      andConditions.push({ productId: String(productId) });
    }

    if (locationId) {
      andConditions.push({
        OR: [
          { sourceLocationId: String(locationId) },
          { destLocationId: String(locationId) },
        ],
      });
    }

    if (warehouseId) {
      andConditions.push({
        OR: [
          { sourceLocation: { warehouseId: String(warehouseId) } },
          { destLocation: { warehouseId: String(warehouseId) } },
        ],
      });
    }

    if (search) {
      andConditions.push({
        OR: [
          { reference: { contains: String(search), mode: 'insensitive' } },
          { product: { name: { contains: String(search), mode: 'insensitive' } } },
          { product: { sku: { contains: String(search), mode: 'insensitive' } } },
          { sourceLocation: { name: { contains: String(search), mode: 'insensitive' } } },
          { destLocation: { name: { contains: String(search), mode: 'insensitive' } } },
        ],
      });
    }

    const where: any = andConditions.length > 0 ? { AND: andConditions } : {};

    const [total, moves] = await Promise.all([
      prisma.stockMove.count({ where }),
      prisma.stockMove.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true, sku: true, uom: true },
          },
          sourceLocation: {
            select: { id: true, name: true, code: true, type: true },
          },
          destLocation: {
            select: { id: true, name: true, code: true, type: true },
          },
          transfer: {
            select: { id: true, reference: true, type: true, partnerName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
    ]);

    res.json({
      success: true,
      total,
      data: moves,
    });
  } catch (error: any) {
    console.error('Fetch moves error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock move history.' });
  }
});

export default router;
