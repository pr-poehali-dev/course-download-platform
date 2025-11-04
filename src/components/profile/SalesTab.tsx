import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import func2url from '../../../backend/func2url.json';

interface SalesTabProps {
  userId: number | null;
}

interface EarningItem {
  id: number;
  workTitle: string;
  saleAmount: number;
  authorShare: number;
  platformFee: number;
  createdAt: string;
}

interface WorkStats {
  id: number;
  title: string;
  price: number;
  totalSales: number;
  totalEarned: number;
}

interface SalesData {
  totalEarned: number;
  totalSales: number;
  earningsHistory: EarningItem[];
  workStats: WorkStats[];
}

export default function SalesTab({ userId }: SalesTabProps) {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadSalesData();
    }
  }, [userId]);

  const loadSalesData = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${func2url['get-author-earnings']}?author_id=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId.toString(),
          },
        }
      );

      if (!response.ok) {
        throw new Error('Не удалось загрузить данные о продажах');
      }

      const data = await response.json();
      setSalesData(data);
    } catch (err) {
      console.error('Error loading sales data:', err);
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
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

  if (!salesData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Нет данных для отображения</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего заработано</CardTitle>
            <Icon name="TrendingUp" size={20} className="text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{salesData.totalEarned}</div>
            <p className="text-xs text-muted-foreground mt-1">баллов от продаж</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего продаж</CardTitle>
            <Icon name="ShoppingCart" size={20} className="text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{salesData.totalSales}</div>
            <p className="text-xs text-muted-foreground mt-1">работ продано</p>
          </CardContent>
        </Card>
      </div>

      {salesData.workStats && salesData.workStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Статистика по работам</CardTitle>
            <CardDescription>Доходы от каждой работы</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.workStats.map((work) => (
                <div
                  key={work.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{work.title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Tag" size={14} />
                        {work.price} балл.
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="ShoppingBag" size={14} />
                        {work.totalSales} продаж
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{work.totalEarned}</p>
                    <p className="text-xs text-muted-foreground">заработано</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>История продаж</CardTitle>
          <CardDescription>Последние 50 транзакций</CardDescription>
        </CardHeader>
        <CardContent>
          {salesData.earningsHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Package" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Пока нет продаж</p>
              <p className="text-sm mt-2">Ваши работы появятся здесь после первой покупки</p>
            </div>
          ) : (
            <div className="space-y-3">
              {salesData.earningsHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="FileText" size={16} className="text-primary" />
                      <h4 className="font-medium">{item.workTitle}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-600">
                        +{item.authorShare} балл.
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Цена: {item.saleAmount} • Комиссия: {item.platformFee}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
