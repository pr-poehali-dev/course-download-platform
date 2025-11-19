import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  registrationDate: string;
  status: 'active' | 'blocked' | 'suspended';
  lastActivity: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'Александр Иванов',
      email: 'alex.ivanov@example.com',
      balance: 350,
      totalUploads: 8,
      totalPurchases: 15,
      totalEarned: 1200,
      registrationDate: '2024-01-15',
      status: 'active',
      lastActivity: '2024-10-20'
    },
    {
      id: 2,
      name: 'Мария Петрова',
      email: 'maria.petrova@example.com',
      balance: 150,
      totalUploads: 12,
      totalPurchases: 8,
      totalEarned: 1800,
      registrationDate: '2024-02-03',
      status: 'active',
      lastActivity: '2024-10-23'
    },
    {
      id: 3,
      name: 'Дмитрий Сидоров',
      email: 'dmitry.sidorov@example.com',
      balance: 0,
      totalUploads: 2,
      totalPurchases: 25,
      totalEarned: 300,
      registrationDate: '2024-03-12',
      status: 'active',
      lastActivity: '2024-10-22'
    },
    {
      id: 4,
      name: 'Елена Козлова',
      email: 'elena.kozlova@example.com',
      balance: 520,
      totalUploads: 15,
      totalPurchases: 5,
      totalEarned: 2250,
      registrationDate: '2024-01-28',
      status: 'active',
      lastActivity: '2024-10-24'
    },
    {
      id: 5,
      name: 'Иван Морозов',
      email: 'ivan.morozov@example.com',
      balance: 80,
      totalUploads: 1,
      totalPurchases: 3,
      totalEarned: 150,
      registrationDate: '2024-09-05',
      status: 'suspended',
      lastActivity: '2024-09-20'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleStatusChange = (userId: number, newStatus: 'active' | 'blocked' | 'suspended') => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, status: newStatus } : user
    );
    setUsers(updatedUsers);

    const statusTexts = {
      active: 'активирован',
      blocked: 'заблокирован',
      suspended: 'приостановлен'
    };

    toast({
      title: 'Статус изменен',
      description: `Пользователь ${statusTexts[newStatus]}`
    });
  };

  const handleBalanceAdjustment = (userId: number, amount: number) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, balance: user.balance + amount } : user
    );
    setUsers(updatedUsers);

    toast({
      title: 'Баланс обновлен',
      description: `${amount > 0 ? 'Начислено' : 'Списано'} ${Math.abs(amount)} баллов`
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

  const totalStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
    totalEarned: users.reduce((sum, u) => sum + u.totalEarned, 0)
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Users" size={18} />
              Всего пользователей
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="UserCheck" size={18} />
              Активных
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalStats.activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Wallet" size={18} />
              Общий баланс
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStats.totalBalance}</div>
            <p className="text-sm text-muted-foreground">баллов</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="TrendingUp" size={18} />
              Всего заработано
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStats.totalEarned}</div>
            <p className="text-sm text-muted-foreground">баллов</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Поиск по имени или email</Label>
              <Input
                placeholder="Введите имя или email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="suspended">Приостановленные</SelectItem>
                  <SelectItem value="blocked">Заблокированные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Список пользователей ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{user.name}</h3>
                      {getStatusBadge(user.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
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
                        <p className="text-muted-foreground">Заработано</p>
                        <p className="font-semibold">{user.totalEarned}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Регистрация</p>
                        <p className="font-semibold">{new Date(user.registrationDate).toLocaleDateString('ru-RU')}</p>
                      </div>
                    </div>
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
                                  handleStatusChange(user.id, value);
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
                                      handleBalanceAdjustment(user.id, amount);
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
                                      handleBalanceAdjustment(user.id, -amount);
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
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Select 
                      value={user.status} 
                      onValueChange={(value: any) => handleStatusChange(user.id, value)}
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}