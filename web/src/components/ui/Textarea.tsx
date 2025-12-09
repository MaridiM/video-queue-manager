import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[120px] w-full rounded-[8px] border bg-[var(--background-paper)] px-4 py-3 text-base text-[var(--text-primary)]',
          'placeholder:text-[var(--text-secondary)] placeholder:opacity-100',
          'transition-all duration-300 ease-in-out resize-vertical',
          'hover:border-[var(--border-hover)]',
          'focus:outline-none focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]',
          'disabled:cursor-not-allowed disabled:bg-[var(--background-disabled)] disabled:text-[var(--text-disabled)] disabled:border-[var(--border-disabled)]',
          'leading-6',
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

Textarea.displayName = 'Textarea';
