import type { HTMLAttributes } from 'react';
import { Info } from 'lucide-react';

import { cn } from '@/utils/cn';

export const Callout = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex items-start gap-3 rounded-lg border border-slate-800/60 bg-slate-900/80 px-4 py-3 text-sm text-slate-300',
      className,
    )}
    {...props}
  >
    <Info className="mt-0.5 h-5 w-5 text-brand" />
    <div>{children}</div>
  </div>
);
