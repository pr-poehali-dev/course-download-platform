import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';
import func2url from '../../backend/func2url.json';

interface AIPremiumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: number;
  onSuccess: () => void;
}

interface AIPlan {
  name: string;
  price: number;
  requests: string;
  popular?: boolean;
  features: string[];
}

const AI_PLANS: AIPlan[] = [
  {
    name: 'Базовый',
    price: 0,
    requests: '5 запросов/мес',
    features: [
      'Адаптация работ',
      'Объяснение решений',
      'Базовая проверка',
    ]
  },
  {
    name: 'Стандарт',
    price: 249,
    requests: '50 запросов/мес',
    popular: true,
    features: [
      'Всё из Базового',
      'Генерация материалов',
      'Проверка на плагиат',
      'Приоритет в ответах',
    ]
  },
  {
    name: 'Безлимит',
    price: 499,
    requests: 'Безлимит',
    features: [
      'Всё из Стандарта',
      'Неограниченные запросы',
      'Эксклюзивные модели ИИ',
      'Персональная поддержка',
    ]
  },
];

export default function AIPremiumDialog({
  open,
  onOpenChange,
  userId,
  onSuccess
}: AIPremiumDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (plan: AIPlan) => {
    if (plan.price === 0) {
      toast({
        title: 'Базовый тариф',
        description: 'Этот тариф уже доступен всем пользователям бесплатно',
      });
      return;
    }

    if (!userId) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите, чтобы оформить подписку',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const userEmail = localStorage.getItem('user_email') || '';
      
      const response = await fetch(func2url.payment, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_payment',
          user_email: userEmail,
          user_id: userId,
          price: plan.price,
          payment_type: 'ai_subscription',
          plan_name: plan.name,
          return_url: window.location.origin + '/?payment=success'
        })
      });
      
      const data = await response.json();
      
      if (data.confirmation_url) {
        window.location.href = data.confirmation_url;
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось создать платёж',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to create payment:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось оформить подписку',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Icon name="Bot" size={28} className="text-blue-600" />
            TechMentor Pro — ИИ-помощник
          </DialogTitle>
          <DialogDescription>
            Выберите тариф подписки на ИИ-помощника для адаптации работ
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {AI_PLANS.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative transition-all hover:shadow-xl ${
                plan.popular ? 'border-2 border-blue-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  ПОПУЛЯРНОЕ
                </div>
              )}
              
              <CardContent className="pt-6 space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  {plan.price === 0 ? (
                    <div className="text-3xl font-bold text-green-600">Бесплатно</div>
                  ) : (
                    <div className="text-3xl font-bold">{plan.price}₽<span className="text-sm text-muted-foreground">/мес</span></div>
                  )}
                  <Badge variant="outline" className="mt-2">{plan.requests}</Badge>
                </div>

                <div className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <Icon name="Check" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading || (plan.price === 0)}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' 
                      : plan.price === 0
                      ? 'bg-muted text-muted-foreground'
                      : ''
                  }`}
                  variant={plan.price === 0 ? 'outline' : 'default'}
                >
                  {plan.price === 0 ? (
                    <>
                      <Icon name="Check" size={16} className="mr-2" />
                      Доступен всем
                    </>
                  ) : loading ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      Обработка...
                    </>
                  ) : (
                    <>
                      <Icon name="CreditCard" size={16} className="mr-2" />
                      Оформить за {plan.price}₽
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 mt-4">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Icon name="Crown" size={24} className="text-yellow-600 flex-shrink-0" />
              <div className="space-y-2">
                <p className="font-bold text-lg">💡 Выгоднее с Premium подпиской!</p>
                <p className="text-sm text-muted-foreground">
                  Premium (399₽/мес) включает безлимитный ИИ-помощник + скидку 30% на все работы.
                  Это выгоднее, чем покупать ИИ-подписку отдельно за 499₽!
                </p>
                <Button 
                  variant="outline" 
                  className="mt-2 border-purple-500 text-purple-700 hover:bg-purple-100"
                  onClick={() => {
                    onOpenChange(false);
                  }}
                >
                  <Icon name="Crown" size={16} className="mr-2" />
                  Посмотреть Premium
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Подписка автоматически продлевается каждый месяц. Отменить можно в любой момент.
        </p>
      </DialogContent>
    </Dialog>
  );
}