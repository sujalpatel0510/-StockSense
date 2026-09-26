import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import warehouseRoutes from './routes/warehouse.routes';
import transferRoutes from './routes/transfer.routes';
import adjustmentRoutes from './routes/adjustment.routes';
import moveRoutes from './routes/move-history.routes';
import dashboardRoutes from './routes/dashboard.routes';
import prisma from './lib/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*', // Allow development frontend requests
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// Request logging in dev
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Health check
app.get('/health', async (_req: Request, res: Response) => {
  try {
    // Quick DB check
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'UP',
      database: 'CONNECTED',
      timestamp: new Date().toISOString(),
      service: 'StockSense API',
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'DEGRADED',
      database: 'DISCONNECTED',
      message: 'Database connection failed. Please check DATABASE_URL in .env',
      error: error.message,
    });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/adjustments', adjustmentRoutes);
app.use('/api/moves', moveRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root greeting
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to StockSense API - Modular Inventory Management System',
    docs: '/api/dashboard/stats',
    health: '/health',
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

import { ensureDatabaseSeeded } from './lib/autoSeed';

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 StockSense Backend Server running on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🩺 Health: http://localhost:${PORT}/health`);
  await ensureDatabaseSeeded();
});
