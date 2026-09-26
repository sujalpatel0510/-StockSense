import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  badge?: {
    text: string;
    variant: 'positive' | 'warning' | 'neutral' | 'info';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-indigo-600',
  iconBg = 'bg-indigo-50',
  badge,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer group' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {value}
            </span>
          </div>
        </div>

        <div className={`p-2.5 rounded-xl ${iconBg} ${onClick ? 'group-hover:scale-105' : ''} transition-transform`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 truncate">{subtitle || 'Updated real-time'}</span>
        {badge && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
              badge.variant === 'positive'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : badge.variant === 'warning'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : badge.variant === 'info'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
};
