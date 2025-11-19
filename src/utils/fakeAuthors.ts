// Фейковые авторы для отображения в карточках (не хранятся в БД)
const AUTHORS = [
  'alexkor',
  'maksimov',
  'daria.kim',
  'ivan.tech',
  'marinaev',
  'dmitriy.pro',
  'katya.study',
  'sergeywork',
  'anna.lux',
  'romantech',
  'yulia.smile',
  'nikita.dev',
  'oksana.go',
  'artem.max',
  'victoria.top',
  'denispro',
  'elena.brain',
  'igor.master',
  'svetlana.edu',
  'andrey.smart',
  'olga.work',
  'vadim.expert',
  'natasha.lab',
  'pavel.genius',
  'alina.study',
  'evgeny.code',
  'kristina.web',
  'anton.tech',
  'julia.work',
  'mikhail.pro',
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