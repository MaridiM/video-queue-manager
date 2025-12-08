# Анализ: Стоит ли хранить токены в базе данных?

**Дата анализа:** 2025-12-02  
**Текущее состояние:** Токены хранятся в `apps/api/settings.json`

---

## 📊 Сравнение подходов

### Текущий подход: JSON файл (`settings.json`)

**Преимущества:**
- ✅ Простота реализации
- ✅ Быстрый доступ (чтение из памяти)
- ✅ Не зависит от БД при старте
- ✅ Легко редактировать вручную
- ✅ Работает без БД

**Недостатки:**
- ❌ Хранится в открытом виде
- ❌ Нет версионирования изменений
- ❌ Нет аудита (кто и когда изменил)
- ❌ Проблемы с синхронизацией в multi-instance окружении
- ❌ Нет шифрования по умолчанию

---

### Альтернатива: База данных (PostgreSQL)

**Преимущества:**
- ✅ Централизованное хранение
- ✅ Версионирование через миграции Prisma
- ✅ Аудит изменений (createdAt, updatedAt)
- ✅ Шифрование на уровне БД (PostgreSQL pgcrypto)
- ✅ Синхронизация между несколькими инстансами
- ✅ Резервное копирование вместе с данными
- ✅ Транзакции и консистентность
- ✅ Возможность разграничения доступа через БД роли

**Недостатки:**
- ❌ Дополнительная сложность
- ❌ Зависимость от БД при старте приложения
- ❌ Нужна миграция существующих данных
- ❌ Небольшая задержка при чтении (не критично для настроек)
- ❌ Нужно реализовать шифрование/дешифрование

---

## 🎯 Рекомендации по сценариям использования

### ✅ Стоит хранить в БД, если:

1. **Multi-instance окружение**
   - Несколько серверов используют одну БД
   - Нужна синхронизация настроек между инстансами

2. **Требуется аудит**
   - Нужно знать, кто и когда изменил токены
   - Требования compliance/безопасности

3. **Многопользовательская система**
   - Разные пользователи могут иметь разные токены
   - Нужно разграничение доступа

4. **Уже используете БД для всего**
   - Все данные в БД
   - Единая точка резервного копирования

### ❌ НЕ стоит хранить в БД, если:

1. **Single-instance приложение**
   - Один сервер
   - Нет необходимости в синхронизации

2. **Простота важнее**
   - Небольшое приложение
   - Нет требований к аудиту

3. **Production окружение**
   - Лучше использовать переменные окружения или Secrets Manager

---

## 🔐 Безопасность: Сравнение подходов

### 1. JSON файл (текущий)

**Уровень безопасности:** ⚠️ Средний

**Риски:**
- Файл в открытом виде
- Доступ через файловую систему
- Нет шифрования

**Можно улучшить:**
- Шифровать файл перед сохранением
- Использовать права доступа (chmod 600)
- Хранить в защищённой директории

### 2. База данных

**Уровень безопасности:** ✅ Высокий (с шифрованием)

**Возможности:**
- Шифрование на уровне БД (PostgreSQL pgcrypto)
- Шифрование в приложении перед сохранением
- Разграничение доступа через БД роли
- Аудит всех операций

**Рекомендация:**
```sql
-- Пример с pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Шифрование при вставке
INSERT INTO settings (key, encrypted_value) 
VALUES ('openai_api_key', pgp_sym_encrypt('sk-...', 'encryption_key'));
```

### 3. Переменные окружения (лучший вариант для production)

**Уровень безопасности:** ✅✅ Очень высокий

**Преимущества:**
- Не хранятся в файлах или БД
- Управляются через систему секретов
- Легко ротируются
- Не попадают в Git

**Рекомендация для production:**
- Использовать только переменные окружения
- Secrets Manager (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)
- CI/CD секреты

---

## 💡 Рекомендуемый подход

### Гибридное решение (лучшее для большинства случаев):

```
┌─────────────────────────────────────────┐
│  Development / Staging                   │
│  ┌───────────────────────────────────┐  │
│  │  settings.json (локальный файл)   │  │
│  │  или                              │  │
│  │  БД (если нужен аудит)            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Production                             │
│  ┌───────────────────────────────────┐  │
│  │  ТОЛЬКО переменные окружения       │  │
│  │  или                              │  │
│  │  Secrets Manager                  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🏗️ Реализация хранения в БД (если решили)

### 1. Создать Prisma схему

```prisma
// apps/api/prisma/schema.prisma

