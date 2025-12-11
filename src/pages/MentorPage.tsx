import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { authService, User } from '@/lib/auth';
import MentorAuthScreen from '@/components/mentor/MentorAuthScreen';
import MentorSubscriptionScreen from '@/components/mentor/MentorSubscriptionScreen';
import MentorChatTab from '@/components/mentor/MentorChatTab';
import MentorCheckTab from '@/components/mentor/MentorCheckTab';
import func2url from '../../backend/func2url.json';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function MentorPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
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
  const [chatLoading, setChatLoading] = useState(false);
  const [mode, setMode] = useState<'tutor' | 'outline' | 'rewrite'>('tutor');
  const [title, setTitle] = useState('');
  const [requirements, setRequirements] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'check'>('chat');
  
  const [file, setFile] = useState<File | null>(null);
  const [checkRequirements, setCheckRequirements] = useState('');
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkReport, setCheckReport] = useState('');

  useEffect(() => {
    const initAuth = async () => {
      const user = await authService.verify();
      setCurrentUser(user);
      
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${func2url['ai-subscription']}?user_id=${user.id}`);
        const data = await response.json();
        setHasAccess(data.has_access || false);
      } catch (error) {
        console.error('Failed to check subscription:', error);
        setHasAccess(false);
      }
      
      setLoading(false);
    };
    initAuth();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || chatLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

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
      setChatLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return <MentorAuthScreen onNavigateHome={() => navigate('/')} />;
  }

  if (!hasAccess) {
    return <MentorSubscriptionScreen userId={currentUser.id} />;
  }

  return (
    <>
      <SEO 
        title="TechMentor — ИИ-репетитор для студентов"
        description="Умный ИИ-помощник для студентов: составление планов работ, проверка курсовых и дипломов, помощь с заданиями. Не пишет за вас, а учит разбираться."
        keywords="ИИ репетитор, помощь студентам, проверка курсовых, план работы, консультация по учёбе"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
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

          {activeTab === 'chat' && (
            <MentorChatTab
              messages={messages}
              input={input}
              onInputChange={setInput}
              chatLoading={chatLoading}
              onSendMessage={sendMessage}
              mode={mode}
              onModeChange={setMode}
              title={title}
              onTitleChange={setTitle}
              requirements={requirements}
              onRequirementsChange={setRequirements}
              onKeyPress={handleKeyPress}
            />
          )}

          {activeTab === 'check' && (
            <MentorCheckTab
              file={file}
              onFileSelect={setFile}
              checkRequirements={checkRequirements}
              onCheckRequirementsChange={setCheckRequirements}
              checkLoading={checkLoading}
              checkReport={checkReport}
              onCheck={handleFileCheck}
              requirements={requirements}
            />
          )}
        </div>
      </div>
    </>
  );
}
