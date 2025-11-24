import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';
import func2url from '../../backend/func2url.json';

interface PremiumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: number;
  onSuccess: () => void;
}

export default function PremiumDialog({
  open,
  onOpenChange,
  userId,
  onSuccess
}: PremiumDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!userId) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите, чтобы оформить Premium',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Получить user email
      const userEmail = localStorage.getItem('user_email') || '';
      
      // Создать платёж через ЮKassa
      const response = await fetch(func2url.payment, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_payment',
          user_email: userEmail,
          user_id: userId,
          price: 399,
          payment_type: 'premium',
          return_url: window.location.origin + '/?payment=success'
        })
      });
      
      const data = await response.json();
      
      if (data.confirmation_url) {
        // Перенаправить на страницу оплаты ЮKassa
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Icon name="Crown" size={28} className="text-yellow-500" />
            Premium подписка
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <Icon name="Sparkles" size={56} className="mx-auto" />
                <h3 className="text-3xl font-bold">399₽/месяц</h3>
                <p className="text-purple-100">Скидка 30% на все работы в каталоге</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="Percent" size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Скидка 30% на все работы</h4>
                    <p className="text-sm text-muted-foreground">Работа за 100 баллов = только 70 баллов</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="Star" size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Приоритетная поддержка</h4>
                    <p className="text-sm text-muted-foreground">Быстрая помощь в подборе работ</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="Shield" size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Приоритет</h4>
                    <p className="text-sm text-muted-foreground">Первоочередная поддержка</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="Star" size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Эксклюзив</h4>
                    <p className="text-sm text-muted-foreground">Доступ к премиум-работам</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-200">
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm">
                <p className="font-bold text-lg flex items-center gap-2">
                  <Icon name="Calculator" size={20} className="text-purple-600" />
                  Экономия с Premium:
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span className="text-muted-foreground">Без Premium: 10 работ по 100 баллов</span>
                    <span className="font-bold text-red-600">1000₽</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span className="text-muted-foreground">С Premium: 10 работ по 70 баллов</span>
                    <span className="font-bold text-green-600">700₽</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span className="text-muted-foreground">+ Подписка</span>
                    <span className="font-bold">+399₽</span>
                  </div>
                  <div className="border-t-2 border-purple-300 pt-2 flex justify-between items-center">
                    <span className="font-bold text-lg">Итого экономия:</span>
                    <span className="font-bold text-2xl text-green-600">-99₽</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic mt-2">
                  + Приоритетная поддержка и ранний доступ к новым работам
                </p>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleSubscribe} 
            disabled={loading || !userId}
            className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Обработка...
              </>
            ) : (
              <>
                <Icon name="Crown" size={20} className="mr-2" />
                Оформить Premium за 399₽
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Подписка автоматически продлевается каждый месяц. Отменить можно в любой момент.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}