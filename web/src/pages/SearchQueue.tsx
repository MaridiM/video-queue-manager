import { useEffect, useState } from 'react';
import { Search, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { api, type SearchTask } from '../lib/api';

const priorityStyles: Record<string, string> = {
  High: 'bg-rose-100 text-rose-800',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-blue-100 text-blue-800',
};

const statusStyles: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  'In Progress': 'bg-cyan-100 text-cyan-800',
  Completed: 'bg-emerald-100 text-emerald-800',
  Blocked: 'bg-rose-100 text-rose-800',
};

export function SearchQueue() {
  const [data, setData] = useState<SearchTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getSearchQueue();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const assignees = [...new Set(data.map((t) => t.Assignee).filter(Boolean))];
  const statuses = [...new Set(data.map((t) => t.Status).filter(Boolean))];

  const filteredData = data.filter((task) => {
    if (filterAssignee && task.Assignee !== filterAssignee) return false;
    if (filterStatus && task.Status !== filterStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.Topic?.toLowerCase().includes(query) ||
        task.Notes?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const resetFilters = () => {
    setFilterAssignee('');
    setFilterStatus('');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-xl font-semibold mb-2">Error Loading Data</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Search Queue</h1>
          <p className="text-muted-foreground mt-1">00_SEARCH_QUEUE - Active search assignments</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl p-5 text-white">
          <p className="text-white/80 text-sm">Total Tasks</p>
          <p className="text-3xl font-bold">{data.length}</p>
        </div>
        <div className="bg-gradient-to-br from-[#f093fb] to-[#f5576c] rounded-xl p-5 text-white">
          <p className="text-white/80 text-sm">High Priority</p>
          <p className="text-3xl font-bold">{data.filter((t) => t.Priority === 'High').length}</p>
        </div>
        <div className="bg-gradient-to-br from-[#4facfe] to-[#00f2fe] rounded-xl p-5 text-white">
          <p className="text-white/80 text-sm">Pending</p>
          <p className="text-3xl font-bold">{data.filter((t) => t.Status === 'Pending').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">Assignee:</label>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All</option>
              {assignees.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-muted-foreground">Search:</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {filteredData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Task ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assignee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.map((task, idx) => (
                  <tr key={task.Task_ID || idx} className="hover:bg-muted/30 transition">
                    <td className="px-6 py-4 text-sm font-medium">{task.Task_ID}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${task.Priority === 'High' ? 'text-rose-400' : ''}`}>
                        {task.Topic}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{task.Assignee}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityStyles[task.Priority] || 'bg-gray-100 text-gray-800'}`}>
                        {task.Priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[task.Status] || 'bg-gray-100 text-gray-800'}`}>
                        {task.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{task.Due_Date}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">{task.Notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

