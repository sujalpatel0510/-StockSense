import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest, requireRoles } from '../middleware/auth';
import { OperationType, OperationStatus, MoveStatus, Role, LocationType } from '@prisma/client';

const router = Router();

// Helper to generate reference sequence
const generateNextReference = async (type: OperationType, tx: any): Promise<string> => {
  const prefixMap: Record<OperationType, string> = {
    RECEIPT: 'WH/IN',
    DELIVERY: 'WH/OUT',
    INTERNAL: 'WH/INT',
    ADJUSTMENT: 'WH/ADJ',
  };

  const prefix = prefixMap[type] || 'WH/OP';
  const count = await tx.operationTransfer.count({
    where: { type },
  });

  const seq = (count + 1).toString().padStart(4, '0');
  return `${prefix}/${seq}`;
};

// GET /api/transfers
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, status, warehouseId, search } = req.query;

    const where: any = {};

    if (type) {
      where.type = type as OperationType;
    }

    if (status) {
      where.status = status as OperationStatus;
    }

    if (search) {
      where.OR = [
        { reference: { contains: String(search), mode: 'insensitive' } },
        { partnerName: { contains: String(search), mode: 'insensitive' } },
        {
          lines: {
            some: {
              product: {
                OR: [
                  { name: { contains: String(search), mode: 'insensitive' } },
                  { sku: { contains: String(search), mode: 'insensitive' } },
                ],
              },
            },
          },
        },
      ];
    }

    if (warehouseId) {
      where.OR = [
        { sourceLocation: { warehouseId: String(warehouseId) } },
        { destLocation: { warehouseId: String(warehouseId) } },
      ];
    }

    const transfers = await prisma.operationTransfer.findMany({
      where,
      include: {
        sourceLocation: {
          include: { warehouse: true },
        },
        destLocation: {
          include: { warehouse: true },
        },
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
        lines: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, uom: true },
            },
          },
        },
      },
      orderBy: { scheduledDate: 'desc' },
    });

    res.json({ success: true, data: transfers });
  } catch (error: any) {
    console.error('Fetch transfers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transfers.' });
  }
});

// GET /api/transfers/:id
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const transfer = await prisma.operationTransfer.findUnique({
      where: { id },
      include: {
        sourceLocation: {
          include: { warehouse: true },
        },
        destLocation: {
          include: { warehouse: true },
        },
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
        lines: {
          include: {
            product: {
              include: {
                quants: {
                  include: { location: true },
                },
              },
            },
          },
        },
        stockMoves: {
          include: {
            sourceLocation: true,
            destLocation: true,
            product: true,
          },
        },
      },
    });

    if (!transfer) {
      res.status(404).json({ success: false, message: 'Transfer not found.' });
      return;
    }

    res.json({ success: true, data: transfer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch transfer.' });
  }
});

// POST /api/transfers (Create draft transfer)
router.post(
  '/',
  authenticateToken,
  requireRoles([Role.ADMIN, Role.INVENTORY_MANAGER, Role.WAREHOUSE_STAFF]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const lineSchema = z.object({
        productId: z.string(),
        demandQty: z.number().positive(),
        doneQty: z.number().nonnegative().optional().default(0),
        uom: z.string().optional(),
      });

      const schema = z.object({
        type: z.nativeEnum(OperationType),
        partnerName: z.string().optional().nullable(),
        sourceLocationId: z.string(),
        destLocationId: z.string(),
        scheduledDate: z.string().or(z.date()).optional(),
        notes: z.string().optional().nullable(),
        lines: z.array(lineSchema).min(1, 'At least one product line is required'),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: 'Invalid transfer payload', errors: parsed.error.errors });
        return;
      }

      const { type, partnerName, sourceLocationId, destLocationId, scheduledDate, notes, lines } = parsed.data;

      const result = await prisma.$transaction(async (tx) => {
        const reference = await generateNextReference(type, tx);

        const newTransfer = await tx.operationTransfer.create({
          data: {
            reference,
            type,
            status: OperationStatus.DRAFT,
            partnerName,
            sourceLocationId,
            destLocationId,
            scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
            notes,
            createdById: req.user!.id,
            lines: {
              create: lines.map((line) => ({
                productId: line.productId,
                demandQty: line.demandQty,
                doneQty: line.doneQty || 0,
                uom: line.uom || 'Units',
              })),
            },
          },
          include: {
            lines: {
              include: { product: true },
            },
            sourceLocation: true,
            destLocation: true,
          },
        });

        return newTransfer;
      });

      res.status(201).json({ success: true, data: result, message: 'Transfer created in Draft status.' });
    } catch (error: any) {
      console.error('Create transfer error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to create transfer.' });
    }
  }
);

