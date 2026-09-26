import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest, requireRoles } from '../middleware/auth';
import { LocationType, Role } from '@prisma/client';

const router = Router();

// GET /api/warehouses
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        locations: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: warehouses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch warehouses.' });
  }
});

// POST /api/warehouses
router.post(
  '/',
  authenticateToken,
  requireRoles([Role.ADMIN, Role.INVENTORY_MANAGER]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const schema = z.object({
        name: z.string().min(2),
        code: z.string().min(2).toUpperCase(),
        address: z.string().optional(),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.errors });
        return;
      }

      const { name, code, address } = parsed.data;

      const existing = await prisma.warehouse.findUnique({ where: { code } });
      if (existing) {
        res.status(409).json({ success: false, message: `Warehouse with code ${code} already exists.` });
        return;
      }

      // Create warehouse and default standard locations automatically (ERP style!)
      const warehouse = await prisma.warehouse.create({
        data: {
          name,
          code,
          address,
          locations: {
            create: [
              { name: `${name} / Stock`, code: `${code}/STOCK`, type: LocationType.INTERNAL },
              { name: `${name} / Input (Receiving)`, code: `${code}/IN`, type: LocationType.INTERNAL },
              { name: `${name} / Output (Delivery)`, code: `${code}/OUT`, type: LocationType.INTERNAL },
            ],
          },
        },
        include: { locations: true },
      });

      res.status(201).json({ success: true, data: warehouse, message: 'Warehouse created with default locations.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to create warehouse.' });
    }
  }
);

// PUT /api/warehouses/:id
router.put(
  '/:id',
  authenticateToken,
  requireRoles([Role.ADMIN, Role.INVENTORY_MANAGER]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { name, address, isActive } = req.body;

      const updated = await prisma.warehouse.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(address !== undefined && { address }),
          ...(isActive !== undefined && { isActive }),
        },
        include: { locations: true },
      });

      res.json({ success: true, data: updated, message: 'Warehouse updated.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update warehouse.' });
    }
  }
);

// GET /api/warehouses/locations (all locations)
router.get('/locations/all', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, warehouseId } = req.query;

    const locations = await prisma.location.findMany({
      where: {
        ...(type && { type: type as LocationType }),
        ...(warehouseId && { warehouseId: String(warehouseId) }),
      },
      include: {
        warehouse: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    res.json({ success: true, data: locations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch locations.' });
  }
});

// POST /api/warehouses/locations (create custom location)
router.post(
  '/locations',
  authenticateToken,
  requireRoles([Role.ADMIN, Role.INVENTORY_MANAGER]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const schema = z.object({
        name: z.string().min(2),
        code: z.string().min(2),
        warehouseId: z.string().optional().nullable(),
        type: z.nativeEnum(LocationType).optional().default(LocationType.INTERNAL),
        isScrap: z.boolean().optional().default(false),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.errors });
        return;
      }

      const { name, code, warehouseId, type, isScrap } = parsed.data;

      const existing = await prisma.location.findUnique({ where: { code } });
      if (existing) {
        res.status(409).json({ success: false, message: `Location code ${code} already in use.` });
        return;
      }

      const location = await prisma.location.create({
        data: {
          name,
          code,
          warehouseId: warehouseId || null,
          type,
          isScrap,
        },
        include: { warehouse: true },
      });

      res.status(201).json({ success: true, data: location, message: 'Location created successfully.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to create location.' });
    }
  }
);

export default router;
