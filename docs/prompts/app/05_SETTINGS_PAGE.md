# Part 5: Settings Page - Complete Implementation

**Module:** Application Settings & Configuration
**Dependencies:** Part 1 (Core Setup)
**Size:** ~60KB
**Components:** 3 frontend components
**API Endpoints:** 7 backend endpoints
**Features:** AI provider configuration, Dropbox settings, API key management, connection testing

---

## Overview

This module implements the complete Settings management system with:
- AI Providers configuration (Google AI, OpenAI)
- Model selection per provider
- API key management with secure masking
- Connection testing with real-time feedback
- Dropbox integration settings
- Settings persistence to `settings.json`
- Token validation and account info display

---

## Backend Implementation

### 1. Settings File Structure

The `settings.json` file is stored at `api/settings.json`:

```json
{
  "openai": {
    "apiKey": "",
    "enabled": false,
    "model": "gpt-4o-mini"
  },
  "google": {
    "apiKey": "",
    "enabled": false,
    "model": "gemini-2.0-flash-exp"
  },
  "defaultProvider": "google",
  "dropbox": {
    "accessToken": "",
    "rootPath": "/ENTITIES/TASK_MANAGERS/RESEARCHES",
    "enabled": false
  }
}
```

### 2. API Endpoints (7 total)

Add these endpoints to `api/server.js`:

