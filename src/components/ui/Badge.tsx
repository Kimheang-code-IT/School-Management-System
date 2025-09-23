import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

type BadgeVariant = 'default' | 'success' | 'danger' | 'warning';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-800/80 text-slate-100 border border-slate-700/60',
  success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40',
  danger: 'bg-rose-500/15 text-rose-300 border border-rose-500/40',
  warning: 'bg-amber-500/15 text-amber-200 border border-amber-500/40',
};

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => (
  <span
    className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', variantStyles[variant], className)}
    {...props}
  />
);
