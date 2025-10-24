import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState('week');

  const growthData = {
    users: { current: 1247, change: 12.5, trend: 'up' },
    works: { current: 856, change: 8.3, trend: 'up' },
    revenue: { current: 45230, change: 15.7, trend: 'up' },
    avgCheck: { current: 187, change: -3.2, trend: 'down' }
  };

  const categoryStats = [
    { name: 'Информатика', works: 234, sales: 1243, revenue: 23450, share: 28 },
    { name: 'Экономика', works: 189, sales: 987, revenue: 18900, share: 22 },
    { name: 'Менеджмент', works: 156, sales: 845, revenue: 16780, share: 19 },
    { name: 'Маркетинг', works: 142, sales: 756, revenue: 14230, share: 17 },
    { name: 'Другое', works: 135, sales: 623, revenue: 11870, share: 14 }
  ];

  const topSellers = [
    { name: 'Мария Петрова', sales: 45, revenue: 6750, rating: 4.9 },
    { name: 'Александр Иванов', sales: 38, revenue: 5700, rating: 4.8 },
    { name: 'Елена Козлова', sales: 32, revenue: 4800, rating: 4.7 },
    { name: 'Дмитрий Сидоров', sales: 28, revenue: 4200, rating: 4.6 }
  ];

  const activityData = [
    { day: 'Пн', users: 245, works: 34, sales: 67 },
    { day: 'Вт', users: 289, works: 41, sales: 78 },
    { day: 'Ср', users: 312, works: 38, sales: 82 },
    { day: 'Чт', users: 278, works: 45, sales: 71 },
    { day: 'Пт', users: 334, works: 52, sales: 89 },
    { day: 'Сб', users: 189, works: 28, sales: 43 },
    { day: 'Вс', users: 156, works: 21, sales: 38 }
  ];

  const maxActivity = Math.max(...activityData.map(d => d.users));

  const conversionFunnel = [
    { stage: 'Посетители', count: 5420, percentage: 100 },
    { stage: 'Регистрация', count: 1247, percentage: 23 },
    { stage: 'Просмотр работ', count: 894, percentage: 16.5 },
    { stage: 'Покупка', count: 456, percentage: 8.4 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Аналитика платформы</h2>
          <p className="text-muted-foreground">Детальная статистика и графики</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Пользователи</div>
              <Badge className="bg-green-500">
                <Icon name="TrendingUp" size={12} className="mr-1" />
                +{growthData.users.change}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{growthData.users.current}</div>
            <p className="text-xs text-muted-foreground mt-1">+{Math.round(growthData.users.current * growthData.users.change / 100)} за период</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Работ загружено</div>
              <Badge className="bg-green-500">
                <Icon name="TrendingUp" size={12} className="mr-1" />
                +{growthData.works.change}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{growthData.works.current}</div>
            <p className="text-xs text-muted-foreground mt-1">+{Math.round(growthData.works.current * growthData.works.change / 100)} за период</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Выручка</div>
              <Badge className="bg-green-500">
                <Icon name="TrendingUp" size={12} className="mr-1" />
                +{growthData.revenue.change}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{growthData.revenue.current}</div>
            <p className="text-xs text-muted-foreground mt-1">+{Math.round(growthData.revenue.current * growthData.revenue.change / 100)} за период</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Средний чек</div>
              <Badge variant="destructive">
                <Icon name="TrendingDown" size={12} className="mr-1" />
                {growthData.avgCheck.change}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{growthData.avgCheck.current}</div>
            <p className="text-xs text-muted-foreground mt-1">{Math.round(growthData.avgCheck.current * growthData.avgCheck.change / 100)} за период</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Активность по дням</CardTitle>
            <CardDescription>Пользователи, работы и продажи</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityData.map((day) => (
                <div key={day.day}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{day.day}</span>
                    <div className="text-xs text-muted-foreground flex gap-3">
                      <span className="flex items-center gap-1">
                        <Icon name="Users" size={12} />
                        {day.users}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="FileText" size={12} />
                        {day.works}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="ShoppingCart" size={12} />
                        {day.sales}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(day.users / maxActivity) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Воронка конверсии</CardTitle>
            <CardDescription>От посещения до покупки</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversionFunnel.map((stage, idx) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                        {idx + 1}
                      </div>
                      <span className="font-medium">{stage.stage}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{stage.count}</p>
                      <p className="text-xs text-muted-foreground">{stage.percentage}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary to-primary/60 h-3 rounded-full transition-all"
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Популярные категории</CardTitle>
            <CardDescription>Распределение по направлениям</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">{category.share}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${category.share}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="FileText" size={12} />
                      {category.works} работ
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="ShoppingCart" size={12} />
                      {category.sales} продаж
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Coins" size={12} />
                      {category.revenue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Топ продавцов</CardTitle>
            <CardDescription>Лучшие авторы по продажам</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellers.map((seller, idx) => (
                <div key={seller.name} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{seller.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="ShoppingCart" size={12} />
                        {seller.sales} продаж
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Star" size={12} className="fill-yellow-500 text-yellow-500" />
                        {seller.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{seller.revenue}</p>
                    <p className="text-xs text-muted-foreground">баллов</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
