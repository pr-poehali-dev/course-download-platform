import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface BalanceDiscrepancy {
  user_id: number;
  username: string;
  role: string;
  current_balance: number;
  calculated_balance: number;
  difference: number;
  total_transactions: number;
}

interface BalanceDiscrepanciesTabProps {
  loading: boolean;
  discrepancies: BalanceDiscrepancy[];
  onCheck: () => void;
}

export default function BalanceDiscrepanciesTab({
  loading,
  discrepancies,
  onCheck
}: BalanceDiscrepanciesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Расхождения в балансах</CardTitle>
        <CardDescription>
          Пользователи, у которых текущий баланс не совпадает с суммой транзакций
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onCheck} disabled={loading} className="mb-4">
          <Icon name="Search" className="mr-2 h-4 w-4" />
          Проверить
        </Button>

        {discrepancies.length > 0 ? (
          <div className="space-y-2">
            {discrepancies.map((disc) => (
              <Card key={disc.user_id} className="border-red-200 bg-red-50">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">ID: {disc.user_id}</Badge>
                      <span className="font-medium">{disc.username}</span>
                      <Badge>{disc.role}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Текущий баланс</div>
                        <div className="font-semibold">{disc.current_balance} б.</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Расчётный баланс</div>
                        <div className="font-semibold">{disc.calculated_balance} б.</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Разница</div>
                        <div className="font-semibold text-red-600">{disc.difference} б.</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Всего транзакций</div>
                        <div className="font-semibold">{disc.total_transactions}</div>
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
