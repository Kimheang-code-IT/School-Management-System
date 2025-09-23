import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

export const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('h-4 w-full animate-pulse rounded bg-slate-800/70', className)} {...props} />
);
