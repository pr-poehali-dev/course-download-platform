// Фейковые авторы для отображения в карточках (не хранятся в БД)
const AUTHORS = [
  'Александр К.',
  'Мария П.',
  'Дмитрий С.',
  'Анна В.',
  'Иван М.',
  'Елена Р.',
  'Сергей Н.',
  'Ольга Л.',
  'Михаил Д.',
  'Татьяна Ф.',
  'Андрей Б.',
  'Наталья К.',
  'Павел Г.',
  'Виктория Ш.',
  'Алексей Ж.',
  'Юлия З.',
  'Николай П.',
  'Екатерина М.',
  'Владимир С.',
  'Ирина Ч.',
];

// Генерируем "стабильного" автора на основе ID работы
export function getFakeAuthor(workId: string | number): string {
  const id = typeof workId === 'string' ? parseInt(workId, 10) || 0 : workId;
  const index = id % AUTHORS.length;
  return AUTHORS[index];
}

// Генерируем количество просмотров (начинается с 0, увеличивается при каждом заходе)
export function getViewCount(workId: string | number): number {
  const storageKey = `views_${workId}`;
  const stored = localStorage.getItem(storageKey);
  const currentCount = stored ? parseInt(stored, 10) : 0;
  return currentCount;
}

// Увеличиваем счетчик просмотров
export function incrementViewCount(workId: string | number): number {
  const storageKey = `views_${workId}`;
  const currentCount = getViewCount(workId);
  const newCount = currentCount + 1;
  localStorage.setItem(storageKey, newCount.toString());
  return newCount;
}
