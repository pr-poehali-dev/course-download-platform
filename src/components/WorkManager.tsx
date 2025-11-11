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
  const [coverImages, setCoverImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

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

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const isValid = file.type === 'image/jpeg' || file.type === 'image/png';
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      if (!isValid) {
        toast({
          title: 'Неверный формат',
          description: `${file.name} - разрешены только JPG/PNG`,
          variant: 'destructive'
        });
      }
      if (!isValidSize) {
        toast({
          title: 'Файл слишком большой',
          description: `${file.name} превышает 5MB`,
          variant: 'destructive'
        });
      }
      return isValid && isValidSize;
    });
    
    if (coverImages.length + validFiles.length > 3) {
      toast({
        title: 'Слишком много файлов',
        description: 'Максимум 3 обложки',
        variant: 'destructive'
      });
      return;
    }
    
    setCoverImages([...coverImages, ...validFiles]);
  };

  const handlePreviewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const isValid = file.type === 'image/jpeg' || file.type === 'image/png';
      const isValidSize = file.size <= 5 * 1024 * 1024;
      if (!isValid) {
        toast({
          title: 'Неверный формат',
          description: `${file.name} - разрешены только JPG/PNG`,
          variant: 'destructive'
        });
      }
      if (!isValidSize) {
        toast({
          title: 'Файл слишком большой',
          description: `${file.name} превышает 5MB`,
          variant: 'destructive'
        });
      }
      return isValid && isValidSize;
    });
    
    if (previewImages.length + validFiles.length > 5) {
      toast({
        title: 'Слишком много файлов',
        description: 'Максимум 5 страниц содержания',
        variant: 'destructive'
      });
      return;
    }
    
    setPreviewImages([...previewImages, ...validFiles]);
  };

  const removeCoverImage = (index: number) => {
    setCoverImages(coverImages.filter((_, i) => i !== index));
  };

  const removePreviewImage = (index: number) => {
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<{coverUrls: string[], previewUrls: string[]}> => {
    const coverUrls: string[] = [];
    const previewUrls: string[] = [];

    // Upload cover images
    for (const file of coverImages) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const response = await fetch(func2url['upload-work-cover'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          filename: file.name
        })
      });

      const data = await response.json();
      if (data.url) {
        coverUrls.push(data.url);
      }
    }

    // Upload preview images
    for (const file of previewImages) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const response = await fetch(func2url['upload-preview'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          filename: file.name
        })
      });

      const data = await response.json();
      if (data.url) {
        previewUrls.push(data.url);
      }
    }

    return { coverUrls, previewUrls };
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
    setUploading(true);

    try {
      // Upload images first
      const { coverUrls, previewUrls } = await uploadImages();
      
      // Combine uploaded URLs with manual URLs
      const allFiles = [...files, ...coverUrls];
      const allPreviews = previewUrls;

      const response = await fetch(func2url.works, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': adminEmail
        },
        body: JSON.stringify({
          ...formData,
          price_points: parseInt(formData.price_points),
          files: allFiles,
          preview_urls: allPreviews
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
        setCoverImages([]);
        setPreviewImages([]);
        setConfirmAuthorship(false);
        setUploading(false);
        
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
      setUploading(false);
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

          <div className="space-y-6">
            {/* Обложки чертежей */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Обложки чертежей (JPG/PNG)</Label>
              <p className="text-sm text-muted-foreground">Загрузите скриншоты чертежей работы (до 3 файлов, макс. 5MB каждый)</p>
              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => document.getElementById('cover-upload')?.click()}
                  className="w-full"
                >
                  <Icon name="Upload" size={18} className="mr-2" />
                  Выбрать обложки
                </Button>
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={handleCoverImageSelect}
                  className="hidden"
                />
              </div>
              {coverImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {coverImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Cover ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-primary/20"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeCoverImage(index)}
                      >
                        <Icon name="X" size={14} />
                      </Button>
                      <p className="text-xs text-center mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Превью содержания */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Превью содержания ПЗ (JPG/PNG)</Label>
              <p className="text-sm text-muted-foreground">Загрузите скриншоты страниц пояснительной записки (до 5 файлов, макс. 5MB каждый)</p>
              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => document.getElementById('preview-upload')?.click()}
                  className="w-full"
                >
                  <Icon name="FileText" size={18} className="mr-2" />
                  Выбрать страницы содержания
                </Button>
                <input
                  id="preview-upload"
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={handlePreviewImageSelect}
                  className="hidden"
                />
              </div>
              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {previewImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-blue-500/20"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePreviewImage(index)}
                      >
                        <Icon name="X" size={14} />
                      </Button>
                      <p className="text-xs text-center mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Дополнительные URL (опционально) */}
            <div className="space-y-3">
              <Label>Дополнительные изображения (URL)</Label>
              <p className="text-sm text-muted-foreground">Опционально: добавьте ссылки на изображения</p>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
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
                      <Icon name="Link" size={20} className="text-primary" />
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

          <Button type="submit" className="w-full h-12 text-lg gradient-purple-blue" disabled={loading || uploading}>
            {loading || uploading ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                {uploading ? 'Загрузка изображений...' : 'Публикация...'}
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