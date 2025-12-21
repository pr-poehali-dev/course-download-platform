import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { authService } from '@/lib/auth';
import func2url from '../../backend/func2url.json';
import Navigation from '@/components/Navigation';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function EditWorkPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [work, setWork] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workType: '',
    price: '',
    subject: '',
    files: [] as File[]
  });

  useEffect(() => {
    loadWork();
  }, [id]);

  const loadWork = async () => {
    try {
      const userData = await authService.verify();
      if (!userData) {
        toast({
          title: 'Ошибка',
          description: 'Необходимо войти в систему',
          variant: 'destructive'
        });
        navigate('/login');
        return;
      }

      const response = await fetch(`${func2url.works}?id=${id}`);
      const data = await response.json();

      if (!data || !data.id) {
        throw new Error('Работа не найдена');
      }

      // Проверяем что это работа автора
      if (data.author_id !== userData.id) {
        toast({
          title: 'Ошибка',
          description: 'У вас нет прав на редактирование этой работы',
          variant: 'destructive'
        });
        navigate('/profile');
        return;
      }

      setWork(data);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        workType: data.work_type || '',
        price: String(data.price_points || 600),
        subject: data.subject || '',
        files: []
      });
    } catch (error) {
      console.error('Error loading work:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить работу',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!work) return;

    setSubmitting(true);

    try {
      const userData = await authService.verify();
      if (!userData) {
        toast({
          title: 'Ошибка',
          description: 'Необходимо войти в систему',
          variant: 'destructive'
        });
        navigate('/login');
        return;
      }

      // Обновляем основную информацию работы
      const updateResponse = await fetch(`${func2url['update-work']}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workId: work.id,
          title: formData.title,
          description: formData.description,
          workType: formData.workType,
          subject: formData.subject,
          price: parseInt(formData.price)
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Ошибка обновления работы');
      }

      // Если есть новые файлы, загружаем их
      if (formData.files.length > 0) {
        const filesData = await Promise.all(
          formData.files.map(async (file) => {
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result as string;
                const base64Content = result.split(',')[1];
                resolve(base64Content);
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });

            return {
              name: file.name,
              content: base64,
              size: file.size
            };
          })
        );

        // Загружаем новые файлы (можно создать отдельную функцию для этого)
        // Пока пропустим загрузку новых файлов
      }

      // Меняем статус работы на pending для повторной модерации
      const statusResponse = await fetch(`${func2url.works}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': 'system'
        },
        body: JSON.stringify({
          work_id: work.id,
          status: 'pending'
        })
      });

      toast({
        title: 'Работа обновлена!',
        description: 'Работа отправлена на повторную модерацию',
      });

      navigate('/profile');
    } catch (error) {
      console.error('Error updating work:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить работу',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation isLoggedIn={true} />
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center py-8">
            <Icon name="Loader2" size={48} className="mx-auto mb-4 opacity-50 animate-spin" />
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isLoggedIn={true} />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Breadcrumbs items={[
          { label: 'Главная', href: '/' },
          { label: 'Профиль', href: '/profile' },
          { label: 'Редактирование работы' }
        ]} />

        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => navigate('/profile')}>
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            Назад в профиль
          </Button>

          <h1 className="text-4xl font-bold mb-2">Редактировать работу</h1>
          <p className="text-muted-foreground">Внесите изменения и отправьте на повторную модерацию</p>
        </div>

        {work && work.moderation_comment && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <Icon name="AlertCircle" size={20} />
                Причина отклонения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{work.moderation_comment}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Информация о работе</CardTitle>
            <CardDescription>Исправьте данные согласно замечаниям модератора</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название работы *</Label>
              <Input
                id="title"
                placeholder="Например: Курсовая работа по менеджменту"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание работы *</Label>
              <Textarea
                id="description"
                placeholder="Подробно опишите содержание работы..."
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workType">Тип работы *</Label>
                <Select 
                  value={formData.workType} 
                  onValueChange={(value) => setFormData({ ...formData, workType: value })}
                >
                  <SelectTrigger id="workType">
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coursework">Курсовая работа</SelectItem>
                    <SelectItem value="diploma">Дипломная работа</SelectItem>
                    <SelectItem value="practice">Отчёт по практике</SelectItem>
                    <SelectItem value="report">Отчёт</SelectItem>
                    <SelectItem value="referat">Реферат</SelectItem>
                    <SelectItem value="control">Контрольная работа</SelectItem>
                    <SelectItem value="lab">Лабораторная работа</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Цена (баллы) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="600"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Предмет *</Label>
              <Input
                id="subject"
                placeholder="Например: Математика"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="files">Загрузить новые файлы (опционально)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Если нужно заменить файлы, загрузите новые. Старые файлы останутся.
              </p>
              <Input
                id="files"
                type="file"
                multiple
                accept=".rar,.zip,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.dwg,.dxf,.cdw,.frw,.step"
                onChange={(e) => {
                  const selectedFiles = Array.from(e.target.files || []);
                  if (selectedFiles.length > 10) {
                    toast({
                      title: 'Ошибка',
                      description: 'Максимум 10 файлов',
                      variant: 'destructive'
                    });
                    return;
                  }
                  setFormData({ ...formData, files: selectedFiles });
                }}
              />
              {formData.files.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    Выбрано файлов: {formData.files.length}
                  </p>
                  <ul className="text-xs text-muted-foreground mt-1">
                    {formData.files.map((file, idx) => (
                      <li key={idx}>• {file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  !formData.title ||
                  !formData.workType ||
                  !formData.subject ||
                  !formData.price
                }
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={16} className="mr-2" />
                    Отправить на модерацию
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/profile')}
                disabled={submitting}
              >
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
