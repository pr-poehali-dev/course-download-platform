import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../backend/func2url.json';

export default function BotSubscriptionPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const user = await authService.verify();
      if (!user) {
        navigate('/login');
        return;
      }
      setCurrentUser(user);
      await checkSubscription(user.id);
    };
    initAuth();
  }, []);

  const checkSubscription = async (userId: number) => {
    try {
      const response = await fetch(`${func2url['bot-subscription']}?user_id=${userId}`);
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to check subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!currentUser) return;

    setPurchasing(true);
    try {
      // Активируем подписку
      const response = await fetch(func2url['bot-subscription'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          payment_id: `payment_${Date.now()}`,
          months: 1
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Подписка активирована!',
          description: 'Теперь вы можете пользоваться ботом в Telegram',
        });
        await checkSubscription(currentUser.id);
      } else {
        throw new Error(data.message || 'Ошибка активации');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  const hasAccess = subscription?.has_access;
  const isAdmin = subscription?.is_admin;
  const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full mb-6 backdrop-blur-sm border border-blue-500/30">
            <Icon name="MessageCircle" size={20} className="text-blue-600" />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              TechMentor AI в Telegram
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Подписка на Telegram-бота
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Получи круглосуточного AI-помощника для учёбы прямо в мессенджере
          </p>
        </div>

        {isAdmin && (
          <Card className="mb-8 border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4">
                <Icon name="Crown" size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-green-700">Администратор</h3>
              <p className="text-muted-foreground mb-6">
                У вас есть бесплатный доступ к боту без ограничений
              </p>
              <a href="https://t.me/TechForma_bot" target="_blank" rel="noopener noreferrer" className="inline-block">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 w-full">
                  <Icon name="MessageCircle" size={20} className="mr-2" />
                  Открыть бота
                </Button>
              </a>
            </CardContent>
          </Card>
        )}

        {!isAdmin && hasAccess && (
          <Card className="mb-8 border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="CheckCircle" size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-green-700">Подписка активна</h3>
                  <p className="text-muted-foreground mb-4">
                    {expiresAt ? `Действует до ${expiresAt.toLocaleDateString('ru-RU')}` : 'Бессрочная подписка'}
                  </p>
                  <a href="https://t.me/TechForma_bot" target="_blank" rel="noopener noreferrer" className="inline-block">
                    <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 w-full">
                      <Icon name="MessageCircle" size={20} className="mr-2" />
                      Открыть бота
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!isAdmin && !hasAccess && (
          <Card className="mb-8 border-2 border-blue-200 bg-white shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                <Icon name="MessageCircle" size={40} className="text-white" />
              </div>
              <CardTitle className="text-3xl mb-2">Месячная подписка</CardTitle>
              <CardDescription className="text-lg">Неограниченный доступ к AI-помощнику</CardDescription>
              
              <div className="mt-6">
                <div className="text-5xl font-bold text-blue-600 mb-2">3 000₽</div>
                <div className="text-sm text-muted-foreground">за месяц</div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-6 space-y-3">
                <h4 className="font-semibold text-lg mb-3">Что входит в подписку:</h4>
                <div className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Ответы на вопросы 24/7</p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Помощь с учёбой и заданиями</p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Консультации по работам</p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Неограниченное количество запросов</p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">GigaChat AI под капотом</p>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                onClick={handlePurchase}
                disabled={purchasing}
              >
                {purchasing ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Активация...
                  </>
                ) : (
                  <>
                    <Icon name="ShoppingCart" size={20} className="mr-2" />
                    Оформить подписку за 3 000₽
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Нажимая кнопку, вы соглашаетесь с условиями использования
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center p-6 border-2 hover:border-blue-400 transition-all">
            <Icon name="Clock" size={32} className="text-blue-600 mx-auto mb-3" />
            <h3 className="font-bold mb-2">24/7 Доступ</h3>
            <p className="text-sm text-muted-foreground">Бот работает круглосуточно без выходных</p>
          </Card>

          <Card className="text-center p-6 border-2 hover:border-blue-400 transition-all">
            <Icon name="Zap" size={32} className="text-blue-600 mx-auto mb-3" />
            <h3 className="font-bold mb-2">Мгновенные ответы</h3>
            <p className="text-sm text-muted-foreground">Получай ответы в течение секунд</p>
          </Card>

          <Card className="text-center p-6 border-2 hover:border-blue-400 transition-all">
            <Icon name="Shield" size={32} className="text-blue-600 mx-auto mb-3" />
            <h3 className="font-bold mb-2">Безопасность</h3>
            <p className="text-sm text-muted-foreground">Все данные защищены и конфиденциальны</p>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-slate-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="HelpCircle" size={24} className="text-blue-600" />
              Часто задаваемые вопросы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Что умеет бот?</h4>
              <p className="text-sm text-muted-foreground">
                Бот помогает с учёбой, отвечает на вопросы, консультирует по работам в каталоге и помогает с оформлением заданий.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Можно ли продлить подписку?</h4>
              <p className="text-sm text-muted-foreground">
                Да, вы можете продлить подписку в любой момент. Новый срок добавится к текущему.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Есть ли ограничения?</h4>
              <p className="text-sm text-muted-foreground">
                Нет, при активной подписке вы можете задавать неограниченное количество вопросов боту.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}