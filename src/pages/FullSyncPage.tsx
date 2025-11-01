import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

export default function FullSyncPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFullSync = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(func2url['sync-previews-auto'], {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-500/10 via-background to-blue-500/10 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-4">
            <Icon name="Zap" size={40} className="text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Полная синхронизация превью</h1>
          <p className="text-muted-foreground">
            Обработает ВСЕ работы за один раз (может занять 5-10 минут)
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Внимание:</h3>
          <p className="text-sm text-yellow-700">
            Эта функция обработает все 432 работы одним запросом. Процесс может занять 5-10 минут. 
            Не закрывайте страницу до завершения!
          </p>
        </div>

        <Button 
          onClick={handleFullSync} 
          disabled={loading}
          className="w-full h-14 text-lg bg-purple-600 hover:bg-purple-700"
          size="lg"
        >
          {loading ? (
            <>
              <Icon name="Loader2" className="mr-2 h-5 w-5 animate-spin" />
              Синхронизация... (это займет несколько минут)
            </>
          ) : (
            <>
              <Icon name="Zap" className="mr-2 h-5 w-5" />
              Запустить полную синхронизацию
            </>
          )}
        </Button>

        {result && (
          <div className="mt-6 p-6 rounded-lg border bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Icon 
                name={result.success ? "CheckCircle2" : "XCircle"} 
                className={result.success ? "text-green-600" : "text-red-600"}
                size={24}
              />
              <div className="flex-1">
                <h3 className="font-semibold mb-3 text-blue-900">
                  {result.success ? '✅ Синхронизация завершена!' : '❌ Ошибка'}
                </h3>
                
                {result.success && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-blue-200">
                      <span className="text-gray-700">Всего работ:</span>
                      <span className="font-bold text-blue-900">{result.total_works || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-green-200 bg-green-50 px-2 -mx-2 rounded">
                      <span className="text-gray-700">✅ Обновлено:</span>
                      <span className="font-bold text-green-900">{result.updated_count || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-yellow-200 bg-yellow-50 px-2 -mx-2 rounded">
                      <span className="text-gray-700">⏭️ Пропущено:</span>
                      <span className="font-bold text-yellow-900">{result.skipped_count || 0}</span>
                    </div>
                    
                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-red-200">
                        <p className="font-semibold text-red-700 mb-2">❌ Ошибки ({result.errors.length}):</p>
                        <div className="text-xs text-gray-600 space-y-1 max-h-40 overflow-y-auto">
                          {result.errors.map((error: string, i: number) => (
                            <div key={i} className="py-1 text-red-600">
                              {error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!result.success && (
                  <p className="text-red-600 text-sm">{result.error}</p>
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
            Вернуться к каталогу
          </a>
        </div>
      </div>
    </div>
  );
}
