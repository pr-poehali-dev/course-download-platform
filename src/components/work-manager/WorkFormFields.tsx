import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const WORK_TYPES = [
  'Курсовая работа',
  'Дипломная работа',
  'Практическая работа',
  'Чертеж',
  'Реферат',
  'Эссе',
  'Лабораторная работа'
];

interface WorkFormFieldsProps {
  formData: {
    title: string;
    work_type: string;
    subject: string;
    description: string;
    composition: string;
    price_points: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function WorkFormFields({ formData, onChange }: WorkFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Название работы *</Label>
          <Input
            id="title"
            placeholder="Анализ рынка криптовалют 2025"
            value={formData.title}
            onChange={(e) => onChange('title', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="work_type">Тип работы *</Label>
          <Select value={formData.work_type} onValueChange={(value) => onChange('work_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              {WORK_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Предмет/Дисциплина *</Label>
          <Input
            id="subject"
            placeholder="Экономика"
            value={formData.subject}
            onChange={(e) => onChange('subject', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Стоимость (баллы) *</Label>
          <Input
            id="price"
            type="number"
            placeholder="150"
            value={formData.price_points}
            onChange={(e) => onChange('price_points', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание работы *</Label>
        <Textarea
          id="description"
          placeholder="Подробное описание содержания работы, о чем она, какие темы раскрыты..."
          rows={4}
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="composition">Состав и содержание</Label>
        <Textarea
          id="composition"
          placeholder="Введение, 3 главы, заключение, список литературы (30 источников), приложения..."
          rows={3}
          value={formData.composition}
          onChange={(e) => onChange('composition', e.target.value)}
        />
      </div>
    </>
  );
}
