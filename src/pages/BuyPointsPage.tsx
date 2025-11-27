import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { authService } from '@/lib/auth';
import func2url from '../../backend/func2url.json';
import { getTimeRemaining, formatTime } from '@/utils/urgencyTriggers';
import Breadcrumbs from '@/components/Breadcrumbs';

interface PointsPackage {
  id: number;
  points: number;
  price: number;
  bonus: number;
  popular?: boolean;
  description: string;
}

export default function BuyPointsPage() {
  const [selectedPackage, setSelectedPackage] = useState<PointsPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining());

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await authService.verify();
      if (!currentUser) {
        window.location.href = '/login';
        return;
      }
      setUser(currentUser);
    };
    checkAuth();
  }, []);

  // Таймер обратного отсчёта для триггера срочности
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const packages: PointsPackage[] = [
    {
      id: 1,
      points: 100,
      price: 500,
      bonus: 10,
      description: 'Для пробы'
    },
    {
      id: 2,
      points: 600,
      price: 3000,
      bonus: 100,
      popular: true,
      description: 'Самый популярный'
    },
    {
      id: 3,
      points: 1500,
      price: 7500,
      bonus: 300,
      description: 'Выгодная сделка'
    },
    {
      id: 4,
      points: 3000,
      price: 15000,
      bonus: 700,
      description: 'Максимальная выгода'
    }
  ];

  const handlePurchase = async () => {
    if (!selectedPackage || !user) {
      toast({
        title: 'Ошибка',
        description: 'Выберите пакет баллов',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const packageIdMap: Record<number, string> = {
        1: '100',
        2: '600',
        3: '1500',
        4: '3000'
      };

      const baseUrl = window.location.origin;
      
      const response = await fetch(func2url['payment'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'init_tinkoff',
          user_id: user.id,
          user_email: user.email,
          package_id: packageIdMap[selectedPackage.id],
          success_url: `${baseUrl}/payment/success`,
          fail_url: `${baseUrl}/payment/failed`
        })
      });

      const data = await response.json();

      if (data.payment_url) {
        // Сохраняем текущий баланс перед оплатой
        localStorage.setItem('balance_before_payment', String(user.balance || 0));
        window.location.href = data.payment_url;
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать платёж',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при создании платежа',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <Breadcrumbs />
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" asChild>
            <Link to="/profile">
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Назад в профиль
            </Link>
          </Button>

          <h1 className="text-4xl font-bold mb-2">Покупка баллов</h1>
          <p className="text-muted-foreground">1 балл = 5₽. Пакеты с бонусами выгоднее</p>
          
          {/* Триггер срочности - таймер */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <Icon name="Clock" size={16} className="text-red-600" />
            <span className="text-sm font-medium text-red-900">
              До конца акции: <span className="font-bold">{formatTime(timeLeft)}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedPackage?.id === pkg.id ? 'ring-2 ring-primary' : ''
              } ${pkg.popular ? 'border-primary' : ''}`}
              onClick={() => setSelectedPackage(pkg)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl">{pkg.points + pkg.bonus}</CardTitle>
                  <div className="flex gap-2">
                    {pkg.popular && (
                      <>
                        <Badge className="bg-primary">Популярно</Badge>
                        <Badge className="bg-red-600 text-white animate-pulse">
                          <Icon name="Flame" size={12} className="mr-1" />
                          Акция
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Баллов</span>
                    <span className="font-semibold">{pkg.points}</span>
                  </div>
                  {pkg.bonus > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Бонус</span>
                      <span className="font-semibold text-green-600">+{pkg.bonus}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t">
                    <div className="flex items-baseline justify-between">
                      <span className="text-muted-foreground">Цена</span>
                      <div>
                        <span className="text-3xl font-bold">{pkg.price}</span>
                        <span className="text-muted-foreground ml-1">₽</span>
                      </div>
                    </div>
                    {pkg.bonus > 0 && (
                      <p className="text-xs text-green-600 text-right mt-1">
                        Экономия {Math.round((pkg.bonus / (pkg.points + pkg.bonus)) * 100)}%
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedPackage && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Подтверждение покупки</CardTitle>
              <CardDescription>Вы будете перенаправлены на страницу оплаты Тинькофф</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Баллов к зачислению:</span>
                  <span className="font-semibold text-lg">
                    {selectedPackage.points + selectedPackage.bonus}
                  </span>
                </div>
                {selectedPackage.bonus > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">В том числе бонус:</span>
                    <span className="font-semibold text-lg text-green-600">
                      +{selectedPackage.bonus}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-muted-foreground">К оплате:</span>
                  <span className="font-bold text-2xl">{selectedPackage.price} ₽</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Icon name="Info" size={18} className="text-blue-600" />
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  Доступна оплата картой (Visa, MasterCard, МИР) и через СБП
                </p>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePurchase}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Создание платежа...
                  </>
                ) : (
                  <>
                    <Icon name="CreditCard" size={18} className="mr-2" />
                    Перейти к оплате
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Нажимая кнопку, вы соглашаетесь с{' '}
                <Link to="/terms-of-service" className="underline">
                  условиями использования
                </Link>
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Часто задаваемые вопросы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Icon name="HelpCircle" size={18} className="text-primary" />
                Как использовать баллы?
              </h4>
              <p className="text-sm text-muted-foreground">
                Баллы используются для покупки студенческих работ в нашем каталоге. 1 балл = 1 рубль при покупке работ. Покупайте больше баллов — получайте больше бонусных баллов в подарок!
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Icon name="HelpCircle" size={18} className="text-primary" />
                Сгорают ли баллы?
              </h4>
              <p className="text-sm text-muted-foreground">
                Нет, баллы не имеют срока действия и остаются на вашем балансе до использования.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Icon name="HelpCircle" size={18} className="text-primary" />
                Можно ли вернуть деньги?
              </h4>
              <p className="text-sm text-muted-foreground">
                Да, возврат возможен в течение 24 часов с момента покупки, если баллы не были использованы. 
                Обратитесь в поддержку через раздел "Поддержка" в профиле с указанием номера транзакции.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Icon name="HelpCircle" size={18} className="text-primary" />
                Как получить бонусные баллы?
              </h4>
              <p className="text-sm text-muted-foreground">
                Покупайте большие пакеты — чем больше пакет, тем больше бонусных баллов вы получите.
                Также можно заработать баллы, загружая свои работы или приглашая друзей.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}