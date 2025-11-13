// Фейковые авторы для отображения в карточках (не хранятся в БД)
const AUTHORS = [
  'techmaster2024',
  'engineer_pro',
  'diplom_king',
  'study_helper',
  'coursework_ace',
  'science_guru',
  'project_ninja',
  'research_star',
  'academic_hero',
  'student_saver',
  'work_expert',
  'thesis_wizard',
  'tech_genius',
  'smart_student',
  'grade_master',
  'knowledge_hub',
  'project_legend',
  'study_boss',
  'diploma_creator',
  'work_champion',
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