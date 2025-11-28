import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900',
          'placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
          'transition-colors',
          error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