model AppSettings {
  id            String   @id @default(uuid())
  key           String   @unique @db.VarChar(100)  // 'openai.apiKey', 'google.apiKey', 'dropbox.accessToken'
  value         String   @db.Text                   // Зашифрованное значение
  encrypted     Boolean  @default(true)             // Зашифровано ли значение
  category      String   @db.VarChar(50)            // 'ai', 'storage', 'general'
  description   String?  @db.Text
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  updatedBy     String?  @map("updated_by") @db.VarChar(255)  // Кто обновил (для аудита)

  @@index([category])
  @@index([key])
  @@map("app_settings")
}
```

### 2. Функции для работы с настройками

```javascript
// apps/api/utils/settingsDB.js

import { prisma } from '../prisma/client.js';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || 'default-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export async function getSetting(key) {
  const setting = await prisma.appSettings.findUnique({
    where: { key }
  });
  
  if (!setting) return null;
  
  if (setting.encrypted) {
    return decrypt(setting.value);
  }
  
  return setting.value;
}

export async function setSetting(key, value, category = 'general', encrypted = true) {
  const encryptedValue = encrypted ? encrypt(value) : value;
  
  return await prisma.appSettings.upsert({
    where: { key },
    update: {
      value: encryptedValue,
      encrypted,
      updatedAt: new Date()
    },
    create: {
      key,
      value: encryptedValue,
      encrypted,
      category,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
}

export async function getAllSettings() {
  const settings = await prisma.appSettings.findMany();
  
  return settings.reduce((acc, setting) => {
    const value = setting.encrypted ? decrypt(setting.value) : setting.value;
    acc[setting.key] = value;
    return acc;
  }, {});
}
```

### 3. Миграция существующих данных

```javascript
// apps/api/utils/migrateSettingsToDB.js

import { loadSettings } from '../server.js';
import { setSetting } from './settingsDB.js';

export async function migrateSettingsToDB() {
  const fileSettings = loadSettings();
  
  // Мигрируем OpenAI
  if (fileSettings.openai?.apiKey) {
    await setSetting('openai.apiKey', fileSettings.openai.apiKey, 'ai', true);
    await setSetting('openai.enabled', fileSettings.openai.enabled.toString(), 'ai', false);
    await setSetting('openai.model', fileSettings.openai.model, 'ai', false);
  }
  
  // Мигрируем Google AI
  if (fileSettings.google?.apiKey) {
    await setSetting('google.apiKey', fileSettings.google.apiKey, 'ai', true);
    await setSetting('google.enabled', fileSettings.google.enabled.toString(), 'ai', false);
    await setSetting('google.model', fileSettings.google.model, 'ai', false);
  }
  
  // Мигрируем Dropbox
  if (fileSettings.dropbox?.accessToken) {
    await setSetting('dropbox.accessToken', fileSettings.dropbox.accessToken, 'storage', true);
    await setSetting('dropbox.enabled', fileSettings.dropbox.enabled.toString(), 'storage', false);
    await setSetting('dropbox.rootPath', fileSettings.dropbox.rootPath, 'storage', false);
  }
  
  // Default provider
  if (fileSettings.defaultProvider) {
    await setSetting('defaultProvider', fileSettings.defaultProvider, 'general', false);
  }
  
  console.log('✅ Settings migrated to database');
}
```

---

## 📋 Итоговая рекомендация

### Для вашего проекта:

**Рекомендация:** ⚠️ **НЕ стоит** мигрировать в БД прямо сейчас

**Причины:**
1. ✅ Текущий подход (JSON файл) работает хорошо для single-instance
2. ✅ Нет требований к аудиту или multi-user доступу
3. ✅ Простота важнее сложности
4. ✅ Можно улучшить безопасность без миграции в БД

**Что сделать вместо этого:**

1. **Для Development:**
   - Оставить `settings.json` (уже в `.gitignore`)
   - Добавить шифрование опционально

2. **Для Production:**
   - Использовать **только переменные окружения**
   - Не использовать `settings.json` вообще
   - Использовать Secrets Manager если доступен

3. **Улучшить текущий подход:**
   - Добавить шифрование файла (опционально)
   - Ограничить права доступа к файлу
   - Добавить валидацию при загрузке

### Когда стоит перейти на БД:

- Появилась необходимость в multi-instance окружении
- Появились требования к аудиту изменений
- Нужна многопользовательская система с разными токенами
- Все остальные данные уже в БД и нужна единая точка хранения

---

## 🔒 Финальная рекомендация по безопасности

```
Development:  settings.json (в .gitignore) ✅
Staging:      settings.json или БД (если нужен аудит) ✅
Production:   ТОЛЬКО переменные окружения ✅✅✅
```

**Золотое правило:** В production никогда не храните секреты в файлах или БД без шифрования. Используйте переменные окружения или Secrets Manager.

---

**Последнее обновление:** 2025-12-02

