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
  Download,
  CheckCircle2,
  Play,
  Captions,
  Wand2,
} from 'lucide-react';
import type { VideoQueueItem } from '../lib/types';
import { promptsAPI, youtubeAPI, transcriptionAPI, type PromptData, type TranscriptData, type AIFormattingResult } from '../lib/api';
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
  
  // Transcript state
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  
  // Manual transcript input state
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualTranscript, setManualTranscript] = useState('');
  
  // AI Formatting state
  const [aiResult, setAiResult] = useState<AIFormattingResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
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
  
  // Fetch YouTube transcript
  const handleFetchTranscript = async () => {
    setTranscriptLoading(true);
    setTranscriptError(null);
    
    const result = await youtubeAPI.getTranscript(video.video_url, includeTimestamps);
    
    if (result.success && result.data) {
      setTranscriptData(result.data);
    } else {
      setTranscriptError(result.error || 'Не удалось получить субтитры');
    }
    
    setTranscriptLoading(false);
  };
  
  // Copy transcript to clipboard
  const handleCopyTranscript = async () => {
    if (transcriptData) {
      try {
        await navigator.clipboard.writeText(transcriptData.transcript);
      } catch (err) {
        console.error('Failed to copy transcript:', err);
      }
    }
  };
  
  // Copy prompt + transcript combined for AI
  const handleCopyPromptWithTranscript = async () => {
    if (promptData && transcriptData) {
      const combined = `${promptData.content}\n\n---\n\n## VIDEO TRANSCRIPT\n\n**Video:** ${video.video_title}\n**URL:** ${video.video_url}\n**Duration:** ${transcriptData.total_duration_formatted}\n\n\`\`\`\n${transcriptData.transcript}\n\`\`\``;
      try {
        await navigator.clipboard.writeText(combined);
      } catch (err) {
        console.error('Failed to copy combined:', err);
      }
    }
  };
  
  // Run AI formatting on transcript
  const handleRunAIFormatting = async () => {
    if (!transcriptData) return;
    
    setAiLoading(true);
    setAiError(null);
    
    const result = await transcriptionAPI.formatWithAI({
      transcript: transcriptData.transcript,
      video_title: video.video_title,
      video_url: video.video_url,
      channel_name: video.channel_name || undefined,
      duration: transcriptData.total_duration_formatted,
      prompt_id: 'PMT-004'
    });
    
    if (result.success && result.data) {
      setAiResult(result.data);
    } else {
      setAiError(result.error || 'Не удалось выполнить AI обработку');
    }
    
    setAiLoading(false);
  };
  
  // Download formatted markdown file
  const handleDownloadMarkdown = () => {
    if (!aiResult) return;
    
    const blob = new Blob([aiResult.formatted_content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // Generate filename: Video_Title_YYYY-MM-DD.md
    const safeTitle = video.video_title
      .replace(/[^a-zA-Z0-9\u0400-\u04FF ]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    const date = new Date().toISOString().split('T')[0];
    a.download = `${safeTitle}_${date}.md`;
    
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Copy AI result to clipboard
  const handleCopyAIResult = async () => {
    if (aiResult) {
      try {
        await navigator.clipboard.writeText(aiResult.formatted_content);
      } catch (err) {
        console.error('Failed to copy AI result:', err);
      }
    }
  };
  
  // Use manual transcript
  const handleUseManualTranscript = () => {
    if (manualTranscript.trim()) {
      setTranscriptData({
        video_id: youtubeId || 'manual',
        transcript: manualTranscript.trim(),
        segments: manualTranscript.trim().split('\n').length,
        total_duration_ms: 0,
        total_duration_formatted: 'N/A',
        raw_segments: []
      });
      setShowManualInput(false);
      setTranscriptError(null);
    }
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
              {/* Prompt Info Header */}
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
              
              {/* YouTube Transcript Section */}
              <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white">
                    <Captions size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">YouTube Субтитры</p>
                    <p className="text-sm text-slate-600">Получить автогенерированные субтитры</p>
                  </div>
                </div>
                
                {/* Timestamps Toggle */}
                <div className="flex items-center gap-2 mb-3">
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={includeTimestamps}
                      onChange={(e) => setIncludeTimestamps(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Включить таймкоды
                  </label>
                </div>
                
                {/* Fetch Button or Status */}
                {!transcriptData && !transcriptLoading && !transcriptError && !showManualInput && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleFetchTranscript}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Download size={16} className="mr-2" />
                      Получить с YouTube
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowManualInput(true)}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                      title="Вставить транскрипт вручную"
                    >
                      <FileText size={16} />
                    </Button>
                  </div>
                )}
                
                {/* Loading */}
                {transcriptLoading && (
                  <div className="flex items-center justify-center gap-2 py-4 text-slate-600">
                    <Loader2 size={20} className="animate-spin" />
                    <span>Загрузка субтитров...</span>
                  </div>
                )}
                
                {/* Error */}
                {transcriptError && !transcriptLoading && !showManualInput && (
                  <div className="p-3 bg-red-100 rounded-lg border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-red-700">{transcriptError}</p>
                        <p className="text-xs text-red-600 mt-1">
                          💡 Видео может не иметь субтитров. Вы можете вставить транскрипт вручную.
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleFetchTranscript}
                          >
                            <RefreshCw size={14} className="mr-1" />
                            Повторить
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => setShowManualInput(true)}
                            className="bg-amber-500 hover:bg-amber-600"
                          >
                            <FileText size={14} className="mr-1" />
                            Вставить вручную
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Manual Transcript Input */}
                {showManualInput && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={18} className="text-amber-600" />
                      <span className="font-medium text-amber-900">Ручной ввод транскрипта</span>
                    </div>
                    <p className="text-xs text-amber-700 mb-2">
                      Вставьте транскрипт видео (из AI Studio, Whisper или другого источника)
                    </p>
                    <textarea
                      value={manualTranscript}
                      onChange={(e) => setManualTranscript(e.target.value)}
                      placeholder="Вставьте текст транскрипта здесь..."
                      className="w-full h-32 p-2 text-sm border border-amber-200 rounded-lg resize-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        onClick={handleUseManualTranscript}
                        disabled={!manualTranscript.trim()}
                        className="flex-1 bg-amber-600 hover:bg-amber-700"
                      >
                        <CheckCircle2 size={14} className="mr-1" />
                        Использовать
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowManualInput(false);
                          setManualTranscript('');
                        }}
                      >
                        Отмена
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Success */}
                {transcriptData && !transcriptLoading && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={18} />
                      <span className="text-sm font-medium">Субтитры получены!</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{transcriptData.segments} сегментов</span>
                      <span>•</span>
                      <span>{transcriptData.total_duration_formatted}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCopyTranscript}
                        className="flex-1"
                      >
                        <Copy size={14} className="mr-1" />
                        Копировать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFetchTranscript}
                      >
                        <RefreshCw size={14} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* File path indicator - compact beautiful breadcrumb */}
              <div className="flex items-center gap-1 px-3 py-2 bg-slate-50/80 rounded-lg border border-slate-200/60 text-[11px]">
                {(() => {
                  const segments = promptData.filePath.split('/').filter(Boolean);
                  const entitiesIndex = segments.findIndex(s => s.toUpperCase() === 'ENTITIES');
                  const displaySegments = entitiesIndex >= 0 ? segments.slice(entitiesIndex) : segments;
                  
                  return displaySegments.map((segment, index, arr) => {
                    const isFirst = index === 0;
                    const isLast = index === arr.length - 1;
                    const isFile = isLast && segment.includes('.');
                    
                    return (
                      <span key={index} className={`flex items-center ${isFile ? 'min-w-0' : 'shrink-0'}`}>
                        {index > 0 && (
                          <span className="text-slate-300 mx-1 font-light">›</span>
                        )}
                        {isFirst ? (
                          <span className="flex items-center gap-1 px-2 py-1 bg-violet-500 text-white font-semibold rounded-md">
                            <FolderOpen size={12} />
                            {segment}
                          </span>
                        ) : isFile ? (
                          <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white font-medium rounded-md min-w-0">
                            <FileText size={11} className="shrink-0" />
                            <span className="truncate">{segment}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 text-slate-500 font-medium">
                            <Folder size={11} className="text-slate-400" />
                            {segment}
                          </span>
                        )}
                      </span>
                    );
                  });
                })()}
              </div>
              
              {/* Transcript Preview (if loaded) */}
              {transcriptData && !aiResult && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-amber-900 flex items-center gap-2">
                      <Captions size={16} />
                      Предпросмотр субтитров
                    </h4>
                    <span className="text-xs text-amber-600">{transcriptData.segments} сегментов</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 max-h-32 overflow-y-auto border border-amber-100">
                    <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono">
                      {transcriptData.transcript.slice(0, 1500)}
                      {transcriptData.transcript.length > 1500 && '\n\n... (показаны первые 1500 символов)'}
                    </pre>
                  </div>
                </div>
              )}
              
              {/* AI Formatting Section */}
              {transcriptData && (
                <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-200">
                      <Wand2 size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">AI Форматирование</p>
                      <p className="text-sm text-slate-600">Применить PMT-004 через OpenAI</p>
                    </div>
                  </div>
                  
                  {/* Not started - show button */}
                  {!aiResult && !aiLoading && !aiError && (
                    <Button
                      onClick={handleRunAIFormatting}
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-200"
                    >
                      <Play size={16} className="mr-2" />
                      Запустить AI обработку
                    </Button>
                  )}
                  
                  {/* Loading */}
                  {aiLoading && (
                    <div className="flex flex-col items-center justify-center gap-3 py-6">
                      <div className="relative">
                        <Loader2 size={32} className="animate-spin text-violet-500" />
                        <div className="absolute inset-0 animate-ping">
                          <Loader2 size={32} className="text-violet-300 opacity-50" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-700 font-medium">Обработка через GPT-4o-mini...</p>
                        <p className="text-xs text-slate-500 mt-1">Это может занять 30-60 секунд</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Error */}
                  {aiError && !aiLoading && (
                    <div className="p-3 bg-red-100 rounded-lg border border-red-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-red-700">{aiError}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleRunAIFormatting}
                            className="mt-2"
                          >
                            <RefreshCw size={14} className="mr-1" />
                            Повторить
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Success - show result */}
                  {aiResult && !aiLoading && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 size={18} />
                        <span className="text-sm font-medium">AI обработка завершена!</span>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 bg-white/60 rounded-lg p-2">
                        <span>⏱️ {(aiResult.processing_time_ms / 1000).toFixed(1)}s</span>
                        <span>•</span>
                        <span>🔤 {aiResult.usage.total_tokens.toLocaleString()} токенов</span>
                        <span>•</span>
                        <span>💰 ${aiResult.usage.estimated_cost_usd}</span>
                      </div>
                      
                      {/* Preview */}
                      <div className="bg-white rounded-lg p-3 max-h-40 overflow-y-auto border border-violet-100">
                        <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono">
                          {aiResult.formatted_content.slice(0, 2000)}
                          {aiResult.formatted_content.length > 2000 && '\n\n... (показаны первые 2000 символов)'}
                        </pre>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleDownloadMarkdown}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Download size={16} className="mr-2" />
                          Скачать .md
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={handleCopyAIResult}
                          className="flex-1"
                        >
                          <Copy size={16} className="mr-2" />
                          Копировать
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAiResult(null);
                            setAiError(null);
                          }}
                          title="Сбросить результат"
                        >
                          <RefreshCw size={14} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Prompt Content */}
              <div className="bg-slate-900 rounded-xl p-4 max-h-[30vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-300">Промпт</h4>
                </div>
                <pre className="text-sm text-slate-100 whitespace-pre-wrap font-mono leading-relaxed">
                  {promptData.content}
                </pre>
              </div>
              
              {/* Action Buttons */}
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
                  Копировать промпт
                </Button>
                {transcriptData && (
                  <Button
                    onClick={handleCopyPromptWithTranscript}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                  >
                    <Wand2 size={16} className="mr-2" />
                    Промпт + Субтитры
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

