import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function ExtractPreviews() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const extractPreviews = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('https://functions.poehali.dev/e7988513-c419-48f5-8131-4bfedcb9b79b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

          <Button
            onClick={extractPreviews}
            disabled={loading}
            className="w-full mb-6"
            size="lg"
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Обработка... Это может занять несколько минут
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
                  <div className="text-3xl font-bold text-blue-600">{result.total_works || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Всего работ</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{result.processed || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Обработано</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-red-600">{result.errors?.length || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Ошибок</div>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Первые 10 ошибок:</h4>
                  <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto">
                    {result.errors.map((err: string, idx: number) => (
                      <div key={idx} className="text-sm text-red-700 mb-1 font-mono">
                        {err}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 text-sm text-gray-600">
                <p>
                  Успешно: <strong>{((result.processed / result.total_works) * 100).toFixed(1)}%</strong>
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
                  <li>Функция находит все работы с RAR файлами, но без превью</li>
                  <li>Открывает каждый RAR архив в Object Storage</li>
                  <li>Извлекает первый PNG файл и оптимизирует его (макс. 800px)</li>
                  <li>Загружает превью обратно в S3 и обновляет БД</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
