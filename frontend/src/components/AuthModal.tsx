import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Boxes,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
  Zap,
  Eye,
  EyeOff,
  ShieldAlert,
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button, Input, Select } from '../components/ui';

export const AuthModal: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form inputs
  const [email, setEmail] = useState('admin@stocksense.com');
  const [password, setPassword] = useState('admin123');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'INVENTORY_MANAGER' | 'WAREHOUSE_STAFF'>('INVENTORY_MANAGER');

  // Selected demo account indicator
  const [activeDemoRole, setActiveDemoRole] = useState<'admin' | 'manager' | 'staff' | null>('admin');

  // Forgot password OTP states
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quick 1-Click Demo Login for Hackathon Judges
  const handleQuickDemoLogin = async (demoRole: 'admin' | 'manager' | 'staff', demoEmail: string, demoPass: string) => {
    setActiveDemoRole(demoRole);
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setErrorMessage(null);

    try {
      await login(demoEmail, demoPass);
    } catch (err: any) {
      console.error('Demo login error:', err);
      setErrorMessage(err.message || 'Login failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (isRegister) {
        await register({ email, password, fullName, role });
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Handlers
  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      await api.forgotPassword(forgotEmail);
      setOtpSent(true);
      setSuccessMessage('OTP dispatched to the Administrator notification portal.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.resetPassword({
        email: forgotEmail,
        otp: otpCode,
        newPassword,
      });
      setSuccessMessage(res.message);
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setOtpSent(false);
        setIsRegister(false);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-bg-primary">
      {/* LEFT COLUMN: Clean, Simple & Friendly Warehouse Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative p-8 xl:p-12 flex-col justify-between overflow-hidden bg-slate-900 text-white">
        {/* Real General Warehouse Photography Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
            alt="Modern Warehouse & Stock"
            className="w-full h-full object-cover object-center brightness-90 filter"
          />
          {/* Soft Dark Gradient Overlay for Maximum Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/50" />
        </div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40 text-white">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
                StockSense
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold backdrop-blur-xs">
                  Inventory
                </span>
              </span>
              <p className="text-xs text-slate-300">Simple & Reliable Stock Management</p>
            </div>
          </div>
        </div>

        {/* Center Content: Simple, Clear & Helpful */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          {/* Friendly pill badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-medium text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Smart Warehouse & Stock System</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Simple, real-time inventory <br />
            for modern businesses.
          </h1>

          <p className="text-base text-slate-200/90 leading-relaxed">
            Keep full control of your stock. Track incoming shipments, customer deliveries, and warehouse transfers without confusing spreadsheets.
          </p>

          {/* Simple 2-column feature cards */}
          <div className="grid grid-cols-2 gap-3.5 pt-1">
            <div className="p-4 rounded-2xl bg-slate-900/75 border border-white/15 backdrop-blur-md shadow-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Accurate Stock Counts</h3>
              <p className="text-xs text-slate-300 mt-1 leading-normal">
                Always know what items you have and where they are stored.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/75 border border-white/15 backdrop-blur-md shadow-lg">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2.5">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Low Stock Alerts</h3>
              <p className="text-xs text-slate-300 mt-1 leading-normal">
                Get notified automatically before critical inventory runs out.
              </p>
            </div>
          </div>

          {/* Friendly Customer / Warehouse Stats Banner */}
          <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <img
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white/50 object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  alt="User avatar"
                />
                <img
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white/50 object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                  alt="User avatar"
                />
                <img
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white/50 object-cover"
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
                  alt="User avatar"
                />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Trusted by Warehouse Teams</p>
                <p className="text-slate-300 text-[11px]">Real-time collaboration across staff & managers</p>
              </div>
            </div>
            <div className="text-right pl-2">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                99.9% Uptime
              </span>
            </div>
          </div>
        </div>

        {/* Simple Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/15">
          <span>StockSense Platform</span>
          <span>Fast, Reliable & Simple</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Professional Authentication Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-bg-surface">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center space-x-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-brand-primary p-1.5 flex items-center justify-center">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-text-primary">StockSense IMS</span>
              <p className="text-[11px] text-text-muted">Modular Inventory Management</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 sm:p-8 shadow-xl">
            {/* Header Titles */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                {isRegister ? 'Create an Account' : 'Welcome Back'}
              </h2>
              <p className="text-caption text-text-muted mt-1">
                {isRegister
                  ? 'Get started with enterprise warehouse & stock management'
                  : 'Enter your credentials to access your inventory portal'}
              </p>
            </div>

            {/* Segmented Sign In / Register Tabs */}
            <div className="grid grid-cols-2 p-1 bg-bg-elevated rounded-xl border border-border-subtle mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 text-caption font-bold rounded-lg transition ${
                  !isRegister ? 'bg-brand-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 text-caption font-bold rounded-lg transition ${
                  isRegister ? 'bg-brand-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* 1-Click Demo Accounts for Hackathon Judges */}
            {!isRegister && (
              <div className="mb-6 p-3.5 bg-brand-primary/5 rounded-xl border border-brand-primary/20 space-y-2">
                <div className="flex items-center justify-between text-caption font-semibold text-brand-primary">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                    Hackathon Jury 1-Click Login:
                  </span>
                  <span className="text-micro text-text-muted">Click to fill & login</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('admin', 'admin@stocksense.com', 'admin123')}
                    disabled={loading}
                    className={`py-1.5 px-2 rounded-lg text-caption font-bold border transition text-center flex flex-col items-center gap-0.5 ${
                      activeDemoRole === 'admin'
                        ? 'bg-brand-primary/20 border-brand-primary text-brand-primary shadow-sm'
                        : 'bg-bg-elevated border-border-subtle text-text-secondary hover:bg-bg-elevated/80'
                    }`}>
                    <span>👑 Admin</span>
                    <span className="text-[9px] text-brand-primary font-mono font-normal">Full Access</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('manager', 'manager@stocksense.com', 'manager123')}
                    disabled={loading}
                    className={`py-1.5 px-2 rounded-lg text-caption font-bold border transition text-center flex flex-col items-center gap-0.5 ${
                      activeDemoRole === 'manager'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 shadow-sm'
                        : 'bg-bg-elevated border-border-subtle text-text-secondary hover:bg-bg-elevated/80'
                    }`}
                  >
                    <span>📦 Manager</span>
                    <span className="text-[9px] text-emerald-700 font-mono font-normal">Operations</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('staff', 'staff@stocksense.com', 'staff123')}
                    disabled={loading}
                    className={`py-1.5 px-2 rounded-lg text-caption font-bold border transition text-center flex flex-col items-center gap-0.5 ${
                      activeDemoRole === 'staff'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-700 shadow-sm'
                        : 'bg-bg-elevated border-border-subtle text-text-secondary hover:bg-bg-elevated/80'
                    }`}
                  >
                    <span>🏷️ Staff</span>
                    <span className="text-[9px] text-blue-700 font-mono font-normal">Transfers</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error & Success Alerts */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-brand-danger/10 border border-brand-danger/30 rounded-xl text-brand-danger text-caption flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 bg-status-success-bg border border-status-success-border text-status-success-text text-caption flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="label-base">Full Name</label>
                    <Input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                      placeholder="e.g. Sujal V."
                      leftIcon={<UserIcon className="w-4 h-4" />}
                    />
                  </div>

                  <div>
                    <label className="label-base">Role Assignment</label>
                    <Select
                      value={role}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value as 'INVENTORY_MANAGER' | 'WAREHOUSE_STAFF')}
                      options={[
                        { value: 'INVENTORY_MANAGER', label: 'Inventory Manager (Full Ops & Products)' },
                        { value: 'WAREHOUSE_STAFF', label: 'Warehouse Staff (Transfers & Picking)' },
                      ]}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="label-base">Work Email</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setEmail(e.target.value);
                    setActiveDemoRole(null);
                  }}
                  placeholder="user@stocksense.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label-base m-0">Password</label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setIsForgotModalOpen(true);
                      }}
                      className="text-caption text-brand-primary hover:text-brand-primary-hover font-semibold"
                    >
                      Forgot password (OTP)?
                    </button>
                  )}
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPassword(e.target.value);
                    setActiveDemoRole(null);
                  }}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPassword((prev) => !prev);
                      }}
                      className="text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                leftIcon={loading ? undefined : <ArrowRight className="w-4 h-4" />}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  isRegister ? 'Create StockSense Account' : 'Sign In to Portal'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Forgot Password OTP Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center space-x-2 text-brand-primary mb-2">
              <KeyRound className="w-5 h-5" />
              <h3 className="font-bold text-base">OTP Password Reset</h3>
            </div>
            <p className="text-caption text-text-muted mb-4">
              Enter your account email. For high security, the 6-digit OTP will be dispatched exclusively to the <strong>Admin Notification Portal</strong>.
            </p>

            {otpSent && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-400 text-xs mb-3 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Admin Security Notification</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  The OTP code has been delivered exclusively to the <strong>Admin Notification Section</strong>. Please request the code from your System Administrator or check the notification bell if logged in as Admin.
                </p>
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div>
                  <label className="label-base">Email Address</label>
                  <Input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForgotEmail(e.target.value)}
                    placeholder="admin@stocksense.com"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="secondary" type="button" onClick={() => setIsForgotModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading}>
                    Send OTP
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <label className="label-base">6-Digit OTP</label>
                  <Input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="text-center tracking-widest font-mono text-body font-bold"
                  />
                </div>
                <div>
                  <label className="label-base">New Password</label>
                  <Input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    leftIcon={<Lock className="w-4 h-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowResetPassword((prev) => !prev);
                        }}
                        className="text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                        title={showResetPassword ? 'Hide password' : 'Show password'}
                        aria-label={showResetPassword ? 'Hide password' : 'Show password'}
                      >
                        {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="secondary" type="button" onClick={() => setIsForgotModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="success" type="submit" disabled={loading}>
                    Update Password
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};