import type { VideoStatus, Priority } from '../../lib/types';

interface StatusBadgeProps {
  status: VideoStatus | string;
}

const statusStyles: Record<string, string> = {
  Pending: 'bg-gray-100 text-gray-700 border-gray-200',
  pending: 'bg-gray-100 text-gray-700 border-gray-200',
  Selected: 'bg-blue-100 text-blue-700 border-blue-200',
  selected: 'bg-blue-100 text-blue-700 border-blue-200',
  Parsing: 'bg-slate-100 text-slate-700 border-slate-200',
  parsing: 'bg-slate-100 text-slate-700 border-slate-200',
  Parsed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  parsed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Transcribing: 'bg-purple-100 text-purple-700 border-purple-200',
  transcribing: 'bg-purple-100 text-purple-700 border-purple-200',
  Transcribed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  transcribed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Processing: 'bg-orange-100 text-orange-700 border-orange-200',
  processing: 'bg-orange-100 text-orange-700 border-orange-200',
  Integration: 'bg-sky-100 text-sky-700 border-sky-200',
  integration: 'bg-sky-100 text-sky-700 border-sky-200',
  Complete: 'bg-green-100 text-green-700 border-green-200',
  complete: 'bg-green-100 text-green-700 border-green-200',
  Rejected: 'bg-red-100 text-red-700 border-red-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {displayStatus}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: Priority | string;
  score?: number;
}

const priorityStyles: Record<string, string> = {
  high: 'text-red-600 font-bold',
  medium: 'text-yellow-600 font-medium',
  low: 'text-gray-500',
};

export function PriorityBadge({ priority, score }: PriorityBadgeProps) {
  const style = priorityStyles[priority] || 'text-gray-500';
  if (score !== undefined) {
    return (
      <span className={`text-xs uppercase tracking-wider ${style}`}>
        {score}/100
      </span>
    );
  }
  return (
    <span className={`text-xs uppercase tracking-wider ${style}`}>
      {priority}
    </span>
  );
}

interface DepartmentBadgeProps {
  department: string;
}

const departmentStyles: Record<string, string> = {
  DEV: 'bg-blue-100 text-blue-700 border-blue-200',
  SMM: 'bg-pink-100 text-pink-700 border-pink-200',
  VID: 'bg-red-100 text-red-700 border-red-200',
  AID: 'bg-purple-100 text-purple-700 border-purple-200',
  DGN: 'bg-teal-100 text-teal-700 border-teal-200',
  MKT: 'bg-amber-100 text-amber-700 border-amber-200',
};

export function DepartmentBadge({ department }: DepartmentBadgeProps) {
  const style = departmentStyles[department] || 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold border ${style}`}>
      {department}
    </span>
  );
}
