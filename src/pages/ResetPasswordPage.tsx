import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      toast({
        title: 'Ошибка',
        description: 'Неверная ссылка для сброса пароля',
        variant: 'destructive',
      });
      navigate('/login');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: 'Ошибка',
        description: 'Токен не найден',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть минимум 8 символов',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${func2url.auth}?action=confirm-reset`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Пароль успешно изменён. Войдите с новым паролем.',
        });
        navigate('/login');
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось сбросить пароль',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка подключения к серверу',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Icon name="KeyRound" size={48} className="text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Сброс пароля</CardTitle>
          <CardDescription className="text-center">
            Введите новый пароль для вашего аккаунта
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Новый пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Минимум 8 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Повторите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Обработка...' : 'Сменить пароль'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Вернуться к входу
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;