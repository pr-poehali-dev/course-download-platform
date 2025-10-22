import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import WorkManager from '@/components/WorkManager';

const ADMIN_EMAIL = 'rekrutiw@yandex.ru';

interface StatData {
  totalWorks: number;
  totalUsers: number;
  totalPurchases: number;
  totalRevenue: number;
  popularWorks: Array<{
    id: number;
    title: string;
    purchases: number;
    revenue: number;
  }>;
}

export default function AdminPanel() {
  const [adminEmail, setAdminEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<StatData>({
    totalWorks: 0,
    totalUsers: 0,
    totalPurchases: 0,
    totalRevenue: 0,
    popularWorks: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/a16a43fc-fa7d-4c72-ad15-ba566d2c7413');
      const data = await response.json();
      
      if (data.works) {
        const totalWorks = data.works.length;
        const totalRevenue = data.works.reduce((sum: number, w: any) => sum + (w.price || w.price_points || 0), 0);
        
        setStats({
          totalWorks,
          totalUsers: 0,
          totalPurchases: 0,
          totalRevenue,
          popularWorks: data.works.slice(0, 5).map((w: any, idx: number) => ({
            id: w.id || idx,
            title: w.title,
            purchases: 0,
            revenue: w.price || w.price_points || 0
          }))
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <TabsTrigger value="seller-stats">
            <Icon name="TrendingUp" size={18} className="mr-2" />
            Статистика продавца
          </TabsTrigger>
          <TabsTrigger value="add-work">
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить работу
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add-work" className="space-y-6">
          <WorkManager adminEmail={ADMIN_EMAIL} />
        </TabsContent>

        <TabsContent value="seller-stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="gradient-green-yellow">
              <CardHeader className="pb-2">
                <div className="text-white/80 flex items-center gap-2 text-sm">
                  <Icon name="FileText" size={18} />
                  Загружено работ
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-1">12</div>
                <p className="text-sm text-white/80">В каталоге</p>
              </CardContent>
            </Card>

            <Card className="gradient-purple-pink">
              <CardHeader className="pb-2">
                <div className="text-white/80 flex items-center gap-2 text-sm">
                  <Icon name="Download" size={18} />
                  Скачиваний
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-1">348</div>
                <p className="text-sm text-white/80">Всего продаж</p>
              </CardContent>
            </Card>

            <Card className="gradient-orange-red">
              <CardHeader className="pb-2">
                <div className="text-white/80 flex items-center gap-2 text-sm">
                  <Icon name="Coins" size={18} />
                  Заработано
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-1">5,220</div>
                <p className="text-sm text-white/80">Баллов получено</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Популярные работы</CardTitle>
              <CardDescription>Топ по количеству покупок</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'Проектирование базы данных', sales: 45, revenue: 675 },
                  { title: 'Курсовая по менеджменту', sales: 38, revenue: 570 },
                  { title: 'Анализ финансовых показателей', sales: 32, revenue: 480 },
                  { title: 'Разработка мобильного приложения', sales: 28, revenue: 1400 }
                ].map((work, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{work.title}</p>
                      <p className="text-sm text-muted-foreground">{work.sales} продаж</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary flex items-center gap-1">
                        <Icon name="Coins" size={16} />
                        {work.revenue}
                      </p>
                      <p className="text-sm text-muted-foreground">баллов</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Динамика продаж</CardTitle>
              <CardDescription>Последние 7 дней</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, idx) => {
                  const sales = Math.floor(Math.random() * 15) + 5;
                  return (
                    <div key={day} className="flex items-center gap-4">
                      <span className="text-sm w-8 text-muted-foreground">{day}</span>
                      <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-primary to-purple-500 h-full flex items-center justify-end pr-2"
                          style={{ width: `${(sales / 20) * 100}%` }}
                        >
                          <span className="text-xs text-white font-medium">{sales}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={48} className="animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="gradient-purple-blue">
                  <CardHeader className="pb-2">
                    <div className="text-white/80 flex items-center gap-2 text-sm">
                      <Icon name="FileText" size={18} />
                      Всего работ
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-white mb-1">
                      {stats.totalWorks}
                    </div>
                    <p className="text-sm text-white/80">
                      В каталоге
                    </p>
                  </CardContent>
                </Card>

                <Card className="gradient-green-yellow">
                  <CardHeader className="pb-2">
                    <div className="text-white/80 flex items-center gap-2 text-sm">
                      <Icon name="Users" size={18} />
                      Пользователи
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-white mb-1">
                      {stats.totalUsers}
                    </div>
                    <p className="text-sm text-white/80">
                      Зарегистрировано
                    </p>
                  </CardContent>
                </Card>

                <Card className="gradient-purple-pink">
                  <CardHeader className="pb-2">
                    <div className="text-white/80 flex items-center gap-2 text-sm">
                      <Icon name="ShoppingCart" size={18} />
                      Покупки
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-white mb-1">
                      {stats.totalPurchases}
                    </div>
                    <p className="text-sm text-white/80">
                      Всего продано
                    </p>
                  </CardContent>
                </Card>

                <Card className="gradient-orange-red">
                  <CardHeader className="pb-2">
                    <div className="text-white/80 flex items-center gap-2 text-sm">
                      <Icon name="Coins" size={18} />
                      Общая стоимость
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-white mb-1">
                      {stats.totalRevenue}
                    </div>
                    <p className="text-sm text-white/80">
                      Баллов в каталоге
                    </p>
                  </CardContent>
                </Card>
              </div>

              {stats.popularWorks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Работы в каталоге</CardTitle>
                    <CardDescription>Последние добавленные работы</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.popularWorks.map((work) => (
                        <div key={work.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Icon name="FileText" size={24} className="text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{work.title}</p>
                              <p className="text-sm text-muted-foreground">{work.revenue} баллов</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}