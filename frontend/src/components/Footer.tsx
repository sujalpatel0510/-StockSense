import React from 'react';
import { Database, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/50 px-4 sm:px-6 lg:px-8 py-3.5 text-xs text-slate-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            All Systems Nominal
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="hidden sm:flex items-center gap-1 text-slate-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            Double-Entry Ledger Active
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-slate-400" /> PostgreSQL Engine
          </span>
          <span>•</span>
          <span>StockSense v1.0.0 PRO</span>
        </div>
      </div>
    </footer>
  );
};
