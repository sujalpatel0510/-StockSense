import React from 'react';
import { Database, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-border-subtle bg-bg-surface/50 px-4 sm:px-6 lg:px-8 py-3.5 text-caption text-text-muted">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-micro">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            All Systems Nominal
          </span>
          <span className="hidden sm:inline text-border-emphasis">•</span>
          <span className="hidden sm:flex items-center gap-1 text-text-muted text-micro">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
            Double-Entry Ledger Active
          </span>
        </div>

        <div className="flex items-center space-x-3 text-micro text-text-muted font-mono">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-text-muted" /> PostgreSQL Engine
          </span>
          <span>•</span>
          <span>StockSense v1.0.0 Enterprise</span>
        </div>
      </div>
    </footer>
  );
};