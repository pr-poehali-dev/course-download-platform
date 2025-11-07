import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/lib/auth';

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'ready' | 'processing' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [orderInfo, setOrderInfo] = useState<any>(null);

  useEffect(() => {
    const user = authService.getUser();
    
    if (!orderId || !user) {
      setStatus('error');
      setMessage('Неверная ссылка на оплату');
      return;
    }

    fetch(`https://functions.poehali.dev/7f219e70-5e9f-44d1-9011-e6246d4274a9?action=order-status&orderId=${orderId}`, {
      headers: {
        'X-User-Id': user.id.toString()
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setOrderInfo(data);
          if (data.status === 'paid') {
            setStatus('success');
            setMessage('Заказ уже оплачен');
          } else {
            setStatus('ready');
          }
        } else {
          setStatus('error');
          setMessage(data.error || 'Заказ не найден');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Ошибка загрузки информации о заказе');
      });
  }, [orderId]);

  const handlePay = async () => {
    const user = authService.getUser();
    if (!user || !orderId) return;

    setStatus('processing');
    setMessage('Подтверждаем оплату...');

    try {
      const response = await fetch('https://functions.poehali.dev/7f219e70-5e9f-44d1-9011-e6246d4274a9?action=mock-pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString()
        },
        body: JSON.stringify({ orderId: parseInt(orderId) })
      });

      const data = await response.json();

      if (data.ok && data.status === 'paid') {
        setStatus('success');
        setMessage('Оплата прошла успешно! Переходим к скачиванию...');
        setTimeout(() => {
          navigate(`/work/${orderInfo?.work_id}`);
        }, 1500);
      } else {
        setStatus('error');
        setMessage(data.error || 'Не удалось подтвердить оплату');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Ошибка при обработке оплаты');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Требуется авторизация</h2>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card rounded-xl shadow-lg p-8 border border-border">
        <h1 className="text-2xl font-bold mb-6 text-center">Оплата заказа</h1>

        {status === 'loading' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загружаем информацию...</p>
          </div>
        )}

        {status === 'ready' && orderInfo && (
          <div className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Заказ №</span>
                <span className="font-semibold">{orderInfo.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Сумма</span>
                <span className="text-2xl font-bold">{(orderInfo.amount_cents / 100).toFixed(0)} ₽</span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                ⚠️ <strong>Демо-режим:</strong> Это тестовая оплата. В реальной системе здесь будет интеграция с платёжным провайдером.
              </p>
            </div>

            <button
              onClick={handlePay}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Оплатить {(orderInfo.amount_cents / 100).toFixed(0)} ₽
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Отменить
            </button>
          </div>
        )}

        {status === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold mb-2">Оплата успешна!</p>
            <p className="text-muted-foreground">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-lg font-semibold mb-2">Ошибка</p>
            <p className="text-muted-foreground mb-6">{message}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Вернуться назад
            </button>
          </div>
        )}
      </div>
    </div>
  );
}