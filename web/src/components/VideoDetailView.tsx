import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Youtube,
  Clock,
  Eye,
  ThumbsUp,
  MessageSquare,
  Calendar,
  User,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  FileText,
  Building2,
  Tag,
  Hash,
  Loader2,
  AlertCircle,
  RefreshCw,
  Folder,
  FolderOpen,
} from 'lucide-react';
import type { VideoQueueItem } from '../lib/types';
import { promptsAPI, type PromptData } from '../lib/api';
import { Button } from './ui/Button';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { Modal } from './ui/Modal';

// Extract YouTube video ID from URL
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

interface VideoDetailViewProps {
  video: VideoQueueItem;
  onBack: () => void;
}

export function VideoDetailView({ video, onBack }: VideoDetailViewProps) {
  const [copied, setCopied] = useState(false);
  const [showTranscriptionModal, setShowTranscriptionModal] = useState(false);
  
  // Prompt loading state
  const [promptData, setPromptData] = useState<PromptData | null>(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);
  
  const youtubeId = extractYouTubeId(video.video_url);
  
  // Fetch prompt when modal opens
  const handleOpenTranscriptionModal = async () => {
    setShowTranscriptionModal(true);
    
    // Only fetch if not already loaded
    if (!promptData && !promptLoading) {
      setPromptLoading(true);
      setPromptError(null);
      
      const result = await promptsAPI.getById('PMT-004');
      
      if (result.success && result.data) {
        setPromptData(result.data);
      } else {
        setPromptError(result.error || 'Не удалось загрузить промпт');
      }
      
      setPromptLoading(false);
    }
  };
  
  // Retry loading prompt
  const handleRetryPrompt = async () => {
    setPromptLoading(true);
    setPromptError(null);
    
    const result = await promptsAPI.getById('PMT-004');
    
    if (result.success && result.data) {
      setPromptData(result.data);
    } else {
      setPromptError(result.error || 'Не удалось загрузить промпт');
    }
    
    setPromptLoading(false);
  };
  
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(video.video_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  const handleOpenYouTube = () => {
    window.open(video.video_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Назад к списку</span>
          </button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Video Player & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
              <div className="aspect-video bg-slate-900 relative">
                {youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={video.video_title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <Youtube size={64} className="mx-auto mb-4 text-red-500/50" />
                      <p>Не удалось загрузить видео</p>
                      <p className="text-sm mt-1 text-slate-500">Проверьте URL адрес</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Video Title */}
              <div className="p-6">
                <h1 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">
                  {video.video_title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  {video.channel_name && (
                    <div className="flex items-center gap-1.5">
                      <User size={16} className="text-slate-400" />
                      <span className="font-medium">{video.channel_name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-slate-400" />
                    <span>{video.duration_minutes} мин</span>
                  </div>
                  
                  {video.views !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <Eye size={16} className="text-slate-400" />
                      <span>{video.views.toLocaleString()} просмотров</span>
                    </div>
                  )}
                  
                  {video.likes !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <ThumbsUp size={16} className="text-slate-400" />
                      <span>{video.likes.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {video.comments !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <MessageSquare size={16} className="text-slate-400" />
                      <span>{video.comments.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Video Details Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-blue-500" />
                Информация о видео
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Hash size={18} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">ID</p>
                      <p className="text-sm font-mono text-slate-700">{video.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Building2 size={18} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Департамент</p>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-sm font-semibold">
                        {video.department}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Tag size={18} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Статус</p>
                      <StatusBadge status={video.status} />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Sparkles size={18} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Приоритет</p>
                      <PriorityBadge priority={video.priority} />
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Дата добавления</p>
                      <p className="text-sm text-slate-700">
                        {new Date(video.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <User size={18} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Добавил</p>
                      <p className="text-sm text-slate-700">{video.added_by || 'System'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {video.notes && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Заметки</p>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                    {video.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Action Buttons Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Действия</h2>
              
              <div className="space-y-3">
                {/* Copy URL Button */}
                <button
                  onClick={handleCopyUrl}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    copied
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-2 border-transparent'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={18} />
                      Скопировано!
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Копировать URL
                    </>
                  )}
                </button>
                
                {/* Open YouTube Button - RED */}
                <button
                  onClick={handleOpenYouTube}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  <Youtube size={18} />
                  Открыть на YouTube
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
            
            {/* Generate Transcription Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Транскрипция</h2>
                  <p className="text-sm text-blue-100">Генерация с AI</p>
                </div>
              </div>
              
              <p className="text-sm text-blue-100 mb-4">
                Используйте PMT-004 скрипт для создания структурированной транскрипции видео с извлечением сущностей таксономии.
              </p>
              
              <button
                onClick={handleOpenTranscriptionModal}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-white text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <FileText size={18} />
                Generate Transcriptions
              </button>
            </div>
            
            {/* Video URL Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">URL видео</h3>
              <div className="bg-slate-50 rounded-lg p-3 break-all">
                <code className="text-xs text-slate-600">{video.video_url}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transcription Script Modal */}
      <Modal
        isOpen={showTranscriptionModal}
        onClose={() => setShowTranscriptionModal(false)}
        title="PMT-004: Video Transcription Script"
      >
        <div className="space-y-4">
          {/* Loading State */}
          {promptLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
              <p className="text-slate-600">Загрузка промпта с сервера...</p>
              <p className="text-xs text-slate-400 mt-1">ENTITIES/PROMPTS/PMT-004_Video_Transcription_v4.1.md</p>
            </div>
          )}
          
          {/* Error State */}
          {promptError && !promptLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <p className="text-red-600 font-medium mb-2">Ошибка загрузки</p>
              <p className="text-slate-500 text-sm mb-4 text-center">{promptError}</p>
              <Button onClick={handleRetryPrompt}>
                <RefreshCw size={16} className="mr-2" />
                Повторить
              </Button>
            </div>
          )}
          
          {/* Content - Loaded Successfully */}
          {promptData && !promptLoading && !promptError && (
            <>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{promptData.promptId}</p>
                  <p className="text-sm text-slate-600 truncate">{promptData.fileName}</p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>Обновлено:</p>
                  <p>{new Date(promptData.lastModified).toLocaleDateString('ru-RU')}</p>
                </div>
              </div>
              
              {/* File path indicator - beautiful breadcrumb style */}
              <div className="relative">
                <div className="flex items-center gap-1 px-4 py-3 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 rounded-xl border border-amber-200/60 text-xs overflow-x-auto shadow-sm">
                  <FolderOpen size={16} className="text-amber-500 shrink-0 mr-1" />
                  {promptData.filePath.split('/').filter(Boolean).map((segment, index, arr) => {
                    const isLast = index === arr.length - 1;
                    const isFile = isLast && segment.includes('.');
                    
                    return (
                      <span key={index} className="flex items-center shrink-0">
                        {index > 0 && (
                          <span className="text-amber-300 mx-1 font-bold">/</span>
                        )}
                        {isFile ? (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg shadow-sm">
                            <FileText size={12} />
                            {segment}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-1 text-amber-700 hover:bg-amber-100 rounded-md transition-colors">
                            <Folder size={12} className="text-amber-500" />
                            {segment}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-4 max-h-[50vh] overflow-y-auto">
                <pre className="text-sm text-slate-100 whitespace-pre-wrap font-mono leading-relaxed">
                  {promptData.content}
                </pre>
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowTranscriptionModal(false)}
                  className="flex-1"
                >
                  Закрыть
                </Button>
                <Button
                  onClick={() => {
                    if (promptData) {
                      navigator.clipboard.writeText(promptData.content);
                    }
                  }}
                  className="flex-1"
                >
                  <Copy size={16} className="mr-2" />
                  Копировать скрипт
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

