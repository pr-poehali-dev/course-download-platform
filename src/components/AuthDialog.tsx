import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (username: string, password: string) => void;
  onRegister: (username: string, email: string, password: string) => void;
}

export default function AuthDialog({ open, onOpenChange, onLogin, onRegister }: AuthDialogProps) {
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    agreeToPrivacy: false
  });

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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerData.username || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    if (!registerData.agreeToPrivacy) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо согласие на обработку персональных данных',
        variant: 'destructive',
      });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive',
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть не менее 6 символов',
        variant: 'destructive',
      });
      return;
    }

    onRegister(registerData.username, registerData.email, registerData.password);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail) {
      toast({
        title: 'Ошибка',
        description: 'Введите email',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Письмо отправлено!',
      description: `Инструкция по восстановлению пароля отправлена на ${resetEmail}`,
    });
    setIsResetMode(false);
    setResetEmail('');
  };

  if (isResetMode) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="KeyRound" size={24} className="text-primary" />
              Восстановление пароля
            </DialogTitle>
            <DialogDescription>
              Введите email, указанный при регистрации
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleResetPassword} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="example@mail.ru"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Icon name="Mail" size={18} className="mr-2" />
                Отправить письмо
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsResetMode(false)}
              >
                Назад
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Вход в личный кабинет</DialogTitle>
          <DialogDescription>
            Войдите или создайте новый аккаунт
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="example@mail.ru"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Пароль</Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  autoComplete="current-password"
                />
              </div>

              <Button 
                type="button" 
                variant="link" 
                className="p-0 h-auto text-sm"
                onClick={() => setIsResetMode(true)}
              >
                Забыли пароль?
              </Button>

              <Button type="submit" className="w-full">
                <Icon name="LogIn" size={18} className="mr-2" />
                Войти
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="register-username">Никнейм</Label>
                <Input
                  id="register-username"
                  name="username"
                  type="text"
                  placeholder="Ваш никнейм"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="example@mail.ru"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Пароль</Label>
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder="Минимум 6 символов"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm">Подтверждение пароля</Label>
                <Input
                  id="register-confirm"
                  name="password-confirm"
                  type="password"
                  placeholder="Повторите пароль"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                />
              </div>

              <div className="flex items-start gap-2 py-2">
                <input
                  type="checkbox"
                  id="privacy-checkbox"
                  checked={registerData.agreeToPrivacy}
                  onChange={(e) => setRegisterData({ ...registerData, agreeToPrivacy: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="privacy-checkbox" className="text-xs text-muted-foreground leading-tight">
                  Я согласен на обработку персональных данных в соответствии с{' '}
                  <a href="/privacy-policy" target="_blank" className="text-primary hover:underline">
                    Политикой конфиденциальности
                  </a>
                  {' '}и принимаю условия{' '}
                  <a href="/terms-of-service" target="_blank" className="text-primary hover:underline">
                    Пользовательского соглашения
                  </a>
                </label>
              </div>

              <Button type="submit" className="w-full">
                <Icon name="UserPlus" size={18} className="mr-2" />
                Зарегистрироваться
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}