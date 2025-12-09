import type { VideoStatus, Priority } from '../../lib/types';

interface StatusBadgeProps {
  status: VideoStatus | string;
}

// Game Academy Design System Status Badge Styles
const statusStyles: Record<string, string> = {
  Pending: 'bg-[var(--secondary-100)] text-[var(--secondary-600)] border-[var(--border-default)]',
  pending: 'bg-[var(--secondary-100)] text-[var(--secondary-600)] border-[var(--border-default)]',
  Selected: 'bg-[var(--primary-100)] text-[var(--primary-600)] border-[var(--primary-400)]',
  selected: 'bg-[var(--primary-100)] text-[var(--primary-600)] border-[var(--primary-400)]',
  Parsing: 'bg-[var(--secondary-100)] text-[var(--secondary-700)] border-[var(--border-default)]',
  parsing: 'bg-[var(--secondary-100)] text-[var(--secondary-700)] border-[var(--border-default)]',
  Parsed: 'bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]',
  parsed: 'bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]',
  Transcribing: 'bg-[rgba(109,40,217,0.15)] text-[#6D28D9] border-[#6D28D9]',
  transcribing: 'bg-[rgba(109,40,217,0.15)] text-[#6D28D9] border-[#6D28D9]',
  Transcribed: 'bg-[var(--info-light)] text-[var(--info)] border-[var(--info)]',
  transcribed: 'bg-[var(--info-light)] text-[var(--info)] border-[var(--info)]',
  Processing: 'bg-[var(--warning-light)] text-[var(--warning)] border-[var(--warning)]',
  processing: 'bg-[var(--warning-light)] text-[var(--warning)] border-[var(--warning)]',
  Integration: 'bg-[var(--info-light)] text-[var(--info)] border-[var(--info)]',
  integration: 'bg-[var(--info-light)] text-[var(--info)] border-[var(--info)]',
  Complete: 'bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]',
  complete: 'bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]',
  Rejected: 'bg-[var(--error-light)] text-[var(--error)] border-[var(--error)]',
  rejected: 'bg-[var(--error-light)] text-[var(--error)] border-[var(--error)]',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] || 'bg-[var(--secondary-100)] text-[var(--secondary-600)] border-[var(--border-default)]';
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  return (
    <span className={`inline-flex items-center gap-[4px] px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${style}`}>
      {displayStatus}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: Priority | string;
  score?: number;
}

// Game Academy Design System Priority Badge Styles
const priorityStyles: Record<string, { bg: string; text: string; border: string }> = {
  high: {
    bg: 'rgba(234, 88, 12, 0.15)',
    text: '#ea580c',
    border: '#ea580c',
  },
  medium: {
    bg: 'rgba(245, 158, 11, 0.15)',
    text: '#f59e0b',
    border: '#f59e0b',
  },
  low: {
    bg: 'rgba(132, 204, 22, 0.15)',
    text: '#84cc16',
    border: '#84cc16',
  },
};

export function PriorityBadge({ priority, score }: PriorityBadgeProps) {
  const style = priorityStyles[priority] || {
    bg: 'rgba(132, 204, 22, 0.15)',
    text: '#84cc16',
    border: '#84cc16',
  };
  
  // Determine priority level based on score if provided
  let displayPriority = priority;
  if (score !== undefined) {
    if (score >= 80) displayPriority = 'critical';
    else if (score >= 60) displayPriority = 'high';
    else if (score >= 40) displayPriority = 'medium';
    else if (score >= 20) displayPriority = 'low';
    else displayPriority = 'veryLow';
    
    const scoreStyle = priorityStyles[displayPriority] || style;
    return (
      <span 
        className="inline-flex items-center gap-[4px] px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200"
        style={{
          backgroundColor: scoreStyle.bg,
          color: scoreStyle.text,
          borderColor: scoreStyle.border,
        }}
      >
        {score}/100
      </span>
    );
  }
  
  return (
    <span 
      className="inline-flex items-center gap-[4px] px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
      }}
    >
      {priority}
    </span>
  );
}

interface DepartmentBadgeProps {
  department: string;
}

// Game Academy Design System Department Badge Styles
const departmentStyles: Record<string, { bg: string; text: string; border: string }> = {
  DEV: {
    bg: 'rgba(20, 120, 87, 0.15)',
    text: '#147857',
    border: '#147857',
  },
  SMM: {
    bg: 'rgba(75, 85, 99, 0.15)',
    text: '#4B5563',
    border: '#4B5563',
  },
  VID: {
    bg: 'rgba(249, 115, 22, 0.15)',
    text: '#F97316',
    border: '#F97316',
  },
  AID: {
    bg: 'rgba(75, 85, 99, 0.15)',
    text: '#4B5563',
    border: '#4B5563',
  },
  DGN: {
    bg: 'rgba(109, 40, 217, 0.15)',
    text: '#6D28D9',
    border: '#6D28D9',
  },
  MKT: {
    bg: 'rgba(236, 72, 153, 0.15)',
    text: '#EC4899',
    border: '#EC4899',
  },
};

export function DepartmentBadge({ department }: DepartmentBadgeProps) {
  const style = departmentStyles[department] || {
    bg: 'rgba(75, 85, 99, 0.15)',
    text: '#4B5563',
    border: '#4B5563',
  };
  return (
    <span 
      className="inline-flex items-center gap-[4px] px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
      }}
    >
      {department}
    </span>
  );
}
