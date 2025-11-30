import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

export default function ReviewsCleanupPage() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Автоматически запускаем очистку и генерацию при загрузке страницы
    runFullProcess();
  }, []);

  const runFullProcess = async () => {
    setLoading(true);
    
    // Шаг 1: Очистка дубликатов
    setStatus('Шаг 1/2: Удаление дубликатов...');
    try {
      const cleanupResponse = await fetch(func2url['auto-generate-reviews'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'admin_secret_token_2024'
        },
        body: JSON.stringify({ action: 'cleanup' })
      });

      const cleanupData = await cleanupResponse.json();
      
      if (!cleanupResponse.ok) {
        throw new Error(cleanupData.error || 'Ошибка очистки');
      }

      setStatus(`✅ Шаг 1: Удалено ${cleanupData.total_deleted} дубликатов`);
      
      // Пауза 2 секунды
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Шаг 2: Генерация уникальных отзывов
      setStatus('Шаг 2/2: Генерация уникальных отзывов...');
      
      const generateResponse = await fetch(func2url['auto-generate-reviews'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'admin_secret_token_2024'
        },
        body: JSON.stringify({ 
          action: 'generate',
          reviews_per_work: 3 
        })
      });

      const generateData = await generateResponse.json();
      
      if (!generateResponse.ok) {
        throw new Error(generateData.error || 'Ошибка генерации');
      }

      setStatus('✅ Готово!');
      setResult({
        cleanup: cleanupData,
        generate: generateData
      });
      
    } catch (error: any) {
      setStatus(`❌ Ошибка: ${error.message}`);
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
          <h1 className="text-3xl font-bold">Очистка и генерация отзывов</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Статус операции</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {loading && <Icon name="Loader2" size={24} className="animate-spin text-blue-600" />}
                {!loading && result && <Icon name="CheckCircle" size={24} className="text-green-600" />}
                <p className="text-lg font-semibold">{status}</p>
              </div>

              {result && (
                <div className="mt-6 space-y-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-blue-900 mb-2">Шаг 1: Очистка дубликатов</h3>
                      <p className="text-blue-800">🗑️ Удалено дубликатов: {result.cleanup.total_deleted}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-green-900 mb-2">Шаг 2: Генерация отзывов</h3>
                      <p className="text-green-800">✅ Создано отзывов: {result.generate.total_reviews_created}</p>
                      <p className="text-green-800">✅ Обработано работ: {result.generate.processed_works}</p>
                      <p className="text-green-700">ℹ️ Пропущено: {result.generate.skipped_works}</p>
                    </CardContent>
                  </Card>

                  <Button 
                    onClick={() => navigate('/admin')} 
                    className="w-full"
                    size="lg"
                  >
                    Вернуться в админ-панель
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
