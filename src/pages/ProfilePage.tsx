import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { authService } from '@/lib/auth';
import func2url from '../../backend/func2url.json';
import BalanceTab from '@/components/profile/BalanceTab';
import SupportTab from '@/components/profile/SupportTab';
import TransactionsTab from '@/components/profile/TransactionsTab';
import ReferralDialog from '@/components/ReferralDialog';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';

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

interface UserMessage {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

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

      // Шаг 1: Генерируем токен для скачивания
      const tokenResponse = await fetch(
        `${func2url['purchase-work']}?action=generate-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': String(userData.id)
          },
          body: JSON.stringify({ workId })
        }
      );

      if (!tokenResponse.ok) {
        throw new Error('Не удалось сгенерировать токен для скачивания');
      }

      const tokenData = await tokenResponse.json();
      const downloadToken = tokenData.token;

      if (!downloadToken) {
        throw new Error('Не получен токен для скачивания');
      }

      // Шаг 2: Скачиваем с использованием токена
      const downloadResponse = await fetch(
        `${DOWNLOAD_WORK_URL}?workId=${encodeURIComponent(workId)}&token=${encodeURIComponent(downloadToken)}`,
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
      if (!userData) {
        setLoading(false);
        setIsAuthenticated(false);
        navigate('/');
        return;
      }
      
      setIsAuthenticated(true);
      setCurrentUserId(userData.id);
      setUser({
        name: userData.username,
        email: userData.email,
        balance: userData.balance,
        totalEarned: 0,
        totalSpent: 0,
        worksUploaded: 0,
        worksPurchased: 0,
        rating: 0,
        registrationDate: userData.created_at || new Date().toISOString().split('T')[0]
      });
      setAvatarPreview(userData.avatar_url || null);
      
      try {
        const messagesResponse = await fetch(`${func2url['user-messages']}?action=get&user_id=${userData.id}`);
        const messagesData = await messagesResponse.json();
        if (messagesData.messages) {
          setMessages(messagesData.messages);
          setUnreadCount(messagesData.messages.filter((m: UserMessage) => !m.is_read).length);
        }
        
        const userDataResponse = await fetch(`${func2url['user-data']}?user_id=${userData.id}&action=all`);
        const userDataJson = await userDataResponse.json();
        
        if (userDataJson.stats) {
          setUser(prev => ({
            ...prev,
            worksUploaded: userDataJson.stats.works_uploaded || 0,
            worksPurchased: userDataJson.stats.works_purchased || 0,
            totalEarned: userDataJson.stats.total_earned || 0,
            totalSpent: userDataJson.stats.total_spent || 0
          }));
        }
        
        if (userDataJson.purchases) {
          setPurchases(userDataJson.purchases.map((p: any) => ({
            id: p.id,
            workTitle: p.title || 'Работа',
            price: p.price_paid || 0,
            date: p.purchased_at || new Date().toISOString(),
            downloadUrl: ''
          })));
        }
        
        const favoritesResponse = await fetch(`${func2url['user-data']}?user_id=${userData.id}&action=favorites`);
        const favoritesData = await favoritesResponse.json();
        if (favoritesData.favorites) {
          setFavoriteWorks(favoritesData.favorites);
        }
        
        const worksResponse = await fetch(`${func2url.works}?author_id=${userData.id}`);
        const worksData = await worksResponse.json();
        if (worksData.works) {
          setUploads(worksData.works.map((w: any) => ({
            id: w.id,
            title: w.title,
            price: w.price_points || w.price || 0,
            downloads: w.downloads || 0,
            status: w.status === 'approved' ? 'active' : w.status === 'pending' ? 'moderation' : 'rejected',
            uploadDate: w.created_at || new Date().toISOString()
          })));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
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

  useEffect(() => {
    const refreshUserData = async () => {
      const userData = await authService.verify();
      if (userData) {
        setUser(prev => ({
          ...prev,
          balance: userData.balance
        }));
        
        try {
          const userDataResponse = await fetch(`${func2url['user-data']}?user_id=${userData.id}&action=all`);
          const userDataJson = await userDataResponse.json();
          
          if (userDataJson.purchases) {
            setPurchases(userDataJson.purchases.map((p: any) => ({
              id: p.id,
              workTitle: p.title || 'Работа',
              price: p.price_paid || 0,
              date: p.purchased_at || new Date().toISOString(),
              downloadUrl: ''
            })));
          }
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
      }
    };

    const interval = setInterval(refreshUserData, 10000);
    return () => clearInterval(interval);
  }, []);

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [transactions] = useState<Transaction[]>([]);
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [favoriteWorks, setFavoriteWorks] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Ошибка',
          description: 'Файл слишком большой (макс. 5 МБ)',
          variant: 'destructive'
        });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMarkMessageRead = async (messageId: number) => {
    try {
      const userData = await authService.verify();
      if (!userData) return;
      
      const response = await fetch(func2url['user-messages'], {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'mark_read', 
          user_id: userData.id, 
          message_id: messageId 
        })
      });
      
      if (response.ok) {
        // Обновляем локальное состояние - отмечаем сообщение как прочитанное
        setMessages(prev => 
          prev.map(m => m.id === messageId ? { ...m, is_read: true } : m)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const handleSaveProfile = async () => {
    setUploadingAvatar(true);
    
    try {
      const userData = await authService.verify();
      if (!userData) return;

      // Если есть новый аватар, загружаем его
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        formData.append('user_id', String(userData.id));

        const uploadResponse = await fetch(func2url['user-data'], {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Ошибка загрузки аватара');
        }

        const uploadData = await uploadResponse.json();
        setAvatarPreview(uploadData.avatar_url);
        setAvatarFile(null);
      }

      // Обновляем имя пользователя (если изменилось)
      if (editedName !== user.name) {
        const updateResponse = await fetch(func2url['user-data'], {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userData.id,
            action: 'update_profile',
            username: editedName
          })
        });

        if (updateResponse.ok) {
          setUser(prev => ({ ...prev, name: editedName }));
        }
      }

      setEditMode(false);
      toast({
        title: 'Профиль обновлен',
        description: 'Изменения успешно сохранены'
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить профиль',
        variant: 'destructive'
      });
    } finally {
      setUploadingAvatar(false);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumbs />
          <div className="mb-6">
            <Button variant="ghost" className="mb-4 hover:bg-white/50" asChild>
              <Link to="/">
                <Icon name="ArrowLeft" size={18} className="mr-2" />
                На главную
              </Link>
            </Button>

            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Icon name="User" size={40} className="text-white" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-1">Привет, {user.name}! 👋</h1>
                    <p className="text-white/80 text-sm">{user.email}</p>
                  </div>
                </div>
                <Button 
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-white/90 shadow-lg"
                  asChild
                >
                  <Link to="/upload">
                    <Icon name="Upload" size={20} className="mr-2" />
                    Загрузить работу
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="Wallet" size={24} className="opacity-80" />
                  <Icon name="TrendingUp" size={20} className="opacity-60" />
                </div>
                <div className="text-3xl font-bold mb-1">{user.balance}</div>
                <p className="text-sm text-white/80">Баллов на счету</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="FileUp" size={24} className="opacity-80" />
                  <Icon name="CheckCircle" size={20} className="opacity-60" />
                </div>
                <div className="text-3xl font-bold mb-1">{uploads.length}</div>
                <p className="text-sm text-white/80">Загружено работ</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="ShoppingBag" size={24} className="opacity-80" />
                  <Icon name="Download" size={20} className="opacity-60" />
                </div>
                <div className="text-3xl font-bold mb-1">{purchases.length}</div>
                <p className="text-sm text-white/80">Куплено работ</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="Star" size={24} className="opacity-80" />
                  <Icon name="Award" size={20} className="opacity-60" />
                </div>
                <div className="text-3xl font-bold mb-1">{user.rating.toFixed(1)}</div>
                <p className="text-sm text-white/80">Рейтинг автора</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white shadow-md p-1 h-auto flex-wrap justify-start">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <Icon name="LayoutDashboard" size={16} className="mr-2" />
                Обзор
              </TabsTrigger>
              <TabsTrigger value="purchases" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
                <Icon name="ShoppingBag" size={16} className="mr-2" />
                Покупки
              </TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white">
                <Icon name="Heart" size={16} className="mr-2" />
                Избранное
              </TabsTrigger>
              <TabsTrigger value="uploads" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <Icon name="FileUp" size={16} className="mr-2" />
                Мои работы
              </TabsTrigger>
              <TabsTrigger value="balance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
                <Icon name="Wallet" size={16} className="mr-2" />
                Баланс
              </TabsTrigger>
              <TabsTrigger value="transactions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                <Icon name="Receipt" size={16} className="mr-2" />
                История баллов
              </TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white relative">
                <Icon name="Mail" size={16} className="mr-2" />
                Сообщения
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="support" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
                <Icon name="Headphones" size={16} className="mr-2" />
                Техподдержка
              </TabsTrigger>
              <TabsTrigger value="referral" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
                <Icon name="Users" size={16} className="mr-2" />
                Рефералы
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-600 data-[state=active]:to-gray-800 data-[state=active]:text-white">
                <Icon name="Settings" size={16} className="mr-2" />
                Настройки
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Activity" size={20} className="text-blue-500" />
                      Активность
                    </CardTitle>
                    <CardDescription>Ваша статистика за всё время</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <Icon name="TrendingUp" size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Заработано</p>
                          <p className="text-xl font-bold text-blue-600">{user.totalEarned} б.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                          <Icon name="TrendingDown" size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Потрачено</p>
                          <p className="text-xl font-bold text-purple-600">{user.totalSpent} б.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                          <Icon name="Calendar" size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">С нами с</p>
                          <p className="text-lg font-semibold">{new Date(user.registrationDate).toLocaleDateString('ru-RU')}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Zap" size={20} className="text-orange-500" />
                      Быстрые действия
                    </CardTitle>
                    <CardDescription>Часто используемые функции</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white" size="lg" asChild>
                      <Link to="/upload">
                        <Icon name="Upload" size={20} className="mr-2" />
                        Загрузить новую работу
                      </Link>
                    </Button>

                    <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white" size="lg" asChild>
                      <Link to="/catalog">
                        <Icon name="Search" size={20} className="mr-2" />
                        Найти работу
                      </Link>
                    </Button>

                    <Button 
                      className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white" 
                      size="lg"
                      asChild
                    >
                      <Link to="/buy-points">
                        <Icon name="Wallet" size={20} className="mr-2" />
                        Пополнить баланс
                      </Link>
                    </Button>

                    <Button 
                      className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white" 
                      size="lg"
                      onClick={() => {
                        const supportTab = document.querySelector('[value="support"]') as HTMLElement;
                        supportTab?.click();
                      }}
                    >
                      <Icon name="MessageCircle" size={20} className="mr-2" />
                      Связаться с поддержкой
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-lg border-2 bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Lightbulb" size={20} className="text-yellow-600" />
                    Советы для увеличения дохода
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <Icon name="CheckCircle" size={20} className="text-green-500 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Подробные описания</p>
                      <p className="text-sm text-muted-foreground">Добавляйте детальное описание к работам — это увеличивает продажи на 40%</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <Icon name="CheckCircle" size={20} className="text-green-500 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Качественное оформление</p>
                      <p className="text-sm text-muted-foreground">Работы с хорошим форматированием покупают в 2 раза чаще</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <Icon name="CheckCircle" size={20} className="text-green-500 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Актуальные темы</p>
                      <p className="text-sm text-muted-foreground">Загружайте работы по востребованным направлениям</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="purchases" className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Доступ к файлам 7 дней</p>
                    <p className="text-sm text-blue-700 mt-1">
                      После покупки работы вы можете скачивать файл в течение 7 дней. Не забудьте сохранить работу на своё устройство.
                    </p>
                  </div>
                </div>
              </div>
              
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="ShoppingBag" size={20} className="text-orange-500" />
                    Мои покупки
                  </CardTitle>
                  <CardDescription>История приобретенных работ</CardDescription>
                </CardHeader>
                <CardContent>
                  {purchases.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="ShoppingBag" size={40} className="text-orange-500" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Пока нет покупок</h3>
                      <p className="text-muted-foreground mb-6">Начните с поиска подходящей работы в каталоге</p>
                      <Button asChild>
                        <Link to="/catalog">
                          <Icon name="Search" size={18} className="mr-2" />
                          Перейти в каталог
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {purchases.map((purchase) => {
                        const purchaseDate = new Date(purchase.date);
                        const expiryDate = new Date(purchaseDate);
                        expiryDate.setDate(expiryDate.getDate() + 7);
                        const daysLeft = Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                        const isExpired = daysLeft === 0;
                        
                        return (
                          <div key={purchase.id} className="border rounded-lg p-4 hover:border-primary transition-colors bg-gradient-to-r from-white to-orange-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold mb-2">{purchase.workTitle}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                  <span className="flex items-center gap-1">
                                    <Icon name="Calendar" size={14} />
                                    {new Date(purchase.date).toLocaleDateString('ru-RU')}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Icon name="Coins" size={14} />
                                    {purchase.price} баллов
                                  </span>
                                </div>
                                {!isExpired ? (
                                  <div className="flex items-center gap-1 text-xs">
                                    <Icon name="Clock" size={12} className={daysLeft <= 2 ? "text-red-500" : "text-green-600"} />
                                    <span className={daysLeft <= 2 ? "text-red-600 font-medium" : "text-green-700"}>
                                      Доступ: {daysLeft} {daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-xs text-red-600">
                                    <Icon name="AlertCircle" size={12} />
                                    <span className="font-medium">Доступ истёк</span>
                                  </div>
                                )}
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleDownloadPurchase(purchase.id, purchase.workTitle)}
                                disabled={downloadingId === purchase.id || isExpired}
                                variant={isExpired ? "outline" : "default"}
                              >
                                {downloadingId === purchase.id ? (
                                  <>
                                    <Icon name="Loader2" size={14} className="mr-1 animate-spin" />
                                    Загрузка...
                                  </>
                                ) : isExpired ? (
                                  <>
                                    <Icon name="Lock" size={14} className="mr-1" />
                                    Недоступно
                                  </>
                                ) : (
                                  <>
                                    <Icon name="Download" size={14} className="mr-1" />
                                    Скачать
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Heart" size={20} className="text-pink-500" />
                    Избранное
                  </CardTitle>
                  <CardDescription>Работы, которые вы добавили в избранное</CardDescription>
                </CardHeader>
                <CardContent>
                  {favoriteWorks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="Heart" size={40} className="text-pink-500" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Избранное пусто</h3>
                      <p className="text-muted-foreground mb-6">Добавляйте понравившиеся работы в избранное для быстрого доступа</p>
                      <Button asChild>
                        <Link to="/catalog">
                          <Icon name="Search" size={18} className="mr-2" />
                          Перейти в каталог
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {favoriteWorks.map((work) => (
                        <Link
                          key={work.work_id || work.id}
                          to={`/work/${work.work_id || work.id}`}
                          className="border rounded-lg p-4 hover:border-pink-500 transition-colors bg-gradient-to-r from-white to-pink-50"
                        >
                          <h3 className="font-semibold mb-2">{work.work_title || work.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Icon name="Coins" size={14} />
                              {work.price_points || work.price || 0} баллов
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="Heart" size={14} className="text-pink-500 fill-pink-500" />
                              В избранном
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="uploads" className="space-y-4">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="FileUp" size={20} className="text-purple-500" />
                    Загруженные работы
                  </CardTitle>
                  <CardDescription>Ваши работы в каталоге</CardDescription>
                </CardHeader>
                <CardContent>
                  {uploads.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="FileUp" size={40} className="text-purple-500" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Начните зарабатывать</h3>
                      <p className="text-muted-foreground mb-6">Загрузите свою первую работу и получайте баллы с каждой продажи</p>
                      <Button asChild>
                        <Link to="/upload">
                          <Icon name="Upload" size={18} className="mr-2" />
                          Загрузить работу
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {uploads.map((upload) => (
                        <div key={upload.id} className="border rounded-lg p-4 bg-gradient-to-r from-white to-purple-50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{upload.title}</h3>
                                {getStatusBadge(upload.status)}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Icon name="Calendar" size={14} />
                                  {new Date(upload.uploadDate).toLocaleDateString('ru-RU')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Icon name="Download" size={14} />
                                  {upload.downloads} скачиваний
                                </span>
                                <span className="flex items-center gap-1">
                                  <Icon name="Coins" size={14} />
                                  {upload.price} баллов
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              asChild
                            >
                              <Link to={`/work/${upload.id}`}>
                                <Icon name="Eye" size={14} className="mr-1" />
                                Просмотр
                              </Link>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: 'Функция в разработке',
                                  description: 'Редактирование работ скоро будет доступно'
                                });
                              }}
                            >
                              <Icon name="Edit" size={14} className="mr-1" />
                              Редактировать
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="balance">
              <BalanceTab userBalance={user.balance} />
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Mail" size={20} className="text-blue-500" />
                    Входящие сообщения
                  </CardTitle>
                  <CardDescription>Уведомления от поддержки и системы</CardDescription>
                </CardHeader>
                <CardContent>
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="Mail" size={40} className="text-blue-500" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Нет новых сообщений</h3>
                      <p className="text-muted-foreground">Здесь будут отображаться ответы от поддержки и важные уведомления</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`border rounded-lg p-4 transition-all ${
                            msg.is_read 
                              ? 'bg-white' 
                              : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
                          }`}
                          onClick={() => !msg.is_read && handleMarkMessageRead(msg.id)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{msg.title}</h3>
                              {!msg.is_read && (
                                <Badge className="bg-blue-500">Новое</Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.created_at).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              {currentUserId && <TransactionsTab userId={currentUserId} />}
            </TabsContent>

            <TabsContent value="support" className="space-y-4">
              <SupportTab userEmail={user.email} />
            </TabsContent>

            <TabsContent value="referral" className="space-y-4">
              <Card className="shadow-lg bg-gradient-to-br from-green-50 to-teal-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Users" size={24} className="text-green-600" />
                    Реферальная программа
                  </CardTitle>
                  <CardDescription>
                    Приглашайте друзей и зарабатывайте баллы вместе
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setReferralDialogOpen(true)}
                    size="lg"
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                  >
                    <Icon name="Gift" size={20} className="mr-2" />
                    Открыть реферальную программу
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="User" size={20} className="text-gray-600" />
                    Фото профиля
                  </CardTitle>
                  <CardDescription>Загрузите аватар</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Icon name="User" size={40} className="text-white" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="max-w-xs"
                      />
                      <p className="text-xs text-muted-foreground">JPG, PNG или GIF (макс. 5 МБ)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="User" size={20} className="text-gray-600" />
                    Личные данные
                  </CardTitle>
                  <CardDescription>Управление профилем</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Имя пользователя</Label>
                    {editMode ? (
                      <Input
                        id="name"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                      />
                    ) : (
                      <div className="p-2 border rounded">{user.name}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="p-2 border rounded bg-muted">{user.email}</div>
                    <p className="text-xs text-muted-foreground">Email нельзя изменить</p>
                  </div>

                  {editMode ? (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} disabled={uploadingAvatar}>
                        {uploadingAvatar ? (
                          <>
                            <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                            Сохранение...
                          </>
                        ) : (
                          <>
                            <Icon name="Save" size={16} className="mr-2" />
                            Сохранить
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setEditMode(false)}>
                        Отмена
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setEditMode(true)}>
                      <Icon name="Edit" size={16} className="mr-2" />
                      Редактировать профиль
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Icon name="LogOut" size={20} />
                    Выход из аккаунта
                  </CardTitle>
                  <CardDescription>Завершить текущую сессию</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      authService.logout();
                      navigate('/');
                      toast({
                        title: 'Выход выполнен',
                        description: 'Вы успешно вышли из аккаунта'
                      });
                    }}
                    className="w-full"
                  >
                    <Icon name="LogOut" size={16} className="mr-2" />
                    Выйти из аккаунта
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
      
      <ReferralDialog 
        open={referralDialogOpen}
        onOpenChange={setReferralDialogOpen}
        username={user.name}
        userId={currentUserId || undefined}
      />
    </>
  );
}