```javascript
// ============================================================================
// SETTINGS ENDPOINTS (7 endpoints)
// ============================================================================

const SETTINGS_FILE = path.join(__dirname, 'settings.json');

// Initialize settings file if it doesn't exist
function initializeSettings() {
  if (!fs.existsSync(SETTINGS_FILE)) {
    const defaultSettings = {
      openai: { apiKey: '', enabled: false, model: 'gpt-4o-mini' },
      google: { apiKey: '', enabled: false, model: 'gemini-2.0-flash-exp' },
      defaultProvider: 'google',
      dropbox: { accessToken: '', rootPath: '/ENTITIES/TASK_MANAGERS/RESEARCHES', enabled: false }
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
  }
}

// Load settings from file
function loadSettings() {
  try {
    initializeSettings();
    const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      openai: { apiKey: '', enabled: false, model: 'gpt-4o-mini' },
      google: { apiKey: '', enabled: false, model: 'gemini-2.0-flash-exp' },
      defaultProvider: 'google',
      dropbox: { accessToken: '', rootPath: '/ENTITIES/TASK_MANAGERS/RESEARCHES', enabled: false }
    };
  }
}

// Save settings to file
function saveSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

// GET /api/settings - Get AI provider settings
app.get('/api/settings', (req, res) => {
  try {
    const settings = loadSettings();

    // Mask API keys for security (show first 7 + last 4 chars)
    const maskedSettings = {
      ...settings,
      openai: settings.openai ? {
        ...settings.openai,
        apiKey: maskApiKey(settings.openai.apiKey)
      } : null,
      google: settings.google ? {
        ...settings.google,
        apiKey: maskApiKey(settings.google.apiKey)
      } : null
    };

    res.json(maskedSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings - Update AI provider settings
app.put('/api/settings', (req, res) => {
  try {
    const currentSettings = loadSettings();
    const { provider, config } = req.body;

    if (!provider || !config) {
      return res.status(400).json({ error: 'Provider and config are required' });
    }

    // Validate provider
    if (!['openai', 'google', 'defaultProvider'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    // Update settings
    if (provider === 'defaultProvider') {
      currentSettings.defaultProvider = config;
    } else {
      // If API key is masked (contains '***'), keep the existing key
      if (config.apiKey && config.apiKey.includes('***')) {
        config.apiKey = currentSettings[provider]?.apiKey || '';
      }

      currentSettings[provider] = {
        ...currentSettings[provider],
        ...config
      };

      // Re-initialize AI provider if enabled
      if (config.enabled && config.apiKey) {
        if (provider === 'google') {
          const { GoogleGenerativeAI } = require('@google/generative-ai');
          googleAI = new GoogleGenerativeAI(config.apiKey);
        } else if (provider === 'openai') {
          const OpenAI = require('openai');
          openAI = new OpenAI({ apiKey: config.apiKey });
        }
      }
    }

    const saved = saveSettings(currentSettings);
    if (!saved) {
      return res.status(500).json({ error: 'Failed to save settings' });
    }

    // Return masked settings
    const maskedSettings = {
      ...currentSettings,
      openai: currentSettings.openai ? {
        ...currentSettings.openai,
        apiKey: maskApiKey(currentSettings.openai.apiKey)
      } : null,
      google: currentSettings.google ? {
        ...currentSettings.google,
        apiKey: maskApiKey(currentSettings.google.apiKey)
      } : null
    };

    res.json(maskedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// POST /api/settings/test - Test AI provider connection
app.post('/api/settings/test', async (req, res) => {
  try {
    const { provider, apiKey, model } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({ error: 'Provider and apiKey are required' });
    }

    let result;

    if (provider === 'google') {
      // Test Google AI connection
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModel = genAI.getGenerativeModel({ model: model || 'gemini-2.0-flash-exp' });

      const testResult = await geminiModel.generateContent('Hello');
      const response = testResult.response.text();

      result = {
        success: true,
        message: 'Google AI connection successful',
        model: model || 'gemini-2.0-flash-exp',
        response: response.substring(0, 100) + '...'
      };
    } else if (provider === 'openai') {
      // Test OpenAI connection
      const OpenAI = require('openai');
      const client = new OpenAI({ apiKey });

      const completion = await client.chat.completions.create({
        model: model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 50
      });

      result = {
        success: true,
        message: 'OpenAI connection successful',
        model: model || 'gpt-4o-mini',
        response: completion.choices[0].message.content
      };
    } else {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error testing AI connection:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to test connection'
    });
  }
});

// GET /api/settings/dropbox - Get Dropbox settings
app.get('/api/settings/dropbox', (req, res) => {
  try {
    const settings = loadSettings();

    const dropboxSettings = {
      ...settings.dropbox,
      accessToken: maskApiKey(settings.dropbox?.accessToken || '')
    };

    res.json(dropboxSettings);
  } catch (error) {
    console.error('Error fetching Dropbox settings:', error);
    res.status(500).json({ error: 'Failed to fetch Dropbox settings' });
  }
});

// PUT /api/settings/dropbox - Update Dropbox settings
app.put('/api/settings/dropbox', (req, res) => {
  try {
    const currentSettings = loadSettings();
    const { accessToken, rootPath, enabled } = req.body;

    // If token is masked, keep existing
    let finalToken = accessToken;
    if (accessToken && accessToken.includes('***')) {
      finalToken = currentSettings.dropbox?.accessToken || '';
    }

    // Validate Dropbox token format
    if (finalToken && !finalToken.startsWith('sl.')) {
      return res.status(400).json({
        error: 'Invalid Dropbox token format. Token must start with "sl."'
      });
    }

    if (finalToken && finalToken.length < 20) {
      return res.status(400).json({
        error: 'Invalid Dropbox token. Token too short.'
      });
    }

    currentSettings.dropbox = {
      accessToken: finalToken,
      rootPath: rootPath || currentSettings.dropbox?.rootPath || '',
      enabled: enabled ?? currentSettings.dropbox?.enabled ?? false
    };

    // Re-initialize Dropbox service if enabled
    if (enabled && finalToken) {
      const { DropboxService } = require('./services/DropboxService');
      dropboxService = new DropboxService(finalToken, rootPath);
    }

    const saved = saveSettings(currentSettings);
    if (!saved) {
      return res.status(500).json({ error: 'Failed to save Dropbox settings' });
    }

    res.json({
      ...currentSettings.dropbox,
      accessToken: maskApiKey(currentSettings.dropbox.accessToken)
    });
  } catch (error) {
    console.error('Error updating Dropbox settings:', error);
    res.status(500).json({ error: 'Failed to update Dropbox settings' });
  }
});

// POST /api/settings/dropbox/test - Test Dropbox connection
app.post('/api/settings/dropbox/test', async (req, res) => {
  try {
    const { accessToken, rootPath } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    // Validate token format
    if (!accessToken.startsWith('sl.')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token format. Dropbox tokens start with "sl."'
      });
    }

    // Test Dropbox connection
    const { DropboxService } = require('./services/DropboxService');
    const testService = new DropboxService(accessToken, rootPath || '');

    // Try to get account info
    const dbx = testService.dbx;
    const accountInfo = await dbx.usersGetCurrentAccount();

    res.json({
      success: true,
      message: 'Dropbox connection successful',
      account: {
        name: accountInfo.result.name.display_name,
        email: accountInfo.result.email,
        accountId: accountInfo.result.account_id
      }
    });
  } catch (error) {
    console.error('Error testing Dropbox connection:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to connect to Dropbox'
    });
  }
});

// GET /api/settings/available-models - Get list of available AI models
app.get('/api/settings/available-models', (req, res) => {
  try {
    const { provider } = req.query;

    const models = {
      google: [
        { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Experimental)', description: 'Latest experimental model' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and efficient' },
        { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', description: 'Smaller, faster model' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Most capable model' }
      ],
      openai: [
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable' },
        { id: 'gpt-4o', name: 'GPT-4o', description: 'High intelligence' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Extended capabilities' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Cost-effective' }
      ]
    };

    if (provider && models[provider]) {
      res.json(models[provider]);
    } else {
      res.json(models);
    }
  } catch (error) {
    console.error('Error fetching available models:', error);
    res.status(500).json({ error: 'Failed to fetch available models' });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Mask API key for display (show first 7 + last 4 characters)
 * Example: sk-abc123xyz -> sk-abc1***xyz
 */
function maskApiKey(key) {
  if (!key || key.length < 15) return '***';

  const firstPart = key.substring(0, 7);
  const lastPart = key.substring(key.length - 4);
  return `${firstPart}***${lastPart}`;
}
```

