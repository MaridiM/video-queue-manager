import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  ExternalLink,
  Clock,
  Youtube,
  Filter as FilterIcon,
  Loader2,
  AlertCircle,
  RefreshCw,
  CloudDownload,
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  CheckCircle,
  Database,
  ArrowRight,
  Sparkles,
  FolderSync,
  ChevronDown,
  X
} from 'lucide-react';
import type { VideoQueueItem, VideoFormData, Status, Priority, Department } from '../lib/types';
import { videoQueueAPI, type VideoQueueAPI, type SyncCSVResult } from '../lib/api';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { VideoForm } from './VideoForm';
import { FilterPanel, type FilterState } from './FilterPanel';

// Transform API response to frontend type
function transformAPIToFrontend(item: VideoQueueAPI): VideoQueueItem {
  return {
    id: item.id,
    created_at: item.created_at,
    video_url: item.video_url,
    video_title: item.video_title,
    channel_name: item.channel_name || undefined,
    duration_minutes: item.duration_minutes,
    priority: (item.priority || 'medium') as Priority,
    status: (item.status || 'pending') as Status,
    department: (item.department || 'DEV') as Department,
    assigned_to: item.assigned_to,
    added_by: item.added_by,
    notes: item.notes,
    perplexity_search_id: item.perplexity_search_id || undefined,
  };
}

