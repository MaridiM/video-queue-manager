import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { Loader2, TrendingUp, Eye, ThumbsUp, MessageSquare, Calendar, Folder, Search } from 'lucide-react';
import { Button } from './ui/Button';
import type { VideoFormData, VideoQueueItem, Priority, Department, Status, ResearchSource } from '../lib/types';
import { DEPARTMENTS, PRIORITIES, STATUSES, RESEARCH_SOURCES, TOPIC_CATEGORIES } from '../lib/constants';

interface VideoFormProps {
  initialData?: VideoQueueItem | null;
  onSubmit: (data: VideoFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function VideoForm({ initialData, onSubmit, onCancel, isLoading }: VideoFormProps) {
  const [formData, setFormData] = useState<VideoFormData>({
    video_url: '',
    video_title: '',
    channel_name: '',
    duration_minutes: 0,
    views: 0,
    likes: 0,
    comments: 0,
    publish_date: '',
    priority: 'medium',
    department: 'DEV',
    topic_category: '',
    research_source: 'Manual',
    added_by: '',
    status: 'pending',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof VideoFormData, string>>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        video_url: initialData.video_url,
        video_title: initialData.video_title,
        channel_name: initialData.channel_name || '',
        duration_minutes: initialData.duration_minutes || 0,
        views: initialData.views || 0,
        likes: initialData.likes || 0,
        comments: initialData.comments || 0,
        publish_date: initialData.publish_date || '',
        priority: initialData.priority,
        department: initialData.department,
        topic_category: initialData.topic_category || '',
        research_source: initialData.research_source || 'Manual',
        added_by: initialData.added_by || '',
        status: initialData.status,
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numericFields = ['duration_minutes', 'views', 'likes', 'comments'];
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseInt(value) || 0 : value
    }));
    if (errors[name as keyof VideoFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof VideoFormData, string>> = {};
    let isValid = true;

    if (!formData.video_url) {
      newErrors.video_url = 'URL is required';
      isValid = false;
    } else {
      try {
        new URL(formData.video_url);
      } catch {
        newErrors.video_url = 'Must be a valid URL';
        isValid = false;
      }
    }

    if (!formData.video_title || formData.video_title.length < 3) {
      newErrors.video_title = 'Title must be at least 3 characters';
      isValid = false;
    }

    if (formData.duration_minutes <= 0) {
      newErrors.duration_minutes = 'Duration must be greater than 0';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const inputClass = "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const labelClass = "text-sm font-medium mb-2 block text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="video_url" className={labelClass}>Video URL *</label>
          <input
            id="video_url"
            name="video_url"
            type="text"
            className={`${inputClass} ${errors.video_url ? 'border-red-500' : ''}`}
            placeholder="https://youtube.com/..."
            value={formData.video_url}
            onChange={handleChange}
          />
          {errors.video_url && <p className="text-red-500 text-xs mt-1">{errors.video_url}</p>}
        </div>

        <div className="col-span-1 md:col-span-2">
          <label htmlFor="video_title" className={labelClass}>Video Title *</label>
          <input
            id="video_title"
            name="video_title"
            type="text"
            className={`${inputClass} ${errors.video_title ? 'border-red-500' : ''}`}
            placeholder="Enter video title"
            value={formData.video_title}
            onChange={handleChange}
          />
          {errors.video_title && <p className="text-red-500 text-xs mt-1">{errors.video_title}</p>}
        </div>

        <div>
          <label htmlFor="channel_name" className={labelClass}>Channel Name</label>
          <input
            id="channel_name"
            name="channel_name"
            type="text"
            className={inputClass}
            placeholder="Channel Name"
            value={formData.channel_name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="duration_minutes" className={labelClass}>Duration (mins) *</label>
          <input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min="0"
            className={`${inputClass} ${errors.duration_minutes ? 'border-red-500' : ''}`}
            value={formData.duration_minutes}
            onChange={handleChange}
          />
          {errors.duration_minutes && <p className="text-red-500 text-xs mt-1">{errors.duration_minutes}</p>}
        </div>

        {/* Research Classification */}
        <div>
          <label htmlFor="topic_category" className={labelClass}>
            <Folder size={14} className="inline mr-1" />
            Topic Category
          </label>
          <select
            id="topic_category"
            name="topic_category"
            className={inputClass}
            value={formData.topic_category || ''}
            onChange={handleChange}
          >
            <option value="">Select topic...</option>
            {TOPIC_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="research_source" className={labelClass}>
            <Search size={14} className="inline mr-1" />
            Research Source
          </label>
          <select
            id="research_source"
            name="research_source"
            className={inputClass}
            value={formData.research_source || 'Manual'}
            onChange={handleChange}
          >
            {RESEARCH_SOURCES.map(src => (
              <option key={src} value={src}>{src}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="department" className={labelClass}>Department</label>
          <select
            id="department"
            name="department"
            className={inputClass}
            value={formData.department}
            onChange={handleChange}
          >
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority" className={labelClass}>Priority</label>
          <select
            id="priority"
            name="priority"
            className={inputClass}
            value={formData.priority}
            onChange={handleChange}
          >
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
          <p className="text-gray-400 text-xs mt-1">Auto-calculated from metrics if views/likes provided</p>
        </div>

        <div className="col-span-1 md:col-span-2">
          <label htmlFor="status" className={labelClass}>Status</label>
          <select
            id="status"
            name="status"
            className={inputClass}
            value={formData.status}
            onChange={handleChange}
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Advanced Metrics Toggle */}
        <div className="col-span-1 md:col-span-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <TrendingUp size={16} />
            {showAdvanced ? 'Hide' : 'Show'} Video Metrics (for Priority Score calculation)
          </button>
        </div>

        {/* Advanced Metrics Section */}
        {showAdvanced && (
          <>
            <div>
              <label htmlFor="views" className={labelClass}>
                <Eye size={14} className="inline mr-1" />
                Views
              </label>
              <input
                id="views"
                name="views"
                type="number"
                min="0"
                className={inputClass}
                placeholder="e.g., 150000"
                value={formData.views || 0}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="likes" className={labelClass}>
                <ThumbsUp size={14} className="inline mr-1" />
                Likes
              </label>
              <input
                id="likes"
                name="likes"
                type="number"
                min="0"
                className={inputClass}
                placeholder="e.g., 5000"
                value={formData.likes || 0}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="comments" className={labelClass}>
                <MessageSquare size={14} className="inline mr-1" />
                Comments
              </label>
              <input
                id="comments"
                name="comments"
                type="number"
                min="0"
                className={inputClass}
                placeholder="e.g., 200"
                value={formData.comments || 0}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="publish_date" className={labelClass}>
                <Calendar size={14} className="inline mr-1" />
                Publish Date
              </label>
              <input
                id="publish_date"
                name="publish_date"
                type="date"
                className={inputClass}
                value={formData.publish_date || ''}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="added_by" className={labelClass}>Added By</label>
              <input
                id="added_by"
                name="added_by"
                type="text"
                className={inputClass}
                placeholder="e.g., john@remotehelpers.com"
                value={formData.added_by || ''}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        <div className="col-span-1 md:col-span-2">
          <label htmlFor="notes" className={labelClass}>Notes</label>
          <textarea
            id="notes"
            name="notes"
            className={`${inputClass} min-h-[80px] py-2`}
            placeholder="Any additional notes..."
            value={formData.notes}
            onChange={handleChange}
          />
        </div>
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
            initialData ? 'Update Video' : 'Add to Queue'
          )}
        </Button>
      </div>
    </form>
  );
}

