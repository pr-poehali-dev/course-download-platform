import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../../backend/func2url.json';

export default function EmailCampaignsTab() {
  const [sendingPayment, setSendingPayment] = useState(false);
  const [sendingFavorites, setSendingFavorites] = useState(false);
  const [sendingInactive, setSendingInactive] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);

  const sendTriggerEmails = async (type: string) => {
    const setLoading = {
      'payment': setSendingPayment,
      'favorites': setSendingFavorites,
      'inactive': setSendingInactive,
      'all': setSendingAll
    }[type];

    if (!setLoading) return;

    setLoading(true);

    try {
      console.log(`📧 Отправка триггерных писем типа: ${type}`);
      
      const response = await fetch(func2url['trigger-emails'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'admin_secret_token_2024'
        },
        body: JSON.stringify({ type })
      });

      const data = await response.json();
      
      console.log('Ответ от сервера:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      // Показываем результаты
      const results = data.results || {};
      const totalSent = Object.values(results).reduce((sum: number, r: any) => sum + (r.sent || 0), 0);
      const totalFound = Object.values(results).reduce((sum: number, r: any) => sum + (r.total || 0), 0);
      
      let message = `✅ Отправлено ${totalSent} из ${totalFound} писем\n\n`;
      
      if (results.payment) {
        message += `⏰ Напоминание о пополнении: ${results.payment.sent}/${results.payment.total}\n`;
      }
      if (results.favorites) {
        message += `💝 Брошенное избранное: ${results.favorites.sent}/${results.favorites.total}\n`;
      }
      if (results.inactive) {
        message += `👋 Реактивация: ${results.inactive.sent}/${results.inactive.total}\n`;
      }

      toast({
        title: '📧 Рассылка завершена!',
        description: message,
        duration: 8000,
      });

    } catch (error) {
      console.error('Ошибка отправки триггерных писем:', error);
      toast({
        title: '❌ Ошибка отправки',
        description: error instanceof Error ? error.message : 'Не удалось запустить рассылку',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Mail" size={24} className="text-blue-600" />
            Триггерные Email-рассылки
          </CardTitle>
          <CardDescription>
            Автоматические письма для мотивации пользователей. Используй Python скрипт для запуска.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Напоминание о пополнении */}
          <Card className="border-2 border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">⏰</span>
                Напоминание о пополнении
              </CardTitle>
              <CardDescription>
                Отправляется через 48 часов после регистрации пользователям без пополнений
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground space-y-1">
                <p>✅ Акция: +20% бонус при пополнении от 500₽</p>
                <p>✅ Промокод на 100 баллов (30 дней)</p>
                <p>✅ Преимущества платформы</p>
              </div>
              <Button 
                onClick={() => sendTriggerEmails('payment')}
                disabled={sendingPayment}
                className="w-full"
              >
                {sendingPayment ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={16} className="mr-2" />
                    Запустить рассылку
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Брошенное избранное */}
          <Card className="border-2 border-pink-200 bg-pink-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">💝</span>
                Брошенное избранное
              </CardTitle>
              <CardDescription>
                Отправляется через 3 дня пользователям, которые добавили работы в избранное, но не купили
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground space-y-1">
                <p>✅ Список избранных работ (до 3 шт)</p>
                <p>✅ Напоминание о популярности</p>
                <p>✅ Прямые ссылки на покупку</p>
              </div>
              <Button 
                onClick={() => sendTriggerEmails('favorites')}
                disabled={sendingFavorites}
                className="w-full"
                variant="secondary"
              >
                {sendingFavorites ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={16} className="mr-2" />
                    Запустить рассылку
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Реактивация */}
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">👋</span>
                Реактивация неактивных
              </CardTitle>
              <CardDescription>
                Отправляется пользователям, которые не заходили 14+ дней
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground space-y-1">
                <p>✅ Что нового на платформе</p>
                <p>✅ 50+ новых работ</p>
                <p>✅ Защитный пакет к работам</p>
              </div>
              <Button 
                onClick={() => sendTriggerEmails('inactive')}
                disabled={sendingInactive}
                className="w-full"
                variant="outline"
              >
                {sendingInactive ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={16} className="mr-2" />
                    Запустить рассылку
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Все сразу */}
          <Card className="border-2 border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="Zap" size={24} className="text-green-600" />
                Запустить все триггеры
              </CardTitle>
              <CardDescription>
                Отправить все 3 типа писем одновременно (рекомендуется для регулярного использования)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => sendTriggerEmails('all')}
                disabled={sendingAll}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {sendingAll ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Отправка всех писем...
                  </>
                ) : (
                  <>
                    <Icon name="Sparkles" size={18} className="mr-2" />
                    Запустить все рассылки
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Инструкция */}
          <Card className="border-2 border-yellow-200 bg-yellow-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="Info" size={24} className="text-yellow-600" />
                Как запускать триггерные письма
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <p className="font-semibold">Вариант 1: Ручной запуск через Python</p>
                <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                  python trigger-emails-cron.py [payment|favorites|inactive|all]
                </div>
                
                <p className="font-semibold mt-4">Вариант 2: Автоматизация через cron</p>
                <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                  # Напоминание о пополнении (каждые 6 часов)<br/>
                  0 */6 * * * python trigger-emails-cron.py payment<br/>
                  <br/>
                  # Брошенное избранное (раз в день в 10:00)<br/>
                  0 10 * * * python trigger-emails-cron.py favorites<br/>
                  <br/>
                  # Реактивация (раз в день в 12:00)<br/>
                  0 12 * * * python trigger-emails-cron.py inactive
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  📖 Подробная документация: <code>TRIGGER_EMAILS_README.md</code>
                </p>
              </div>
            </CardContent>
          </Card>

        </CardContent>
      </Card>

      {/* Статистика писем */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" size={24} className="text-purple-600" />
            Статистика Email-рассылок
          </CardTitle>
          <CardDescription>
            Мониторинг эффективности триггерных писем
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Отправлено</span>
                <Icon name="Send" size={16} className="text-purple-600" />
              </div>
              <div className="text-2xl font-bold">—</div>
              <div className="text-xs text-muted-foreground mt-1">За последние 7 дней</div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Открыто</span>
                <Icon name="Eye" size={16} className="text-green-600" />
              </div>
              <div className="text-2xl font-bold">—</div>
              <div className="text-xs text-muted-foreground mt-1">Open Rate</div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Клики</span>
                <Icon name="MousePointer" size={16} className="text-blue-600" />
              </div>
              <div className="text-2xl font-bold">—</div>
              <div className="text-xs text-muted-foreground mt-1">Click Rate</div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            💡 Статистика доступна в <a href="https://resend.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Resend Dashboard</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}