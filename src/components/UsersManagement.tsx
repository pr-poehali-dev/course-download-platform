import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../backend/func2url.json';
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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'registration' | 'activity' | 'balance' | 'purchases'>('activity');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deletingFakeUsers, setDeletingFakeUsers] = useState(false);

  useEffect(() => {
    loadUsers();
    // Автообновление списка каждые 30 секунд
    const interval = setInterval(() => {
      loadUsers();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUsers = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch(`${func2url['user-data']}?action=all_users`, {
        headers: {
          'X-Admin-Email': 'rekrutiw@yandex.ru'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data.users || []);
      
      if (!silent) {
        toast({
          title: 'Пользователи загружены',
          description: `Найдено ${data.users?.length || 0} пользователей`
        });
      }
    } catch (error: any) {
      console.error('Failed to load users:', error);
      if (!silent) {
        toast({
          title: 'Ошибка загрузки',
          description: error.message,
          variant: 'destructive'
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleDeleteFakeUsers = async () => {
    if (!confirm('Удалить всех тестовых пользователей с @fake.local? Это действие нельзя отменить!')) {
      return;
    }

    setDeletingFakeUsers(true);
    try {
      const response = await fetch(`${func2url['user-data']}?action=delete_fake_users`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Email': 'rekrutiw@yandex.ru'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно удалено',
          description: data.message
        });
        await loadUsers();
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка удаления',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setDeletingFakeUsers(false);
    }
  };

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

  const handleBalanceAdjustment = async (userId: number, amount: number) => {
    try {
      const response = await fetch(func2url['user-data'], {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': 'rekrutiw@yandex.ru'
        },
        body: JSON.stringify({
          user_id: userId,
          amount: amount
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const updatedUsers = users.map(user =>
          user.id === userId ? { ...user, balance: user.balance + amount } : user
        );
        setUsers(updatedUsers);
        
        toast({
          title: 'Баланс обновлен',
          description: `${amount > 0 ? 'Начислено' : 'Списано'} ${Math.abs(amount)} баллов`
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'activity':
        if (!a.lastActivity) return 1;
        if (!b.lastActivity) return -1;
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      case 'registration':
        return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
      case 'balance':
        return b.balance - a.balance;
      case 'purchases':
        return b.totalPurchases - a.totalPurchases;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Icon name="Loader2" size={48} className="mx-auto text-muted-foreground mb-4 animate-spin" />
            <p className="text-muted-foreground">Загрузка пользователей...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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

  // Проверяем активность за последние 7 дней
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const activeLastWeek = users.filter(u => {
    if (!u.lastActivity) return false;
    const lastActivity = new Date(u.lastActivity);
    return lastActivity >= sevenDaysAgo;
  }).length;

  const totalStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    activeLastWeek: activeLastWeek,
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
    totalEarned: users.reduce((sum, u) => sum + u.totalEarned, 0)
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Icon name="Activity" size={24} className="text-blue-600" />
            Статистика активности пользователей
          </CardTitle>
          <CardDescription>Реальные зарегистрированные пользователи (без тестовых аккаунтов)</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Users" size={18} />
              Всего пользователей
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">реальных аккаунтов</p>
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
            <p className="text-xs text-muted-foreground mt-1">со статусом "Активен"</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Zap" size={18} className="text-green-600" />
              Активны за неделю
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalStats.activeLastWeek}</div>
            <p className="text-xs text-muted-foreground mt-1">действия за 7 дней</p>
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
            <div className="text-3xl font-bold">{totalStats.totalBalance.toLocaleString()}</div>
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
            <div className="text-3xl font-bold">{totalStats.totalEarned.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">баллов</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Фильтры</CardTitle>
            <CardDescription>Автообновление каждые 30 секунд</CardDescription>
          </div>
          <Button 
            variant="destructive" 
            onClick={handleDeleteFakeUsers}
            disabled={deletingFakeUsers}
          >
            {deletingFakeUsers ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Удаление...
              </>
            ) : (
              <>
                <Icon name="Trash2" size={16} className="mr-2" />
                Удалить тестовых
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="space-y-2">
              <Label>Сортировка</Label>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activity">По активности (новые первыми)</SelectItem>
                  <SelectItem value="registration">По регистрации (новые первыми)</SelectItem>
                  <SelectItem value="balance">По балансу (больше первыми)</SelectItem>
                  <SelectItem value="purchases">По покупкам (больше первыми)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Список пользователей ({filteredUsers.length})</span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-normal">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Активны за неделю</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const isActiveLastWeek = user.lastActivity 
                ? new Date(user.lastActivity) >= sevenDaysAgo 
                : false;
              
              return (
              <div key={user.id} className={`border rounded-lg p-4 transition-all ${isActiveLastWeek ? 'border-green-300 bg-green-50/30' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isActiveLastWeek && (
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Активен за последние 7 дней" />
                      )}
                      <h3 className="font-semibold">{user.name}</h3>
                      {getStatusBadge(user.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
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
            );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}