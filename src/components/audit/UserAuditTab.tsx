import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface UserAudit {
  user: {
    id: number;
    username: string;
    email: string;
    current_balance: number;
    role: string;
  };
  summary: {
    current_balance: number;
    calculated_balance: number;
    balance_match: boolean;
    difference: number;
    total_accrual: number;
    total_deduction: number;
    total_transactions: number;
    total_purchases: number;
    purchases_without_deduction: number;
  };
  issues: {
    purchases_without_transactions: any[];
  };
}

interface UserAuditTabProps {
  userId: string;
  onUserIdChange: (value: string) => void;
  loading: boolean;
  userAudit: UserAudit | null;
  onAudit: () => void;
}

export default function UserAuditTab({
  userId,
  onUserIdChange,
  loading,
  userAudit,
  onAudit
}: UserAuditTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Проверка пользователя</CardTitle>
          <CardDescription>Детальный аудит баланса и транзакций конкретного пользователя</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              type="number"
              placeholder="ID пользователя"
              value={userId}
              onChange={(e) => onUserIdChange(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={onAudit} disabled={loading || !userId}>
              <Icon name="Search" className="mr-2 h-4 w-4" />
              {loading ? 'Проверка...' : 'Проверить'}
            </Button>
          </div>

          {userAudit && (
            <div className="space-y-4">
              <Card className={userAudit.summary.balance_match ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{userAudit.user.username}</h3>
                        <p className="text-sm text-gray-600">{userAudit.user.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge>{userAudit.user.role}</Badge>
                        {userAudit.summary.balance_match ? (
                          <Badge className="bg-green-500">✓ Баланс корректен</Badge>
                        ) : (
                          <Badge variant="destructive">⚠ Расхождение</Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                      <div>
                        <div className="text-sm text-gray-600">Текущий баланс</div>
                        <div className="text-lg font-semibold">{userAudit.summary.current_balance} б.</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Расчётный баланс</div>
                        <div className="text-lg font-semibold">{userAudit.summary.calculated_balance} б.</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Разница</div>
                        <div className={`text-lg font-semibold ${userAudit.summary.difference !== 0 ? 'text-red-600' : ''}`}>
                          {userAudit.summary.difference} б.
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Всего транзакций</div>
                        <div className="text-lg font-semibold">{userAudit.summary.total_transactions}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                      <div>
                        <div className="text-sm text-gray-600">Начислено</div>
                        <div className="text-lg font-semibold text-green-600">
                          +{userAudit.summary.total_accrual} б.
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Списано</div>
                        <div className="text-lg font-semibold text-red-600">
                          -{userAudit.summary.total_deduction} б.
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Покупок</div>
                        <div className="text-lg font-semibold">{userAudit.summary.total_purchases}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Без списания</div>
                        <div className="text-lg font-semibold text-orange-600">
                          {userAudit.summary.purchases_without_deduction}
                        </div>
                      </div>
                    </div>

                    {userAudit.issues.purchases_without_transactions.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-2 text-red-600">
                          ⚠ Покупки без списания баллов:
                        </h4>
                        <div className="space-y-2">
                          {userAudit.issues.purchases_without_transactions.map((issue: any, idx: number) => (
                            <div key={idx} className="bg-white p-3 rounded border border-red-200">
                              <div className="text-sm">
                                <div className="font-medium">{issue.work_title}</div>
                                <div className="text-gray-600">
                                  Покупка #{issue.purchase_id} • Цена: {issue.price_paid} б. • 
                                  {new Date(issue.created_at).toLocaleString('ru')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
