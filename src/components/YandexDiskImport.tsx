import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

interface ImportResult {
  success: boolean;
  imported: number;
  errors: number;
  details: {
    imported: Array<{
      filename: string;
      work_id: number;
      title: string;
    }>;
    errors: Array<{
      filename: string;
      error: string;
    }>;
  };
}

export default function YandexDiskImport() {
  const [publicKey, setPublicKey] = useState('https://disk.yandex.ru/d/dQBBqvLRShUD6A');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleImport = async () => {
    setImporting(true);
    setProgress(10);
    setResult(null);

    try {
      setProgress(30);
      
      const response = await fetch('https://functions.poehali.dev/a16a43fc-fa7d-4c72-ad15-ba566d2c7413', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': 'rekrutiw@yandex.ru'
        },
        body: JSON.stringify({
          action: 'import',
          public_key: publicKey
        })
      });

      setProgress(80);

      const data = await response.json();

      setProgress(100);

      if (data.success) {
        setResult(data);
        toast({
          title: 'Импорт завершен!',
          description: `Загружено работ: ${data.imported}. Ошибок: ${data.errors}`
        });
      } else {
        throw new Error(data.error || 'Ошибка импорта');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка импорта',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="CloudDownload" size={24} className="text-primary" />
          </div>
          <div>
            <CardTitle>Импорт с Яндекс.Диска</CardTitle>
            <CardDescription>
              Автоматическая загрузка работ из папки
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="public-key">Публичная ссылка на папку</Label>
          <Input
            id="public-key"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            placeholder="https://disk.yandex.ru/d/..."
            disabled={importing}
          />
          <p className="text-sm text-muted-foreground">
            Система автоматически обработает DOCX файлы и изображения чертежей
          </p>
        </div>

        {importing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Импорт файлов...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {result && (
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-500/10 rounded">
                <div className="text-2xl font-bold text-green-600">{result.imported}</div>
                <div className="text-sm text-muted-foreground">Импортировано</div>
              </div>
              <div className="text-center p-3 bg-red-500/10 rounded">
                <div className="text-2xl font-bold text-red-600">{result.errors}</div>
                <div className="text-sm text-muted-foreground">Ошибок</div>
              </div>
            </div>

            {result.details.imported.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Загруженные работы:</h4>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {result.details.imported.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-background rounded">
                      <Icon name="CheckCircle" size={16} className="text-green-600" />
                      <span className="flex-1">{item.title}</span>
                      <span className="text-muted-foreground">ID: {item.work_id}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.details.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Ошибки:</h4>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {result.details.errors.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm p-2 bg-background rounded">
                      <Icon name="XCircle" size={16} className="text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">{item.filename}</div>
                        <div className="text-muted-foreground text-xs">{item.error}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button 
            onClick={handleImport} 
            disabled={importing || !publicKey}
            className="flex-1"
          >
            {importing ? (
              <>
                <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                Импорт...
              </>
            ) : (
              <>
                <Icon name="Download" size={18} className="mr-2" />
                Запустить импорт
              </>
            )}
          </Button>
        </div>

        <div className="bg-blue-500/10 p-4 rounded-lg space-y-2">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={18} className="text-blue-600 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-semibold">Что будет импортировано:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>DOCX файлы — извлечение текста и генерация описания через AI</li>
                <li>JPG/PNG изображения — чертежи с превью в карточках</li>
                <li>Автоматическое определение типа работы и предмета</li>
                <li>Установка цены в баллах по алгоритму</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
