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

  const handleClose = () => {
    setEmail('');
    setEmailSent(false);
    setLoading(false);
    onOpenChange(false);
  };

  const handleBackClick = () => {
    setEmail('');
    setEmailSent(false);
    setLoading(false);
    onBack();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Восстановление пароля</DialogTitle>
          <DialogDescription>
            {!emailSent 
              ? 'Введите email, и мы отправим вам новый пароль'
              : 'Проверьте вашу почту'
            }
          </DialogDescription>
        </DialogHeader>

        {!emailSent ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative">
                <Icon name="Mail" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBackClick}
                className="flex-1"
              >
                <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                Назад
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" className="mr-2 h-4 w-4" />
                    Отправить
                  </>
                )}
              </Button>
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
                    Проверьте папку "Спам", если письмо не пришло
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={20} className="text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-800">
                  <strong>Важно:</strong> Рекомендуем сменить пароль после входа
                </p>
              </div>
            </div>

            <Button 
              onClick={handleBackClick}
              className="w-full"
            >
              <Icon name="LogIn" className="mr-2 h-4 w-4" />
              Вернуться к входу
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
