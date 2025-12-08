import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import ReviewsModeration from '@/components/ReviewsModeration';
import WorkCard from '@/components/moderation/WorkCard';
import RejectionDialog from '@/components/moderation/RejectionDialog';
import ReviewsManagement from '@/components/moderation/ReviewsManagement';
import func2url from '../backend/func2url.json';

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
    if (!confirm('Автоматически сгенерировать 3 отзыва для ВСЕХ 490 работ? Это займет ~1 секунду.')) return;
    
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
          action: 'generate',
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

  const handleCleanupDuplicates = async () => {
    if (!confirm('Удалить все дублирующиеся отзывы (одинаковые комментарии на одной работе)?')) return;
    
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
          action: 'cleanup_duplicates'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setReviewsResult(data);
      toast({
        title: '✅ Очистка завершена!',
        description: `Удалено ${data.deleted_duplicates} дублирующихся отзывов`
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="ShieldCheck" size={24} />
            Панель модерации работ
          </CardTitle>
          <CardDescription>
            Проверка и одобрение загруженных пользователями работ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
            </div>
          ) : works.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="CheckCircle" size={48} className="mx-auto mb-4 text-green-500" />
              <p className="text-lg font-semibold">Нет работ на модерации</p>
              <p className="text-sm mt-2">Все загруженные работы проверены</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">
                  {works.length} {works.length === 1 ? 'работа' : 'работ'} на проверке
                </Badge>
              </div>

              {selectedWork && (
                <RejectionDialog
                  work={selectedWork}
                  comment={rejectionComment}
                  processing={processing}
                  onCommentChange={setRejectionComment}
                  onSubmit={handleReject}
                  onCancel={() => {
                    setSelectedWork(null);
                    setRejectionComment('');
                  }}
                />
              )}

              {works.map((work) => (
                <WorkCard
                  key={work.id}
                  work={work}
                  processing={processing}
                  onApprove={() => handleApprove(work)}
                  onReject={() => setSelectedWork(work)}
                  onDownload={() => handleDownloadWork(work)}
                  formatDate={formatDate}
                  formatFileSize={formatFileSize}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ReviewsManagement
        generatingReviews={generatingReviews}
        reviewsResult={reviewsResult}
        onGenerateReviews={handleGenerateReviews}
        onCleanupDuplicates={handleCleanupDuplicates}
      />

      <ReviewsModeration />
    </div>
  );
}
