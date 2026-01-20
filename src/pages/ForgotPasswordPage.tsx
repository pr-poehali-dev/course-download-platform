import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../backend/func2url.json';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: 'Ошибка',
        description: 'Введите email',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${func2url.auth}?action=request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        toast({
          title: 'Письмо отправлено',
          description: 'Новый пароль отправлен на ваш email'
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить письмо',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Восстановление пароля"
        description="Восстановите доступ к аккаунту Tech Forma"
        noindex={true}
        canonical="https://techforma.pro/forgot-password"
      />
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Breadcrumbs className="mb-4" />
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold mb-2">
              <Icon name="Cpu" size={32} className="text-primary" />
              <span>Tech Forma</span>
            </Link>
            <p className="text-muted-foreground">Восстановите доступ к аккаунту</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Забыли пароль?</CardTitle>
              <CardDescription>
                {!emailSent 
                  ? 'Введите email, и мы отправим вам новый пароль'
                  : 'Проверьте вашу почту'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!emailSent ? (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Icon name="Mail" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Icon name="Send" className="mr-2 h-4 w-4" />
                        Отправить новый пароль
                      </>
                    )}
                  </Button>

                  <div className="text-center text-sm space-y-2">
                    <div>
                      <span className="text-muted-foreground">Вспомнили пароль? </span>
                      <Link to="/login" className="text-primary hover:underline font-medium">
                        Войти
                      </Link>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Нет аккаунта? </span>
                      <Link to="/register" className="text-primary hover:underline font-medium">
                        Зарегистрироваться
                      </Link>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Icon name="CheckCircle" size={24} className="text-green-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-900 mb-1">Письмо отправлено!</p>
                        <p className="text-sm text-green-700">
                          Новый временный пароль отправлен на <strong>{email}</strong>
                        </p>
                        <p className="text-sm text-green-700 mt-2">
                          Проверьте папку "Спам", если письмо не пришло в течение 5 минут
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Icon name="AlertTriangle" size={20} className="text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-800">
                          <strong>Важно:</strong> Рекомендуем сменить временный пароль после входа в настройках профиля
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setEmailSent(false);
                        setEmail('');
                      }}
                    >
                      <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                      Назад
                    </Button>
                    <Link to="/login" className="flex-1">
                      <Button className="w-full">
                        <Icon name="LogIn" className="mr-2 h-4 w-4" />
                        Войти
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Нужна помощь?{' '}
              <Link to="/support" className="text-primary hover:underline">
                Свяжитесь с поддержкой
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}