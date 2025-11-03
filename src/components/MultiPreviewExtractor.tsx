import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../backend/func2url.json';

export default function MultiPreviewExtractor() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    processed: 0,
    total: 487,
    errors: [] as string[]
  });

  const extractAllPreviews = async () => {
    setProcessing(true);
    setProgress(0);
    setStats({ processed: 0, total: 487, errors: [] });

    let offset = 0;
    const batchSize = 5;
    let hasMore = true;
    let totalProcessed = 0;
    const allErrors: string[] = [];

    try {
      while (hasMore) {
        const response = await fetch(
          `${func2url['extract-all-previews']}?batch_size=${batchSize}&offset=${offset}`,
          { method: 'POST' }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        totalProcessed += data.processed;
        hasMore = data.has_more;
        offset += batchSize;

        if (data.errors && data.errors.length > 0) {
          allErrors.push(...data.errors);
        }

        const progressPercent = Math.min((offset / stats.total) * 100, 100);
        setProgress(progressPercent);
        setStats({
          processed: totalProcessed,
          total: stats.total,
          errors: allErrors
        });

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: 'Извлечение завершено!',
        description: `Обработано: ${totalProcessed} работ. Ошибок: ${allErrors.length}`
      });

    } catch (error: any) {
      toast({
        title: 'Ошибка извлечения',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
      setProgress(100);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Images" size={24} />
          Извлечение всех превью из архивов
        </CardTitle>
        <CardDescription>
          Находит ВСЕ PNG/JPG изображения в архивах и создаёт галереи превью для каждой работы
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-primary/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Всего работ</div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.processed}
            </div>
            <div className="text-sm text-muted-foreground">Обработано</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.errors.length}
            </div>
            <div className="text-sm text-muted-foreground">Ошибок</div>
          </div>
        </div>

        {processing && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="text-sm text-muted-foreground text-center">
              {progress.toFixed(0)}% завершено
            </div>
          </div>
        )}

        <Button
          onClick={extractAllPreviews}
          disabled={processing}
          className="w-full"
          size="lg"
        >
          {processing ? (
            <>
              <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
              Извлекаю превью...
            </>
          ) : (
            <>
              <Icon name="Play" size={20} className="mr-2" />
              Извлечь ВСЕ превью (487 работ)
            </>
          )}
        </Button>

        {stats.errors.length > 0 && (
          <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
            <div className="font-medium mb-2 flex items-center gap-2">
              <Icon name="AlertCircle" size={16} className="text-destructive" />
              Ошибки ({stats.errors.length})
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              {stats.errors.map((error, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  <span>{error}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
