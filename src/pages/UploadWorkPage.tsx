import { useState } from 'react';
import PlagiarismChecker from '@/components/PlagiarismChecker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function UploadWorkPage() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [showPlagiarismCheck, setShowPlagiarismCheck] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    file: null as File | null
  });

  const workTypes = [
    { value: 'coursework', label: 'Курсовая работа', price: 600 },
    { value: 'diploma', label: 'Дипломная работа', price: 1500 },
    { value: 'dissertation', label: 'Диссертация', price: 3000 },
    { value: 'practice', label: 'Отчёт по практике', price: 200 },
    { value: 'report', label: 'Отчёт', price: 200 },
    { value: 'referat', label: 'Реферат', price: 200 },
    { value: 'control', label: 'Контрольная работа', price: 200 },
    { value: 'lab', label: 'Лабораторная работа', price: 200 },
    { value: 'other', label: 'Другое', price: 600 }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: 'Ошибка',
          description: 'Файл слишком большой. Максимальный размер 50 МБ',
          variant: 'destructive'
        });
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  const handleCheckBeforeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category || !formData.price || !formData.file) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    setShowPlagiarismCheck(true);
  };

  const handleSubmit = async () => {
    if (!plagiarismResult) {
      toast({
        title: 'Ошибка',
        description: 'Сначала проверьте работу на уникальность',
        variant: 'destructive'
      });
      return;
    }

    if (plagiarismResult.status === 'rejected') {
      toast({
        title: 'Низкая уникальность',
        description: 'Работа не может быть опубликована из-за плагиата',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    setTimeout(() => {
      setUploading(false);
      toast({
        title: 'Работа загружена!',
        description: `Уникальность: ${plagiarismResult.uniqueness_percent.toFixed(1)}%. Работа отправлена на модерацию.`
      });
      navigate('/profile');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" asChild>
            <Link to="/profile">
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Назад в профиль
            </Link>
          </Button>

          <h1 className="text-4xl font-bold mb-2">Загрузить работу</h1>
          <p className="text-muted-foreground">Поделитесь своей работой и получайте баллы для покупок</p>
        </div>

        <form onSubmit={handleCheckBeforeSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Информация о работе</CardTitle>
              <CardDescription>Заполните все поля для успешной публикации</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Название работы <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Например: Курсовая работа по менеджменту"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Описание работы <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Подробно опишите содержание работы, тему, объем и другие важные детали..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Чем подробнее описание, тем больше шансов на продажу
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Тип работы <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => {
                      const selectedType = workTypes.find(t => t.value === value);
                      setFormData({ 
                        ...formData, 
                        category: value,
                        price: selectedType ? selectedType.price.toString() : formData.price
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип работы" />
                    </SelectTrigger>
                    <SelectContent>
                      {workTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label} ({type.price} баллов)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Цена установится автоматически
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">
                    Цена в баллах <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="50"
                    max="5000"
                    placeholder="600"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Рекомендуемая цена автоматически подставлена
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Загрузка файла</CardTitle>
              <CardDescription>Выберите файл с вашей работой</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">
                  Файл работы <span className="text-destructive">*</span>
                </Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    id="file"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={handleFileChange}
                    required
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <Icon name="Upload" size={48} className="mx-auto mb-4 text-muted-foreground" />
                    {formData.file ? (
                      <div>
                        <p className="font-semibold mb-1">{formData.file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(formData.file.size / 1024 / 1024).toFixed(2)} МБ
                        </p>
                        <Button type="button" variant="link" size="sm" className="mt-2">
                          Выбрать другой файл
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold mb-1">Нажмите для выбора файла</p>
                        <p className="text-sm text-muted-foreground">
                          или перетащите файл сюда
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Поддерживаемые форматы: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
                  <br />
                  Максимальный размер файла: 50 МБ
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Info" size={20} className="text-blue-500" />
                Правила публикации
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex gap-2">
                <Icon name="CheckCircle2" size={16} className="text-green-600 mt-0.5" />
                <p>Работа должна быть вашей собственной или иметь права на распространение</p>
              </div>
              <div className="flex gap-2">
                <Icon name="CheckCircle2" size={16} className="text-green-600 mt-0.5" />
                <p>Запрещено публиковать работы с плагиатом или нарушающие авторские права</p>
              </div>
              <div className="flex gap-2">
                <Icon name="CheckCircle2" size={16} className="text-green-600 mt-0.5" />
                <p>Описание должно соответствовать содержанию работы</p>
              </div>
              <div className="flex gap-2">
                <Icon name="CheckCircle2" size={16} className="text-green-600 mt-0.5" />
                <p>После модерации вы получите 85% от каждой продажи</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Комиссия платформы: 15%</h3>
                  <p className="text-sm text-muted-foreground">
                    Вы получите: {formData.price ? Math.round(parseInt(formData.price) * 0.85) : '—'} баллов с каждой продажи
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    {formData.price ? Math.round(parseInt(formData.price) * 0.85) : '—'}
                  </p>
                  <p className="text-sm text-muted-foreground">баллов за продажу</p>
                </div>
              </div>

              {!showPlagiarismCheck ? (
                <Button type="submit" className="w-full" size="lg">
                  <Icon name="Shield" size={18} className="mr-2" />
                  Проверить на плагиат
                </Button>
              ) : (
                <Button 
                  type="button" 
                  className="w-full" 
                  size="lg" 
                  disabled={uploading || !plagiarismResult}
                  onClick={handleSubmit}
                >
                  {uploading ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Icon name="Upload" size={18} className="mr-2" />
                      Загрузить работу на модерацию
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {showPlagiarismCheck && (
            <PlagiarismChecker
              textContent={formData.description}
              onCheckComplete={(result) => setPlagiarismResult(result)}
            />
          )}

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Нажимая кнопку, вы соглашаетесь с{' '}
              <Link to="/terms-of-service" className="underline">
                правилами публикации
              </Link>{' '}
              и{' '}
              <Link to="/usage-rules" className="underline">
                условиями использования
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}