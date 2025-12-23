import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { authService } from '@/lib/auth';
import funcUrls from '../../backend/func2url.json';
import Breadcrumbs from '@/components/Breadcrumbs';
import { trackEvent, metrikaEvents } from '@/utils/metrika';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [pendingWorkId, setPendingWorkId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [balanceInfo, setBalanceInfo] = useState<{ old: number; new: number; added: number } | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  
  useEffect(() => {
    trackEvent(metrikaEvents.PAYMENT_SUCCESS);
    
    const workId = localStorage.getItem('pendingWorkPurchase');
    setPendingWorkId(workId);
    
    // Проверяем баланс и показываем начисленные баллы
    checkBalanceUpdate();
    
    // Если есть pending работа, сразу начинаем её покупку
    if (workId) {
      handleAutoPurchase(workId);
    }
  }, []);

  const checkBalanceUpdate = async () => {
    try {
      // Получаем старый баланс из localStorage (если есть)
      const oldBalanceStr = localStorage.getItem('balance_before_payment');
      const oldBalance = oldBalanceStr ? parseInt(oldBalanceStr) : 0;
      
      // Небольшая задержка для обработки webhook на сервере
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Получаем новый баланс с сервера
      const user = await authService.verify();
      if (user) {
        const newBalance = user.balance || 0;
        const added = newBalance - oldBalance;
        
        setBalanceInfo({
          old: oldBalance,
          new: newBalance,
          added: added > 0 ? added : 0
        });
        
        // Обновляем пользователя в localStorage
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      // Очищаем старый баланс
      localStorage.removeItem('balance_before_payment');
    } catch (error) {
      console.error('Error checking balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleAutoPurchase = async (workId: string) => {
    setIsProcessing(true);
    
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setIsProcessing(false);
      return;
    }
    
    const user = JSON.parse(userStr);
    const userId = user.id;
    
    try {
      // Шаг 1: Создаём заказ
      const orderResponse = await fetch(`${funcUrls['purchase-work']}?action=create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId)
        },
        body: JSON.stringify({ workId })
      });
      
      const orderData = await orderResponse.json();
      
      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Ошибка создания заказа');
      }
      
      trackEvent(metrikaEvents.WORK_PURCHASE_CLICK, {
        work_id: workId,
        auto_purchase: true,
        from: 'payment_success_page'
      });
      
      if (orderData.payUrl) {
        // Всё ещё недостаточно баллов
        setIsProcessing(false);
        return;
      }
      
      const downloadToken = orderData.downloadToken;
      if (!downloadToken) {
        throw new Error('Не получен токен для скачивания');
      }
      
      // Шаг 2: Скачивание работы
      const downloadResponse = await fetch(
        `${funcUrls['download-work']}?workId=${encodeURIComponent(workId)}&token=${encodeURIComponent(downloadToken)}`,
        {
          headers: {
            'X-User-Id': String(userId)
          }
        }
      );
      
      if (!downloadResponse.ok) {
        throw new Error('Ошибка скачивания');
      }
      
      const downloadData = await downloadResponse.json();
      
      // Скачиваем файл
      try {
        const fileResponse = await fetch(downloadData.download_url);
        const blob = await fileResponse.blob();
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadData.filename || `work_${workId}.rar`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (fetchError) {
        window.location.href = downloadData.download_url;
      }
      
      trackEvent(metrikaEvents.WORK_DOWNLOAD, {
        work_id: workId,
        auto_purchase: true,
        from: 'payment_success_page'
      });
      
      // Обновляем баланс
      if (user.role !== 'admin' && orderData.newBalance !== undefined) {
        user.balance = orderData.newBalance;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      // Очищаем pending и сразу переходим к защитному пакету
      localStorage.removeItem('pendingWorkPurchase');
      
      // Небольшая задержка для завершения скачивания
      setTimeout(() => {
        navigate(`/defense-kit?workId=${workId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Auto purchase error:', error);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    // Запускаем таймер только если нет pending работы или обработка завершена
    if (isProcessing) return;
    
    const pendingWorkId = localStorage.getItem('pendingWorkPurchase');
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          
          if (pendingWorkId) {
            localStorage.removeItem('pendingWorkPurchase');
            window.location.href = `/work/${pendingWorkId}`;
          } else {
            window.location.href = '/profile';
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isProcessing]);

  const orderId = searchParams.get('orderId') || searchParams.get('order_id');
  const paymentId = searchParams.get('paymentId') || searchParams.get('payment_id');

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Navigation />
      <div className="container mx-auto px-4 pt-20">
        <Breadcrumbs />
      </div>
      <div className="container mx-auto px-4 py-8">
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
                {pendingWorkId 
                  ? isProcessing 
                    ? '📥 Скачиваем работу и готовим защитный пакет...' 
                    : 'Баллы зачислены! Возвращаемся к работе...'
                  : isLoadingBalance
                    ? 'Проверяем начисление баллов...'
                    : balanceInfo && balanceInfo.added > 0
                      ? `На ваш счёт зачислено ${balanceInfo.added} баллов!`
                      : 'Баллы уже зачислены на ваш счёт'
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {balanceInfo && balanceInfo.added > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Icon name="Sparkles" size={24} className="text-green-600" />
                    <h3 className="text-xl font-bold text-green-900">Баллы начислены!</h3>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold text-green-600">
                      +{balanceInfo.added}
                    </div>
                    <div className="text-sm text-slate-600">
                      Новый баланс: <span className="font-semibold text-slate-900">{balanceInfo.new} баллов</span>
                    </div>
                  </div>
                </div>
              )}
              
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
                  {isProcessing 
                    ? '⏳ Обрабатываем вашу покупку...'
                    : <>
                        Автоматический переход {pendingWorkId ? 'к защитному пакету' : 'в профиль'} через{' '}
                        <span className="font-semibold text-slate-700">{countdown}</span> сек
                      </>
                  }
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