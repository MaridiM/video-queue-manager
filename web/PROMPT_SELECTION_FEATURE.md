# Функция выбора промпта (PMT-004 / PMT-010)

## ✅ Что было реализовано

### 1. Обновлен API endpoint
- ✅ Добавлен параметр `promptId` в запрос `/api/transcription/process`
- ✅ Поддержка выбора между `PMT-004` и `PMT-010`
- ✅ Динамическая загрузка промпта в зависимости от выбора

### 2. Обновлен UI компонент
- ✅ Добавлен выбор промпта перед генерацией
- ✅ Визуальные кнопки выбора с описанием каждого промпта
- ✅ Отображение выбранного промпта в pipeline header
- ✅ Кнопка копирования работает с выбранным промптом

### 3. Обновлен API клиент
- ✅ Добавлен параметр `promptId` в интерфейс `processWithAI`

---

## 🎨 UI Компоненты

### Выбор промпта
Пользователь видит два варианта:

1. **PMT-004 - Video Transcription**
   - Фокус на TASK_MANAGERS (MLS, TSK, STP)
   - Оптимизирован для быстрой обработки
   - Специализированный промпт для транскрипции

2. **PMT-010 - Complete Workflow**
   - Полный workflow: Research → Processing → Population
   - Комплексный промпт для всех этапов
   - Включает все этапы процесса

### Визуальные индикаторы
- ✅ Радио-кнопки для выбора
- ✅ Цветовая дифференциация (синий для PMT-004, фиолетовый для PMT-010)
- ✅ Описание каждого промпта
- ✅ Блокировка выбора во время обработки

---

## 🔧 Технические детали

### API Changes

**Endpoint:** `POST /api/transcription/process`

**Request Body:**
```typescript
{
  videoUrl: string;
  videoTitle?: string;
  saveToFile?: boolean;
  provider?: 'google' | 'openai';
  promptId?: 'PMT-004' | 'PMT-010'; // NEW
}
```

**Response:** Без изменений (тот же формат)

### Frontend Changes

**State:**
```typescript
const [selectedPrompt, setSelectedPrompt] = useState<'PMT-004' | 'PMT-010'>('PMT-004');
```

**API Call:**
```typescript
transcriptionAPI.processWithAI({
  videoUrl: video.video_url,
  videoTitle: video.video_title,
  saveToFile: true,
  provider: aiProvider,
  promptId: selectedPrompt // NEW
});
```

---

## 📋 Маппинг промптов

| Prompt ID | File Name | Description |
|-----------|-----------|-------------|
| PMT-004 | `PMT-004_Video_Transcription_v4.1.md` | Video Transcription с фокусом на TASK_MANAGERS |
| PMT-010 | `PMT-010_Complete_Workflow_Full.md` | Complete Workflow (Research → Processing → Population) |

---

## 🧪 Тестирование

### 1. Выбор PMT-004
1. Откройте модальное окно транскрипции
2. Выберите "PMT-004"
3. Нажмите "Process with AI"
4. Проверьте логи сервера - должен загрузиться PMT-004

### 2. Выбор PMT-010
1. Откройте модальное окно транскрипции
2. Выберите "PMT-010"
3. Нажмите "Process with AI"
4. Проверьте логи сервера - должен загрузиться PMT-010

### 3. Копирование промпта
1. Выберите промпт (PMT-004 или PMT-010)
2. Нажмите "Copy Prompt"
3. Проверьте буфер обмена - должен быть скопирован выбранный промпт

---

## 📊 Ожидаемое поведение

### PMT-004
- ✅ Быстрая обработка
- ✅ Фокус на TASK_MANAGERS сущностях
- ✅ Оптимизирован для транскрипции

### PMT-010
- ✅ Полный workflow
- ✅ Включает все этапы процесса
- ✅ Более комплексный анализ

---

## 🔄 Обратная совместимость

- ✅ По умолчанию используется PMT-004 (если `promptId` не указан)
- ✅ Старые запросы без `promptId` продолжают работать
- ✅ API валидирует `promptId` и возвращает ошибку для неверных значений

---

## 🚨 Обработка ошибок

### Неверный promptId
```json
{
  "success": false,
  "error": "Invalid prompt ID: PMT-999. Available prompts: PMT-004, PMT-010",
  "step": "load_prompt"
}
```

### Файл промпта не найден
```json
{
  "success": false,
  "error": "Prompt template not found: PMT-004_Video_Transcription_v4.1.md",
  "step": "load_prompt"
}
```

---

## ✅ Готово к использованию!

После обновления кода пользователи могут выбирать между PMT-004 и PMT-010 перед генерацией транскрипции.

