import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../backend/func2url.json';

export default function PreviewGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchSize, setBatchSize] = useState(15);
  const [stats, setStats] = useState({ total: 159, processed: 0, errors: 0, remaining: 159 });
  const [currentBatch, setCurrentBatch] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${time}] ${message}`]);
  };

  const processBatch = async (offset: number): Promise<boolean> => {
    try {
      addLog(`📦 Обрабатываю батч с offset=${offset}`);
      
      const response = await fetch(func2url['extract-previews'], {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ batch_size: batchSize, offset })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error('Ошибка обработки батча');
      }
      
      setStats({
        total: 159,
        processed: 159 - result.total_remaining,
        errors: result.errors?.length || 0,
        remaining: result.total_remaining
      });
      
      addLog(`✅ Обработано: ${result.processed}, Пропущено RAR: ${result.skipped_rar}, Осталось: ${result.total_remaining}`);
      
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach((err: string) => addLog(`⚠️  ${err}`));
      }
      
      const progressPercent = ((159 - result.total_remaining) / 159) * 100;
      setProgress(progressPercent);
      
      return result.has_more;
      
    } catch (error) {
      addLog(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  };

  const syncAllPreviews = async () => {
    setIsGenerating(true);
    setProgress(0);
    setCurrentBatch(0);
    setLogs([]);
    
    let batchNum = 0;
    let offset = 0;
    
    try {
      addLog('🚀 Начинаем обработку превью из ZIP архивов');
      
      toast({
        title: '🚀 Начинаем обработку',
        description: 'Извлекаем превью из ZIP архивов работ...'
      });

      let hasMore = true;
      while (hasMore) {
        batchNum++;
        setCurrentBatch(batchNum);
        
        hasMore = await processBatch(offset);
        
        if (hasMore) {
          offset += batchSize;
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
      
      setProgress(100);
      addLog(`🎉 Обработка завершена! Всего батчей: ${batchNum}`);
      
      toast({
        title: '✅ Обработка завершена!',
        description: `Обработано за ${batchNum} батчей. Проверьте каталог!`
      });
      
    } catch (error) {
      toast({
        title: 'Ошибка обработки',
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
            <CardTitle>Извлечение превью из архивов</CardTitle>
            <CardDescription>Автоматическое извлечение PNG превью из ZIP архивов работ</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Всего работ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.processed}</div>
            <div className="text-xs text-muted-foreground">Обработано</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.remaining}</div>
            <div className="text-xs text-muted-foreground">Осталось</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
            <div className="text-xs text-muted-foreground">Ошибок</div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Размер батча (работ за раз)</label>
          <Input
            type="number"
            min={5}
            max={50}
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value) || 15)}
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground">
            Рекомендуется: 15 работ за раз
          </p>
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Прогресс {currentBatch > 0 && `(Батч ${currentBatch})`}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {logs.length > 0 && (
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs max-h-64 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}

        <Button 
          onClick={syncAllPreviews} 
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Обработка батча {currentBatch}...
            </>
          ) : (
            <>
              <Icon name="Zap" size={18} className="mr-2" />
              Извлечь ВСЕ превью ({stats.remaining} работ)
            </>
          )}
        </Button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Как это работает:</p>
              <ul className="space-y-1 text-xs">
                <li>• Система извлекает первый PNG из ZIP архива каждой работы</li>
                <li>• Оптимизирует изображение (макс. 800px ширина)</li>
                <li>• Загружает в S3 storage (kyra/previews/)</li>
                <li>• Сохраняет ссылку в базу данных</li>
                <li>• Превью автоматически отображаются в каталоге</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}