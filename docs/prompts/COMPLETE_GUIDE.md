# 📚 Полное руководство по модульным промптам Queue Manager

## 🎉 Что создано

Вы получили **полную систему модульных промптов** для генерации приложения Queue Manager с помощью AI.

---

## 📦 Структура файлов

```
docs/prompts/
├── app/                                    # Модульные промпты для генерации
│   ├── 01_CORE_SETUP.md                   # 68KB - База (БД, Backend, Frontend)
│   ├── 02_DASHBOARD_PAGE.md               # 26KB - Дашборд с графиками
│   ├── 03_SEARCH_QUEUE_PAGE.md            # 35KB - Управление поисковой очередью
│   ├── 04_VIDEO_QUEUE_PAGE.md             # 120KB - Управление видео очередью
│   ├── 05_SETTINGS_PAGE.md                # 60KB - Настройки AI и Dropbox
│   └── README.md                           # Инструкции по использованию
│
├── PROMPT_MAINTENANCE_TEMPLATE.md         # 📘 Шаблоны для обновления промптов
├── QUICK_SYNC_CHEATSHEET.md               # ⚡ Быстрая шпаргалка
├── COMPLETE_GUIDE.md                      # 📚 Этот файл (обзор)
│
└── [другие файлы]
    ├── 05_COMPLETE_APP_GENERATION_PROMPT_1.md
    ├── 05_COMPLETE_APP_GENERATION_PROMPT_2.md
    └── MODULAR_PROMPTS_README.md
```

---

## 🚀 Как использовать для ГЕНЕРАЦИИ приложения

### Вариант 1: С нуля (новое приложение)

```markdown
Шаг 1: Сгенерируй базу
────────────────────────
Дай AI: docs/prompts/app/01_CORE_SETUP.md

Результат:
✅ База данных с 7 моделями
✅ Backend сервер (Express.js)
✅ Frontend shell (React)
✅ Навигация и UI компоненты

Шаг 2: Сгенерируй Dashboard
────────────────────────────
Дай AI: docs/prompts/app/02_DASHBOARD_PAGE.md

Результат:
✅ Страница дашборда
✅ Графики (Recharts)
✅ Статистика
✅ AI Cost Tracker

Шаг 3: Сгенерируй Search Queue
───────────────────────────────
Дай AI: docs/prompts/app/03_SEARCH_QUEUE_PAGE.md

Результат:
✅ Таблица поисковой очереди
✅ CRUD операции
✅ CSV синхронизация

Шаг 4: Сгенерируй Video Queue
──────────────────────────────
Дай AI: docs/prompts/app/04_VIDEO_QUEUE_PAGE.md

Результат:
✅ Таблица видео очереди
✅ YouTube интеграция
✅ AI транскрипция
✅ Priority scoring
✅ Export функции

Шаг 5: Сгенерируй Settings
───────────────────────────
Дай AI: docs/prompts/app/05_SETTINGS_PAGE.md

Результат:
✅ Настройки AI провайдеров
✅ Настройки Dropbox
✅ Тестирование подключений
```

### Вариант 2: Параллельная генерация (быстрее)

```markdown
AI Instance 1: Part 01 + Part 02
AI Instance 2: Part 01 + Part 03
AI Instance 3: Part 01 + Part 04
AI Instance 4: Part 01 + Part 05

Затем: Объедини код
```

---

## 🔄 Как использовать для ОБНОВЛЕНИЯ промптов

### Когда нужно обновлять?

**После каждого изменения в коде приложения!**

- ✅ Добавили новое поле в БД
- ✅ Создали новый API endpoint
- ✅ Добавили новый компонент
- ✅ Изменили дизайн
- ✅ Установили новую npm библиотеку
- ✅ Сделали рефакторинг

---

## ⚡ Быстрый старт для обновления

### 1️⃣ Самый простой способ

```markdown
# Скопируй и используй этот промпт:

Синхронизируй промпты в docs/prompts/app/ с текущим кодом.

Измененные файлы:
[выполни: git diff --name-only HEAD и вставь результат]

Задача:
1. Прочитай измененные файлы
2. Определи какие модули (01-05) затронуты
3. Обнови эти модули сохраняя полный код
4. Обнови Testing Checklist
5. Отчитайся что изменилось

Начинай.
```

### 2️⃣ С использованием шаблонов

**Если добавил поле в БД:**
```markdown
Добавил поле [FIELD_NAME]: [TYPE] в модель [MODEL_NAME].

Обнови:
1. Schema в 01_CORE_SETUP.md
2. API endpoints в соответствующем модуле
3. TypeScript интерфейсы
4. UI формы
```

**Если добавил новый endpoint:**
```markdown
Новый endpoint [METHOD] [PATH].

Код:
[вставь код endpoint]

Вставь в [MODULE].md после [PREVIOUS_ENDPOINT].
Добавь в Testing Checklist.
```

**Если создал новый компонент:**
```markdown
Новый компонент [NAME].tsx

Код:
[вставь полный код компонента]

Добавь в [MODULE].md секцию Frontend Implementation.
```

---

