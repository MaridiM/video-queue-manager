import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1050]">
      {/* Backdrop - Game Academy Design System */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-[4px] fade-in"
        style={{ animationDuration: '150ms', animationTimingFunction: 'ease-in-out' }}
        onClick={() => onOpenChange(false)}
      />
      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div 
          ref={dialogRef}
          className="relative bg-[var(--background-paper)] border border-[var(--border-default)] rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.15)] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col scale-in"
          style={{ animationDuration: '300ms', animationTimingFunction: 'ease-out' }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

export function DialogContent({ children, className = '' }: DialogContentProps) {
  return <div className={`p-6 overflow-y-auto max-h-[calc(90vh-150px)] ${className}`}>{children}</div>;
}

interface DialogHeaderProps {
  children: ReactNode;
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-[var(--border-default)]">
      {children}
    </div>
  );
}

interface DialogTitleProps {
  children: ReactNode;
}

export function DialogTitle({ children }: DialogTitleProps) {
  return <h2 className="text-xl font-semibold text-[var(--text-primary)]">{children}</h2>;
}

interface DialogDescriptionProps {
  children: ReactNode;
}

export function DialogDescription({ children }: DialogDescriptionProps) {
  return <p className="text-sm text-[var(--text-secondary)] mt-1">{children}</p>;
}

interface DialogCloseProps {
  onClose: () => void;
}

export function DialogClose({ onClose }: DialogCloseProps) {
  return (
    <button
      onClick={onClose}
      className="absolute right-6 top-6 p-2 rounded-[8px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-hover)] transition-all duration-200 w-8 h-8 flex items-center justify-center"
    >
      <X className="w-5 h-5" />
    </button>
  );
}

interface DialogFooterProps {
  children: ReactNode;
}

export function DialogFooter({ children }: DialogFooterProps) {
  return (
    <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--border-default)] bg-[var(--background-tertiary)]">
      {children}
    </div>
  );
}