---

## Frontend Implementation

### 1. Main Settings Page

Create `web/src/pages/Settings.tsx`:

```typescript
import { useState } from 'react';
import { Settings as SettingsIcon, Cpu, Cloud } from 'lucide-react';
import { AIProvidersSettings } from '../components/AIProvidersSettings';
import { DropboxSettings } from '../components/DropboxSettings';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'ai' | 'dropbox'>('ai');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-8 h-8 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
        <p className="text-sm text-gray-500">
          Configure AI providers, Dropbox integration, and application settings
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'ai'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Cpu className="w-4 h-4" />
            AI Providers
          </button>
          <button
            onClick={() => setActiveTab('dropbox')}
            className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'dropbox'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Cloud className="w-4 h-4" />
            Dropbox
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'ai' && <AIProvidersSettings />}
        {activeTab === 'dropbox' && <DropboxSettings />}
      </div>
    </div>
  );
}
```

### 2. AI Providers Settings Component

Create `web/src/components/AIProvidersSettings.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { fetchAPI } from '../lib/api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';

interface AIProvider {
  apiKey: string;
  enabled: boolean;
  model: string;
}

interface Settings {
  openai: AIProvider;
  google: AIProvider;
  defaultProvider: 'openai' | 'google';
}

interface Model {
  id: string;
  name: string;
  description: string;
}

export function AIProvidersSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [availableModels, setAvailableModels] = useState<Record<string, Model[]>>({});

  useEffect(() => {
    loadSettings();
    loadAvailableModels();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await fetchAPI('/settings');
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailableModels() {
    try {
      const models = await fetchAPI('/settings/available-models');
      setAvailableModels(models);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  }

  async function updateProvider(provider: 'openai' | 'google', config: Partial<AIProvider>) {
    try {
      setSaving(provider);

      const updated = await fetchAPI('/settings', {
        method: 'PUT',
        body: JSON.stringify({ provider, config })
      });

      setSettings(updated);
      setTestResults(prev => ({ ...prev, [provider]: null }));
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(null);
    }
  }

  async function testConnection(provider: 'openai' | 'google') {
    if (!settings) return;

    try {
      setTesting(provider);
      setTestResults(prev => ({ ...prev, [provider]: null }));

      // Get the actual API key (unmask if needed)
      const providerSettings = settings[provider];
      let apiKey = providerSettings.apiKey;

      // If key is masked, prompt user to enter it
      if (apiKey.includes('***')) {
        apiKey = prompt(`Enter your ${provider} API key to test connection:`) || '';
        if (!apiKey) {
          setTesting(null);
          return;
        }
      }

      const result = await fetchAPI('/settings/test', {
        method: 'POST',
        body: JSON.stringify({
          provider,
          apiKey,
          model: providerSettings.model
        })
      });

      setTestResults(prev => ({ ...prev, [provider]: result }));
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [provider]: { success: false, error: error.message }
      }));
    } finally {
      setTesting(null);
    }
  }

  async function setDefaultProvider(provider: 'openai' | 'google') {
    try {
      const updated = await fetchAPI('/settings', {
        method: 'PUT',
        body: JSON.stringify({ provider: 'defaultProvider', config: provider })
      });
      setSettings(updated);
    } catch (error) {
      console.error('Failed to set default provider:', error);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>;
  }

  if (!settings) {
    return <div className="text-center py-12 text-gray-500">Failed to load settings</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Default Provider Selection */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Default AI Provider
          </h3>
          <div className="flex gap-4">
            <Button
              variant={settings.defaultProvider === 'google' ? 'primary' : 'secondary'}
              onClick={() => setDefaultProvider('google')}
            >
              Google AI
            </Button>
            <Button
              variant={settings.defaultProvider === 'openai' ? 'primary' : 'secondary'}
              onClick={() => setDefaultProvider('openai')}
            >
              OpenAI
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Selected: <span className="font-medium">{settings.defaultProvider === 'google' ? 'Google AI' : 'OpenAI'}</span>
          </p>
        </div>
      </Card>

      {/* Google AI Settings */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Google AI (Gemini)</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.google.enabled}
                onChange={(e) => updateProvider('google', { enabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Enabled</span>
            </label>
          </div>

          <div className="space-y-4">
            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    type={showKeys.google ? 'text' : 'password'}
                    value={settings.google.apiKey}
                    onChange={(e) => updateProvider('google', { apiKey: e.target.value })}
                    placeholder="Enter Google AI API key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeys(prev => ({ ...prev, google: !prev.google }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKeys.google ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <select
                value={settings.google.model}
                onChange={(e) => updateProvider('google', { model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availableModels.google?.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Connection */}
            <div>
              <Button
                variant="secondary"
                onClick={() => testConnection('google')}
                disabled={testing === 'google' || !settings.google.apiKey}
              >
                {testing === 'google' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>

              {testResults.google && (
                <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${
                  testResults.google.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {testResults.google.success ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <div className="text-sm">
                    <div className="font-medium">
                      {testResults.google.success ? 'Connection Successful' : 'Connection Failed'}
                    </div>
                    <div className="mt-1 text-xs opacity-90">
                      {testResults.google.success
                        ? `Model: ${testResults.google.model}`
                        : testResults.google.error
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* OpenAI Settings */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">OpenAI (ChatGPT)</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.openai.enabled}
                onChange={(e) => updateProvider('openai', { enabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Enabled</span>
            </label>
          </div>

          <div className="space-y-4">
            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    type={showKeys.openai ? 'text' : 'password'}
                    value={settings.openai.apiKey}
                    onChange={(e) => updateProvider('openai', { apiKey: e.target.value })}
                    placeholder="Enter OpenAI API key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeys(prev => ({ ...prev, openai: !prev.openai }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  OpenAI Platform
                </a>
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <select
                value={settings.openai.model}
                onChange={(e) => updateProvider('openai', { model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availableModels.openai?.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Connection */}
            <div>
              <Button
                variant="secondary"
                onClick={() => testConnection('openai')}
                disabled={testing === 'openai' || !settings.openai.apiKey}
              >
                {testing === 'openai' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>

              {testResults.openai && (
                <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${
                  testResults.openai.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {testResults.openai.success ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <div className="text-sm">
                    <div className="font-medium">
                      {testResults.openai.success ? 'Connection Successful' : 'Connection Failed'}
                    </div>
                    <div className="mt-1 text-xs opacity-90">
                      {testResults.openai.success
                        ? `Model: ${testResults.openai.model}`
                        : testResults.openai.error
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

### 3. Dropbox Settings Component

Create `web/src/components/DropboxSettings.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Eye, EyeOff, Cloud, User, Mail } from 'lucide-react';
import { fetchAPI } from '../lib/api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';

