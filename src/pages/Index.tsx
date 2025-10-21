import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import AuthDialog from '@/components/AuthDialog';
import ProfileDialog from '@/components/ProfileDialog';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  
  const [userBalance, setUserBalance] = useState(320);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleLogin = (user: string, userEmail: string) => {
    setIsLoggedIn(true);
    setUsername(user);
    setEmail(userEmail);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setEmail('');
  };

  const handleBuyWork = (price: number, title: string) => {
    if (userBalance >= price) {
      setUserBalance(userBalance - price);
      toast({
        title: 'Покупка успешна!',
        description: `Работа "${title}" доступна в личном кабинете`,
      });
    } else {
      toast({
        title: 'Недостаточно баллов',
        description: 'Пополните баланс для покупки',
        variant: 'destructive',
      });
    }
  };

  const handleBuyPoints = (amount: number) => {
    setUserBalance(userBalance + amount);
    toast({
      title: 'Баллы зачислены!',
      description: `+${amount} баллов на ваш счёт`,
    });
  };

  const filteredWorks = MOCK_WORKS.filter((work) => {
    const matchesSearch = work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      work.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || work.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen" style={{
      backgroundImage: `url('https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/430aec0a-67df-4312-9dec-dfd23d13d0d8.jpg')`,
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
                <a href="#catalog" className="hover:text-primary transition-colors">Каталог</a>
                <a href="#about" className="hover:text-primary transition-colors">О платформе</a>
                <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
              </nav>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                  <Icon name="Coins" size={20} className="text-primary" />
                  <span className="font-semibold">{userBalance}</span>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Icon name="Plus" size={16} className="mr-2" />
                      Пополнить
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Покупка баллов</DialogTitle>
                      <DialogDescription>
                        Выберите пакет баллов для пополнения
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Button onClick={() => handleBuyPoints(100)} className="justify-between">
                        <span>100 баллов</span>
                        <span>100 ₽</span>
                      </Button>
                      <Button onClick={() => handleBuyPoints(500)} className="justify-between">
                        <span>500 баллов</span>
                        <span>450 ₽</span>
                      </Button>
                      <Button onClick={() => handleBuyPoints(1000)} className="justify-between">
                        <span>1000 баллов</span>
                        <span>800 ₽</span>
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {isLoggedIn ? (
                  <Button size="sm" onClick={() => setProfileDialogOpen(true)}>
                    <Icon name="User" size={16} className="mr-2" />
                    {username}
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setAuthDialogOpen(true)}>
                    <Icon name="LogIn" size={16} className="mr-2" />
                    Войти
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        <section className="py-16 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-5xl font-bold mb-6">Твоя база знаний</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Находи готовые работы или зарабатывай на своих материалах
            </p>
            
            <div className="max-w-2xl mx-auto relative">
              <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по курсовым, дипломам, чертежам..."
                className="pl-12 h-14 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 justify-center mt-6 flex-wrap">
              <Badge variant={selectedCategory === 'all' ? 'default' : 'outline'} 
                className="cursor-pointer px-4 py-2" 
                onClick={() => setSelectedCategory('all')}>
                Все работы
              </Badge>
              <Badge variant={selectedCategory === 'Курсовая работа' ? 'default' : 'outline'} 
                className="cursor-pointer px-4 py-2" 
                onClick={() => setSelectedCategory('Курсовая работа')}>
                Курсовые
              </Badge>
              <Badge variant={selectedCategory === 'Дипломная работа' ? 'default' : 'outline'} 
                className="cursor-pointer px-4 py-2" 
                onClick={() => setSelectedCategory('Дипломная работа')}>
                Дипломные
              </Badge>
              <Badge variant={selectedCategory === 'Практическая работа' ? 'default' : 'outline'} 
                className="cursor-pointer px-4 py-2" 
                onClick={() => setSelectedCategory('Практическая работа')}>
                Практические
              </Badge>
              <Badge variant={selectedCategory === 'Чертеж' ? 'default' : 'outline'} 
                className="cursor-pointer px-4 py-2" 
                onClick={() => setSelectedCategory('Чертеж')}>
                Чертежи
              </Badge>
            </div>
          </div>
        </section>

        <section id="catalog" className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="catalog" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="catalog">
                  <Icon name="BookOpen" size={18} className="mr-2" />
                  Каталог работ
                </TabsTrigger>
                <TabsTrigger value="upload">
                  <Icon name="Upload" size={18} className="mr-2" />
                  Загрузить работу
                </TabsTrigger>
              </TabsList>

              <TabsContent value="catalog">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredWorks.map((work) => (
                    <Card key={work.id} className="hover:shadow-lg transition-all hover:scale-[1.02] animate-fade-in">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary">{work.type}</Badge>
                          <div className="flex items-center gap-1">
                            <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-semibold">{work.rating}</span>
                          </div>
                        </div>
                        <CardTitle className="text-xl">{work.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Icon name="BookMarked" size={14} />
                          {work.subject}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {work.preview}
                        </p>
                        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Icon name="Download" size={14} />
                            {work.downloads}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Icon name="Coins" size={18} className="text-primary" />
                          <span className="text-2xl font-bold">{work.price}</span>
                        </div>
                        <Button onClick={() => handleBuyWork(work.price, work.title)}>
                          Скачать
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
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

        <section id="about" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">Как это работает</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Search" size={32} className="text-primary" />
                  </div>
                  <CardTitle>Найди работу</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Используй поиск и фильтры, чтобы найти нужную курсовую, диплом или чертёж
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Coins" size={32} className="text-primary" />
                  </div>
                  <CardTitle>Купи баллы</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Пополни баланс баллами и используй их для покупки работ
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Download" size={32} className="text-primary" />
                  </div>
                  <CardTitle>Скачай материал</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Получи мгновенный доступ к работе и скачай файл в удобном формате
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
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
                    1 балл = 1 рубль. Покупайте баллы и используйте их для скачивания работ. Загружайте свои материалы и получайте баллы за каждое скачивание.
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
                    Перейдите на вкладку "Загрузить работу", заполните информацию, установите цену и загрузите файл. После модерации работа появится в каталоге.
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
                  <li><a href="#" className="hover:text-primary transition-colors">Правила использования</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Поддержка</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Связаться с нами</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Политика конфиденциальности</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Пользовательское соглашение</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
              <p>© 2024 Tech Forma. Все материалы предоставлены в ознакомительных целях.</p>
            </div>
          </div>
        </footer>
      </div>

      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        onLogin={handleLogin}
      />

      <ProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        username={username}
        email={email}
        balance={userBalance}
        onLogout={handleLogout}
      />
    </div>
  );
}