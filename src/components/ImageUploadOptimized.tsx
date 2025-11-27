import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { optimizeAndEncodeImage, validateImage } from '@/utils/imageOptimization';
import { toast } from '@/components/ui/use-toast';

interface ImageUploadOptimizedProps {
  onImageSelect: (base64: string, fileName: string) => void;
  label?: string;
  accept?: string;
  maxSize?: number; // в МБ
  required?: boolean;
  currentImage?: string | null;
}

export default function ImageUploadOptimized({
  onImageSelect,
  label = 'Загрузить изображение',
  accept = 'image/jpeg,image/png,image/webp',
  maxSize = 10,
  required = false,
  currentImage
}: ImageUploadOptimizedProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [optimizationInfo, setOptimizationInfo] = useState<{
    originalSize: number;
    optimizedSize: number;
    savings: number;
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Валидация изображения
      const validation = await validateImage(file, {
        maxSize: maxSize * 1024 * 1024,
        allowedFormats: accept.split(',').map(ext => {
          if (ext.includes('jpeg')) return 'image/jpeg';
          if (ext.includes('png')) return 'image/png';
          if (ext.includes('webp')) return 'image/webp';
          if (ext.includes('gif')) return 'image/gif';
          return ext;
        }),
        minWidth: 200,
        minHeight: 200
      });

      if (!validation.valid) {
        toast({
          title: 'Ошибка',
          description: validation.error,
          variant: 'destructive'
        });
        setUploading(false);
        return;
      }

      const originalSize = file.size;

      // Оптимизация изображения
      const { base64, size: optimizedSize } = await optimizeAndEncodeImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        format: 'webp'
      });

      const savings = ((originalSize - optimizedSize) / originalSize) * 100;

      setOptimizationInfo({
        originalSize,
        optimizedSize,
        savings
      });

      // Создаём preview
      const previewUrl = `data:image/webp;base64,${base64}`;
      setPreview(previewUrl);

      // Отправляем оптимизированное изображение
      onImageSelect(base64, file.name.replace(/\.[^.]+$/, '.webp'));

      toast({
        title: 'Изображение оптимизировано!',
        description: `Размер уменьшен на ${savings.toFixed(0)}% (${formatSize(originalSize)} → ${formatSize(optimizedSize)})`,
        duration: 3000
      });
    } catch (error) {
      console.error('Image optimization error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обработать изображение',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
  };

  const handleRemove = () => {
    setPreview(null);
    setOptimizationInfo(null);
    onImageSelect('', '');
  };

  return (
    <div className="space-y-3">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>

      {preview ? (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto max-h-96 object-contain"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <Icon name="Trash2" size={16} className="mr-1" />
              Удалить
            </Button>
          </div>

          {optimizationInfo && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900">Изображение оптимизировано</p>
                  <p className="text-green-700 mt-1">
                    Экономия {optimizationInfo.savings.toFixed(0)}%: {formatSize(optimizationInfo.originalSize)} → {formatSize(optimizationInfo.optimizedSize)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
          <input
            type="file"
            id="image-upload"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            required={required}
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            {uploading ? (
              <>
                <Icon name="Loader2" size={48} className="text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Оптимизация изображения...</p>
              </>
            ) : (
              <>
                <Icon name="Upload" size={48} className="text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Нажмите для загрузки</p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG или WebP до {maxSize} МБ
                  </p>
                  <p className="text-xs text-green-600 font-medium mt-2">
                    ✓ Автоматическое сжатие и оптимизация
                  </p>
                </div>
              </>
            )}
          </label>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Изображения автоматически конвертируются в WebP для быстрой загрузки
      </p>
    </div>
  );
}
