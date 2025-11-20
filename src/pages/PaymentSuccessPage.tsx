import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/profile';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const orderId = searchParams.get('orderId') || searchParams.get('order_id');
  const paymentId = searchParams.get('paymentId') || searchParams.get('payment_id');

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 shadow-xl">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <Icon name="CheckCircle2" size={48} className="text-green-600" />
              </div>
              
              <CardTitle className="text-3xl font-bold text-green-900 mb-2">
                Оплата прошла успешно!
              </CardTitle>
              
              <CardDescription className="text-lg text-slate-600">
                Баллы уже зачислены на ваш счёт
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {(orderId || paymentId) && (
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  {orderId && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Номер заказа:</span>
                      <span className="font-mono font-semibold text-slate-900">{orderId}</span>
                    </div>
                  )}
                  {paymentId && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">ID платежа:</span>
                      <span className="font-mono font-semibold text-slate-900">{paymentId}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <Icon name="Info" size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <p>
                    Баллы автоматически зачислены на ваш баланс. Вы можете использовать их для покупки работ в каталоге.
                  </p>
                </div>

                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <Icon name="Mail" size={18} className="text-purple-500 mt-0.5 flex-shrink-0" />
                  <p>
                    Чек об оплате отправлен на вашу электронную почту.
                  </p>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <Button 
                  className="w-full" 
                  size="lg"
                  asChild
                >
                  <Link to="/profile">
                    <Icon name="User" size={18} className="mr-2" />
                    Перейти в профиль
                  </Link>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  asChild
                >
                  <Link to="/catalog">
                    <Icon name="ShoppingBag" size={18} className="mr-2" />
                    Перейти в каталог
                  </Link>
                </Button>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-slate-500">
                  Автоматический переход в профиль через{' '}
                  <span className="font-semibold text-slate-700">{countdown}</span> сек
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600 mb-4">
              Возникли вопросы или проблемы?
            </p>
            <Button variant="link" asChild>
              <Link to="/admin/support" className="text-blue-600 hover:text-blue-700">
                <Icon name="MessageCircle" size={16} className="mr-1" />
                Написать в поддержку
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
