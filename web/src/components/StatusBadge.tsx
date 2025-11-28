import type { Status, Priority } from '../lib/types';

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<Status, string> = {
    pending: "bg-gray-100 text-gray-700 border-gray-200",
    selected: "bg-blue-100 text-blue-700 border-blue-200",
    transcribing: "bg-purple-100 text-purple-700 border-purple-200",
    transcribed: "bg-indigo-100 text-indigo-700 border-indigo-200",
    processing: "bg-orange-100 text-orange-700 border-orange-200",
    complete: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const styles = {
    low: "text-gray-500",
    medium: "text-yellow-600 font-medium",
    high: "text-red-600 font-bold",
  };
  
  return (
    <span className={`text-xs uppercase tracking-wider ${styles[priority]}`}>
      {priority}
    </span>
  );
}

