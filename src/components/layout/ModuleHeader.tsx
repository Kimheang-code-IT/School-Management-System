import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface ModuleHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export const ModuleHeader = ({ title, description, actions, className }: ModuleHeaderProps) => (
  <div className={cn('flex flex-wrap items-center justify-between gap-4', className)}>
    <div>
      <h2 className="text-2xl font-semibold text-slate-100">{title}</h2>
      {description && <p className="text-sm text-slate-400">{description}</p>}
    </div>
    {actions}
  </div>
);
