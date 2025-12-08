import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

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

interface RejectionDialogProps {
  work: UploadedWork;
  comment: string;
  processing: boolean;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function RejectionDialog({
  work,
  comment,
  processing,
  onCommentChange,
  onSubmit,
  onCancel
}: RejectionDialogProps) {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Icon name="AlertTriangle" size={20} />
          Отклонение работы
        </CardTitle>
        <CardDescription>
          Работа: <strong>{work.title}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="rejection-comment">
            Причина отклонения (будет отправлена автору на почту)
          </Label>
          <Textarea
            id="rejection-comment"
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Опишите, что необходимо исправить..."
            rows={4}
            className="mt-2"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onSubmit}
            disabled={processing || !comment.trim()}
            variant="destructive"
          >
            {processing ? 'Отклонение...' : 'Отклонить работу'}
          </Button>
          <Button
            onClick={onCancel}
            disabled={processing}
            variant="outline"
          >
            Отмена
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
