import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

export default function GenerateReviewsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReviews = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`${func2url.reviews}?action=generate_fake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': 'rekrutiw@yandex.ru'
        },
        body: JSON.stringify({
          work_ids: 'all',
          reviews_per_work: 2
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Генерация отзывов</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                Эта страница создаст 2-3 качественных отзыва от разных ников для всех работ без отзывов.
              </p>
            </div>

            <Button
              onClick={generateReviews}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                  Генерация отзывов...
                </>
              ) : (
                <>
                  <Icon name="MessageSquare" className="mr-2" size={20} />
                  Сгенерировать отзывы
                </>
              )}
            </Button>

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                  <Icon name="CheckCircle" className="mr-2" size={20} />
                  Успешно!
                </h3>
                <div className="text-sm text-green-800 space-y-1">
                  <p>✅ Обработано работ: {result.total_works}</p>
                  <p>✅ Создано отзывов: {result.reviews_created}</p>
                  <p>✅ Пропущено работ (уже есть отзывы): {result.works_skipped}</p>
                  {result.errors && result.errors.length > 0 && (
                    <p>⚠️ Ошибок: {result.errors.length}</p>
                  )}
                  <p className="mt-3 font-medium">{result.message}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                  <Icon name="XCircle" className="mr-2" size={20} />
                  Ошибка
                </h3>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