interface DropboxSettings {
  accessToken: string;
  rootPath: string;
  enabled: boolean;
}

export function DropboxSettings() {
  const [settings, setSettings] = useState<DropboxSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await fetchAPI('/settings/dropbox');
      setSettings(data);
    } catch (error) {
      console.error('Failed to load Dropbox settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings(updates: Partial<DropboxSettings>) {
    if (!settings) return;

    try {
      setSaving(true);

      const updated = await fetchAPI('/settings/dropbox', {
        method: 'PUT',
        body: JSON.stringify({ ...settings, ...updates })
      });

      setSettings(updated);
      setTestResult(null);
    } catch (error: any) {
      alert('Failed to save settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    if (!settings) return;

    try {
      setTesting(true);
      setTestResult(null);

      // Get actual token if masked
      let accessToken = settings.accessToken;
      if (accessToken.includes('***')) {
        accessToken = prompt('Enter your Dropbox access token to test connection:') || '';
        if (!accessToken) {
          setTesting(false);
          return;
        }
      }

      const result = await fetchAPI('/settings/dropbox/test', {
        method: 'POST',
        body: JSON.stringify({
          accessToken,
          rootPath: settings.rootPath
        })
      });

      setTestResult(result);
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!settings) {
    return <div className="text-center py-12 text-gray-500">Failed to load Dropbox settings</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-600" />
              Dropbox Integration
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => saveSettings({ enabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Enabled</span>
            </label>
          </div>

          <div className="space-y-4">
            {/* Access Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Token *
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    type={showToken ? 'text' : 'password'}
                    value={settings.accessToken}
                    onChange={(e) => setSettings({ ...settings, accessToken: e.target.value })}
                    onBlur={(e) => saveSettings({ accessToken: e.target.value })}
                    placeholder="sl.xxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Token must start with "sl." and be at least 20 characters. Get your token from{' '}
                <a
                  href="https://www.dropbox.com/developers/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Dropbox App Console
                </a>
              </p>
            </div>

            {/* Root Path */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Root Path
              </label>
              <Input
                value={settings.rootPath}
                onChange={(e) => setSettings({ ...settings, rootPath: e.target.value })}
                onBlur={(e) => saveSettings({ rootPath: e.target.value })}
                placeholder="/ENTITIES/TASK_MANAGERS/RESEARCHES"
              />
              <p className="text-xs text-gray-500 mt-1">
                Base path for all Dropbox operations
              </p>
            </div>

            {/* Test Connection */}
            <div>
              <Button
                variant="secondary"
                onClick={testConnection}
                disabled={testing || !settings.accessToken}
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>

              {testResult && (
                <div className={`mt-3 p-4 rounded-lg ${
                  testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {testResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${
                        testResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                      </div>
                      <div className={`text-xs mt-1 ${
                        testResult.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {testResult.success ? testResult.message : testResult.error}
                      </div>

                      {/* Account Info */}
                      {testResult.success && testResult.account && (
                        <div className="mt-3 pt-3 border-t border-green-200 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-green-800">
                            <User className="w-4 h-4" />
                            <span>{testResult.account.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-800">
                            <Mail className="w-4 h-4" />
                            <span>{testResult.account.email}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Information Card */}
      <Card>
        <div className="p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Setup Instructions</h4>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>Go to <a href="https://www.dropbox.com/developers/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Dropbox App Console</a></li>
            <li>Create a new app or select existing app</li>
            <li>Set permissions: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">files.content.read</code> and <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">files.content.write</code></li>
            <li>Generate an access token (Settings → Generated access token)</li>
            <li>Copy the token and paste it above</li>
            <li>Click "Test Connection" to verify</li>
          </ol>
        </div>
      </Card>

      {/* Usage Info */}
      <Card>
        <div className="p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">What is this used for?</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <p>Dropbox integration is used for:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Syncing CSV files (VIDEO_QUEUE.csv, SEARCH_QUEUE.csv)</li>
              <li>Storing research data and transcriptions</li>
              <li>Backing up extracted entities</li>
              <li>Sharing data across team members</li>
            </ul>
            <p className="mt-3">
              When enabled, the system will attempt to use Dropbox first, then fall back to local files if Dropbox is unavailable.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

---

## Integration Instructions

### 1. Update App.tsx

Add the settings route to `web/src/App.tsx`:

```typescript
import Settings from './pages/Settings';

// In the navigation section:
{currentView === 'settings' && <Settings />}
```

### 2. Update Server Initialization

In `api/server.js`, ensure settings are initialized on startup:

```javascript
// Initialize settings on startup
initializeSettings();

// Load settings and initialize services
const settings = loadSettings();

if (settings.google?.enabled && settings.google?.apiKey) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  googleAI = new GoogleGenerativeAI(settings.google.apiKey);
}

if (settings.openai?.enabled && settings.openai?.apiKey) {
  const OpenAI = require('openai');
  openAI = new OpenAI({ apiKey: settings.openai.apiKey });
}

if (settings.dropbox?.enabled && settings.dropbox?.accessToken) {
  const { DropboxService } = require('./services/DropboxService');
  dropboxService = new DropboxService(
    settings.dropbox.accessToken,
    settings.dropbox.rootPath
  );
}
```

### 3. Test the Implementation

```bash
# Start backend
cd api
npm run dev

# Start frontend
cd web
npm run dev

# Navigate to Settings page
# Test: Configure AI providers, test connections, configure Dropbox
```

---

## Key Features Implemented

### API Key Security
- Masking API keys in responses (show first 7 + last 4 chars)
- Password-type input fields with show/hide toggle
- Secure storage in settings.json
- Never log or expose full keys

### Connection Testing
- Real-time connection testing for AI providers
- Test prompts to verify API functionality
- Dropbox account info retrieval
- Clear success/error feedback

### Settings Persistence
- Auto-save on field blur
- Immediate feedback on save
- Settings reload on service initialization
- Validation before save

### Token Validation
- Dropbox token format validation (must start with "sl.")
- Minimum length requirements
- Clear error messages for invalid tokens

### Model Selection
- Dynamic model lists per provider
- Model descriptions for user guidance
- Easy switching between models
- Default model recommendations

---

## Testing Checklist

- [ ] Load existing settings from settings.json
- [ ] Update Google AI API key
- [ ] Select Google AI model
- [ ] Test Google AI connection
- [ ] Enable/disable Google AI
- [ ] Update OpenAI API key
- [ ] Select OpenAI model
- [ ] Test OpenAI connection
- [ ] Enable/disable OpenAI
- [ ] Set default provider to Google
- [ ] Set default provider to OpenAI
- [ ] Update Dropbox access token
- [ ] Update Dropbox root path
- [ ] Test Dropbox connection
- [ ] View Dropbox account info after test
- [ ] Enable/disable Dropbox
- [ ] Verify settings persist after page reload
- [ ] Verify API keys are masked in display
- [ ] Verify show/hide password toggle works
- [ ] Verify token validation errors

---

## Security Considerations

### API Key Protection
- Never store API keys in frontend state unmasked
- Always mask keys when sending to frontend
- Use password input fields by default
- Warn users about key security in UI

### Token Validation
- Validate token format before saving
- Test connection before enabling services
- Clear error messages for invalid tokens
- Prevent saving obviously invalid keys

### Error Handling
- Never expose full error stack traces to frontend
- Generic error messages for authentication failures
- Detailed logs on server side only
- User-friendly error messages in UI

---

**Part 5 Complete** ✅
**All 5 modules finished!** 🎉

**Module Summary:**
- ✅ Part 1: Core Setup (68KB) - Database, Backend, Frontend Shell
- ✅ Part 2: Dashboard (26KB) - Statistics, Charts, AI Cost Tracker
- ✅ Part 3: Search Queue - CRUD, CSV Sync, Perplexity Settings
- ✅ Part 4: Video Queue - YouTube Integration, AI Pipeline, Export
- ✅ Part 5: Settings - AI Providers, Dropbox, Connection Testing

**Total:** 5 modules, 19 components, 24 API endpoints, ~300KB of prompts
