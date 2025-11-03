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
import TermsAcceptanceDialog from '@/components/TermsAcceptanceDialog';
import PaymentDialog from '@/components/PaymentDialog';
import CartDialog from '@/components/CartDialog';
import FavoritesDialog from '@/components/FavoritesDialog';
import PromoCodeDialog from '@/components/PromoCodeDialog';
import ReferralDialog from '@/components/ReferralDialog';
import PremiumDialog from '@/components/PremiumDialog';
import BlogSection from '@/components/BlogSection';
import AboutSection from '@/components/AboutSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import AgeBadge from '@/components/AgeBadge';
import CookieBanner from '@/components/CookieBanner';
import { notifyPurchaseSuccess, notifyPromoActivated } from '@/utils/emailNotifications';



export default function Index() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isLoggedIn = !!currentUser;
  const username = currentUser?.username || '';
  const email = currentUser?.email || '';
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const [favoritesDialogOpen, setFavoritesDialogOpen] = useState(false);
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);
  const [premiumDialogOpen, setPremiumDialogOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState({ username: '', email: '', password: '' });
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
  
  const userBalance = currentUser?.balance || 0;
  const availableWorks = realWorks.filter(work => (work.price_points || work.price || 0) <= userBalance).length;

  useEffect(() => {
    const initAuth = async () => {
      const user = await authService.verify();
      setCurrentUser(user);
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

  const handleShowTerms = (user: string, userEmail: string, password: string) => {
    setPendingUser({ username: user, email: userEmail, password });
    setTermsDialogOpen(true);
  };

  const handleAcceptTerms = async () => {
    try {
      const data = await authService.register(
        pendingUser.username,
        pendingUser.email,
        (pendingUser as any).password
      );
      setCurrentUser(data.user);
      setTermsDialogOpen(false);
      setAuthDialogOpen(false);
      setPendingUser({ username: '', email: '', password: '' });
      toast({
        title: 'Регистрация успешна!',
        description: `Добро пожаловать, ${data.user.username}! Вам начислено 100 баллов.`,
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

  const handleCheckout = () => {
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price_points || item.price || 0), 0);
    if (userBalance >= totalPrice) {
      setUserBalance(userBalance - totalPrice);
      setPurchases([...purchases, ...cartItems.map(item => ({
        ...item,
        date: new Date().toLocaleDateString('ru-RU')
      }))]);
      
      if (email) {
        cartItems.forEach(item => {
          notifyPurchaseSuccess(email, item.title);
        });
      }
      
      setCartItems([]);
      toast({
        title: 'Покупка успешна!',
        description: `Куплено работ: ${cartItems.length}. Проверьте email.`,
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
    <div className="min-h-screen w-full overflow-x-hidden" style={{
      backgroundImage: `url('https://cdn.poehali.dev/files/b1077a7b-9e1f-4fde-8ee3-c49a7a6cb6a0.PNG')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      <div className="bg-white/90 backdrop-blur-sm min-h-screen w-full">
        <header className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50 w-full">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
                <Icon name="Cpu" size={24} className="text-primary flex-shrink-0 sm:w-8 sm:h-8" />
                <h1 className="text-lg sm:text-2xl font-bold truncate">Tech Forma</h1>
              </div>
              
              <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
                <a href="/" className="hover:text-primary transition-colors text-sm">Главная</a>
                <a href="/catalog" className="hover:text-primary transition-colors text-sm">Каталог</a>
                <a href="#blog" className="hover:text-primary transition-colors text-sm">Блог</a>
                <a href="#support" className="hover:text-primary transition-colors text-sm">Поддержка</a>
              </nav>

              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {isLoggedIn ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="relative h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex"
                      onClick={() => setFavoritesDialogOpen(true)}
                    >
                      <Icon name="Heart" size={18} className={favoriteItems.length > 0 ? 'text-red-500' : ''} />
                      {favoriteItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                          {favoriteItems.length}
                        </span>
                      )}
                    </Button>
                    
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
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-primary/10 rounded-full cursor-pointer" onClick={() => setPromoDialogOpen(true)}>
                        <Icon name="Coins" size={16} className="text-primary sm:w-5 sm:h-5" />
                        <span className="font-semibold text-sm sm:text-base">{userBalance}</span>
                      </div>
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
                        <DropdownMenuItem onClick={() => setPremiumDialogOpen(true)} className="text-purple-600 font-medium">
                          <Icon name="Crown" size={16} className="mr-2" />
                          Premium подписка
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setPaymentDialogOpen(true)}>
                          <Icon name="Wallet" size={16} className="mr-2" />
                          Пополнить баланс
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFavoritesDialogOpen(true)}>
                          <Icon name="Heart" size={16} className="mr-2" />
                          Избранное
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPromoDialogOpen(true)}>
                          <Icon name="Gift" size={16} className="mr-2" />
                          Промокоды
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
          </div>
        </header>

        <section className="relative py-12 sm:py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDIiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-60"></div>
          
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center mb-8 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full mb-4 sm:mb-8 animate-fade-in backdrop-blur-sm border border-primary/20">
                <Icon name="Sparkles" size={16} className="text-primary sm:w-[18px] sm:h-[18px]" />
                <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Платформа нового поколения для студентов
                </span>
              </div>
              
              <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-8 bg-gradient-to-r from-slate-900 via-primary to-purple-600 bg-clip-text text-transparent animate-fade-in leading-tight px-2">
                Tech Forma
              </h2>
              
              <p className="text-lg sm:text-2xl md:text-3xl font-semibold text-slate-700 mb-3 sm:mb-6 animate-fade-in px-2">
                Умная экосистема для студентов
              </p>
              
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-12 max-w-3xl mx-auto animate-fade-in leading-relaxed px-4">
                Облачный каталог работ + ИИ-помощник + Обмен знаниями. Всё в одном месте.
              </p>
              
              <div className="flex gap-2 sm:gap-4 justify-center mb-6 sm:mb-12 flex-wrap animate-fade-in px-2">
                <Button size="lg" className="h-10 sm:h-12 lg:h-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-sm sm:text-base lg:text-lg shadow-xl" asChild>
                  <a href="/catalog">
                    <Icon name="Database" size={18} className="mr-1 sm:mr-2 sm:w-5 sm:h-5" />
                    Каталог работ
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="h-10 sm:h-12 lg:h-14 px-4 sm:px-6 lg:px-8 text-sm sm:text-base lg:text-lg border-2 backdrop-blur-sm bg-white/50" asChild>
                  <a href="/ai-assistant">
                    <Icon name="Bot" size={18} className="mr-1 sm:mr-2 sm:w-5 sm:h-5" />
                    TechMentor Pro
                  </a>
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 max-w-4xl mx-auto px-2">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center border border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg">
                  <div className="text-xl sm:text-3xl font-bold text-primary mb-1">{realWorks.length > 0 ? realWorks.length : '450'}+</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Готовых работ</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center border border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg">
                  <div className="text-xl sm:text-3xl font-bold text-purple-600 mb-1">ИИ</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Помощник</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center border border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg">
                  <div className="text-xl sm:text-3xl font-bold text-blue-600 mb-1">24/7</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Доступ</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center border border-green-200 hover:border-green-400 transition-all hover:shadow-lg">
                  <div className="text-xl sm:text-3xl font-bold text-green-600 mb-1">1000+</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Студентов</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-blue-600 via-primary to-blue-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>
          
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 relative z-10">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-white/20 backdrop-blur-sm text-white border-white/30">
                Возможности платформы
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white drop-shadow-lg">
                Всё, что нужно студенту
              </h2>
              <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
                Три мощных инструмента в единой экосистеме
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
              <Card className="relative overflow-hidden border-2 border-white/20 bg-white/95 backdrop-blur-sm hover:border-white transition-all group hover:shadow-2xl hover:scale-105">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
                <CardHeader>
                  <div className="w-full h-48 mb-4 rounded-xl overflow-hidden">
                    <img 
                      src="https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/cf4ec9f2-8937-4cdc-8478-e9adb8e7c1e3.jpg" 
                      alt="Облачный каталог" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardTitle className="text-2xl">Облачный каталог</CardTitle>
                  <CardDescription className="text-base">450+ готовых работ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span>Курсовые, дипломы, чертежи</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span>PDF превью перед покупкой</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span>Мгновенный доступ</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span>Рейтинги и отзывы</span>
                  </div>
                  <Button className="w-full mt-4" variant="outline" asChild>
                    <a href="/catalog">
                      <Icon name="ArrowRight" size={16} className="mr-2" />
                      Смотреть каталог
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-2 border-white/20 bg-white/95 backdrop-blur-sm hover:border-white transition-all group hover:shadow-2xl hover:scale-105">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
                <CardHeader>
                  <div className="w-full h-48 mb-4 rounded-xl overflow-hidden">
                    <img 
                      src="https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/c7b936bf-e40d-4ad4-9b3a-2a34eb9432a2.jpg" 
                      alt="TechMentor Pro" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardTitle className="text-2xl">TechMentor Pro</CardTitle>
                  <CardDescription className="text-base">ИИ-помощник для адаптации</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span>Адаптация под ВУЗ</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span>Переформулирование текста</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span>Помощь с оформлением</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span>GPT-4 под капотом</span>
                  </div>
                  <Button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700" asChild>
                    <a href="/ai-assistant">
                      <Icon name="Sparkles" size={16} className="mr-2" />
                      Попробовать ИИ
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-2 border-white/20 bg-white/95 backdrop-blur-sm hover:border-white transition-all group hover:shadow-2xl hover:scale-105">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all"></div>
                <CardHeader>
                  <div className="w-full h-48 mb-4 rounded-xl overflow-hidden">
                    <img 
                      src="https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/36b21e6e-ac19-4040-a50f-ce06216379e7.jpg" 
                      alt="Маркетплейс" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardTitle className="text-2xl">Библиотека работ</CardTitle>
                  <CardDescription className="text-base">Делись работами и получай баллы</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span>10 баллов за скачивание</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span>Авто-модерация</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span>Статистика скачиваний</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span>Обмен знаниями</span>
                  </div>
                  <Button className="w-full mt-4" variant="outline" asChild>
                    <a href="/marketplace">
                      <Icon name="Upload" size={16} className="mr-2" />
                      Загрузить работу
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-slate-900 text-white">
                <Icon name="Code" size={14} className="mr-1" />
                Технологический стек
              </Badge>
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Современные технологии
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Используем передовые решения для максимальной производительности и безопасности
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                <Card className="p-6 text-center hover:shadow-lg transition-all border-2 hover:border-blue-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                    <Icon name="Code" size={32} className="text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">React + Vite</h3>
                  <p className="text-sm text-muted-foreground">Молниеносный UI</p>
                </Card>

                <Card className="p-6 text-center hover:shadow-lg transition-all border-2 hover:border-purple-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Icon name="Brain" size={32} className="text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">OpenAI GPT-4</h3>
                  <p className="text-sm text-muted-foreground">ИИ-помощник</p>
                </Card>

                <Card className="p-6 text-center hover:shadow-lg transition-all border-2 hover:border-green-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
                    <Icon name="Database" size={32} className="text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">PostgreSQL</h3>
                  <p className="text-sm text-muted-foreground">Надёжная БД</p>
                </Card>

                <Card className="p-6 text-center hover:shadow-lg transition-all border-2 hover:border-orange-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center">
                    <Icon name="Zap" size={32} className="text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Cloud Functions</h3>
                  <p className="text-sm text-muted-foreground">Serverless API</p>
                </Card>

                <Card className="p-6 text-center hover:shadow-lg transition-all border-2 hover:border-red-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center">
                    <Icon name="FileText" size={32} className="text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">PDF.js</h3>
                  <p className="text-sm text-muted-foreground">Превью файлов</p>
                </Card>

                <Card className="p-6 text-center hover:shadow-lg transition-all border-2 hover:border-yellow-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center">
                    <Icon name="CreditCard" size={32} className="text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">ЮКасса</h3>
                  <p className="text-sm text-muted-foreground">Оплата</p>
                </Card>

                <Card className="p-6 text-center hover:shadow-lg transition-all border-2 hover:border-cyan-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center">
                    <Icon name="Cloud" size={32} className="text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Yandex Cloud</h3>
                  <p className="text-sm text-muted-foreground">Инфраструктура</p>
                </Card>

                <Card className="p-6 text-center hover:shadow-lg transition-all border-2 hover:border-pink-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center">
                    <Icon name="Shield" size={32} className="text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">SSL/TLS</h3>
                  <p className="text-sm text-muted-foreground">Безопасность</p>
                </Card>
              </div>

              <Card className="bg-gradient-to-br from-slate-900 to-slate-700 text-white p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-4xl font-bold mb-2 text-blue-400">99.9%</div>
                    <p className="text-slate-300">Uptime гарантия</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2 text-green-400">&lt;100ms</div>
                    <p className="text-slate-300">Средний ответ API</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2 text-purple-400">256-bit</div>
                    <p className="text-slate-300">Шифрование данных</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
                  <Icon name="Sparkles" size={14} className="mr-1" />
                  Новинка
                </Badge>
                <h2 className="text-5xl font-bold mb-4">
                  TechMentor Pro — твой наставник
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  ИИ-помощник поможет адаптировать купленную работу под требования твоего ВУЗа
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <Card className="border-2 border-purple-200 hover:shadow-xl transition-all">
                  <CardHeader>
                    <Icon name="Bot" size={48} className="text-purple-600 mb-4" />
                    <CardTitle className="text-2xl">Что умеет TechMentor Pro?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Icon name="Check" size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Анализирует структуру купленной работы</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="Check" size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Помогает переформулировать текст под твой стиль</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="Check" size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Подсказывает, как адаптировать под требования ВУЗа</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="Check" size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Учит работать с источниками и оформлением</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-200 hover:shadow-xl transition-all">
                  <CardHeader>
                    <Icon name="Lightbulb" size={48} className="text-blue-600 mb-4" />
                    <CardTitle className="text-2xl">Принцип работы</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        1
                      </div>
                      <p className="text-sm">Загружаешь купленную работу в чат</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        2
                      </div>
                      <p className="text-sm">Описываешь требования своего ВУЗа</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        3
                      </div>
                      <p className="text-sm">Получаешь пошаговые инструкции и подсказки</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        4
                      </div>
                      <p className="text-sm">Самостоятельно дорабатываешь текст с помощью ИИ</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-2 border-orange-200 bg-orange-50/50 mb-8">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Icon name="AlertCircle" size={32} className="text-orange-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Важно: мы учим, а не делаем за тебя!</h3>
                      <p className="text-muted-foreground text-sm">
                        Помощник не пишет работу за тебя — он помогает понять, как адаптировать текст самостоятельно. 
                        Это как репетитор: объясняет, направляет, но главная работа — за тобой. Так ты действительно учишься! 📚
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-6 text-center">Тарифы на TechMentor Pro</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border-2 rounded-xl p-6 hover:border-primary transition-all">
                    <div className="text-center mb-4">
                      <Icon name="Zap" size={32} className="text-yellow-500 mx-auto mb-2" />
                      <h4 className="font-bold text-lg">Разовый доступ</h4>
                      <p className="text-sm text-muted-foreground">Для одной работы</p>
                    </div>
                    <div className="text-center mb-4">
                      <span className="text-4xl font-bold">500₽</span>
                    </div>
                    <ul className="space-y-2 text-sm mb-6">
                      <li className="flex items-center gap-2">
                        <Icon name="Check" size={16} className="text-green-600" />
                        Доступ на 7 дней
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon name="Check" size={16} className="text-green-600" />
                        Неограниченные запросы
                      </li>
                    </ul>
                  </div>

                  <div className="border-2 border-purple-500 rounded-xl p-6 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">Популярный</Badge>
                    </div>
                    <div className="text-center mb-4">
                      <Icon name="Rocket" size={32} className="text-purple-500 mx-auto mb-2" />
                      <h4 className="font-bold text-lg">Месячная</h4>
                      <p className="text-sm text-muted-foreground">Без ограничений</p>
                    </div>
                    <div className="text-center mb-4">
                      <span className="text-4xl font-bold">2 990₽</span>
                    </div>
                    <ul className="space-y-2 text-sm mb-6">
                      <li className="flex items-center gap-2">
                        <Icon name="Check" size={16} className="text-green-600" />
                        Любое количество работ
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon name="Check" size={16} className="text-green-600" />
                        Приоритетная поддержка
                      </li>
                    </ul>
                  </div>

                  <div className="border-2 rounded-xl p-6 hover:border-primary transition-all">
                    <div className="text-center mb-4">
                      <Icon name="Crown" size={32} className="text-yellow-500 mx-auto mb-2" />
                      <h4 className="font-bold text-lg">Годовая</h4>
                      <p className="text-sm text-muted-foreground">Максимальная выгода</p>
                    </div>
                    <div className="text-center mb-4">
                      <span className="text-4xl font-bold">18 000₽</span>
                      <p className="text-sm text-green-600 font-semibold">Экономия 50%</p>
                    </div>
                    <ul className="space-y-2 text-sm mb-6">
                      <li className="flex items-center gap-2">
                        <Icon name="Check" size={16} className="text-green-600" />
                        Всё из месячной
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon name="Check" size={16} className="text-green-600" />
                        Эксклюзивные функции
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="text-center mt-8">
                  <Button 
                    size="lg" 
                    className="h-14 px-10 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    asChild
                  >
                    <a href="/ai-assistant">
                      <Icon name="Bot" size={22} className="mr-2" />
                      Попробовать TechMentor Pro
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Icon name="TrendingUp" size={14} className="mr-1" />
                Популярные работы
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Лучшие работы по рейтингу
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                Работы с высшими оценками от студентов и преподавателей
              </p>
            </div>

            {worksLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Icon name="Loader2" size={48} className="animate-spin text-primary" />
                <p className="text-muted-foreground">Загружаем каталог работ...</p>
              </div>
            ) : topWorks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Icon name="Search" size={48} className="text-muted-foreground" />
                <p className="text-lg font-semibold">Работы не найдены</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {topWorks.map((work, index) => {
                    const price = work.price_points || work.price;
                    const workType = work.work_type || work.type;
                    const isAffordable = price <= userBalance;
                    return (
                      <Card 
                        key={work.id} 
                        className={`group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 animate-fade-in overflow-hidden ${
                          isAffordable 
                            ? 'border-green-500/30 bg-green-50/50 hover:border-green-500/50' 
                            : 'hover:border-primary/30'
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

                <div className="text-center">
                  <Button 
                    size="lg" 
                    className="h-14 px-10 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    asChild
                  >
                    <a href="/catalog">
                      <Icon name="Database" size={22} className="mr-2" />
                      Открыть полный каталог ({realWorks.length} работ)
                    </a>
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-1 mb-8">
                <TabsTrigger value="upload">
                  <Icon name="Upload" size={18} className="mr-2" />
                  Загрузить работу
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
                  )}
                  )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upload">
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle>Загрузить свою работу</CardTitle>
                    <CardDescription>
                      Поделись своей работой и получай баллы за каждое скачивание
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="work-title">Название работы</Label>
                      <Input id="work-title" placeholder="Анализ рынка недвижимости..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="work-type">Тип работы</Label>
                        <Select>
                          <SelectTrigger id="work-type">
                            <SelectValue placeholder="Выберите тип" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="coursework">Курсовая работа</SelectItem>
                            <SelectItem value="diploma">Дипломная работа</SelectItem>
                            <SelectItem value="practical">Практическая работа</SelectItem>
                            <SelectItem value="drawing">Чертеж</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="work-price">Цена в баллах</Label>
                        <Input id="work-price" type="number" placeholder="150" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="work-subject">Предмет</Label>
                      <Input id="work-subject" placeholder="Маркетинг" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="work-description">Описание</Label>
                      <Textarea 
                        id="work-description" 
                        placeholder="Краткое описание работы, что включено..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="work-file">Файл работы</Label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                        <Icon name="Upload" size={32} className="mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Перетащите файл сюда или нажмите для выбора
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          PDF, DOC, DOCX, DWG до 50 МБ
                        </p>
                      </div>
                    </div>


                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" size="lg">
                      <Icon name="Upload" size={18} className="mr-2" />
                      Загрузить работу
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold mb-4">
                  Почему выбирают нас?
                </h2>
                <p className="text-xl text-muted-foreground">
                  Тысячи студентов уже используют платформу
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card p-8 rounded-2xl shadow-lg border-2 border-border hover:shadow-xl transition-shadow hover:border-primary/50">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                    <Icon name="Shield" size={24} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Проверенные работы</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Все материалы проходят модерацию перед публикацией. Гарантия качества и актуальности.
                  </p>
                </div>

                <div className="bg-card p-8 rounded-2xl shadow-lg border-2 border-border hover:shadow-xl transition-shadow hover:border-primary/50">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                    <Icon name="Zap" size={24} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Быстрый доступ</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Мгновенное скачивание после покупки. Все файлы доступны 24/7 в личном кабинете.
                  </p>
                </div>

                <div className="bg-card p-8 rounded-2xl shadow-lg border-2 border-border hover:shadow-xl transition-shadow hover:border-primary/50">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                    <Icon name="TrendingUp" size={24} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Зарабатывай на работах</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Получай баллы за каждую загруженную работу. Помогай другим и получай доступ к материалам.
                  </p>
                </div>

                <div className="bg-card p-8 rounded-2xl shadow-lg border-2 border-border hover:shadow-xl transition-shadow hover:border-primary/50">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                    <Icon name="Users" size={24} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Сообщество студентов</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Более 5000 активных пользователей. Обменивайся знаниями с коллегами по всей стране.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <AboutSection />

        <TestimonialsSection />

        <BlogSection />

        <section id="support" className="py-16 bg-muted/30">
          <SupportPage />
        </section>

        <section id="faq" className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-4xl font-bold text-center mb-12">Вопросы и ответы</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="HelpCircle" size={20} className="text-primary" />
                    Как работает балльная система?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Загрузи свою работу — получи баллы бесплатно. Или купи баллы, чтобы получить доступ к материалам других студентов для обучения.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Shield" size={20} className="text-primary" />
                    Это легально?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Платформа работает как база референсных материалов для обучения. Все работы используются исключительно в ознакомительных целях.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Upload" size={20} className="text-primary" />
                    Как загрузить свою работу?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Нажми "Загрузить работу", заполни описание, выбери цену в баллах и загрузи файл. После проверки работа станет доступна другим студентам.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="CreditCard" size={20} className="text-primary" />
                    Какие способы оплаты доступны?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Банковские карты (Visa, MasterCard, МИР), электронные кошельки, СБП. Все платежи защищены и проходят через безопасные шлюзы.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-500/30 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Coins" size={20} className="text-blue-600" />
                    Почему баллы, а не деньги?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Tech Forma — это <span className="font-semibold text-foreground">студенческое сообщество</span>, а не маркетплейс. Мы создали систему баллов для честного обмена знаниями:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Помогаешь другим</strong> — делишься работой и получаешь баллы</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Используешь баллы</strong> — покупаешь работы других студентов</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Без комиссий банков</strong> — обмен внутри платформы</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Фокус на обучении</strong>, а не на заработке</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3 italic">
                    💡 Если нужны баллы, а своих работ нет — можно купить баллы за рубли в разделе "Пополнить баланс".
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

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
                <h4 className="font-semibold mb-4">Платформа</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#catalog" className="hover:text-primary transition-colors">Каталог работ</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Загрузить работу</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Покупка баллов</a></li>
                </ul>
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
                <h4 className="font-semibold mb-4">Поддержка</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#support" className="hover:text-primary transition-colors">Связаться с нами</a></li>
                  <li><a href="/privacy-policy" className="hover:text-primary transition-colors">Политика конфиденциальности</a></li>
                  <li><a href="/terms-of-service" className="hover:text-primary transition-colors">Пользовательское соглашение</a></li>
                  <li><a href="/offer" className="hover:text-primary transition-colors">Договор-оферта</a></li>
                  <li><a href="/requisites" className="hover:text-primary transition-colors">Реквизиты</a></li>
                  <li><a href="/roskomnadzor-guide" className="hover:text-primary transition-colors">Регистрация в Роскомнадзоре</a></li>
                  <li><a href="/admin" className="hover:text-primary transition-colors">Админ-панель</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t mt-8 pt-8">
              <div className="text-center text-sm text-muted-foreground">
                <p>© 2024 Tech Forma. Все материалы предоставлены в ознакомительных целях.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        onLogin={handleLogin}
        onShowTerms={(user, email) => handleShowTerms(user, email)}
      />

      <TermsAcceptanceDialog
        open={termsDialogOpen}
        onAccept={handleAcceptTerms}
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

      <PremiumDialog
        open={premiumDialogOpen}
        onOpenChange={setPremiumDialogOpen}
        userId={currentUser?.id}
        onSuccess={() => {
          if (currentUser) {
            setCurrentUser({ ...currentUser, is_premium: true });
          }
        }}
      />

      <AgeBadge />
      <CookieBanner />
    </div>
  );
}