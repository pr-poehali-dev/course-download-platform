import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
  onForgotPassword: () => void;
}

export default function LoginForm({ onLogin, onForgotPassword }: LoginFormProps) {
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    onLogin(loginData.email, loginData.password);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email или имя пользователя</Label>
        <Input
          id="login-email"
          type="text"
          placeholder="user@example.com"
          value={loginData.email}
          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Пароль</Label>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••••"
          value={loginData.password}
          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
        />
      </div>

      <div className="flex justify-end">
        <Button 
          type="button" 
          variant="link" 
          className="text-sm p-0 h-auto"
          onClick={onForgotPassword}
        >
          Забыли пароль?
        </Button>
      </div>

      <Button type="submit" className="w-full">
        <Icon name="LogIn" size={18} className="mr-2" />
        Войти
      </Button>
    </form>
  );
}
