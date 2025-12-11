import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface IncompletePurchase {
  purchase_id: number;
  buyer_id: number;
  username: string;
  work_id: number;
  work_title: string;
  price_paid: number;
  created_at: string;
}

interface IncompletePurchasesTabProps {
  loading: boolean;
  purchases: IncompletePurchase[];
  onCheck: () => void;
}

export default function IncompletePurchasesTab({
  loading,
  purchases,
  onCheck
}: IncompletePurchasesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Покупки без транзакций списания</CardTitle>
        <CardDescription>
          Покупки, которые завершены, но баллы не были списаны (исключая админов)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onCheck} disabled={loading} className="mb-4">
          <Icon name="Search" className="mr-2 h-4 w-4" />
          Проверить
        </Button>

        {purchases.length > 0 ? (
          <div className="space-y-2">
            {purchases.map((purchase) => (
              <Card key={purchase.purchase_id} className="border-orange-200 bg-orange-50">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">ID: {purchase.purchase_id}</Badge>
                        <span className="font-medium">{purchase.username}</span>
                      </div>
                      <p className="text-sm text-gray-600">{purchase.work_title}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Цена: {purchase.price_paid} б.</span>
                        <span>{new Date(purchase.created_at).toLocaleString('ru')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            {loading ? 'Загрузка...' : 'Нажмите "Проверить" для поиска проблем'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
