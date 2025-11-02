import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import func2url from '../../backend/func2url.json';

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
  const [cleaning, setCleaning] = useState(false);
  const [generatingPreviews, setGeneratingPreviews] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [syncingStorage, setSyncingStorage] = useState(false);

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    setResult(null);

    let totalImported = 0;
    let totalErrors = 0;
    let allImported: any[] = [];
    let allErrors: any[] = [];
    let offset = 0;
    const limit = 50;

    try {
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(func2url.works, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Email': 'rekrutiw@yandex.ru'
          },
          body: JSON.stringify({
            action: 'import',
            public_key: publicKey,
            offset,
            limit
          })
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Ошибка импорта');
        }

        totalImported += data.imported;
        totalErrors += data.errors;
        allImported = [...allImported, ...data.details.imported];
        allErrors = [...allErrors, ...data.details.errors];

        // Обновляем прогресс
        const progressPercent = Math.round(((offset + data.imported) / data.total) * 100);
        setProgress(progressPercent);

        console.log(`Импортировано ${offset + data.imported} из ${data.total}`);

        hasMore = data.has_more;
        offset = data.next_offset || 0;
      }

      setProgress(100);

      const finalResult = {
        success: true,
        imported: totalImported,
        errors: totalErrors,
        details: {
          imported: allImported,
          errors: allErrors
        }
      };

      setResult(finalResult);
      
      toast({
        title: 'Импорт завершен!',
        description: `Загружено работ: ${totalImported}. Ошибок: ${totalErrors}`
      });
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

  const handleClearAll = async () => {
    if (!confirm('⚠️ ВНИМАНИЕ! Это удалит ВСЕ работы из базы данных. Продолжить?')) {
      return;
    }

    setCleaning(true);
    try {
      const response = await fetch(func2url.works, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': 'rekrutiw@yandex.ru'
        },
        body: JSON.stringify({
          action: 'clear_all'
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'База очищена!',
          description: `Удалено работ: ${data.deleted}`
        });
        setResult(null);
      } else {
        throw new Error(data.error || 'Ошибка очистки');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка очистки',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setCleaning(false);
    }
  };

  const handleGeneratePreviews = async () => {
    if (!confirm('Запустить генерацию превью для всех работ без изображений? Это может занять несколько минут.')) {
      return;
    }

    setGeneratingPreviews(true);
    setPreviewProgress(0);

    let totalProcessed = 0;
    let totalSuccess = 0;
    let offset = 0;
    const limit = 10;

    try {
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(func2url['generate-previews'], {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Email': 'rekrutiw@yandex.ru'
          },
          body: JSON.stringify({
            offset,
            limit,
            public_key: publicKey
          })
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Ошибка генерации превью');
        }

        totalProcessed += data.processed;
        totalSuccess += data.success;

        // Обновляем прогресс (примерно, т.к. не знаем общее количество)
        const progressPercent = Math.min(95, Math.round((totalProcessed / 486) * 100));
        setPreviewProgress(progressPercent);

        console.log(`Сгенерировано превью: ${totalProcessed}, успешно: ${totalSuccess}`);

        // Если обработано меньше чем лимит, значит закончились работы
        hasMore = data.processed >= limit;
        offset += limit;
      }

      setPreviewProgress(100);

      toast({
        title: 'Генерация завершена!',
        description: `Обработано работ: ${totalProcessed}. Успешно: ${totalSuccess}`
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка генерации',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setGeneratingPreviews(false);
      setTimeout(() => setPreviewProgress(0), 1000);
    }
  };

  const handleCleanupDuplicates = async () => {
    if (!confirm('Удалить дубликаты работ? Будут сохранены только первые версии.')) {
      return;
    }

    setCleaning(true);
    try {
      const response = await fetch(func2url.works, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': 'rekrutiw@yandex.ru'
        },
        body: JSON.stringify({
          action: 'remove_duplicates'
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Дубликаты удалены!',
          description: data.message
        });
      } else {
        throw new Error(data.error || 'Ошибка очистки');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка очистки',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setCleaning(false);
    }
  };

  const handleSyncStorage = async () => {
    if (!confirm('Синхронизировать каталог из Cloud Storage? Это обновит все работы и создаст превью.')) {
      return;
    }

    setSyncingStorage(true);
    try {
      const response = await fetch(func2url['full-yandex-sync'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Синхронизация завершена!',
          description: `Синхронизировано работ: ${data.synced} из ${data.total_works}`
        });
        setResult(null);
      } else {
        throw new Error(data.error || 'Ошибка синхронизации');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка синхронизации',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSyncingStorage(false);
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

        {generatingPreviews && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Генерация превью...</span>
              <span>{previewProgress}%</span>
            </div>
            <Progress value={previewProgress} />
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

        <div className="space-y-3">
          <div className="flex gap-3">
            <Button 
              onClick={handleSyncStorage} 
              disabled={importing || cleaning || generatingPreviews || syncingStorage}
              className="flex-1"
              variant="default"
            >
              {syncingStorage ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Синхронизация...
                </>
              ) : (
                <>
                  <Icon name="CloudDownload" size={18} className="mr-2" />
                  Синхронизация Cloud Storage
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <Icon name="Info" size={16} className="inline mr-2" />
            Синхронизация загрузит все работы из бакета kyra/works/, создаст превью и обновит каталог
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleImport} 
              disabled={importing || !publicKey || cleaning || generatingPreviews || syncingStorage}
              className="flex-1"
              variant="outline"
            >
              {importing ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Импорт...
                </>
              ) : (
                <>
                  <Icon name="Download" size={18} className="mr-2" />
                  Импорт с Яндекс.Диска
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleCleanupDuplicates}
              disabled={importing || cleaning || generatingPreviews || syncingStorage}
              variant="outline"
            >
              {cleaning ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Удаление...
                </>
              ) : (
                <>
                  <Icon name="Trash2" size={18} className="mr-2" />
                  Удалить дубликаты
                </>
              )}
            </Button>

            <Button 
              onClick={handleClearAll}
              disabled={importing || cleaning || generatingPreviews || syncingStorage}
              variant="destructive"
            >
              {cleaning ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Очистка...
                </>
              ) : (
                <>
                  <Icon name="Trash" size={18} className="mr-2" />
                  Очистить базу
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="border-t pt-6">
          <Button 
            onClick={handleGeneratePreviews}
            disabled={importing || cleaning || generatingPreviews || !publicKey}
            className="w-full"
            variant="secondary"
          >
            {generatingPreviews ? (
              <>
                <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                Генерация превью... {previewProgress}%
              </>
            ) : (
              <>
                <Icon name="Image" size={18} className="mr-2" />
                Сгенерировать превью из PDF
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