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
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const MODES = {
  tutor: { label: 'Репетитор', desc: 'Объясняет по шагам, задаёт наводящие вопросы' },
  outline: { label: 'План', desc: 'Помогает структурировать работу' },
  rewrite: { label: 'Переформулирование', desc: 'Улучшает стиль и читаемость' }
};

export default function MentorPage() {
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('tm_session_id');
    if (stored) return stored;
    const newId = crypto.randomUUID();
    localStorage.setItem('tm_session_id', newId);
    return newId;
  });

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Привет! Я помогу составить план, чек-лист и мини-пример под требования твоего вуза. Введи тему/требования — начнём.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/mentor/stream', {
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

      if (!response.ok || !response.body) {
        throw new Error(response.status === 429 ? 'Лимит модели. Попробуйте позже.' :
                       response.status === 503 ? 'Сервер перегружен. Повторите позже.' :
                       response.status === 504 ? 'Таймаут ответа. Повторите запрос.' :
                       'Ошибка сервера');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'assistant', content: fullText };
          return newMessages;
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось отправить сообщение',
        variant: 'destructive'
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleFileCheck = async () => {
    if (!file || checkLoading) return;

    setCheckLoading(true);
    setCheckReport('Загружаю и анализирую файл...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);
      formData.append('uniReq', checkRequirements.trim() || requirements.trim());

      const response = await fetch('/api/mentor/upload', {
        method: 'POST',
        body: formData
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

  return (
    <>
      <SEO 
        title="TechMentor — ИИ-репетитор для студентов"
        description="Умный ИИ-помощник для студентов: составление планов работ, проверка курсовых и дипломов, помощь с заданиями. Не пишет за вас, а учит разбираться."
        keywords="ИИ репетитор, помощь студентам, проверка курсовых, план работы, консультация по учёбе"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Icon name="GraduationCap" size={28} className="text-primary" />
              <div>
                <h1 className="text-xl font-bold">TechForma</h1>
                <p className="text-xs text-muted-foreground">TechMentor</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:flex gap-1">
                <Icon name="Shield" size={14} />
                Не пишет за студента
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
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'chat' ? 'default' : 'outline'}
              onClick={() => setActiveTab('chat')}
              className="rounded-full"
            >
              <Icon name="MessageSquare" size={18} />
              <span className="ml-2">Чат</span>
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

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
              {/* Sidebar */}
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
                      placeholder="Напр.: Курсовая по ТОиР"
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

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="secondary" className="text-xs">
                      <Icon name="CheckCircle" size={12} className="mr-1" />
                      Планы и чек-листы
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Icon name="Lightbulb" size={12} className="mr-1" />
                      Мини-примеры
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Chat */}
              <Card className="flex flex-col h-[calc(100vh-200px)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Bot" size={20} className="text-primary" />
                    TechMentor — чат-репетитор
                  </CardTitle>
                  <CardDescription>
                    Помогаю разобраться в материале и подготовить работу самостоятельно
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
                            : 'bg-muted border'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-muted border rounded-2xl px-4 py-3">
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
                      placeholder="Опиши тему/задание или вставь фрагмент..."
                      className="min-h-[80px] resize-none"
                      disabled={loading}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!input.trim() || loading}
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

          {/* Check Tab */}
          {activeTab === 'check' && (
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
              {/* Sidebar */}
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
                    Мы не проверяем плагиат; даём учебную обратную связь по структуре, логике, методике и оформлению.
                  </p>
                </CardContent>
              </Card>

              {/* Report */}
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

        {/* Footer */}
        <footer className="border-t mt-12 py-8 bg-muted/30">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>TechMentor — часть платформы TechForma</p>
            <p className="mt-2">Помогаем учиться эффективно, а не делаем работу за вас</p>
          </div>
        </footer>
      </div>
    </>
  );
}
