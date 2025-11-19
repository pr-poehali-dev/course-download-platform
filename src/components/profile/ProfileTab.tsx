import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface ProfileTabProps {
  balance: number;
  editMode: boolean;
  editData: { username: string; email: string };
  username: string;
  email: string;
  onEditDataChange: (data: { username: string; email: string }) => void;
  onEditModeChange: (mode: boolean) => void;
  onSaveProfile: () => void;
  onLogout: () => void;
  onTopUpBalance?: () => void;
  onContactSupport?: () => void;
}

export default function ProfileTab({
  balance,
  editMode,
  editData,
  username,
  email,
  onEditDataChange,
  onEditModeChange,
  onSaveProfile,
  onLogout,
  onTopUpBalance,
  onContactSupport
}: ProfileTabProps) {
  return (
    <div className="space-y-6 pt-4">
      <Card>
        <CardHeader>
          <CardTitle>Баланс баллов</CardTitle>
          <CardDescription>Ваши доступные средства</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="Coins" size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{balance}</p>
                <p className="text-sm text-muted-foreground">баллов</p>
              </div>
            </div>
            <Button onClick={onTopUpBalance}>
              <Icon name="Plus" size={16} className="mr-2" />
              Пополнить
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Личные данные</CardTitle>
          <CardDescription>Управляйте информацией вашего профиля</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!editMode ? (
            <>
              <div>
                <Label>Имя пользователя</Label>
                <p className="text-lg font-medium mt-1">{username}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-lg font-medium mt-1">{email}</p>
              </div>
              <Button onClick={() => onEditModeChange(true)} variant="outline">
                <Icon name="Edit" size={16} className="mr-2" />
                Редактировать
              </Button>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="username">Имя пользователя</Label>
                <Input
                  id="username"
                  value={editData.username}
                  onChange={(e) => onEditDataChange({ ...editData, username: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => onEditDataChange({ ...editData, email: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={onSaveProfile}>
                  <Icon name="Check" size={16} className="mr-2" />
                  Сохранить
                </Button>
                <Button onClick={() => onEditModeChange(false)} variant="outline">
                  Отмена
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={onTopUpBalance} variant="outline" className="w-full justify-start">
            <Icon name="Wallet" size={16} className="mr-2" />
            Пополнить баланс
          </Button>
          <Button onClick={onContactSupport} variant="outline" className="w-full justify-start">
            <Icon name="MessageSquare" size={16} className="mr-2" />
            Связаться с поддержкой
          </Button>
        </CardContent>
      </Card>

      <Button onClick={onLogout} variant="destructive" className="w-full">
        <Icon name="LogOut" size={16} className="mr-2" />
        Выйти из аккаунта
      </Button>
    </div>
  );
}