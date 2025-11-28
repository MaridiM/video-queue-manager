import { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Video
} from 'lucide-react';
import type { SearchQuery, SearchFormData, SearchStatus, Department } from '../lib/types';
import { MOCK_SEARCHES, DEPARTMENTS, SEARCH_STATUS_OPTIONS } from '../lib/constants';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';

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
  onCancel 
}: { 
  initialData?: SearchQuery | null;
  onSubmit: (data: SearchFormData) => void;
  onCancel: () => void;
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
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialData ? 'Update Search' : 'Add Search'}</Button>
      </div>
    </form>
  );
}

export function SearchQueueTable() {
  const [data, setData] = useState<SearchQuery[]>(MOCK_SEARCHES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SearchQuery | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [searchToDelete, setSearchToDelete] = useState<string | null>(null);

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

  const handleAdd = (formData: SearchFormData) => {
    // Generate SEARCH-XXX ID like Python script
    const maxId = data.reduce((max, item) => {
      const match = item.search_id.match(/SEARCH-(\d+)/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    const newId = `SEARCH-${String(maxId + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newSearch: SearchQuery = {
      search_id: newId,
      employee: formData.employee,
      department: formData.department,
      topic: formData.topic,
      search_query: formData.search_query,
      status: 'Assigned',
      videos_found: 0,
      date_assigned: now.split('T')[0],
      date_completed: null,
      notes: formData.notes || '',
      perplexity_creativity: 0.5,
      perplexity_structure_mode: true,
      results_count: 0,
      error_message: null,
      created_at: now,
      updated_at: now,
    };
    setData([newSearch, ...data]);
    setIsFormOpen(false);
  };

  const handleEdit = (formData: SearchFormData) => {
    if (!editingSearch) return;
    setData(data.map(item => 
      item.search_id === editingSearch.search_id 
        ? { 
            ...item, 
            employee: formData.employee,
            department: formData.department,
            topic: formData.topic,
            search_query: formData.search_query,
            notes: formData.notes || '',
            updated_at: new Date().toISOString(),
          } 
        : item
    ));
    setEditingSearch(null);
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (searchToDelete) {
      setData(data.filter(item => item.search_id !== searchToDelete));
      setSearchToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  const openEdit = (search: SearchQuery) => {
    setEditingSearch(search);
    setIsFormOpen(true);
  };

  const openDelete = (id: string) => {
    setSearchToDelete(id);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-4">
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
          </div>

          <Button onClick={() => { setEditingSearch(null); setIsFormOpen(true); }} className="whitespace-nowrap">
            <Plus size={18} className="mr-1" />
            New Search
          </Button>
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
                    {new Date(search.date_assigned).toLocaleDateString('ru-RU')}
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
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/30 text-xs text-gray-500">
          Showing {filteredData.length} of {data.length} searches
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingSearch ? "Edit Search Query" : "Add New Search Query"}
      >
        <SearchForm 
          initialData={editingSearch}
          onSubmit={editingSearch ? handleEdit : handleAdd}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Search Query"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this search query? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
