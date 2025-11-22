import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
}

interface ReviewsSectionProps {
  workId: string | undefined;
  isPurchased: boolean;
  isAdmin?: boolean;
}

export default function ReviewsSection({ workId, isPurchased, isAdmin = false }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

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
    if (workId) {
      loadReviews();
    }
  }, [workId]);

  const loadReviews = async () => {
    try {
      const response = await fetch(`${func2url.reviews}?action=list&work_id=${workId}&status=approved`);
      const data = await response.json();
      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!currentUserId) {
      toast({
        title: 'Ошибка',
        description: 'Войдите в систему чтобы оставить отзыв',
        variant: 'destructive',
      });
      return;
    }

    if (!isPurchased) {
      toast({
        title: 'Ошибка',
        description: 'Купите работу чтобы оставить отзыв',
        variant: 'destructive',
      });
      return;
    }

    if (comment.trim().length < 10) {
      toast({
        title: 'Ошибка',
        description: 'Отзыв должен содержать минимум 10 символов',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${func2url.reviews}?action=create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          work_id: workId,
          user_id: currentUserId,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка отправки отзыва');
      }

      toast({
        title: 'Отзыв опубликован!',
        description: 'Ваш отзыв успешно добавлен',
      });

      // Отслеживаем добавление отзыва
      fetch(func2url.works, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workId: workId, activityType: 'review' })
      }).catch(err => console.error('Failed to track review:', err));

      setComment('');
      setRating(5);
      setShowForm(false);
      await loadReviews();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Удалить этот отзыв?')) return;

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
        throw new Error(data.error || 'Ошибка удаления отзыва');
      }

      toast({
        title: 'Отзыв удален',
        description: 'Отзыв успешно удален',
      });

      await loadReviews();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const userHasReviewed = reviews.some(r => r.user_id === currentUserId);

  return (
    <div className="mt-12 pb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Отзывы ({reviews.length})
        </h2>
        {currentUserId && !userHasReviewed && !showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Icon name="MessageSquare" size={18} className="mr-2" />
            Оставить отзыв
          </Button>
        )}
        {!currentUserId && !showForm && (
          <Button onClick={() => window.location.href = '/login'} variant="outline">
            <Icon name="LogIn" size={18} className="mr-2" />
            Войти чтобы оставить отзыв
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Напишите отзыв</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isPurchased && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <Icon name="Info" size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Для отзыва нужно купить работу</p>
                  <p className="text-xs text-amber-700 mt-1">Отзывы могут оставлять только покупатели. Это гарантирует честность отзывов.</p>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2">Оценка</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-all"
                    disabled={!isPurchased}
                  >
                    <Icon
                      name="Star"
                      size={32}
                      className={`${
                        star <= rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      } ${!isPurchased ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Комментарий</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Расскажите о вашем опыте с этой работой..."
                className="min-h-[120px]"
                disabled={!isPurchased}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmitReview} disabled={submitting || !isPurchased}>
                {submitting ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={18} className="mr-2" />
                    Отправить отзыв
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">
          <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto" />
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Icon name="MessageSquare" size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">Пока нет отзывов на эту работу</p>
            {currentUserId && (
              <p className="text-sm text-gray-500 mt-2">Будьте первым!</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="User" size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{review.username}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                          key={star}
                          name="Star"
                          size={16}
                          className={`${
                            star <= review.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteReview(review.id)}
                        title="Удалить отзыв"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}