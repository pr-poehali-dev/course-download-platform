import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import StarRating from './StarRating';

interface ReviewFormProps {
  rating: number;
  comment: string;
  submitting: boolean;
  onRatingChange: (rating: number) => void;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function ReviewForm({
  rating,
  comment,
  submitting,
  onRatingChange,
  onCommentChange,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Оставить отзыв</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Оценка</label>
          <StarRating rating={rating} onRatingChange={onRatingChange} interactive />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ваш отзыв</label>
          <Textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Поделитесь вашим опытом использования этой работы..."
            rows={4}
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? 'Отправка...' : 'Опубликовать отзыв'}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={submitting}>
            Отмена
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
