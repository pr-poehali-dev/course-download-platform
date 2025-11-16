import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import ReviewsModeration from '@/components/ReviewsModeration';

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

  useEffect(() => {
    loadPendingWorks();
  }, []);

  const loadPendingWorks = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/bca1c84a-e7e6-4b4c-8b15-85a8f319e0b0/pending', {
        headers: { 'X-Admin': 'true' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorks(data.works || []);
      }
    } catch (error) {
      console.error('Error loading works:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить работы на модерации',
        variant: 'destructive'
      });
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
      const response = await fetch('https://functions.poehali.dev/bca1c84a-e7e6-4b4c-8b15-85a8f319e0b0/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin': 'true'
        },
        body: JSON.stringify({
          workId: work.id,
          action: 'approve'
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
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
      const response = await fetch('https://functions.poehali.dev/bca1c84a-e7e6-4b4c-8b15-85a8f319e0b0/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin': 'true'
        },
        body: JSON.stringify({
          workId: selectedWork.id,
          action: 'reject',
          comment: rejectionComment
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Работы на модерации</h3>
          <p className="text-sm text-muted-foreground">
            Проверьте и одобрите или отклоните загруженные работы
          </p>
        </div>
        <Badge variant="secondary">{works.length} работ</Badge>
      </div>

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
                <div className="flex gap-2">
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