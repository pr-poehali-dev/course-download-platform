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
  { points: 100, price: 500, bonus: 0 },
  { points: 500, price: 2500, bonus: 0, popular: true },
  { points: 5000, price: 5000, bonus: 0 },
];

declare global {
  interface Window {
    cp?: any;
  }
}

export default function PaymentDialog({ open, onOpenChange, onSuccess, userEmail }: PaymentDialogProps) {
  const [publicId, setPublicId] = useState('');
  const [loading, setLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const funcUrls = await import('../../backend/func2url.json');
        const response = await fetch(funcUrls.payment);
        const data = await response.json();
        if (data.public_id) {
          setPublicId(data.public_id);
        }
      } catch (error) {
        console.error('Failed to load payment config:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  useEffect(() => {
    if (!scriptLoaded) {
      const script = document.createElement('script');
      script.src = 'https://widget.cloudpayments.ru/bundles/cloudpayments.js';
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [scriptLoaded]);

  const handlePayment = (pkg: PaymentPackage) => {
    if (!publicId || !scriptLoaded || !window.cp) {
      toast({
        title: 'Ошибка',
        description: 'Платёжная система ещё загружается, попробуйте через пару секунд',
        variant: 'destructive',
      });
      return;
    }

    const widget = new window.cp.CloudPayments();
    const totalPoints = pkg.points + pkg.bonus;

    widget.pay('charge', {
      publicId: publicId,
      description: `Покупка ${pkg.points} баллов${pkg.bonus ? ` + ${pkg.bonus} бонусных` : ''}`,
      amount: pkg.price,
      currency: 'RUB',
      accountId: userEmail,
      invoiceId: `${Date.now()}`,
      skin: 'mini',
      data: {
        points: pkg.points,
        bonus: pkg.bonus,
        total: totalPoints,
      },
    }, {
      onSuccess: function() {
        onSuccess(totalPoints);
        onOpenChange(false);
        toast({
          title: 'Оплата успешна! 🎉',
          description: `+${totalPoints} баллов зачислено на ваш счёт`,
        });
      },
      onFail: function(reason: string) {
        toast({
          title: 'Ошибка оплаты',
          description: reason || 'Платёж не прошёл, попробуйте ещё раз',
          variant: 'destructive',
        });
      },
      onComplete: function() {
        console.log('Payment completed');
      }
    });
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

  if (!publicId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="AlertCircle" size={24} className="text-yellow-600" />
              Настройка платежей
            </DialogTitle>
            <DialogDescription>
              Платёжная система ещё не настроена. Пожалуйста, добавьте ключи CloudPayments в настройках проекта.
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
            Выберите подходящий пакет баллов
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
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
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="Coins" size={24} className="text-yellow-500" />
                      <span className="text-3xl font-bold">{pkg.points}</span>
                    </div>
                    {pkg.bonus > 0 && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Icon name="Gift" size={16} />
                        <span className="text-sm font-semibold">+{pkg.bonus} бонус</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{pkg.price} ₽</div>
                    <div className="text-xs text-muted-foreground">
                      {(pkg.price / pkg.points).toFixed(1)} ₽/балл
                    </div>
                  </div>
                </div>

                {pkg.bonus > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-800">Всего получите:</span>
                      <span className="text-lg font-bold text-green-700">
                        {pkg.points + pkg.bonus} баллов
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
                  Купить за {pkg.price} ₽
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
              <p>Платежи обрабатываются через CloudPayments. Мы не храним данные ваших карт. Поддерживаем карты Visa, MasterCard, МИР, а также СБП.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}