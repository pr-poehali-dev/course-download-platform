import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { authService, User } from '@/lib/auth';
import func2url from '../../backend/func2url.json';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const MODES = {
  tutor: { label: 'Репетитор', desc: 'Объясняет по шагам, задаёт наводящие вопросы' },
  outline: { label: 'План', desc: 'Помогает структурировать работу' },
  rewrite: { label: 'Переформулирование', desc: 'Улучшает стиль и читаемость' }
};

export default function AIChatPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('tm_session_id');
    if (stored) return stored;
    const newId = crypto.randomUUID();
    localStorage.setItem('tm_session_id', newId);
    return newId;
  });

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Привет! Я TechMentor — твой AI-помощник по учебным работам. Помогу разобраться в материале, составить план или проверить работу. Чем могу помочь?' }
  ]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [mode, setMode] = useState<'tutor' | 'outline' | 'rewrite'>('tutor');
  const [title, setTitle] = useState('');
  const [requirements, setRequirements] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'check'>('chat');
  
  const [file, setFile] = useState<File | null>(null);
  const [checkRequirements, setCheckRequirements] = useState('');
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkReport, setCheckReport] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initAuth = async () => {
      const isAdminAuth = localStorage.getItem('admin_authenticated') === 'true';
      
      if (isAdminAuth) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const adminUser = JSON.parse(storedUser);
            setCurrentUser(adminUser);
            setHasAccess(true);
            setLoading(false);
            return;
          } catch (e) {
            console.error('Failed to parse admin user');
          }
        }
      }
      
      const user = await authService.verify();
      setCurrentUser(user);
      
      if (!user) {
        setLoading(false);
        return;
      }
      
      if (user.role === 'admin') {
        setHasAccess(true);
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${func2url['ai-subscription']}?user_id=${user.id}`);
        const data = await response.json();
        setHasAccess(data.has_access || false);
        setSubscription(data.subscription);
      } catch (error) {
        console.error('Failed to check subscription:', error);
        setHasAccess(false);
      }
      
      setLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || chatLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const response = await fetch(func2url['ai-chat'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userText: userMessage,
          mode,
          pageContext: {
            title: title.trim(),
            subject: '',
            uniReq: requirements.trim(),
            link: window.location.href
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(response.status === 429 ? 'Лимит модели. Попробуйте позже.' :
                       response.status === 503 ? 'Сервер перегружен. Повторите позже.' :
                       response.status === 504 ? 'Таймаут ответа. Повторите запрос.' :
                       errorData.error || 'Ошибка сервера');
      }

      const data = await response.json();
      const reply = data.reply || 'Пустой ответ от сервера';

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось отправить сообщение',
        variant: 'destructive'
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setChatLoading(false);
    }
  };

  const handleFileCheck = async () => {
    if (!file || checkLoading) return;

    setCheckLoading(true);
    setCheckReport('Загружаю и анализирую файл...');

    try {
      // Read file as base64
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch(func2url['ai-check'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData,
          fileName: file.name,
          requirements: checkRequirements.trim() || requirements.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCheckReport(data.reply || 'Пустой отчёт.');
      } else {
        throw new Error(data.error || 'Не удалось обработать файл');
      }
    } catch (error: any) {
      setCheckReport(`Ошибка: ${error.message || 'Не удалось проверить файл'}`);
      toast({
        title: 'Ошибка проверки',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setCheckLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <SEO title="Вход требуется — AI-помощник" />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-2xl">
            <CardHeader className="text-center">
              <Icon name="Lock" size={48} className="mx-auto mb-4 text-primary" />
              <CardTitle className="text-2xl">Требуется авторизация</CardTitle>
              <CardDescription>
                Для доступа к AI-помощнику необходимо войти в аккаунт
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" size="lg" onClick={() => navigate('/')}>
                <Icon name="LogIn" size={18} className="mr-2" />
                Войти в аккаунт
              </Button>
              <Button variant="outline" className="w-full" size="lg" onClick={() => navigate('/')}>
                <Icon name="Home" size={18} className="mr-2" />
                На главную
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!hasAccess) {
    return (
      <>
        <SEO title="Оформить подписку — AI-помощник" />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <header className="border-b bg-white/95 backdrop-blur sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <Icon name="Bot" size={28} className="text-primary" />
                <div>
                  <h1 className="text-xl font-bold">TechForma</h1>
                  <p className="text-xs text-muted-foreground">AI-помощник</p>
                </div>
              </Link>
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <Icon name="Home" size={18} className="mr-2" />
                  На главную
                </Button>
              </Link>
            </div>
          </header>

          <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg px-6 py-2">
                <Icon name="Sparkles" size={18} className="mr-2" />
                AI-помощник для студентов
              </Badge>
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TechMentor AI
              </h1>
              <p className="text-2xl text-muted-foreground mb-8">
                Персональный AI-репетитор, который помогает разобраться в материале
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="border-2 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Icon name="MessageSquare" size={32} className="text-blue-600" />
                  </div>
                  <CardTitle className="text-center">Умный чат</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    Задавай вопросы и получай развёрнутые ответы с примерами и объяснениями
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="w-16 h-16 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Icon name="FileCheck" size={32} className="text-purple-600" />
                  </div>
                  <CardTitle className="text-center">Проверка работ</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    Загружай курсовые и дипломы для детального анализа и рекомендаций
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Icon name="BookOpen" size={32} className="text-green-600" />
                  </div>
                  <CardTitle className="text-center">Планы работ</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    Составляй структуру и чек-листы для курсовых и дипломных работ
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-2 border-primary/50 relative overflow-hidden hover:shadow-2xl transition-all">
                <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                  Популярно 🔥
                </div>
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-3xl mb-2">Месяц</CardTitle>
                  <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">299₽</div>
                  <CardDescription className="text-lg">~10₽ в день</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-base">
                    <Icon name="Check" size={20} className="text-green-600" />
                    <span>Безлимитный чат с AI</span>
                  </div>
                  <div className="flex items-center gap-3 text-base">
                    <Icon name="Check" size={20} className="text-green-600" />
                    <span>Проверка работ (PDF/DOCX)</span>
                  </div>
                  <div className="flex items-center gap-3 text-base">
                    <Icon name="Check" size={20} className="text-green-600" />
                    <span>Составление планов</span>
                  </div>
                  <div className="flex items-center gap-3 text-base">
                    <Icon name="Check" size={20} className="text-green-600" />
                    <span>История сообщений</span>
                  </div>
                  <Button className="w-full mt-6" size="lg" onClick={async () => {
                    try {
                      const response = await fetch(func2url['ai-subscription'], {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          user_id: currentUser.id,
                          plan: 'monthly'
                        })
                      });
                      const data = await response.json();
                      if (data.success) {
                        window.location.href = data.payment_url;
                      }
                    } catch (error) {
                      toast({
                        title: 'Ошибка',
                        description: 'Не удалось создать платёж',
                        variant: 'destructive'
                      });
                    }
                  }}>
                    <Icon name="Zap" size={20} className="mr-2" />
                    Оформить подписку
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-2xl transition-all">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl mb-2">Год</CardTitle>
                  <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">2490₽</div>
                  <CardDescription className="text-lg">
                    <span className="line-through text-muted-foreground">3588₽</span>
                    {' '}экономия 1098₽
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-base">
                    <Icon name="Check" size={20} className="text-green-600" />
                    <span>Все возможности месячной</span>
                  </div>
                  <div className="flex items-center gap-3 text-base">
                    <Icon name="Star" size={20} className="text-yellow-600" />
                    <span>Приоритетная поддержка</span>
                  </div>
                  <div className="flex items-center gap-3 text-base">
                    <Icon name="Gift" size={20} className="text-purple-600" />
                    <span>+200 баллов в подарок</span>
                  </div>
                  <div className="flex items-center gap-3 text-base">
                    <Icon name="TrendingDown" size={20} className="text-blue-600" />
                    <span>~7₽ в день (-30%)</span>
                  </div>
                  <Button className="w-full mt-6" size="lg" variant="outline" onClick={async () => {
                    try {
                      const response = await fetch(func2url['ai-subscription'], {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          user_id: currentUser.id,
                          plan: 'yearly'
                        })
                      });
                      const data = await response.json();
                      if (data.success) {
                        window.location.href = data.payment_url;
                      }
                    } catch (error) {
                      toast({
                        title: 'Ошибка',
                        description: 'Не удалось создать платёж',
                        variant: 'destructive'
                      });
                    }
                  }}>
                    <Icon name="Crown" size={20} className="mr-2" />
                    Оформить со скидкой
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mb-12 text-center">
              <Card className="border-2 border-blue-500 bg-blue-50">
                <CardContent className="py-8">
                  <Icon name="Info" size={48} className="mx-auto mb-4 text-blue-600" />
                  <h3 className="text-xl font-bold mb-2">Отладочная информация</h3>
                  <div className="text-left max-w-md mx-auto mb-4 space-y-2">
                    <p className="text-sm">admin_authenticated: {localStorage.getItem('admin_authenticated') || 'null'}</p>
                    <p className="text-sm">currentUser: {currentUser ? JSON.stringify({id: currentUser.id, role: currentUser.role}) : 'null'}</p>
                    <p className="text-sm">hasAccess: {hasAccess.toString()}</p>
                    <p className="text-sm">user in localStorage: {localStorage.getItem('user') ? 'exists' : 'null'}</p>
                  </div>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                    const isAdmin = localStorage.getItem('admin_authenticated') === 'true';
                    if (isAdmin) {
                      setHasAccess(true);
                    } else {
                      alert('Вы не админ! admin_authenticated = ' + localStorage.getItem('admin_authenticated'));
                    }
                  }}>
                    <Icon name="ArrowRight" size={20} className="mr-2" />
                    Принудительно открыть чат (если админ)
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Icon name="Info" size={24} className="text-primary" />
                  Как это работает?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Оформи подписку</h4>
                    <p className="text-muted-foreground">
                      Выбери удобный тариф и оплати картой
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Получи доступ</h4>
                    <p className="text-muted-foreground">
                      Сразу после оплаты открывается полный функционал
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Учись эффективно</h4>
                    <p className="text-muted-foreground">
                      Задавай вопросы, проверяй работы, составляй планы
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="AI-помощник для студентов — TechForma"
        description="Умный AI-помощник для студентов: ответы на вопросы, проверка курсовых и дипломов, составление планов работ. Твой персональный репетитор 24/7"
        keywords="AI помощник, помощь студентам, проверка курсовых, план работы, консультация по учёбе, искусственный интеллект"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Icon name="Bot" size={28} className="text-primary" />
              <div>
                <h1 className="text-xl font-bold">TechForma AI</h1>
                <p className="text-xs text-muted-foreground">Помощник студента</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:flex gap-1">
                <Icon name="Shield" size={14} />
                Учит разбираться
              </Badge>
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <Icon name="Home" size={18} />
                  <span className="ml-2 hidden sm:inline">На главную</span>
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'chat' ? 'default' : 'outline'}
              onClick={() => setActiveTab('chat')}
              className="rounded-full"
            >
              <Icon name="MessageSquare" size={18} />
              <span className="ml-2">Чат с AI</span>
            </Button>
            <Button
              variant={activeTab === 'check' ? 'default' : 'outline'}
              onClick={() => setActiveTab('check')}
              className="rounded-full"
            >
              <Icon name="FileCheck" size={18} />
              <span className="ml-2">Проверка работы</span>
            </Button>
          </div>

          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-base">Контекст работы</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-xs text-muted-foreground">
                      Название/дисциплина
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Напр.: Курсовая по маркетингу"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="requirements" className="text-xs text-muted-foreground">
                      Требования вуза (кратко)
                    </Label>
                    <Textarea
                      id="requirements"
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder="Объём, ГОСТы, структура, число источников..."
                      rows={5}
                      className="mt-1.5"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-xs text-muted-foreground">Режим работы</Label>
                    <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(MODES).map(([key, { label, desc }]) => (
                          <SelectItem key={key} value={key}>
                            <div>
                              <div className="font-medium">{label}</div>
                              <div className="text-xs text-muted-foreground">{desc}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="flex flex-col h-[calc(100vh-200px)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Bot" size={20} className="text-primary" />
                    AI-помощник для студентов
                  </CardTitle>
                  <CardDescription>
                    Задавай вопросы, получай помощь с работами
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto space-y-4 p-6">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-white border-2 border-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border-2 border-muted rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </CardContent>

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Задай вопрос или опиши задание..."
                      className="min-h-[80px] resize-none"
                      disabled={chatLoading}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!input.trim() || chatLoading}
                      size="lg"
                      className="px-6"
                    >
                      <Icon name="Send" size={18} />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'check' && (
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-base">Параметры проверки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="check-req" className="text-xs text-muted-foreground">
                      Требования вуза (методичка кратко)
                    </Label>
                    <Textarea
                      id="check-req"
                      value={checkRequirements}
                      onChange={(e) => setCheckRequirements(e.target.value)}
                      placeholder="Структура, объём, оформление, число источников, ГОСТы..."
                      rows={6}
                      className="mt-1.5"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-xs text-muted-foreground">
                      Загрузка файла (PDF или DOCX, до 10 МБ)
                    </Label>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="mt-1.5"
                    />
                  </div>

                  <Button
                    onClick={handleFileCheck}
                    disabled={!file || checkLoading}
                    className="w-full"
                  >
                    {checkLoading ? (
                      <>
                        <Icon name="Loader2" size={18} className="animate-spin" />
                        <span className="ml-2">Анализирую...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="FileCheck" size={18} />
                        <span className="ml-2">Проверить работу</span>
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    AI даст обратную связь по структуре, логике и оформлению работы
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="FileText" size={20} className="text-primary" />
                    Отчёт проверки
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {checkReport ? (
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {checkReport}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Icon name="Upload" size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Загрузите файл для проверки</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <footer className="border-t mt-12 py-8 bg-white">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>TechMentor AI — часть платформы TechForma</p>
            <p className="mt-2">Помогаем учиться эффективно 🚀</p>
          </div>
        </footer>
      </div>
    </>
  );
}