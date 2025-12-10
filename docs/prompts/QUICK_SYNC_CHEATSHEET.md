# 🚀 Быстрая шпаргалка по синхронизации промптов

## Самый быстрый способ

### Копируй и используй этот промпт:

```
Синхронизируй промпты в docs/prompts/app/ с текущим кодом.

Измененные файлы:
[вставь вывод: git diff --name-only HEAD]

Задача:
1. Прочитай измененные файлы
2. Определи какие модули (01-05) затронуты
3. Обнови эти модули сохраняя полный код
4. Обнови Testing Checklist
5. Отчитайся что изменилось

Начинай.
```

---

## 📋 Карта: Какой файл → Какой модуль

| Измененный файл | Обновить модуль |
|----------------|----------------|
| `api/prisma/schema.prisma` | 01_CORE_SETUP.md |
| `api/server.js` (любой endpoint) | Смотри путь endpoint |
| → `/api/overview` | 02_DASHBOARD_PAGE.md |
| → `/api/search-queue/*` | 03_SEARCH_QUEUE_PAGE.md |
| → `/api/video-queue/*` | 04_VIDEO_QUEUE_PAGE.md |
| → `/api/settings/*` | 05_SETTINGS_PAGE.md |
| `web/src/App.tsx` | 01_CORE_SETUP.md |
| `web/src/components/ui/*` | 01_CORE_SETUP.md |
| `web/src/pages/Dashboard.tsx` | 02_DASHBOARD_PAGE.md |
| `web/src/components/SearchQueue*.tsx` | 03_SEARCH_QUEUE_PAGE.md |
| `web/src/components/VideoQueue*.tsx` | 04_VIDEO_QUEUE_PAGE.md |
| `web/src/pages/Settings.tsx` | 05_SETTINGS_PAGE.md |
| `web/src/components/AIProviders*.tsx` | 05_SETTINGS_PAGE.md |
| `web/src/components/Dropbox*.tsx` | 05_SETTINGS_PAGE.md |
| `package.json` | Все где используется пакет |

---

## 🎯 Частые случаи

### 1. Добавил поле в БД
```
Добавил поле [ИМЯ]: [ТИП] в модель [МОДЕЛЬ].

Обнови:
1. Schema в 01_CORE_SETUP.md
2. API endpoints в [модуле где используется]
3. TypeScript интерфейсы
4. UI формы
```

### 2. Новый endpoint
```
Новый endpoint [METHOD] [PATH] в api/server.js.

Вставь код в [MODULE].md после [PREVIOUS_ENDPOINT].
Добавь в Testing Checklist.
```

### 3. Новый компонент
```
Новый компонент [NAME].tsx

Код:
[вставь код]

Добавь в [MODULE].md секцию Frontend Implementation.
```

### 4. Изменил дизайн
```
Изменил дизайн [COMPONENT].

Замени код в [MODULE].md полностью на:
[вставь новый код]
```

### 5. Новая npm библиотека
```
npm install [PACKAGE]

Добавь в [MODULE].md:
- Install Additional Dependencies
- Import в коде
- Пример использования
```

---

## ⚡ Команды для терминала

```bash
# Получить список измененных файлов
git diff --name-only HEAD

# Получить измененные файлы с последнего коммита
git diff --name-only HEAD~1

# Посмотреть изменения в промптах
git diff docs/prompts/app/

# Закоммитить обновленные промпты
git add docs/prompts/
git commit -m "docs: sync prompts with [изменения]"
```

---

## ✅ Чеклист перед коммитом промптов

- [ ] Полный код (не сокращенный)
- [ ] Все комментарии сохранены
- [ ] TypeScript типы актуальны
- [ ] Новые npm пакеты указаны
- [ ] Testing Checklist обновлен
- [ ] Консистентность между модулями

---

## 🔥 Экстренная полная синхронизация

```
Сделай полный аудит всех 5 модулей.

Для каждого Part (01-05):
1. Читай исходный код (schema.prisma, server.js, компоненты)
2. Сравни с промптом
3. Исправь расхождения
4. Отчитайся

Начни с Part 1.
```

---

## 💡 Правило большого пальца

**Изменил код → Сразу обнови промпт**

Не накапливай изменения. Синхронизируй в тот же день.

---

## 📞 Нужна помощь?

Открой полное руководство:
- [PROMPT_MAINTENANCE_TEMPLATE.md](./PROMPT_MAINTENANCE_TEMPLATE.md) - Подробные шаблоны
- [app/README.md](./app/README.md) - Описание модулей

---

**Сохрани эту шпаргалку в закладки!**
