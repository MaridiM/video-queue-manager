import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: ReactNode;
}

// Game Academy Design System Button Styles
const variantStyles = {
  default: 'bg-[var(--primary-default)] text-white hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] shadow-[0_2px_8px_rgba(0,0,0,0.10)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-[1px] active:translate-y-0 active:shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
  destructive: 'bg-[var(--error)] text-white hover:bg-[var(--error-hover)] active:bg-[#B91C1C] shadow-[0_2px_8px_rgba(0,0,0,0.10)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]',
  outline: 'border border-[var(--border-default)] bg-white text-[var(--text-primary)] hover:bg-[var(--background-hover)] hover:border-[var(--border-hover)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.10)] active:bg-[var(--background-hover)] active:shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
  secondary: 'bg-white border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--background-hover)] hover:border-[var(--border-hover)] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.10)]',
  ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--background-hover)] hover:text-[var(--text-primary)] active:bg-[#e2e8f0]',
};

const sizeStyles = {
  sm: 'h-8 px-3 text-xs rounded-[8px] gap-[6px]',
  md: 'h-10 px-4 text-sm rounded-[8px] gap-[8px]',
  lg: 'h-12 px-6 text-base rounded-[8px] gap-[10px]',
  icon: 'h-10 w-10 rounded-[8px] p-0',
};

export function Button({
  variant = 'default',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-[0_0_0_3px_rgba(37,99,235,0.2)] disabled:pointer-events-none disabled:bg-[var(--background-disabled)] disabled:text-[var(--text-disabled)] disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-100',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
