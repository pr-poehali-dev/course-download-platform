import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Transaction {
  id: number;
  type: 'purchase' | 'sale' | 'refund' | 'bonus';
  user: string;
  amount: number;
  work?: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function FinanceManagement() {
  const [transactions] = useState<Transaction[]>([
    {
      id: 1,
      type: 'purchase',
      user: 'Александр Иванов',
      amount: -150,
      work: 'Курсовая по менеджменту',
      date: '2025-01-17 14:30',
      status: 'completed'
    },
    {
      id: 2,
      type: 'sale',
      user: 'Мария Петрова',
      amount: 200,
      work: 'Проектирование базы данных',
      date: '2025-01-17 12:15',
      status: 'completed'
    },
    {
      id: 3,
      type: 'purchase',
      user: 'Дмитрий Сидоров',
      amount: -100,
      work: 'Анализ финансовых показателей',
      date: '2025-01-16 18:45',
      status: 'completed'
    },
    {
      id: 4,
      type: 'bonus',
      user: 'Елена Козлова',
      amount: 500,
      date: '2025-01-16 10:00',
      status: 'completed'
    },
    {
      id: 5,
      type: 'refund',
      user: 'Иван Морозов',
      amount: 150,
      work: 'Разработка мобильного приложения',
      date: '2025-01-15 16:20',
      status: 'completed'
    },
    {
      id: 6,
      type: 'purchase',
      user: 'Александр Иванов',
      amount: -250,
      work: 'Дипломная работа по маркетингу',
      date: '2025-01-15 09:30',
      status: 'pending'
    }
  ]);

  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('week');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesType && matchesStatus;
  });

  const stats = {
    totalRevenue: transactions
      .filter(t => t.type === 'sale' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: Math.abs(transactions
      .filter(t => t.type === 'purchase' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)),
    totalRefunds: transactions
      .filter(t => t.type === 'refund' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    totalTransactions: transactions.length,
    pendingTransactions: transactions.filter(t => t.status === 'pending').length
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <Icon name="ShoppingCart" size={16} />;
      case 'sale':
        return <Icon name="TrendingUp" size={16} />;
      case 'refund':
        return <Icon name="RotateCcw" size={16} />;
      case 'bonus':
        return <Icon name="Gift" size={16} />;
      default:
        return <Icon name="Coins" size={16} />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'purchase':
        return <Badge variant="outline" className="text-red-600">Покупка</Badge>;
      case 'sale':
        return <Badge className="bg-green-500">Продажа</Badge>;
      case 'refund':
        return <Badge className="bg-yellow-500">Возврат</Badge>;
      case 'bonus':
        return <Badge className="bg-blue-500">Бонус</Badge>;
      default:
        return <Badge>Транзакция</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Завершена</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">В обработке</Badge>;
      case 'failed':
        return <Badge variant="destructive">Ошибка</Badge>;
      default:
        return <Badge>Неизвестно</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="gradient-green-yellow">
          <CardHeader className="pb-2">
            <div className="text-white/80 flex items-center gap-2 text-sm">
              <Icon name="TrendingUp" size={18} />
              Доход от продаж
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-1">{stats.totalRevenue}</div>
            <p className="text-sm text-white/80">баллов получено</p>
          </CardContent>
        </Card>

        <Card className="gradient-purple-pink">
          <CardHeader className="pb-2">
            <div className="text-white/80 flex items-center gap-2 text-sm">
              <Icon name="ShoppingCart" size={18} />
              Расходы на покупки
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-1">{stats.totalExpenses}</div>
            <p className="text-sm text-white/80">баллов потрачено</p>
          </CardContent>
        </Card>

        <Card className="gradient-orange-red">
          <CardHeader className="pb-2">
            <div className="text-white/80 flex items-center gap-2 text-sm">
              <Icon name="RotateCcw" size={18} />
              Возвраты
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-1">{stats.totalRefunds}</div>
            <p className="text-sm text-white/80">баллов возвращено</p>
          </CardContent>
        </Card>

        <Card className="gradient-blue-cyan">
          <CardHeader className="pb-2">
            <div className="text-white/80 flex items-center gap-2 text-sm">
              <Icon name="Activity" size={18} />
              Всего транзакций
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-1">{stats.totalTransactions}</div>
            <p className="text-sm text-white/80">{stats.pendingTransactions} в обработке</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Отчет по продажам</CardTitle>
          <CardDescription>Детальная статистика за выбранный период</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <Label>Период</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Сегодня</SelectItem>
                  <SelectItem value="week">Неделя</SelectItem>
                  <SelectItem value="month">Месяц</SelectItem>
                  <SelectItem value="year">Год</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Период</Label>
              <Button variant="outline" className="w-full">
                <Icon name="Download" size={16} className="mr-2" />
                Экспорт в Excel
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Период</Label>
              <Button variant="outline" className="w-full">
                <Icon name="FileText" size={16} className="mr-2" />
                Экспорт в PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Чистая прибыль</p>
              <p className="text-2xl font-bold text-green-600">
                +{stats.totalRevenue - stats.totalExpenses} баллов
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Средний чек</p>
              <p className="text-2xl font-bold">
                {Math.round(stats.totalRevenue / transactions.filter(t => t.type === 'sale').length)} баллов
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Конверсия</p>
              <p className="text-2xl font-bold">23.5%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Тип транзакции</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="purchase">Покупки</SelectItem>
                  <SelectItem value="sale">Продажи</SelectItem>
                  <SelectItem value="refund">Возвраты</SelectItem>
                  <SelectItem value="bonus">Бонусы</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="completed">Завершенные</SelectItem>
                  <SelectItem value="pending">В обработке</SelectItem>
                  <SelectItem value="failed">Ошибки</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>История транзакций ({filteredTransactions.length})</CardTitle>
          <CardDescription>Все финансовые операции на платформе</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {getTypeIcon(transaction.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{transaction.user}</h4>
                        {getTypeBadge(transaction.type)}
                        {getStatusBadge(transaction.status)}
                      </div>
                      {transaction.work && (
                        <p className="text-sm text-muted-foreground">{transaction.work}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        <Icon name="Clock" size={12} className="inline mr-1" />
                        {transaction.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-2xl font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </p>
                    <p className="text-sm text-muted-foreground">баллов</p>
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