import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../backend/func2url.json';

const WORK_TYPES = [
  'Курсовая работа',
  'Дипломная работа',
  'Практическая работа',
  'Чертеж',
  'Реферат',
  'Эссе',
  'Лабораторная работа'
];

interface WorkManagerProps {
  adminEmail: string;
  onWorkAdded?: () => void;
}

export default function WorkManager({ adminEmail, onWorkAdded }: WorkManagerProps) {
  const [formData, setFormData] = useState({
    title: '',
    work_type: '',
    subject: '',
    description: '',
    composition: '',
    price_points: ''
  });
  
  const [files, setFiles] = useState<string[]>([]);
  const [currentFileUrl, setCurrentFileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmAuthorship, setConfirmAuthorship] = useState(false);

  const handleAddFile = () => {
    if (currentFileUrl.trim()) {
      setFiles([...files, currentFileUrl.trim()]);
      setCurrentFileUrl('');
      toast({
        title: 'Файл добавлен',
        description: 'Изображение добавлено в список'
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.work_type || !formData.subject || 
        !formData.description || !formData.price_points) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    if (!confirmAuthorship) {
      toast({
        title: 'Подтвердите авторство',
        description: 'Необходимо подтвердить, что вы являетесь автором работы',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(func2url.works, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': adminEmail
        },
        body: JSON.stringify({
          ...formData,
          price_points: parseInt(formData.price_points),
          files: files
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Работа добавлена! 🎉',
          description: 'Работа успешно опубликована в каталоге'
        });
        
        setFormData({
          title: '',
          work_type: '',
          subject: '',
          description: '',
          composition: '',
          price_points: ''
        });
        setFiles([]);
        setConfirmAuthorship(false);
        
        if (onWorkAdded) {
          onWorkAdded();
        }
      } else {
        throw new Error(data.error || 'Ошибка при добавлении работы');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось добавить работу',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Plus" size={24} className="text-primary" />
          Добавить новую работу
        </CardTitle>
        <CardDescription>
          Заполните информацию о работе для публикации в каталоге
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название работы *</Label>
              <Input
                id="title"
                placeholder="Анализ рынка криптовалют 2024"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="work_type">Тип работы *</Label>
              <Select value={formData.work_type} onValueChange={(value) => setFormData({...formData, work_type: value})}>
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
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Стоимость (баллы) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="150"
                value={formData.price_points}
                onChange={(e) => setFormData({...formData, price_points: e.target.value})}
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
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="composition">Состав и содержание</Label>
            <Textarea
              id="composition"
              placeholder="Введение, 3 главы, заключение, список литературы (30 источников), приложения..."
              rows={3}
              value={formData.composition}
              onChange={(e) => setFormData({...formData, composition: e.target.value})}
            />
          </div>

          <div className="space-y-4">
            <Label>Изображения работы (JPG/PNG)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/image.jpg или путь к файлу"
                value={currentFileUrl}
                onChange={(e) => setCurrentFileUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFile())}
              />
              <Button type="button" onClick={handleAddFile} variant="outline">
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить
              </Button>
            </div>

            {files.length > 0 && (
              <div className="grid grid-cols-1 gap-2 mt-4">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    <Icon name="Image" size={20} className="text-primary" />
                    <span className="flex-1 text-sm truncate">{file}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <Icon name="Trash2" size={16} className="text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 py-2 px-4 bg-primary/5 rounded-lg border border-primary/20">
            <input
              type="checkbox"
              id="authorship-checkbox"
              checked={confirmAuthorship}
              onChange={(e) => setConfirmAuthorship(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="authorship-checkbox" className="text-sm leading-tight">
              Я подтверждаю, что являюсь автором этой работы и несу ответственность за её содержание согласно{' '}
              <a href="/terms-of-service" target="_blank" className="text-primary hover:underline font-medium">
                Пользовательскому соглашению
              </a>
            </label>
          </div>

          <Button type="submit" className="w-full h-12 text-lg gradient-purple-blue" disabled={loading}>
            {loading ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Добавление...
              </>
            ) : (
              <>
                <Icon name="Upload" size={20} className="mr-2" />
                Опубликовать работу
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}