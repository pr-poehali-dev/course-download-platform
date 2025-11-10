import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../backend/func2url.json';
import SEO from '@/components/SEO';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'question' | 'success'>('email');
  const [showPassword, setShowPassword] = useState(false);

  const handleGetQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${func2url.auth}?action=reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.security_question) {
        setSecurityQuestion(data.security_question);
        setStep('question');
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Пользователь не найден',
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть не менее 8 символов',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${func2url.auth}?action=verify-security-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          security_answer: securityAnswer,
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('auth_token', data.token);
        setStep('success');
        toast({
          title: 'Пароль изменен!',
          description: 'Теперь вы можете войти с новым паролем'
        });
        setTimeout(() => navigate('/profile'), 2000);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Неверный ответ на секретный вопрос',
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
        title="Восстановление пароля"
        description="Забыли пароль? Восстановите доступ к аккаунту Tech Forma через секретный вопрос"
        noindex={true}
      />
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold mb-2">
            <Icon name="Cpu" size={32} className="text-primary" />
            <span>Tech Forma</span>
          </Link>
          <p className="text-muted-foreground">Восстановление пароля</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Забыли пароль?</CardTitle>
            <CardDescription>
              {step === 'email' && 'Введите email для восстановления доступа'}
              {step === 'question' && 'Ответьте на секретный вопрос'}
              {step === 'success' && 'Пароль успешно изменен!'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'success' ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                  <Icon name="CheckCircle" size={24} className="text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Готово!</h4>
                    <p className="text-sm text-green-700">
                      Ваш пароль успешно изменен. Перенаправляем в личный кабинет...
                    </p>
                  </div>
                </div>
              </div>
            ) : step === 'email' ? (
              <form onSubmit={handleGetQuestion} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Icon name="Mail" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Введите email, который вы использовали при регистрации
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Icon name="ArrowRight" className="mr-2 h-4 w-4" />
                      Продолжить
                    </>
                  )}
                </Button>

                <div className="text-center text-sm">
                  <Link to="/login" className="text-primary hover:underline inline-flex items-center gap-1">
                    <Icon name="ArrowLeft" size={14} />
                    Вернуться ко входу
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900 mb-1">Секретный вопрос:</p>
                  <p className="text-sm text-blue-700">{securityQuestion}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="security_answer">Ваш ответ</Label>
                  <Input
                    id="security_answer"
                    type="text"
                    placeholder="Введите ответ"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">Новый пароль</Label>
                  <div className="relative">
                    <Icon name="Lock" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="new_password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10"
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
                  <Label htmlFor="confirm_password">Подтвердите пароль</Label>
                  <Input
                    id="confirm_password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                      Изменение...
                    </>
                  ) : (
                    <>
                      <Icon name="Check" className="mr-2 h-4 w-4" />
                      Изменить пароль
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setStep('email');
                    setSecurityAnswer('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                  Назад
                </Button>
              </form>
            )}

            {step !== 'success' && (
              <>
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}