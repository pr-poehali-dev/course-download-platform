import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { authService } from '@/lib/auth';
import func2url from '../../backend/func2url.json';
import ReviewForm from './reviews/ReviewForm';
import ReviewCard from './reviews/ReviewCard';

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

export default function ReviewsSection({ workId, isPurchased: initialIsPurchased, isAdmin = false }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isPurchased, setIsPurchased] = useState(initialIsPurchased);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

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

  useEffect(() => {
    setIsPurchased(initialIsPurchased);
  }, [initialIsPurchased]);

  const recheckPurchaseStatus = async () => {
    if (!currentUserId || !workId) return false;
    
    try {
      const response = await fetch(`${func2url['user-data']}?user_id=${currentUserId}&action=purchases`);
      const data = await response.json();
      if (data.purchases) {
        const purchased = data.purchases.some((p: any) => String(p.id) === String(workId));
        setIsPurchased(purchased);
        return purchased;
      }
    } catch (error) {
      console.error('Error checking purchase status:', error);
    }
    return false;
  };

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

    const actuallyPurchased = await recheckPurchaseStatus();
    
    if (!actuallyPurchased) {
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

      fetch(func2url['work-stats'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ work_id: parseInt(workId), action: 'review' })
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
          'X-Admin-Token': 'admin_secret_token_2024',
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

  const startEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const cancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment('');
  };

  const handleUpdateReview = async (reviewId: number) => {
    if (editComment.trim().length < 10) {
      toast({
        title: 'Ошибка',
        description: 'Отзыв должен содержать минимум 10 символов',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`${func2url.reviews}?action=update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'admin_secret_token_2024',
        },
        body: JSON.stringify({
          review_id: reviewId,
          rating: editRating,
          comment: editComment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка обновления отзыва');
      }

      toast({
        title: 'Отзыв обновлен',
        description: 'Изменения успешно сохранены',
      });

      setEditingReviewId(null);
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
          <Button onClick={async () => {
            await recheckPurchaseStatus();
            setShowForm(true);
          }}>
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
        <ReviewForm
          rating={rating}
          comment={comment}
          submitting={submitting}
          onRatingChange={setRating}
          onCommentChange={setComment}
          onSubmit={handleSubmitReview}
          onCancel={() => {
            setShowForm(false);
            setComment('');
            setRating(5);
          }}
        />
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Загрузка отзывов...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Пока нет отзывов. {isPurchased && 'Будьте первым!'}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isCurrentUser={review.user_id === currentUserId}
              isAdmin={isAdmin}
              isEditing={editingReviewId === review.id}
              editRating={editRating}
              editComment={editComment}
              onEdit={() => startEditReview(review)}
              onDelete={() => handleDeleteReview(review.id)}
              onCancelEdit={cancelEdit}
              onUpdateReview={() => handleUpdateReview(review.id)}
              onEditRatingChange={setEditRating}
              onEditCommentChange={setEditComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}