// PUT /api/transfers/:id (Update transfer & lines)
router.put(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { partnerName, scheduledDate, notes, lines } = req.body;

      const existing = await prisma.operationTransfer.findUnique({
        where: { id },
      });

      if (!existing) {
        res.status(404).json({ success: false, message: 'Transfer not found.' });
        return;
      }

      if (existing.status === OperationStatus.DONE || existing.status === OperationStatus.CANCELED) {
        res.status(400).json({
          success: false,
          message: `Cannot edit a transfer in ${existing.status} status.`,
        });
        return;
      }

      const updated = await prisma.$transaction(async (tx) => {
        if (lines && Array.isArray(lines)) {
          await tx.transferLine.deleteMany({ where: { transferId: id } });
          await tx.transferLine.createMany({
            data: lines.map((l: any) => ({
              transferId: id,
              productId: l.productId,
              demandQty: Number(l.demandQty),
              doneQty: Number(l.doneQty ?? 0),
              uom: l.uom || 'Units',
            })),
          });
        }

        return tx.operationTransfer.update({
          where: { id },
          data: {
            ...(partnerName !== undefined && { partnerName }),
            ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
            ...(notes !== undefined && { notes }),
          },
          include: {
            lines: {
              include: { product: true },
            },
            sourceLocation: true,
            destLocation: true,
          },
        });
      });

      res.json({ success: true, data: updated, message: 'Transfer updated successfully.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update transfer.' });
    }
  }
);

// POST /api/transfers/:id/action-mark-ready
router.post(
  '/:id/action-mark-ready',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;

      const transfer = await prisma.operationTransfer.findUnique({
        where: { id },
        include: { lines: true },
      });

      if (!transfer) {
        res.status(404).json({ success: false, message: 'Transfer not found.' });
        return;
      }

      if (transfer.status !== OperationStatus.DRAFT && transfer.status !== OperationStatus.WAITING) {
        res.status(400).json({ success: false, message: 'Transfer is not in Draft/Waiting status.' });
        return;
      }

      await prisma.$transaction([
        ...transfer.lines.map((line: any) =>
          prisma.transferLine.update({
            where: { id: line.id },
            data: { doneQty: line.doneQty > 0 ? line.doneQty : line.demandQty },
          })
        ),
        prisma.operationTransfer.update({
          where: { id },
          data: { status: OperationStatus.READY },
        }),
      ]);

      res.json({ success: true, message: 'Transfer is now READY for processing.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to mark transfer ready.' });
    }
  }
);

