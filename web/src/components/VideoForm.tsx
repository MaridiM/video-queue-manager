import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import type { VideoFormData, VideoQueueItem, Priority, Department, Status } from '../lib/types';
import { DEPARTMENTS, PRIORITIES, STATUSES } from '../lib/constants';

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
    priority: 'medium',
    department: 'DEV',
    status: 'pending',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof VideoFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        video_url: initialData.video_url,
        video_title: initialData.video_title,
        channel_name: initialData.channel_name || '',
        duration_minutes: initialData.duration_minutes || 0,
        priority: initialData.priority,
        department: initialData.department,
        status: initialData.status,
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration_minutes' ? parseInt(value) || 0 : value
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

