import type { HTMLAttributes, ReactNode } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  children: ReactNode;
}

export function Badge({ 
  children, 
  variant = 'default', 
  className = '', 
  ...props 
}: BadgeProps) {
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    outline: "text-slate-700 border border-slate-200 hover:bg-slate-50",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <span 
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </span>
  );
}

