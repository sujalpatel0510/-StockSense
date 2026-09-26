import React, { useState } from 'react';
import { User, X, Mail, ShieldCheck, CheckCircle, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button, Input, Badge } from '../components/ui';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'INVENTORY_MANAGER' | 'WAREHOUSE_STAFF' | 'ADMIN'>(
    (user?.role as any) || 'INVENTORY_MANAGER'
  );

  const isAdmin = user?.role === 'ADMIN';

  React.useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role as any);
    }
  }, [user?.role]);

  React.useEffect(() => {
    if (user?.fullName) {
      setFullName(user.fullName);
    }
  }, [user?.fullName]);

  if (!isOpen || !user) return null;

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload: { fullName: string; role?: any } = { fullName };
      if (isAdmin) {
        payload.role = selectedRole;
      }
      const res = await api.updateProfile(payload);
      setMessage(res.message || 'Profile updated successfully!');
      await refreshUser();
    } catch (err: any) {
      setMessage(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-bg-surface rounded-2xl shadow-xl max-w-md w-full p-6 border border-border-subtle">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
            <User className="w-5 h-5 text-brand-primary" />
            My User Profile & Role Permissions
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <div className="mt-3 p-3 bg-status-success-bg border border-status-success-border text-status-success-text rounded-xl text-caption flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="mt-4 flex flex-col items-center">
          <img
            src={
              user.avatarUrl ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}`
            }
            alt="Avatar"
            className="w-16 h-16 rounded-full border-2 border-brand-primary/20 object-cover shadow-xs"
          />
          <div className="mt-2 text-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide ${
              user.role === 'INVENTORY_MANAGER'
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                : user.role === 'WAREHOUSE_STAFF'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-purple-100 text-purple-800 border border-purple-200'
            }`}>
              {user.role === 'INVENTORY_MANAGER' && '👑 INVENTORY MANAGER'}
              {user.role === 'WAREHOUSE_STAFF' && '📦 WAREHOUSE STAFF'}
              {user.role === 'ADMIN' && '⚡ SYSTEM ADMIN'}
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="mt-4 space-y-4">
          <div>
            <label className="label-base">Email (Read Only)</label>
            <Input
              type="text"
              disabled
              value={user.email}
              leftIcon={<Mail className="w-4 h-4" />}
              className="bg-bg-elevated text-text-muted"
            />
          </div>

          <div>
            <label className="label-base">Full Name</label>
            <Input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Role Assignment: Only ADMIN can change roles */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label-base m-0">Operational Role Assignment</label>
              {!isAdmin ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Admin Only
                </span>
              ) : (
                <span className="text-[10px] text-brand-primary font-bold">Admin Permission Active</span>
              )}
            </div>

            {isAdmin ? (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setSelectedRole('INVENTORY_MANAGER')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedRole === 'INVENTORY_MANAGER'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-border-subtle bg-bg-surface hover:bg-bg-elevated text-text-secondary'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-700">
                    <span>👑 Inventory Manager</span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                    Manage stock, master data, reordering rules, and facility config.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('WAREHOUSE_STAFF')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedRole === 'WAREHOUSE_STAFF'
                      ? 'border-amber-600 bg-amber-50/70 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                      : 'border-border-subtle bg-bg-surface hover:bg-bg-elevated text-text-secondary'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-700">
                    <span>📦 Warehouse Staff</span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                    Perform transfers, dock intake, picking, shelving, and physical counting.
                  </p>
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/90 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    {user.role === 'INVENTORY_MANAGER' && '👑 Inventory Manager'}
                    {user.role === 'WAREHOUSE_STAFF' && '📦 Warehouse Staff'}
                    {user.role === 'ADMIN' && '⚡ System Administrator'}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                    Active Assignment
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Role assignments and permissions are strictly managed by your System Administrator. Only administrators have permission to modify roles.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
            <Button
              variant="danger"
              size="sm"
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
            >
              Sign Out
            </Button>
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={loading}>
              {loading ? 'Saving...' : isAdmin ? 'Save & Update Role' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};