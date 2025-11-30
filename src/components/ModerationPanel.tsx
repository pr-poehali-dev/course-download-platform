import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import ReviewsModeration from '@/components/ReviewsModeration';
import func2url from '../../backend/func2url.json';

interface UploadedWork {
  id: number;
  user_id: number;
  title: string;
  work_type: string;
  subject: string;
  description: string;
  price_points: number;
  file_name: string;
  file_size: number;
  moderation_status: 'pending' | 'approved' | 'rejected';
  moderation_comment?: string;
  created_at: string;
}

export default function ModerationPanel() {
  const [works, setWorks] = useState<UploadedWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<UploadedWork | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [processing, setProcessing] = useState(false);
  const [generatingReviews, setGeneratingReviews] = useState(false);
  const [reviewsResult, setReviewsResult] = useState<any>(null);

  useEffect(() => {
    loadPendingWorks();
  }, []);

  const loadPendingWorks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${func2url.works}?status=pending`);
      const data = await response.json();
      
      if (data.works) {
        setWorks(data.works.map((w: any) => ({
          id: w.id,
          user_id: w.author_id,
          title: w.title,
          work_type: w.work_type,
          subject: w.subject,
          description: w.description,
          price_points: w.price_points,
          file_name: w.file_url || 'work.rar',
          file_size: 0,
          moderation_status: w.status,
          moderation_comment: null,
          created_at: w.created_at
        })));
      }
    } catch (error) {
      console.error('Error loading works:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (work: UploadedWork) => {
    if (!confirm(`Одобрить работу "${work.title}"? Она будет опубликована в каталоге.`)) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(func2url.works, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': 'rekrutiw@yandex.ru'
        },
        body: JSON.stringify({
          work_id: work.id,
          status: 'approved'
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Работа одобрена',
          description: 'Работа опубликована в каталоге'
        });
        loadPendingWorks();
      } else {
        throw new Error(result.error || 'Ошибка одобрения');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWork) return;
    
    if (!rejectionComment.trim()) {
      toast({
        title: 'Укажите причину',
        description: 'Необходимо указать причину отклонения',
        variant: 'destructive'
      });
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(func2url.works, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': 'rekrutiw@yandex.ru'
        },
        body: JSON.stringify({
          work_id: selectedWork.id,
          status: 'rejected',
          rejection_reason: rejectionComment
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Работа отклонена',
          description: 'Автору отправлено уведомление на почту'
        });
        setSelectedWork(null);
        setRejectionComment('');
        loadPendingWorks();
      } else {
        throw new Error(result.error || 'Ошибка отклонения');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' МБ';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadWork = async (work: UploadedWork) => {
    try {
      const adminUser = localStorage.getItem('user');
      if (!adminUser) {
        toast({
          title: '❌ Ошибка',
          description: 'Необходима авторизация администратора',
          variant: 'destructive'
        });
        return;
      }

      const adminData = JSON.parse(adminUser);
      const adminUserId = adminData.id;

      toast({
        title: 'Скачивание...',
        description: 'Загружаем файл для проверки'
      });

      const response = await fetch(
        `${func2url['download-work']}?workId=${work.id}`,
        {
          headers: {
            'X-User-Id': String(adminUserId)
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось получить ссылку на скачивание');
      }

      const data = await response.json();

      if (!data.download_url) {
        throw new Error('Файл не найден');
      }

      const fileResponse = await fetch(data.download_url);
      const blob = await fileResponse.blob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename || work.file_name || `${work.title}.rar`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: '✅ Файл скачан',
        description: `${data.filename || work.file_name} сохранён в папку "Загрузки"`
      });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: '❌ Ошибка скачивания',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleGenerateReviews = async () => {
    if (!confirm('Автоматически сгенерировать 3 отзыва для ВСЕХ 490 работ? Это займет ~20-30 секунд.')) return;
    
    setGeneratingReviews(true);
    setReviewsResult(null);

    try {
      const response = await fetch(func2url['auto-generate-reviews'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'admin_secret_token_2024'
        },
        body: JSON.stringify({
          reviews_per_work: 3
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setReviewsResult(data);
      toast({
        title: '✅ Генерация завершена!',
        description: `Создано ${data.total_reviews_created} отзывов для ${data.processed_works} работ (пропущено ${data.skipped_works})`
      });
    } catch (err: any) {
      toast({
        title: '❌ Ошибка',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setGeneratingReviews(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Icon name="Loader2" size={48} className="mx-auto text-muted-foreground mb-4 animate-spin" />
            <p className="text-muted-foreground">Загрузка работ...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedWork) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Отклонение работы</CardTitle>
              <CardDescription>{selectedWork.title}</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSelectedWork(null);
                setRejectionComment('');
              }}
            >
              <Icon name="X" size={18} className="mr-2" />
              Отмена
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rejection-comment">Причина отклонения <span className="text-red-500">*</span></Label>
            <Textarea 
              id="rejection-comment"
              placeholder="Опишите причину отклонения работы. Это сообщение будет отправлено автору на email."
              rows={6}
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Email автора будет отправлен автоматически с указанной причиной
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              className="flex-1"
              disabled={processing || !rejectionComment.trim()}
              onClick={handleReject}
            >
              {processing ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Icon name="XCircle" size={18} className="mr-2" />
                  Отклонить и отправить уведомление
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold">Работы на модерации</h3>
          <p className="text-sm text-muted-foreground">
            Проверьте и одобрите или отклоните загруженные работы
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleGenerateReviews}
            disabled={generatingReviews}
            variant="outline"
            size="sm"
          >
            {generatingReviews ? (
              <>
                <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                Генерация...
              </>
            ) : (
              <>
                <Icon name="MessageSquare" className="mr-2" size={16} />
                Сгенерировать отзывы
              </>
            )}
          </Button>
          <Badge variant="secondary">{works.length} работ</Badge>
        </div>
      </div>

      {reviewsResult && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Icon name="CheckCircle" className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm space-y-1">
                <p className="font-semibold text-green-900">Отзывы успешно сгенерированы!</p>
                <p className="text-green-800">✅ Создано отзывов: {reviewsResult.total_reviews_created}</p>
                <p className="text-green-800">✅ Обработано работ: {reviewsResult.processed_works}</p>
                <p className="text-green-700">ℹ️ Пропущено: {reviewsResult.skipped_works}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {works.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Icon name="CheckCircle" size={48} className="mx-auto text-green-600 mb-4" />
              <p className="text-muted-foreground">Нет работ, ожидающих модерации</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        works.map((work) => (
          <Card key={work.id}>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-base">{work.title}</CardTitle>
                    <Badge>На модерации</Badge>
                  </div>
                  <CardDescription className="space-y-2">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Icon name="BookOpen" size={14} />
                        {work.work_type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="GraduationCap" size={14} />
                        {work.subject}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Coins" size={14} />
                        {work.price_points} баллов
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="FileText" size={14} />
                        {work.file_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="HardDrive" size={14} />
                        {formatFileSize(work.file_size)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Icon name="Clock" size={12} />
                      Загружено: {formatDate(work.created_at)}
                    </div>
                    <p className="text-sm mt-2">{work.description}</p>
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownloadWork(work)}
                  >
                    <Icon name="Download" size={14} className="mr-2" />
                    Скачать файл
                  </Button>
                  <Button 
                    size="sm" 
                    variant="default"
                    disabled={processing}
                    onClick={() => handleApprove(work)}
                  >
                    <Icon name="CheckCircle" size={14} className="mr-2" />
                    Одобрить
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    disabled={processing}
                    onClick={() => setSelectedWork(work)}
                  >
                    <Icon name="XCircle" size={14} className="mr-2" />
                    Отклонить
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))
      )}
      
      <div className="mt-8">
        <ReviewsModeration />
      </div>
    </div>
  );
}