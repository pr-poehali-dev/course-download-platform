import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { authService } from '@/lib/auth';
import func2url from '../../../backend/func2url.json';

interface BalancePackage {
  id: string;
  points: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

const BALANCE_PACKAGES: BalancePackage[] = [
  { id: '100', points: 100, price: 99 },
  { id: '300', points: 300, price: 249, popular: true },
  { id: '500', points: 500, price: 399, bonus: 50 },
  { id: '1000', points: 1000, price: 699, bonus: 150 },
  { id: '2000', points: 2000, price: 1299, bonus: 400 },
];

export default function BalanceTab() {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId);
    
    try {
      const userData = await authService.verify();
      if (!userData) {
        toast({
          title: 'Ошибка',
          description: 'Необходимо войти в систему',
          variant: 'destructive'
        });
        return;
      }

      const response = await fetch(func2url.payment, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_payment',
          user_email: userData.email,
          user_id: userData.id,
          package_id: packageId,
          payment_type: 'points',
          return_url: `${window.location.origin}/profile?tab=balance&payment=success`
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка создания платежа');
      }

      const data = await response.json();
      
      if (data.confirmation_url) {
        window.location.href = data.confirmation_url;
      } else {
        throw new Error('Не получена ссылка на оплату');
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать платеж',
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Wallet" size={24} className="text-primary" />
            Пополнение баланса
          </CardTitle>
          <CardDescription>
            Выберите пакет баллов для пополнения. После оплаты баллы автоматически зачислятся на ваш счёт.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BALANCE_PACKAGES.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  pkg.popular ? 'border-2 border-blue-500' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                    Популярное
                  </div>
                )}
                {pkg.bonus && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-3 py-1 rounded-br-lg font-medium">
                    +{pkg.bonus} бонус
                  </div>
                )}
                
                <CardContent className="pt-6 pb-4 text-center space-y-4">
                  <div>
                    <div className="text-4xl font-bold text-primary mb-1">
                      {pkg.points}
                    </div>
                    <div className="text-sm text-muted-foreground">баллов</div>
                  </div>

                  {pkg.bonus && (
                    <Badge variant="secondary" className="bg-green-50 text-green-700">
                      Итого: {pkg.points + pkg.bonus} баллов
                    </Badge>
                  )}

                  <div className="text-3xl font-bold">
                    {pkg.price} ₽
                  </div>

                  <Button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={loading === pkg.id}
                    className="w-full"
                    size="lg"
                  >
                    {loading === pkg.id ? (
                      <>
                        <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <Icon name="CreditCard" className="mr-2 h-4 w-4" />
                        Купить
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">Как это работает:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Выберите пакет и нажмите «Купить»</li>
                  <li>Вы будете перенаправлены на страницу оплаты ЮКасса</li>
                  <li>Оплатите удобным способом (карта, СБП, электронные кошельки)</li>
                  <li>После успешной оплаты баллы автоматически зачислятся на ваш счёт</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Shield" size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold mb-1">Безопасность платежей</p>
                <p>
                  Все платежи защищены технологией 3D-Secure. Мы не храним данные ваших карт.
                  Платежи обрабатывает ЮКасса — сертифицированный платёжный сервис.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
