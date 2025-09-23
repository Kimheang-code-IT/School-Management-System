import type { HTMLAttributes, TableHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/utils/cn';

export const Table = forwardRef<HTMLTableElement, TableHTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-x-auto">
      <table
        ref={ref}
        className={cn('w-full min-w-[600px] divide-y divide-slate-800/80 text-sm', className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = 'Table';

export const TableHeader = ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn('bg-slate-900/60', className)} {...props} />
);

export const TableRow = ({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn('divide-x divide-slate-800/60 transition hover:bg-slate-800/40', className)} {...props} />
);

export const TableHead = ({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400', className)}
    {...props}
  />
);

export const TableBody = ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn('divide-y divide-slate-800/60', className)} {...props} />
);

export const TableCell = ({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('whitespace-nowrap px-4 py-3 text-slate-200', className)} {...props} />
);
