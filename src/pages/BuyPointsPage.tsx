import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'sbp' | null>(null);

  const packages: PointsPackage[] = [
    {
      id: 1,
      points: 50,
      price: 250,
      bonus: 0,
      description: 'Для пробы'
    },
    {
      id: 2,
      points: 100,
      price: 500,
      bonus: 20,
      popular: true,
      description: 'Самый популярный'
    },
    {
      id: 3,
      points: 200,
      price: 1000,
      bonus: 50,
      description: 'Выгодная сделка'
    },
    {
      id: 4,
      points: 500,
      price: 2500,
      bonus: 150,
      description: 'Максимальная выгода'
    },
    {
      id: 5,
      points: 1000,
      price: 5000,
      bonus: 350,
      description: 'Для профессионалов'
    }
  ];

  const handlePurchase = () => {
    if (!selectedPackage || !paymentMethod) {
      toast({
        title: 'Ошибка',
        description: 'Выберите пакет и способ оплаты',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Переход к оплате',
      description: `Пакет ${selectedPackage.points + selectedPackage.bonus} баллов за ${selectedPackage.price}₽`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" asChild>
            <Link to="/profile">
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Назад в профиль
            </Link>
          </Button>

          <h1 className="text-4xl font-bold mb-2">Покупка баллов</h1>
          <p className="text-muted-foreground">1 балл = 5₽. Пакеты с бонусами выгоднее</p>
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
                  {pkg.popular && (
                    <Badge className="bg-primary">Популярно</Badge>
                  )}
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
              <CardTitle>Способ оплаты</CardTitle>
              <CardDescription>Выберите удобный способ оплаты</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${
                  paymentMethod === 'card' ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="CreditCard" size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Банковская карта</p>
                    <p className="text-sm text-muted-foreground">Visa, MasterCard, МИР</p>
                  </div>
                  {paymentMethod === 'card' && (
                    <Icon name="CheckCircle2" size={24} className="ml-auto text-primary" />
                  )}
                </div>
              </div>

              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${
                  paymentMethod === 'sbp' ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setPaymentMethod('sbp')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Smartphone" size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Система Быстрых Платежей (СБП)</p>
                    <p className="text-sm text-muted-foreground">Оплата через мобильное приложение банка</p>
                  </div>
                  {paymentMethod === 'sbp' && (
                    <Icon name="CheckCircle2" size={24} className="ml-auto text-primary" />
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Баллов к зачислению:</span>
                    <span className="font-semibold text-lg">
                      {selectedPackage.points + selectedPackage.bonus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">К оплате:</span>
                    <span className="font-bold text-2xl">{selectedPackage.price} ₽</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePurchase}
                  disabled={!paymentMethod}
                >
                  <Icon name="ShoppingCart" size={18} className="mr-2" />
                  Оплатить {selectedPackage.price} ₽
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Нажимая кнопку, вы соглашаетесь с{' '}
                  <Link to="/terms-of-service" className="underline">
                    условиями использования
                  </Link>
                </p>
              </div>
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
                Баллы используются для покупки студенческих работ в нашем каталоге. 1 балл = 1 рубль при покупке работ.
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
                Можно ли вернуть баллы?
              </h4>
              <p className="text-sm text-muted-foreground">
                Баллы не подлежат возврату, но вы можете использовать их для покупки любых работ на платформе.
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