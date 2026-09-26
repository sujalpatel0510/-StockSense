import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { OAuth2Client } from 'google-auth-library';
import { Role } from '@prisma/client';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');

const generateToken = (userId: string, email: string) => {
  const secret = process.env.JWT_SECRET || 'stocksense_super_secure_jwt_secret_key_2026_hackathon_grade';
  return jwt.sign({ id: userId, email }, secret, {
    expiresIn: '7d',
  });
};

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  role: z.enum(['INVENTORY_MANAGER', 'WAREHOUSE_STAFF']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Invalid inputs. Note: System Administrator accounts cannot be created via public registration.', errors: parseResult.error.errors });
      return;
    }

    const { email, password, fullName, role } = parseResult.data;

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // Explicitly restrict to INVENTORY_MANAGER or WAREHOUSE_STAFF
    const userRole = (role === 'INVENTORY_MANAGER' || role === 'WAREHOUSE_STAFF') ? (role as Role) : Role.INVENTORY_MANAGER;

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        role: userRole,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
      },
    });

    const token = generateToken(newUser.id, newUser.email);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: newUser,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Invalid credentials format.' });
      return;
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// POST /api/auth/google
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, email: mockEmail, name: mockName, picture: mockPic } = req.body;

    let email = '';
    let fullName = '';
    let avatarUrl = '';
    let googleId = '';

    if (credential && process.env.GOOGLE_CLIENT_ID) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        res.status(400).json({ success: false, message: 'Invalid Google credential token.' });
        return;
      }
      email = payload.email.toLowerCase();
      fullName = payload.name || payload.email.split('@')[0];
      avatarUrl = payload.picture || '';
      googleId = payload.sub;
    } else if (mockEmail) {
      // Demo / Hackathon fallback if Google Client ID not configured by user yet
      email = String(mockEmail).toLowerCase();
      fullName = mockName || email.split('@')[0];
      avatarUrl = mockPic || `https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`;
      googleId = `google_demo_${Date.now()}`;
    } else {
      res.status(400).json({ success: false, message: 'Google credential or email is required.' });
      return;
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(googleId ? [{ googleId }] : []),
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          fullName,
          avatarUrl,
          googleId,
          role: Role.INVENTORY_MANAGER,
        },
      });
    } else if (!user.googleId && googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, avatarUrl: avatarUrl || user.avatarUrl },
      });
    }

    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      message: 'Authenticated with Google successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: error.message || 'Google authentication failed.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      // For security, don't leak user existence directly, but return success message
      res.json({
        success: true,
        message: 'If this email exists in our system, a 6-digit OTP code has been generated.',
      });
      return;
    }

    // Generate random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Invalidate previous active OTPs
    await prisma.passwordResetOtp.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    await prisma.passwordResetOtp.create({
      data: {
        userId: user.id,
        otpCode,
        expiresAt,
      },
    });

    console.log(`[AUTH] Password Reset OTP generated for ${user.email}`);

    res.json({
      success: true,
      message: 'OTP generated successfully! It has been securely dispatched to the Administrator notification center.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Error processing forgot password request.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
      return;
    }

    const validOtp = await prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        otpCode: otp,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!validOtp) {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
      return;
    }

    // Mark OTP as used
    await prisma.passwordResetOtp.update({
      where: { id: validOtp.id },
      data: { usedAt: new Date() },
    });

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    res.json({
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Error resetting password.' });
  }
});

// GET /api/auth/admin-notifications
// Strictly ADMIN only can inspect OTPs and auth security events
router.get('/admin-notifications', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      res.status(403).json({ success: false, message: 'Access denied. System Administrator privileges required.' });
      return;
    }

    const otps = await prisma.passwordResetOtp.findMany({
      take: 15,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    const now = new Date();
    const notifications = otps.map((item) => ({
      id: item.id,
      type: 'SECURITY_OTP',
      title: 'Password Reset OTP Requested',
      userEmail: item.user.email,
      userName: item.user.fullName,
      userRole: item.user.role,
      otpCode: item.otpCode,
      createdAt: item.createdAt,
      expiresAt: item.expiresAt,
      isExpired: now > item.expiresAt,
      isUsed: Boolean(item.usedAt),
    }));

    res.json({
      success: true,
      notifications,
    });
  } catch (error: any) {
    console.error('Error fetching admin notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin notifications.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({
    success: true,
    user: req.user,
  });
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, avatarUrl, role } = req.body;

    // Role modification is strictly restricted to System Administrators (Role.ADMIN)
    const isAdmin = req.user?.role === Role.ADMIN;
    if (role && !isAdmin && role !== req.user?.role) {
      res.status(403).json({ success: false, message: 'Forbidden. Role modification is restricted exclusively to System Administrators.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(fullName && { fullName }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(role && isAdmin && { role: role as Role }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

export default router;
