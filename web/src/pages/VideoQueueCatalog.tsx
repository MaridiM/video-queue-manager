import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Search,
  Plus,
  RefreshCw,
  Loader2,
  AlertCircle,
  LayoutGrid,
  List,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { videoQueueAPI, type VideoQueueAPI } from '../lib/api';
import {
  type VideoQueueItem,
  type Priority,
  type Status,
  type Department,
  type ResearchSource,
} from '../lib/types';
import { MOCK_VIDEOS, FILTER_OPTIONS } from '../lib/constants';

import { VideoCard } from '../components/VideoCard';
import { VideoQueueTable } from '../components/VideoQueueTable';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from '../components/ui/Dialog';

// Form validation schema
const videoSchema = z.object({
  video_url: z.string().min(1, 'URL is required').url('Must be a valid URL'),
  video_title: z.string().min(3, 'Title must be at least 3 characters'),
  channel_name: z.string().optional(),
  duration_minutes: z.coerce.number().min(1, 'Duration must be at least 1 minute').max(999),
  priority: z.enum(['low', 'medium', 'high'] as const),
  department: z.enum(['DEV', 'SMM', 'VID', 'AID', 'DGN', 'MKT'] as const),
  status: z.string(),
  notes: z.string().optional(),
});

type VideoFormValues = z.infer<typeof videoSchema>;

