import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

interface WorkImageUploaderProps {
  coverImages: File[];
  previewImages: File[];
  onCoverImagesChange: (files: File[]) => void;
  onPreviewImagesChange: (files: File[]) => void;
}

export default function WorkImageUploader({
  coverImages,
  previewImages,
  onCoverImagesChange,
  onPreviewImagesChange
}: WorkImageUploaderProps) {
  
  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const isValid = file.type === 'image/jpeg' || file.type === 'image/png';
      const isValidSize = file.size <= 5 * 1024 * 1024;
      if (!isValid) {
        toast({
          title: 'Неверный формат',
          description: `${file.name} - разрешены только JPG/PNG`,
          variant: 'destructive'
        });
      }
      if (!isValidSize) {
        toast({
          title: 'Файл слишком большой',
          description: `${file.name} превышает 5MB`,
          variant: 'destructive'
        });
      }
      return isValid && isValidSize;
    });
    
    if (coverImages.length + validFiles.length > 3) {
      toast({
        title: 'Слишком много файлов',
        description: 'Максимум 3 обложки',
        variant: 'destructive'
      });
      return;
    }
    
    onCoverImagesChange([...coverImages, ...validFiles]);
  };

  const handlePreviewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const isValid = file.type === 'image/jpeg' || file.type === 'image/png';
      const isValidSize = file.size <= 5 * 1024 * 1024;
      if (!isValid) {
        toast({
          title: 'Неверный формат',
          description: `${file.name} - разрешены только JPG/PNG`,
          variant: 'destructive'
        });
      }
      if (!isValidSize) {
        toast({
          title: 'Файл слишком большой',
          description: `${file.name} превышает 5MB`,
          variant: 'destructive'
        });
      }
      return isValid && isValidSize;
    });
    
    if (previewImages.length + validFiles.length > 5) {
      toast({
        title: 'Слишком много файлов',
        description: 'Максимум 5 страниц содержания',
        variant: 'destructive'
      });
      return;
    }
    
    onPreviewImagesChange([...previewImages, ...validFiles]);
  };

  const removeCoverImage = (index: number) => {
    onCoverImagesChange(coverImages.filter((_, i) => i !== index));
  };

  const removePreviewImage = (index: number) => {
    onPreviewImagesChange(previewImages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base font-semibold">Обложки чертежей (JPG/PNG)</Label>
        <p className="text-sm text-muted-foreground">Загрузите скриншоты чертежей работы (до 3 файлов, макс. 5MB каждый)</p>
        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => document.getElementById('cover-upload')?.click()}
            className="w-full"
          >
            <Icon name="Upload" size={18} className="mr-2" />
            Выбрать обложки
          </Button>
          <input
            id="cover-upload"
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleCoverImageSelect}
            className="hidden"
          />
        </div>
        {coverImages.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {coverImages.map((file, index) => (
              <div key={index} className="relative group">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={`Cover ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-primary/20"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeCoverImage(index)}
                >
                  <Icon name="X" size={14} />
                </Button>
                <p className="text-xs text-center mt-1 truncate">{file.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-base font-semibold">Превью содержания ПЗ (JPG/PNG)</Label>
        <p className="text-sm text-muted-foreground">Загрузите скриншоты страниц пояснительной записки (до 5 файлов, макс. 5MB каждый)</p>
        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => document.getElementById('preview-upload')?.click()}
            className="w-full"
          >
            <Icon name="FileText" size={18} className="mr-2" />
            Выбрать страницы содержания
          </Button>
          <input
            id="preview-upload"
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handlePreviewImageSelect}
            className="hidden"
          />
        </div>
        {previewImages.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {previewImages.map((file, index) => (
              <div key={index} className="relative group">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-blue-500/20"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removePreviewImage(index)}
                >
                  <Icon name="X" size={14} />
                </Button>
                <p className="text-xs text-center mt-1 truncate">{file.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
