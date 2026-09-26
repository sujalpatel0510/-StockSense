import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest, requireRoles } from '../middleware/auth';
import { LocationType, MoveStatus, Role } from '@prisma/client';

const router = Router();

// GET /api/products
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, categoryId, status } = req.query;

    const whereClause: any = {
      isActive: true,
    };

    if (categoryId) {
      whereClause.categoryId = String(categoryId);
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { sku: { contains: String(search), mode: 'insensitive' } },
        { barcode: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        quants: {
          include: {
            location: {
              include: { warehouse: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Calculate aggregated inventory quantities for internal locations
    const enrichedProducts = products.map((prod) => {
      const internalQuants = prod.quants.filter(
        (q) => q.location.type === LocationType.INTERNAL
      );

      const totalOnHand = internalQuants.reduce((acc, q) => acc + q.quantity, 0);
      const totalReserved = internalQuants.reduce((acc, q) => acc + q.reservedQuantity, 0);
      const totalAvailable = Math.max(0, totalOnHand - totalReserved);

      let stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
      if (totalOnHand <= 0) {
        stockStatus = 'OUT_OF_STOCK';
      } else if (totalOnHand <= prod.minStockRule) {
        stockStatus = 'LOW_STOCK';
      }

      return {
        ...prod,
        totalOnHand,
        totalReserved,
        totalAvailable,
        stockStatus,
      };
    });

    const filtered = status
      ? enrichedProducts.filter((p) => p.stockStatus === status)
      : enrichedProducts;

    res.json({ success: true, data: filtered });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
});

// GET /api/products/:id
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        quants: {
          include: {
            location: {
              include: { warehouse: true },
            },
          },
        },
        stockMoves: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            sourceLocation: true,
            destLocation: true,
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const internalQuants = product.quants.filter(
      (q: any) => q.location.type === LocationType.INTERNAL
    );
    const totalOnHand = internalQuants.reduce((acc: number, q: any) => acc + q.quantity, 0);
    const totalReserved = internalQuants.reduce((acc: number, q: any) => acc + q.reservedQuantity, 0);

    let stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
    if (totalOnHand <= 0) stockStatus = 'OUT_OF_STOCK';
    else if (totalOnHand <= product.minStockRule) stockStatus = 'LOW_STOCK';

    res.json({
      success: true,
      data: {
        ...product,
        totalOnHand,
        totalReserved,
        totalAvailable: Math.max(0, totalOnHand - totalReserved),
        stockStatus,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch product details.' });
  }
});

// POST /api/products
router.post(
  '/',
  authenticateToken,
  requireRoles([Role.ADMIN, Role.INVENTORY_MANAGER]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const schema = z.object({
        name: z.string().min(2),
        sku: z.string().min(2),
        barcode: z.string().optional().nullable(),
        categoryId: z.string(),
        uom: z.string().default('Units'),
        costPrice: z.number().nonnegative().default(0),
        salePrice: z.number().nonnegative().default(0),
        minStockRule: z.number().nonnegative().default(10),
        maxStockRule: z.number().nonnegative().default(100),
        description: z.string().optional().nullable(),
        imageUrl: z.string().optional().nullable(),
        initialStock: z.number().nonnegative().optional(),
        initialLocationId: z.string().optional(),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.errors });
        return;
      }

      const { initialStock, initialLocationId, ...productData } = parsed.data;

      const existingSku = await prisma.product.findUnique({
        where: { sku: productData.sku },
      });
      if (existingSku) {
        res.status(409).json({ success: false, message: `Product with SKU "${productData.sku}" already exists.` });
        return;
      }

      const result = await prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: productData,
          include: { category: true },
        });

        if (initialStock && initialStock > 0 && initialLocationId) {
          let virtualLoss = await tx.location.findFirst({
            where: { type: LocationType.INVENTORY_LOSS },
          });

          if (!virtualLoss) {
            virtualLoss = await tx.location.create({
              data: {
                name: 'Virtual / Inventory Adjustments',
                code: 'VIRTUAL/ADJ',
                type: LocationType.INVENTORY_LOSS,
              },
            });
          }

          await tx.stockQuant.upsert({
            where: {
              productId_locationId: {
                productId: product.id,
                locationId: initialLocationId,
              },
            },
            create: {
              productId: product.id,
              locationId: initialLocationId,
              quantity: initialStock,
              reservedQuantity: 0,
            },
            update: {
              quantity: { increment: initialStock },
            },
          });

          await tx.stockMove.create({
            data: {
              reference: `INIT/${product.sku}`,
              productId: product.id,
              sourceLocationId: virtualLoss.id,
              destLocationId: initialLocationId,
              quantity: initialStock,
              uom: product.uom,
              status: MoveStatus.DONE,
              notes: 'Initial opening stock upon product creation',
            },
          });
        }

        return product;
      });

      res.status(201).json({ success: true, data: result, message: 'Product created successfully.' });
    } catch (error: any) {
      console.error('Create product error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to create product.' });
    }
  }
);

// PUT /api/products/:id
router.put(
  '/:id',
  authenticateToken,
  requireRoles([Role.ADMIN, Role.INVENTORY_MANAGER]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const {
        name,
        categoryId,
        uom,
        costPrice,
        salePrice,
        minStockRule,
        maxStockRule,
        description,
        imageUrl,
      } = req.body;

      const updated = await prisma.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(categoryId && { categoryId }),
          ...(uom && { uom }),
          ...(costPrice !== undefined && { costPrice: Number(costPrice) }),
          ...(salePrice !== undefined && { salePrice: Number(salePrice) }),
          ...(minStockRule !== undefined && { minStockRule: Number(minStockRule) }),
          ...(maxStockRule !== undefined && { maxStockRule: Number(maxStockRule) }),
          ...(description !== undefined && { description }),
          ...(imageUrl !== undefined && { imageUrl }),
        },
        include: { category: true },
      });

      res.json({ success: true, data: updated, message: 'Product updated successfully.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update product.' });
    }
  }
);

export default router;
