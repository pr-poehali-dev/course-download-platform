import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../backend/func2url.json';

interface PreviewUploaderProps {
  workId: number;
  workTitle: string;
  currentPreviewUrl?: string;
  onUploadSuccess?: (newPreviewUrl: string) => void;
}

export default function PreviewUploader({ workId, workTitle, currentPreviewUrl, onUploadSuccess }: PreviewUploaderProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Фильтруем только изображения
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Выберите изображения (JPG, PNG)',
        variant: 'destructive'
      });
      return;
    }

    if (imageFiles.length > 3) {
      toast({
        title: 'Слишком много файлов',
        description: 'Максимум 3 изображения',
        variant: 'destructive'
      });
      return;
    }

    setSelectedFiles(imageFiles);

    // Создаем превью для отображения
    const urls = imageFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Выберите хотя бы одно изображение',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      // Конвертируем изображения в base64
      const uploadPromises = selectedFiles.map(async (file, index) => {
        return new Promise<{file: string, filename: string}>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({
              file: base64,
              filename: `preview_${workId}_${index}.${file.type.split('/')[1]}`
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const base64Images = await Promise.all(uploadPromises);

      // Отправляем на бэкенд для загрузки в S3
      const response = await fetch(func2url['upload-preview'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          work_id: workId,
          images: base64Images
        })
      });

      const data = await response.json();

      if (data.success && data.preview_url) {
        toast({
          title: 'Превью загружено!',
          description: `Превью для "${workTitle}" успешно загружено`
        });

        // Вызываем callback для обновления UI
        if (onUploadSuccess) {
          onUploadSuccess(data.preview_url);
        }

        // Закрываем диалог
        setOpen(false);
        setSelectedFiles([]);
        setPreviewUrls([]);
      } else {
        throw new Error(data.error || 'Не удалось загрузить превью');
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Ошибка загрузки',
        description: error.message || 'Не удалось загрузить превью',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={currentPreviewUrl ? "outline" : "default"} 
          size="sm"
          className="gap-2"
        >
          <Icon name={currentPreviewUrl ? "RefreshCw" : "Upload"} size={16} />
          {currentPreviewUrl ? "Обновить превью" : "Загрузить превью"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Загрузка превью для работы</DialogTitle>
          <DialogDescription>
            {workTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Текущее превью */}
          {currentPreviewUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Текущее превью:</p>
              <img 
                src={currentPreviewUrl} 
                alt="Current preview" 
                className="w-full max-h-48 object-contain border rounded"
              />
            </div>
          )}

          {/* Выбор файлов */}
          <div className="space-y-2">
            <label htmlFor={`file-upload-${workId}`} className="text-sm font-medium">
              Выберите изображения (2-3 штуки):
            </label>
            <input
              id={`file-upload-${workId}`}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              multiple
              onChange={handleFileSelect}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90
                cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Поддерживаются JPG, PNG. Максимум 3 файла.
            </p>
          </div>

          {/* Превью выбранных файлов */}
          {previewUrls.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Выбрано изображений: {previewUrls.length}</p>
              <div className="grid grid-cols-3 gap-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={url} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-32 object-cover border rounded"
                    />
                    <span className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setSelectedFiles([]);
                setPreviewUrls([]);
              }}
              disabled={uploading}
            >
              Отмена
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="gap-2"
            >
              {uploading ? (
                <>
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <Icon name="Upload" size={16} />
                  Загрузить
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}