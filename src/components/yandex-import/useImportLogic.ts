import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../../backend/func2url.json';

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

export function useImportLogic() {
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

        const progressPercent = Math.min(95, Math.round((totalProcessed / 486) * 100));
        setPreviewProgress(progressPercent);

        console.log(`Сгенерировано превью: ${totalProcessed}, успешно: ${totalSuccess}`);

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

  return {
    publicKey,
    setPublicKey,
    importing,
    progress,
    result,
    cleaning,
    generatingPreviews,
    previewProgress,
    syncingStorage,
    handleImport,
    handleClearAll,
    handleGeneratePreviews,
    handleCleanupDuplicates,
    handleSyncStorage
  };
}
