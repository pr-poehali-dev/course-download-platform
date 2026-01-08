import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

interface RegisterFormProps {
  onRegister: (username: string, email: string, password: string) => void;
}

export default function RegisterForm({ onRegister }: RegisterFormProps) {
  const [registerData, setRegisterData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    agreeToPrivacy: false
  });

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

    if (registerData.password.length < 8) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть не менее 8 символов',
        variant: 'destructive',
      });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректный email адрес',
        variant: 'destructive',
      });
      return;
    }

    onRegister(registerData.username, registerData.email, registerData.password);
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="reg-username">Имя пользователя</Label>
        <Input
          id="reg-username"
          type="text"
          placeholder="ivan_ivanov"
          value={registerData.username}
          onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="example@mail.ru"
          value={registerData.email}
          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
          required
        />
        <p className="text-xs text-muted-foreground">Для восстановления пароля</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-password">Пароль</Label>
        <Input
          id="reg-password"
          type="password"
          placeholder="••••••••"
          value={registerData.password}
          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">Минимум 8 символов. Используйте буквы и цифры</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-confirm-password">Подтвердите пароль</Label>
        <Input
          id="reg-confirm-password"
          type="password"
          placeholder="••••••••"
          value={registerData.confirmPassword}
          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
        />
      </div>

      <div className="flex items-start space-x-2 pt-2">
        <Checkbox 
          id="privacy-agree" 
          checked={registerData.agreeToPrivacy}
          onCheckedChange={(checked) => setRegisterData({ ...registerData, agreeToPrivacy: checked as boolean })}
        />
        <label 
          htmlFor="privacy-agree" 
          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Я согласен на{' '}
          <a href="/privacy-policy" target="_blank" className="text-primary hover:underline">
            обработку персональных данных
          </a>
          {' '}и принимаю{' '}
          <a href="/terms-of-service" target="_blank" className="text-primary hover:underline">
            условия использования
          </a>
        </label>
      </div>

      <Button type="submit" className="w-full">
        <Icon name="UserPlus" size={18} className="mr-2" />
        Зарегистрироваться
      </Button>
    </form>
  );
}