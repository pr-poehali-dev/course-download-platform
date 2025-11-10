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
import func2url from '../../backend/func2url.json';
import BalanceTab from '@/components/profile/BalanceTab';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

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
  downloads: number;
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
    name: '',
    email: '',
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
    worksUploaded: 0,
    worksPurchased: 0,
    rating: 0,
    registrationDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const DOWNLOAD_WORK_URL = func2url['download-work'];
  const YANDEX_DISK_URL = 'https://disk.yandex.ru/d/usjmeUqnkY9IfQ';

  const handleDownloadPurchase = async (workId: number, workTitle: string) => {
    setDownloadingId(workId);
    
    try {
      const userData = await authService.verify();
      if (!userData) {
        alert('Необходимо войти в систему');
        return;
      }

      const downloadResponse = await fetch(
        `${DOWNLOAD_WORK_URL}?workId=${encodeURIComponent(workId)}&publicKey=${encodeURIComponent(YANDEX_DISK_URL)}`,
        {
          headers: {
            'X-User-Id': String(userData.id)
          }
        }
      );
      
      if (!downloadResponse.ok) {
        throw new Error('Ошибка скачивания');
      }
      
      const downloadData = await downloadResponse.json();
      
      try {
        const fileResponse = await fetch(downloadData.download_url);
        const blob = await fileResponse.blob();
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadData.filename || `${workTitle.substring(0, 50)}.rar`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: '✅ Скачивание началось',
          description: 'Файл сохранится в папку "Загрузки"'
        });
      } catch (fetchError) {
        window.location.href = downloadData.download_url;
      }
      
    } catch (error) {
      console.error('Download error:', error);
      alert(error instanceof Error ? error.message : 'Ошибка при скачивании');
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      const userData = await authService.verify();
      if (userData) {
        setUser({
          name: userData.username,
          email: userData.email,
          balance: userData.balance,
          totalEarned: 0,
          totalSpent: 0,
          worksUploaded: 0,
          worksPurchased: 0,
          rating: 0,
          registrationDate: new Date().toISOString().split('T')[0]
        });
      }
      setLoading(false);
    };

    loadUserData();

    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('payment') === 'success') {
      toast({
        title: 'Платёж успешно обработан!',
        description: 'Баллы зачислены на ваш счёт',
      });
      
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const [purchases] = useState<Purchase[]>([]);

  const [uploads] = useState<Upload[]>([]);

  const [transactions] = useState<Transaction[]>([]);

  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Личный кабинет"
        description="Управление профилем, балансом, загруженными и купленными работами"
        noindex={true}
      />
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="gradient-blue-cyan">
            <CardHeader className="pb-2">
              <div className="text-white/80 flex items-center gap-2 text-sm">
                <Icon name="Wallet" size={18} />
                Баланс
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white mb-1">{user.balance}</div>
              <p className="text-sm text-white/80">баллов для покупок</p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-3 w-full"
                onClick={() => {
                  const balanceTab = document.querySelector('[value="balance"]') as HTMLElement;
                  balanceTab?.click();
                }}
              >
                <Icon name="Plus" size={14} className="mr-1" />
                Пополнить
              </Button>
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
              <p className="text-sm text-white/80">работ в библиотеке</p>
            </CardContent>
          </Card>

          <Card className="gradient-green-yellow">
            <CardHeader className="pb-2">
              <div className="text-white/80 flex items-center gap-2 text-sm">
                <Icon name="ShoppingBag" size={18} />
                Куплено
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white mb-1">{user.worksPurchased}</div>
              <p className="text-sm text-white/80">работ других авторов</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <Icon name="User" size={18} className="mr-2" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="balance">
              <Icon name="Wallet" size={18} className="mr-2" />
              Баланс
            </TabsTrigger>
            <TabsTrigger value="uploads">
              <Icon name="Upload" size={18} className="mr-2" />
              Мои работы
            </TabsTrigger>
            <TabsTrigger value="purchases">
              <Icon name="ShoppingBag" size={18} className="mr-2" />
              Покупки
            </TabsTrigger>
            <TabsTrigger value="security">
              <Icon name="Shield" size={18} className="mr-2" />
              Безопасность
            </TabsTrigger>
          </TabsList>



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
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Бонусов получено</p>
                    <p className="text-2xl font-bold">0 баллов</p>
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
                      <Button 
                        size="sm" 
                        onClick={() => handleDownloadPurchase(purchase.id, purchase.workTitle)}
                        disabled={downloadingId === purchase.id}
                      >
                        <Icon name="Download" size={16} className="mr-2" />
                        {downloadingId === purchase.id ? 'Скачивание...' : 'Скачать работу'}
                      </Button>
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
                <CardDescription>Загруженные работы и статистика скачиваний</CardDescription>
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
                            <Icon name="Download" size={14} />
                            {upload.downloads} скачиваний
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

          <TabsContent value="balance">
            <BalanceTab />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Key" size={20} className="text-primary" />
                  Восстановление пароля
                </CardTitle>
                <CardDescription>Сбросить пароль, если вы его забыли</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                  <div className="flex items-start gap-2">
                    <Icon name="AlertTriangle" size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-amber-800 mb-1">Забыли пароль?</h3>
                      <p className="text-sm text-amber-700">
                        Укажите ваш email, и мы сгенерируем новый временный пароль. 
                        Новый пароль будет показан прямо на этой странице — обязательно сохраните его!
                      </p>
                    </div>
                  </div>
                </div>

                {newPassword ? (
                  <div className="bg-green-50 border-2 border-green-400 p-6 rounded-lg">
                    <div className="flex items-start gap-3 mb-4">
                      <Icon name="CheckCircle" size={24} className="text-green-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-green-800 text-lg mb-1">Пароль успешно сброшен!</h3>
                        <p className="text-sm text-green-700">
                          Вот ваш новый временный пароль. Сохраните его в надежном месте!
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded border-2 border-green-300">
                      <Label className="text-sm font-semibold text-green-800 mb-2 block">Новый пароль:</Label>
                      <div className="flex items-center gap-2">
                        <code className="text-2xl font-mono font-bold text-green-900 select-all">
                          {showNewPassword ? newPassword : '••••••••••••'}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          <Icon name={showNewPassword ? "EyeOff" : "Eye"} size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(newPassword);
                            toast({
                              title: 'Скопировано',
                              description: 'Пароль скопирован в буфер обмена'
                            });
                          }}
                        >
                          <Icon name="Copy" size={18} />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          navigator.clipboard.writeText(newPassword);
                          toast({
                            title: 'Пароль скопирован',
                            description: 'Теперь вы можете войти с новым паролем'
                          });
                        }}
                      >
                        <Icon name="Copy" size={16} className="mr-2" />
                        Скопировать пароль
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setNewPassword('')}
                      >
                        Закрыть
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email для сброса пароля</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="your@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                    </div>
                    <Button
                      className="w-full gap-2"
                      variant="destructive"
                      disabled={!resetEmail || resettingPassword}
                      onClick={async () => {
                        setResettingPassword(true);
                        try {
                          await new Promise(resolve => setTimeout(resolve, 1500));
                          const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase();
                          setNewPassword(tempPassword);
                          toast({
                            title: 'Пароль сброшен',
                            description: 'Новый временный пароль сгенерирован'
                          });
                        } catch (error) {
                          toast({
                            title: 'Ошибка',
                            description: 'Не удалось сбросить пароль',
                            variant: 'destructive'
                          });
                        } finally {
                          setResettingPassword(false);
                        }
                      }}
                    >
                      {resettingPassword ? (
                        <>
                          <Icon name="Loader2" size={16} className="animate-spin" />
                          Сброс пароля...
                        </>
                      ) : (
                        <>
                          <Icon name="RefreshCw" size={16} />
                          Сбросить пароль
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      После сброса вам будет показан новый временный пароль. Обязательно сохраните его!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="LogOut" size={20} className="text-primary" />
                  Выход из аккаунта
                </CardTitle>
                <CardDescription>Завершить сеанс на этом устройстве</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  При выходе из аккаунта вы потеряете доступ к профилю и сохраненным данным на этом устройстве.
                </p>
                <Button variant="outline" className="w-full">
                  <Icon name="LogOut" size={18} className="mr-2" />
                  Выйти из аккаунта
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
      <Footer />
    </div>
    </>
  );
}