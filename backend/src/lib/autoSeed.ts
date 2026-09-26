import prisma from './prisma';
import bcrypt from 'bcryptjs';
import { Role, LocationType, OperationType, OperationStatus, MoveStatus } from '@prisma/client';

export async function ensureDatabaseSeeded(): Promise<void> {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      console.log('✅ Database already populated with records.');
      return;
    }

    console.log('⚡ Empty database detected. Running automatic initial seed...');

    const adminHash = await bcrypt.hash('admin123', 10);
    const managerHash = await bcrypt.hash('manager123', 10);
    const staffHash = await bcrypt.hash('staff123', 10);

    // Users
    const admin = await prisma.user.create({
      data: {
        email: 'admin@stocksense.com',
        passwordHash: adminHash,
        fullName: 'Sujal V. (Administrator)',
        role: Role.ADMIN,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
    });

    const manager = await prisma.user.create({
      data: {
        email: 'manager@stocksense.com',
        passwordHash: managerHash,
        fullName: 'Rohan Sharma (Inventory Manager)',
        role: Role.INVENTORY_MANAGER,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
    });

    const staff = await prisma.user.create({
      data: {
        email: 'staff@stocksense.com',
        passwordHash: staffHash,
        fullName: 'Amit Patel (Warehouse Staff)',
        role: Role.WAREHOUSE_STAFF,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      },
    });

    // Warehouses
    const wh1 = await prisma.warehouse.create({
      data: {
        name: 'Main Logistics Center (WH1)',
        code: 'WH1',
        address: 'Plot 42, GIDC Industrial Estate, Sector 1, Ahmedabad',
      },
    });

    const wh2 = await prisma.warehouse.create({
      data: {
        name: 'Manufacturing & Assembly Unit (WH2)',
        code: 'WH2',
        address: 'Plot 108, Tech Park Logistics Corridor, Vadodara',
      },
    });

    // Locations
    const vendorLoc = await prisma.location.create({
      data: { name: 'Vendors / External Suppliers', code: 'PARTNERS/VENDORS', type: LocationType.VENDOR },
    });
    const customerLoc = await prisma.location.create({
      data: { name: 'Customers / Dispatch', code: 'PARTNERS/CUSTOMERS', type: LocationType.CUSTOMER },
    });
    const scrapLoc = await prisma.location.create({
      data: { name: 'Virtual / Inventory Scrap & Loss', code: 'VIRTUAL/SCRAP', type: LocationType.INVENTORY_LOSS, isScrap: true },
    });

    const wh1Stock = await prisma.location.create({
      data: { name: 'WH1 / Main Stock Shelf', code: 'WH1/STOCK', warehouseId: wh1.id, type: LocationType.INTERNAL },
    });
    const wh1In = await prisma.location.create({
      data: { name: 'WH1 / Receiving Dock (In)', code: 'WH1/IN', warehouseId: wh1.id, type: LocationType.INTERNAL },
    });
    const wh1Out = await prisma.location.create({
      data: { name: 'WH1 / Shipping Dock (Out)', code: 'WH1/OUT', warehouseId: wh1.id, type: LocationType.INTERNAL },
    });
    const wh1RackA = await prisma.location.create({
      data: { name: 'WH1 / Rack Section A-1', code: 'WH1/RACK-A', warehouseId: wh1.id, type: LocationType.INTERNAL },
    });
    const wh1RackB = await prisma.location.create({
      data: { name: 'WH1 / Rack Section B-2', code: 'WH1/RACK-B', warehouseId: wh1.id, type: LocationType.INTERNAL },
    });

    const wh2Stock = await prisma.location.create({
      data: { name: 'WH2 / Plant Stock', code: 'WH2/STOCK', warehouseId: wh2.id, type: LocationType.INTERNAL },
    });
    const wh2Prod = await prisma.location.create({
      data: { name: 'WH2 / Production Floor', code: 'WH2/PROD', warehouseId: wh2.id, type: LocationType.INTERNAL },
    });

    // Categories
    const catRaw = await prisma.productCategory.create({
      data: { name: 'Raw Materials', code: 'RAW', description: 'Metals, polymers, bars, and industrial raw feedstocks' },
    });
    const catElec = await prisma.productCategory.create({
      data: { name: 'Electronics & Sensors', code: 'ELC', description: 'Microcontrollers, IoT modules, and smart sensors' },
    });
    const catHard = await prisma.productCategory.create({
      data: { name: 'Industrial Hardware', code: 'HW', description: 'Bearings, fasteners, gears, and structural brackets' },
    });
    const catFin = await prisma.productCategory.create({
      data: { name: 'Finished Products', code: 'FIN', description: 'Assembled, packaged and sale-ready goods' },
    });

    // Products
    const prodSteel = await prisma.product.create({
      data: {
        name: 'High Tensile Steel Rods (10mm)',
        sku: 'RAW-STL-10MM',
        barcode: '8901234567891',
        categoryId: catRaw.id,
        uom: 'kg',
        costPrice: 65,
        salePrice: 95,
        minStockRule: 50,
        maxStockRule: 500,
        description: 'Reinforced industrial steel rods for frames and machining.',
      },
    });

    const prodEsp = await prisma.product.create({
      data: {
        name: 'ESP32 Wi-Fi & BLE Microcontroller',
        sku: 'ELC-MCU-32',
        barcode: '8901234567892',
        categoryId: catElec.id,
        uom: 'Units',
        costPrice: 320,
        salePrice: 520,
        minStockRule: 25,
        maxStockRule: 200,
        description: 'Dual-core 240MHz microcontroller for IoT devices.',
      },
    });

    const prodBearing = await prisma.product.create({
      data: {
        name: 'Precision Ball Bearings 608RS',
        sku: 'HW-BRG-608',
        barcode: '8901234567893',
        categoryId: catHard.id,
        uom: 'Units',
        costPrice: 40,
        salePrice: 85,
        minStockRule: 100,
        maxStockRule: 1000,
        description: 'Rubber-sealed chrome steel miniature ball bearings.',
      },
    });

    const prodChair = await prisma.product.create({
      data: {
        name: 'Ergonomic Mesh Office Chair',
        sku: 'FIN-CHR-01',
        barcode: '8901234567894',
        categoryId: catFin.id,
        uom: 'Units',
        costPrice: 2800,
        salePrice: 4999,
        minStockRule: 15,
        maxStockRule: 80,
        description: 'High-back mesh executive chair with lumbar support.',
      },
    });

    const prodAlu = await prisma.product.create({
      data: {
        name: 'Aluminum T-Slot Profile 2020',
        sku: 'RAW-ALU-2020',
        barcode: '8901234567895',
        categoryId: catRaw.id,
        uom: 'Meters',
        costPrice: 210,
        salePrice: 340,
        minStockRule: 40,
        maxStockRule: 300,
        description: 'Anodized aluminum framing extrusion 20x20mm.',
      },
    });

    const prodSensor = await prisma.product.create({
      data: {
        name: 'Ultrasonic Distance Sensor HC-SR04',
        sku: 'ELC-SNS-04',
        barcode: '8901234567896',
        categoryId: catElec.id,
        uom: 'Units',
        costPrice: 85,
        salePrice: 150,
        minStockRule: 30, // currently low stock condition
        maxStockRule: 150,
        description: 'Non-contact sonar ranging module 2cm-400cm.',
      },
    });

    // Stock Quants & Initial moves
    const initialStockData = [
      { product: prodSteel, location: wh1Stock, qty: 150 },
      { product: prodSteel, location: wh1RackA, qty: 50 },
      { product: prodEsp, location: wh1Stock, qty: 80 },
      { product: prodBearing, location: wh1Stock, qty: 450 },
      { product: prodChair, location: wh1Stock, qty: 25 },
      { product: prodAlu, location: wh1RackB, qty: 95 },
      { product: prodSensor, location: wh1Stock, qty: 12 }, // Low stock condition
    ];

    for (const item of initialStockData) {
      await prisma.stockQuant.create({
        data: {
          productId: item.product.id,
          locationId: item.location.id,
          quantity: item.qty,
          reservedQuantity: 0,
        },
      });

      await prisma.stockMove.create({
        data: {
          reference: `INIT/${item.product.sku}`,
          productId: item.product.id,
          sourceLocationId: scrapLoc.id,
          destLocationId: item.location.id,
          quantity: item.qty,
          uom: item.product.uom,
          status: MoveStatus.DONE,
          notes: 'Initial inventory load',
        },
      });
    }

    // Completed Receipt (WH/IN/0001)
    const rec1 = await prisma.operationTransfer.create({
      data: {
        reference: 'WH/IN/0001',
        type: OperationType.RECEIPT,
        status: OperationStatus.DONE,
        partnerName: 'Tata Steel Global Ltd',
        sourceLocationId: vendorLoc.id,
        destLocationId: wh1Stock.id,
        scheduledDate: new Date(Date.now() - 4 * 86400000),
        effectiveDate: new Date(Date.now() - 4 * 86400000),
        createdById: manager.id,
        notes: 'Vendor delivery po-9821 validated on dock',
        lines: {
          create: [{ productId: prodSteel.id, demandQty: 100, doneQty: 100, uom: prodSteel.uom }],
        },
      },
    });

    await prisma.stockMove.create({
      data: {
        reference: rec1.reference,
        transferId: rec1.id,
        productId: prodSteel.id,
        sourceLocationId: vendorLoc.id,
        destLocationId: wh1Stock.id,
        quantity: 100,
        uom: prodSteel.uom,
        status: MoveStatus.DONE,
        notes: 'Receipt from Tata Steel Global Ltd',
      },
    });

    // Pending Receipt (WH/IN/0002) - READY
    await prisma.operationTransfer.create({
      data: {
        reference: 'WH/IN/0002',
        type: OperationType.RECEIPT,
        status: OperationStatus.READY,
        partnerName: 'Sunstone Electronics Co.',
        sourceLocationId: vendorLoc.id,
        destLocationId: wh1In.id,
        scheduledDate: new Date(),
        createdById: manager.id,
        notes: 'Arrival scheduled today. Dock inspection pending.',
        lines: {
          create: [
            { productId: prodEsp.id, demandQty: 50, doneQty: 0, uom: prodEsp.uom },
            { productId: prodSensor.id, demandQty: 40, doneQty: 0, uom: prodSensor.uom },
          ],
        },
      },
    });

    // Completed Delivery (WH/OUT/0001)
    const del1 = await prisma.operationTransfer.create({
      data: {
        reference: 'WH/OUT/0001',
        type: OperationType.DELIVERY,
        status: OperationStatus.DONE,
        partnerName: 'Metro Workspaces Ltd',
        sourceLocationId: wh1Stock.id,
        destLocationId: customerLoc.id,
        scheduledDate: new Date(Date.now() - 2 * 86400000),
        effectiveDate: new Date(Date.now() - 2 * 86400000),
        createdById: manager.id,
        notes: 'Dispatch for Order #SO-4829',
        lines: {
          create: [{ productId: prodChair.id, demandQty: 10, doneQty: 10, uom: prodChair.uom }],
        },
      },
    });

    await prisma.stockMove.create({
      data: {
        reference: del1.reference,
        transferId: del1.id,
        productId: prodChair.id,
        sourceLocationId: wh1Stock.id,
        destLocationId: customerLoc.id,
        quantity: 10,
        uom: prodChair.uom,
        status: MoveStatus.DONE,
        notes: 'Delivery to Metro Workspaces Ltd',
      },
    });

    // Pending Delivery (WH/OUT/0002) - WAITING
    await prisma.operationTransfer.create({
      data: {
        reference: 'WH/OUT/0002',
        type: OperationType.DELIVERY,
        status: OperationStatus.WAITING,
        partnerName: 'NexGen Automation LLP',
        sourceLocationId: wh1Stock.id,
        destLocationId: customerLoc.id,
        scheduledDate: new Date(Date.now() + 86400000),
        createdById: staff.id,
        notes: 'Awaiting shipping carrier pickup tomorrow morning.',
        lines: {
          create: [
            { productId: prodEsp.id, demandQty: 15, doneQty: 0, uom: prodEsp.uom },
            { productId: prodBearing.id, demandQty: 50, doneQty: 0, uom: prodBearing.uom },
          ],
        },
      },
    });

    // Internal Transfer (WH/INT/0001) - DONE
    const int1 = await prisma.operationTransfer.create({
      data: {
        reference: 'WH/INT/0001',
        type: OperationType.INTERNAL,
        status: OperationStatus.DONE,
        partnerName: 'Internal Production Requisition',
        sourceLocationId: wh1Stock.id,
        destLocationId: wh2Prod.id,
        scheduledDate: new Date(Date.now() - 1 * 86400000),
        effectiveDate: new Date(Date.now() - 1 * 86400000),
        createdById: manager.id,
        notes: 'Steel transfer to manufacturing floor for chassis fabrication.',
        lines: {
          create: [{ productId: prodSteel.id, demandQty: 25, doneQty: 25, uom: prodSteel.uom }],
        },
      },
    });

    await prisma.stockMove.create({
      data: {
        reference: int1.reference,
        transferId: int1.id,
        productId: prodSteel.id,
        sourceLocationId: wh1Stock.id,
        destLocationId: wh2Prod.id,
        quantity: 25,
        uom: prodSteel.uom,
        status: MoveStatus.DONE,
        notes: 'Internal move from WH1/STOCK to WH2/PROD',
      },
    });

    // Stock Adjustment (WH/ADJ/0001) - Damaged Scrap
    const adj1 = await prisma.operationTransfer.create({
      data: {
        reference: 'WH/ADJ/0001',
        type: OperationType.ADJUSTMENT,
        status: OperationStatus.DONE,
        partnerName: 'Damaged materials scrap adjustment',
        sourceLocationId: wh1Stock.id,
        destLocationId: scrapLoc.id,
        scheduledDate: new Date(),
        effectiveDate: new Date(),
        createdById: admin.id,
        notes: '3 kg steel rods bent during forklift movement. Written off to scrap.',
        lines: {
          create: [{ productId: prodSteel.id, demandQty: 3, doneQty: 3, uom: prodSteel.uom }],
        },
      },
    });

    await prisma.stockMove.create({
      data: {
        reference: adj1.reference,
        transferId: adj1.id,
        productId: prodSteel.id,
        sourceLocationId: wh1Stock.id,
        destLocationId: scrapLoc.id,
        quantity: 3,
        uom: prodSteel.uom,
        status: MoveStatus.DONE,
        notes: 'Adjustment: Deficit / Scrap of 3 kg',
      },
    });

    console.log('🎉 Automatic initial seed finished successfully! Demo accounts & records ready.');
  } catch (error) {
    console.error('⚠️ Auto-seed check notice:', error);
  }
}
