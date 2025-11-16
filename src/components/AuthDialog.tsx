import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../backend/func2url.json';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (username: string, password: string) => void;
  onRegister: (username: string, email: string, password: string, securityQuestion: string, securityAnswer: string) => void;
}

export default function AuthDialog({ open, onOpenChange, onLogin, onRegister }: AuthDialogProps) {
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'security' | 'newPassword'>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [userSecurityQuestion, setUserSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',
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

    if (!registerData.username || !registerData.email || !registerData.password || !registerData.confirmPassword || !registerData.securityQuestion || !registerData.securityAnswer) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля, включая секретный вопрос и ответ',
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

    onRegister(registerData.username, registerData.email, registerData.password, registerData.securityQuestion, registerData.securityAnswer);
  };

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail) {
      toast({
        title: 'Ошибка',
        description: 'Введите email',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`${func2url.auth}?action=get-security-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Пользователь не найден');
      }

      setUserSecurityQuestion(data.security_question);
      setResetStep('security');
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleVerifySecurityAnswer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!securityAnswer) {
      toast({
        title: 'Ошибка',
        description: 'Введите ответ на секретный вопрос',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`${func2url.auth}?action=verify-security-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, security_answer: securityAnswer })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Неверный ответ');
      }

      setResetStep('newPassword');
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmNewPassword) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть не менее 6 символов',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`${func2url.auth}?action=reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, new_password: newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка смены пароля');
      }

      toast({
        title: 'Пароль изменён!',
        description: 'Теперь вы можете войти с новым паролем',
      });

      setIsResetMode(false);
      setResetStep('email');
      setResetEmail('');
      setSecurityAnswer('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
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
              {resetStep === 'email' && 'Введите email, указанный при регистрации'}
              {resetStep === 'security' && 'Ответьте на секретный вопрос'}
              {resetStep === 'newPassword' && 'Установите новый пароль'}
            </DialogDescription>
          </DialogHeader>
          
          {resetStep === 'email' && (
            <form onSubmit={handleCheckEmail} className="space-y-4 pt-4">
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
                  <Icon name="ArrowRight" size={18} className="mr-2" />
                  Продолжить
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsResetMode(false);
                    setResetStep('email');
                  }}
                >
                  Назад
                </Button>
              </div>
            </form>
          )}

          {resetStep === 'security' && (
            <form onSubmit={handleVerifySecurityAnswer} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Ваш секретный вопрос:</Label>
                <p className="text-sm text-muted-foreground italic">{userSecurityQuestion}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="security-answer">Ответ</Label>
                <Input
                  id="security-answer"
                  type="text"
                  placeholder="Введите ответ"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <Icon name="CheckCircle" size={18} className="mr-2" />
                  Проверить
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setResetStep('email');
                    setSecurityAnswer('');
                  }}
                >
                  Назад
                </Button>
              </div>
            </form>
          )}

          {resetStep === 'newPassword' && (
            <form onSubmit={handleSetNewPassword} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Новый пароль</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Минимум 6 символов"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Подтвердите пароль</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="Повторите пароль"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full">
                <Icon name="Save" size={18} className="mr-2" />
                Сохранить новый пароль
              </Button>
            </form>
          )}
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
                  placeholder="techmaster2024"
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

              <div className="space-y-2">
                <Label htmlFor="register-security-question">Секретный вопрос</Label>
                <Input
                  id="register-security-question"
                  type="text"
                  placeholder="Например: Девичья фамилия матери"
                  value={registerData.securityQuestion}
                  onChange={(e) => setRegisterData({ ...registerData, securityQuestion: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-security-answer">Ответ на секретный вопрос</Label>
                <Input
                  id="register-security-answer"
                  type="text"
                  placeholder="Ваш ответ"
                  value={registerData.securityAnswer}
                  onChange={(e) => setRegisterData({ ...registerData, securityAnswer: e.target.value })}
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