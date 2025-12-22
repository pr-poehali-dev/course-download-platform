import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../backend/func2url.json';
import UserStatsCard from './users/UserStatsCard';
import UserFiltersBar from './users/UserFiltersBar';
import UserCard from './users/UserCard';

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

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'registration' | 'activity' | 'balance' | 'purchases'>('activity');
  const [deletingFakeUsers, setDeletingFakeUsers] = useState(false);

  useEffect(() => {
    loadUsers();
    const interval = setInterval(() => {
      loadUsers(true);
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
      <UserStatsCard
        totalUsers={totalStats.totalUsers}
        activeUsers={totalStats.activeUsers}
        activeLastWeek={totalStats.activeLastWeek}
        totalBalance={totalStats.totalBalance}
        totalEarned={totalStats.totalEarned}
        onDeleteFakeUsers={handleDeleteFakeUsers}
        deletingFakeUsers={deletingFakeUsers}
      />

      <UserFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

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
                <UserCard
                  key={user.id}
                  user={user}
                  isActiveLastWeek={isActiveLastWeek}
                  onStatusChange={handleStatusChange}
                  onBalanceAdjustment={handleBalanceAdjustment}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
