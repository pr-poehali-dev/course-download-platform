import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

interface PurchasesTabProps {
  purchases: any[];
}

export default function PurchasesTab({ purchases }: PurchasesTabProps) {
  return (
    <div className="space-y-4 pt-4">
      <Card>
        <CardHeader>
          <CardTitle>История покупок</CardTitle>
          <CardDescription>Все приобретённые работы</CardDescription>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="ShoppingBag" size={48} className="mx-auto mb-4 opacity-50" />
              <p>У вас пока нет покупок</p>
              <Link to="/catalog">
                <Button className="mt-4">Перейти в каталог</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {purchases.map((purchase, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium">{purchase.title || 'Без названия'}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{purchase.workType || 'Работа'}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(purchase.purchasedAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold">{purchase.price} баллов</p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/work/${purchase.workId}`}>
                        <Icon name="Download" size={16} className="mr-2" />
                        Скачать
                      </Link>
                    </Button>
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
