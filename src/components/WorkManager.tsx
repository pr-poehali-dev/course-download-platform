import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../backend/func2url.json';
import WorkFormFields from './work-manager/WorkFormFields';
import WorkImageUploader from './work-manager/WorkImageUploader';
import WorkFileManager from './work-manager/WorkFileManager';

interface WorkManagerProps {
  adminEmail: string;
  onWorkAdded?: () => void;
}

export default function WorkManager({ adminEmail, onWorkAdded }: WorkManagerProps) {
  const [formData, setFormData] = useState({
    title: '',
    work_type: '',
    subject: '',
    description: '',
    composition: '',
    price_points: ''
  });
  
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmAuthorship, setConfirmAuthorship] = useState(false);
  const [coverImages, setCoverImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFormDataChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const uploadImages = async (): Promise<{coverUrls: string[], previewUrls: string[]}> => {
    const coverUrls: string[] = [];
    const previewUrls: string[] = [];

    for (const file of coverImages) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const response = await fetch(func2url['upload-work-cover'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          filename: file.name
        })
      });

      const data = await response.json();
      if (data.url) {
        coverUrls.push(data.url);
      }
    }

    for (const file of previewImages) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const response = await fetch(func2url['upload-preview'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          filename: file.name
        })
      });

      const data = await response.json();
      if (data.url) {
        previewUrls.push(data.url);
      }
    }

    return { coverUrls, previewUrls };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.work_type || !formData.subject || 
        !formData.description || !formData.price_points) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    if (!confirmAuthorship) {
      toast({
        title: 'Подтвердите авторство',
        description: 'Необходимо подтвердить, что вы являетесь автором работы',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      const { coverUrls, previewUrls } = await uploadImages();
      
      const allFiles = [...files, ...coverUrls];
      const allPreviews = previewUrls;

      const response = await fetch(func2url.works, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': adminEmail
        },
        body: JSON.stringify({
          ...formData,
          price_points: parseInt(formData.price_points),
          files: allFiles,
          preview_urls: allPreviews
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Работа добавлена! 🎉',
          description: 'Работа успешно опубликована в каталоге'
        });
        
        setFormData({
          title: '',
          work_type: '',
          subject: '',
          description: '',
          composition: '',
          price_points: ''
        });
        setFiles([]);
        setCoverImages([]);
        setPreviewImages([]);
        setConfirmAuthorship(false);
        setUploading(false);
        
        if (onWorkAdded) {
          onWorkAdded();
        }
      } else {
        throw new Error(data.error || 'Ошибка при добавлении работы');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось добавить работу',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Plus" size={24} className="text-primary" />
          Добавить новую работу
        </CardTitle>
        <CardDescription>
          Заполните информацию о работе для публикации в каталоге
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <WorkFormFields formData={formData} onChange={handleFormDataChange} />

          <WorkImageUploader
            coverImages={coverImages}
            previewImages={previewImages}
            onCoverImagesChange={setCoverImages}
            onPreviewImagesChange={setPreviewImages}
          />

          <WorkFileManager files={files} onFilesChange={setFiles} />

          <div className="flex items-center space-x-2 p-4 border border-border rounded-lg bg-muted/50">
            <Checkbox
              id="authorship"
              checked={confirmAuthorship}
              onCheckedChange={(checked) => setConfirmAuthorship(checked === true)}
            />
            <label
              htmlFor="authorship"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Я подтверждаю, что являюсь автором данной работы и имею право на её публикацию
            </label>
          </div>

          <div className="flex gap-3">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={loading || uploading}
            >
              {uploading ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Загрузка изображений...
                </>
              ) : loading ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Добавление...
                </>
              ) : (
                <>
                  <Icon name="CheckCircle" size={18} className="mr-2" />
                  Опубликовать работу
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
