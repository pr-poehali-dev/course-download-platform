import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

const ADMIN_EMAIL = 'rekrutiw@yandex.ru';

interface StatData {
  totalVisits: number;
  uniqueVisitors: number;
  registeredUsers: number;
  totalPurchases: number;
  revenue: number;
  popularWorks: Array<{
    id: number;
    title: string;
    purchases: number;
    revenue: number;
  }>;
  recentActivity: Array<{
    id: number;
    type: 'visit' | 'register' | 'purchase';
    description: string;
    timestamp: string;
  }>;
}

const MOCK_STATS: StatData = {
  totalVisits: 15234,
  uniqueVisitors: 8945,
  registeredUsers: 1204,
  totalPurchases: 3456,
  revenue: 892450,
  popularWorks: [
    { id: 1, title: 'Разработка веб-приложения на React', purchases: 234, revenue: 117000 },
    { id: 2, title: 'Проект системы водоснабжения', purchases: 189, revenue: 37800 },
    { id: 3, title: 'Анализ рынка криптовалют 2024', purchases: 156, revenue: 23400 },
    { id: 4, title: 'Исследование алгоритмов машинного обучения', purchases: 142, revenue: 63900 },
    { id: 5, title: 'Маркетинговая стратегия для стартапа', purchases: 128, revenue: 15360 },
  ],
  recentActivity: [
    { id: 1, type: 'purchase', description: 'Куплена работа "React приложение"', timestamp: '2 минуты назад' },
    { id: 2, type: 'register', description: 'Новый пользователь: user@example.com', timestamp: '15 минут назад' },
    { id: 3, type: 'visit', description: 'Новое посещение из Москвы', timestamp: '23 минуты назад' },
    { id: 4, type: 'purchase', description: 'Куплена работа "Проект водоснабжения"', timestamp: '1 час назад' },
    { id: 5, type: 'register', description: 'Новый пользователь: student@mail.ru', timestamp: '2 часа назад' },
  ]
};

export default function AdminPanel() {
  const [adminEmail, setAdminEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats] = useState<StatData>(MOCK_STATS);

  const handleLogin = () => {
    if (adminEmail === ADMIN_EMAIL) {
      setIsAuthenticated(true);
      toast({
        title: 'Вход выполнен',
        description: 'Добро пожаловать в админ-панель'
      });
    } else {
      toast({
        title: 'Ошибка доступа',
        description: 'Неверный email администратора',
        variant: 'destructive'
      });
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'purchase': return 'ShoppingCart';
      case 'register': return 'UserPlus';
      case 'visit': return 'Eye';
      default: return 'Activity';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'text-green-600';
      case 'register': return 'text-blue-600';
      case 'visit': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container max-w-md mx-auto py-24 px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Shield" size={32} className="text-primary" />
            </div>
            <CardTitle>Админ-панель</CardTitle>
            <CardDescription>
              Статистика и управление платформой
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email администратора</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                <Icon name="LogIn" size={18} className="mr-2" />
                Войти
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Админ-панель</h1>
          <p className="text-muted-foreground">Статистика и аналитика платформы</p>
        </div>
        <Button onClick={() => setIsAuthenticated(false)} variant="outline">
          <Icon name="LogOut" size={18} className="mr-2" />
          Выйти
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <Icon name="BarChart3" size={18} className="mr-2" />
            Обзор
          </TabsTrigger>
          <TabsTrigger value="sales">
            <Icon name="TrendingUp" size={18} className="mr-2" />
            Продажи
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Icon name="Activity" size={18} className="mr-2" />
            Активность
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="gradient-purple-blue">
              <CardHeader className="pb-2">
                <CardDescription className="text-white/80 flex items-center gap-2">
                  <Icon name="Eye" size={18} />
                  Всего посещений
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-1">
                  {stats.totalVisits.toLocaleString('ru-RU')}
                </div>
                <p className="text-sm text-white/80">
                  <Icon name="TrendingUp" size={14} className="inline mr-1" />
                  +12% за месяц
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-green-yellow">
              <CardHeader className="pb-2">
                <CardDescription className="text-white/80 flex items-center gap-2">
                  <Icon name="Users" size={18} />
                  Уникальных посетителей
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-1">
                  {stats.uniqueVisitors.toLocaleString('ru-RU')}
                </div>
                <p className="text-sm text-white/80">
                  <Icon name="TrendingUp" size={14} className="inline mr-1" />
                  +8% за месяц
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-purple-pink">
              <CardHeader className="pb-2">
                <CardDescription className="text-white/80 flex items-center gap-2">
                  <Icon name="UserCheck" size={18} />
                  Зарегистрировано
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-1">
                  {stats.registeredUsers.toLocaleString('ru-RU')}
                </div>
                <p className="text-sm text-white/80">
                  <Icon name="TrendingUp" size={14} className="inline mr-1" />
                  +15% за месяц
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-orange-red">
              <CardHeader className="pb-2">
                <CardDescription className="text-white/80 flex items-center gap-2">
                  <Icon name="DollarSign" size={18} />
                  Выручка
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-1">
                  {stats.revenue.toLocaleString('ru-RU')} ₽
                </div>
                <p className="text-sm text-white/80">
                  <Icon name="TrendingUp" size={14} className="inline mr-1" />
                  +23% за месяц
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Конверсия посетителей</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Регистрация</span>
                      <span className="text-sm text-muted-foreground">
                        {((stats.registeredUsers / stats.uniqueVisitors) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(stats.registeredUsers / stats.uniqueVisitors) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Покупка</span>
                      <span className="text-sm text-muted-foreground">
                        {((stats.totalPurchases / stats.registeredUsers) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${(stats.totalPurchases / stats.registeredUsers) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Средние показатели</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon name="ShoppingBag" size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Средний чек</p>
                        <p className="text-2xl font-bold">{Math.round(stats.revenue / stats.totalPurchases)} ₽</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Icon name="User" size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Покупок на пользователя</p>
                        <p className="text-2xl font-bold">{(stats.totalPurchases / stats.registeredUsers).toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Trophy" size={24} className="text-yellow-500" />
                Топ продаж
              </CardTitle>
              <CardDescription>Самые популярные работы на платформе</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.popularWorks.map((work, index) => (
                  <div key={work.id} className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                    <div className="text-3xl font-bold text-primary/50 w-8">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{work.title}</h4>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="ShoppingCart" size={14} />
                          {work.purchases} покупок
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="DollarSign" size={14} />
                          {work.revenue.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {work.revenue.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Всего продаж</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalPurchases.toLocaleString('ru-RU')}</div>
                <p className="text-sm text-muted-foreground mt-1">За всё время</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Общая выручка</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.revenue.toLocaleString('ru-RU')} ₽</div>
                <p className="text-sm text-muted-foreground mt-1">За всё время</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Средний чек</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{Math.round(stats.revenue / stats.totalPurchases)} ₽</div>
                <p className="text-sm text-muted-foreground mt-1">На одну покупку</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Activity" size={24} />
                Последняя активность
              </CardTitle>
              <CardDescription>События в режиме реального времени</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'purchase' ? 'bg-green-100' :
                      activity.type === 'register' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      <Icon 
                        name={getActivityIcon(activity.type)} 
                        size={20} 
                        className={getActivityColor(activity.type)} 
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
