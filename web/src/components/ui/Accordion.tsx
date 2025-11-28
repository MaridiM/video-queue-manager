import { useState, createContext, useContext, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

const AccordionContext = createContext<{
  openItems: string[];
  toggleItem: (value: string) => void;
} | null>(null);

interface AccordionProps {
  type?: 'single' | 'multiple';
  defaultValue?: string[];
  children: ReactNode;
  className?: string;
}

export function Accordion({ 
  type = 'single', 
  defaultValue = [], 
  children, 
  className = '' 
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultValue);

  const toggleItem = (value: string) => {
    setOpenItems(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return type === 'single' ? [value] : [...prev, value];
      }
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

const AccordionItemContext = createContext<string>("");

export function AccordionItem({ 
  value, 
  children, 
  className = '' 
}: { 
  value: string; 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <AccordionItemContext.Provider value={value}>
      <div className={`border-b border-gray-200 ${className}`}>{children}</div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  const value = useContext(AccordionItemContext);
  const context = useContext(AccordionContext);
  
  if (!context) throw new Error("AccordionTrigger must be used within Accordion");
  
  const isOpen = context.openItems.includes(value);

  return (
    <button
      onClick={() => context.toggleItem(value)}
      className={`flex flex-1 items-center justify-between w-full py-4 font-medium transition-all hover:text-blue-600 text-left ${className}`}
      aria-expanded={isOpen}
    >
      <span className="flex items-center flex-1">{children}</span>
      <ChevronDown 
        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
      />
    </button>
  );
}

export function AccordionContent({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  const value = useContext(AccordionItemContext);
  const context = useContext(AccordionContext);
  
  if (!context) throw new Error("AccordionContent must be used within Accordion");
  
  const isOpen = context.openItems.includes(value);

  if (!isOpen) return null;

  return (
    <div className={`overflow-hidden text-sm animate-in fade-in ${className}`}>
      <div className="pb-4 pt-0">{children}</div>
    </div>
  );
}

