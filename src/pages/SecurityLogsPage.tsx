import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface SecurityLog {
  id: number;
  user_id: number;
  event_type: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/security-logs`, {
        headers: {
          'X-Admin-Email': 'rekrutiw@yandex.ru'
        }
      });
      const data = await response.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to load security logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventBadge = (eventType: string) => {
    const badges: Record<string, { color: string; icon: string }> = {
      price_manipulation: { color: 'bg-red-500', icon: 'AlertTriangle' },
      author_self_purchase: { color: 'bg-orange-500', icon: 'Ban' },
      rate_limit: { color: 'bg-yellow-500', icon: 'Timer' },
      suspicious_activity: { color: 'bg-purple-500', icon: 'Eye' }
    };

    const badge = badges[eventType] || { color: 'bg-gray-500', icon: 'Info' };

    return (
      <Badge className={`${badge.color} text-white`}>
        <Icon name={badge.icon as any} size={14} className="mr-1" />
        {eventType.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button variant="ghost" className="mb-4" asChild>
              <Link to="/admin">
                <Icon name="ArrowLeft" size={18} className="mr-2" />
                Назад в админку
              </Link>
            </Button>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              🔒 Логи безопасности
            </h1>
            <p className="text-muted-foreground">
              Мониторинг подозрительной активности пользователей
            </p>
          </div>
          <Button onClick={loadLogs} variant="outline">
            <Icon name="RefreshCw" size={18} className="mr-2" />
            Обновить
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="Loader2" size={48} className="mx-auto animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Загрузка логов...</p>
            </CardContent>
          </Card>
        ) : logs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="ShieldCheck" size={48} className="mx-auto text-green-500 mb-4" />
              <p className="text-lg font-semibold mb-2">Нет подозрительной активности</p>
              <p className="text-muted-foreground">Все пользователи ведут себя корректно</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getEventBadge(log.event_type)}
                      <div>
                        <CardTitle className="text-lg">
                          Пользователь #{log.user_id}
                        </CardTitle>
                        <CardDescription>
                          {new Date(log.created_at).toLocaleString('ru-RU')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="MapPin" size={14} />
                      {log.ip_address}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg border">
                    {log.details}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
