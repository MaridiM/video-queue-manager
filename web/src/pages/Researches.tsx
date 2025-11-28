import { useEffect, useState } from 'react';
import { FileText, Search, AlertCircle, Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { api, type Research } from '../lib/api';

const statusStyles: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-800',
  active: 'bg-emerald-100 text-emerald-800',
  Inactive: 'bg-slate-200 text-slate-700',
  inactive: 'bg-slate-200 text-slate-700',
  Pending: 'bg-amber-100 text-amber-800',
  pending: 'bg-amber-100 text-amber-800',
  Completed: 'bg-blue-100 text-blue-800',
  completed: 'bg-blue-100 text-blue-800',
};

export function Researches() {
  const [data, setData] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFileExists, setFilterFileExists] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getResearches();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const departments = [...new Set(data.map((r) => r.Department).filter(Boolean))];
  const statuses = [...new Set(data.map((r) => r.Status).filter(Boolean))];

  const filteredData = data.filter((research) => {
    if (filterDepartment && research.Department !== filterDepartment) return false;
    if (filterStatus && research.Status !== filterStatus) return false;
    if (filterFileExists === 'exists' && !research.fileExists) return false;
    if (filterFileExists === 'missing' && research.fileExists) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        research.Name?.toLowerCase().includes(query) ||
        research.Description?.toLowerCase().includes(query) ||
        research.RSR_ID?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const resetFilters = () => {
    setFilterDepartment('');
    setFilterStatus('');
    setFilterFileExists('');
    setSearchQuery('');
  };

  const totalCount = data.length;
  const activeCount = data.filter((r) => r.Status === 'Active' || r.Status === 'active').length;
  const filesExist = data.filter((r) => r.fileExists).length;
  const filesMissing = data.filter((r) => !r.fileExists).length;

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
          <h1 className="text-3xl font-bold">Researches Status</h1>
          <p className="text-muted-foreground mt-1">RESEARCHES_Master_List - All research entities</p>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl p-5 text-white">
          <p className="text-white/80 text-sm">Total Researches</p>
          <p className="text-3xl font-bold">{totalCount}</p>
        </div>
        <div className="bg-gradient-to-br from-[#43e97b] to-[#38f9d7] rounded-xl p-5 text-white">
          <p className="text-white/80 text-sm">Active</p>
          <p className="text-3xl font-bold">{activeCount}</p>
        </div>
        <div className="bg-gradient-to-br from-[#4facfe] to-[#00f2fe] rounded-xl p-5 text-white">
          <p className="text-white/80 text-sm">Files Exist</p>
          <p className="text-3xl font-bold">{filesExist}</p>
        </div>
        <div className="bg-gradient-to-br from-[#f093fb] to-[#f5576c] rounded-xl p-5 text-white">
          <p className="text-white/80 text-sm">Files Missing</p>
          <p className="text-3xl font-bold">{filesMissing}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">Department:</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
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

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">File Integrity:</label>
            <select
              value={filterFileExists}
              onChange={(e) => setFilterFileExists(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All</option>
              <option value="exists">Exists ✅</option>
              <option value="missing">Missing ❌</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-muted-foreground">Search:</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search RSR ID, name, description..."
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
                  <th className="px-4 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">RSR ID</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.map((research, idx) => (
                  <tr key={research.RSR_ID || idx} className="hover:bg-muted/30 transition">
                    <td className="px-4 py-4 text-sm font-mono font-semibold text-primary">{research.RSR_ID}</td>
                    <td className="px-4 py-4 text-sm font-semibold">{research.Name}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground max-w-xs truncate">{research.Description}</td>
                    <td className="px-4 py-4 text-sm">{research.Department}</td>
                    <td className="px-4 py-4 text-sm">{research.Category}</td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[research.Status] || 'bg-gray-100 text-gray-800'}`}>
                        {research.Status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {research.fileExists ? (
                        <span className="flex items-center gap-1 text-emerald-500">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-xs">Exists</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-500">
                          <XCircle className="w-5 h-5" />
                          <span className="text-xs">Missing</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No researches found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

