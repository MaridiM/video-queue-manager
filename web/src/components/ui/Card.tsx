import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div 
      className={`rounded-[12px] border border-[var(--border-default)] bg-[var(--background-paper)] text-[var(--text-primary)] shadow-[0_2px_8px_rgba(0,0,0,0.10)] transition-all duration-300 ease-in-out hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-[2px] ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }: CardProps) {
  return (
    <h3 className={`font-semibold leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

