import { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Clock,
  Youtube,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  X,
} from 'lucide-react';

import { api } from '../lib/api';
import {
  type VideoQueueItem,
  type VideoFormData,
  type Priority,
  type VideoStatus,
  type Department,
  DEPARTMENTS,
  PRIORITIES,
  STATUSES,
  MOCK_VIDEOS,
} from '../lib/types';

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
import { StatusBadge, PriorityBadge, DepartmentBadge } from '../components/ui/StatusBadge';

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

// Use mock data as fallback
const USE_MOCK_DATA = false;

export function VideoQueue() {
  // Data state
  const [data, setData] = useState<VideoQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Table state
  const [sorting, setSorting] = useState<SortingState>([{ id: 'Priority_Score', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

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
      status: 'Pending',
      notes: '',
    },
  });

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (USE_MOCK_DATA) {
        setData(MOCK_VIDEOS);
      } else {
        const result = await api.getVideoQueue();
        setData(result.length > 0 ? result : MOCK_VIDEOS);
      }
    } catch (err) {
      console.error('Failed to load video queue:', err);
      setData(MOCK_VIDEOS);
      setError(err instanceof Error ? err.message : 'Failed to load data - using mock data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (statusFilter && item.Status !== statusFilter) return false;
      if (departmentFilter && item.Topic_Category !== departmentFilter) return false;
      if (globalFilter) {
        const query = globalFilter.toLowerCase();
        return (
          item.Video_Title?.toLowerCase().includes(query) ||
          item.Channel_Name?.toLowerCase().includes(query) ||
          item.Notes?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [data, statusFilter, departmentFilter, globalFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: data.length,
    pending: data.filter((v) => v.Status === 'Pending' || v.Status === 'pending').length,
    inProgress: data.filter((v) => ['Selected', 'selected', 'Transcribing', 'transcribing', 'Processing', 'processing'].includes(v.Status)).length,
    complete: data.filter((v) => v.Status === 'Complete' || v.Status === 'complete').length,
  }), [data]);

  // Table columns
  const columns = useMemo<ColumnDef<VideoQueueItem>[]>(
    () => [
      {
        accessorKey: 'Video_Title',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-slate-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Video Details
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        size: 320,
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <a
              href={row.original.Video_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-900 hover:text-blue-600 flex items-center gap-1.5 group"
            >
              <Youtube className="w-4 h-4 text-red-600 shrink-0" />
              <span className="truncate max-w-[260px]">{row.original.Video_Title || '[Untitled]'}</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
            </a>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className="font-medium">{row.original.Channel_Name || 'Unknown Channel'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {row.original.Duration || `${row.original.Duration_Minutes}m`}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'Topic_Category',
        header: 'Department',
        size: 100,
        cell: ({ getValue }) => <DepartmentBadge department={getValue<string>()} />,
      },
      {
        accessorKey: 'Status',
        header: 'Status',
        size: 120,
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
      },
      {
        accessorKey: 'Priority_Score',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-slate-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Priority
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        size: 90,
        cell: ({ getValue }) => {
          const score = getValue<number>() || 0;
          const priority = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
          return <PriorityBadge priority={priority} score={score} />;
        },
      },
      {
        accessorKey: 'Added_By',
        header: 'Added',
        size: 140,
        cell: ({ row }) => (
          <div className="flex flex-col text-sm">
            <span className="text-slate-700 truncate max-w-[120px]">{row.original.Added_By?.split('@')[0] || '-'}</span>
            <span className="text-xs text-slate-400">{row.original.Added_Date}</span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 80,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => openEdit(row.original)}
              className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDelete(row.original)}
              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // Table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 15 },
    },
  });

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
      status: 'Pending',
      notes: '',
    });
    setIsFormOpen(true);
  };

  const openEdit = (video: VideoQueueItem) => {
    setEditingVideo(video);
    const priority: Priority =
      video.Priority_Score >= 70 ? 'high' : video.Priority_Score >= 40 ? 'medium' : 'low';
    form.reset({
      video_url: video.Video_URL,
      video_title: video.Video_Title,
      channel_name: video.Channel_Name || '',
      duration_minutes: video.Duration_Minutes || parseInt(video.Duration) || 0,
      priority,
      department: (video.Topic_Category as Department) || 'DEV',
      status: video.Status,
      notes: video.Notes || '',
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
        // Update
        if (!USE_MOCK_DATA) {
          await api.updateVideo(editingVideo.Queue_ID, values);
        }
        setData((prev) =>
          prev.map((item) =>
            item.Queue_ID === editingVideo.Queue_ID
              ? {
                  ...item,
                  Video_URL: values.video_url,
                  Video_Title: values.video_title,
                  Channel_Name: values.channel_name || '',
                  Duration_Minutes: values.duration_minutes,
                  Duration: `${values.duration_minutes}m`,
                  Topic_Category: values.department,
                  Priority_Score: values.priority === 'high' ? 85 : values.priority === 'medium' ? 50 : 25,
                  Status: values.status as VideoStatus,
                  Notes: values.notes || '',
                }
              : item
          )
        );
      } else {
        // Create
        let newVideo: VideoQueueItem;
        if (!USE_MOCK_DATA) {
          newVideo = await api.addVideo(values as VideoFormData);
        } else {
          const maxId = data.reduce((max, item) => {
            const id = parseInt(item.Queue_ID?.replace('VQ-', '') || '0');
            return id > max ? id : max;
          }, 0);
          newVideo = {
            Queue_ID: `VQ-${String(maxId + 1).padStart(3, '0')}`,
            Video_URL: values.video_url,
            Video_Title: values.video_title,
            Channel_Name: values.channel_name || '',
            Duration_Minutes: values.duration_minutes,
            Duration: `${values.duration_minutes}m`,
            Topic_Category: values.department,
            Research_Source: '',
            Priority_Score: values.priority === 'high' ? 85 : values.priority === 'medium' ? 50 : 25,
            Status: values.status as VideoStatus,
            Added_By: 'current_user@example.com',
            Added_Date: new Date().toISOString().split('T')[0],
            Notes: values.notes || '',
            Views: 0,
            Likes: 0,
            Publish_Date: '',
          };
        }
        setData((prev) => [newVideo, ...prev]);
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
      if (!USE_MOCK_DATA) {
        await api.deleteVideo(deletingVideo.Queue_ID);
      }
      setData((prev) => prev.filter((item) => item.Queue_ID !== deletingVideo.Queue_ID));
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
  };

  const exportCSV = () => {
    const headers = ['Queue_ID', 'Video_Title', 'Video_URL', 'Channel_Name', 'Duration', 'Department', 'Priority', 'Status', 'Added_By', 'Added_Date', 'Notes'];
    const rows = filteredData.map((v) => [
      v.Queue_ID,
      v.Video_Title,
      v.Video_URL,
      v.Channel_Name,
      v.Duration,
      v.Topic_Category,
      v.Priority_Score,
      v.Status,
      v.Added_By,
      v.Added_Date,
      v.Notes,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell || ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-queue-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Videos', value: stats.total, color: 'blue' },
          { label: 'Pending', value: stats.pending, color: 'gray' },
          { label: 'In Progress', value: stats.inProgress, color: 'sky' },
          { label: 'Completed', value: stats.complete, color: 'emerald' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Actions & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100 items-end">
          <div className="w-40">
            <label className="text-xs font-medium text-slate-500 mb-1 block">Status</label>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-44">
            <label className="text-xs font-medium text-slate-500 mb-1 block">Department</label>
            <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredData.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-4 font-medium"
                          style={{ width: header.getSize() }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/30 flex items-center justify-between text-sm">
              <div className="text-slate-500">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  filteredData.length
                )}{' '}
                of {filteredData.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-slate-500 px-2">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No videos found</h3>
            <p className="text-slate-500 mb-4">Try adjusting your filters or add new videos to the queue.</p>
            <Button onClick={openAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogClose onClose={() => setIsFormOpen(false)} />
          <DialogHeader>
            <DialogTitle>{editingVideo ? 'Edit Video' : 'Add Video to Queue'}</DialogTitle>
            <DialogDescription>
              {editingVideo ? 'Update the video details below.' : 'Fill in the details to add a new video.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            {/* Video URL */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Video URL *</label>
              <Input
                {...form.register('video_url')}
                placeholder="https://youtube.com/watch?v=..."
                error={!!form.formState.errors.video_url}
              />
              {form.formState.errors.video_url && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.video_url.message}</p>
              )}
            </div>

            {/* Video Title */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Video Title *</label>
              <Input
                {...form.register('video_title')}
                placeholder="Enter video title"
                error={!!form.formState.errors.video_title}
              />
              {form.formState.errors.video_title && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.video_title.message}</p>
              )}
            </div>

            {/* Channel Name & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Channel Name</label>
                <Input {...form.register('channel_name')} placeholder="Channel name" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Duration (mins) *</label>
                <Input
                  type="number"
                  {...form.register('duration_minutes')}
                  placeholder="15"
                  error={!!form.formState.errors.duration_minutes}
                />
                {form.formState.errors.duration_minutes && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.duration_minutes.message}</p>
                )}
              </div>
            </div>

            {/* Priority & Department */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Priority *</label>
                <Select {...form.register('priority')}>
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Department *</label>
                <Select {...form.register('department')}>
                  {DEPARTMENTS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Status */}
            {editingVideo && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Status</label>
                <Select {...form.register('status')}>
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Notes</label>
              <Textarea {...form.register('notes')} placeholder="Any notes about this video..." />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingVideo ? 'Update Video' : 'Add to Queue'}
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
              Are you sure you want to delete "{deletingVideo?.Video_Title}" from the queue? This action cannot be
              undone.
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
