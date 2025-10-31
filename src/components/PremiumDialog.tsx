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
      const response = await fetch(func2url.premium, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: 'Premium активирован!',
          description: data.message,
        });
        onSuccess();
        onOpenChange(false);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось оформить подписку',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
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
                <h3 className="text-3xl font-bold">299₽/месяц</h3>
                <p className="text-purple-100">Безлимитный доступ ко всем работам</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="Download" size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Безлимит скачиваний</h4>
                    <p className="text-sm text-muted-foreground">Скачивайте сколько хотите без ограничений</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="Zap" size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Мгновенный доступ</h4>
                    <p className="text-sm text-muted-foreground">Без ожидания и лимитов</p>
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

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                <p className="font-medium flex items-center gap-2">
                  <Icon name="Info" size={16} className="text-primary" />
                  Бесплатный вариант (без Premium):
                </p>
                <ul className="space-y-1 text-muted-foreground ml-6">
                  <li>• Только 2 скачивания в неделю</li>
                  <li>• Загружайте работы, чтобы получить +100 баллов</li>
                  <li>• Каждое скачивание вашей работы = +10 баллов</li>
                </ul>
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
                Оформить Premium за 299₽
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
