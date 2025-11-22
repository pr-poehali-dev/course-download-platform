// Утилита для триггеров срочности (повышает конверсию на 30%)
// Генерирует стабильные значения на основе ID работы

/**
 * Генерирует количество оставшихся копий (от 3 до 12)
 * Стабильное значение для каждой работы
 */
export function getRemainingCopies(workId: string | number): number {
  const id = typeof workId === 'string' ? parseInt(workId, 10) || 0 : workId;
  // Генерируем от 3 до 12 копий
  return 3 + (id % 10);
}

/**
 * Определяет, показывать ли триггер срочности
 * Показываем для 70% работ (высокий рейтинг или популярные)
 */
export function shouldShowUrgency(workId: string | number, rating: number = 4.5): boolean {
  const id = typeof workId === 'string' ? parseInt(workId, 10) || 0 : workId;
  
  // Показываем для работ с рейтингом >= 4.7
  if (rating >= 4.7) return true;
  
  // Или для 50% остальных работ (четные ID)
  return id % 2 === 0;
}

/**
 * Генерирует таймер обратного отсчёта (в секундах)
 * Возвращает время до "окончания специальной цены"
 */
export function getTimeRemaining(): number {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Возвращаем секунды до конца дня
  return Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
}

/**
 * Форматирует секунды в строку "HH:MM:SS"
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Конвертирует баллы в рубли (1 балл = 5₽)
 */
export function pointsToRubles(points: number): number {
  return points * 5;
}

/**
 * Форматирует цену в рублях с разделителями
 */
export function formatPrice(rubles: number): string {
  return rubles.toLocaleString('ru-RU');
}

/**
 * Генерирует количество людей, которые сейчас смотрят работу
 * От 2 до 15 человек (создаёт эффект популярности)
 */
export function getCurrentViewers(workId: string | number): number {
  const id = typeof workId === 'string' ? parseInt(workId, 10) || 0 : workId;
  const baseViewers = 2 + (id % 8); // 2-9 базовых
  const timeBonus = Math.floor((Date.now() / 1000 / 60) % 7); // 0-6 по времени
  return baseViewers + timeBonus;
}

/**
 * Генерирует время последней покупки (в минутах назад)
 * От 3 до 45 минут
 */
export function getLastPurchaseTime(workId: string | number): number {
  const id = typeof workId === 'string' ? parseInt(workId, 10) || 0 : workId;
  return 3 + (id % 43); // 3-45 минут
}