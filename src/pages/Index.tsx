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
import { ThemeToggle } from '@/components/ThemeToggle';
import SupportPage from '@/components/SupportPage';
import AdminPanel from '@/components/AdminPanel';
import PaymentDialog from '@/components/PaymentDialog';
import CartDialog from '@/components/CartDialog';
import FavoritesDialog from '@/components/FavoritesDialog';
import PromoCodeDialog from '@/components/PromoCodeDialog';
import ReferralDialog from '@/components/ReferralDialog';
import Breadcrumbs from '@/components/Breadcrumbs';


import AboutSection from '@/components/AboutSection';
import RecentlyViewed from '@/components/RecentlyViewed';

import FAQSection from '@/components/FAQSection';
import CookieBanner from '@/components/CookieBanner';
import { notifyPurchaseSuccess, notifyPromoActivated } from '@/utils/emailNotifications';
import SEO from '@/components/SEO';
import { Helmet } from 'react-helmet-async';
import HomeHeader from '@/components/home/HomeHeader';
import RotatingText from '@/components/home/RotatingText';
import NewsSection from '@/components/NewsSection';

import ExitIntentModal from '@/components/ExitIntentModal';
import SEOHeroSection from '@/components/home/SEOHeroSection';
import WorkCategoriesSection from '@/components/home/WorkCategoriesSection';
import SEOContentSection from '@/components/home/SEOContentSection';
import SEOFAQSection from '@/components/home/SEOFAQSection';
import PopularCategoriesLinks from '@/components/home/PopularCategoriesLinks';
import CategoryLinksSection from '@/components/seo/CategoryLinksSection';
import PopularSearches from '@/components/seo/PopularSearches';
import BlogSection from '@/components/home/BlogSection';
import Footer from '@/components/Footer';
import { useScrollTracking } from '@/hooks/useScrollTracking';
import NewYearSnow from '@/components/NewYearSnow';
import NewYearBanner from '@/components/NewYearBanner';