## 📖 Подробные руководства

### Для генерации приложения:
📘 **[app/README.md](./app/README.md)**
- Описание всех 5 модулей
- Инструкции по генерации
- Verification checklist
- Quick commands

### Для обновления промптов:
📘 **[PROMPT_MAINTENANCE_TEMPLATE.md](./PROMPT_MAINTENANCE_TEMPLATE.md)**
- Универсальный шаблон для любых изменений
- 7 быстрых шаблонов для частых случаев:
  1. Новое поле в БД
  2. Новый API endpoint
  3. Новый UI компонент
  4. Изменение дизайна
  5. Новая npm зависимость
  6. Рефакторинг
  7. Полная синхронизация
- Примеры заполненных шаблонов
- Best practices

⚡ **[QUICK_SYNC_CHEATSHEET.md](./QUICK_SYNC_CHEATSHEET.md)**
- Быстрая шпаргалка (1 страница)
- Карта: файл → модуль
- Самые частые случаи
- Команды для терминала

---

## 🗺️ Карта зависимостей

### Какой файл влияет на какой модуль

```
api/prisma/schema.prisma
    └─→ 01_CORE_SETUP.md

api/server.js
    ├─→ /api/overview → 02_DASHBOARD_PAGE.md
    ├─→ /api/search-queue/* → 03_SEARCH_QUEUE_PAGE.md
    ├─→ /api/video-queue/* → 04_VIDEO_QUEUE_PAGE.md
    └─→ /api/settings/* → 05_SETTINGS_PAGE.md

web/src/App.tsx
    └─→ 01_CORE_SETUP.md

web/src/components/ui/*
    └─→ 01_CORE_SETUP.md

web/src/pages/Dashboard.tsx
    └─→ 02_DASHBOARD_PAGE.md

web/src/components/SearchQueue*.tsx
    └─→ 03_SEARCH_QUEUE_PAGE.md

web/src/components/VideoQueue*.tsx
    └─→ 04_VIDEO_QUEUE_PAGE.md

web/src/pages/Settings.tsx
    └─→ 05_SETTINGS_PAGE.md
```

---

## 💡 Примеры использования

### Пример 1: Добавили тэги для видео

```markdown
# 1. Изменили код
// В schema.prisma добавили:
tags  String[]  @default([])

// В VideoQueueTable.tsx добавили колонку для тэгов

# 2. Используем промпт:
Добавил поле tags: String[] в модель VideoQueue.

Обнови:
1. Schema в 01_CORE_SETUP.md
2. TypeScript интерфейс Video в 04_VIDEO_QUEUE_PAGE.md
3. API endpoints в 04_VIDEO_QUEUE_PAGE.md (POST, PUT, GET response)
4. VideoQueueTable компонент (новая колонка)
5. VideoForm компонент (поле для редактирования тэгов)

Сохрани весь существующий код, только добавь поддержку тэгов.
```

### Пример 2: Добавили экспорт в Excel

```markdown
# 1. Изменили код
// Добавили endpoint в api/server.js:
app.get('/api/video-queue/export/excel', async (req, res) => {
  // ... код экспорта в Excel
});

// Добавили кнопку в VideoQueueTable.tsx

# 2. Используем промпт:
Добавил новый endpoint GET /api/video-queue/export/excel для экспорта в Excel.

Код endpoint:
[вставить полный код]

Задача:
1. Вставь endpoint в 04_VIDEO_QUEUE_PAGE.md после GET /api/video-queue/export
2. Добавь кнопку "Export to Excel" в VideoQueueTable компонент
3. Добавь npm пакет xlsx в dependencies
4. Добавь в Testing Checklist: "Export to Excel creates valid .xlsx file"
```

### Пример 3: Полная синхронизация после недели работы

```markdown
Накопились изменения за неделю. Нужна полная синхронизация.

Процесс:

Part 1 - Core Setup:
1. Читай api/prisma/schema.prisma
2. Сравни с docs/prompts/app/01_CORE_SETUP.md
3. Исправь все расхождения

Part 2 - Dashboard:
1. Читай web/src/pages/Dashboard.tsx
2. Читай /api/overview endpoint в api/server.js
3. Сравни с docs/prompts/app/02_DASHBOARD_PAGE.md
4. Исправь все расхождения

[... аналогично для Part 3, 4, 5]

После каждого Part отчитайся что нашел и исправил.

Начни с Part 1.
```

---

## ✅ Чеклист перед использованием

### Для генерации нового приложения:
- [ ] Прочитал [app/README.md](./app/README.md)
- [ ] Понимаю что нужно начинать с Part 1
- [ ] Настроил PostgreSQL
- [ ] Готов к генерации кода

### Для обновления промптов:
- [ ] Внес изменения в код
- [ ] Выполнил `git diff --name-only HEAD`
- [ ] Определил какие модули затронуты
- [ ] Выбрал подходящий шаблон из [PROMPT_MAINTENANCE_TEMPLATE.md](./PROMPT_MAINTENANCE_TEMPLATE.md)
- [ ] Готов дать промпт AI

---

## 🎯 Главные правила

