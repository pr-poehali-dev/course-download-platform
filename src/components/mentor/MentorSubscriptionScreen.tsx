import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../../backend/func2url.json';

interface MentorSubscriptionScreenProps {
  userId: number;
}

export default function MentorSubscriptionScreen({ userId }: MentorSubscriptionScreenProps) {
  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    try {
      const response = await fetch(func2url['ai-subscription'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          plan
        })
      });
      const data = await response.json();
      if (data.success) {
        window.location.href = data.payment_url;
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать платёж',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <SEO title="Оформить подписку — TechMentor" />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Icon name="GraduationCap" size={28} className="text-primary" />
              <div>
                <h1 className="text-xl font-bold">TechForma</h1>
                <p className="text-xs text-muted-foreground">TechMentor</p>
              </div>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm">
                <Icon name="Home" size={18} className="mr-2" />
                На главную
              </Button>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Icon name="Sparkles" size={14} className="mr-1" />
              AI-репетитор для студентов
            </Badge>
            <h1 className="text-5xl font-bold mb-4">TechMentor PRO</h1>
            <p className="text-xl text-muted-foreground">
              Персональный AI-помощник, который помогает разобраться в материале
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="MessageSquare" size={24} className="text-blue-600" />
                </div>
                <CardTitle>Умный чат</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Задавай вопросы и получай развёрнутые ответы с примерами и пояснениями
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="FileCheck" size={24} className="text-purple-600" />
                </div>
                <CardTitle>Проверка работ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Загружай курсовые и дипломы для детального анализа и рекомендаций
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="BookOpen" size={24} className="text-green-600" />
                </div>
                <CardTitle>Планы работ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Составляй структуру и чек-листы для курсовых и дипломных работ
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-2 border-primary/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-bold">
                Популярно
              </div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-3xl mb-2">Месяц</CardTitle>
                <div className="text-5xl font-bold mb-2">299₽</div>
                <CardDescription>~10₽ в день</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span>Безлимитный чат с AI</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span>Проверка работ (PDF/DOCX)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span>Составление планов</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span>История сообщений</span>
                </div>
                <Button className="w-full mt-4" size="lg" onClick={() => handleSubscribe('monthly')}>
                  <Icon name="Zap" size={18} className="mr-2" />
                  Оформить подписку
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">Год</CardTitle>
                <div className="text-5xl font-bold mb-2">2490₽</div>
                <CardDescription>
                  <span className="line-through text-muted-foreground">3588₽</span>
                  {' '}экономия 1098₽
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span>Все возможности месячной</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Star" size={16} className="text-yellow-600" />
                  <span>Приоритетная поддержка</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Gift" size={16} className="text-purple-600" />
                  <span>+200 баллов в подарок</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="TrendingDown" size={16} className="text-blue-600" />
                  <span>~7₽ в день (-30%)</span>
                </div>
                <Button className="w-full mt-4" size="lg" variant="outline" onClick={() => handleSubscribe('yearly')}>
                  <Icon name="Sparkles" size={18} className="mr-2" />
                  Год со скидкой
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-center">Как начать пользоваться</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Оформи подписку</h4>
                  <p className="text-sm text-muted-foreground">
                    Выбери удобный тариф и оплати картой
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Получи доступ</h4>
                  <p className="text-sm text-muted-foreground">
                    Сразу после оплаты открывается полный функционал
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Учись эффективно</h4>
                  <p className="text-sm text-muted-foreground">
                    Задавай вопросы, проверяй работы, составляй планы
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
