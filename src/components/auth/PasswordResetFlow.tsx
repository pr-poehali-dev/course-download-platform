import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../../backend/func2url.json';

interface PasswordResetFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
}

export default function PasswordResetFlow({ open, onOpenChange, onBack }: PasswordResetFlowProps) {
  const [resetStep, setResetStep] = useState<'email' | 'security' | 'newPassword'>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [userSecurityQuestion, setUserSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

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

      setResetStep('email');
      setResetEmail('');
      setSecurityAnswer('');
      setNewPassword('');
      setConfirmNewPassword('');
      onBack();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleBackToEmail = () => {
    setResetStep('email');
    setSecurityAnswer('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

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
                onClick={onBack}
              >
                Назад
              </Button>
            </div>
          </form>
        )}

        {resetStep === 'security' && (
          <form onSubmit={handleVerifySecurityAnswer} className="space-y-4 pt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">Секретный вопрос:</p>
              <p className="text-sm text-blue-700">{userSecurityQuestion}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="security-answer">Ваш ответ</Label>
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
                onClick={handleBackToEmail}
              >
                <Icon name="ArrowLeft" size={18} className="mr-2" />
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
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Подтвердите пароль</Label>
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="••••••••"
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
