import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';

export default function ExtractPreviews() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 487 });
  const [allResults, setAllResults] = useState<any[]>([]);

  const extractPreviews = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAllResults([]);
    setProgress({ current: 0, total: 487 });

    try {
      let offset = 0;
      let hasMore = true;
      const batchSize = 15;
      const results: any[] = [];

      while (hasMore) {
        const response = await fetch('https://functions.poehali.dev/e7988513-c419-48f5-8131-4bfedcb9b79b', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ batch_size: batchSize, offset }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        results.push(data);
        setAllResults([...results]);
        
        const totalProcessed = results.reduce((sum, r) => sum + r.processed, 0);
        setProgress({ 
          current: offset + batchSize, 
          total: data.total_remaining || 487 
        });

        hasMore = data.has_more;
        offset = data.next_offset || offset + batchSize;

        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const summary = {
        total_batches: results.length,
        total_processed: results.reduce((sum, r) => sum + r.processed, 0),
        total_errors: results.reduce((sum, r) => sum + (r.errors?.length || 0), 0),
        all_errors: results.flatMap(r => r.errors || []).slice(0, 20),
      };

      setResult(summary);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = progress.total > 0 
    ? Math.min(100, (progress.current / progress.total) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Icon name="Image" size={32} className="text-blue-600" />
            <h1 className="text-3xl font-bold">Извлечение превью из RAR архивов</h1>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              Эта функция автоматически извлечет первый PNG файл из каждого RAR архива и создаст превью для работ.
            </p>
            <p className="text-sm text-gray-600">
              Найдено работ без превью: <strong>487</strong>
            </p>
          </div>

          {loading && (
            <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    Обработка пакетами по 15 работ...
                  </span>
                  <span className="text-sm text-blue-700">
                    {progress.current} / {progress.total}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-3" />
                <p className="text-xs text-blue-600">
                  Обработано: {allResults.reduce((sum, r) => sum + r.processed, 0)} работ
                </p>
              </div>
            </Card>
          )}

          <Button
            onClick={extractPreviews}
            disabled={loading}
            className="w-full mb-6"
            size="lg"
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Обработка... ({progressPercent.toFixed(0)}%)
              </>
            ) : (
              <>
                <Icon name="Play" size={20} className="mr-2" />
                Запустить извлечение превью
              </>
            )}
          </Button>

          {error && (
            <Card className="p-4 bg-red-50 border-red-200 mb-6">
              <div className="flex items-start gap-3">
                <Icon name="AlertCircle" size={20} className="text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Ошибка</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {result && (
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-start gap-3 mb-4">
                <Icon name="CheckCircle2" size={24} className="text-green-600" />
                <h3 className="text-xl font-semibold text-green-900">Результаты обработки</h3>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{result.total_batches || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Пакетов</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{result.total_processed || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Обработано</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-red-600">{result.total_errors || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Ошибок</div>
                </div>
              </div>

              {result.all_errors && result.all_errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Первые 20 ошибок:</h4>
                  <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto">
                    {result.all_errors.map((err: string, idx: number) => (
                      <div key={idx} className="text-sm text-red-700 mb-1 font-mono">
                        {err}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 text-sm text-gray-600">
                <p>
                  Успешность: <strong>{result.total_processed} из {progress.total}</strong> 
                  {' '}({((result.total_processed / progress.total) * 100).toFixed(1)}%)
                </p>
              </div>
            </Card>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={18} className="text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Как это работает:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Функция обрабатывает работы пакетами по 15 шт (избегаем таймаут)</li>
                  <li>Открывает каждый RAR/ZIP архив в Object Storage</li>
                  <li>Извлекает первый PNG файл напрямую из байтов архива</li>
                  <li>Оптимизирует изображение (макс. 800px ширина)</li>
                  <li>Загружает превью в S3 и обновляет БД</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
