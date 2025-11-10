import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../backend/func2url.json';
import SEO from '@/components/SEO';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    security_question: '',
    security_answer: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive'
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо принять условия использования',
        variant: 'destructive'
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть не менее 8 символов',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${func2url.auth}?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          password: formData.password,
          security_question: formData.security_question,
          security_answer: formData.security_answer
        })
      });

      const data = await response.json();

      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('userId', data.user.id);
        
        toast({
          title: 'Регистрация успешна!',
          description: 'Добро пожаловать! Вам начислено 100 бонусных баллов.'
        });
        
        navigate('/profile');
      } else {
        toast({
          title: 'Ошибка регистрации',
          description: data.error || 'Пользователь с таким email уже существует',
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
    <>
      <SEO 
        title="Регистрация"
        description="Создайте аккаунт Tech Forma и получите 100 бонусных баллов в подарок. Покупайте и продавайте студенческие работы"
        noindex={true}
      />
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold mb-2">
            <Icon name="Cpu" size={32} className="text-primary" />
            <span>Tech Forma</span>
          </Link>
          <p className="text-muted-foreground">Создайте свой аккаунт</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Регистрация</CardTitle>
            <CardDescription>Заполните данные для создания аккаунта</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <div className="relative">
                  <Icon name="User" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    name="username"
                    type="text"
                    placeholder="Иван Иванов"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Icon name="Mail" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Icon name="Lock" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Минимум 8 символов</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <div className="relative">
                  <Icon name="Lock" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="password-confirm"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="security_question">Секретный вопрос</Label>
                <select
                  id="security_question"
                  value={formData.security_question}
                  onChange={(e) => setFormData({ ...formData, security_question: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="">Выберите вопрос</option>
                  <option value="Девичья фамилия матери?">Девичья фамилия матери?</option>
                  <option value="Город вашего рождения?">Город вашего рождения?</option>
                  <option value="Кличка первого питомца?">Кличка первого питомца?</option>
                  <option value="Название первой школы?">Название первой школы?</option>
                  <option value="Любимый цвет?">Любимый цвет?</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="security_answer">Ответ на секретный вопрос</Label>
                <Input
                  id="security_answer"
                  type="text"
                  placeholder="Ваш ответ"
                  value={formData.security_answer}
                  onChange={(e) => setFormData({ ...formData, security_answer: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">Используется для восстановления пароля</p>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 rounded"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  Я принимаю{' '}
                  <Link to="/terms-of-service" className="text-primary hover:underline">
                    условия использования
                  </Link>{' '}
                  и{' '}
                  <Link to="/privacy-policy" className="text-primary hover:underline">
                    политику конфиденциальности
                  </Link>
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                    Регистрация...
                  </>
                ) : (
                  <>
                    <Icon name="UserPlus" className="mr-2 h-4 w-4" />
                    Зарегистрироваться
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Уже есть аккаунт? </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                Войти
              </Link>
            </div>

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
    </>
  );
}