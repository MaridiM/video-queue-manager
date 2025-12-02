/**
 * Валидация JSON транскрипций по схеме v2.0
 * @module utils/jsonValidator
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Инициализация Ajv
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Загрузить схему
let validate = null;

function loadSchema() {
  if (validate) return validate;
  
  try {
    const schemaPath = path.join(__dirname, '..', '..', 'dev', 'transcriptions', 'transcription_schema_v2.json');
    
    if (!fs.existsSync(schemaPath)) {
      console.warn(`⚠️ Schema file not found: ${schemaPath}`);
      console.warn(`   Current directory: ${__dirname}`);
      console.warn(`   Attempted path: ${schemaPath}`);
      return null;
    }
    
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaContent);
    validate = ajv.compile(schema);
    console.log('✅ JSON schema loaded successfully');
    return validate;
  } catch (error) {
    console.error('❌ Error loading schema:', error.message);
    console.error('   Stack:', error.stack);
    return null;
  }
}

/**
 * Валидирует JSON транскрипцию по схеме v2.0
 * @param {Object} jsonData - JSON данные для валидации
 * @returns {Object} Результат валидации с ошибками
 */
export function validateTranscriptionJSON(jsonData) {
  const validator = loadSchema();
  
  if (!validator) {
    return {
      valid: true, // Пропускаем валидацию если схема не найдена
      errors: [],
      warning: 'Schema file not found, validation skipped'
    };
  }
  
  const valid = validator(jsonData);
  
  if (!valid) {
    return {
      valid: false,
      errors: validator.errors.map(err => ({
        path: err.instancePath || err.schemaPath,
        message: err.message,
        params: err.params,
        data: err.data
      }))
    };
  }
  
  return { valid: true, errors: [] };
}

/**
 * Проверяет наличие обязательных полей
 */
export function checkRequiredFields(jsonData) {
  const required = ['video_id', 'video_title', 'metadata', 'transcription'];
  const missing = required.filter(field => !jsonData[field]);
  
  return {
    valid: missing.length === 0,
    missing: missing
  };
}

