import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import PasswordResetFlow from '@/components/auth/PasswordResetFlow';
import { trackEvent, metrikaEvents } from '@/utils/metrika';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (username: string, password: string) => void;
  onRegister: (username: string, email: string, password: string) => void;
}

export default function AuthDialog({ open, onOpenChange, onLogin, onRegister }: AuthDialogProps) {
  const [isResetMode, setIsResetMode] = useState(false);

  useEffect(() => {
    if (open) {
      trackEvent(metrikaEvents.AUTH_OPEN);
    } else {
      trackEvent(metrikaEvents.AUTH_CLOSE);
    }
  }, [open]);

  const handleForgotPassword = () => {
    setIsResetMode(true);
  };

  const handleBackToAuth = () => {
    setIsResetMode(false);
  };

  if (isResetMode) {
    return (
      <PasswordResetFlow 
        open={open} 
        onOpenChange={onOpenChange}
        onBack={handleBackToAuth}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="LogIn" size={24} className="text-primary" />
            Вход и регистрация
          </DialogTitle>
          <DialogDescription>
            Войдите в существующий аккаунт или создайте новый
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm 
              onLogin={onLogin}
              onForgotPassword={handleForgotPassword}
            />
          </TabsContent>

          <TabsContent value="register">
            <RegisterForm onRegister={onRegister} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}