import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

export default function AutoGenerateReviewsPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [totalBatches, setTotalBatches] = useState(0);
  const [totalWorksProcessed, setTotalWorksProcessed] = useState(0);
  const [totalReviewsCreated, setTotalReviewsCreated] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [logs, setLogs] = useState<Array<{time: string, message: string, type: string}>>([]);
  const [reviewsPerWork, setReviewsPerWork] = useState(3);
  const [batchSize, setBatchSize] = useState(100);
  const navigate = useNavigate();

  const REVIEWS_API = func2url.reviews;
  const MAX_BATCHES = 5;

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString('ru-RU');
    setLogs(prev => [...prev, { time, message, type }]);
  };

  const generateBatch = async (reviewsPerWork: number, batchSize: number, batchNum: number): Promise<boolean> => {
    try {
      addLog(`📤 Запуск батча ${batchNum}/${MAX_BATCHES} (${batchSize} работ, ${reviewsPerWork} отзывов/работа)...`, 'info');
      
      const response = await fetch(`${REVIEWS_API}?action=bulk_generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'admin_secret_token_2024'
        },
        body: JSON.stringify({
          reviews_per_work: reviewsPerWork,
          limit_works: batchSize
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      setTotalBatches(prev => prev + 1);
      setTotalWorksProcessed(prev => prev + (data.processed_works || 0));
      setTotalReviewsCreated(prev => prev + (data.total_reviews_created || 0));
      
      addLog(`✅ Батч ${batchNum} завершен: обработано ${data.processed_works} работ, создано ${data.total_reviews_created} отзывов`, 'success');
      
      return true;
    } catch (error) {
      addLog(`❌ Ошибка в батче ${batchNum}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      return false;
    }
  };

  const startGeneration = async () => {
    if (isRunning) return;
    
    if (reviewsPerWork < 1 || reviewsPerWork > 5) {
      alert('Количество отзывов должно быть от 1 до 5');
      return;
    }
    
    if (batchSize < 10 || batchSize > 100) {
      alert('Размер батча должен быть от 10 до 100');
      return;
    }
    
    setIsRunning(true);
    setCurrentBatch(0);
    setTotalBatches(0);
    setTotalWorksProcessed(0);
    setTotalReviewsCreated(0);
    setLogs([]);
    
    addLog(`🚀 Старт генерации отзывов: ${reviewsPerWork} отзывов на работу, ${MAX_BATCHES} батчей по ${batchSize} работ`, 'success');
    
    for (let i = 0; i < MAX_BATCHES; i++) {
      setCurrentBatch(i + 1);
      
      const success = await generateBatch(reviewsPerWork, batchSize, i + 1);
      
      if (!success) {
        addLog(`⚠️ Батч ${i + 1} завершился с ошибкой, продолжаем...`, 'error');
      }
      
      if (i < MAX_BATCHES - 1) {
        addLog(`⏳ Пауза 2 секунды перед следующим батчем...`, 'info');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    setCurrentBatch(MAX_BATCHES);
    addLog(`🎉 Генерация завершена! Всего создано ${totalReviewsCreated} отзывов для ${totalWorksProcessed} работ`, 'success');
    
    setIsRunning(false);
  };

  const progress = Math.round((currentBatch / MAX_BATCHES) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container max-w-4xl mx-auto px-4 py-12 mt-16">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold">🚀 Автоматическая генерация отзывов</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Параметры генерации</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Отзывов на работу (1-5)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={reviewsPerWork}
                  onChange={(e) => setReviewsPerWork(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Работ за батч (10-100)
                </label>
                <Input
                  type="number"
                  min={10}
                  max={100}
                  value={batchSize}
                  onChange={(e) => setBatchSize(Math.min(100, Math.max(10, parseInt(e.target.value) || 50)))}
                  disabled={isRunning}
                />
              </div>
            </div>

            <Button 
              onClick={startGeneration} 
              disabled={isRunning}
              className="w-full"
              size="lg"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Генерация... ({currentBatch}/{MAX_BATCHES})
                </>
              ) : (
                <>
                  <Icon name="Sparkles" size={20} className="mr-2" />
                  Запустить генерацию
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{totalBatches}</div>
              <div className="text-sm text-muted-foreground mt-1">Запусков</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600">{totalWorksProcessed}</div>
              <div className="text-sm text-muted-foreground mt-1">Работ обработано</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{totalReviewsCreated}</div>
              <div className="text-sm text-muted-foreground mt-1">Отзывов создано</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="mb-2 text-sm font-medium">Прогресс: {progress}%</div>
            <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-center text-white font-bold transition-all duration-300"
                style={{ width: `${progress}%` }}
              >
                {progress > 0 && `${progress}%`}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Лог операций</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm space-y-1">
              {logs.length === 0 ? (
                <div className="text-muted-foreground text-center py-8">
                  Нажмите "Запустить генерацию" чтобы начать
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2 rounded ${
                      log.type === 'success' ? 'text-green-700 bg-green-50' : 
                      log.type === 'error' ? 'text-red-700 bg-red-50' : 
                      'text-blue-700 bg-blue-50'
                    }`}
                  >
                    [{log.time}] {log.message}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
