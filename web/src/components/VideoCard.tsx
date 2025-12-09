import { useState } from 'react';
import {
  Play,
  Clock,
  Eye,
  ThumbsUp,
  MoreVertical,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import { type VideoQueueItem } from '../lib/types';
import { StatusBadge, DepartmentBadge, PriorityBadge } from './ui/StatusBadge';

interface VideoCardProps {
  video: VideoQueueItem;
  onEdit?: (video: VideoQueueItem) => void;
  onDelete?: (video: VideoQueueItem) => void;
}

export function VideoCard({ video, onEdit, onDelete }: VideoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showActions, setShowActions] = useState(false);

  if (!video) return null;

  // Extract YouTube video ID for thumbnail
  const getYouTubeThumbnail = (url: string) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  const thumbnail = getYouTubeThumbnail(video.video_url);
  const priorityScore = video.priority_score || 0;

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const channelInitials = getInitials(video.channel_name || 'Unknown');
  const addedByInitials = getInitials(video.added_by || 'Unknown');

  // Format duration
  const formatDuration = (minutes: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}`;
    }
    return `${mins}:00`;
  };

  return (
    <div
      className="group relative bg-white rounded-[12px] overflow-hidden border border-[var(--border-default)] hover:border-[var(--border-hover)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-[var(--secondary-100)] to-[var(--secondary-200)] overflow-hidden">
        {thumbnail && !imageError ? (
          <img
            src={thumbnail}
            alt={video.video_title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Youtube className="w-16 h-16 text-[var(--text-tertiary)]" />
          </div>
        )}

        {/* Duration Badge */}
        {video.duration_minutes && (
          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-[6px] flex items-center gap-1 text-white text-xs font-medium">
            <Clock className="w-3 h-3" />
            {formatDuration(video.duration_minutes)}
          </div>
        )}

        {/* Play Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200 ${
            showActions ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <a
            href={video.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white hover:bg-[var(--primary-default)] text-[var(--text-primary)] hover:text-white rounded-full p-4 transition-all duration-200 hover:scale-110 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Play className="w-6 h-6 fill-current" />
          </a>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <StatusBadge status={video.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Channel Avatar & Info */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-default)] to-[#7C3AED] flex items-center justify-center text-white text-sm font-bold shrink-0">
            {channelInitials}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="font-semibold text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--primary-default)] transition-colors leading-snug mb-1 text-base">
              {video.video_title || '[Untitled]'}
            </h3>

            {/* Channel Name */}
            <p className="text-sm text-[var(--text-secondary)] font-medium truncate">
              {video.channel_name || 'Unknown Channel'}
            </p>

            {/* Meta info */}
            <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-tertiary)]">
              {video.views && video.views > 0 && (
                <>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {formatNumber(video.views)} views
                  </span>
                  <span>•</span>
                </>
              )}
              {video.publish_date && <span>{formatDate(video.publish_date)}</span>}
            </div>
          </div>
        </div>

        {/* Tags/Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <DepartmentBadge department={video.department} />
          <PriorityBadge priority={video.priority} score={priorityScore} />
          {video.research_source && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--secondary-100)] text-[var(--text-secondary)]">
              #{video.research_source}
            </span>
          )}
        </div>

        {/* Notes */}
        {video.notes && (
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3 leading-relaxed">
            {video.notes}
          </p>
        )}

        {/* Footer - Stats & Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)]">
          <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
            {video.likes && video.likes > 0 && (
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                {formatNumber(video.likes)}
              </span>
            )}
            {video.added_date && (
              <span className="flex items-center gap-1">
                Added {formatDate(video.added_date)}
              </span>
            )}
          </div>

          {/* Action Menu */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(video);
              }}
              className="p-1.5 rounded-[8px] text-[var(--text-tertiary)] hover:text-[var(--primary-default)] hover:bg-[var(--primary-50)] transition-colors"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <a
              href={video.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-[8px] text-[var(--text-tertiary)] hover:text-[var(--primary-default)] hover:bg-[var(--primary-50)] transition-colors"
              title="Open in YouTube"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
