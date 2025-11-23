import { useState, useEffect } from 'react';
import { authService, User } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import func2url from '../../backend/func2url.json';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import AuthDialog from '@/components/AuthDialog';
import ProfileDialog from '@/components/ProfileDialog';
import SupportPage from '@/components/SupportPage';
import AdminPanel from '@/components/AdminPanel';
import PaymentDialog from '@/components/PaymentDialog';
import CartDialog from '@/components/CartDialog';
import FavoritesDialog from '@/components/FavoritesDialog';
import PromoCodeDialog from '@/components/PromoCodeDialog';
import ReferralDialog from '@/components/ReferralDialog';


import AboutSection from '@/components/AboutSection';
import RecentlyViewed from '@/components/RecentlyViewed';

import FAQSection from '@/components/FAQSection';

import AgeBadge from '@/components/AgeBadge';
import CookieBanner from '@/components/CookieBanner';
import { notifyPurchaseSuccess, notifyPromoActivated } from '@/utils/emailNotifications';
import SEO from '@/components/SEO';
import HomeHeader from '@/components/home/HomeHeader';
import RotatingText from '@/components/home/RotatingText';
import NewsSection from '@/components/NewsSection';
import PurchaseNotifications from '@/components/PurchaseNotifications';
import ExitIntentModal from '@/components/ExitIntentModal';
import DiscountProgressBar from '@/components/DiscountProgressBar';
import GuaranteesSection from '@/components/GuaranteesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import LegalDisclaimer from '@/components/LegalDisclaimer';




