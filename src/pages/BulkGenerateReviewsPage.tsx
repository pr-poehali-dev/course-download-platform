import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

export default function BulkGenerateReviewsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [reviewsPerWork, setReviewsPerWork] = useState(2);
  const [limitWorks, setLimitWorks] = useState(50);
  const navigate = useNavigate();

  const REVIEWS_API = func2url.reviews;

  const handleGenerate = async () => {
    if (!confirm(`Сгенерировать по ${reviewsPerWork} отзыва для ${limitWorks} работ?`)) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('📤 Отправка запроса:', {
        url: `${REVIEWS_API}?action=bulk_generate`,
        reviewsPerWork,
        limitWorks
      });

      const response = await fetch(`${REVIEWS_API}?action=bulk_generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'admin_secret_token_2024'
        },
        body: JSON.stringify({
          reviews_per_work: reviewsPerWork,
          limit_works: limitWorks
        })
      });

      console.log('📥 Получен ответ:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ответ с ошибкой:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Данные:', data);

      setResult({
        success: true,
        ...data
      });
    } catch (error) {
      console.error('❌ Ошибка генерации:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка сети. Проверьте консоль браузера (F12)'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container max-w-4xl mx-auto px-4 py-12 mt-16">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold">Массовая генерация отзывов</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Параметры генерации</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Отзывов на одну работу (макс. 5)
              </label>
              <Input
                type="number"
                min={1}
                max={5}
                value={reviewsPerWork}
                onChange={(e) => setReviewsPerWork(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Количество работ для обработки (рекомендуется 50-100 за раз)
              </label>
              <Input
                type="number"
                min={1}
                max={100}
                value={limitWorks}
                onChange={(e) => setLimitWorks(Math.min(100, Math.max(1, parseInt(e.target.value) || 50)))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                ⚡ Для больших объёмов запускайте несколько раз по 100 работ
              </p>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Генерация...
                </>
              ) : (
                <>
                  <Icon name="Sparkles" size={20} className="mr-2" />
                  Сгенерировать отзывы
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className={result.success ? 'border-green-500' : 'border-red-500'}>
            <CardHeader>
              <CardTitle className={result.success ? 'text-green-700' : 'text-red-700'}>
                {result.success ? 'Успешно' : 'Ошибка'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{result.message}</p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Обработано работ</div>
                      <div className="text-2xl font-bold text-blue-700">{result.processed_works}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Создано отзывов</div>
                      <div className="text-2xl font-bold text-green-700">{result.total_reviews_created}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-red-600">{result.error}</p>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Icon name="AlertTriangle" size={20} className="text-yellow-600 mt-1" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-yellow-900">Важная информация:</p>
                <ul className="list-disc list-inside space-y-1 text-yellow-800">
                  <li>Отзывы будут созданы с фейковыми никнеймами</li>
                  <li>Случайная дата создания (1-90 дней назад)</li>
                  <li>Рейтинг 4-5 звезд (70% пятерок, 30% четверок)</li>
                  <li>Автоматически одобрены (status = approved)</li>
                  <li>Работы без достаточного количества пользователей будут пропущены</li>
                  <li>⚡ Генерация ~100 работ занимает 10-20 секунд</li>
                  <li>📊 Для всех 490 работ запустите 5 раз по 100 работ</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}