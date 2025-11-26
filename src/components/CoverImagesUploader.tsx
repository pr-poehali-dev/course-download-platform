import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import func2url from '../../backend/func2url.json';

interface CoverImagesUploaderProps {
  workId: number;
  workTitle: string;
  currentImages?: string[];
  onUploadSuccess: (imageUrls: string[]) => void;
}

export default function CoverImagesUploader({ 
  workId, 
  workTitle, 
  currentImages = [], 
  onUploadSuccess 
}: CoverImagesUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > 4) {
      toast({
        title: 'Слишком много файлов',
        description: 'Можно загрузить максимум 4 изображения',
        variant: 'destructive'
      });
      return;
    }

    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidFormat = file.type === 'image/jpeg' || file.type === 'image/png';
      const isValidSize = file.size <= 5 * 1024 * 1024;

      if (!isImage || !isValidFormat) {
        toast({
          title: 'Неверный формат',
          description: `${file.name}: используйте только JPG или PNG`,
          variant: 'destructive'
        });
        return false;
      }

      if (!isValidSize) {
        toast({
          title: 'Файл слишком большой',
          description: `${file.name}: максимум 5 МБ`,
          variant: 'destructive'
        });
        return false;
      }

      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: 'Выберите файлы',
        description: 'Добавьте хотя бы одно изображение',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const base64Images = await Promise.all(
        selectedFiles.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      const response = await fetch(func2url['upload-work-cover'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': 'techforma2025admin'
        },
        body: JSON.stringify({
          work_id: workId,
          images: base64Images
        })
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      toast({
        title: 'Успешно!',
        description: `Загружено ${data.count} изображений для "${workTitle}"`
      });

      onUploadSuccess(data.image_urls);
      setSelectedFiles([]);
      setPreviewUrls([]);
      setDialogOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить изображения',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Icon name="Images" size={16} />
          Обложки ({currentImages.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Загрузить обложки для "{workTitle}"</DialogTitle>
          <DialogDescription>
            Загрузите 2-3 изображения JPG/PNG (макс. 5 МБ каждое)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {currentImages.length > 0 && (
            <div>
              <Label className="mb-2 block">Текущие обложки:</Label>
              <div className="grid grid-cols-3 gap-2">
                {currentImages.map((url, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border">
                    <img 
                      src={url} 
                      alt={`Cover ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="cover-upload" className="mb-2 block">
              Выбрать новые изображения:
            </Label>
            <div className="flex items-center gap-2">
              <input
                id="cover-upload"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('cover-upload')?.click()}
                disabled={uploading || selectedFiles.length >= 4}
              >
                <Icon name="Upload" size={16} className="mr-2" />
                Выбрать файлы ({selectedFiles.length}/4)
              </Button>
            </div>
          </div>

          {previewUrls.length > 0 && (
            <div>
              <Label className="mb-2 block">Предпросмотр ({previewUrls.length}):</Label>
              <div className="grid grid-cols-3 gap-2">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border group">
                    <img 
                      src={url} 
                      alt={`Preview ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon name="X" size={14} />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {selectedFiles[idx].name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFiles([]);
                setPreviewUrls([]);
                setDialogOpen(false);
              }}
              disabled={uploading}
            >
              Отмена
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
            >
              {uploading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <Icon name="Upload" size={16} className="mr-2" />
                  Загрузить ({selectedFiles.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}