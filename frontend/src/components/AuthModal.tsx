import React, { useState } from 'react';
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
  Check,
  TrendingUp,
  Layers,
  Building2,
  Shield,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const AuthModal: React.FC = () => {
  const { login, register, googleLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Form inputs
  const [email, setEmail] = useState('admin@stocksense.com');
  const [password, setPassword] = useState('admin123');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'INVENTORY_MANAGER' | 'WAREHOUSE_STAFF'>('INVENTORY_MANAGER');

  // Selected demo account indicator
  const [activeDemoRole, setActiveDemoRole] = useState<'admin' | 'manager' | 'staff' | null>('admin');

  // Forgot password OTP states
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtpNotice, setSimulatedOtpNotice] = useState<string | null>(null);

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

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await googleLogin({
        email: 'sujal.google@stocksense.demo',
        name: 'Sujal (Google Verified)',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Handlers
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.forgotPassword(forgotEmail);
      setOtpSent(true);
      if (res.simulatedOtp) {
        setSimulatedOtpNotice(res.simulatedOtp);
        setOtpCode(res.simulatedOtp);
      }
      setSuccessMessage('OTP code generated! Check simulation preview.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
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
        setSimulatedOtpNotice(null);
        setIsRegister(false);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-900 text-slate-100 font-sans">
      {/* LEFT COLUMN: Enterprise Showcase (Visible on lg screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0c0f17] via-[#1a121e] to-[#0a0d14] p-12 flex-col justify-between border-r border-slate-800/80 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-[#714B67]/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#714B67] to-[#8d5e81] p-2 flex items-center justify-center shadow-lg shadow-purple-900/30 border border-white/20">
              <Boxes className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
                StockSense
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono font-semibold border border-purple-400/20">
                  IMS 2026
                </span>
              </span>
              <p className="text-xs text-slate-400">Modular Real-Time Inventory Management System</p>
            </div>
          </div>
        </div>

        {/* Main Value Proposition */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-purple-300 font-medium shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Double-Entry Inventory Accounting Architecture</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
            Enterprise stock operations, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-emerald-300">
              engineered with precision.
            </span>
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed">
            Eliminate phantom inventory and spreadsheet errors. Track raw material receipts, internal manufacturing transfers, and customer dispatches with mathematically immutable ledger moves.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Zero Inventory Drift</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Atomic PostgreSQL transactions with complete debit-credit location pairing.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Automated Reorders</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Real-time safety stock monitoring with proactive supplier replenishment triggers.
              </p>
            </div>
          </div>

          {/* Live Activity Simulation Feed */}
          <div className="p-4 rounded-xl bg-black/40 border border-slate-800 text-xs space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Live Stock Ledger Activity</span>
              <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Sync Active
              </span>
            </div>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-300">
                <span>WH/IN/0001 · Tata Steel</span>
                <span className="text-emerald-400 font-bold">+100 kg</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>WH/OUT/0001 · Metro Workspaces</span>
                <span className="text-amber-400 font-bold">-10 Chairs</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>WH/INT/0001 · WH1 $\to$ WH2</span>
                <span className="text-purple-400 font-bold">25 Units</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-800/60">
          <span>StockSense Platform v1.0</span>
          <span>PostgreSQL 16/17 • Prisma ORM</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Professional Authentication Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-[#0F172A]">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center space-x-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-[#714B67] p-1.5 flex items-center justify-center">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white">StockSense IMS</span>
              <p className="text-[11px] text-slate-400">Modular Inventory Management</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50 backdrop-blur-md">
            {/* Header Titles */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {isRegister ? 'Create an Account' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isRegister
                  ? 'Get started with enterprise warehouse & stock management'
                  : 'Enter your credentials to access your inventory portal'}
              </p>
            </div>

            {/* Segmented Sign In / Register Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-950/70 rounded-xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  !isRegister ? 'bg-[#714B67] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
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
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  isRegister ? 'bg-[#714B67] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* 1-Click Demo Accounts for Hackathon Judges */}
            {!isRegister && (
              <div className="mb-6 p-3.5 bg-slate-950/60 rounded-xl border border-purple-500/20 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-purple-300">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Hackathon Jury 1-Click Login:
                  </span>
                  <span className="text-[10px] text-slate-400">Click to fill & login</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('admin', 'admin@stocksense.com', 'admin123')}
                    disabled={loading}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition text-center flex flex-col items-center gap-0.5 ${
                      activeDemoRole === 'admin'
                        ? 'bg-purple-900/60 border-purple-400 text-white shadow-sm'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80'
                    }`}
                  >
                    <span>👑 Admin</span>
                    <span className="text-[9px] text-purple-300 font-mono font-normal">Full Access</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('manager', 'manager@stocksense.com', 'manager123')}
                    disabled={loading}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition text-center flex flex-col items-center gap-0.5 ${
                      activeDemoRole === 'manager'
                        ? 'bg-emerald-900/60 border-emerald-400 text-white shadow-sm'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80'
                    }`}
                  >
                    <span>📦 Manager</span>
                    <span className="text-[9px] text-emerald-300 font-mono font-normal">Operations</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('staff', 'staff@stocksense.com', 'staff123')}
                    disabled={loading}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition text-center flex flex-col items-center gap-0.5 ${
                      activeDemoRole === 'staff'
                        ? 'bg-blue-900/60 border-blue-400 text-white shadow-sm'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80'
                    }`}
                  >
                    <span>🏷️ Staff</span>
                    <span className="text-[9px] text-blue-300 font-mono font-normal">Transfers</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error & Success Alerts */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-950 border border-slate-700 hover:border-slate-500 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition shadow-sm disabled:opacity-50 group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google Account</span>
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                <span className="bg-slate-900 px-3 text-slate-500">or continue with email</span>
              </div>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Sujal V."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Role Assignment</label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      >
                        <option value="INVENTORY_MANAGER">Inventory Manager (Full Ops & Products)</option>
                        <option value="WAREHOUSE_STAFF">Warehouse Staff (Transfers & Picking)</option>
                        <option value="ADMIN">System Administrator</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setActiveDemoRole(null);
                    }}
                    placeholder="user@stocksense.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setIsForgotModalOpen(true);
                      }}
                      className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold"
                    >
                      Forgot password (OTP)?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setActiveDemoRole(null);
                    }}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-slate-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#714B67] to-[#8f5a81] hover:from-[#5e3d55] hover:to-[#79496c] text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-950/40 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isRegister ? 'Create StockSense Account' : 'Sign In to Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Forgot Password OTP Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-slate-100">
            <div className="flex items-center space-x-2 text-purple-300 mb-2">
              <KeyRound className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-base">OTP Password Reset</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Enter your account email to receive a secure 6-digit one-time password.
            </p>

            {simulatedOtpNotice && (
              <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-purple-200 text-xs mb-3 flex items-center justify-between">
                <span>Simulated OTP Code:</span>
                <span className="font-mono text-sm font-black text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded border border-purple-400/40">
                  {simulatedOtpNotice}
                </span>
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@stocksense.com"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3.5 py-1.5 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1.5 bg-[#714B67] hover:bg-[#5b3852] text-white rounded-xl text-xs font-bold"
                  >
                    Send OTP
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">6-Digit OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2 text-center tracking-widest font-mono text-base font-bold bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3.5 py-1.5 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
