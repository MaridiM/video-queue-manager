import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  Sparkles,
  Check,
  X,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  Zap,
  Bot,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import { settingsAPI, type AISettings, type AIModelInfo } from '../lib/api';
import { Button } from '../components/ui/Button';

type AIProvider = 'google' | 'openai';

interface ProviderCardProps {
  provider: AIProvider;
  name: string;
  description: string;
  icon: React.ReactNode;
  configured: boolean;
  enabled: boolean;
  model: string;
  availableModels: AIModelInfo[];
  apiKeyPreview: string | null;
  isDefault: boolean;
  onToggle: () => void;
  onSetDefault: () => void;
  onSaveKey: (key: string) => Promise<void>;
  onTest: (key: string) => Promise<boolean>;
  onModelChange: (model: string) => Promise<void>;
  gradientFrom: string;
  gradientTo: string;
}

function ProviderCard({
  provider,
  name,
  description,
  icon,
  configured,
  enabled,
  model,
  availableModels,
  apiKeyPreview,
  isDefault,
  onToggle,
  onSetDefault,
  onSaveKey,
  onTest,
  onModelChange,
  gradientFrom,
  gradientTo,
}: ProviderCardProps) {
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(!configured);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChangingModel, setIsChangingModel] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    setIsSaving(true);
    setError(null);
    try {
      await onSaveKey(apiKey);
      setIsEditing(false);
      setApiKey('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
    }
    setIsSaving(false);
  };

  const handleTest = async () => {
    const keyToTest = apiKey.trim() || (configured ? 'existing' : '');
    if (!keyToTest && !configured) return;
    
    setIsTesting(true);
    setTestResult(null);
    setError(null);
    
    try {
      const success = await onTest(apiKey.trim() || '');
      setTestResult(success ? 'success' : 'error');
    } catch (e) {
      setTestResult('error');
      setError(e instanceof Error ? e.message : 'Ошибка подключения');
    }
    
    setIsTesting(false);
    setTimeout(() => setTestResult(null), 3000);
  };

  return (
    <div className={`relative bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all ${
      isDefault ? 'border-emerald-400 shadow-emerald-100' : 'border-slate-200'
    }`}>
      {/* Header gradient */}
      <div className={`h-1.5 sm:h-2 bg-gradient-to-r ${gradientFrom} ${gradientTo}`} />
      
      <div className="p-4 sm:p-6">
        {/* Provider Info */}
        <div className="flex items-start justify-between mb-4 sm:mb-6 gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center text-white shadow-lg shrink-0`}>
              {icon}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-base sm:text-xl font-bold text-slate-900">{name}</h3>
                {isDefault && (
                  <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full whitespace-nowrap">
                    По умолчанию
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 truncate">{description}</p>
            </div>
          </div>
          
          {/* Enable Toggle */}
          <button
            onClick={onToggle}
            disabled={!configured}
            className={`relative w-11 sm:w-14 h-6 sm:h-7 rounded-full transition-all shrink-0 ${
              enabled && configured
                ? 'bg-emerald-500'
                : 'bg-slate-300'
            } ${!configured ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className={`absolute top-0.5 w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-white shadow-md transition-transform ${
              enabled && configured ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          {configured ? (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <CheckCircle size={14} className="sm:hidden" />
              <CheckCircle size={16} className="hidden sm:block" />
              <span className="text-xs sm:text-sm font-medium">Настроен</span>
              {apiKeyPreview && (
                <span className="text-[10px] sm:text-xs text-emerald-600 font-mono ml-1 sm:ml-2 hidden xs:inline">
                  {apiKeyPreview}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <AlertCircle size={14} className="sm:hidden" />
              <AlertCircle size={16} className="hidden sm:block" />
              <span className="text-xs sm:text-sm font-medium">Требуется API ключ</span>
            </div>
          )}
        </div>

        {/* Model Selection - only show when configured */}
        {configured && availableModels && availableModels.length > 0 && (
          <div className="mb-3 sm:mb-4">
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Модель
            </label>
            <div className="relative">
              <select
                value={model}
                onChange={async (e) => {
                  setIsChangingModel(true);
                  try {
                    await onModelChange(e.target.value);
                  } catch (err) {
                    console.error('Error changing model:', err);
                  }
                  setIsChangingModel(false);
                }}
                disabled={isChangingModel}
                className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer disabled:opacity-50"
              >
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.description}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {isChangingModel ? (
                  <Loader2 size={14} className="animate-spin text-slate-400" />
                ) : (
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        )}

        {/* API Key Input */}
        <div className="space-y-2.5 sm:space-y-3">
          {(isEditing || !configured) && (
            <div className="relative">
              <Key size={16} className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Введите ${name} API Key`}
                className="w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs sm:text-sm"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff size={16} className="sm:hidden" /> : <Eye size={16} className="sm:hidden" />}
                {showKey ? <EyeOff size={18} className="hidden sm:block" /> : <Eye size={18} className="hidden sm:block" />}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-red-50 text-red-700 rounded-lg text-xs sm:text-sm">
              <AlertCircle size={14} className="shrink-0" />
              <span className="break-words">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {(isEditing || !configured) ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={!apiKey.trim() || isSaving}
                  className="flex-1 min-w-[120px] text-xs sm:text-sm py-2 sm:py-2.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="mr-1.5 sm:mr-2 animate-spin" />
                      <span className="hidden sm:inline">Сохранение...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} className="mr-1.5 sm:mr-2" />
                      Сохранить
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={!apiKey.trim() || isTesting}
                  className={`py-2 sm:py-2.5 px-3 ${testResult === 'success' ? 'border-emerald-400 text-emerald-600' : testResult === 'error' ? 'border-red-400 text-red-600' : ''}`}
                >
                  {isTesting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : testResult === 'success' ? (
                    <CheckCircle size={14} />
                  ) : testResult === 'error' ? (
                    <X size={14} />
                  ) : (
                    <Zap size={14} />
                  )}
                </Button>
                
                {configured && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setApiKey('');
                      setError(null);
                    }}
                    className="py-2 sm:py-2.5 px-3"
                  >
                    <X size={14} />
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 min-w-[100px] text-xs sm:text-sm py-2 sm:py-2.5"
                >
                  <RefreshCw size={14} className="mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">Изменить ключ</span>
                  <span className="sm:hidden">Изменить</span>
                </Button>
                
                {!isDefault && enabled && (
                  <Button
                    onClick={onSetDefault}
                    className="flex-1 min-w-[100px] bg-gradient-to-r from-emerald-500 to-teal-500 text-xs sm:text-sm py-2 sm:py-2.5"
                  >
                    <Sparkles size={14} className="mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">Сделать основным</span>
                    <span className="sm:hidden">Основной</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Settings() {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    
    const result = await settingsAPI.get();
    
    if (result.success && result.data) {
      setSettings(result.data);
    } else {
      setError(result.error || 'Не удалось загрузить настройки');
    }
    
    setLoading(false);
  };

  const handleToggle = async (provider: AIProvider) => {
    if (!settings) return;
    
    const providerSettings = settings[provider];
    if (!providerSettings.configured) return;
    
    const result = await settingsAPI.update({
      [provider]: { enabled: !providerSettings.enabled }
    });
    
    if (result.success && result.data) {
      setSettings(result.data);
      showSaveMessage('Настройки обновлены');
    }
  };

  const handleSetDefault = async (provider: AIProvider) => {
    const result = await settingsAPI.update({ defaultProvider: provider });
    
    if (result.success && result.data) {
      setSettings(result.data);
      showSaveMessage(`${provider === 'google' ? 'Google AI' : 'OpenAI'} установлен по умолчанию`);
    }
  };

  const handleSaveKey = async (provider: AIProvider, apiKey: string) => {
    const result = await settingsAPI.update({
      [provider]: { apiKey, enabled: true }
    });
    
    if (result.success && result.data) {
      setSettings(result.data);
      showSaveMessage('API ключ сохранён');
    } else {
      throw new Error(result.error || 'Ошибка сохранения');
    }
  };

  const handleTest = async (provider: AIProvider, apiKey: string): Promise<boolean> => {
    // If no new key provided, use existing (we can't test with masked key)
    if (!apiKey) {
      throw new Error('Введите API ключ для тестирования');
    }
    
    const result = await settingsAPI.testConnection(provider, apiKey);
    
    if (result.success) {
      return true;
    } else {
      throw new Error(result.error || 'Ошибка подключения');
    }
  };

  const handleModelChange = async (provider: AIProvider, model: string) => {
    const result = await settingsAPI.update({
      [provider]: { model }
    });
    
    if (result.success && result.data) {
      setSettings(result.data);
      showSaveMessage(`Модель изменена на ${model}`);
    }
  };

  const showSaveMessage = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600">Загрузка настроек...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Button onClick={loadSettings}>
            <RefreshCw size={16} className="mr-2" />
            Повторить
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white shadow-lg">
            <SettingsIcon size={20} className="sm:hidden" />
            <SettingsIcon size={24} className="hidden sm:block" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Настройки AI</h1>
            <p className="text-sm sm:text-base text-slate-500">Управление API ключами и провайдерами</p>
          </div>
        </div>
        
        {/* Save message */}
        {saveMessage && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl animate-fade-in">
            <CheckCircle size={18} />
            <span className="font-medium text-sm sm:text-base">{saveMessage}</span>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="mb-6 sm:mb-8 p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0">
            <Bot size={18} className="sm:hidden" />
            <Bot size={20} className="hidden sm:block" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">AI Провайдеры для транскрипций</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Настройте API ключи для обработки видео-транскрипций. Google AI (Gemini) рекомендуется 
              как основной провайдер — он быстрее и дешевле. OpenAI GPT-4 можно использовать как альтернативу.
            </p>
          </div>
        </div>
      </div>

      {/* Provider Cards */}
      {settings && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Google AI Card */}
          <ProviderCard
            provider="google"
            name="Google AI Studio"
            description="Gemini — быстрый и экономичный"
            icon={<Cloud size={28} />}
            configured={settings.google.configured}
            enabled={settings.google.enabled}
            model={settings.google.model}
            availableModels={settings.google.availableModels}
            apiKeyPreview={settings.google.apiKeyPreview}
            isDefault={settings.defaultProvider === 'google'}
            onToggle={() => handleToggle('google')}
            onSetDefault={() => handleSetDefault('google')}
            onSaveKey={(key) => handleSaveKey('google', key)}
            onTest={(key) => handleTest('google', key)}
            onModelChange={(model) => handleModelChange('google', model)}
            gradientFrom="from-blue-500"
            gradientTo="to-cyan-500"
          />

          {/* OpenAI Card */}
          <ProviderCard
            provider="openai"
            name="OpenAI"
            description="GPT — высокое качество"
            icon={<Sparkles size={28} />}
            configured={settings.openai.configured}
            enabled={settings.openai.enabled}
            model={settings.openai.model}
            availableModels={settings.openai.availableModels}
            apiKeyPreview={settings.openai.apiKeyPreview}
            isDefault={settings.defaultProvider === 'openai'}
            onToggle={() => handleToggle('openai')}
            onSetDefault={() => handleSetDefault('openai')}
            onSaveKey={(key) => handleSaveKey('openai', key)}
            onTest={(key) => handleTest('openai', key)}
            onModelChange={(model) => handleModelChange('openai', model)}
            gradientFrom="from-emerald-500"
            gradientTo="to-teal-500"
          />
        </div>
      )}

      {/* API Keys Info */}
      <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-3 text-sm sm:text-base">Где получить API ключи?</h3>
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-600">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Cloud size={16} className="text-blue-500 shrink-0" />
            <span><strong>Google AI Studio:</strong></span>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              aistudio.google.com/app/apikey
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Sparkles size={16} className="text-emerald-500 shrink-0" />
            <span><strong>OpenAI:</strong></span>
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              platform.openai.com/api-keys
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

