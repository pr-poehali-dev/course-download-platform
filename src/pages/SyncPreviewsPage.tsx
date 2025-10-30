import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function SyncPreviewsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSync = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('https://functions.poehali.dev/722d5c93-b101-4896-9429-8aa76d806055', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

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
            Функция автоматически пройдется по всем работам без превью, найдет соответствующие папки 
            на Яндекс.Диске, извлечет первое найденное изображение и привяжет его к работе в базе данных.
          </p>
        </div>

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

        {result && (
          <div className={`mt-6 p-6 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              <Icon 
                name={result.success ? "CheckCircle2" : "XCircle"} 
                className={result.success ? "text-green-600" : "text-red-600"}
                size={24}
              />
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${
                  result.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {result.success ? 'Синхронизация завершена!' : 'Ошибка синхронизации'}
                </h3>
                
                {result.success && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-green-200">
                      <span className="text-gray-700">Всего работ без превью:</span>
                      <span className="font-bold text-green-900">{result.total_works}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-green-200">
                      <span className="text-gray-700">Обновлено превью:</span>
                      <span className="font-bold text-green-900">{result.updated_count}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-700">Пропущено:</span>
                      <span className="font-bold text-green-900">{result.skipped_count}</span>
                    </div>
                    
                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <p className="font-semibold text-gray-700 mb-2">Ошибки:</p>
                        <div className="text-xs text-gray-600 space-y-1 max-h-40 overflow-y-auto">
                          {result.errors.slice(0, 10).map((error: string, i: number) => (
                            <div key={i}>{error}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!result.success && result.error && (
                  <p className="text-sm text-red-700">{result.error}</p>
                )}
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
