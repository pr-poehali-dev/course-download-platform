import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

export default function SyncPreviewsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [autoStarted, setAutoStarted] = useState(false);
  const [totalStats, setTotalStats] = useState({
    total: 0,
    success: 0,
    failed: 0
  });
  const [isComplete, setIsComplete] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(func2url['sync-previews'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ limit: 20 })
      });

      const data = await response.json();
      setResult(data);
      
      // Обновляем общую статистику
      setTotalStats(prev => ({
        total: prev.total + (data.total_processed || 0),
        success: prev.success + (data.success || 0),
        failed: prev.failed + (data.failed || 0)
      }));
      
      // Если обработали меньше 20 работ, значит все готово
      if (data.total_processed < 20) {
        setIsComplete(true);
      } else {
        // Иначе автоматически запускаем следующую партию через 2 секунды
        setTimeout(() => {
          handleSync();
        }, 2000);
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      });
      setIsComplete(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!autoStarted) {
      setAutoStarted(true);
      handleSync();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Icon name="RefreshCw" size={40} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Автосинхронизация превью</h1>
          <p className="text-muted-foreground">
            Автоматически найдет и загрузит превью изображения для всех работ из Яндекс.Диска
          </p>
        </div>

        <div className="bg-blue-50 border-l-4 border-primary p-4 mb-6 rounded">
          <h3 className="font-semibold text-primary mb-2">Как это работает:</h3>
          <p className="text-sm text-gray-700">
            Функция автоматически обработает работы партиями по 20 штук. Процесс продолжится автоматически 
            до тех пор, пока все работы не будут обработаны.
          </p>
        </div>

        {!isComplete && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <div className="flex items-center gap-2">
              <Icon name="Loader2" className="animate-spin text-green-600" size={20} />
              <div>
                <h3 className="font-semibold text-green-900">Обработка в процессе...</h3>
                <p className="text-sm text-green-700 mt-1">
                  Обработано: {totalStats.total} | Успешно: {totalStats.success} | Ошибок: {totalStats.failed}
                </p>
              </div>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-600 rounded">
            <div className="flex items-center gap-2">
              <Icon name="CheckCircle2" className="text-green-600" size={24} />
              <div>
                <h3 className="font-semibold text-green-900">✅ Синхронизация завершена!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Всего обработано: {totalStats.total} | Успешно: {totalStats.success} | Ошибок: {totalStats.failed}
                </p>
              </div>
            </div>
          </div>
        )}

        {isComplete ? (
          <Button 
            onClick={() => {
              setTotalStats({ total: 0, success: 0, failed: 0 });
              setIsComplete(false);
              handleSync();
            }}
            className="w-full h-14 text-lg"
            size="lg"
          >
            <Icon name="RefreshCw" className="mr-2 h-5 w-5" />
            Запустить заново
          </Button>
        ) : (
          <Button 
            onClick={handleSync} 
            disabled={loading}
            className="w-full h-14 text-lg"
            size="lg"
          >
            {loading ? (
              <>
                <Icon name="Loader2" className="mr-2 h-5 w-5 animate-spin" />
                Синхронизация...
              </>
            ) : (
              <>
                <Icon name="Rocket" className="mr-2 h-5 w-5" />
                Запустить синхронизацию
              </>
            )}
          </Button>
        )}

        {result && (
          <div className="mt-6 p-6 rounded-lg border bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Icon 
                name="Database" 
                className="text-blue-600"
                size={24}
              />
              <div className="flex-1">
                <h3 className="font-semibold mb-3 text-blue-900">
                  Результаты синхронизации
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-blue-200">
                    <span className="text-gray-700">Всего обработано:</span>
                    <span className="font-bold text-blue-900">{result.total_processed || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-green-200 bg-green-50 px-2 -mx-2 rounded">
                    <span className="text-gray-700">✅ Успешно синхронизировано:</span>
                    <span className="font-bold text-green-900">{result.success || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-red-200 bg-red-50 px-2 -mx-2 rounded">
                    <span className="text-gray-700">❌ Ошибки:</span>
                    <span className="font-bold text-red-900">{result.failed || 0}</span>
                  </div>
                  
                  {result.success_items && result.success_items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <p className="font-semibold text-green-700 mb-2">✅ Успешно ({result.success_items.length}):</p>
                      <div className="text-xs text-gray-600 space-y-1 max-h-40 overflow-y-auto">
                        {result.success_items.map((item: any, i: number) => (
                          <div key={i} className="py-1">
                            <span className="font-mono text-blue-600">#{item.work_id}</span> — {item.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-red-200">
                      <p className="font-semibold text-red-700 mb-2">❌ Ошибки ({result.errors.length}):</p>
                      <div className="text-xs text-gray-600 space-y-2 max-h-60 overflow-y-auto">
                        {result.errors.map((error: any, i: number) => (
                          <div key={i} className="bg-red-50 p-2 rounded border border-red-100">
                            <div className="font-semibold">
                              <span className="font-mono text-red-600">#{error.work_id}</span> — {error.title}
                            </div>
                            <div className="text-red-600 mt-1">{error.error}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <a 
            href="/catalog" 
            className="text-primary hover:underline text-sm inline-flex items-center gap-1"
          >
            <Icon name="ArrowLeft" size={16} />
            Вернуться в каталог
          </a>
        </div>
      </div>
    </div>
  );
}