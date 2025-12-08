import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { trackEvent, metrikaEvents } from '@/utils/metrika';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (amount: number) => void;
  userEmail: string;
}

interface PaymentPackage {
  points: number;
  price: number;
  bonus: number;
  popular?: boolean;
}

const PACKAGES: PaymentPackage[] = [
  { points: 100, price: 500, bonus: 10 },
  { points: 600, price: 3000, bonus: 100, popular: true },
  { points: 1500, price: 7500, bonus: 300 },
];

export default function PaymentDialog({ open, onOpenChange, onSuccess, userEmail }: PaymentDialogProps) {
  const [paymentReady, setPaymentReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState('');

  useEffect(() => {
    if (open) {
      trackEvent(metrikaEvents.PAYMENT_OPEN);
    }
  }, [open]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const funcUrls = await import('../../backend/func2url.json');
        const response = await fetch(funcUrls.payment);
        const data = await response.json();
        setPaymentReady(data.ready);
      } catch (error) {
        console.error('Failed to load payment config:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handlePayment = async (pkg: PaymentPackage) => {
    trackEvent(metrikaEvents.PAYMENT_OPEN, { 
      package: pkg.points, 
      price: pkg.price 
    });
    
    try {
      const funcUrls = await import('../../backend/func2url.json');
      const { authService } = await import('@/lib/auth');
      const user = await authService.verify();
      
      if (!user) {
        toast({
          title: 'Ошибка',
          description: 'Необходимо войти в систему',
          variant: 'destructive',
        });
        return;
      }

      const packageIdMap: Record<number, string> = {
        100: '100',
        600: '600',
        1500: '1500'
      };
      
      const baseUrl = window.location.origin;
      
      const response = await fetch(funcUrls.payment, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'init_tinkoff',
          user_id: user.id,
          user_email: user.email,
          package_id: packageIdMap[pkg.points],
          success_url: `${baseUrl}/payment/success`,
          fail_url: `${baseUrl}/payment/failed`
        }),
      });

      const data = await response.json();
      
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать платёж',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при создании платежа',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="py-12 text-center">
            <Icon name="Loader2" size={48} className="mx-auto text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Загрузка платёжной системы...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!paymentReady) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="AlertCircle" size={24} className="text-yellow-600" />
              Настройка платежей
            </DialogTitle>
            <DialogDescription>
              Платёжная система ещё не настроена. Пожалуйста, добавьте ключи Тинькофф Кассы в настройках проекта.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Coins" size={32} className="text-white" />
          </div>
          <DialogTitle className="text-center text-2xl">Покупка баллов</DialogTitle>
          <DialogDescription className="text-center">
            1 балл = 5₽. Выберите подходящий пакет с бонусами
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          {PACKAGES.map((pkg) => (
            <Card 
              key={pkg.points}
              className={`relative overflow-hidden transition-all hover:shadow-xl ${
                pkg.popular ? 'border-2 border-primary' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                  ПОПУЛЯРНОЕ
                </div>
              )}
              
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Icon name="Coins" size={24} className="text-yellow-500" />
                    <span className="text-3xl font-bold">{pkg.points}</span>
                  </div>
                  {pkg.bonus > 0 && (
                    <div className="flex items-center justify-center gap-1 text-green-600">
                      <Icon name="Gift" size={16} />
                      <span className="text-sm font-semibold">+{pkg.bonus} бонус</span>
                    </div>
                  )}
                </div>

                <div className="text-center mb-4">
                  <div className="text-3xl font-bold">{pkg.price} ₽</div>
                  <div className="text-xs text-muted-foreground">
                    {pkg.bonus > 0 ? `${(pkg.price / (pkg.points + pkg.bonus)).toFixed(1)} ₽/балл` : '5 ₽/балл'}
                  </div>
                </div>

                {pkg.bonus > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-800">Всего получите:</span>
                      <span className="text-lg font-bold text-green-700">
                        {pkg.points + pkg.bonus}
                      </span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => handlePayment(pkg)}
                  className={`w-full h-12 text-lg ${
                    pkg.popular 
                      ? 'gradient-purple-blue' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                  }`}
                >
                  <Icon name="CreditCard" size={20} className="mr-2" />
                  Купить
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Icon name="Shield" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground mb-1">Безопасная оплата</p>
              <p>Платежи обрабатываются через Тинькофф Кассу. Мы не храним данные ваших карт. Поддерживаем все российские карты и СБП.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}