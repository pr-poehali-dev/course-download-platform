import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

const SUPPORT_API = 'https://functions.poehali.dev/c13b3d8d-6ee7-416d-9f1f-0350aae86e61';
const ADMIN_EMAIL = 'rekrutiw@yandex.ru';

interface Ticket {
  id: number;
  user_email: string;
  subject: string;
  message: string;
  attachment_url?: string | null;
  status: 'new' | 'in_progress' | 'answered' | 'closed';
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminPanel() {
  const [adminEmail, setAdminEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [response, setResponse] = useState('');
  const [sending, setSending] = useState(false);

  const handleLogin = () => {
    if (adminEmail === ADMIN_EMAIL) {
      setIsAuthenticated(true);
      loadTickets();
      toast({
        title: 'Вход выполнен',
        description: 'Добро пожаловать в админ-панель'
      });
    } else {
      toast({
        title: 'Ошибка доступа',
        description: 'Неверный email администратора',
        variant: 'destructive'
      });
    }
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch(SUPPORT_API, {
        headers: {
          'X-Admin-Email': ADMIN_EMAIL
        }
      });
      const data = await response.json();
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить тикеты',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedTicket || !response.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите ответ',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);

    try {
      const res = await fetch(SUPPORT_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': ADMIN_EMAIL
        },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          admin_response: response
        })
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: 'Ответ отправлен!',
          description: data.email_sent 
            ? 'Email успешно отправлен пользователю' 
            : 'Ответ сохранен, но email не был отправлен'
        });
        setSelectedTicket(null);
        setResponse('');
        loadTickets();
      } else {
        throw new Error(data.error || 'Ошибка отправки');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отправить ответ',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

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

  const getStatusIcon = (status: string) => {
    const iconMap = {
      new: 'AlertCircle',
      in_progress: 'Clock',
      answered: 'CheckCircle',
      closed: 'XCircle'
    };
    return iconMap[status as keyof typeof iconMap] || 'HelpCircle';
  };

  if (!isAuthenticated) {
    return (
      <div className="container max-w-md mx-auto py-24 px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Shield" size={32} className="text-primary" />
            </div>
            <CardTitle>Админ-панель</CardTitle>
            <CardDescription>
              Управление обращениями в техподдержку
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email администратора</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                <Icon name="LogIn" size={18} className="mr-2" />
                Войти
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Админ-панель</h1>
          <p className="text-muted-foreground">Управление обращениями в техподдержку</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadTickets} variant="outline">
            <Icon name="RefreshCw" size={18} className="mr-2" />
            Обновить
          </Button>
          <Button onClick={() => setIsAuthenticated(false)} variant="outline">
            <Icon name="LogOut" size={18} className="mr-2" />
            Выйти
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Всего обращений</CardDescription>
            <CardTitle className="text-3xl">{tickets.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Новых</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {tickets.filter(t => t.status === 'new').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Отвечено</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {tickets.filter(t => t.status === 'answered').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Icon name="Loader2" size={48} className="mx-auto text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Загрузка тикетов...</p>
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Icon name="Inbox" size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Нет обращений</h3>
            <p className="text-muted-foreground">Пока нет обращений в поддержку</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card 
              key={ticket.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                ticket.status === 'new' ? 'border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => {
                setSelectedTicket(ticket);
                setResponse(ticket.admin_response || '');
              }}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name={getStatusIcon(ticket.status)} size={18} className="text-primary" />
                      <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                    </div>
                    <CardDescription className="flex flex-wrap gap-4">
                      <span className="flex items-center gap-1">
                        <Icon name="Mail" size={14} />
                        {ticket.user_email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" size={14} />
                        {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    </CardDescription>
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {ticket.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="MessageSquare" size={24} className="text-primary" />
              {selectedTicket?.subject}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Icon name="Mail" size={14} />
                {selectedTicket?.user_email}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Calendar" size={14} />
                {selectedTicket && new Date(selectedTicket.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-base font-semibold mb-2 block">Сообщение пользователя:</Label>
              <div className="bg-muted p-4 rounded-lg">
                <p className="whitespace-pre-line text-sm">{selectedTicket?.message}</p>
              </div>
              {selectedTicket?.attachment_url && (
                <div className="mt-3">
                  <Label className="text-sm font-semibold mb-2 block">Прикрепленное изображение:</Label>
                  <a 
                    href={selectedTicket.attachment_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <img
                      src={selectedTicket.attachment_url}
                      alt="Прикрепленное изображение"
                      className="max-w-md rounded-lg border-2 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer"
                    />
                  </a>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="admin-response" className="text-base font-semibold mb-2 block">
                Ваш ответ:
              </Label>
              <Textarea
                id="admin-response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Введите ответ пользователю..."
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Ответ будет отправлен на email: {selectedTicket?.user_email}
              </p>
            </div>

            <Button 
              onClick={handleSendResponse} 
              className="w-full"
              disabled={sending || !response.trim()}
            >
              {sending ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Icon name="Send" size={18} className="mr-2" />
                  Отправить ответ на email
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}