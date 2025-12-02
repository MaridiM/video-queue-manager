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
  Wand2,
  Save,
  CheckCircle,
} from 'lucide-react';
import type { VideoQueueItem } from '../lib/types';
import { transcriptionAPI, promptsAPI, type ProcessedTranscription } from '../lib/api';
import { Button } from './ui/Button';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { Modal } from './ui/Modal';

// Pipeline step type for visualizing progress
type PipelineStep = 'idle' | 'fetching-captions' | 'captions-success' | 'captions-failed' | 'whisper-fallback' | 'ai-processing' | 'saving' | 'complete' | 'error';

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
  
  // Pipeline state - tracks current step in the workflow
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>('idle');
  const [pipelineMessage, setPipelineMessage] = useState<string>('');
  
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
  
  // Prompt selection state
  const [selectedPrompt, setSelectedPrompt] = useState<'PMT-004' | 'PMT-010'>('PMT-004');
  
  // Prompt copy state
  const [promptCopying, setPromptCopying] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  
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
  
  // Handle modal open - reset state
  const handleOpenTranscriptionModal = () => {
    setPipelineStep('idle');
    setPipelineMessage('');
    setAiError(null);
    setPromptCopied(false);
    setShowTranscriptionModal(true);
  };
  
  // Copy selected prompt to clipboard
  const handleCopyPrompt = async () => {
    if (promptCopying) return;
    
    setPromptCopying(true);
    try {
      const result = await promptsAPI.getById(selectedPrompt);
      if (result.success && result.data) {
        await navigator.clipboard.writeText(result.data.content);
        setPromptCopied(true);
        setTimeout(() => setPromptCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
    setPromptCopying(false);
  };
  
  // Process with AI (full pipeline with step tracking)
  const handleProcessWithAI = async () => {
    if (aiProcessing) return;
    
    setAiProcessing(true);
    setAiError(null);
    setAiResult(null);
    
    try {
      // Step 1: Fetching captions
      setPipelineStep('fetching-captions');
      setPipelineMessage('Получение субтитров YouTube...');
      
      const result = await transcriptionAPI.processWithAI({
        videoUrl: video.video_url,
        videoTitle: video.video_title,
        saveToFile: true,
        provider: aiProvider,
        promptId: selectedPrompt
      });
      
      if (result.success && result.data) {
        setPipelineStep('complete');
        setPipelineMessage('Обработка завершена!');
        setAiResult(result.data);
      } else {
        setPipelineStep('error');
        setPipelineMessage(result.error || 'Ошибка обработки');
        setAiError(result.error || 'Ошибка AI обработки');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setPipelineStep('error');
      setPipelineMessage('Неожиданная ошибка');
      setAiError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setAiProcessing(false);
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
      
      {/* AI Process Modal - Single View */}
      <Modal
        isOpen={showTranscriptionModal}
        onClose={() => setShowTranscriptionModal(false)}
        title="AI Transcription Pipeline"
        size="lg"
      >
        <div className="space-y-4">
          {/* Pipeline Header - Always visible */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <Wand2 size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900">Полный AI Pipeline</p>
              <p className="text-sm text-slate-600">
                YouTube Captions → {aiProvider === 'google' ? googleModel : openaiModel} → PMT-004 → Файл
              </p>
            </div>
            {aiAvailable === false && (
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg">
                API не настроен
              </span>
            )}
          </div>
          
          {/* Pipeline Steps Visualization */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl">
            <div className={`flex flex-col items-center ${pipelineStep === 'fetching-captions' || pipelineStep === 'captions-success' ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                pipelineStep === 'captions-success' || pipelineStep === 'ai-processing' || pipelineStep === 'saving' || pipelineStep === 'complete' 
                  ? 'bg-emerald-500 text-white' 
                  : pipelineStep === 'fetching-captions' 
                    ? 'bg-blue-500 text-white' 
                    : pipelineStep === 'captions-failed' || pipelineStep === 'whisper-fallback'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-200 text-slate-500'
              }`}>
                {pipelineStep === 'fetching-captions' ? <Loader2 size={16} className="animate-spin" /> : 
                 pipelineStep === 'captions-success' || pipelineStep === 'ai-processing' || pipelineStep === 'saving' || pipelineStep === 'complete' ? <Check size={16} /> : 
                 <Youtube size={16} />}
              </div>
              <span className="text-[10px] mt-1 text-slate-500">Captions</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200 mx-2" />
            <div className={`flex flex-col items-center ${pipelineStep === 'ai-processing' ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                pipelineStep === 'saving' || pipelineStep === 'complete' 
                  ? 'bg-emerald-500 text-white' 
                  : pipelineStep === 'ai-processing' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-slate-200 text-slate-500'
              }`}>
                {pipelineStep === 'ai-processing' ? <Loader2 size={16} className="animate-spin" /> : 
                 pipelineStep === 'saving' || pipelineStep === 'complete' ? <Check size={16} /> : 
                 <Sparkles size={16} />}
              </div>
              <span className="text-[10px] mt-1 text-slate-500">AI</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200 mx-2" />
            <div className={`flex flex-col items-center ${pipelineStep === 'saving' || pipelineStep === 'complete' ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                pipelineStep === 'complete' 
                  ? 'bg-emerald-500 text-white' 
                  : pipelineStep === 'saving' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-slate-200 text-slate-500'
              }`}>
                {pipelineStep === 'saving' ? <Loader2 size={16} className="animate-spin" /> : 
                 pipelineStep === 'complete' ? <Check size={16} /> : 
                 <Save size={16} />}
              </div>
              <span className="text-[10px] mt-1 text-slate-500">Save</span>
            </div>
          </div>

          {/* Prompt Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-blue-500" />
                <span className="text-xs text-blue-700 font-medium">Выберите промпт:</span>
              </div>
              <button
                onClick={handleCopyPrompt}
                disabled={promptCopying}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  promptCopied
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {promptCopying ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : promptCopied ? (
                  <>
                    <Check size={12} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Prompt Selection Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedPrompt('PMT-004')}
                disabled={aiProcessing}
                className={`px-4 py-3 rounded-lg border-2 transition-all text-left ${
                  selectedPrompt === 'PMT-004'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                } ${aiProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    selectedPrompt === 'PMT-004'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-slate-300'
                  }`}>
                    {selectedPrompt === 'PMT-004' && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-900">PMT-004</p>
                    <p className="text-xs text-slate-600 mt-0.5">Video Transcription</p>
                    <p className="text-xs text-slate-500 mt-1">Фокус на TASK_MANAGERS (MLS, TSK, STP)</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedPrompt('PMT-010')}
                disabled={aiProcessing}
                className={`px-4 py-3 rounded-lg border-2 transition-all text-left ${
                  selectedPrompt === 'PMT-010'
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                } ${aiProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    selectedPrompt === 'PMT-010'
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-slate-300'
                  }`}>
                    {selectedPrompt === 'PMT-010' && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-900">PMT-010</p>
                    <p className="text-xs text-slate-600 mt-0.5">Complete Workflow</p>
                    <p className="text-xs text-slate-500 mt-1">Полный workflow: Research → Processing → Population</p>
                  </div>
                </div>
              </button>
            </div>
            
            {/* Prompt Description */}
            <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600">
                <strong className="text-slate-900">{selectedPrompt === 'PMT-004' ? 'PMT-004' : 'PMT-010'}:</strong>{' '}
                {selectedPrompt === 'PMT-004' 
                  ? 'Специализированный промпт для транскрипции видео с извлечением TASK_MANAGERS сущностей (Milestones, Tasks, Steps). Оптимизирован для быстрой обработки.'
                  : 'Комплексный промпт для полного workflow обработки видео: от исследования до интеграции в библиотеки. Включает все этапы процесса.'}
              </p>
            </div>
          </div>
          
          {/* Not processed yet */}
              {!aiResult && !aiProcessing && !aiError && (
                <div className="text-center py-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={40} className="text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Гибридная обработка</h3>
                  <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
                    Автоматическое получение субтитров, форматирование через <strong>{aiProvider === 'google' ? googleModel : openaiModel}</strong> по шаблону <strong>{selectedPrompt}</strong>, 
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
                        Время: {aiResult.timing?.total ? (aiResult.timing.total / 1000).toFixed(1) : '0.0'}с • 
                        {aiResult.aiProvider === 'google' ? ' 🌐 Google' : ' ✨ OpenAI'} {aiResult.aiModel || 'Unknown'}
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
                      <p className="text-xl font-bold text-emerald-600">
                        {aiResult.timing.aiProcessing ? (aiResult.timing.aiProcessing / 1000).toFixed(1) : '0.0'}s
                      </p>
                      <p className="text-xs text-emerald-700">AI время</p>
                    </div>
                  </div>
                  
                  {/* Format badge */}
                  {aiResult.format && (
                    <div className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-100">
                      <span className="text-xs text-indigo-700 font-medium">Формат:</span>
                      <span className="text-xs text-indigo-600 font-mono">{aiResult.format}</span>
                    </div>
                  )}
                  
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
                      {(() => {
                        // Support both old format (processedContent) and new format (transcription JSON)
                        let contentToShow = '';
                        if (aiResult.processedContent) {
                          // Legacy format - string content
                          contentToShow = aiResult.processedContent.substring(0, 3000);
                        } else if (aiResult.transcription) {
                          // New format - JSON object
                          try {
                            const jsonString = JSON.stringify(aiResult.transcription, null, 2);
                            contentToShow = jsonString.substring(0, 3000);
                          } catch (e) {
                            contentToShow = 'Ошибка форматирования JSON';
                          }
                        } else {
                          contentToShow = 'Нет данных для отображения';
                        }
                        
                        const fullContent = aiResult.processedContent || 
                          (aiResult.transcription ? JSON.stringify(aiResult.transcription, null, 2) : '');
                        const isTruncated = fullContent.length > 3000;
                        
                        return (
                          <>
                            {contentToShow}
                            {isTruncated && '\n\n... (показана часть результата)'}
                          </>
                        );
                      })()}
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
                      onClick={async () => {
                        try {
                          const contentToCopy = aiResult.processedContent || 
                            (aiResult.transcription ? JSON.stringify(aiResult.transcription, null, 2) : '');
                          await navigator.clipboard.writeText(contentToCopy);
                        } catch (error) {
                          console.error('Failed to copy:', error);
                          alert('Ошибка копирования в буфер обмена');
                        }
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
      </Modal>
    </div>
  );
}

