import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface WorkFile {
  id: number;
  file_url: string;
  file_name: string;
  file_size: number;
}

interface PendingWork {
  id: number;
  title: string;
  work_type: string;
  subject: string;
  description: string;
  price_points: number;
  author_id: number;
  created_at: string;
  files: WorkFile[];
}

export default function ModerationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [works, setWorks] = useState<PendingWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Проверка прав админа (в реальности нужна проверка через backend)
  const isAdmin = localStorage.getItem('userRole') === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: 'Доступ запрещён',
        description: 'Только администраторы могут просматривать эту страницу',
        variant: 'destructive'
      });
      navigate('/');
      return;
    }
    loadPendingWorks();
  }, [isAdmin, navigate]);

  const loadPendingWorks = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/a16a43fc-fa7d-4c72-ad15-ba566d2c7413?status=pending');
      const data = await response.json();
      
      if (data.success && data.works) {
        // Загружаем файлы для каждой работы
        const worksWithFiles = await Promise.all(
          data.works.map(async (work: any) => {
            try {
              const filesResponse = await fetch(
                `https://functions.poehali.dev/ec3bbe78-f975-4ae0-9b3f-3a3fc67dd7d1?work_id=${work.id}`
              );
              const filesData = await filesResponse.json();
              return {
                ...work,
                files: filesData.success ? filesData.files : []
              };
            } catch (error) {
              console.error(`Error loading files for work ${work.id}:`, error);
              return { ...work, files: [] };
            }
          })
        );
        setWorks(worksWithFiles);
      }
    } catch (error) {
      console.error('Error loading pending works:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить работы на модерации',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (workId: number) => {
    setProcessingId(workId);
    try {
      const response = await fetch('https://functions.poehali.dev/9d85e209-9c59-4f2b-8577-9abe1ee3c9bd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workId,
          status: 'approved'
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Работа опубликована',
          description: 'Работа появится в каталоге'
        });
        loadPendingWorks();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось опубликовать работу',
        variant: 'destructive'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (workId: number) => {
    const reason = prompt('Укажите причину отклонения:');
    if (!reason) return;

    setProcessingId(workId);
    try {
      const response = await fetch('https://functions.poehali.dev/9d85e209-9c59-4f2b-8577-9abe1ee3c9bd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workId,
          status: 'rejected'
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Работа отклонена',
          description: 'Автор получит уведомление'
        });
        loadPendingWorks();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отклонить работу',
        variant: 'destructive'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const downloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center py-20">
            <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin opacity-50" />
            <p className="text-muted-foreground">Загрузка работ...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Назад в каталог
          </Button>
          <h1 className="text-4xl font-bold mb-2">Модерация работ</h1>
          <p className="text-muted-foreground">Работ на проверке: {works.length}</p>
        </div>

        {works.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="CheckCircle" size={48} className="mx-auto mb-4 text-green-500 opacity-50" />
              <p className="text-lg font-medium mb-2">Все работы проверены</p>
              <p className="text-muted-foreground">Нет работ, ожидающих модерации</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {works.map((work) => (
              <Card key={work.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{work.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="secondary">{work.work_type}</Badge>
                        <Badge variant="outline">{work.subject}</Badge>
                        <Badge variant="outline">{work.price_points} баллов</Badge>
                      </div>
                      <CardDescription>
                        Автор ID: {work.author_id} • Добавлено: {new Date(work.created_at).toLocaleDateString('ru-RU')}
                      </CardDescription>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      На модерации
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {work.description && (
                    <div>
                      <h3 className="font-semibold mb-2">Описание:</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{work.description}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-3">Файлы работы ({work.files.length}):</h3>
                    <div className="space-y-2">
                      {work.files.map((file) => (
                        <div key={file.id} className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
                          <Icon name="File" size={24} className="text-primary" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{file.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.file_size / 1024 / 1024).toFixed(2)} МБ
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadFile(file.file_url, file.file_name)}
                          >
                            <Icon name="Download" size={16} className="mr-2" />
                            Скачать
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleApprove(work.id)}
                      disabled={processingId === work.id}
                      className="flex-1"
                    >
                      {processingId === work.id ? (
                        <>
                          <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                          Обработка...
                        </>
                      ) : (
                        <>
                          <Icon name="CheckCircle" size={16} className="mr-2" />
                          Опубликовать
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(work.id)}
                      disabled={processingId === work.id}
                      className="flex-1"
                    >
                      <Icon name="XCircle" size={16} className="mr-2" />
                      Отклонить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}