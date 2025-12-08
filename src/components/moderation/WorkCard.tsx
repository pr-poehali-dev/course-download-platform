import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface WorkCardProps {
  work: UploadedWork;
  processing: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDownload: () => void;
  formatDate: (dateString: string) => string;
  formatFileSize: (bytes: number) => string;
}

export default function WorkCard({
  work,
  processing,
  onApprove,
  onReject,
  onDownload,
  formatDate,
  formatFileSize
}: WorkCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{work.title}</CardTitle>
            <CardDescription>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="outline">{work.work_type}</Badge>
                <Badge variant="outline">{work.subject}</Badge>
                <Badge variant="secondary">{work.price_points} баллов</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Загружено: {formatDate(work.created_at)}
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Описание:</p>
            <p className="text-sm">{work.description}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="FileArchive" size={16} />
            <span>{work.file_name}</span>
            {work.file_size > 0 && (
              <span>({formatFileSize(work.file_size)})</span>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={onDownload}
              variant="outline"
              size="sm"
            >
              <Icon name="Download" size={16} className="mr-2" />
              Скачать для проверки
            </Button>

            <Button
              onClick={onApprove}
              disabled={processing}
              size="sm"
              variant="default"
            >
              <Icon name="Check" size={16} className="mr-2" />
              Одобрить
            </Button>

            <Button
              onClick={onReject}
              disabled={processing}
              size="sm"
              variant="destructive"
            >
              <Icon name="X" size={16} className="mr-2" />
              Отклонить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
