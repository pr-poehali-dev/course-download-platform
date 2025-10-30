import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

export default function PreviewGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchSize, setBatchSize] = useState(100);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);

  const generatePreviews = async () => {
    setIsGenerating(true);
    setProgress(0);
    setStats({ total: 0, success: 0, failed: 0 });

    try {
      const response = await fetch('https://functions.poehali.dev/c5c39645-740b-4fc3-8d3f-d4dc911fae68', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: batchSize })
      });
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setStats({
        total: result.total_processed || 0,
        success: result.success || 0,
        failed: result.failed || 0
      });
      
      setProgress(100);

      toast({
        title: 'Синхронизация завершена',
        description: `Успешно: ${result.success}, Ошибок: ${result.failed}`
      });
      
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const syncAllPreviews = async () => {
    setIsGenerating(true);
    setProgress(0);
    setCurrentBatch(0);
    setTotalBatches(0);
    
    const cumulativeStats = { total: 0, success: 0, failed: 0 };
    let batchNum = 0;
    const BATCH_SIZE = 100;
    
    try {
      toast({
        title: '🚀 Начинаем автосинхронизацию',
        description: 'Загружаем все превью с Яндекс.Диска...'
      });

      while (true) {
        batchNum++;
        setCurrentBatch(batchNum);
        
        const response = await fetch('https://functions.poehali.dev/c5c39645-740b-4fc3-8d3f-d4dc911fae68', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: BATCH_SIZE })
        });
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        cumulativeStats.total += result.total_processed || 0;
        cumulativeStats.success += result.success || 0;
        cumulativeStats.failed += result.failed || 0;
        
        setStats({ ...cumulativeStats });
        setProgress(Math.min(95, (cumulativeStats.total / 443) * 100));
        
        if ((result.total_processed || 0) < BATCH_SIZE) {
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setProgress(100);
      setTotalBatches(batchNum);
      
      toast({
        title: '✅ Автосинхронизация завершена!',
        description: `Обработано ${cumulativeStats.total} работ за ${batchNum} батчей. Успешно: ${cumulativeStats.success}, Ошибок: ${cumulativeStats.failed}`
      });
      
    } catch (error) {
      toast({
        title: 'Ошибка автосинхронизации',
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };



  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Icon name="Image" size={24} className="text-purple-600" />
          </div>
          <div>
            <CardTitle>Генератор превью</CardTitle>
            <CardDescription>Автоматическая генерация картинок для работ</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Количество работ за раз</label>
          <Input
            type="number"
            min={1}
            max={200}
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value) || 50)}
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground">
            Рекомендуется: 50-100 работ за раз (быстрая синхронизация с Яндекс.Диском)
          </p>
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Прогресс {currentBatch > 0 && `(Батч ${currentBatch})`}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>✅ Успешно: {stats.success}</span>
              <span>❌ Ошибки: {stats.failed}</span>
              <span>📊 Всего: {stats.total}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={generatePreviews} 
            disabled={isGenerating}
            variant="outline"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                Загрузка...
              </>
            ) : (
              <>
                <Icon name="Sparkles" size={18} className="mr-2" />
                Один батч
              </>
            )}
          </Button>

          <Button 
            onClick={syncAllPreviews} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Синхронизация...
              </>
            ) : (
              <>
                <Icon name="Zap" size={18} className="mr-2" />
                Синхронизировать ВСЁ
              </>
            )}
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Как это работает:</p>
              <ul className="space-y-1 text-xs">
                <li>• Система находит preview.png в папках на Яндекс.Диске</li>
                <li>• Получает прямые ссылки на файлы превью</li>
                <li>• Сохраняет ссылки в базу данных</li>
                <li>• Картинки мгновенно отображаются в каталоге</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}