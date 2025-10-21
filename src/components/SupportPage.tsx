import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

const SUPPORT_API = 'https://functions.poehali.dev/c13b3d8d-6ee7-416d-9f1f-0350aae86e61';

interface Ticket {
  id: number;
  user_email: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'answered' | 'closed';
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

export default function SupportPage() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'form' | 'tickets'>('form');

  const loadTickets = async (userEmail: string) => {
    if (!userEmail) return;
    
    try {
      const response = await fetch(`${SUPPORT_API}?email=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !subject || !message) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(SUPPORT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          subject,
          message
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Запрос отправлен!',
          description: 'Мы свяжемся с вами на указанный email'
        });
        setSubject('');
        setMessage('');
        loadTickets(email);
        setViewMode('tickets');
      } else {
        throw new Error(data.error || 'Ошибка отправки');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отправить запрос',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckTickets = () => {
    if (!email) {
      toast({
        title: 'Укажите email',
        description: 'Введите email для просмотра ваших обращений',
        variant: 'destructive'
      });
      return;
    }
    loadTickets(email);
    setViewMode('tickets');
  };

  useEffect(() => {
    if (email && viewMode === 'tickets') {
      loadTickets(email);
    }
  }, [email, viewMode]);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      new: { label: 'Новый', color: 'bg-blue-500' },
      in_progress: { label: 'В работе', color: 'bg-yellow-500' },
      answered: { label: 'Отвечен', color: 'bg-green-500' },
      closed: { label: 'Закрыт', color: 'bg-gray-500' }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.new;
    return (
      <Badge className={`${statusInfo.color} text-white`}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Техническая поддержка
        </h1>
        <p className="text-muted-foreground">
          Возникли вопросы? Мы всегда готовы помочь!
        </p>
      </div>

      <div className="flex gap-3 mb-6 justify-center">
        <Button
          variant={viewMode === 'form' ? 'default' : 'outline'}
          onClick={() => setViewMode('form')}
        >
          <Icon name="MessageSquare" size={18} className="mr-2" />
          Новое обращение
        </Button>
        <Button
          variant={viewMode === 'tickets' ? 'default' : 'outline'}
          onClick={handleCheckTickets}
        >
          <Icon name="Inbox" size={18} className="mr-2" />
          Мои обращения
        </Button>
      </div>

      {viewMode === 'form' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Headphones" size={24} className="text-primary" />
              Обратиться в поддержку
            </CardTitle>
            <CardDescription>
              Опишите вашу проблему, и мы отправим ответ на ваш email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Тема обращения *</Label>
                <Input
                  id="subject"
                  placeholder="Кратко опишите проблему"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Сообщение *</Label>
                <Textarea
                  id="message"
                  placeholder="Подробно опишите вашу проблему..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={18} className="mr-2" />
                    Отправить обращение
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Icon name="Inbox" size={64} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Нет обращений</h3>
                <p className="text-muted-foreground mb-4">
                  У вас пока нет обращений в поддержку
                </p>
                <Button onClick={() => setViewMode('form')}>
                  Создать обращение
                </Button>
              </CardContent>
            </Card>
          ) : (
            tickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Icon name="Calendar" size={14} />
                    {new Date(ticket.created_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="User" size={16} className="text-primary" />
                      <span className="font-semibold">Ваше сообщение:</span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-line bg-muted p-3 rounded-lg">
                      {ticket.message}
                    </p>
                  </div>

                  {ticket.admin_response && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="HeadphonesIcon" size={16} className="text-green-600" />
                        <span className="font-semibold text-green-600">Ответ поддержки:</span>
                      </div>
                      <p className="text-sm whitespace-pre-line bg-green-50 p-3 rounded-lg border border-green-200">
                        {ticket.admin_response}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Ответ также отправлен на ваш email
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
