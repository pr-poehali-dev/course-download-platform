import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function PaymentFailedPage() {
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get('orderId') || searchParams.get('order_id');
  const errorMessage = searchParams.get('message') || 'Платёж не был завершён';

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <Navigation />
      <div className="container mx-auto px-4 pt-20">
        <Breadcrumbs />
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 shadow-xl">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <Icon name="XCircle" size={48} className="text-red-600" />
              </div>
              
              <CardTitle className="text-3xl font-bold text-red-900 mb-2">
                Ошибка оплаты
              </CardTitle>
              
              <CardDescription className="text-lg text-slate-600">
                {errorMessage}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {orderId && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Номер заказа:</span>
                    <span className="font-mono font-semibold text-slate-900">{orderId}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold text-slate-900">Возможные причины:</h3>
                
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <Icon name="AlertCircle" size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <p>Недостаточно средств на карте</p>
                </div>

                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <Icon name="AlertCircle" size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <p>Операция отклонена банком</p>
                </div>

                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <Icon name="AlertCircle" size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <p>Превышено время ожидания</p>
                </div>

                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <Icon name="AlertCircle" size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <p>Технический сбой платёжной системы</p>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <Button 
                  className="w-full" 
                  size="lg"
                  asChild
                >
                  <Link to="/buy-points">
                    <Icon name="RotateCcw" size={18} className="mr-2" />
                    Попробовать снова
                  </Link>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  asChild
                >
                  <Link to="/profile">
                    <Icon name="User" size={18} className="mr-2" />
                    Вернуться в профиль
                  </Link>
                </Button>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Деньги не списаны</p>
                    <p className="text-blue-700">
                      Если платёж не прошёл, средства не списываются с вашего счёта. 
                      Вы можете попробовать оплатить снова или выбрать другой способ оплаты.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600 mb-4">
              Проблема повторяется?
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