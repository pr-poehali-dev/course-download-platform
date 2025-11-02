import { useState, useRef, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { authService } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import AISubscriptionModal from '@/components/AISubscriptionModal';
import func2url from '../../backend/func2url.json';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Subscription {
  id?: number;
  type: 'none' | 'single' | 'monthly' | 'yearly';
  requestsTotal?: number;
  requestsUsed?: number;
  requestsLeft?: number;
  expiresAt?: string;
  createdAt?: string;
  price?: number;
}

export default function AIAssistantPage() {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.verify();
      setIsLoggedIn(!!user);
      if (user) {
        setUserId(String(user.id));
        setUserPoints(user.balance || 0);
        loadSubscription(String(user.id));
      }
    };
    checkAuth();
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Привет! Я — TechMentor Pro, твой личный наставник по студенческим проектам. Расскажи про купленную работу и требования ВУЗа — я помогу тебе шаг за шагом адаптировать её. Помни: я учу, а не делаю за тебя! 📚',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription>({ type: 'none' });
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSubscription = async (uid: string) => {
    try {
      const response = await fetch(func2url['ai-subscription'], {
        headers: {
          'X-User-Id': uid
        }
      });
      const data = await response.json();
      
      if (data.hasSubscription && data.subscription) {
        setSubscription({
          ...data.subscription,
          type: data.subscription.type
        });
      } else {
        setSubscription({ type: 'none' });
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  };



  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Неподдерживаемый формат',
          description: 'Поддерживаются файлы: PDF, DOC, DOCX, TXT',
          variant: 'destructive'
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Файл слишком большой',
          description: 'Максимальный размер файла — 10 МБ',
          variant: 'destructive'
        });
        return;
      }
      setAttachedFile(file);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !attachedFile) return;

    if (subscription.type === 'none') {
      setShowPricingModal(true);
      return;
    }

    if (subscription.type === 'single' && subscription.requestsLeft !== undefined && subscription.requestsLeft <= 0) {
      toast({
        title: 'Запросы закончились',
        description: 'Разовый доступ исчерпан. Оформите подписку для продолжения.',
        variant: 'destructive'
      });
      setShowPricingModal(true);
      return;
    }

    let messageContent = inputValue;
    if (attachedFile) {
      messageContent += `\n\n📎 Прикреплён файл: ${attachedFile.name}`;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    const currentFile = attachedFile;
    setAttachedFile(null);
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      let fileContent = '';
      if (currentFile) {
        const reader = new FileReader();
        fileContent = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsText(currentFile);
        });
      }

      const response = await fetch(func2url['ai-chat'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({
          messages: chatHistory,
          file_content: fileContent || undefined,
          file_name: currentFile?.name || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при обращении к ИИ');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      loadSubscription(userId);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось получить ответ от ИИ',
        variant: 'destructive'
      });
      
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const getSubscriptionBadge = () => {
    if (subscription.type === 'none') {
      return <Badge variant="secondary">Нет подписки</Badge>;
    }
    if (subscription.type === 'single') {
      return <Badge variant="outline">Разовый доступ ({subscription.requestsLeft} запросов)</Badge>;
    }
    if (subscription.type === 'monthly') {
      return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">Месячная подписка</Badge>;
    }
    if (subscription.type === 'yearly') {
      return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">Годовая подписка ⭐</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navigation isLoggedIn={isLoggedIn} />
      
      <div className="container mx-auto px-4 pt-20 pb-4 max-w-7xl h-[calc(100vh-80px)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Icon name="Bot" size={28} className="text-primary" />
              TechMentor Pro
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {getSubscriptionBadge()}
            <Button 
              variant="outline" 
              onClick={() => setShowPricingModal(true)}
            >
              <Icon name="CreditCard" size={16} className="mr-2" />
              Тарифы
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-280px)] flex flex-col">
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === 'assistant' && (
                          <Icon name="Bot" size={20} className="mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <span className={`text-xs mt-2 block ${
                            message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon name="Bot" size={20} />
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              <div className="border-t p-4 space-y-3">
                {attachedFile && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                    <Icon name="Paperclip" size={16} className="text-blue-600" />
                    <span className="text-sm flex-1">{attachedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttachedFile(null)}
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="flex flex-col gap-2 flex-1">
                    <Textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        subscription.type === 'none'
                          ? 'Оформите подписку для начала работы...'
                          : 'Напиши свой вопрос... (Enter - отправить, Shift+Enter - новая строка)'
                      }
                      className="resize-none"
                      rows={3}
                      disabled={subscription.type === 'none'}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={subscription.type === 'none' || isLoading}
                      variant="outline"
                      size="icon"
                    >
                      <Icon name="Paperclip" size={20} />
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={(!inputValue.trim() && !attachedFile) || isLoading || subscription.type === 'none'}
                      size="icon"
                      className="h-auto flex-1"
                    >
                      <Icon name="Send" size={20} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="Lightbulb" size={20} className="text-yellow-500" />
                  Мои возможности
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <p>Помогаю понять структуру работы</p>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <p>Подсказываю, как адаптировать под требования ВУЗа</p>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <p>Учу переформулировать и улучшать текст</p>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <p>Направляю, но не делаю за тебя</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="AlertTriangle" size={20} className="text-orange-600" />
                  Важно помнить
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Я не пишу работу за тебя</p>
                <p>• Основная задача — научить</p>
                <p>• Финальная ответственность — твоя</p>
                <p>• Всегда проверяй результат</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="FileText" size={20} className="text-green-600" />
                  Что я умею
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>📝 Помощь с оформлением</p>
                <p>📊 Структура работы</p>
                <p>🎯 Адаптация под требования</p>
                <p>✍️ Переформулирование</p>
                <p>📚 Работа с источниками</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showPricingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Выберите тариф</CardTitle>
                  <CardDescription>Доступ к TechMentor Pro для персональной помощи</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPricingModal(false)}
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-2 hover:border-primary transition-all cursor-pointer">
                  <CardHeader>
                    <Icon name="Zap" size={32} className="text-yellow-500 mb-2" />
                    <CardTitle>Разовый доступ</CardTitle>
                    <CardDescription>Для одной работы</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-4xl font-bold">500₽</div>
                      <p className="text-sm text-muted-foreground">За одну работу</p>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Icon name="Check" size={16} className="text-green-600" />
                        Неограниченные запросы
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon name="Check" size={16} className="text-green-600" />
                        Доступ на 7 дней
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon name="Check" size={16} className="text-green-600" />
                        Для одной работы
                      </li>
                    </ul>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSubscription({
                          type: 'single',
                          requestsLeft: 999,
                          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        });
                        setShowPricingModal(false);
                        toast({
                          title: 'Разовый доступ активирован!',
                          description: 'У вас есть 7 дней для работы над одной работой.'
                        });
                      }}
                    >
                      Купить доступ
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-500 relative hover:shadow-xl transition-all cursor-pointer">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                      Популярный выбор
                    </Badge>
                  </div>
                  <CardHeader>
                    <Icon name="Rocket" size={32} className="text-purple-500 mb-2" />
                    <CardTitle>Месячная подписка</CardTitle>
                    <CardDescription>Без ограничений</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-4xl font-bold">2 990₽</div>
                      <p className="text-sm text-muted-foreground">В месяц</p>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Icon name="Check" size={16} className="text-green-600" />
                        Неограниченные запросы
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon name="Check" size={16} className="text-green-600" />
                        Любое количество работ
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon name="Check" size={16} className="text-green-600" />
                        Приоритетная поддержка
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon name="Check" size={16} className="text-green-600" />
                        Загрузка файлов до 50 МБ
                      </li>
                    </ul>
                    <Button
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      onClick={() => {
                        setSubscription({
                          type: 'monthly',
                          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        });
                        setShowPricingModal(false);
                        toast({
                          title: 'Подписка активирована! 🎉',
                          description: 'Месячная подписка действует 30 дней.'
                        });
                      }}
                    >
                      Оформить подписку
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-blue-500 transition-all cursor-pointer">
                  <CardHeader>
                    <Icon name="Crown" size={32} className="text-yellow-500 mb-2" />
                    <CardTitle>Годовая подписка</CardTitle>
                    <CardDescription>Максимальная выгода</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-4xl font-bold">18 000₽</div>
                      <p className="text-sm text-muted-foreground">
                        В год <span className="text-green-600 font-semibold">(экономия 50%)</span>
                      </p>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Icon name="Check" size={16} className="text-green-600" />
                        Всё из месячной подписки
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon name="Check" size={16} className="text-green-600" />
                        Экономия 17 880₽ в год
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon name="Check" size={16} className="text-green-600" />
                        Загрузка файлов до 100 МБ
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon name="Check" size={16} className="text-green-600" />
                        Эксклюзивные функции
                      </li>
                    </ul>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                      onClick={() => {
                        setSubscription({
                          type: 'yearly',
                          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                        });
                        setShowPricingModal(false);
                        toast({
                          title: 'Годовая подписка активирована! ⭐',
                          description: 'Подписка действует 365 дней.'
                        });
                      }}
                    >
                      Оформить на год
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-center text-muted-foreground">
                  💳 Оплата производится через защищённый шлюз ЮКасса. Возврат средств возможен в течение 14 дней.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AISubscriptionModal
        open={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSubscribe={async () => {
          const user = await authService.verify();
          if (user) {
            setUserPoints(user.balance || 0);
            loadSubscription(String(user.id));
          }
        }}
        userPoints={userPoints}
      />
    </div>
  );
}