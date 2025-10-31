import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';

const SUPPORT_API = 'https://functions.poehali.dev/c13b3d8d-6ee7-416d-9f1f-0350aae86e61';
const ADMIN_EMAIL = 'tech.forma@yandex.ru';

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

export default function SupportAdmin() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [sending, setSending] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    console.log('Попытка входа с паролем:', password);
    if (password === 'admin123') {
      console.log('Пароль верный, загружаем тикеты...');
      setIsAuthenticated(true);
      loadTickets();
    } else {
      console.log('Неверный пароль');
      toast({
        title: 'Ошибка',
        description: 'Неверный пароль',
        variant: 'destructive'
      });
    }
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      console.log('Запрос тикетов с заголовком:', ADMIN_EMAIL);
      const response = await fetch(SUPPORT_API, {
        headers: {
          'X-Admin-Email': ADMIN_EMAIL
        }
      });
      console.log('Статус ответа:', response.status);
      const data = await response.json();
      console.log('Данные от сервера:', data);
      if (data.tickets) {
        setTickets(data.tickets);
        console.log('Загружено тикетов:', data.tickets.length);
      } else {
        console.log('В ответе нет поля tickets');
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
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
    if (!selectedTicket || !adminResponse.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите ответ',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);
    try {
      const response = await fetch(SUPPORT_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': ADMIN_EMAIL
        },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          admin_response: adminResponse
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно!',
          description: `Ответ отправлен на ${selectedTicket.user_email}`
        });
        setAdminResponse('');
        setSelectedTicket(null);
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Админ-панель поддержки</CardTitle>
            <CardDescription className="text-center">Введите пароль для входа</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Введите пароль"
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                Войти
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Админ-панель поддержки
            </h1>
            <p className="text-muted-foreground">
              Управление тикетами и ответы пользователям
            </p>
          </div>
          <Button onClick={loadTickets} disabled={loading}>
            <Icon name="RefreshCw" size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Тикеты ({tickets.length})</h2>
            {loading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Загрузка...</p>
                </CardContent>
              </Card>
            ) : tickets.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Нет тикетов</p>
                </CardContent>
              </Card>
            ) : (
              tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedTicket?.id === ticket.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setAdminResponse('');
                  }}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{ticket.subject}</CardTitle>
                        <CardDescription className="text-sm">
                          {ticket.user_email}
                        </CardDescription>
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {ticket.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Clock" size={14} />
                        {new Date(ticket.created_at).toLocaleString('ru-RU')}
                      </span>
                      {ticket.attachment_url && (
                        <span className="flex items-center gap-1">
                          <Icon name="Paperclip" size={14} />
                          Вложение
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="lg:sticky lg:top-8 h-fit">
            {selectedTicket ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <CardTitle>{selectedTicket.subject}</CardTitle>
                      <CardDescription>{selectedTicket.user_email}</CardDescription>
                    </div>
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Сообщение от пользователя</Label>
                    <div className="mt-2 p-4 bg-muted rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                    </div>
                    {selectedTicket.attachment_url && (
                      <div className="mt-3">
                        <a
                          href={selectedTicket.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <Icon name="ExternalLink" size={14} />
                          Открыть вложение
                        </a>
                      </div>
                    )}
                  </div>

                  {selectedTicket.admin_response && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Ваш ответ</Label>
                      <div className="mt-2 p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="whitespace-pre-wrap text-green-900">{selectedTicket.admin_response}</p>
                      </div>
                    </div>
                  )}

                  {selectedTicket.status !== 'answered' && (
                    <>
                      <div>
                        <Label htmlFor="response">Ваш ответ</Label>
                        <Textarea
                          id="response"
                          placeholder="Введите ответ для пользователя..."
                          value={adminResponse}
                          onChange={(e) => setAdminResponse(e.target.value)}
                          rows={6}
                          className="mt-2"
                        />
                      </div>

                      <Button
                        onClick={handleSendResponse}
                        disabled={sending || !adminResponse.trim()}
                        className="w-full"
                      >
                        {sending ? (
                          <>
                            <Icon name="Loader2" size={18} className="animate-spin mr-2" />
                            Отправка...
                          </>
                        ) : (
                          <>
                            <Icon name="Send" size={18} className="mr-2" />
                            Отправить ответ на email
                          </>
                        )}
                      </Button>
                    </>
                  )}

                  <div className="text-xs text-muted-foreground pt-4 border-t">
                    <div className="flex items-center gap-1 mb-1">
                      <Icon name="Clock" size={12} />
                      Создан: {new Date(selectedTicket.created_at).toLocaleString('ru-RU')}
                    </div>
                    {selectedTicket.updated_at && (
                      <div className="flex items-center gap-1">
                        <Icon name="Clock" size={12} />
                        Обновлён: {new Date(selectedTicket.updated_at).toLocaleString('ru-RU')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-24 text-center">
                  <Icon name="MousePointerClick" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Выберите тикет для ответа</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}