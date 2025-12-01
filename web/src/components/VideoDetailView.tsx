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
  Captions,
  Download,
  Play,
  Wand2,
  Save,
  CheckCircle,
} from 'lucide-react';
import type { VideoQueueItem } from '../lib/types';
import { promptsAPI, transcriptionAPI, type PromptData, type TranscriptionData, type ProcessedTranscription } from '../lib/api';
import { Button } from './ui/Button';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { Modal } from './ui/Modal';

type ModalTab = 'prompt' | 'transcript' | 'ai-process';

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
  const [activeTab, setActiveTab] = useState<ModalTab>('transcript');
  
  // Prompt loading state
  const [promptData, setPromptData] = useState<PromptData | null>(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);
  
  // Transcript loading state
  const [transcriptData, setTranscriptData] = useState<TranscriptionData | null>(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [transcriptCopied, setTranscriptCopied] = useState(false);
  
  // AI Processing state
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<ProcessedTranscription | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [aiProvider, setAiProvider] = useState<'google' | 'openai'>('google');
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [openaiConfigured, setOpenaiConfigured] = useState(false);
  const [googleModel, setGoogleModel] = useState('gemini-2.0-flash');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o-mini');
  
  const youtubeId = extractYouTubeId(video.video_url);
  
  // Check AI availability on mount
  useEffect(() => {
    transcriptionAPI.getStatus().then(result => {
      if (result.success && result.data) {
        setAiAvailable(result.data.aiProcessing);
        setGoogleConfigured(result.data.googleAIConfigured);
        setOpenaiConfigured(result.data.openAIConfigured);
        setAiProvider(result.data.defaultProvider || 'google');
        if (result.data.googleModel) setGoogleModel(result.data.googleModel);
        if (result.data.openaiModel) setOpenaiModel(result.data.openaiModel);
      }
    });
  }, []);
  
  // Fetch prompt
  const fetchPrompt = async () => {
    if (promptData || promptLoading) return;
    
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
  const fetchTranscript = async () => {
    if (transcriptLoading) return;
    
    setTranscriptLoading(true);
    setTranscriptError(null);
    
    const result = await transcriptionAPI.fetchYouTube(video.video_url);
    
    if (result.success && result.data) {
      setTranscriptData(result.data);
    } else {
      setTranscriptError(result.error || 'Не удалось получить транскрипцию');
    }
    
    setTranscriptLoading(false);
  };
  
  // Handle modal open
  const handleOpenTranscriptionModal = () => {
    setShowTranscriptionModal(true);
  };
  
  // Handle tab change
  const handleTabChange = (tab: ModalTab) => {
    setActiveTab(tab);
    if (tab === 'prompt' && !promptData && !promptLoading) {
      fetchPrompt();
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
  
  // Copy transcript to clipboard
  const handleCopyTranscript = async () => {
    if (!transcriptData) return;
    
    try {
      await navigator.clipboard.writeText(transcriptData.plainText);
      setTranscriptCopied(true);
      setTimeout(() => setTranscriptCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  // Process with AI (full pipeline)
  const handleProcessWithAI = async () => {
    if (aiProcessing) return;
    
    setAiProcessing(true);
    setAiError(null);
    
    const result = await transcriptionAPI.processWithAI({
      videoUrl: video.video_url,
      videoTitle: video.video_title,
      saveToFile: true,
      provider: aiProvider
    });
    
    if (result.success && result.data) {
      setAiResult(result.data);
    } else {
      setAiError(result.error || 'Ошибка AI обработки');
    }
    
    setAiProcessing(false);
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
      
      {/* Transcription Modal with Tabs */}
      <Modal
        isOpen={showTranscriptionModal}
        onClose={() => setShowTranscriptionModal(false)}
        title="Generate Transcription"
        size="lg"
      >
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => handleTabChange('transcript')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'transcript'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Captions size={16} />
              <span className="hidden sm:inline">YouTube</span> Captions
            </button>
            <button
              onClick={() => handleTabChange('ai-process')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'ai-process'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wand2 size={16} />
              AI Process
            </button>
            <button
              onClick={() => handleTabChange('prompt')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'prompt'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={16} />
              PMT-004
            </button>
          </div>
          
          {/* Tab: YouTube Transcript */}
          {activeTab === 'transcript' && (
            <div className="space-y-4">
              {/* Video Info */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-100">
                <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-200">
                  <Youtube size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{video.video_title}</p>
                  <p className="text-sm text-slate-600">{video.channel_name || 'Unknown Channel'}</p>
                </div>
              </div>
              
              {/* Not fetched yet - Show fetch button */}
              {!transcriptData && !transcriptLoading && !transcriptError && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
                    <Captions size={40} className="text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Получить субтитры YouTube</h3>
                  <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                    Автоматически загрузить субтитры видео с YouTube. Работает быстро (5-10 секунд).
                  </p>
                  <Button onClick={fetchTranscript} className="px-8">
                    <Play size={18} className="mr-2" />
                    Fetch Transcript
                  </Button>
                </div>
              )}
              
              {/* Loading */}
              {transcriptLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 size={48} className="animate-spin text-emerald-500 mb-4" />
                  <p className="text-slate-600 font-medium">Загрузка субтитров...</p>
                  <p className="text-xs text-slate-400 mt-1">Получение данных с YouTube API</p>
                </div>
              )}
              
              {/* Error */}
              {transcriptError && !transcriptLoading && (
                <div className="flex flex-col items-center justify-center py-8">
                  <AlertCircle size={48} className="text-red-500 mb-4" />
                  <p className="text-red-600 font-medium mb-2">Ошибка загрузки</p>
                  <p className="text-slate-500 text-sm mb-4 text-center max-w-sm">{transcriptError}</p>
                  <Button onClick={fetchTranscript}>
                    <RefreshCw size={16} className="mr-2" />
                    Повторить
                  </Button>
                </div>
              )}
              
              {/* Transcript loaded */}
              {transcriptData && !transcriptLoading && (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                      <p className="text-2xl font-bold text-emerald-600">{transcriptData.totalSegments}</p>
                      <p className="text-xs text-emerald-700">Сегментов</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                      <p className="text-2xl font-bold text-blue-600">{transcriptData.totalDuration}</p>
                      <p className="text-xs text-blue-700">Длительность</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-100">
                      <p className="text-2xl font-bold text-purple-600">{transcriptData.rawText.split(' ').length}</p>
                      <p className="text-xs text-purple-700">Слов</p>
                    </div>
                  </div>
                  
                  {/* Transcript content */}
                  <div className="bg-slate-900 rounded-xl p-4 max-h-[40vh] overflow-y-auto">
                    <div className="space-y-2">
                      {transcriptData.transcript.map((segment, index) => (
                        <div key={index} className="flex gap-3 text-sm">
                          <span className="text-emerald-400 font-mono shrink-0 w-16">
                            [{segment.timestamp}]
                          </span>
                          <span className="text-slate-200">{segment.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowTranscriptionModal(false)}
                      className="flex-1"
                    >
                      Закрыть
                    </Button>
                    <Button
                      onClick={handleCopyTranscript}
                      className="flex-1"
                    >
                      {transcriptCopied ? (
                        <>
                          <Check size={16} className="mr-2" />
                          Скопировано!
                        </>
                      ) : (
                        <>
                          <Copy size={16} className="mr-2" />
                          Копировать текст
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Tab: AI Process */}
          {activeTab === 'ai-process' && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
                  <Wand2 size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">Полный AI Pipeline</p>
                  <p className="text-sm text-slate-600">
                    YouTube → {aiProvider === 'google' ? googleModel : openaiModel} → Файл
                  </p>
                </div>
                {aiAvailable === false && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg">
                    API не настроен
                  </span>
                )}
              </div>
              
              {/* Not processed yet */}
              {!aiResult && !aiProcessing && !aiError && (
                <div className="text-center py-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={40} className="text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Гибридная обработка</h3>
                  <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
                    Автоматическое получение субтитров, форматирование через <strong>{aiProvider === 'google' ? googleModel : openaiModel}</strong> по шаблону PMT-004, 
                    и сохранение в файл.
                  </p>
                  
                  {/* AI Provider Selector */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <button
                      onClick={() => setAiProvider('google')}
                      disabled={!googleConfigured}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        aiProvider === 'google'
                          ? 'bg-blue-500 text-white shadow-md'
                          : googleConfigured
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      🌐 Google AI
                    </button>
                    <button
                      onClick={() => setAiProvider('openai')}
                      disabled={!openaiConfigured}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        aiProvider === 'openai'
                          ? 'bg-emerald-500 text-white shadow-md'
                          : openaiConfigured
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      ✨ OpenAI
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-6">
                    <span className="px-2 py-1 bg-slate-100 rounded">~30-60 сек</span>
                    <span>•</span>
                    <span className="px-2 py-1 bg-slate-100 rounded">
                      {aiProvider === 'google' ? '~$0.001-0.01' : '~$0.02-0.05'}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={handleProcessWithAI} 
                    disabled={aiAvailable === false}
                    className={`px-8 ${
                      aiProvider === 'google' 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                        : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
                    }`}
                  >
                    <Wand2 size={18} className="mr-2" />
                    Process with {aiProvider === 'google' ? 'Google AI' : 'OpenAI'}
                  </Button>
                  
                  {aiAvailable === false && (
                    <p className="text-xs text-amber-600 mt-3">
                      Настройте API ключи в разделе Settings
                    </p>
                  )}
                </div>
              )}
              
              {/* Processing */}
              {aiProcessing && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <Loader2 size={48} className={`animate-spin ${aiProvider === 'google' ? 'text-blue-500' : 'text-purple-500'}`} />
                    <Sparkles size={20} className={`absolute -top-1 -right-1 animate-pulse ${aiProvider === 'google' ? 'text-cyan-400' : 'text-indigo-400'}`} />
                  </div>
                  <p className="text-slate-700 font-medium mt-4">Обработка видео...</p>
                  <p className="text-xs text-slate-400 mt-1">Это может занять 30-60 секунд</p>
                  
                  <div className="mt-6 space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                      <span>Получение субтитров YouTube</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className={`animate-spin ${aiProvider === 'google' ? 'text-blue-500' : 'text-purple-500'}`} />
                      <span>Обработка через {aiProvider === 'google' ? googleModel : openaiModel}...</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-50">
                      <div className="w-4 h-4 rounded-full border border-slate-300" />
                      <span>Сохранение в файл</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Error */}
              {aiError && !aiProcessing && (
                <div className="flex flex-col items-center justify-center py-8">
                  <AlertCircle size={48} className="text-red-500 mb-4" />
                  <p className="text-red-600 font-medium mb-2">Ошибка обработки</p>
                  <p className="text-slate-500 text-sm mb-4 text-center max-w-sm">{aiError}</p>
                  <Button onClick={handleProcessWithAI}>
                    <RefreshCw size={16} className="mr-2" />
                    Повторить
                  </Button>
                </div>
              )}
              
              {/* Success */}
              {aiResult && !aiProcessing && (
                <>
                  {/* Success header */}
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                      <CheckCircle size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-emerald-800">Обработка завершена!</p>
                      <p className="text-sm text-emerald-600">
                        Время: {(aiResult.timing.total / 1000).toFixed(1)}с • {aiResult.aiProvider === 'google' ? '🌐 Google' : '✨ OpenAI'} {aiResult.aiModel}
                      </p>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                      <p className="text-xl font-bold text-blue-600">{aiResult.rawTranscriptLength}</p>
                      <p className="text-xs text-blue-700">Raw символов</p>
                    </div>
                    <div className={`rounded-xl p-3 text-center border ${
                      aiResult.aiProvider === 'google' 
                        ? 'bg-cyan-50 border-cyan-100' 
                        : 'bg-purple-50 border-purple-100'
                    }`}>
                      <p className={`text-xl font-bold ${aiResult.aiProvider === 'google' ? 'text-cyan-600' : 'text-purple-600'}`}>
                        {aiResult.processedLength}
                      </p>
                      <p className={`text-xs ${aiResult.aiProvider === 'google' ? 'text-cyan-700' : 'text-purple-700'}`}>AI символов</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                      <p className="text-xl font-bold text-emerald-600">{(aiResult.timing.aiProcessing / 1000).toFixed(1)}s</p>
                      <p className="text-xs text-emerald-700">AI время</p>
                    </div>
                  </div>
                  
                  {/* Saved file path */}
                  {aiResult.savedFilePath && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 rounded-xl border border-amber-200">
                      <Save size={18} className="text-amber-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-amber-700 font-medium">Сохранено в файл:</p>
                        <p className="text-xs text-amber-600 truncate font-mono">{aiResult.savedFilePath}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Result preview */}
                  <div className="bg-slate-900 rounded-xl p-4 max-h-[35vh] overflow-y-auto">
                    <pre className="text-sm text-slate-100 whitespace-pre-wrap font-mono leading-relaxed">
                      {aiResult.processedContent.substring(0, 3000)}
                      {aiResult.processedContent.length > 3000 && '\n\n... (показана часть результата)'}
                    </pre>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowTranscriptionModal(false)}
                      className="flex-1"
                    >
                      Закрыть
                    </Button>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(aiResult.processedContent);
                      }}
                      className="flex-1"
                    >
                      <Copy size={16} className="mr-2" />
                      Копировать результат
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Tab: PMT-004 Prompt */}
          {activeTab === 'prompt' && (
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
              
              {/* Not loaded yet */}
              {!promptData && !promptLoading && !promptError && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
                    <FileText size={40} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">PMT-004 Prompt</h3>
                  <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                    Загрузить инструкции для создания структурированной транскрипции с AI.
                  </p>
                  <Button onClick={fetchPrompt} className="px-8">
                    <Download size={18} className="mr-2" />
                    Загрузить промпт
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
                  
                  <div className="bg-slate-900 rounded-xl p-4 max-h-[40vh] overflow-y-auto">
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
          )}
        </div>
      </Modal>
    </div>
  );
}

