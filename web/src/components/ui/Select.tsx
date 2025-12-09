import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-[8px] border bg-[var(--background-paper)] px-4 py-2 text-base text-[var(--text-primary)]',
          'transition-all duration-300 ease-in-out appearance-none cursor-pointer',
          'hover:border-[var(--border-hover)]',
          'focus:outline-none focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]',
          'disabled:cursor-not-allowed disabled:bg-[var(--background-disabled)] disabled:text-[var(--text-disabled)] disabled:border-[var(--border-disabled)]',
          'bg-[url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23718096\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")]',
          'bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10',
          error 
            ? 'border-[var(--border-error)] focus:border-[var(--border-error)] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]' 
            : 'border-[var(--border-default)]',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';
