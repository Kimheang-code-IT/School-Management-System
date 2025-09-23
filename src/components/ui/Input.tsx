import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-slate-800/60 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 shadow-sm transition focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';
