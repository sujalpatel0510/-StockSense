import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest, requireRoles } from '../middleware/auth';
import { OperationType, OperationStatus, MoveStatus, Role, LocationType } from '@prisma/client';

const router = Router();

// GET /api/adjustments
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adjustments = await prisma.operationTransfer.findMany({
      where: { type: OperationType.ADJUSTMENT },
      include: {
        sourceLocation: true,
        destLocation: true,
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
        lines: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { scheduledDate: 'desc' },
    });

    res.json({ success: true, data: adjustments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch adjustments.' });
  }
});

// POST /api/adjustments (Perform physical inventory adjustment)
router.post(
  '/',
  authenticateToken,
  requireRoles([Role.ADMIN, Role.INVENTORY_MANAGER]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const schema = z.object({
        productId: z.string(),
        locationId: z.string(),
        countedQty: z.number().nonnegative(),
        reason: z.string().optional().default('Physical Inventory Count'),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: 'Invalid adjustment data', errors: parsed.error.errors });
        return;
      }

      const { productId, locationId, countedQty, reason } = parsed.data;

      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found.' });
        return;
      }

      const location = await prisma.location.findUnique({ where: { id: locationId } });
      if (!location) {
        res.status(404).json({ success: false, message: 'Location not found.' });
        return;
      }

      const result = await prisma.$transaction(async (tx) => {
        // Find existing quant at location
        const existingQuant = await tx.stockQuant.findUnique({
          where: {
            productId_locationId: { productId, locationId },
          },
        });

        const currentQty = existingQuant ? existingQuant.quantity : 0;
        const delta = countedQty - currentQty; // positive: gain, negative: loss

        // Find or create virtual inventory loss location
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

        const countAdj = await tx.operationTransfer.count({
          where: { type: OperationType.ADJUSTMENT },
        });
        const reference = `WH/ADJ/${(countAdj + 1).toString().padStart(4, '0')}`;

        // Determine source and dest based on gain or loss
        const sourceLocId = delta >= 0 ? virtualLoss.id : locationId;
        const destLocId = delta >= 0 ? locationId : virtualLoss.id;
        const moveQty = Math.abs(delta);

        // Create the transfer record for historical tracking
        const transfer = await tx.operationTransfer.create({
          data: {
            reference,
            type: OperationType.ADJUSTMENT,
            status: OperationStatus.DONE,
            partnerName: reason,
            sourceLocationId: sourceLocId,
            destLocationId: destLocId,
            scheduledDate: new Date(),
            effectiveDate: new Date(),
            notes: `Adjusted from ${currentQty} to ${countedQty} (${delta >= 0 ? '+' : ''}${delta} ${product.uom}). Reason: ${reason}`,
            createdById: req.user!.id,
            lines: {
              create: [
                {
                  productId,
                  demandQty: countedQty,
                  doneQty: countedQty,
                  uom: product.uom,
                },
              ],
            },
          },
        });

        // Update quant to exact countedQty
        await tx.stockQuant.upsert({
          where: {
            productId_locationId: { productId, locationId },
          },
          create: {
            productId,
            locationId,
            quantity: countedQty,
            reservedQuantity: 0,
          },
          update: {
            quantity: countedQty,
          },
        });

        // If delta is non-zero, create an immutable StockMove ledger row
        if (moveQty > 0) {
          await tx.stockMove.create({
            data: {
              reference,
              transferId: transfer.id,
              productId,
              sourceLocationId: sourceLocId,
              destLocationId: destLocId,
              quantity: moveQty,
              uom: product.uom,
              status: MoveStatus.DONE,
              notes: `Adjustment: ${delta >= 0 ? 'Surplus' : 'Deficit / Scrap'} of ${moveQty} ${product.uom}`,
            },
          });
        }

        return {
          reference,
          previousQuantity: currentQty,
          newQuantity: countedQty,
          difference: delta,
          transfer,
        };
      });

      res.status(201).json({
        success: true,
        data: result,
        message: `Inventory adjusted successfully! Recorded: ${result.previousQuantity} -> Counted: ${result.newQuantity} (${result.difference >= 0 ? '+' : ''}${result.difference} ${product.uom}). Logged in stock ledger.`,
      });
    } catch (error: any) {
      console.error('Adjustment error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to process inventory adjustment.' });
    }
  }
);

export default router;
