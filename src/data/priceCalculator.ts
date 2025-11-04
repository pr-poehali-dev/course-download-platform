export interface WorkType {
  value: string;
  label: string;
  basePrice: number;
  icon: string;
}

export interface Subject {
  value: string;
  label: string;
  coefficient: number;
}

export interface UrgencyOption {
  value: string;
  label: string;
  days: number;
  coefficient: number;
}

export const WORK_TYPES: WorkType[] = [
  { value: 'referat', label: 'Реферат', basePrice: 200, icon: 'FileText' },
  { value: 'control', label: 'Контрольная работа', basePrice: 200, icon: 'ClipboardCheck' },
  { value: 'lab', label: 'Лабораторная работа', basePrice: 200, icon: 'FlaskConical' },
  { value: 'practice', label: 'Отчёт по практике', basePrice: 200, icon: 'Briefcase' },
  { value: 'report', label: 'Отчёт', basePrice: 200, icon: 'FileBarChart' },
  { value: 'coursework', label: 'Курсовая работа', basePrice: 600, icon: 'BookOpen' },
  { value: 'diploma', label: 'Дипломная работа', basePrice: 1500, icon: 'GraduationCap' },
  { value: 'dissertation', label: 'Диссертация', basePrice: 3000, icon: 'Award' },
];

export const SUBJECTS: Subject[] = [
  { value: 'math', label: 'Математика', coefficient: 1.2 },
  { value: 'physics', label: 'Физика', coefficient: 1.2 },
  { value: 'chemistry', label: 'Химия', coefficient: 1.15 },
  { value: 'programming', label: 'Программирование', coefficient: 1.3 },
  { value: 'economics', label: 'Экономика', coefficient: 1.1 },
  { value: 'law', label: 'Право', coefficient: 1.15 },
  { value: 'medicine', label: 'Медицина', coefficient: 1.25 },
  { value: 'engineering', label: 'Инженерия', coefficient: 1.2 },
  { value: 'languages', label: 'Иностранные языки', coefficient: 1.0 },
  { value: 'history', label: 'История', coefficient: 1.0 },
  { value: 'literature', label: 'Литература', coefficient: 1.0 },
  { value: 'psychology', label: 'Психология', coefficient: 1.05 },
  { value: 'sociology', label: 'Социология', coefficient: 1.05 },
  { value: 'philosophy', label: 'Философия', coefficient: 1.0 },
  { value: 'other', label: 'Другое', coefficient: 1.0 },
];

export const URGENCY_OPTIONS: UrgencyOption[] = [
  { value: 'urgent', label: 'Срочно (1-2 дня)', days: 2, coefficient: 2.0 },
  { value: 'fast', label: 'Быстро (3-5 дней)', days: 5, coefficient: 1.5 },
  { value: 'normal', label: 'Обычно (7-10 дней)', days: 10, coefficient: 1.0 },
  { value: 'slow', label: 'Не спешу (14+ дней)', days: 14, coefficient: 0.9 },
];

export interface CalculatorFormData {
  workType: string;
  subject: string;
  pages: number;
  urgency: string;
  originality: number;
  withPresentation: boolean;
  withEdits: boolean;
}

export const DEFAULT_FORM_DATA: CalculatorFormData = {
  workType: 'coursework',
  subject: 'other',
  pages: 30,
  urgency: 'normal',
  originality: 70,
  withPresentation: false,
  withEdits: false,
};

export function calculatePrice(formData: CalculatorFormData): {
  basePrice: number;
  subjectMultiplier: number;
  urgencyMultiplier: number;
  pagesMultiplier: number;
  presentationPrice: number;
  editsPrice: number;
  totalPrice: number;
  deadline: string;
  availableAuthors: number;
} {
  const workType = WORK_TYPES.find(w => w.value === formData.workType);
  const subject = SUBJECTS.find(s => s.value === formData.subject);
  const urgency = URGENCY_OPTIONS.find(u => u.value === formData.urgency);

  if (!workType || !subject || !urgency) {
    throw new Error('Invalid form data');
  }

  const basePrice = workType.basePrice;
  
  const pagesCoefficient = formData.pages / 30;
  const subjectMultiplier = subject.coefficient;
  const urgencyMultiplier = urgency.coefficient;
  
  const originalityCoefficient = formData.originality >= 80 ? 1.2 : 
                                  formData.originality >= 70 ? 1.0 : 0.9;

  const presentationPrice = formData.withPresentation ? 300 : 0;
  const editsPrice = formData.withEdits ? 150 : 0;

  const calculatedPrice = basePrice * pagesCoefficient * subjectMultiplier * 
                          urgencyMultiplier * originalityCoefficient;
  
  const totalPrice = Math.round(calculatedPrice + presentationPrice + editsPrice);

  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + urgency.days);
  const deadline = deadlineDate.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long' 
  });

  const availableAuthors = Math.floor(Math.random() * 20) + 15;

  return {
    basePrice: Math.round(basePrice * pagesCoefficient),
    subjectMultiplier: subject.coefficient,
    urgencyMultiplier: urgency.coefficient,
    pagesMultiplier: pagesCoefficient,
    presentationPrice,
    editsPrice,
    totalPrice,
    deadline,
    availableAuthors,
  };
}
