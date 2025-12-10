/**
 * Утилиты безопасности для защиты от атак
 */

/**
 * Хеширование security answer перед отправкой на сервер
 * Предотвращает передачу plaintext через сеть
 */
export async function hashSecurityAnswer(answer: string): Promise<string> {
  const normalized = answer.toLowerCase().trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Генерация CSRF токена для защиты форм
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Сохранение CSRF токена в sessionStorage
 */
export function setCSRFToken(token: string): void {
  sessionStorage.setItem('csrf_token', token);
}

/**
 * Получение CSRF токена из sessionStorage
 */
export function getCSRFToken(): string | null {
  return sessionStorage.getItem('csrf_token');
}

/**
 * Валидация CSRF токена
 */
export function validateCSRFToken(token: string): boolean {
  const storedToken = getCSRFToken();
  return storedToken === token;
}

/**
 * Санитизация HTML для предотвращения XSS
 */
export function sanitizeHTML(html: string): string {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

/**
 * Безопасное парсинг JSON с защитой от prototype pollution
 */
export function safeJSONParse<T>(json: string): T | null {
  try {
    const parsed = JSON.parse(json);
    // Проверяем на __proto__ и prototype pollution
    if (parsed && typeof parsed === 'object') {
      delete parsed.__proto__;
      delete parsed.constructor;
      delete parsed.prototype;
    }
    return parsed as T;
  } catch {
    return null;
  }
}

/**
 * Rate limiting на клиенте
 * Предотвращает спам запросов
 */
const requestTimestamps = new Map<string, number[]>();

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = requestTimestamps.get(key) || [];
  
  // Убираем старые запросы
  const recentTimestamps = timestamps.filter(ts => now - ts < windowMs);
  
  if (recentTimestamps.length >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  recentTimestamps.push(now);
  requestTimestamps.set(key, recentTimestamps);
  return true;
}

/**
 * Очистка чувствительных данных из консоли в production
 */
export function disableConsoleInProduction(): void {
  if (import.meta.env.PROD) {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    // Оставляем console.error и console.warn для критических ошибок
  }
}

// Автоматически отключаем console в production при импорте
if (import.meta.env.PROD) {
  disableConsoleInProduction();
}
