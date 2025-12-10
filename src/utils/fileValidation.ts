/**
 * Безопасная валидация файлов перед загрузкой
 */

// Белый список расширений (КРИТИЧНО: только разрешенные типы)
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.zip', '.rar', '.7z'];

// Белый список MIME типов
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed'
];

// Максимальный размер файла (50 МБ)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Санитизация имени файла
 * Удаляет опасные символы и предотвращает path traversal
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Только безопасные символы
    .replace(/\.+/g, '.') // Убираем множественные точки
    .replace(/^\.+/, '') // Убираем точки в начале
    .replace(/\.+$/, '') // Убираем точки в конце
    .substring(0, 255); // Ограничиваем длину
}

/**
 * Валидация файла перед загрузкой
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Проверка размера
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Файл слишком большой. Максимальный размер 50 МБ'
    };
  }

  // Проверка расширения
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Недопустимый тип файла. Разрешены только: ${ALLOWED_EXTENSIONS.join(', ')}`
    };
  }

  // Проверка MIME типа
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Недопустимый тип файла. Пожалуйста, загрузите документ в формате PDF, Word или архив.'
    };
  }

  // Проверка на path traversal в имени
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return {
      valid: false,
      error: 'Недопустимое имя файла'
    };
  }

  return { valid: true };
}

/**
 * Валидация magic bytes файла (первые байты файла)
 * Дополнительная проверка, что файл действительно того типа, что заявлен
 */
export async function validateFileMagicBytes(file: File): Promise<boolean> {
  const buffer = await file.slice(0, 4).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  // PDF
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return true;
  }
  
  // ZIP (и DOCX - это ZIP архив)
  if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
    return true;
  }
  
  // RAR
  if (bytes[0] === 0x52 && bytes[1] === 0x61 && bytes[2] === 0x72 && bytes[3] === 0x21) {
    return true;
  }
  
  // DOC (старый формат)
  if (bytes[0] === 0xD0 && bytes[1] === 0xCF && bytes[2] === 0x11 && bytes[3] === 0xE0) {
    return true;
  }
  
  // 7z
  if (bytes[0] === 0x37 && bytes[1] === 0x7A && bytes[2] === 0xBC && bytes[3] === 0xAF) {
    return true;
  }
  
  return false;
}
