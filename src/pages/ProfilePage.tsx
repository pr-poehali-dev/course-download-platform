import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { authService } from '@/lib/auth';

interface UserProfile {
  name: string;
  email: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  worksUploaded: number;
  worksPurchased: number;
  rating: number;
  registrationDate: string;
}

interface Purchase {
  id: number;
  workTitle: string;
  price: number;
  date: string;
  downloadUrl: string;
  yandexDiskLink?: string;
}

interface Upload {
  id: number;
  title: string;
  price: number;
  sales: number;
  status: 'active' | 'moderation' | 'rejected';
  uploadDate: string;
}

interface Transaction {
  id: number;
  type: 'purchase' | 'sale' | 'refund' | 'bonus';
  amount: number;
  description: string;
  date: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>({
    name: 'Александр Иванов',
    email: 'alex.ivanov@example.com',
    balance: 350,
    totalEarned: 1200,
    totalSpent: 850,
    worksUploaded: 8,
    worksPurchased: 15,
    rating: 4.8,
    registrationDate: '2024-01-15'
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('payment') === 'success') {
      toast({
        title: 'Платёж успешно обработан!',
        description: 'Баллы зачислены на ваш счёт',
      });
      
      authService.verify().then((userData) => {
        if (userData) {
          setUser(prev => ({ ...prev, balance: userData.balance }));
        }
      });
      
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const [purchases] = useState<Purchase[]>([
    {
      id: 1,
      workTitle: 'Курсовая по менеджменту',
      price: 150,
      date: '2024-10-20',
      downloadUrl: '#'
    },
    {
      id: 2,
      workTitle: 'Проектирование базы данных',
      price: 200,
      date: '2024-10-18',
      downloadUrl: '#'
    },
    {
      id: 3,
      workTitle: 'Анализ финансовых показателей',
      price: 100,
      date: '2024-10-15',
      downloadUrl: '#'
    }
  ]);

  const [uploads] = useState<Upload[]>([
    {
      id: 1,
      title: 'Разработка мобильного приложения',
      price: 500,
      sales: 12,
      status: 'active',
      uploadDate: '2024-09-15'
    },
    {
      id: 2,
      title: 'Курсовая работа по маркетингу',
      price: 150,
      sales: 8,
      status: 'active',
      uploadDate: '2024-09-10'
    },
    {
      id: 3,
      title: 'Отчет по практике',
      price: 100,
      sales: 0,
      status: 'moderation',
      uploadDate: '2024-10-22'
    }
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: 1,
      type: 'sale',
      amount: 500,
      description: 'Продажа работы "Разработка мобильного приложения"',
      date: '2024-10-23'
    },
    {
      id: 2,
      type: 'purchase',
      amount: -150,
      description: 'Покупка работы "Курсовая по менеджменту"',
      date: '2024-10-20'
    },
    {
      id: 3,
      type: 'bonus',
      amount: 100,
      description: 'Бонус за регистрацию',
      date: '2024-01-15'
    }
  ]);

  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(user.name);

  const handleSaveProfile = () => {
    setEditMode(false);
    toast({
      title: 'Профиль обновлен',
      description: 'Изменения успешно сохранены'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Активна</Badge>;
      case 'moderation':
        return <Badge className="bg-yellow-500">На модерации</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Отклонена</Badge>;
      default:
        return <Badge>Неизвестно</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" asChild>
            <Link to="/">
              <Icon name="Home" size={18} className="mr-2" />
              На главную
            </Link>
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Личный кабинет</h1>
              <p className="text-muted-foreground">Управление профилем и работами</p>
            </div>
            <Button asChild>
              <Link to="/upload">
                <Icon name="Upload" size={18} className="mr-2" />
                Загрузить работу
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="gradient-blue-cyan">
            <CardHeader className="pb-2">
              <div className="text-white/80 flex items-center gap-2 text-sm">
                <Icon name="Wallet" size={18} />
                Баланс
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white mb-1">{user.balance}</div>
              <p className="text-sm text-white/80">баллов</p>
              <Button variant="secondary" size="sm" className="mt-3 w-full" asChild>
                <Link to="/buy-points">
                  <Icon name="Plus" size={14} className="mr-1" />
                  Пополнить
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="gradient-green-yellow">
            <CardHeader className="pb-2">
              <div className="text-white/80 flex items-center gap-2 text-sm">
                <Icon name="TrendingUp" size={18} />
                Заработано
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white mb-1">{user.totalEarned}</div>
              <p className="text-sm text-white/80">всего баллов</p>
            </CardContent>
          </Card>

          <Card className="gradient-purple-pink">
            <CardHeader className="pb-2">
              <div className="text-white/80 flex items-center gap-2 text-sm">
                <Icon name="FileText" size={18} />
                Мои работы
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white mb-1">{user.worksUploaded}</div>
              <p className="text-sm text-white/80">загружено</p>
            </CardContent>
          </Card>

          <Card className="gradient-orange-red">
            <CardHeader className="pb-2">
              <div className="text-white/80 flex items-center gap-2 text-sm">
                <Icon name="Star" size={18} />
                Рейтинг
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white mb-1">{user.rating}</div>
              <p className="text-sm text-white/80">из 5.0</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <Icon name="User" size={18} className="mr-2" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="earnings">
              <Icon name="TrendingUp" size={18} className="mr-2" />
              Заработок
            </TabsTrigger>
            <TabsTrigger value="purchases">
              <Icon name="ShoppingBag" size={18} className="mr-2" />
              Покупки
            </TabsTrigger>
            <TabsTrigger value="uploads">
              <Icon name="Upload" size={18} className="mr-2" />
              Мои работы
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <Icon name="Receipt" size={18} className="mr-2" />
              Транзакции
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Всего заработано</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{user.totalEarned}</div>
                  <p className="text-sm text-muted-foreground mt-1">баллов за все время</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Продано работ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {uploads.reduce((sum, work) => sum + work.sales, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">всего продаж</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Средний чек</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {uploads.reduce((sum, work) => sum + work.sales, 0) > 0
                      ? Math.round(user.totalEarned / uploads.reduce((sum, work) => sum + work.sales, 0))
                      : 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">баллов за работу</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Популярные работы</CardTitle>
                <CardDescription>Топ работ по количеству продаж</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploads
                    .filter(work => work.sales > 0)
                    .sort((a, b) => b.sales - a.sales)
                    .map((work, index) => (
                      <div key={work.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{work.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {work.sales} продаж × {work.price} баллов
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{work.sales * work.price}</div>
                          <p className="text-xs text-muted-foreground">заработано</p>
                        </div>
                      </div>
                    ))}
                  {uploads.filter(work => work.sales > 0).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Icon name="TrendingUp" size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Пока нет продаж</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>История заработка</CardTitle>
                <CardDescription>Последние продажи ваших работ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions
                    .filter(t => t.type === 'sale')
                    .map(transaction => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <Icon name="TrendingUp" size={20} className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-green-600">+{transaction.amount}</div>
                      </div>
                    ))}
                  {transactions.filter(t => t.type === 'sale').length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Icon name="Receipt" size={48} className="mx-auto mb-2 opacity-50" />
                      <p>История продаж пуста</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Личная информация</CardTitle>
                  {!editMode ? (
                    <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                      <Icon name="Edit" size={16} className="mr-2" />
                      Редактировать
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                        Отмена
                      </Button>
                      <Button size="sm" onClick={handleSaveProfile}>
                        <Icon name="Save" size={16} className="mr-2" />
                        Сохранить
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editMode ? (
                  <>
                    <div className="space-y-2">
                      <Label>Имя</Label>
                      <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user.email} disabled />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon name="User" size={20} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Имя</p>
                        <p className="font-semibold">{user.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon name="Mail" size={20} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-semibold">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon name="Calendar" size={20} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Дата регистрации</p>
                        <p className="font-semibold">
                          {new Date(user.registrationDate).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Реферальная программа</CardTitle>
                <CardDescription>Приглашай друзей и получай бонусы</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input value="https://techforma.ru/ref/alex123" readOnly />
                  <Button onClick={() => {
                    navigator.clipboard.writeText('https://techforma.ru/ref/alex123');
                    toast({ title: 'Скопировано', description: 'Реферальная ссылка скопирована' });
                  }}>
                    <Icon name="Copy" size={16} />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Приглашено друзей</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Бонусов получено</p>
                    <p className="text-2xl font-bold">150 баллов</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>История покупок ({purchases.length})</CardTitle>
                <CardDescription>Все скачанные работы</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {purchases.map((purchase) => (
                    <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{purchase.workTitle}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="Calendar" size={14} />
                            {new Date(purchase.date).toLocaleDateString('ru-RU')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Coins" size={14} />
                            {purchase.price} баллов
                          </span>
                        </div>
                      </div>
                      {purchase.yandexDiskLink ? (
                        <Button size="sm" asChild>
                          <a href={purchase.yandexDiskLink} target="_blank" rel="noopener noreferrer">
                            <Icon name="Download" size={16} className="mr-2" />
                            Скачать с Яндекс.Диска
                          </a>
                        </Button>
                      ) : (
                        <Button size="sm" disabled>
                          <Icon name="Download" size={16} className="mr-2" />
                          Ссылка недоступна
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uploads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Мои работы ({uploads.length})</CardTitle>
                <CardDescription>Загруженные работы и статистика продаж</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploads.map((upload) => (
                    <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{upload.title}</h4>
                          {getStatusBadge(upload.status)}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="Coins" size={14} />
                            {upload.price} баллов
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="ShoppingCart" size={14} />
                            {upload.sales} продаж
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Calendar" size={14} />
                            {new Date(upload.uploadDate).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Icon name="Edit" size={16} />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Icon name="Trash2" size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>История транзакций ({transactions.length})</CardTitle>
                <CardDescription>Все операции с баллами</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{transaction.description}</h4>
                        <p className="text-sm text-muted-foreground">
                          <Icon name="Calendar" size={14} className="inline mr-1" />
                          {new Date(transaction.date).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </p>
                        <p className="text-sm text-muted-foreground">баллов</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}