### Для генерации:
1. **Всегда начинай с Part 1** (Core Setup)
2. **Генерируй полный код** из промптов (не сокращай)
3. **Тестируй после каждого модуля** (используй verification checklist)
4. **Следуй TypeScript типам** и структуре из промптов

### Для обновления:
1. **Обновляй промпты сразу после изменений** в коде
2. **Сохраняй полную детализацию** (не сокращай код в промптах)
3. **Проверяй консистентность** между модулями
4. **Коммить промпты вместе с кодом**

---

## 📊 Статистика проекта

### Модули
- **Всего модулей:** 5
- **Общий размер:** ~309KB
- **Статус:** ✅ 100% complete

### Код
- **Frontend компонентов:** 19
- **API endpoints:** 24
- **Database моделей:** 7
- **UI компонентов:** 5 базовых

### Стек технологий
- **Backend:** Node.js, Express.js 4.21, Prisma 7.0.1
- **Frontend:** React 19, TypeScript 5.9, Vite 7.2, Tailwind CSS 4.1
- **Database:** PostgreSQL 16+
- **UI Libraries:** TanStack Table, React Hook Form, Zod, Recharts, Lucide

---

## 🔗 Быстрые ссылки

| Документ | Для чего |
|----------|----------|
| [app/README.md](./app/README.md) | Генерация приложения |
| [app/01_CORE_SETUP.md](./app/01_CORE_SETUP.md) | База (начни отсюда) |
| [app/02_DASHBOARD_PAGE.md](./app/02_DASHBOARD_PAGE.md) | Dashboard |
| [app/03_SEARCH_QUEUE_PAGE.md](./app/03_SEARCH_QUEUE_PAGE.md) | Search Queue |
| [app/04_VIDEO_QUEUE_PAGE.md](./app/04_VIDEO_QUEUE_PAGE.md) | Video Queue |
| [app/05_SETTINGS_PAGE.md](./app/05_SETTINGS_PAGE.md) | Settings |
| [PROMPT_MAINTENANCE_TEMPLATE.md](./PROMPT_MAINTENANCE_TEMPLATE.md) | Обновление промптов |
| [QUICK_SYNC_CHEATSHEET.md](./QUICK_SYNC_CHEATSHEET.md) | Быстрая шпаргалка |

---

## 💬 Частые вопросы

### Q: С чего начать генерацию?
**A:** Всегда начинай с [app/01_CORE_SETUP.md](./app/01_CORE_SETUP.md) - это база.

### Q: Можно ли генерировать модули параллельно?
**A:** Да, но Part 1 должен быть сгенерирован первым во всех инстансах AI.

### Q: Как часто обновлять промпты?
**A:** После каждого значимого изменения в коде (или минимум раз в неделю).

### Q: Что делать если промпты устарели?
**A:** Используй "Полную синхронизацию" из [PROMPT_MAINTENANCE_TEMPLATE.md](./PROMPT_MAINTENANCE_TEMPLATE.md).

### Q: Можно ли сокращать код в промптах?
**A:** **НЕТ!** Промпты должны содержать полный код готовый к copy-paste.

### Q: Как добавить новую страницу в приложение?
**A:** Создай новый промпт-модуль по аналогии с существующими (02-05).

---

## 🎓 Философия системы

### Промпты = Исходный код в текстовом виде

Модульные промпты - это не просто документация. Это **полноценный исходный код** в текстовом формате, который AI может преобразовать в работающее приложение.

### Три принципа:

1. **Полнота** - Каждый промпт содержит 100% кода, не сокращения
2. **Модульность** - Можно генерировать части независимо
3. **Актуальность** - Промпты всегда синхронны с кодом

### Цель:

Любой AI (Claude, ChatGPT, Gemini) должен суметь **сгенерировать идентичное приложение** используя только промпты, без доступа к исходному коду.

---

## 🚀 Следующие шаги

### Если хочешь генерировать приложение:
1. Открой [app/README.md](./app/README.md)
2. Начни с [app/01_CORE_SETUP.md](./app/01_CORE_SETUP.md)
3. Следуй инструкциям последовательно

### Если хочешь обновить промпты:
1. Открой [QUICK_SYNC_CHEATSHEET.md](./QUICK_SYNC_CHEATSHEET.md) для быстрого старта
2. Или [PROMPT_MAINTENANCE_TEMPLATE.md](./PROMPT_MAINTENANCE_TEMPLATE.md) для подробных шаблонов
3. Выбери подходящий шаблон и заполни его

---

## 📞 Поддержка

Если что-то непонятно:
1. Перечитай [app/README.md](./app/README.md) - там основная информация
2. Используй [QUICK_SYNC_CHEATSHEET.md](./QUICK_SYNC_CHEATSHEET.md) как справочник
3. Изучи примеры в [PROMPT_MAINTENANCE_TEMPLATE.md](./PROMPT_MAINTENANCE_TEMPLATE.md)

---

**Успешной работы с модульными промптами!** 🎉

---

**Версия:** 1.0
**Дата создания:** 2025-12-10
**Автор:** Generated with Claude Code
