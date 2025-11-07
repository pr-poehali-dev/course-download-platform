import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface AdminLoginFormProps {
  adminEmail: string;
  adminPassword: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onLogin: () => void;
}

export default function AdminLoginForm({
  adminEmail,
  adminPassword,
  onEmailChange,
  onPasswordChange,
  onLogin
}: AdminLoginFormProps) {
  return (
    <div className="container max-w-md mx-auto py-24 px-4">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Shield" size={32} className="text-primary" />
          </div>
          <CardTitle>Админ-панель</CardTitle>
          <CardDescription>
            Статистика и управление платформой
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email администратора</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                value={adminEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onLogin()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Пароль</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Введите пароль"
                value={adminPassword}
                onChange={(e) => onPasswordChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onLogin()}
              />
            </div>
            <Button onClick={onLogin} className="w-full">
              <Icon name="LogIn" size={18} className="mr-2" />
              Войти
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
