import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

interface RegisterFormProps {
  onRegister: (username: string, email: string, password: string, securityQuestion: string, securityAnswer: string) => void;
}

export default function RegisterForm({ onRegister }: RegisterFormProps) {
  const [registerData, setRegisterData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',
    agreeToPrivacy: false
  });

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
        />
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

      <div className="border-t pt-4 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-3">
            <Icon name="ShieldCheck" size={20} className="text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 text-sm">Секретный вопрос для восстановления</p>
              <p className="text-xs text-blue-700 mt-1">
                Используется для восстановления доступа к аккаунту, если вы забудете пароль
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="security-question" className="text-sm">Выберите секретный вопрос</Label>
              <Select 
                value={registerData.securityQuestion}
                onValueChange={(value) => setRegisterData({ ...registerData, securityQuestion: value })}
              >
                <SelectTrigger id="security-question">
                  <SelectValue placeholder="Выберите вопрос" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Девичья фамилия матери?">Девичья фамилия матери?</SelectItem>
                  <SelectItem value="Кличка первого питомца?">Кличка первого питомца?</SelectItem>
                  <SelectItem value="Название первой школы?">Название первой школы?</SelectItem>
                  <SelectItem value="Город рождения?">Город рождения?</SelectItem>
                  <SelectItem value="Любимое блюдо в детстве?">Любимое блюдо в детстве?</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="security-answer" className="text-sm">Ваш ответ</Label>
              <Input
                id="security-answer"
                type="text"
                placeholder="Введите ответ на вопрос"
                value={registerData.securityAnswer}
                onChange={(e) => setRegisterData({ ...registerData, securityAnswer: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Запомните ответ — он понадобится для восстановления пароля
              </p>
            </div>
          </div>
        </div>
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
