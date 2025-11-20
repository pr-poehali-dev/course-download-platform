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
  { id: '50', points: 50, price: 250 },
  { id: '100', points: 100, price: 500, bonus: 20, popular: true },
  { id: '200', points: 200, price: 1000, bonus: 50 },
  { id: '500', points: 500, price: 2500, bonus: 150 },
  { id: '1000', points: 1000, price: 5000, bonus: 350 },
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

      const baseUrl = window.location.origin;
      
      const response = await fetch(func2url.payment, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'init_tinkoff',
          user_id: userData.id,
          user_email: userData.email,
          package_id: packageId,
          success_url: `${baseUrl}/payment/success`,
          fail_url: `${baseUrl}/payment/failed`
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка создания платежа');
      }

      const data = await response.json();
      
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error(data.error || 'Не получена ссылка на оплату');
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
        </CardContent>
      </Card>
    </div>
  );
}