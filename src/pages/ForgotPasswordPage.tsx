import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/YOUR_AUTH_FUNCTION_URL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'forgot-password',
          email
        })
      });

      const data = await response.json();

      if (data.success) {
        setEmailSent(true);
        toast({
          title: 'Письмо отправлено!',
          description: 'Проверьте email для восстановления пароля'
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Пользователь с таким email не найден',
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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold mb-2">
            <Icon name="Cpu" size={32} className="text-primary" />
            <span>Tech Forma</span>
          </Link>
          <p className="text-muted-foreground">Восстановление пароля</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Забыли пароль?</CardTitle>
            <CardDescription>
              {emailSent
                ? 'Письмо с инструкциями отправлено'
                : 'Введите email для восстановления доступа'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                  <Icon name="MailCheck" size={24} className="text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Проверьте почту</h4>
                    <p className="text-sm text-green-700">
                      Мы отправили инструкции по восстановлению пароля на адрес{' '}
                      <strong>{email}</strong>
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Icon name="Info" size={18} />
                    Что делать дальше:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1 ml-6 list-disc">
                    <li>Откройте письмо от Tech Forma</li>
                    <li>Перейдите по ссылке в письме</li>
                    <li>Создайте новый пароль</li>
                  </ul>
                  <p className="text-xs text-blue-600 mt-3">
                    Не видите письмо? Проверьте папку "Спам"
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                >
                  <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                  Отправить повторно
                </Button>

                <Button variant="default" className="w-full" asChild>
                  <Link to="/login">
                    <Icon name="LogIn" className="mr-2 h-4 w-4" />
                    Вернуться ко входу
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
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
                  <p className="text-xs text-muted-foreground">
                    Введите email, который вы использовали при регистрации
                  </p>
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
                      Отправить инструкции
                    </>
                  )}
                </Button>

                <div className="text-center text-sm">
                  <Link to="/login" className="text-primary hover:underline inline-flex items-center gap-1">
                    <Icon name="ArrowLeft" size={14} />
                    Вернуться ко входу
                  </Link>
                </div>
              </form>
            )}

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">или</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/">
                  <Icon name="Home" className="mr-2 h-4 w-4" />
                  На главную
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