export function VideoQueueCatalog() {
  // Data state
  const [data, setData] = useState<VideoQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 12 : 15;

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoQueueItem | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<VideoQueueItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form
  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      video_url: '',
      video_title: '',
      channel_name: '',
      duration_minutes: 0,
      priority: 'medium',
      department: 'DEV',
      status: 'pending',
      notes: '',
    },
  });

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await videoQueueAPI.getAll();
      if (response.success && response.data) {
        const transformed = response.data.map((item: VideoQueueAPI) => {
          const normalizeStatus = (status: string): Status => {
            const statusLower = status.toLowerCase();
            if (['pending', 'selected', 'transcribing', 'transcribed', 'processing', 'complete', 'rejected'].includes(statusLower)) {
              return statusLower as Status;
            }
            return 'pending';
          };

          const priorityScore = item.priority_score || 0;
          let priority: Priority = 'low';
          if (priorityScore >= 70) priority = 'high';
          else if (priorityScore >= 40) priority = 'medium';

          return {
            id: item.queue_id,
            created_at: item.created_at || new Date().toISOString(),
            video_url: item.video_url,
            video_title: item.video_title,
            channel_name: item.channel_name || '',
            duration_minutes: item.duration_minutes,
            duration: item.duration || `${item.duration_minutes}m`,
            views: item.views,
            likes: item.likes,
            comments: item.comments,
            publish_date: item.publish_date || '',
            priority_score: priorityScore,
            priority: priority,
            status: normalizeStatus(item.status),
            department: item.department as Department,
            topic_category: item.topic_category,
            research_source: item.research_source as ResearchSource | undefined,
            added_by: item.added_by,
            added_date: item.added_date || '',
            notes: item.notes || '',
          };
        });
        setData(transformed.length > 0 ? transformed : MOCK_VIDEOS);
      } else {
        setData(MOCK_VIDEOS);
        setError('Failed to load data from API - using mock data');
      }
    } catch (err) {
      setData(MOCK_VIDEOS);
      setError(err instanceof Error ? err.message : 'Failed to load data - using mock data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Categories
  const categories = [
    { id: 'all', label: 'All', icon: '📚' },
    { id: 'DEV', label: 'Developers', icon: '💻' },
    { id: 'DGN', label: 'Designers', icon: '🎨' },
    { id: 'MKT', label: 'Marketers', icon: '📢' },
    { id: 'VID', label: 'Videographers', icon: '🎥' },
    { id: 'SMM', label: 'Social Media', icon: '📱' },
    { id: 'AID', label: 'AI & Data', icon: '🤖' },
  ];

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (selectedCategory !== 'all' && item.department !== selectedCategory) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (departmentFilter && item.department !== departmentFilter) return false;
      if (globalFilter) {
        const query = globalFilter.toLowerCase();
        return (
          item.video_title?.toLowerCase().includes(query) ||
          item.channel_name?.toLowerCase().includes(query) ||
          item.notes?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [data, selectedCategory, statusFilter, departmentFilter, globalFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, statusFilter, departmentFilter, globalFilter, viewMode]);

  // Stats
  const stats = useMemo(() => ({
    total: data.length,
    pending: data.filter((v) => v.status === 'pending').length,
    inProgress: data.filter((v) => ['selected', 'transcribing', 'processing'].includes(v.status)).length,
    complete: data.filter((v) => v.status === 'complete').length,
  }), [data]);

  // Form handlers
  const openAdd = () => {
    setEditingVideo(null);
    form.reset({
      video_url: '',
      video_title: '',
      channel_name: '',
      duration_minutes: 0,
      priority: 'medium',
      department: 'DEV',
      status: 'pending',
      notes: '',
    });
    setIsFormOpen(true);
  };

  const openEdit = (video: VideoQueueItem) => {
    setEditingVideo(video);
    form.reset({
      video_url: video.video_url,
      video_title: video.video_title,
      channel_name: video.channel_name || '',
      duration_minutes: video.duration_minutes,
      priority: video.priority,
      department: video.department,
      status: video.status,
      notes: video.notes || '',
    });
    setIsFormOpen(true);
  };

  const openDelete = (video: VideoQueueItem) => {
    setDeletingVideo(video);
    setIsDeleteOpen(true);
  };

  const onSubmit = async (values: VideoFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingVideo) {
        await videoQueueAPI.update(editingVideo.id, {
          video_url: values.video_url,
          video_title: values.video_title,
          channel_name: values.channel_name,
          duration_minutes: values.duration_minutes,
          department: values.department,
          status: values.status,
          notes: values.notes,
        });
        setData((prev) =>
          prev.map((item) =>
            item.id === editingVideo.id
              ? {
                  ...item,
                  video_url: values.video_url,
                  video_title: values.video_title,
                  channel_name: values.channel_name || '',
                  duration_minutes: values.duration_minutes,
                  duration: `${values.duration_minutes}m`,
                  department: values.department as Department,
                  priority_score: values.priority === 'high' ? 85 : values.priority === 'medium' ? 50 : 25,
                  priority: values.priority,
                  status: values.status as Status,
                  notes: values.notes || '',
                }
              : item
          )
        );
      } else {
        const response = await videoQueueAPI.create({
          video_url: values.video_url,
          video_title: values.video_title,
          channel_name: values.channel_name,
          duration_minutes: values.duration_minutes,
          department: values.department,
          notes: values.notes,
        });
        if (response.success && response.data) {
          const newVideo: VideoQueueItem = {
            id: response.data.queue_id,
            created_at: new Date().toISOString(),
            video_url: response.data.video_url,
            video_title: response.data.video_title,
            channel_name: response.data.channel_name || '',
            duration_minutes: response.data.duration_minutes,
            duration: response.data.duration || `${response.data.duration_minutes}m`,
            views: response.data.views,
            likes: response.data.likes,
            comments: response.data.comments,
            publish_date: response.data.publish_date || '',
            priority_score: response.data.priority_score || 50,
            priority: values.priority,
            status: response.data.status as Status,
            department: response.data.department as Department,
            research_source: response.data.research_source as ResearchSource | undefined,
            added_by: response.data.added_by,
            added_date: response.data.added_date || '',
            notes: response.data.notes || '',
          };
          setData((prev) => [newVideo, ...prev]);
        }
      }
      setIsFormOpen(false);
      form.reset();
    } catch (err) {
      console.error('Failed to save video:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!deletingVideo) return;
    setIsSubmitting(true);
    try {
      await videoQueueAPI.delete(deletingVideo.id);
      setData((prev) => prev.filter((item) => item.id !== deletingVideo.id));
      setIsDeleteOpen(false);
      setDeletingVideo(null);
    } catch (err) {
      console.error('Failed to delete video:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFilters = () => {
    setGlobalFilter('');
    setStatusFilter('');
    setDepartmentFilter('');
    setSelectedCategory('all');
  };

  const exportCSV = () => {
    const headers = ['ID', 'Video_Title', 'Video_URL', 'Channel_Name', 'Duration', 'Department', 'Priority', 'Status', 'Added_By', 'Added_Date', 'Notes'];
    const rows = filteredData.map((v) => [
      v.id,
      v.video_title,
      v.video_url,
      v.channel_name,
      v.duration,
      v.department,
      v.priority_score,
      v.status,
      v.added_by,
      v.added_date,
      v.notes,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell || ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-queue-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getDepartmentLabel = (dept: string) => {
    const deptMap: Record<string, string> = {
      DEV: 'Developers',
      DGN: 'Designers',
      MKT: 'Marketers',
      VID: 'Videographers',
      SMM: 'Social Media',
      AID: 'AI & Data',
    };
    return deptMap[dept] || dept;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-default)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-[var(--warning-light)] border border-[var(--warning)] rounded-[12px] text-[var(--warning)] text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center bg-[var(--background-secondary)] rounded-[8px] p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-[6px] transition-all ${
              viewMode === 'grid' ? 'bg-white shadow-sm text-[var(--primary-default)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-[6px] transition-all ${
              viewMode === 'table' ? 'bg-white shadow-sm text-[var(--primary-default)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
        <span className="text-sm text-[var(--text-secondary)]">
          {viewMode === 'grid' ? 'Grid View' : 'Table View'}
        </span>
      </div>

      {/* Grid View Controls - only show when in grid mode */}
      {viewMode === 'grid' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Videos', value: stats.total, color: 'blue' },
              { label: 'Pending', value: stats.pending, color: 'gray' },
              { label: 'In Progress', value: stats.inProgress, color: 'sky' },
              { label: 'Completed', value: stats.complete, color: 'emerald' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[var(--background-paper)] rounded-[12px] border border-[var(--border-default)] p-4 shadow-sm">
                <p className="text-sm font-medium text-[var(--text-secondary)]">{stat.label}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Actions & Filters */}
          <div className="bg-[var(--background-paper)] rounded-[12px] border border-[var(--border-default)] p-4 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
              {/* Search */}
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <Input
                  type="text"
                  placeholder="Search videos or channels..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Add Button */}
              <Button onClick={openAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Add Video
              </Button>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[var(--border-default)] items-end">
              <div className="w-40">
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Status</label>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Statuses</option>
                  {FILTER_OPTIONS.status.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
              </div>

              <div className="w-44">
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Department</label>
                <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                  <option value="">All Departments</option>
                  {FILTER_OPTIONS.department.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </Select>
              </div>

              <div className="flex gap-2 ml-auto">
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Reset
                </Button>
                <Button variant="outline" size="sm" onClick={loadData}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={exportCSV}>
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Category Filters (for Grid view) */}
      {viewMode === 'grid' && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => {
            const count = cat.id === 'all' ? data.length : data.filter((v) => v.department === cat.id).length;
            const isActive = selectedCategory === cat.id;
            const deptColor = cat.id !== 'all' ? getDepartmentColor(cat.id) : null;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? deptColor
                      ? 'text-white shadow-md'
                      : 'bg-[var(--primary-default)] text-white shadow-md'
                    : 'bg-white border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--background-hover)] hover:text-[var(--text-primary)]'
                }`}
                style={isActive && deptColor ? { backgroundColor: deptColor.default, boxShadow: `0 4px 12px ${deptColor.background}` } : {}}
              >
                <span className="text-lg">{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-[var(--secondary-100)] text-[var(--text-secondary)]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      {viewMode === 'table' ? (
        /* Table View - uses its own data management */
        <VideoQueueTable />
      ) : filteredData.length === 0 ? (
        <div className="bg-white rounded-[12px] border border-[var(--border-default)] p-16 text-center">
          <Search className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No videos found</h3>
          <p className="text-[var(--text-secondary)] mb-6">
            {globalFilter || statusFilter || departmentFilter
              ? 'Try adjusting your filters or search query.'
              : 'Start by adding videos to your catalog.'}
          </p>
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Video
          </Button>
        </div>
      ) : (
        <>
          {/* Grid View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {paginatedData.map((video) => (
              <VideoCard key={video.id} video={video} onEdit={openEdit} onDelete={openDelete} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm text-[var(--text-secondary)]">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogClose onClose={() => setIsFormOpen(false)} />
          <DialogHeader>
            <DialogTitle>{editingVideo ? 'Edit Video' : 'Add Video to Catalog'}</DialogTitle>
            <DialogDescription>
              {editingVideo ? 'Update the video details below.' : 'Fill in the details to add a new video.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)] mb-1.5 block">Video URL *</label>
              <Input
                {...form.register('video_url')}
                placeholder="https://youtube.com/watch?v=..."
                error={!!form.formState.errors.video_url}
              />
              {form.formState.errors.video_url && (
                <p className="text-sm text-[var(--error)] mt-1">{form.formState.errors.video_url.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--text-primary)] mb-1.5 block">Video Title *</label>
              <Input
                {...form.register('video_title')}
                placeholder="Enter video title"
                error={!!form.formState.errors.video_title}
              />
              {form.formState.errors.video_title && (
                <p className="text-sm text-[var(--error)] mt-1">{form.formState.errors.video_title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)] mb-1.5 block">Channel Name</label>
                <Input {...form.register('channel_name')} placeholder="Channel name" />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)] mb-1.5 block">Duration (mins) *</label>
                <Input
                  type="number"
                  {...form.register('duration_minutes')}
                  placeholder="15"
                  error={!!form.formState.errors.duration_minutes}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)] mb-1.5 block">Priority *</label>
                <Select {...form.register('priority')}>
                  {FILTER_OPTIONS.priority.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)] mb-1.5 block">Department *</label>
                <Select {...form.register('department')}>
                  {FILTER_OPTIONS.department.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            {editingVideo && (
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)] mb-1.5 block">Status</label>
                <Select {...form.register('status')}>
                  {FILTER_OPTIONS.status.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-[var(--text-primary)] mb-1.5 block">Notes</label>
              <Textarea {...form.register('notes')} placeholder="Any notes about this video..." rows={3} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingVideo ? 'Update Video' : 'Add to Catalog'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogClose onClose={() => setIsDeleteOpen(false)} />
          <DialogHeader>
            <DialogTitle>Delete Video</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingVideo?.video_title}" from the catalog? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to get department color
function getDepartmentColor(dept: string): { default: string; background: string } | null {
  const colors: Record<string, { default: string; background: string }> = {
    DEV: { default: '#147857', background: 'rgba(20, 120, 87, 0.15)' },
    DGN: { default: '#6D28D9', background: 'rgba(109, 40, 217, 0.15)' },
    MKT: { default: '#EC4899', background: 'rgba(236, 72, 153, 0.15)' },
    VID: { default: '#F97316', background: 'rgba(249, 115, 22, 0.15)' },
    SMM: { default: '#4B5563', background: 'rgba(75, 85, 99, 0.15)' },
    AID: { default: '#4B5563', background: 'rgba(75, 85, 99, 0.15)' },
  };
  return colors[dept] || null;
}
