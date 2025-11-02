import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';

type Mode = 'convert' | 'extract';

export default function ExtractPreviews() {
  const [mode, setMode] = useState<Mode>('convert');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 485 });
  const [allResults, setAllResults] = useState<any[]>([]);

  const runProcess = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAllResults([]);
    setProgress({ current: 0, total: mode === 'convert' ? 485 : 487 });

    try {
      let offset = 0;
      let hasMore = true;
      const batchSize = mode === 'convert' ? 3 : 15; // Меньший батч для конвертации
      const results: any[] = [];

      while (hasMore) {
        const response = await fetch('https://functions.poehali.dev/e7988513-c419-48f5-8131-4bfedcb9b79b', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ batch_size: batchSize, offset, mode }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        results.push(data);
        setAllResults([...results]);
        
        setProgress({ 
          current: offset + batchSize, 
          total: data.total_remaining || (mode === 'convert' ? 485 : 487)
        });

        hasMore = data.has_more;
        offset = data.next_offset || offset + batchSize;

        // Задержка между батчами (больше для конвертации)
        await new Promise(resolve => setTimeout(resolve, mode === 'convert' ? 1000 : 300));
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
            <Icon name="PackageOpen" size={32} className="text-blue-600" />
            <h1 className="text-3xl font-bold">Управление архивами работ</h1>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setMode('convert')}
              className={`p-6 rounded-lg border-2 transition-all ${
                mode === 'convert'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon 
                  name="RefreshCw" 
                  size={24} 
                  className={mode === 'convert' ? 'text-blue-600' : 'text-gray-400'}
                />
                <h3 className={`text-lg font-semibold ${mode === 'convert' ? 'text-blue-900' : 'text-gray-700'}`}>
                  Конвертация RAR → ZIP
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Преобразует все RAR архивы в ZIP формат. Это необходимо сделать ПЕРВЫМ.
              </p>
              <div className="mt-3 text-sm font-semibold text-blue-600">
                485 RAR файлов
              </div>
            </button>

            <button
              onClick={() => setMode('extract')}
              className={`p-6 rounded-lg border-2 transition-all ${
                mode === 'extract'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon 
                  name="Image" 
                  size={24} 
                  className={mode === 'extract' ? 'text-green-600' : 'text-gray-400'}
                />
                <h3 className={`text-lg font-semibold ${mode === 'extract' ? 'text-green-900' : 'text-gray-700'}`}>
                  Извлечение превью
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Извлекает первый PNG из ZIP архивов и создает превью для работ.
              </p>
              <div className="mt-3 text-sm font-semibold text-green-600">
                487 работ без превью
              </div>
            </button>
          </div>

          {/* Progress */}
          {loading && (
            <Card className={`p-6 mb-6 ${
              mode === 'convert' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    mode === 'convert' ? 'text-blue-900' : 'text-green-900'
                  }`}>
                    {mode === 'convert' 
                      ? 'Конвертация RAR в ZIP...' 
                      : 'Извлечение превью...'}
                  </span>
                  <span className={`text-sm ${
                    mode === 'convert' ? 'text-blue-700' : 'text-green-700'
                  }`}>
                    {progress.current} / {progress.total}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-3" />
                <div className="flex justify-between text-xs">
                  <span className={mode === 'convert' ? 'text-blue-600' : 'text-green-600'}>
                    Обработано: {allResults.reduce((sum, r) => sum + r.processed, 0)} 
                  </span>
                  <span className={mode === 'convert' ? 'text-blue-600' : 'text-green-600'}>
                    {progressPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Action Button */}
          <Button
            onClick={runProcess}
            disabled={loading}
            className={`w-full mb-6 ${
              mode === 'convert' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
            size="lg"
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                {mode === 'convert' ? 'Конвертация' : 'Извлечение'}... ({progressPercent.toFixed(0)}%)
              </>
            ) : (
              <>
                <Icon name="Play" size={20} className="mr-2" />
                {mode === 'convert' ? 'Запустить конвертацию' : 'Запустить извлечение'}
              </>
            )}
          </Button>

          {/* Error */}
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

          {/* Results */}
          {result && (
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-start gap-3 mb-4">
                <Icon name="CheckCircle2" size={24} className="text-green-600" />
                <h3 className="text-xl font-semibold text-green-900">
                  {mode === 'convert' ? 'Конвертация завершена' : 'Извлечение завершено'}
                </h3>
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

              {mode === 'convert' && result.total_processed > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Icon name="Info" size={18} className="text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-900">
                      <strong>Следующий шаг:</strong> Теперь переключитесь на режим "Извлечение превью" 
                      чтобы создать превью для всех работ.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Info */}
          <div className={`mt-6 p-4 rounded-lg ${
            mode === 'convert' ? 'bg-blue-50' : 'bg-green-50'
          }`}>
            <div className="flex items-start gap-2">
              <Icon name="Info" size={18} className={`mt-0.5 ${
                mode === 'convert' ? 'text-blue-600' : 'text-green-600'
              }`} />
              <div className={`text-sm ${
                mode === 'convert' ? 'text-blue-900' : 'text-green-900'
              }`}>
                <p className="font-semibold mb-1">
                  {mode === 'convert' ? 'Как работает конвертация:' : 'Как работает извлечение:'}
                </p>
                <ul className={`list-disc list-inside space-y-1 ${
                  mode === 'convert' ? 'text-blue-800' : 'text-green-800'
                }`}>
                  {mode === 'convert' ? (
                    <>
                      <li>Обрабатывает по 3 RAR файла за раз (избегаем таймаут)</li>
                      <li>Скачивает RAR из Object Storage во временный файл</li>
                      <li>Извлекает содержимое через rarfile библиотеку</li>
                      <li>Создаёт новый ZIP архив с тем же содержимым</li>
                      <li>Загружает ZIP в S3 и обновляет ссылки в БД</li>
                      <li>Удаляет старый RAR файл</li>
                      <li><strong>Время выполнения: ~2-3 часа для всех файлов</strong></li>
                    </>
                  ) : (
                    <>
                      <li>Обрабатывает по 15 ZIP архивов за раз</li>
                      <li>Открывает каждый ZIP в Object Storage</li>
                      <li>Извлекает первый PNG файл напрямую из байтов архива</li>
                      <li>Оптимизирует изображение (макс. 800px ширина)</li>
                      <li>Загружает превью в S3 и обновляет БД</li>
                      <li><strong>Время выполнения: ~30 минут</strong></li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Warning for convert mode */}
          {mode === 'convert' && !loading && !result && (
            <Card className="p-4 bg-yellow-50 border-yellow-200 mt-4">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={20} className="text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-900">
                  <p className="font-semibold mb-1">⚠️ Важно перед запуском:</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-800">
                    <li>Процесс займёт 2-3 часа, не закрывайте страницу</li>
                    <li>485 RAR файлов будут заменены на ZIP</li>
                    <li>Старые RAR файлы будут удалены из хранилища</li>
                    <li>После завершения запустите извлечение превью</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </Card>
      </div>
    </div>
  );
}