export default function Index() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isLoggedIn = !!currentUser;
  const username = currentUser?.username || '';
  const email = currentUser?.email || '';
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favoritesDialogOpen, setFavoritesDialogOpen] = useState(false);
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);


  const [cartItems, setCartItems] = useState<any[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [activatedPromos, setActivatedPromos] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<string>('rating');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [realWorks, setRealWorks] = useState<any[]>([]);
  const [worksLoading, setWorksLoading] = useState(true);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    workType: '',
    price: '',
    subject: '',
    description: '',
    file: null as File | null
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  
  const userBalance = currentUser?.balance || 0;
  const availableWorks = realWorks.filter(work => (work.price_points || work.price || 0) <= userBalance).length;

  // ✅ Функция для обновления баланса из backend
  const refreshBalance = async () => {
    try {
      const freshUser = await authService.verify();
      if (freshUser) {
        setCurrentUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        toast({
          title: '✅ Баланс обновлён',
          description: `Текущий баланс: ${freshUser.balance} баллов`,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Failed to refresh balance:', error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось обновить баланс',
        variant: 'destructive',
        duration: 2000,
      });
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authService.verify();
        setCurrentUser(user);
      } catch (error) {
        console.error('Auth verification failed:', error);
        setCurrentUser(null);
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    const loadWorks = async () => {
      try {
        const response = await fetch(func2url.works);
        const data = await response.json();
        if (data.works) {
          setRealWorks(data.works);
        }
      } catch (error) {
        console.error('Failed to load works:', error);
      } finally {
        setWorksLoading(false);
      }
    };
    loadWorks();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser?.id) return;
      
      try {
        const response = await fetch(`${func2url['user-data']}?user_id=${currentUser.id}&action=all`);
        const data = await response.json();
        
        if (data.favorites) setFavoriteItems(data.favorites);
        if (data.purchases) setPurchases(data.purchases);
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadUserData();
  }, [currentUser]);

  const handleRegister = async (username: string, email: string, password: string, securityQuestion: string, securityAnswer: string) => {
    try {
      const data = await authService.register(username, email, password, securityQuestion, securityAnswer);
      setCurrentUser(data.user);
      setAuthDialogOpen(false);
      toast({
        title: 'Регистрация успешна!',
        description: `Добро пожаловать, ${data.user.username}! Вам начислено 1000 баллов.`,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка регистрации',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLogin = async (user: string, password: string) => {
    try {
      const data = await authService.login(user, password);
      setCurrentUser(data.user);
      setAuthDialogOpen(false);
      toast({
        title: 'Вход выполнен',
        description: `С возвращением, ${data.user.username}!`,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка входа',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    toast({
      title: 'Выход выполнен',
      description: 'До встречи!',
    });
  };

  const handleAddToCart = (work: any) => {
    if (cartItems.find(item => item.id === work.id)) {
      toast({
        title: 'Уже в корзине',
        description: 'Эта работа уже добавлена в корзину',
        variant: 'destructive',
      });
      return;
    }
    setCartItems([...cartItems, work]);
    toast({
      title: 'Добавлено в корзину',
      description: work.title,
    });
  };

  const handleRemoveFromCart = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleCheckout = async () => {
    if (!currentUser?.id) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите, чтобы совершить покупку',
        variant: 'destructive',
      });
      return;
    }

    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price_points || item.price || 0), 0);
    
    if (userBalance < totalPrice) {
      toast({
        title: 'Недостаточно баллов',
        description: `Не хватает ${totalPrice - userBalance} баллов для покупки`,
        variant: 'destructive',
      });
      return;
    }

    try {
      const purchasePromises = cartItems.map(async (item) => {
        const response = await fetch(func2url['purchase-work'], {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workId: item.id,
            userId: currentUser.id,
            price: item.price_points || item.price || 0
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка покупки');
        }

        return await response.json();
      });

      await Promise.all(purchasePromises);

      const newPurchases = cartItems.map(item => ({
        ...item,
        date: new Date().toLocaleDateString('ru-RU')
      }));

      setPurchases([...purchases, ...newPurchases]);
      setUserBalance(userBalance - totalPrice);
      
      if (email) {
        cartItems.forEach(item => {
          notifyPurchaseSuccess(email, item.title);
        });
      }
      
      toast({
        title: 'Покупка успешна!',
        description: `Куплено работ: ${cartItems.length}. Начинаем скачивание файлов...`,
      });

      const downloadPromises = cartItems.map(async (item) => {
        try {
          const downloadResponse = await fetch(
            `${func2url['download-work']}?workId=${encodeURIComponent(item.id)}`,
            {
              headers: {
                'X-User-Id': String(currentUser.id)
              }
            }
          );
          
          if (!downloadResponse.ok) {
            throw new Error(`Ошибка скачивания ${item.title}`);
          }
          
          const downloadData = await downloadResponse.json();
          
          const fileResponse = await fetch(downloadData.download_url);
          const blob = await fileResponse.blob();
          
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = downloadData.filename || `${item.title.substring(0, 50)}.rar`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          return { success: true, title: item.title };
        } catch (error) {
          console.error(`Ошибка скачивания ${item.title}:`, error);
          return { success: false, title: item.title };
        }
      });

      const downloadResults = await Promise.all(downloadPromises);
      const successCount = downloadResults.filter(r => r.success).length;
      const failedCount = downloadResults.filter(r => !r.success).length;

      if (failedCount > 0) {
        toast({
          title: 'Скачивание завершено',
          description: `Успешно: ${successCount}, Ошибок: ${failedCount}. Проверьте папку "Загрузки"`,
          variant: failedCount === cartItems.length ? 'destructive' : 'default',
        });
      } else {
        toast({
          title: 'Все файлы скачаны!',
          description: `${successCount} файлов сохранены в папку "Загрузки"`,
        });
      }
      
      setCartItems([]);
      
    } catch (error) {
      console.error('Ошибка при покупке:', error);
      toast({
        title: 'Ошибка покупки',
        description: error instanceof Error ? error.message : 'Не удалось завершить покупку',
        variant: 'destructive',
      });
    }
  };

  const handleAddToFavorites = async (work: any) => {
    if (!currentUser?.id) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите, чтобы добавлять в избранное',
        variant: 'destructive',
      });
      return;
    }

    if (favoriteItems.find(item => item.id === work.id)) {
      toast({
        title: 'Уже в избранном',
        description: 'Эта работа уже в списке избранного',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(func2url['toggle-favorite'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, work_id: work.id })
      });
      const data = await response.json();
      
      if (data.success && data.action === 'added') {
        setFavoriteItems([...favoriteItems, work]);
        toast({
          title: 'Добавлено в избранное',
          description: work.title,
        });
      }
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить в избранное',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveFromFavorites = async (id: number) => {
    if (!currentUser?.id) return;

    try {
      const response = await fetch(func2url['toggle-favorite'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, work_id: id })
      });
      const data = await response.json();
      
      if (data.success && data.action === 'removed') {
        setFavoriteItems(favoriteItems.filter(item => item.id !== id));
        toast({
          title: 'Удалено из избранного',
        });
      }
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
    }
  };

  const handleApplyPromo = (bonus: number, code: string, newBalance: number) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        balance: newBalance
      });
    }
    setActivatedPromos([...activatedPromos, code]);
    
    if (email) {
      notifyPromoActivated(email, code, bonus);
    }
  };

  const handlePaymentSuccess = (amount: number) => {
    setUserBalance(userBalance + amount);
  };

  const topWorks = realWorks
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 6);

  const worksToDisplay = realWorks;

  const filteredWorks = worksToDisplay
    .filter((work) => {
      const matchesSearch = work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const workType = work.work_type || work.type;
      const matchesCategory = selectedCategory === 'all' || workType === selectedCategory;
      const price = work.price_points || work.price || 0;
      const matchesPrice = price >= minPrice && price <= maxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      const priceA = a.price_points || a.price || 0;
      const priceB = b.price_points || b.price || 0;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'popular') return (b.downloads || 0) - (a.downloads || 0);
      return 0;
    });

  return (
    <>
      <SEO 
        title="Tech Forma — Платформа обмена учебными материалами (18+)"
        description="Маркетплейс учебных материалов для студентов. Более 500 работ для ознакомления. Материалы предназначены исключительно для образовательных целей и самостоятельной переработки."
        keywords="учебные материалы, студенческие работы, образовательная платформа, примеры работ, методические материалы, маркетплейс для студентов"
      />
      <PurchaseNotifications />
      <ExitIntentModal />
      {isLoggedIn && <DiscountProgressBar currentPoints={userBalance} />}
      <div className="min-h-screen w-full overflow-x-hidden bg-white">
        <header className="glass-card tech-border sticky top-0 z-50 w-full shadow-sm">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
                <Icon name="Cpu" size={24} className="text-primary flex-shrink-0 sm:w-8 sm:h-8" />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-2xl font-bold truncate leading-tight">Tech Forma</h1>
                    <span className="px-1.5 py-0.5 bg-red-600 text-white text-[8px] sm:text-[10px] font-bold rounded">18+</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate leading-tight">Маркетплейс учебных материалов</p>
                </div>
              </div>
              
              <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
                <a href="/" className="hover:text-primary transition-colors text-sm">Главная</a>
                <a href="/catalog" className="hover:text-primary transition-colors text-sm">Каталог</a>
                <a href="/blog" className="hover:text-primary transition-colors text-sm">Блог</a>
              </nav>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Icon name={mobileMenuOpen ? "X" : "Menu"} size={24} />
              </Button>

              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {isLoggedIn ? (
                  <>

                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="relative h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex"
                      onClick={() => setCartDialogOpen(true)}
                    >
                      <Icon name="ShoppingCart" size={18} />
                      {cartItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                          {cartItems.length}
                        </span>
                      )}
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-primary/10 rounded-full">
                        <Icon name="Coins" size={16} className="text-primary sm:w-5 sm:h-5" />
                        <span className="font-semibold text-sm sm:text-base">{userBalance}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={refreshBalance}
                        className="h-8 w-8"
                        title="Обновить баланс"
                      >
                        <Icon name="RefreshCw" size={16} />
                      </Button>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="hidden md:flex text-xs sm:text-sm px-2 sm:px-4"
                      onClick={() => setPaymentDialogOpen(true)}
                    >
                      <Icon name="Plus" size={14} className="mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Пополнить</span>
                      <span className="sm:hidden">+</span>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white font-semibold flex items-center justify-center text-sm sm:text-lg">
                            {username ? username[0].toUpperCase() : 'U'}
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{username || 'Пользователь'}</p>
                            <p className="text-xs leading-none text-muted-foreground">{email || 'user@example.com'}</p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <a href="/profile" className="cursor-pointer">
                            <Icon name="User" size={16} className="mr-2" />
                            Профиль
                          </a>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setPaymentDialogOpen(true)}>
                          <Icon name="Wallet" size={16} className="mr-2" />
                          Пополнить баланс
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => setReferralDialogOpen(true)}>
                          <Icon name="Users" size={16} className="mr-2" />
                          Реферальная программа
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                          <Icon name="LogOut" size={16} className="mr-2" />
                          Выйти
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <Button onClick={() => setAuthDialogOpen(true)} size="sm" className="text-xs sm:text-sm px-3 sm:px-4">
                    Войти
                  </Button>
                )}
              </div>
            </div>
            
            {mobileMenuOpen && (
              <div className="lg:hidden border-t bg-white/95 backdrop-blur-md">
                <nav className="flex flex-col py-4 px-4 gap-2">
                  <a 
                    href="/" 
                    className="py-3 px-4 hover:bg-primary/10 rounded-lg transition-colors text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Главная
                  </a>
                  <a 
                    href="/catalog" 
                    className="py-3 px-4 hover:bg-primary/10 rounded-lg transition-colors text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Каталог
                  </a>
                  <a 
                    href="#blog" 
                    className="py-3 px-4 hover:bg-primary/10 rounded-lg transition-colors text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Блог
                  </a>
                  {isLoggedIn && (
                    <>
                      <div className="border-t my-2"></div>

                      <button 
                        className="py-3 px-4 hover:bg-primary/10 rounded-lg transition-colors text-base font-medium text-left flex items-center gap-2"
                        onClick={() => {
                          setCartDialogOpen(true);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Icon name="ShoppingCart" size={18} />
                        Корзина {cartItems.length > 0 && `(${cartItems.length})`}
                      </button>
                      <button 
                        className="py-3 px-4 hover:bg-primary/10 rounded-lg transition-colors text-base font-medium text-left flex items-center gap-2"
                        onClick={() => {
                          setPaymentDialogOpen(true);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Icon name="Plus" size={18} />
                        Пополнить баланс
                      </button>
                    </>
                  )}
                </nav>
              </div>
            )}
          </div>
        </header>

        <section className="relative py-12 sm:py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMzYjgyZjYiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
          
          <div className="absolute top-40 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center mb-8 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 glass-card rounded-full mb-4 sm:mb-8 animate-fade-in border border-blue-500/20">
                <Icon name="Sparkles" size={18} className="text-blue-600 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">
                  Профессиональная платформа для студентов
                </span>
              </div>
              
              <div className="hero-glow mb-4 sm:mb-8">
                <h2 className="hero-title text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-tight px-2">
                  Tech Forma
                </h2>
              </div>
              
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent px-4">
                Маркетплейс учебных материалов
              </h3>
              
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in leading-relaxed px-4">
                Более 500 работ для ознакомления и самостоятельной переработки. Только для лиц 18+
              </p>

              {!isLoggedIn && (
                <div className="mb-8 px-4">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-full shadow-lg">
                    <Icon name="Gift" size={20} className="text-green-600" />
                    <span className="text-sm sm:text-base font-bold text-gray-800">
                      🎁 1000 баллов (5000₽) в подарок за регистрацию
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 sm:gap-4 justify-center mb-6 sm:mb-12 flex-wrap animate-fade-in px-2">
                <Button size="lg" className="h-10 sm:h-12 lg:h-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-sm sm:text-base lg:text-lg shadow-xl" asChild>
                  <a href="/catalog">
                    <Icon name="BookOpen" size={18} className="mr-1 sm:mr-2 sm:w-5 sm:h-5" />
                    Смотреть каталог
                  </a>
                </Button>
                {!isLoggedIn && (
                  <Button size="lg" className="h-10 sm:h-12 lg:h-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-sm sm:text-base lg:text-lg shadow-xl" onClick={() => setAuthDialogOpen(true)}>
                    <Icon name="Gift" size={18} className="mr-1 sm:mr-2 sm:w-5 sm:h-5" />
                    Получить подарок
                  </Button>
                )}
                {isLoggedIn && (
                  <Button size="lg" variant="outline" className="h-10 sm:h-12 lg:h-14 px-4 sm:px-6 lg:px-8 text-sm sm:text-base lg:text-lg shadow-xl border-2" onClick={() => setProfileDialogOpen(true)}>
                    <Icon name="Upload" size={18} className="mr-1 sm:mr-2 sm:w-5 sm:h-5" />
                    Загрузить работу
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 max-w-4xl mx-auto px-2">
                <div className="glass-card rounded-2xl p-4 sm:p-8 text-center tech-border hover:shadow-xl transition-all group">
                  <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-br from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">500+</div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600">Работ для изучения</p>
                </div>
                <div className="glass-card rounded-2xl p-4 sm:p-8 text-center tech-border hover:shadow-xl transition-all group">
                  <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-br from-purple-600 to-purple-400 bg-clip-text text-transparent mb-2">
                    <div className="flex items-center justify-center gap-2">
                      <Icon name="TrendingUp" size={28} />
                    </div>
                    <div>ХИТ</div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600">Рейтинг 4.8+</p>
                </div>
                <div className="glass-card rounded-2xl p-4 sm:p-8 text-center tech-border hover:shadow-xl transition-all group">
                  <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-br from-green-600 to-green-400 bg-clip-text text-transparent mb-2">
                    <div className="flex items-center justify-center gap-2">
                      <Icon name="Users" size={28} />
                    </div>
                    <div>Много авторов</div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600">Активных авторов</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-blue-50/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMzYjgyZjYiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 relative z-10">
            <div className="text-center mb-16">
              <Badge className="mb-4 glass-card border-blue-200">
                <Icon name="Layers" size={14} className="mr-1" />
                Возможности платформы
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Всё для успешной учёбы
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
                Современные инструменты для студентов
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
              <Card className="relative overflow-hidden glass-card tech-border hover:shadow-2xl transition-all group hover:scale-[1.02]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all"></div>
                <CardHeader>
                  <div className="w-full h-48 mb-4 rounded-xl overflow-hidden">
                    <img 
                      src="https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/cf4ec9f2-8937-4cdc-8478-e9adb8e7c1e3.jpg" 
                      alt="Облачный каталог" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardTitle className="text-2xl">Маркетплейс работ</CardTitle>
                  <CardDescription className="text-base">Покупай за баллы от 100</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span>Курсовые, дипломы, чертежи</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span>Мгновенный доступ</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span>Обмен знаниями</span>
                  </div>
                  <Button className="w-full mt-4" variant="outline" asChild>
                    <a href="/catalog">
                      <Icon name="ArrowRight" size={16} className="mr-2" />
                      Смотреть каталог
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden glass-card tech-border hover:shadow-2xl transition-all group hover:scale-[1.02]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-all"></div>
                <CardHeader>
                  <div className="w-full h-48 mb-4 rounded-xl overflow-hidden">
                    <img 
                      src="https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/816465f3-69d3-4606-aed2-50f897edcaa9.jpg" 
                      alt="Стань автором" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardTitle className="text-2xl">Стань автором</CardTitle>
                  <CardDescription className="text-base">Делись знаниями с сообществом</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span>Публикуй свои работы</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span>Статистика скачиваний</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span>Обмен знаниями</span>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => {
                      if (!isLoggedIn) {
                        toast({
                          title: 'Требуется авторизация',
                          description: 'Войдите в аккаунт для загрузки работ',
                          variant: 'destructive'
                        });
                        setAuthDialogOpen(true);
                        return;
                      }
                      if (!currentUser?.email) {
                        toast({
                          title: 'Требуется подтверждение почты',
                          description: 'Подтвердите почту для загрузки работ',
                          variant: 'destructive'
                        });
                        return;
                      }
                      setProfileDialogOpen(true);
                    }}
                  >
                    <Icon name="Upload" size={16} className="mr-2" />
                    Загрузить работу
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <GuaranteesSection />
        
        <TestimonialsSection />

        <section className="py-20 bg-white relative overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="glass-card mb-4 border-blue-200">
                  <Icon name="Zap" size={14} className="mr-1" />
                  Профессиональные инструменты
                </Badge>
                <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
                  Технологичная платформа для студентов
                </h2>
                <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
                  Всё необходимое для успешной учёбы в одном месте
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto">
                <Card className="glass-card tech-border hover:shadow-xl transition-all group hover:scale-[1.02]">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                      <Icon name="BookOpen" size={32} className="text-white" />
                    </div>
                    <CardTitle className="text-xl">Каталог работ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 text-center">
                      Более 500 готовых курсовых, дипломов, диссертаций и рефератов по разным дисциплинам
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card tech-border hover:shadow-xl transition-all group hover:scale-[1.02]">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                      <Icon name="Upload" size={32} className="text-white" />
                    </div>
                    <CardTitle className="text-xl">Публикация работ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 text-center">
                      Делись своими работами с сообществом и помогай другим студентам
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card tech-border mb-8 hover:shadow-xl transition-all group">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                      <Icon name="BookOpen" size={40} className="text-white" />
                    </div>
                    <h3 className="font-bold text-2xl mb-3 text-slate-900">Начни использовать платформу</h3>
                    <p className="text-slate-600 text-base max-w-xl mx-auto mb-6">
                      Доступ к каталогу из 500+ готовых работ — всё что нужно для успешной учёбы
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-14 px-8 text-lg shadow-lg hover:shadow-xl transition-all" onClick={() => window.location.href = '/catalog'}>
                      <Icon name="BookOpen" size={20} className="mr-2" />
                      Смотреть каталог
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg tech-border hover:shadow-lg transition-all" onClick={() => !isLoggedIn ? setAuthDialogOpen(true) : setProfileDialogOpen(true)}>
                      <Icon name="Upload" size={20} className="mr-2" />
                      Загрузить работу
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <RecentlyViewed />

        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="catalog" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-1 mb-8">
                <TabsTrigger value="catalog">
                  <Icon name="BookOpen" size={18} className="mr-2" />
                  Каталог работ
                </TabsTrigger>
              </TabsList>

              <TabsContent value="catalog" className="hidden">
                <div className="mb-6 flex flex-wrap gap-4 items-center justify-between bg-muted/30 p-4 rounded-lg">
                  <div className="flex gap-2 items-center">
                    <Label className="text-sm">Сортировка:</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">По рейтингу</SelectItem>
                        <SelectItem value="popular">По популярности</SelectItem>
                        <SelectItem value="price_asc">Цена: по возрастанию</SelectItem>
                        <SelectItem value="price_desc">Цена: по убыванию</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-4 items-center">
                    <div className="flex gap-2 items-center">
                      <Label className="text-sm">Цена от:</Label>
                      <Input 
                        type="number" 
                        className="w-24" 
                        value={minPrice} 
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        min={0}
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <Label className="text-sm">до:</Label>
                      <Input 
                        type="number" 
                        className="w-24" 
                        value={maxPrice} 
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        min={0}
                      />
                    </div>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => setPromoDialogOpen(true)}>
                    <Icon name="Gift" size={16} className="mr-2" />
                    Промокод
                  </Button>
                </div>
                
                {worksLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <Icon name="Loader2" size={48} className="animate-spin text-primary" />
                    <p className="text-muted-foreground">Загружаем каталог работ...</p>
                  </div>
                ) : filteredWorks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <Icon name="Search" size={48} className="text-muted-foreground" />
                    <p className="text-lg font-semibold">Работы не найдены</p>
                    <p className="text-muted-foreground">Попробуйте изменить параметры поиска</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWorks.map((work, index) => {
                    const price = work.price_points || work.price;
                    const workType = work.work_type || work.type;
                    const isAffordable = price <= userBalance;
                    return (
                    <Card 
                      key={work.id} 
                      className={`group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 animate-fade-in overflow-hidden ${
                        isAffordable 
                          ? 'border-green-500/30 bg-green-50/50 hover:border-green-500/50' 
                          : 'hover:border-primary/30 opacity-75'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${
                        isAffordable ? 'from-green-500 to-green-400' : 'from-primary to-primary/50'
                      }`}></div>
                      {isAffordable && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                          <Icon name="CheckCircle" size={14} />
                          Доступно
                        </div>
                      )}
                      
                      <CardHeader>
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="secondary" className="font-medium">{workType}</Badge>
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                            <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-bold text-yellow-700">{work.rating}</span>
                          </div>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                          {work.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon name="BookMarked" size={16} className="text-primary" />
                          </div>
                          <span className="font-medium">{work.subject}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {work.preview}
                        </p>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Icon name="Download" size={16} className="text-primary" />
                            <span className="font-medium">{work.downloads}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-green-600">
                            <Icon name="TrendingUp" size={16} />
                            <span className="font-medium">Популярно</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center bg-muted/30 group-hover:bg-primary/5 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Icon name="Coins" size={20} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{price}</p>
                            <p className="text-xs text-muted-foreground">баллов</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              toast({
                                title: 'Жалоба принята',
                                description: 'Мы проверим работу в течение 24 часов',
                              });
                            }}
                            title="Пожаловаться на работу"
                          >
                            <Icon name="Flag" size={16} />
                          </Button>
                          <Button 
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const inFavorites = favoriteItems.find(item => item.id === work.id);
                              if (inFavorites) {
                                handleRemoveFromFavorites(work.id);
                              } else {
                                handleAddToFavorites(work);
                              }
                            }}
                            className={favoriteItems.find(item => item.id === work.id) ? 'text-red-500 bg-red-50 hover:bg-red-100 border-red-200' : ''}
                            title={favoriteItems.find(item => item.id === work.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                          >
                            <Icon name="Heart" size={16} className={favoriteItems.find(item => item.id === work.id) ? 'fill-red-500' : ''} />
                          </Button>
                          <Button 
                            onClick={() => handleAddToCart(work)}
                            className="group-hover:scale-105 transition-transform"
                          >
                            <Icon name="ShoppingCart" size={16} className="mr-2" />
                            В корзину
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
                </div>
                )}
              </TabsContent>

              <TabsContent value="catalog-removed">
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle>Загрузить свою работу</CardTitle>
                    <CardDescription>
                      Поделись своей работой и получай баллы за каждое скачивание
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="work-title">Название работы <span className="text-red-500">*</span></Label>
                      <Input 
                        id="work-title" 
                        placeholder="Анализ рынка недвижимости..." 
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="work-type">Тип работы <span className="text-red-500">*</span></Label>
                        <Select 
                          value={uploadForm.workType}
                          onValueChange={(value) => {
                            const prices: {[key: string]: string} = {
                              'coursework': '600',
                              'diploma': '1500',
                              'dissertation': '3000',
                              'practice': '200',
                              'report': '200',
                              'referat': '200',
                              'control': '200',
                              'lab': '200'
                            };
                            setUploadForm({...uploadForm, workType: value, price: prices[value] || '600'});
                          }}
                        >
                          <SelectTrigger id="work-type">
                            <SelectValue placeholder="Выберите тип" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="coursework">Курсовая работа (600₽)</SelectItem>
                            <SelectItem value="diploma">Дипломная работа (1500₽)</SelectItem>
                            <SelectItem value="dissertation">Диссертация (3000₽)</SelectItem>
                            <SelectItem value="practice">Отчёт по практике (200₽)</SelectItem>
                            <SelectItem value="report">Отчёт (200₽)</SelectItem>
                            <SelectItem value="referat">Реферат (200₽)</SelectItem>
                            <SelectItem value="control">Контрольная работа (200₽)</SelectItem>
                            <SelectItem value="lab">Лабораторная работа (200₽)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="work-price">Цена в баллах <span className="text-red-500">*</span></Label>
                        <Input 
                          id="work-price" 
                          type="number" 
                          placeholder="600"
                          value={uploadForm.price}
                          onChange={(e) => setUploadForm({...uploadForm, price: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="work-subject">Предмет <span className="text-red-500">*</span></Label>
                      <Input 
                        id="work-subject" 
                        placeholder="Маркетинг"
                        value={uploadForm.subject}
                        onChange={(e) => setUploadForm({...uploadForm, subject: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="work-description">Описание <span className="text-red-500">*</span></Label>
                      <Textarea 
                        id="work-description" 
                        placeholder="Краткое описание работы, что включено..."
                        rows={4}
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="work-file">Файл работы <span className="text-red-500">*</span></Label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                        <input
                          id="work-file"
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.dwg,.xls,.xlsx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 50 * 1024 * 1024) {
                                toast({
                                  title: 'Файл слишком большой',
                                  description: 'Максимальный размер 50 МБ',
                                  variant: 'destructive'
                                });
                                return;
                              }
                              setUploadForm({...uploadForm, file});
                            }
                          }}
                        />
                        <label htmlFor="work-file" className="cursor-pointer">
                          {uploadForm.file ? (
                            <>
                              <Icon name="FileCheck" size={32} className="mx-auto text-green-600 mb-2" />
                              <p className="text-sm font-medium text-foreground">
                                {uploadForm.file.name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {(uploadForm.file.size / 1024 / 1024).toFixed(2)} МБ
                              </p>
                            </>
                          ) : (
                            <>
                              <Icon name="Upload" size={32} className="mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Перетащите файл сюда или нажмите для выбора
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                PDF, DOC, DOCX, DWG до 50 МБ
                              </p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      size="lg"
                      disabled={uploadLoading || !uploadForm.title || !uploadForm.workType || !uploadForm.price || !uploadForm.subject || !uploadForm.description || !uploadForm.file}
                      onClick={async () => {
                        if (!isLoggedIn) {
                          toast({
                            title: 'Требуется авторизация',
                            description: 'Войдите в аккаунт для загрузки работ',
                            variant: 'destructive'
                          });
                          setAuthDialogOpen(true);
                          return;
                        }

                        setUploadLoading(true);
                        
                        try {
                          const reader = new FileReader();
                          reader.readAsDataURL(uploadForm.file!);
                          
                          reader.onload = async () => {
                            const base64Data = reader.result as string;
                            
                            const uploadData = {
                              title: uploadForm.title,
                              workType: uploadForm.workType,
                              subject: uploadForm.subject,
                              description: uploadForm.description,
                              price: parseInt(uploadForm.price),
                              fileName: uploadForm.file!.name,
                              fileSize: uploadForm.file!.size,
                              fileData: base64Data
                            };
                            
                            const response = await fetch('https://functions.poehali.dev/bca1c84a-e7e6-4b4c-8b15-85a8f319e0b0', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'X-User-Id': currentUser?.id?.toString() || ''
                              },
                              body: JSON.stringify(uploadData)
                            });
                            
                            const result = await response.json();
                            
                            setUploadLoading(false);
                            
                            if (response.ok && result.success) {
                              if (result.newBalance) {
                                setCurrentUser({
                                  ...currentUser!,
                                  balance: result.newBalance
                                });
                              }
                              
                              toast({
                                title: 'Работа загружена!',
                                description: `${result.message}. Начислено +${result.bonusEarned} баллов!`
                              });
                              
                              setUploadForm({
                                title: '',
                                workType: '',
                                price: '',
                                subject: '',
                                description: '',
                                file: null
                              });
                            } else {
                              toast({
                                title: 'Ошибка загрузки',
                                description: result.error || 'Не удалось загрузить работу',
                                variant: 'destructive'
                              });
                            }
                          };
                          
                          reader.onerror = () => {
                            setUploadLoading(false);
                            toast({
                              title: 'Ошибка чтения файла',
                              description: 'Не удалось прочитать файл',
                              variant: 'destructive'
                            });
                          };
                        } catch (error) {
                          setUploadLoading(false);
                          toast({
                            title: 'Ошибка',
                            description: 'Произошла ошибка при загрузке',
                            variant: 'destructive'
                          });
                        }
                      }}
                    >
                      {uploadLoading ? (
                        <>
                          <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                          Загрузка...
                        </>
                      ) : (
                        <>
                          <Icon name="Upload" size={18} className="mr-2" />
                          Загрузить работу
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-white to-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <Badge className="mb-4 glass-card border-blue-200">
                  <Icon name="Award" size={14} className="mr-1" />
                  Преимущества
                </Badge>
                <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
                  Почему выбирают нас
                </h2>
                <p className="text-lg sm:text-xl text-slate-600">
                  Тысячи студентов доверяют нам
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card tech-border p-8 rounded-2xl hover:shadow-xl transition-all group hover:scale-[1.02]">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl transition-shadow">
                    <Icon name="Shield" size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">Проверенные работы</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Все материалы проходят модерацию перед публикацией. Гарантия качества и актуальности.
                  </p>
                </div>

                <div className="glass-card tech-border p-8 rounded-2xl hover:shadow-xl transition-all group hover:scale-[1.02]">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl transition-shadow">
                    <Icon name="Zap" size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">Быстрый доступ</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Мгновенное скачивание после покупки. Все файлы доступны 24/7 в личном кабинете.
                  </p>
                </div>

                <div className="glass-card tech-border p-8 rounded-2xl hover:shadow-xl transition-all group hover:scale-[1.02]">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl transition-shadow">
                    <Icon name="TrendingUp" size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">Зарабатывай на работах</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Получай баллы за каждую загруженную работу. Помогай другим и получай доступ к материалам.
                  </p>
                </div>

                <div className="glass-card tech-border p-8 rounded-2xl hover:shadow-xl transition-all group hover:scale-[1.02]">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl transition-shadow">
                    <Icon name="Users" size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">Сообщество студентов</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Растущее сообщество студентов и авторов. Обменивайся знаниями с коллегами по всей стране.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <AboutSection />

        <NewsSection isAdmin={currentUser?.role === 'admin'} />

        <section id="faq" className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <Badge className="mb-4 glass-card border-blue-200">
                <Icon name="MessageCircle" size={14} className="mr-1" />
                FAQ
              </Badge>
              <h2 className="text-4xl font-bold bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">Вопросы и ответы</h2>
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="HelpCircle" size={20} className="text-primary" />
                    Как купить работу на платформе?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Зарегистрируйтесь на платформе и получите 1000 приветственных баллов. Выберите работу в каталоге, оплатите баллами или картой, и мгновенно скачайте файл.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Shield" size={20} className="text-primary" />
                    Что делать с скачанным материалом?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Используйте материал как образец для самостоятельной переработки. Прямое копирование может привести к проблемам с плагиатом.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="DollarSign" size={20} className="text-primary" />
                    Сколько стоят работы?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Цены начинаются от 500₽ за реферат, 2250-3000₽ за курсовую работу и от 7000₽ за дипломную работу. Это в 10 раз дешевле, чем заказывать работу с нуля на других платформах и не факт, что будет правильная.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Coins" size={20} className="text-primary" />
                    Что такое баллы и как их получить?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    При регистрации вы получаете 1000 баллов бесплатно. 1 балл = 5 рублей. Баллы можно пополнить картой, заработать за загрузку своих работ или получить по реферальной программе.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="RotateCcw" size={20} className="text-primary" />
                    Можно ли вернуть деньги?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Да, если работа не соответствует описанию, обратитесь в поддержку в течение 24 часов. Мы начислим баллы или подберем альтернативную работу.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Database" size={20} className="text-primary" />
                    Сколько работ в каталоге?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    В каталоге 500+ работ по техническим дисциплинам. База пополняется ежедневно.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Zap" size={20} className="text-primary" />
                    Как быстро я получу работу после оплаты?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Мгновенно! После оплаты вы сразу получаете ссылку на скачивание архива. Никаких ожиданий и задержек.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Upload" size={20} className="text-primary" />
                    Могу ли я продавать свои работы?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Да! Загружайте свои работы. За каждую загруженную работу вы получаете баллы. Вы подтверждаете авторство и несёте ответственность за содержание.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="CheckCircle" size={20} className="text-primary" />
                    Это легально?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Tech Forma — это маркетплейс (посредник), предоставляющий техническую платформу для обмена учебными материалами. Все материалы предназначены исключительно для ознакомления и самостоятельной переработки. Пользователь самостоятельно несёт ответственность за их использование.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Mail" size={20} className="text-primary" />
                    Как связаться с поддержкой?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Напишите нам на tech.forma@yandex.ru — мы отвечаем в течение 24 часов.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <FAQSection />

        <LegalDisclaimer />

        <footer className="bg-muted/50 py-8 border-t">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="Cpu" size={28} className="text-primary" />
                  <h3 className="font-bold text-lg">Tech Forma</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Технологичная платформа для обмена студенческими работами
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Информация</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#about" className="hover:text-primary transition-colors">О платформе</a></li>
                  <li><a href="#faq" className="hover:text-primary transition-colors">Вопросы и ответы</a></li>
                  <li><a href="/usage-rules" className="hover:text-primary transition-colors">Правила использования</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Документы</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="/privacy-policy" className="hover:text-primary transition-colors">Политика конфиденциальности</a></li>
                  <li><a href="/terms-of-service" className="hover:text-primary transition-colors">Пользовательское соглашение</a></li>
                  <li><a href="/offer" className="hover:text-primary transition-colors">Договор-оферта</a></li>
                  <li><a href="/requisites" className="hover:text-primary transition-colors">Реквизиты</a></li>
                  <li><a href="/admin" className="hover:text-primary transition-colors">Админ-панель</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t mt-8 pt-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-4xl">
                  <p className="text-xs text-amber-900 font-semibold mb-2">
                    ⚠️ ВАЖНО: Tech Forma — маркетплейс (посредник)
                  </p>
                  <p className="text-xs text-gray-700">
                    Платформа предоставляет только техническую инфраструктуру. Все работы публикуются авторами самостоятельно. 
                    Платформа НЕ создаёт, НЕ проверяет и НЕ гарантирует содержание работ. Материалы предназначены 
                    исключительно для ознакомления и самостоятельной переработки. Доступ 18+
                  </p>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold">ИП Иванов Иван Иванович</p>
                  <p>ИНН: 123456789012 | ОГРНИП: 123456789012345</p>
                  <p>Адрес: г. Москва, ул. Примерная, д. 1, офис 1</p>
                  <p>Email: tech.forma@yandex.ru</p>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  © 2025 Tech Forma. Все права защищены.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <ProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        username={username}
        email={email}
        balance={userBalance}
        onLogout={handleLogout}
        purchases={purchases}
        onOpenReferral={() => setReferralDialogOpen(true)}
        userId={currentUser?.id || null}
        onBalanceUpdate={(newBalance) => {
          if (currentUser) {
            setCurrentUser({ ...currentUser, balance: newBalance });
          }
        }}
      />

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onSuccess={handlePaymentSuccess}
        userEmail={email}
      />

      <CartDialog
        open={cartDialogOpen}
        onOpenChange={setCartDialogOpen}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
        userBalance={userBalance}
      />

      <FavoritesDialog
        open={favoritesDialogOpen}
        onOpenChange={setFavoritesDialogOpen}
        items={favoriteItems}
        onRemoveItem={handleRemoveFromFavorites}
        onAddToCart={handleAddToCart}
      />

      <PromoCodeDialog
        open={promoDialogOpen}
        onOpenChange={setPromoDialogOpen}
        onApplyPromo={handleApplyPromo}
        userId={currentUser?.id}
      />

      <ReferralDialog
        open={referralDialogOpen}
        onOpenChange={setReferralDialogOpen}
        username={username}
        userId={currentUser?.id}
      />

      <CookieBanner />
    </>
  );
}