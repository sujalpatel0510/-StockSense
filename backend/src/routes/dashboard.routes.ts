import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { OperationType, OperationStatus, LocationType } from '@prisma/client';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { warehouseId } = req.query;

    // 1. Products and Stock Analysis
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        quants: {
          include: {
            location: true,
          },
        },
      },
    });

    let totalProductsCount = products.length;
    let totalItemsInStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const categoryStatsMap: Record<string, { count: number; totalQty: number }> = {};

    for (const prod of products) {
      // Sum only internal location quants
      const internalQuants = prod.quants.filter((q) => {
        if (q.location.type !== LocationType.INTERNAL) return false;
        if (warehouseId && q.location.warehouseId !== String(warehouseId)) return false;
        return true;
      });

      const onHand = internalQuants.reduce((sum, q) => sum + q.quantity, 0);
      totalItemsInStock += onHand;

      if (onHand <= 0) {
        outOfStockCount++;
      } else if (onHand <= prod.minStockRule) {
        lowStockCount++;
      }

      const catName = prod.category?.name || 'Uncategorized';
      if (!categoryStatsMap[catName]) {
        categoryStatsMap[catName] = { count: 0, totalQty: 0 };
      }
      categoryStatsMap[catName].count++;
      categoryStatsMap[catName].totalQty += onHand;
    }

    // 2. Transfers Analysis
    const transferWhere: any = {};
    if (warehouseId) {
      transferWhere.OR = [
        { sourceLocation: { warehouseId: String(warehouseId) } },
        { destLocation: { warehouseId: String(warehouseId) } },
      ];
    }

    const [
      pendingReceipts,
      pendingDeliveries,
      internalScheduled,
      recentMoves,
      totalTransfersByStatus,
    ] = await Promise.all([
      // Pending Receipts
      prisma.operationTransfer.count({
        where: {
          ...transferWhere,
          type: OperationType.RECEIPT,
          status: { in: [OperationStatus.DRAFT, OperationStatus.WAITING, OperationStatus.READY] },
        },
      }),

      // Pending Deliveries
      prisma.operationTransfer.count({
        where: {
          ...transferWhere,
          type: OperationType.DELIVERY,
          status: { in: [OperationStatus.DRAFT, OperationStatus.WAITING, OperationStatus.READY] },
        },
      }),

      // Internal Transfers Scheduled
      prisma.operationTransfer.count({
        where: {
          ...transferWhere,
          type: OperationType.INTERNAL,
          status: { in: [OperationStatus.DRAFT, OperationStatus.WAITING, OperationStatus.READY] },
        },
      }),

      // Recent Stock Moves for live feed
      prisma.stockMove.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, sku: true, uom: true } },
          sourceLocation: { select: { name: true, code: true } },
          destLocation: { select: { name: true, code: true } },
        },
      }),

      // Group counts for quick operational cards
      prisma.operationTransfer.groupBy({
        by: ['type', 'status'],
        _count: { id: true },
      }),
    ]);

    // Format operation cards
    const operationsSummary = {
      receipts: {
        toProcess: pendingReceipts,
        total: await prisma.operationTransfer.count({ where: { type: OperationType.RECEIPT } }),
      },
      deliveries: {
        toProcess: pendingDeliveries,
        total: await prisma.operationTransfer.count({ where: { type: OperationType.DELIVERY } }),
      },
      internal: {
        toProcess: internalScheduled,
        total: await prisma.operationTransfer.count({ where: { type: OperationType.INTERNAL } }),
      },
      adjustments: {
        total: await prisma.operationTransfer.count({ where: { type: OperationType.ADJUSTMENT } }),
      },
    };

    res.json({
      success: true,
      data: {
        kpis: {
          totalProductsCount,
          totalItemsInStock,
          lowStockCount,
          outOfStockCount,
          pendingReceipts,
          pendingDeliveries,
          internalScheduled,
        },
        operationsSummary,
        categoryStats: Object.entries(categoryStatsMap).map(([category, stats]) => ({
          category,
          productCount: stats.count,
          totalQty: stats.totalQty,
        })),
        recentMoves,
      },
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate dashboard statistics.' });
  }
});

export default router;
