import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../../backend/func2url.json';

export default function DocPreviewGenerator() {
  const [workId, setWorkId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!workId || isNaN(Number(workId))) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректный ID работы',
        variant: 'destructive'
      });
      return;
    }

    setGenerating(true);
    setPreviewUrls([]);

    try {
      const response = await fetch(
        `${func2url['extract-doc-preview']}?work_id=${workId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка генерации превью');
      }

      const data = await response.json();
      
      setPreviewUrls(data.preview_urls || []);
      
      toast({
        title: 'Превью созданы!',
        description: `Извлечено ${data.pages_extracted} страниц(ы)`,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка генерации',
        description: error.message || 'Не удалось создать превью',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="FileText" size={24} className="text-primary" />
          Генератор превью документов
        </CardTitle>
        <CardDescription>
          Извлекает первые 2 страницы из пояснительной записки работы
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="ID работы (например: 4383)"
            value={workId}
            onChange={(e) => setWorkId(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleGenerate} 
            disabled={generating}
          >
            {generating ? (
              <>
                <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                Генерация...
              </>
            ) : (
              <>
                <Icon name="Wand2" size={18} className="mr-2" />
                Создать превью
              </>
            )}
          </Button>
        </div>

        {previewUrls.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Созданные превью:</h4>
            <div className="grid grid-cols-2 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="space-y-2">
                  <img 
                    src={url} 
                    alt={`Страница ${index + 1}`}
                    className="w-full border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Страница {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded text-sm">
          <p className="text-blue-800">
            <strong>Как работает:</strong>
          </p>
          <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
            <li>Скачивает ZIP-архив работы</li>
            <li>Находит пояснительную записку (PDF/DOCX)</li>
            <li>Извлекает первые 2 страницы (обычно содержание и введение)</li>
            <li>Конвертирует в изображения и загружает в CDN</li>
            <li>Сохраняет URL в базу данных</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