export function VideoQueueTable() {
  const [data, setData] = useState<VideoQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    department: [],
    priority: []
  });
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoQueueItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  
  // Sync and Export state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncCSVResult | null>(null);
  const [showSyncResult, setShowSyncResult] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    const result = await videoQueueAPI.getAll();
    
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
      const matchesSearch = item.video_title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.channel_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filters.status.length === 0 || filters.status.includes(item.status);
      const matchesDept = filters.department.length === 0 || filters.department.includes(item.department);
      const matchesPriority = filters.priority.length === 0 || filters.priority.includes(item.priority);
      return matchesSearch && matchesStatus && matchesDept && matchesPriority;
    });
  }, [data, searchTerm, filters]);

  const handleAdd = async (formData: VideoFormData) => {
    setIsSaving(true);
    
    const result = await videoQueueAPI.create({
      video_url: formData.video_url,
      video_title: formData.video_title,
      channel_name: formData.channel_name,
      duration_minutes: formData.duration_minutes,
      views: formData.views,
      likes: formData.likes,
      comments: formData.comments,
      publish_date: formData.publish_date,
      priority: formData.priority,
      department: formData.department,
      topic_category: formData.topic_category,
      research_source: formData.research_source,
      added_by: formData.added_by || 'System',
      notes: formData.notes,
    });
    
    if (result.success) {
      await fetchData();
      setIsFormOpen(false);
    } else {
      // Handle duplicate video error
      if (result.error?.includes('already exists')) {
        setError(`⚠️ ${result.error}`);
      } else {
        setError(result.error || 'Failed to create');
      }
    }
    
    setIsSaving(false);
  };

  const handleEdit = async (formData: VideoFormData) => {
    if (!editingVideo) return;
    setIsSaving(true);
    
    const result = await videoQueueAPI.update(editingVideo.id, {
      video_title: formData.video_title,
      video_url: formData.video_url,
      channel_name: formData.channel_name,
      duration_minutes: formData.duration_minutes,
      priority: formData.priority,
      status: formData.status,
      department: formData.department,
      notes: formData.notes,
    });
    
    if (result.success) {
      await fetchData();
      setEditingVideo(null);
      setIsFormOpen(false);
    } else {
      setError(result.error || 'Failed to update');
    }
    
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!videoToDelete) return;
    setIsSaving(true);
    
    const result = await videoQueueAPI.delete(videoToDelete);
    
    if (result.success) {
      await fetchData();
      setVideoToDelete(null);
      setIsDeleteOpen(false);
    } else {
      setError(result.error || 'Failed to delete');
    }
    
    setIsSaving(false);
  };

  const openEdit = (video: VideoQueueItem) => {
    setEditingVideo(video);
    setIsFormOpen(true);
  };

  const openDelete = (id: string) => {
    setVideoToDelete(id);
    setIsDeleteOpen(true);
  };

  // Sync from CSV (Dropbox)
  const handleSyncFromCSV = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    setError(null);
    
    const result = await videoQueueAPI.syncFromCSV();
    
    if (result.success && result.data) {
      setSyncResult(result.data);
      setShowSyncResult(true);
      await fetchData();
    } else {
      setError(result.error || 'Failed to sync from CSV');
    }
    
    setIsSyncing(false);
  };

  // Export handler - direct download without opening new window
  const handleExport = (format: 'csv' | 'json' | 'md') => {
    const url = videoQueueAPI.getExportUrl(format);
    
    // Create invisible link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = ''; // Browser will use filename from Content-Disposition header
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowExportMenu(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading video queue...</p>
        </div>
      </div>
    );
  }

  // Error state with no data
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
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] relative">

      <div className="lg:hidden">
        <Button variant="outline" onClick={() => setShowMobileFilters(!showMobileFilters)} className="w-full">
          <FilterIcon size={16} className="mr-2" />
          {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0 h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm`}>
        <FilterPanel 
          onFilterChange={setFilters} 
          initialFilters={filters}
        />
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm shrink-0">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search videos or channels..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Refresh */}
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </Button>
            
            {/* Export Dropdown */}
            <div className="relative">
              <Button 
                variant="outline" 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="gap-1"
              >
                <Download size={16} />
                Export
                <ChevronDown size={14} />
              </Button>
              {showExportMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowExportMenu(false)} 
                  />
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileSpreadsheet size={16} className="text-emerald-600" />
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileJson size={16} className="text-blue-600" />
                      Export as JSON
                    </button>
                    <button
                      onClick={() => handleExport('md')}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileText size={16} className="text-purple-600" />
                      Export as Markdown
                    </button>
                  </div>
                </>
              )}
            </div>
            
            {/* Sync from Dropbox */}
            <Button 
              variant="outline" 
              onClick={handleSyncFromCSV} 
              disabled={isSyncing}
              title="Import from Video_Queue_Master.csv in Dropbox"
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
            
            {/* Add Video */}
            <Button onClick={() => { setEditingVideo(null); setIsFormOpen(true); }}>
              <Plus size={18} className="mr-2" />
              Add Video
            </Button>
          </div>
        </div>

        <div className="flex-1 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-200 sticky top-0 backdrop-blur-sm bg-white/90 z-10">
                <tr>
                  <th className="px-6 py-4 font-medium">Video Details</th>
                  <th className="px-6 py-4 font-medium">Department</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Priority</th>
                  <th className="px-6 py-4 font-medium">Added</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.length > 0 ? (
                  filteredData.map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 font-medium text-gray-900">
                            <a 
                              href={video.video_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 hover:underline flex items-center gap-1.5"
                            >
                              <Youtube size={16} className="text-red-600" />
                              {video.video_title}
                              <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                            </a>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span className="font-medium">{video.channel_name || 'Unknown Channel'}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {video.duration_minutes}m
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                          {video.department}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={video.status} />
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={video.priority} />
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        <div className="flex flex-col">
                          <span>{new Date(video.created_at).toLocaleDateString()}</span>
                          <span className="text-[10px] text-gray-400">{video.added_by?.split('@')[0] || 'System'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEdit(video)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => openDelete(video.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Search size={32} className="text-gray-300" />
                        <p>No videos found matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/30 text-xs text-gray-500 flex justify-between items-center shrink-0">
            <span>Showing {filteredData.length} of {data.length} videos</span>
            <span className="text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Live from database
            </span>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => { !isSaving && setIsFormOpen(false); setError(null); }}
        title={editingVideo ? "Edit Video" : "Add Video to Queue"}
      >
        {/* Error message inside modal */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-300 rounded-lg px-4 py-3 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="text-red-500 hover:text-red-700"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <VideoForm 
          initialData={editingVideo}
          onSubmit={editingVideo ? handleEdit : handleAdd}
          onCancel={() => { setIsFormOpen(false); setError(null); }}
          isLoading={isSaving}
        />
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => !isSaving && setIsDeleteOpen(false)}
        title="Delete Video"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this video from the queue? This action cannot be undone.
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
                'Delete Video'
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-red-500 shadow-lg shadow-rose-200 mb-3">
                  <Youtube size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Video Sync Complete!</h3>
                <p className="text-sm text-gray-500 mt-1">Videos successfully synchronized from Dropbox</p>
              </div>

              {/* Visual Flow: CSV → Database */}
              <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 rounded-xl p-4 border border-rose-100">
                <div className="flex items-center justify-center gap-3">
                  {/* Source */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-xl bg-white shadow-md flex items-center justify-center border-2 border-rose-200">
                      <FileSpreadsheet size={28} className="text-rose-500" />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1.5 font-medium">CSV File</span>
                  </div>
                  
                  {/* Arrow Road */}
                  <div className="flex-1 flex items-center justify-center px-2">
                    <div className="relative w-full">
                      <div className="h-1.5 bg-gradient-to-r from-rose-300 via-pink-400 to-purple-400 rounded-full" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex gap-1">
                          <ArrowRight size={16} className="text-rose-500 animate-pulse" />
                          <ArrowRight size={16} className="text-pink-400 animate-pulse" style={{ animationDelay: '0.1s' }} />
                          <ArrowRight size={16} className="text-purple-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Destination */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-xl bg-white shadow-md flex items-center justify-center border-2 border-purple-200">
                      <Database size={28} className="text-purple-500" />
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
                  <div className="text-xs text-emerald-100 font-medium">New Videos</div>
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
                      <li key={i} className="list-disc">{err.queueId}: {err.error}</li>
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
