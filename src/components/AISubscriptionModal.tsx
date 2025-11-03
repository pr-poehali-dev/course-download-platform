import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import func2url from '../../backend/func2url.json';

interface AISubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onSubscribe: (type: 'single' | 'monthly' | 'yearly') => void;
  userPoints: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  role?: string;
}

export default function AISubscriptionModal({ open, onClose, onSubscribe, userPoints }: AISubscriptionModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      type: 'single' as const,
      name: 'Стандарт',
      price: 50,
      requests: 100,
      icon: 'Zap',
      description: '100 запросов к AI помощнику',
      features: [
        '100 запросов к AI помощнику',
        'Загрузка файлов',
        'История чата',
        'Действует 30 дней'
      ]
    },
    {
      type: 'monthly' as const,
      name: 'Безлимит',
      price: 100,
      requests: -1,
      icon: 'Infinity',
      description: 'Безлимитные запросы на 30 дней',
      features: [
        'Безлимитные запросы',
        'Загрузка файлов',
        'История чата',
        'Приоритетная поддержка',
        'Действует 30 дней'
      ],
      popular: true
    },
    {
      type: 'yearly' as const,
      name: 'Бесплатно',
      price: 0,
      requests: 0,
      icon: 'Gift',
      description: 'Доступен всем пользователям',
      features: [
        'Ограниченный доступ',
        'Базовые функции',
        'Без поддержки файлов'
      ],
      badge: 'Для знакомства'
    }
  ];

  const handleSubscribe = async (type: 'single' | 'monthly' | 'yearly') => {
    const plan = plans.find(p => p.type === type);
    if (!plan) return;

    if (userPoints < plan.price) {
      toast({
        title: 'Недостаточно баллов',
        description: `Для покупки нужно ${plan.price} баллов. У вас: ${userPoints}`,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('Пользователь не авторизован');
      }
      const user: User = JSON.parse(userStr);
      
      const response = await fetch(func2url['ai-subscription'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(user.id)
        },
        body: JSON.stringify({
          subscriptionType: type
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при оформлении подписки');
      }

      toast({
        title: 'Подписка оформлена!',
        description: `${plan.name} успешно активирована`
      });

      onSubscribe(type);
      onClose();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось оформить подписку',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Icon name="Bot" size={28} className="text-primary" />
            Подписка на AI помощника
          </DialogTitle>
          <DialogDescription>
            Выберите подходящий тариф. 1 балл = 5₽ (Стандарт 249₽, Безлимит 499₽)
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 flex items-center gap-2 text-sm">
          <Icon name="Wallet" size={16} />
          <span>Ваш баланс: <strong>{userPoints} баллов</strong></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card 
              key={plan.type} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">{plan.badge}</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
                  <Icon name={plan.icon as any} size={32} className="text-primary" />
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center py-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold">{plan.price}</div>
                  <div className="text-sm text-muted-foreground">баллов</div>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Icon name="Check" size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan.type)}
                  disabled={plan.price === 0 || loading || (plan.price > 0 && userPoints < plan.price)}
                >
                  {plan.price === 0 ? 'Доступен всем' : loading ? 'Оформление...' : 'Оформить подписку'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="space-y-4 mt-6">
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="Crown" size={20} className="text-yellow-600 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-bold">💡 Выгоднее с Premium!</p>
                <p className="text-muted-foreground">
                  Premium (399₽/мес) = Безлимитный ИИ + Скидка 30% на работы. Выгоднее, чем покупать ИИ отдельно!
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-primary mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium">Как работает помощник?</p>
                <p className="text-muted-foreground">
                  TechMentor Pro помогает адаптировать купленные работы под требования вашего ВУЗа. 
                  Он не пишет за вас, а учит работать самостоятельно через пошаговые инструкции.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}