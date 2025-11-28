import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  className?: string;
}

export function Checkbox({ 
  checked, 
  onCheckedChange, 
  id,
  className = ''
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      id={id}
      onClick={() => onCheckedChange(!checked)}
      className={`h-4 w-4 shrink-0 rounded-sm border ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center transition-colors ${
        checked ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 hover:border-gray-400'
      } ${className}`}
    >
      {checked && <Check className="h-3 w-3" />}
    </button>
  );
}

