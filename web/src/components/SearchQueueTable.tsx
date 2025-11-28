import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Video,
  RefreshCw,
  Download,
  CloudDownload,
  FolderSync,
  FileSpreadsheet,
  ArrowRight,
  Database,
  Sparkles
} from 'lucide-react';
import type { SearchQuery, SearchFormData, SearchStatus, Department } from '../lib/types';
import { searchQueueAPI, type SearchQueueAPI, type SyncCSVResult } from '../lib/api';
import { DEPARTMENTS, SEARCH_STATUS_OPTIONS } from '../lib/constants';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';

// Transform API response to frontend type
function transformAPIToFrontend(item: SearchQueueAPI): SearchQuery {
  return {
    search_id: item.search_id,
    employee: item.employee,
    department: item.department as Department,
    topic: item.topic,
    search_query: item.search_query,
    status: item.status as SearchStatus,
    videos_found: item.videos_found,
    date_assigned: item.date_assigned,
    date_completed: item.date_completed,
    notes: item.notes,
    perplexity_creativity: item.perplexity_creativity,
    perplexity_structure_mode: item.perplexity_structure_mode,
    results_count: item.results_count,
    error_message: item.error_message,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

// Status badge using SQL status values
function getStatusBadge(status: SearchStatus) {
  const styles: Record<SearchStatus, { className: string; icon: React.ReactNode; label: string }> = {
    'Assigned': { 
      className: 'bg-gray-100 text-gray-700 border-gray-200', 
      icon: <Clock size={12} className="mr-1" />,
      label: 'Assigned'
    },
    'In Progress': { 
      className: 'bg-blue-100 text-blue-700 border-blue-200', 
      icon: <Loader2 size={12} className="mr-1 animate-spin" />,
      label: 'In Progress'
    },
    'Completed': { 
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200', 
      icon: <CheckCircle size={12} className="mr-1" />,
      label: 'Completed'
    },
  };

  const style = styles[status] || styles['Assigned'];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${style.className}`}>
      {style.icon}
      {style.label}
    </span>
  );
}

function SearchForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  isLoading 
}: { 
  initialData?: SearchQuery | null;
  onSubmit: (data: SearchFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const [formData, setFormData] = useState<SearchFormData>({
    employee: initialData?.employee || '',
    department: initialData?.department || 'DEV',
    topic: initialData?.topic || '',
    search_query: initialData?.search_query || '',
    notes: initialData?.notes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.employee || formData.employee.trim().length < 2) {
      newErrors.employee = 'Employee name is required';
    }
    if (!formData.topic || formData.topic.trim().length < 3) {
      newErrors.topic = 'Topic is required (min 3 characters)';
    }
    if (!formData.search_query || formData.search_query.trim().length < 5) {
      newErrors.search_query = 'Search query is required (min 5 characters)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const inputClass = "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Employee - Required */}
      <div>
        <label className="text-sm font-medium mb-2 block text-gray-700">
          Employee <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className={`${inputClass} ${errors.employee ? 'border-red-500' : ''}`}
          placeholder="e.g., John Doe or john@remotehelpers.com"
          value={formData.employee}
          onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
          disabled={isLoading}
        />
        {errors.employee && <p className="text-red-500 text-xs mt-1">{errors.employee}</p>}
      </div>

      {/* Department - Required */}
      <div>
        <label className="text-sm font-medium mb-2 block text-gray-700">
          Department <span className="text-red-500">*</span>
        </label>
        <select
          className={inputClass}
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
          disabled={isLoading}
        >
          {DEPARTMENTS.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Topic - Required */}
      <div>
        <label className="text-sm font-medium mb-2 block text-gray-700">
          Topic <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className={`${inputClass} ${errors.topic ? 'border-red-500' : ''}`}
          placeholder="e.g., AI Automation, Video Editing, Social Media"
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          disabled={isLoading}
        />
        {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic}</p>}
      </div>

      {/* Search Query - Required */}
      <div>
        <label className="text-sm font-medium mb-2 block text-gray-700">
          Search Query <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`${inputClass} min-h-[80px] ${errors.search_query ? 'border-red-500' : ''}`}
          placeholder="e.g., Claude Desktop MCP setup tutorial 2024"
          value={formData.search_query}
          onChange={(e) => setFormData({ ...formData, search_query: e.target.value })}
          disabled={isLoading}
        />
        {errors.search_query && <p className="text-red-500 text-xs mt-1">{errors.search_query}</p>}
        <p className="text-gray-400 text-xs mt-1">Specific search terms for Perplexity AI</p>
      </div>

      {/* Notes - Optional */}
      <div>
        <label className="text-sm font-medium mb-2 block text-gray-700">Notes</label>
        <textarea
          className={`${inputClass} min-h-[60px]`}
          placeholder="e.g., Focus on recent videos, Avoid tutorials older than 2023"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? 'Update Search' : 'Add Search'
          )}
        </Button>
      </div>
    </form>
  );
}

export function SearchQueueTable() {
  const [data, setData] = useState<SearchQuery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SearchQuery | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [searchToDelete, setSearchToDelete] = useState<string | null>(null);
  
  // Sync from CSV state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncCSVResult | null>(null);
  const [showSyncResult, setShowSyncResult] = useState(false);

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    const result = await searchQueueAPI.getAll();
    
    if (result.success && result.data) {
      setData(result.data.map(transformAPIToFrontend));
    } else {
      setError(result.error || 'Failed to load data');
    }
    
    setIsLoading(false);
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        item.search_query.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.topic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesDept = departmentFilter === 'all' || item.department === departmentFilter;
      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [data, searchTerm, statusFilter, departmentFilter]);

  // Stats using SQL status values
  const stats = useMemo(() => ({
    total: data.length,
    assigned: data.filter(s => s.status === 'Assigned').length,
    inProgress: data.filter(s => s.status === 'In Progress').length,
    completed: data.filter(s => s.status === 'Completed').length,
  }), [data]);

  const handleAdd = async (formData: SearchFormData) => {
    setIsSaving(true);
    
    const result = await searchQueueAPI.create({
      employee: formData.employee,
      department: formData.department,
      topic: formData.topic,
      search_query: formData.search_query,
      notes: formData.notes,
    });
    
    if (result.success) {
      await fetchData(); // Refresh data
      setIsFormOpen(false);
    } else {
      setError(result.error || 'Failed to create');
    }
    
    setIsSaving(false);
  };

  const handleEdit = async (formData: SearchFormData) => {
    if (!editingSearch) return;
    setIsSaving(true);
    
    const result = await searchQueueAPI.update(editingSearch.search_id, {
      employee: formData.employee,
      department: formData.department,
      topic: formData.topic,
      search_query: formData.search_query,
      notes: formData.notes,
    });
    
    if (result.success) {
      await fetchData(); // Refresh data
      setEditingSearch(null);
      setIsFormOpen(false);
    } else {
      setError(result.error || 'Failed to update');
    }
    
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!searchToDelete) return;
    setIsSaving(true);
    
    const result = await searchQueueAPI.delete(searchToDelete);
    
    if (result.success) {
      await fetchData(); // Refresh data
      setSearchToDelete(null);
      setIsDeleteOpen(false);
    } else {
      setError(result.error || 'Failed to delete');
    }
    
    setIsSaving(false);
  };

  const openEdit = (search: SearchQuery) => {
    setEditingSearch(search);
    setIsFormOpen(true);
  };

  const openDelete = (id: string) => {
    setSearchToDelete(id);
    setIsDeleteOpen(true);
  };

  // Sync from CSV (Dropbox)
  const handleSyncFromCSV = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    setError(null);
    
    const result = await searchQueueAPI.syncFromCSV();
    
    if (result.success && result.data) {
      setSyncResult(result.data);
      setShowSyncResult(true);
      await fetchData(); // Refresh data
    } else {
      setError(result.error || 'Failed to sync from CSV');
    }
    
    setIsSyncing(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading search queue...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && data.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-2">Failed to load data</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <Button onClick={fetchData}>
            <RefreshCw size={16} className="mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            ×
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-xl font-bold text-gray-600">{stats.assigned}</div>
          <div className="text-xs text-gray-500">Assigned</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-xs text-gray-500">In Progress</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-xl font-bold text-emerald-600">{stats.completed}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by topic or query..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {/* Status Filter */}
            <select
              className="flex-1 sm:flex-none h-10 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              {SEARCH_STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Department Filter */}
            <select
              className="flex-1 sm:flex-none h-10 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">All Depts</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Refresh button */}
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </Button>
          </div>

          <div className="flex gap-2">
            {/* Sync from Dropbox button */}
            <Button 
              variant="outline" 
              onClick={handleSyncFromCSV} 
              disabled={isSyncing}
              className="whitespace-nowrap"
              title="Import from Search_Queue_Master.csv in Dropbox"
            >
              {isSyncing ? (
                <>
                  <Loader2 size={16} className="mr-1 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <CloudDownload size={16} className="mr-1" />
                  Sync from Dropbox
                </>
              )}
            </Button>

            <Button onClick={() => { setEditingSearch(null); setIsFormOpen(true); }} className="whitespace-nowrap">
              <Plus size={18} className="mr-1" />
              New Search
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm text-left table-fixed">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium w-[32%]">Topic / Query</th>
              <th className="px-4 py-3 font-medium w-[8%] hidden sm:table-cell">Dept</th>
              <th className="px-4 py-3 font-medium w-[12%]">Status</th>
              <th className="px-4 py-3 font-medium w-[10%] hidden md:table-cell">Employee</th>
              <th className="px-4 py-3 font-medium w-[8%] text-center hidden lg:table-cell">Videos</th>
              <th className="px-4 py-3 font-medium w-[10%] hidden lg:table-cell">Notes</th>
              <th className="px-4 py-3 font-medium w-[10%] hidden md:table-cell">Assigned</th>
              <th className="px-4 py-3 font-medium w-[10%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.length > 0 ? (
              filteredData.map((search) => (
                <tr key={search.search_id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      {/* Topic as main title */}
                      <div className="font-medium text-gray-900 truncate text-sm" title={search.topic}>
                        {search.topic || <span className="text-gray-400 italic">No topic</span>}
                      </div>
                      {/* Search query as subtitle */}
                      {search.search_query && (
                        <div className="text-xs text-gray-500 mt-0.5 truncate" title={search.search_query}>
                          {search.search_query}
                        </div>
                      )}
                      {/* Error message if any */}
                      {search.error_message && (
                        <div className="text-xs text-red-500 mt-0.5 flex items-center gap-1 truncate">
                          <AlertCircle size={10} className="shrink-0" />
                          <span className="truncate">{search.error_message}</span>
                        </div>
                      )}
                      {/* Mobile-only info */}
                      <div className="flex items-center gap-2 mt-1 sm:hidden">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{search.department}</Badge>
                        <span className="text-xs text-gray-400">{search.videos_found} videos</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge variant="outline" className="text-xs">{search.department}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(search.status)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                    {search.employee ? (
                      <span className="text-xs truncate block" title={search.employee}>
                        {search.employee.includes('@') ? search.employee.split('@')[0] : search.employee}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <span className="flex items-center justify-center gap-1 text-gray-700">
                      <Video size={12} className="text-gray-400" />
                      {search.videos_found}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                    {search.notes ? (
                      <span className="text-xs truncate block" title={search.notes}>{search.notes}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                    {search.date_assigned ? new Date(search.date_assigned).toLocaleDateString('ru-RU') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => openEdit(search)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button 
                        onClick={() => openDelete(search.search_id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Search size={32} className="text-gray-300" />
                    <p>No searches found matching your filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/30 text-xs text-gray-500 flex justify-between items-center">
          <span>Showing {filteredData.length} of {data.length} searches</span>
          <span className="text-emerald-600 flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Live from database
          </span>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => !isSaving && setIsFormOpen(false)}
        title={editingSearch ? "Edit Search Query" : "Add New Search Query"}
      >
        <SearchForm 
          initialData={editingSearch}
          onSubmit={editingSearch ? handleEdit : handleAdd}
          onCancel={() => setIsFormOpen(false)}
          isLoading={isSaving}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => !isSaving && setIsDeleteOpen(false)}
        title="Delete Search Query"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this search query? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Sync Result Dialog */}
      <Modal
        isOpen={showSyncResult}
        onClose={() => setShowSyncResult(false)}
        title=""
      >
        <div className="space-y-5">
          {syncResult && (
            <>
              {/* Header with animation */}
              <div className="text-center pb-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-200 mb-3">
                  <Sparkles size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Sync Complete!</h3>
                <p className="text-sm text-gray-500 mt-1">Data successfully synchronized</p>
              </div>

              {/* Visual Flow: CSV → Database */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center justify-center gap-3">
                  {/* Source */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-xl bg-white shadow-md flex items-center justify-center border-2 border-blue-200">
                      <FileSpreadsheet size={28} className="text-blue-500" />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1.5 font-medium">CSV File</span>
                  </div>
                  
                  {/* Arrow Road */}
                  <div className="flex-1 flex items-center justify-center px-2">
                    <div className="relative w-full">
                      <div className="h-1.5 bg-gradient-to-r from-blue-300 via-indigo-400 to-emerald-400 rounded-full" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex gap-1">
                          <ArrowRight size={16} className="text-indigo-500 animate-pulse" />
                          <ArrowRight size={16} className="text-indigo-400 animate-pulse" style={{ animationDelay: '0.1s' }} />
                          <ArrowRight size={16} className="text-emerald-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Destination */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-xl bg-white shadow-md flex items-center justify-center border-2 border-emerald-200">
                      <Database size={28} className="text-emerald-500" />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1.5 font-medium">Database</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-lg">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
                  <div className="text-3xl font-bold">{syncResult.imported}</div>
                  <div className="text-xs text-emerald-100 font-medium">New Records</div>
                  <Plus size={14} className="absolute bottom-2 right-2 text-emerald-200" />
                </div>
                
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white shadow-lg">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
                  <div className="text-3xl font-bold">{syncResult.updated}</div>
                  <div className="text-xs text-blue-100 font-medium">Updated</div>
                  <RefreshCw size={14} className="absolute bottom-2 right-2 text-blue-200" />
                </div>
                
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 p-4 text-white shadow-lg">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
                  <div className="text-3xl font-bold">{syncResult.skipped}</div>
                  <div className="text-xs text-gray-200 font-medium">Skipped</div>
                </div>
              </div>
              
              {/* Source Path */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-start gap-2">
                  <FolderSync size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-0.5">Source File</div>
                    <div className="text-xs text-gray-600 font-mono truncate" title={syncResult.csvPath}>
                      {syncResult.csvPath.split('\\').slice(-3).join(' / ')}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Errors if any */}
              {syncResult.errors && syncResult.errors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-2">
                    <AlertCircle size={16} />
                    Some records had errors
                  </div>
                  <ul className="text-xs text-amber-600 space-y-1 ml-6">
                    {syncResult.errors.map((err, i) => (
                      <li key={i} className="list-disc">{err.searchId}: {err.error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          
          <div className="flex justify-center pt-1">
            <Button onClick={() => setShowSyncResult(false)} className="px-8">
              <CheckCircle size={16} className="mr-2" />
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
