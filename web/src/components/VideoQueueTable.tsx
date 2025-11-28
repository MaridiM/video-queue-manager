import { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  ExternalLink,
  Clock,
  Youtube,
  Filter as FilterIcon
} from 'lucide-react';
import type { VideoQueueItem, VideoFormData } from '../lib/types';
import { MOCK_VIDEOS } from '../lib/constants';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { VideoForm } from './VideoForm';
import { FilterPanel, type FilterState } from './FilterPanel';

export function VideoQueueTable() {
  const [data, setData] = useState<VideoQueueItem[]>(MOCK_VIDEOS);
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

  const handleAdd = (formData: VideoFormData) => {
    const newVideo: VideoQueueItem = {
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      added_by: 'current_user@example.com',
      ...formData,
      channel_name: formData.channel_name || undefined,
      notes: formData.notes || null,
    };
    setData([newVideo, ...data]);
    setIsFormOpen(false);
  };

  const handleEdit = (formData: VideoFormData) => {
    if (!editingVideo) return;
    setData(data.map(item => 
      item.id === editingVideo.id 
        ? { ...item, ...formData } 
        : item
    ));
    setEditingVideo(null);
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (videoToDelete) {
      setData(data.filter(item => item.id !== videoToDelete));
      setVideoToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  const openEdit = (video: VideoQueueItem) => {
    setEditingVideo(video);
    setIsFormOpen(true);
  };

  const openDelete = (id: string) => {
    setVideoToDelete(id);
    setIsDeleteOpen(true);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
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

          <Button onClick={() => { setEditingVideo(null); setIsFormOpen(true); }}>
            <Plus size={18} className="mr-2" />
            Add Video
          </Button>
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
                          <span className="text-[10px] text-gray-400">{video.added_by.split('@')[0]}</span>
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
            <span>Showing {filteredData.length} entries</span>
            <div className="flex gap-2">
              <span className="cursor-not-allowed opacity-50">Previous</span>
              <span className="cursor-not-allowed opacity-50">Next</span>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingVideo ? "Edit Video" : "Add Video to Queue"}
      >
        <VideoForm 
          initialData={editingVideo}
          onSubmit={editingVideo ? handleEdit : handleAdd}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Video"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this video from the queue? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Video</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

