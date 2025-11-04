import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import func2url from '../../backend/func2url.json';

interface FinancesData {
  totalPurchases: number;
  totalRevenue: number;
  totalCommission: number;
  totalPaidToAuthors: number;
  totalUsers: number;
  totalWorks: number;
  topAuthors: Array<{
    username: string;
    email: string;
    totalEarned: number;
    salesCount: number;
  }>;
  salesByDay: Array<{
    date: string;
    salesCount: number;
    revenue: number;
  }>;
  topWorks: Array<{
    title: string;
    price: number;
    salesCount: number;
    totalRevenue: number;
  }>;
  recentTransactions: Array<{
    id: number;
    buyerName: string;
    authorName: string;
    workTitle: string;
    pricePaid: number;
    commission: number;
    createdAt: string;
  }>;
}

export default function PlatformFinances() {
  const [data, setData] = useState<FinancesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFinances();
  }, []);

  const loadFinances = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(func2url['platform-finances'], {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Не удалось загрузить финансовые данные');
      }

      const financesData = await response.json();
      setData(financesData);
    } catch (err) {
      console.error('Error loading finances:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-destructive">
            <Icon name="AlertCircle" size={24} />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Нет данных для отображения</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.salesByDay.slice().reverse().map(item => ({
    date: formatDate(item.date),
    Продажи: item.salesCount,
    Выручка: item.revenue,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего продаж</CardTitle>
            <Icon name="ShoppingCart" size={20} className="text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{data.totalPurchases}</div>
            <p className="text-xs text-muted-foreground mt-1">работ продано</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общая выручка</CardTitle>
            <Icon name="TrendingUp" size={20} className="text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{data.totalRevenue}</div>
            <p className="text-xs text-muted-foreground mt-1">баллов получено</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Комиссия платформы</CardTitle>
            <Icon name="Percent" size={20} className="text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{data.totalCommission}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.totalRevenue > 0 ? `${Math.round((data.totalCommission / data.totalRevenue) * 100)}%` : '0%'} от выручки
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выплачено авторам</CardTitle>
            <Icon name="Users" size={20} className="text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{data.totalPaidToAuthors}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.totalRevenue > 0 ? `${Math.round((data.totalPaidToAuthors / data.totalRevenue) * 100)}%` : '0%'} от выручки
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Продажи за последние 30 дней</CardTitle>
            <CardDescription>Количество продаж и выручка по дням</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="Продажи" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="Выручка" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="TrendingUp" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Нет данных о продажах за последние 30 дней</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Топ работ по продажам</CardTitle>
            <CardDescription>Самые популярные работы</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topWorks.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.topWorks.slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="title" type="category" width={150} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="salesCount" fill="#8b5cf6" name="Продаж" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Нет данных о продажах работ</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Топ авторов по заработку</CardTitle>
          <CardDescription>Авторы с наибольшим доходом</CardDescription>
        </CardHeader>
        <CardContent>
          {data.topAuthors.length > 0 ? (
            <div className="space-y-3">
              {data.topAuthors.map((author, index) => (
                <div
                  key={author.email}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{author.username}</h4>
                      <p className="text-sm text-muted-foreground">{author.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{author.totalEarned}</p>
                    <p className="text-xs text-muted-foreground">{author.salesCount} продаж</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Пока нет данных об авторах</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Последние транзакции</CardTitle>
          <CardDescription>Последние 50 покупок на платформе</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {data.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors text-sm"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="FileText" size={14} className="text-primary" />
                      <h4 className="font-medium">{transaction.workTitle}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Покупатель: {transaction.buyerName} • Автор: {transaction.authorName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(transaction.createdAt)}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="default" className="bg-blue-600">
                      {transaction.pricePaid} балл.
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Комиссия: {transaction.commission}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Package" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Пока нет транзакций</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
