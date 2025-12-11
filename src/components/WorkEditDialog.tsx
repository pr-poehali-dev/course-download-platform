import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import PreviewUploader from '@/components/PreviewUploader';
import CoverImagesUploader from '@/components/CoverImagesUploader';
import CompositionEditor from '@/components/CompositionEditor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Work {
  id: number;
  title: string;
  description: string;
  preview_image_url?: string;
  cover_images?: string[];
  composition?: string;
  category: string;
  price_points: number;
  author?: string;
  downloads?: number;
  status?: 'active' | 'moderation' | 'blocked';
  yandex_disk_link?: string;
}

interface WorkEditDialogProps {
  work: Work | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onWorkChange: (work: Work) => void;
}

export default function WorkEditDialog({
  work,
  open,
  onOpenChange,
  onSave,
  onWorkChange
}: WorkEditDialogProps) {
  if (!work) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактирование работы</DialogTitle>
          <DialogDescription>
            Внесите изменения в работу "{work.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Название</Label>
            <Input
              id="edit-title"
              value={work.title}
              onChange={(e) => onWorkChange({ ...work, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Описание</Label>
            <Textarea
              id="edit-description"
              value={work.description}
              onChange={(e) => onWorkChange({ ...work, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category">Категория</Label>
              <Select
                value={work.category}
                onValueChange={(value) => onWorkChange({ ...work, category: value })}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Чертежи">Чертежи</SelectItem>
                  <SelectItem value="3D-модели">3D-модели</SelectItem>
                  <SelectItem value="Расчёты">Расчёты</SelectItem>
                  <SelectItem value="Проекты">Проекты</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Цена (баллы)</Label>
              <Input
                id="edit-price"
                type="number"
                value={work.price_points}
                onChange={(e) => onWorkChange({ ...work, price_points: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Статус</Label>
            <Select
              value={work.status || 'active'}
              onValueChange={(value) => onWorkChange({ ...work, status: value as 'active' | 'moderation' | 'blocked' })}
            >
              <SelectTrigger id="edit-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Активна</SelectItem>
                <SelectItem value="moderation">На модерации</SelectItem>
                <SelectItem value="blocked">Заблокирована</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-yandex-link">Ссылка на Яндекс.Диск</Label>
            <Input
              id="edit-yandex-link"
              value={work.yandex_disk_link || ''}
              onChange={(e) => onWorkChange({ ...work, yandex_disk_link: e.target.value })}
              placeholder="https://disk.yandex.ru/..."
            />
          </div>

          <div className="space-y-2">
            <Label>Превью (главное изображение)</Label>
            <PreviewUploader
              onUploadSuccess={(url) => onWorkChange({ ...work, preview_image_url: url })}
              currentPreview={work.preview_image_url}
            />
          </div>

          <div className="space-y-2">
            <Label>Обложки (дополнительные изображения)</Label>
            <CoverImagesUploader
              onUploadSuccess={(urls) => onWorkChange({ ...work, cover_images: urls })}
              currentCovers={work.cover_images || []}
            />
          </div>

          <div className="space-y-2">
            <Label>Состав работы</Label>
            <CompositionEditor
              value={work.composition || ''}
              onChange={(value) => onWorkChange({ ...work, composition: value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSave}>
            Сохранить изменения
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
