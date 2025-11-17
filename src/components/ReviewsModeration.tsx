import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { authService } from '@/lib/auth';
import func2url from '../../backend/func2url.json';

interface Review {
  id: number;
  work_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  status: string;
  username: string;
  work_title?: string;
}

export default function ReviewsModeration() {
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.verify();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    loadReviews();
  }, [filterStatus]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${func2url.reviews}?action=list&status=${filterStatus}`);
      const data = await response.json();
      if (data.reviews) {
        setAllReviews(data.reviews);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить отзывы',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (reviewId: number, newStatus: 'approved' | 'rejected') => {
    if (!currentUserId) {
      toast({
        title: 'Ошибка',
        description: 'Требуется авторизация',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(`${func2url.reviews}?action=moderate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(currentUserId),
        },
        body: JSON.stringify({
          review_id: reviewId,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка модерации');
      }

      toast({
        title: 'Успешно',
        description: `Отзыв ${newStatus === 'approved' ? 'одобрен' : 'отклонён'}`,
      });

      await loadReviews();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!currentUserId) {
      toast({
        title: 'Ошибка',
        description: 'Требуется авторизация',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(`${func2url.reviews}?action=delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(currentUserId),
        },
        body: JSON.stringify({ review_id: reviewId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка удаления');
      }

      toast({
        title: 'Успешно',
        description: 'Отзыв удалён',
      });

      await loadReviews();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  const pendingReviews = allReviews.filter(r => r.status === 'pending');
  const approvedReviews = allReviews.filter(r => r.status === 'approved');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Управление отзывами</h3>
          <p className="text-sm text-muted-foreground">
            Просмотр и модерация отзывов пользователей
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            Все ({allReviews.length})
          </Button>
          <Button
            variant={filterStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('pending')}
          >
            На модерации ({pendingReviews.length})
          </Button>
          <Button
            variant={filterStatus === 'approved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('approved')}
          >
            Одобрены ({approvedReviews.length})
          </Button>
        </div>
      </div>

      {allReviews.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Icon name="MessageSquare" size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">Нет отзывов</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {allReviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{review.username}</CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex flex-col gap-1">
                        {review.work_title && (
                          <span className="flex items-center gap-1">
                            <Icon name="FileText" size={14} />
                            Работа: {review.work_title}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Icon name="Clock" size={14} />
                          {new Date(review.created_at).toLocaleString('ru-RU')}
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.status === 'pending' && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        На модерации
                      </Badge>
                    )}
                    {review.status === 'approved' && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Одобрен
                      </Badge>
                    )}
                    {review.status === 'rejected' && (
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        Отклонён
                      </Badge>
                    )}
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                      {review.rating}/5
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">{review.comment}</p>
                </div>
                
                <div className="flex gap-2">
                  {review.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="default"
                        disabled={processing}
                        onClick={() => handleModerate(review.id, 'approved')}
                      >
                        <Icon name="CheckCircle" size={16} className="mr-2" />
                        Одобрить
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        disabled={processing}
                        onClick={() => handleModerate(review.id, 'rejected')}
                      >
                        <Icon name="XCircle" size={16} className="mr-2" />
                        Отклонить
                      </Button>
                    </>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={processing}
                    onClick={() => handleDelete(review.id)}
                  >
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Удалить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}