// POST /api/transfers/:id/action-validate (CRITICAL: Validates & Moves Inventory)
router.post(
  '/:id/action-validate',
  authenticateToken,
  requireRoles([Role.ADMIN, Role.INVENTORY_MANAGER, Role.WAREHOUSE_STAFF]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { lineUpdates } = req.body;

      const transfer = await prisma.operationTransfer.findUnique({
        where: { id },
        include: {
          lines: {
            include: { product: true },
          },
          sourceLocation: true,
          destLocation: true,
        },
      });

      if (!transfer) {
        res.status(404).json({ success: false, message: 'Transfer not found.' });
        return;
      }

      if (transfer.status === OperationStatus.DONE) {
        res.status(400).json({ success: false, message: 'Transfer is already validated and completed.' });
        return;
      }

      if (transfer.status === OperationStatus.CANCELED) {
        res.status(400).json({ success: false, message: 'Cannot validate a canceled transfer.' });
        return;
      }

      const result = await prisma.$transaction(async (tx) => {
        if (lineUpdates && Array.isArray(lineUpdates)) {
          for (const update of lineUpdates) {
            await tx.transferLine.update({
              where: { id: update.lineId },
              data: { doneQty: Number(update.doneQty) },
            });
          }
        }

        const currentLines = await tx.transferLine.findMany({
          where: { transferId: id },
          include: { product: true },
        });

        for (const line of currentLines) {
          const qtyToMove = line.doneQty > 0 ? line.doneQty : line.demandQty;

          if (qtyToMove <= 0) {
            continue;
          }

          if (transfer.sourceLocation.type === LocationType.INTERNAL) {
            const sourceQuant = await tx.stockQuant.findUnique({
              where: {
                productId_locationId: {
                  productId: line.productId,
                  locationId: transfer.sourceLocationId,
                },
              },
            });

            const availableStock = sourceQuant ? sourceQuant.quantity : 0;

            if (availableStock < qtyToMove) {
              throw new Error(
                `Insufficient stock for "${line.product.name}" at location "${transfer.sourceLocation.name}". Available: ${availableStock}, Requested: ${qtyToMove}`
              );
            }

            await tx.stockQuant.update({
              where: { id: sourceQuant!.id },
              data: {
                quantity: { decrement: qtyToMove },
              },
            });
          }

          if (transfer.destLocation.type === LocationType.INTERNAL) {
            await tx.stockQuant.upsert({
              where: {
                productId_locationId: {
                  productId: line.productId,
                  locationId: transfer.destLocationId,
                },
              },
              create: {
                productId: line.productId,
                locationId: transfer.destLocationId,
                quantity: qtyToMove,
                reservedQuantity: 0,
              },
              update: {
                quantity: { increment: qtyToMove },
              },
            });
          }

          await tx.stockMove.create({
            data: {
              reference: transfer.reference,
              transferId: transfer.id,
              productId: line.productId,
              sourceLocationId: transfer.sourceLocationId,
              destLocationId: transfer.destLocationId,
              quantity: qtyToMove,
              uom: line.uom,
              status: MoveStatus.DONE,
              notes: `${transfer.type} processed for ${transfer.partnerName || 'Internal'}`,
            },
          });

          await tx.transferLine.update({
            where: { id: line.id },
            data: { doneQty: qtyToMove },
          });
        }

        const updatedTransfer = await tx.operationTransfer.update({
          where: { id },
          data: {
            status: OperationStatus.DONE,
            effectiveDate: new Date(),
          },
          include: {
            lines: { include: { product: true } },
            sourceLocation: true,
            destLocation: true,
          },
        });

        return updatedTransfer;
      });

      res.json({
        success: true,
        data: result,
        message: `Transfer ${transfer.reference} validated successfully! Stock ledger and on-hand balances updated.`,
      });
    } catch (error: any) {
      console.error('Validation error:', error);
      res.status(400).json({ success: false, message: error.message || 'Transfer validation failed.' });
    }
  }
);

// POST /api/transfers/:id/action-cancel
router.post(
  '/:id/action-cancel',
  authenticateToken,
  requireRoles([Role.ADMIN, Role.INVENTORY_MANAGER]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;

      const transfer = await prisma.operationTransfer.findUnique({
        where: { id },
      });

      if (!transfer) {
        res.status(404).json({ success: false, message: 'Transfer not found.' });
        return;
      }

      if (transfer.status === OperationStatus.DONE) {
        res.status(400).json({
          success: false,
          message: 'Cannot cancel an already completed transfer. Use an inventory adjustment instead.',
        });
        return;
      }

      const updated = await prisma.operationTransfer.update({
        where: { id },
        data: { status: OperationStatus.CANCELED },
      });

      res.json({ success: true, data: updated, message: 'Transfer canceled.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to cancel transfer.' });
    }
  }
);

export default router;
