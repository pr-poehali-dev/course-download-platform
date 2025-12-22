import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface User {
  id: number;
  name: string;
  email: string;
  balance: number;
  totalUploads: number;
  totalPurchases: number;
  totalEarned: number;
  totalDownloads: number;
  favoriteCategories: string[];
  favoriteSubjects: string[];
  registrationDate: string;
  status: 'active' | 'blocked' | 'suspended';
  lastActivity: string;
}

interface UserCardProps {
  user: User;
  isActiveLastWeek: boolean;
  onStatusChange: (userId: number, newStatus: 'active' | 'blocked' | 'suspended') => void;
  onBalanceAdjustment: (userId: number, amount: number) => void;
}

export default function UserCard({
  user,
  isActiveLastWeek,
  onStatusChange,
  onBalanceAdjustment
}: UserCardProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Активен</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Заблокирован</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-500">Приостановлен</Badge>;
      default:
        return <Badge>Активен</Badge>;
    }
  };

  return (
    <div
      className={`p-5 rounded-lg border transition-all ${
        isActiveLastWeek ? 'bg-green-50/50 border-green-200' : 'bg-card'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold">{user.name}</h3>
            {getStatusBadge(user.status)}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Баланс</p>
              <p className="font-semibold flex items-center gap-1">
                <Icon name="Coins" size={14} />
                {user.balance}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Загрузок</p>
              <p className="font-semibold">{user.totalUploads}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Покупок</p>
              <p className="font-semibold">{user.totalPurchases}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Скачано</p>
              <p className="font-semibold flex items-center gap-1">
                <Icon name="Download" size={14} />
                {user.totalDownloads || 0}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Заработано</p>
              <p className="font-semibold">{user.totalEarned}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Регистрация</p>
              <p className="font-semibold">{new Date(user.registrationDate).toLocaleDateString('ru-RU')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Последняя активность</p>
              <p className="font-semibold text-xs">
                {user.lastActivity 
                  ? new Date(user.lastActivity).toLocaleDateString('ru-RU', { 
                      day: '2-digit', 
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Нет активности'}
              </p>
            </div>
          </div>
          
          {user.favoriteCategories && user.favoriteCategories.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-1">Предпочтения:</p>
              <div className="flex flex-wrap gap-1">
                {user.favoriteCategories.slice(0, 3).map((cat, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                <Icon name="Settings" size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Управление пользователем</DialogTitle>
                <DialogDescription>{user.name} ({user.email})</DialogDescription>
              </DialogHeader>
              {selectedUser && selectedUser.id === user.id && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Изменить статус</Label>
                    <Select 
                      value={user.status}
                      onValueChange={(value: any) => {
                        onStatusChange(user.id, value);
                        setSelectedUser(null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Активен</SelectItem>
                        <SelectItem value="suspended">Приостановить</SelectItem>
                        <SelectItem value="blocked">Заблокировать</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Начислить баллы</Label>
                    <Input
                      type="number"
                      placeholder="Введите сумму..."
                      id={`balance-input-${user.id}`}
                    />
                    <div className="flex gap-2">
                      <Button 
                        variant="default" 
                        className="flex-1"
                        onClick={() => {
                          const input = document.getElementById(`balance-input-${user.id}`) as HTMLInputElement;
                          const amount = parseInt(input?.value || '0');
                          if (amount > 0) {
                            onBalanceAdjustment(user.id, amount);
                            input.value = '';
                            setSelectedUser(null);
                          } else {
                            toast({
                              title: 'Ошибка',
                              description: 'Введите положительное число',
                              variant: 'destructive'
                            });
                          }
                        }}
                      >
                        <Icon name="Plus" size={16} className="mr-2" />
                        Начислить
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          const input = document.getElementById(`balance-input-${user.id}`) as HTMLInputElement;
                          const amount = parseInt(input?.value || '0');
                          if (amount > 0) {
                            onBalanceAdjustment(user.id, -amount);
                            input.value = '';
                            setSelectedUser(null);
                          } else {
                            toast({
                              title: 'Ошибка',
                              description: 'Введите положительное число',
                              variant: 'destructive'
                            });
                          }
                        }}
                      >
                        <Icon name="Minus" size={16} className="mr-2" />
                        Списать
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">История активности</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Последняя активность: {new Date(user.lastActivity).toLocaleDateString('ru-RU')}</p>
                      <p>Дата регистрации: {new Date(user.registrationDate).toLocaleDateString('ru-RU')}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Статистика использования</h4>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Всего скачиваний:</span>
                        <span className="font-medium">{user.totalDownloads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Всего покупок:</span>
                        <span className="font-medium">{user.totalPurchases}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Загружено работ:</span>
                        <span className="font-medium">{user.totalUploads}</span>
                      </div>
                    </div>
                  </div>

                  {user.favoriteCategories && user.favoriteCategories.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Предпочтения</h4>
                      <div className="text-sm space-y-2">
                        <div>
                          <span className="text-muted-foreground">Категории:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.favoriteCategories.map((cat, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {user.favoriteSubjects && user.favoriteSubjects.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">Предметы:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {user.favoriteSubjects.map((subj, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {subj}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Select 
            value={user.status} 
            onValueChange={(value: any) => onStatusChange(user.id, value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Активен</SelectItem>
              <SelectItem value="suspended">Приостановить</SelectItem>
              <SelectItem value="blocked">Заблокировать</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
