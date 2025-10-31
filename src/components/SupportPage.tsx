import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../backend/func2url.json';

const SUPPORT_API = func2url.support;

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

export default function SupportPage() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'form' | 'tickets'>('form');
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast({
        title: 'Ошибка',
        description: 'Разрешены только JPG и PNG файлы',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Ошибка',
        description: 'Размер файла не должен превышать 5 МБ',
        variant: 'destructive'
      });
      return;
    }

    setAttachmentFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachmentPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    setAttachmentPreview('');
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

    if (!agreeToPrivacy) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо согласие на обработку персональных данных',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      let attachmentUrl = '';

      if (attachmentFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', attachmentFile);

        const uploadResponse = await fetch('https://api.poehali.dev/upload', {
          method: 'POST',
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error('Ошибка загрузки файла');
        }

        const uploadData = await uploadResponse.json();
        attachmentUrl = uploadData.url;
        setUploading(false);
      }

      const response = await fetch(SUPPORT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          subject,
          message,
          attachment_url: attachmentUrl
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
        setAgreeToPrivacy(false);
        removeAttachment();
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
      setUploading(false);
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

              <div className="space-y-2">
                <Label htmlFor="attachment">Прикрепить изображение (JPG, PNG)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="attachment"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {attachmentFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeAttachment}
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  )}
                </div>
                {attachmentPreview && (
                  <div className="mt-3 relative inline-block">
                    <img
                      src={attachmentPreview}
                      alt="Предпросмотр"
                      className="max-w-xs rounded-lg border-2 border-primary/20"
                    />
                    <Badge className="absolute top-2 right-2 bg-primary">
                      {attachmentFile?.name}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 py-2">
                <input
                  type="checkbox"
                  id="support-privacy-checkbox"
                  checked={agreeToPrivacy}
                  onChange={(e) => setAgreeToPrivacy(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="support-privacy-checkbox" className="text-xs text-muted-foreground leading-tight">
                  Я согласен на обработку персональных данных в соответствии с{' '}
                  <a href="/privacy-policy" target="_blank" className="text-primary hover:underline">
                    Политикой конфиденциальности
                  </a>
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={loading || uploading}>
                {uploading ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Загрузка файла...
                  </>
                ) : loading ? (
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Calendar" size={14} />
                    {new Date(ticket.created_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
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
                    {ticket.attachment_url && (
                      <div className="mt-3">
                        <a 
                          href={ticket.attachment_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <img
                            src={ticket.attachment_url}
                            alt="Прикрепленное изображение"
                            className="max-w-sm rounded-lg border-2 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer"
                          />
                        </a>
                      </div>
                    )}
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