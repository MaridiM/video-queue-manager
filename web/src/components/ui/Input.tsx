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
          'flex h-10 w-full rounded-[8px] border bg-[var(--background-paper)] px-4 py-2 text-base text-[var(--text-primary)]',
          'placeholder:text-[var(--text-secondary)] placeholder:opacity-100',
          'transition-all duration-300 ease-in-out',
          'hover:border-[var(--border-hover)]',
          'focus:outline-none focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]',
          'disabled:cursor-not-allowed disabled:bg-[var(--background-disabled)] disabled:text-[var(--text-disabled)] disabled:border-[var(--border-disabled)]',
          error 
            ? 'border-[var(--border-error)] focus:border-[var(--border-error)] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]' 
            : 'border-[var(--border-default)]',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
