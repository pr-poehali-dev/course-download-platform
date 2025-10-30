import { useState, useEffect } from 'react';
import { authService, User } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import BlogSection from '@/components/BlogSection';
import AboutSection from '@/components/AboutSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import AgeBadge from '@/components/AgeBadge';
import CookieBanner from '@/components/CookieBanner';
import { notifyPurchaseSuccess, notifyPromoActivated } from '@/utils/emailNotifications';

const MOCK_WORKS = [
  {
    id: 1,
    title: 'Анализ рынка криптовалют 2024',
    type: 'Курсовая работа',
    subject: 'Экономика',
    price: 150,
    rating: 4.8,
    downloads: 234,
    preview: 'Исследование динамики рынка криптовалют с анализом основных трендов...',
  },
  {
    id: 2,
    title: 'Расчет несущей способности балки',
    type: 'Практическая работа',
    subject: 'Сопромат',
    price: 80,
    rating: 4.9,
    downloads: 456,
    preview: 'Полный расчет с чертежами и эпюрами напряжений...',
  },
  {
    id: 3,
    title: 'Разработка веб-приложения на React',
    type: 'Дипломная работа',
    subject: 'Программирование',
    price: 500,
    rating: 5.0,
    downloads: 123,
    preview: 'Дипломный проект с полным кодом и документацией...',
  },
  {
    id: 4,
    title: 'Проект системы водоснабжения',
    type: 'Чертеж',
    subject: 'Строительство',
    price: 200,
    rating: 4.7,
    downloads: 189,
    preview: 'Комплект чертежей в формате DWG с расчетами...',
  },
  {
    id: 5,
    title: 'Маркетинговая стратегия для стартапа',
    type: 'Курсовая работа',
    subject: 'Маркетинг',
    price: 120,
    rating: 4.6,
    downloads: 312,
    preview: 'Подробный анализ рынка и конкурентов с готовой стратегией...',
  },
  {
    id: 6,
    title: 'Исследование алгоритмов машинного обучения',
    type: 'Дипломная работа',
    subject: 'Информатика',
    price: 450,
    rating: 4.9,
    downloads: 98,
    preview: 'Сравнительный анализ методов ML с практической реализацией...',
  },
];

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
  const [pendingUser, setPendingUser] = useState({ username: '', email: '', password: '' });
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [activatedPromos, setActivatedPromos] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<string>('rating');
  
  const userBalance = currentUser?.balance || 0;
  
  const availableWorks = MOCK_WORKS.filter(work => work.price <= userBalance).length;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [realWorks, setRealWorks] = useState<any[]>([]);
  const [worksLoading, setWorksLoading] = useState(true);

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
        const response = await fetch('https://functions.poehali.dev/a16a43fc-fa7d-4c72-ad15-ba566d2c7413');
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
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
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

  const handleAddToFavorites = (work: any) => {
    if (favoriteItems.find(item => item.id === work.id)) {
      toast({
        title: 'Уже в избранном',
        description: 'Эта работа уже в списке избранного',
        variant: 'destructive',
      });
      return;
    }
    setFavoriteItems([...favoriteItems, work]);
    toast({
      title: 'Добавлено в избранное',
      description: work.title,
    });
  };

  const handleRemoveFromFavorites = (id: number) => {
    setFavoriteItems(favoriteItems.filter(item => item.id !== id));
  };

  const handleApplyPromo = (bonus: number, code: string) => {
    if (activatedPromos.includes(code)) {
      toast({
        title: 'Промокод уже использован',
        description: 'Вы уже активировали этот промокод',
        variant: 'destructive',
      });
      return;
    }
    setUserBalance(userBalance + bonus);
    setActivatedPromos([...activatedPromos, code]);
    
    if (email) {
      notifyPromoActivated(email, code, bonus);
    }
  };

  const handlePaymentSuccess = (amount: number) => {
    setUserBalance(userBalance + amount);
  };

  const worksToDisplay = realWorks.length > 0 ? realWorks : MOCK_WORKS.map(w => ({
    ...w,
    work_type: w.type
  }));

  const filteredWorks = worksToDisplay
    .filter((work) => {
      const matchesSearch = work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const workType = work.work_type || work.type;
      const matchesCategory = selectedCategory === 'all' || workType === selectedCategory;
      const matchesPrice = work.price >= minPrice && work.price <= maxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'popular') return (b.downloads || 0) - (a.downloads || 0);
      return 0;
    });

  return (
    <div className="min-h-screen" style={{
      backgroundImage: `url('https://cdn.poehali.dev/files/b1077a7b-9e1f-4fde-8ee3-c49a7a6cb6a0.PNG')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      <div className="bg-white/90 backdrop-blur-sm min-h-screen">
        <header className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="Cpu" size={32} className="text-primary" />
                <h1 className="text-2xl font-bold">Tech Forma</h1>
              </div>
              
              <nav className="hidden md:flex items-center gap-6">
                <a href="/" className="hover:text-primary transition-colors">Главная</a>
                <a href="/catalog" className="hover:text-primary transition-colors">Каталог</a>
                <a href="#blog" className="hover:text-primary transition-colors">Блог</a>
                <a href="#support" className="hover:text-primary transition-colors">Поддержка</a>
              </nav>

              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative"
                  onClick={() => setFavoritesDialogOpen(true)}
                >
                  <Icon name="Heart" size={20} className={favoriteItems.length > 0 ? 'text-red-500' : ''} />
                  {favoriteItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {favoriteItems.length}
                    </span>
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative"
                  onClick={() => setCartDialogOpen(true)}
                >
                  <Icon name="ShoppingCart" size={20} />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </Button>
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full cursor-pointer" onClick={() => setPromoDialogOpen(true)}>
                    <Icon name="Coins" size={20} className="text-primary" />
                    <span className="font-semibold">{userBalance}</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPaymentDialogOpen(true)}
                >
                  <Icon name="Plus" size={16} className="mr-2" />
                  Пополнить
                </Button>

                <Button size="sm" asChild>
                  <a href="/profile">
                    <Icon name="User" size={16} className="mr-2" />
                    Профиль
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 animate-fade-in">
                <Icon name="Zap" size={16} className="text-primary" />
                <span className="text-sm font-medium">Более 450 готовых работ</span>
              </div>
              
              <h2 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent animate-fade-in">
                Обмен студенческими работами
              </h2>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in">
                Делись работами и получай доступ к материалам других студентов
              </p>
              
              <div className="max-w-2xl mx-auto relative animate-fade-in">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                <div className="relative bg-white/80 backdrop-blur-md rounded-2xl p-2 shadow-2xl border-2 border-primary/20">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Курсовая по экономике, диплом по программированию..."
                        className="pl-12 h-14 text-lg border-0 bg-transparent focus-visible:ring-0"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button size="lg" className="h-14 px-8 gradient-purple-blue animate-gradient hover:shadow-xl transition-all duration-300">
                      <Icon name="Search" size={20} className="mr-2" />
                      Найти
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center mt-8 flex-wrap animate-fade-in">
                <Badge 
                  variant={selectedCategory === 'all' ? 'default' : 'outline'} 
                  className="cursor-pointer px-5 py-2.5 text-sm hover:scale-105 transition-transform" 
                  onClick={() => setSelectedCategory('all')}>
                  <Icon name="BookOpen" size={14} className="mr-2" />
                  Все работы
                </Badge>
                <Badge 
                  variant={selectedCategory === 'Курсовая работа' ? 'default' : 'outline'} 
                  className="cursor-pointer px-5 py-2.5 text-sm hover:scale-105 transition-transform" 
                  onClick={() => setSelectedCategory('Курсовая работа')}>
                  <Icon name="FileText" size={14} className="mr-2" />
                  Курсовые
                </Badge>
                <Badge 
                  variant={selectedCategory === 'Дипломная работа' ? 'default' : 'outline'} 
                  className="cursor-pointer px-5 py-2.5 text-sm hover:scale-105 transition-transform" 
                  onClick={() => setSelectedCategory('Дипломная работа')}>
                  <Icon name="Award" size={14} className="mr-2" />
                  Дипломные
                </Badge>
                <Badge 
                  variant={selectedCategory === 'Практическая работа' ? 'default' : 'outline'} 
                  className="cursor-pointer px-5 py-2.5 text-sm hover:scale-105 transition-transform" 
                  onClick={() => setSelectedCategory('Практическая работа')}>
                  <Icon name="Lightbulb" size={14} className="mr-2" />
                  Практические
                </Badge>
                <Badge 
                  variant={selectedCategory === 'Чертеж' ? 'default' : 'outline'} 
                  className="cursor-pointer px-5 py-2.5 text-sm hover:scale-105 transition-transform" 
                  onClick={() => setSelectedCategory('Чертеж')}>
                  <Icon name="Ruler" size={14} className="mr-2" />
                  Чертежи
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
              <div className="text-center animate-fade-in">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon name="Clock" size={32} className="text-primary" />
                </div>
                <h3 className="text-4xl font-bold mb-2">24/7</h3>
                <p className="text-sm text-muted-foreground">Доступ к материалам</p>
              </div>
              
              <div className="text-center animate-fade-in">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon name="Users" size={32} className="text-primary" />
                </div>
                <h3 className="text-4xl font-bold mb-2">5000+</h3>
                <p className="text-sm text-muted-foreground">Студентов с нами</p>
              </div>
              
              <div className="text-center animate-fade-in">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon name="Star" size={32} className="text-primary" />
                </div>
                <h3 className="text-4xl font-bold mb-2">4.8</h3>
                <p className="text-sm text-muted-foreground">Средний рейтинг работ</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-4">
                Как это работает?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Три простых шага для обмена студенческими работами
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
              <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-border">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Icon name="Upload" size={32} className="text-primary" />
                </div>
                <div className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4">
                  ШАГ 1
                </div>
                <h3 className="text-2xl font-bold mb-3">Загрузи работу</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Поделись своей курсовой, дипломом или рефератом и получи баллы за каждую загрузку
                </p>
              </div>

              <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-border">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Icon name="Coins" size={32} className="text-primary" />
                </div>
                <div className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4">
                  ШАГ 2
                </div>
                <h3 className="text-2xl font-bold mb-3">Получай баллы</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Зарабатывай баллы за свои работы или пополняй баланс для доступа к материалам
                </p>
              </div>

              <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-border">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Icon name="Download" size={32} className="text-primary" />
                </div>
                <div className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4">
                  ШАГ 3
                </div>
                <h3 className="text-2xl font-bold mb-3">Скачивай нужное</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Используй баллы для доступа к тысячам готовых работ от других студентов
                </p>
              </div>
            </div>

            <div className="text-center">
              <Button size="lg" className="h-14 px-10 text-lg shadow-xl hover:shadow-2xl" asChild>
                <a href="/catalog">
                  <Icon name="BookOpen" size={22} className="mr-2" />
                  Перейти в каталог
                </a>
              </Button>
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

        <section className="py-20">
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
                            onClick={() => handleAddToFavorites(work)}
                            className={favoriteItems.find(item => item.id === work.id) ? 'text-red-500' : ''}
                          >
                            <Icon name="Heart" size={16} />
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

                {filteredWorks.length === 0 && (
                  <div className="text-center py-16">
                    <Icon name="FileQuestion" size={64} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
                    <p className="text-muted-foreground">Попробуйте изменить параметры поиска</p>
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
      />

      <ReferralDialog
        open={referralDialogOpen}
        onOpenChange={setReferralDialogOpen}
        username={username}
      />

      <AgeBadge />
      <CookieBanner />
    </div>
  );
}