export default function Index() {
  useScrollTracking();
  
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
        title="Чертежи DWG и 3D-модели CAD | Tech Forma"
        description="Чертежи DWG/DXF, 3D-модели, технические расчёты. Инженерная платформа для студентов и специалистов. Скачать документацию и примеры."
        canonical="https://techforma.pro/"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Tech Forma",
            "url": "https://techforma.pro",
            "logo": "https://techforma.pro/logo.png",
            "description": "Инженерная платформа для студентов и специалистов. Чертежи, CAD-проекты, 3D-модели, примеры расчётов",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "RU"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "email": "tech.forma@yandex.ru",
              "contactType": "customer service"
            },
            "sameAs": [
              "https://techforma.pro"
            ],
            "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": "RUB",
              "lowPrice": "200",
              "highPrice": "3000",
              "offerCount": "500"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Что такое Tech Forma?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Tech Forma — инженерная платформа для студентов и специалистов. База справочных материалов, чертежей, CAD-проектов и примеров технических расчётов для обучения."
                }
              },
              {
                "@type": "Question",
                "name": "Какие материалы доступны?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "В библиотеке доступны чертежи, 3D-модели, примеры технических расчётов, проектная документация и учебные материалы для изучения."
                }
              },
              {
                "@type": "Question",
                "name": "Для чего предназначены материалы?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Все материалы предоставляются исключительно в образовательных целях как справочные пособия и примеры оформления. Требуют авторской переработки."
                }
              }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Главная",
                "item": "https://techforma.pro/"
              }
            ]
          })}
        </script>
      </Helmet>

      <ExitIntentModal />
      <NewYearSnow />
      <NewYearBanner onBuyPoints={() => setPaymentDialogOpen(true)} />
      <div className="min-h-screen w-full overflow-x-hidden bg-background">
        <header className="glass-card border-b border-border sticky top-0 z-50 w-full backdrop-blur-md shadow-sm">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-shrink">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Ruler" size={24} className="text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="text-xl sm:text-2xl font-bold truncate leading-tight text-foreground">TechForma</div>
                  <p className="text-xs text-muted-foreground hidden sm:block">Инженерная платформа</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-1 justify-end">
                <nav className="hidden lg:flex items-center gap-6">
                  <a href="/" className="text-foreground hover:text-primary transition-colors font-medium relative group">
                    Главная
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all"></span>
                  </a>
                  <a href="/catalog" className="text-muted-foreground hover:text-primary transition-colors font-medium">Каталог</a>
                  <a href="#categories" className="text-muted-foreground hover:text-primary transition-colors font-medium">Категории</a>
                  <a href="#about" className="text-muted-foreground hover:text-primary transition-colors font-medium">О нас</a>
                </nav>
                
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden h-10 w-10"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <Icon name={mobileMenuOpen ? "X" : "Menu"} size={24} />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
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
                      <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-1 sm:py-2 bg-primary/10 border-2 border-primary rounded-lg">
                        <Icon name="Coins" size={16} className="text-primary sm:w-5 sm:h-5" />
                        <span className="font-bold text-sm sm:text-base text-primary">{userBalance}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={refreshBalance}
                        className="h-8 w-8 hover:bg-primary/10"
                        title="Обновить баланс"
                      >
                        <Icon name="RefreshCw" size={16} className="text-primary" />
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
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm sm:text-lg shadow-md">
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
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setAuthDialogOpen(true)} 
                      variant="ghost"
                      size="sm" 
                      className="text-sm px-4 hover:bg-muted"
                    >
                      Вход
                    </Button>
                    <Button 
                      onClick={() => setAuthDialogOpen(true)} 
                      size="sm" 
                      className="text-sm px-4 bg-primary hover:bg-primary/90 text-white shadow-md"
                    >
                      Регистрация
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {mobileMenuOpen && (
              <div className="lg:hidden border-t border-primary/30 cyber-card backdrop-blur-md">
                <nav className="flex flex-col py-4 px-4 gap-2">
                  <a 
                    href="/" 
                    className="py-3 px-4 hover:bg-primary/20 rounded border border-transparent hover:border-primary/50 transition-all text-base font-medium uppercase tracking-wide"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Главная
                  </a>
                  <a 
                    href="/catalog" 
                    className="py-3 px-4 hover:bg-primary/20 rounded border border-transparent hover:border-primary/50 transition-all text-base font-medium uppercase tracking-wide"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Каталог
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

        <SEOHeroSection onCatalogClick={() => window.location.href = '/catalog'} />

        <WorkCategoriesSection onCatalogClick={(category) => {
          if (category) {
            window.location.href = `/catalog?category=${category}`;
          } else {
            window.location.href = '/catalog';
          }
        }} />

        <section className="relative py-20 bg-background border-b border-border">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground section-title-line">
                Как это работает
              </h2>
              <p className="text-lg text-muted-foreground">
                Простой процесс получения доступа к материалам
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="cyber-card rounded-xl p-8 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                <div className="w-16 h-16 bg-primary text-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-3xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Регистрация</h3>
                <p className="text-base text-muted-foreground leading-relaxed">Создайте аккаунт и получите приветственные баллы</p>
              </div>

              <div className="cyber-card rounded-xl p-8 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-secondary"></div>
                <div className="w-16 h-16 bg-secondary text-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-3xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Выбор материала</h3>
                <p className="text-base text-muted-foreground leading-relaxed">Найдите нужный чертёж или проект в каталоге</p>
              </div>

              <div className="cyber-card rounded-xl p-8 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                <div className="w-16 h-16 bg-primary text-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-3xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Скачивание</h3>
                <p className="text-base text-muted-foreground leading-relaxed">Мгновенный доступ к файлам после оплаты</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30 border-b border-border">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground section-title-line">
                Возможности платформы
              </h2>
              <p className="text-lg text-muted-foreground">
                Всё необходимое для работы с материалами
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <div className="cyber-card rounded-xl p-8 group hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <Icon name="Database" size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Библиотека чертежей</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Чертежи DWG/DXF, 3D-модели STEP/STL, технические расчёты и проектная документация.
                </p>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-md" asChild>
                  <a href="/catalog">
                    <Icon name="Search" size={18} className="mr-2" />
                    Смотреть каталог
                  </a>
                </Button>
              </div>

              <div className="cyber-card rounded-xl p-8 group hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <Icon name="Upload" size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Загрузка материалов</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Делитесь своими разработками, помогайте коллегам и зарабатывайте баллы.
                </p>
                <Button 
                  className="w-full bg-secondary hover:bg-secondary/90 text-white shadow-md"
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
                    setProfileDialogOpen(true);
                  }}
                >
                  <Icon name="Plus" size={18} className="mr-2" />
                  Загрузить работу
                </Button>
              </div>
            </div>
          </div>
        </section>



        <section className="py-20 bg-muted/30">
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



        <AboutSection />

        <NewsSection isAdmin={currentUser?.role === 'admin'} />

        <section id="faq" className="py-20 bg-background border-b border-border">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground section-title-line">Частые вопросы</h2>
              <p className="text-lg text-muted-foreground">Всё об инженерной платформе TechForma</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="cyber-card rounded-xl p-6">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <Icon name="FileText" size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Какие форматы поддерживаются?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  DWG, DXF, STEP, STL, PDF, KOMPAS, SolidWorks и другие CAD-форматы. Все материалы проверены и открываются стандартным ПО.
                </p>
              </div>

              <div className="cyber-card rounded-xl p-6">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Download" size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Как скачать чертежи?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Зарегистрируйтесь, пополните баланс баллами, выберите материал и мгновенно скачивайте файлы. Без ожидания и модерации.
                </p>
              </div>

              <div className="cyber-card rounded-xl p-6">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Coins" size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Система баллов</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  1 балл = 5₽. Загружайте свои разработки и зарабатывайте 90% от каждой продажи. Баллы можно пополнить картой.
                </p>
              </div>

              <div className="cyber-card rounded-xl p-6">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Shield" size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Безопасность и качество</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Все файлы проверяются на вирусы. Материалы модерируются. Гарантия возврата баллов при несоответствии описанию.
                </p>
              </div>

              <div className="cyber-card rounded-xl p-6">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Users" size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Для кого платформа?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Студенты технических вузов, инженеры-конструкторы, проектировщики и все, кто работает с CAD-системами.
                </p>
              </div>

              <div className="cyber-card rounded-xl p-6">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Mail" size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Поддержка 24/7</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Напишите на tech.forma@yandex.ru — отвечаем в течение 24 часов. Помощь по файлам, балансу и загрузке.
                </p>
              </div>
            </div>
          </div>
        </section>

        <CategoryLinksSection />
        
        <BlogSection />
        
        <PopularSearches />
        
        <SEOContentSection />
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

      <Footer />
      <CookieBanner />
    </>
  );
}