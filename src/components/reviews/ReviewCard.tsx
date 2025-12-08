import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import StarRating from './StarRating';

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

interface ReviewCardProps {
  review: Review;
  isCurrentUser: boolean;
  isAdmin: boolean;
  isEditing: boolean;
  editRating: number;
  editComment: string;
  onEdit: () => void;
  onDelete: () => void;
  onCancelEdit: () => void;
  onUpdateReview: () => void;
  onEditRatingChange: (rating: number) => void;
  onEditCommentChange: (comment: string) => void;
}

export default function ReviewCard({
  review,
  isCurrentUser,
  isAdmin,
  isEditing,
  editRating,
  editComment,
  onEdit,
  onDelete,
  onCancelEdit,
  onUpdateReview,
  onEditRatingChange,
  onEditCommentChange,
}: ReviewCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{review.username}</span>
              {review.status === 'pending' && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  На модерации
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <StarRating
                  rating={editRating}
                  onRatingChange={onEditRatingChange}
                  interactive
                  size={18}
                />
              ) : (
                <StarRating rating={review.rating} size={18} />
              )}
              <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
            </div>
          </div>

          {(isCurrentUser || isAdmin) && (
            <div className="flex gap-2">
              {!isEditing && (
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  <Icon name="Edit" size={16} />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editComment}
              onChange={(e) => onEditCommentChange(e.target.value)}
              rows={4}
              className="w-full"
            />
            <div className="flex gap-2">
              <Button onClick={onUpdateReview} size="sm">
                Сохранить
              </Button>
              <Button variant="outline" onClick={onCancelEdit} size="sm">
                Отмена
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
        )}
      </CardContent>
    </Card>
  );
}
