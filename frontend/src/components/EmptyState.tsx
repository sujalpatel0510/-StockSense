import React from 'react';
import { LucideIcon, PackageOpen } from 'lucide-react';
import { Button } from './ui/Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = PackageOpen,
  actionText,
  actionLabel,
  onAction,
}) => {
  const btnLabel = actionLabel || actionText;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-bg-surface rounded-2xl border border-dashed border-border-subtle">
      <div className="w-12 h-12 rounded-2xl bg-bg-elevated flex items-center justify-center text-text-muted mb-3 border border-border-subtle">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-body font-bold text-text-primary">{title}</h3>
      <p className="text-caption text-text-muted max-w-sm mt-1">{description}</p>
      {btnLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-4">
          {btnLabel}
        </Button>
      )}
    </div>
  );
};