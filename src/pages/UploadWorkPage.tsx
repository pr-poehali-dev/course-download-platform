import { useState } from 'react';
import { authService } from '@/lib/auth';
import func2url from '../../backend/func2url.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { optimizeAndEncodeImage, validateImage } from '@/utils/imageOptimization';
import { validateFile, sanitizeFilename, validateFileMagicBytes } from '@/utils/fileValidation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function UploadWorkPage() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast({
          title: 'Ошибка',
          description: validation.error,
          variant: 'destructive'
        });
        e.target.value = '';
        return;
      }

      const magicBytesValid = await validateFileMagicBytes(file);
      if (!magicBytesValid) {
        toast({
          title: 'Ошибка',
          description: 'Файл поврежден или имеет неверный формат',
          variant: 'destructive'
        });
        e.target.value = '';
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

    handleSubmit();
  };

  const handleSubmit = async () => {
    setUploading(true);

    try {
      const user = await authService.verify();
      if (!user) {
        toast({
          title: 'Ошибка',
          description: 'Необходимо войти в систему',
          variant: 'destructive'
        });
        navigate('/login');
        return;
      }

      let fileBase64 = '';
      if (formData.file) {
        fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(formData.file!);
        });
      }

      const uploadUrl = func2url['upload-work'];
      const safeFileName = sanitizeFilename(formData.file?.name || 'work.docx');
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(user.id)
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: parseInt(formData.price),
          authorId: user.id,
          fileName: safeFileName,
          file: fileBase64
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки');
      }

      const data = await response.json();
      
      setUploading(false);
      toast({
        title: 'Работа загружена!',
        description: 'Работа отправлена на модерацию. Вы получите уведомление о результатах.'
      });
      navigate('/profile');
    } catch (error) {
      setUploading(false);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить работу',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Breadcrumbs />
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
              <div className="space-y-3">
                <Label htmlFor="file" className="text-base font-semibold">
                  Файл работы <span className="text-destructive">*</span>
                </Label>
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-10 text-center hover:border-primary/60 transition-colors bg-gradient-to-b from-primary/5 to-transparent">
                  <input
                    id="file"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.dwg,.cdw,.frw,.max,.spw,.kompas,.a3d,.m3d,.rar,.zip,.7z"
                    onChange={handleFileChange}
                    required
                  />
                  {formData.file ? (
                    <label htmlFor="file" className="cursor-pointer block">
                      <div className="bg-green-50 w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center">
                        <Icon name="FileCheck" size={48} className="text-green-600" />
                      </div>
                      <p className="text-xl font-bold mb-2 text-foreground">{formData.file.name}</p>
                      <p className="text-base text-muted-foreground mb-4 font-medium">
                        {(formData.file.size / 1024 / 1024).toFixed(2)} МБ
                      </p>
                      <Button type="button" variant="outline" size="lg" className="mt-2">
                        <Icon name="RefreshCw" size={18} className="mr-2" />
                        Выбрать другой файл
                      </Button>
                    </label>
                  ) : (
                    <label htmlFor="file" className="cursor-pointer block group">
                      <div className="bg-primary/10 w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon name="Upload" size={48} className="text-primary" />
                      </div>
                      <p className="text-2xl font-bold mb-2 text-foreground">Нажмите для выбора файла</p>
                      <p className="text-lg text-muted-foreground mb-5 font-medium">
                        или перетащите файл сюда
                      </p>
                      <div className="bg-muted/40 rounded-lg p-5 max-w-lg mx-auto">
                        <p className="text-sm text-muted-foreground mb-2 font-medium">
                          📎 Поддерживаемые форматы:
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, DWG, CDW, FRW, MAX, SPW, KOMPAS, A3D, M3D, RAR, ZIP, 7Z
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          ✓ Максимальный размер файла: 50 МБ
                        </p>
                      </div>
                    </label>
                  )}
                </div>
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
                <p>После модерации вы получите 90% от каждой продажи (комиссия платформы 10%)</p>
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

              <Button type="submit" className="w-full" size="lg" disabled={uploading}>
                {uploading ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="Upload" size={18} className="mr-2" />
                    Отправить на модерацию
                  </>
                )}
              </Button>
            </CardContent>
          </Card>



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