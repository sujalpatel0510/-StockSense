import React, { createContext, useContext, useState, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  success: (title: string, message?: string, options?: Partial<Toast>) => string;
  error: (title: string, message?: string, options?: Partial<Toast>) => string;
  warning: (title: string, message?: string, options?: Partial<Toast>) => string;
  info: (title: string, message?: string, options?: Partial<Toast>) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastColors = {
  success: 'bg-status-success-bg border-status-success-border text-status-success-text',
  error: 'bg-status-danger-bg border-status-danger-border text-status-danger-text',
  warning: 'bg-status-warning-bg border-status-warning-border text-status-warning-text',
  info: 'bg-status-info-bg border-status-info-border text-status-info-text',
};

const toastIconColors = {
  success: 'text-status-success-text',
  error: 'text-status-danger-text',
  warning: 'text-status-warning-text',
  info: 'text-status-info-text',
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = toastIcons[toast.type];
  const id = useId();
  const progressId = `${id}-progress`;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 100, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={clsx(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg min-w-[320px] max-w-md',
        toastColors[toast.type]
      )}
      role="alert"
      aria-live="polite"
    >
      <div className={clsx('flex-shrink-0 mt-0.5', toastIconColors[toast.type])}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body font-semibold">{toast.title}</p>
        {toast.message && (
          <p className="text-body-sm text-current/80 mt-0.5">{toast.message}</p>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
            className="mt-2 text-sm font-semibold underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 focus:ring-offset-bg-surface"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors text-current/60 hover:text-current"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
      {toast.duration !== 0 && (
        <motion.div
          id={progressId}
          className="absolute bottom-0 left-0 h-1 rounded-b-xl"
          style={{ backgroundColor: 'currentColor', opacity: 0.3 }}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: toast.duration || 5000, ease: 'linear' }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={100}
        />
      )}
    </motion.div>
  );
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((newToast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toastWithId = { ...newToast, id };
    setToasts((prev) => [...prev, toastWithId]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const createToast = useCallback(
    (type: ToastType) => (title: string, message?: string, options?: Partial<Toast>) =>
      toast({ type, title, message, ...options }),
    [toast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        toast,
        dismiss,
        dismissAll,
        success: createToast('success'),
        error: createToast('error'),
        warning: createToast('warning'),
        info: createToast('info'),
      }}
    >
      {children}
      <AnimatePresence>
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none" aria-live="polite" aria-label="Notifications">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onDismiss={dismiss} />
            </div>
          ))}
        </div>
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};