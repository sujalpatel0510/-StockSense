import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest, requireRoles } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// GET /api/categories
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await prisma.productCategory.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
});

// POST /api/categories
router.post(
  '/',
  authenticateToken,
  requireRoles([Role.ADMIN, Role.INVENTORY_MANAGER]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, code, description } = req.body;
      if (!name) {
        res.status(400).json({ success: false, message: 'Category name is required.' });
        return;
      }

      const category = await prisma.productCategory.create({
        data: { name, code, description },
      });

      res.status(201).json({ success: true, data: category, message: 'Category created successfully.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to create category.' });
    }
  }
);

export default router;
