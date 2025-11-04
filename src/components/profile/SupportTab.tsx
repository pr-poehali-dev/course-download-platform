import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../../backend/func2url.json';

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

interface SupportTabProps {
  userEmail: string;
}

export default function SupportTab({ userEmail }: SupportTabProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'form' | 'tickets'>('form');

  useEffect(() => {
    if (userEmail) {
      loadTickets();
    }
  }, [userEmail]);

  const loadTickets = async () => {
    if (!userEmail) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${SUPPORT_API}?email=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
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
    
    if (!subject || !message) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    
    try {
      const formData: any = {
        email: userEmail,
        subject,
        message
      };

      if (attachmentFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          formData.attachment = reader.result;
          formData.attachmentName = attachmentFile.name;
          await sendRequest(formData);
        };
        reader.readAsDataURL(attachmentFile);
      } else {
        await sendRequest(formData);
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить обращение',
        variant: 'destructive'
      });
      setUploading(false);
    }
  };

  const sendRequest = async (formData: any) => {
    try {
      const response = await fetch(SUPPORT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Обращение отправлено',
          description: 'Мы ответим вам в ближайшее время на указанный email'
        });
        setSubject('');
        setMessage('');
        setAttachmentFile(null);
        setAttachmentPreview('');
        await loadTickets();
        setViewMode('tickets');
      } else {
        throw new Error(data.error || 'Failed to submit');
      }
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: string }> = {
      new: { variant: 'secondary', label: 'Новое', icon: 'Mail' },
      in_progress: { variant: 'default', label: 'В работе', icon: 'Clock' },
      answered: { variant: 'outline', label: 'Отвечено', icon: 'CheckCircle' },
      closed: { variant: 'outline', label: 'Закрыто', icon: 'XCircle' }
    };
    const config = variants[status] || variants.new;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon name={config.icon} size={14} />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex gap-2 mb-4">
        <Button 
          onClick={() => setViewMode('form')} 
          variant={viewMode === 'form' ? 'default' : 'outline'}
          className="flex-1"
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Новое обращение
        </Button>
        <Button 
          onClick={() => setViewMode('tickets')} 
          variant={viewMode === 'tickets' ? 'default' : 'outline'}
          className="flex-1"
        >
          <Icon name="List" size={16} className="mr-2" />
          Мои обращения ({tickets.length})
        </Button>
      </div>

      {viewMode === 'form' ? (
        <Card>
          <CardHeader>
            <CardTitle>Новое обращение</CardTitle>
            <CardDescription>Опишите вашу проблему, и мы постараемся помочь</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Тема обращения *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Кратко опишите проблему"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Сообщение *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Подробно опишите вашу проблему или вопрос"
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="attachment">Прикрепить скриншот (опционально)</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="attachment"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {attachmentPreview && (
                    <Button type="button" variant="ghost" size="icon" onClick={removeAttachment}>
                      <Icon name="X" size={18} />
                    </Button>
                  )}
                </div>
                {attachmentPreview && (
                  <div className="mt-2 relative w-32 h-32">
                    <img 
                      src={attachmentPreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded border"
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Форматы: JPG, PNG. Максимум 5 МБ
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={16} className="mr-2" />
                    Отправить обращение
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-2" />
              <p>Загрузка обращений...</p>
            </div>
          ) : tickets.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Icon name="Inbox" size={48} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">У вас пока нет обращений</p>
              </CardContent>
            </Card>
          ) : (
            tickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{ticket.subject}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon name="Calendar" size={14} />
                        {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-1">Ваше сообщение:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.message}</p>
                  </div>

                  {ticket.attachment_url && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Прикрепленный файл:</p>
                      <img 
                        src={ticket.attachment_url} 
                        alt="Attachment" 
                        className="max-w-xs rounded border"
                      />
                    </div>
                  )}

                  {ticket.admin_response && (
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                        <Icon name="User" size={14} />
                        Ответ поддержки:
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{ticket.admin_response}</p>
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
