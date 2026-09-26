import React, { useState } from 'react';
import { User, X, Mail, ShieldCheck, CheckCircle, LogOut } from 'lucide-react';
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

  if (!isOpen || !user) return null;

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.updateProfile({ fullName });
      setMessage(res.message);
      await refreshUser();
    } catch (err: any) {
      setMessage(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-bg-surface rounded-2xl shadow-xl max-w-sm w-full p-6 border border-border-subtle">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
            <User className="w-5 h-5 text-brand-primary" />
            My User Profile
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
            <Badge variant="primary" size="sm">{user.role}</Badge>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="mt-4 space-y-3.5">
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
              Close
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};