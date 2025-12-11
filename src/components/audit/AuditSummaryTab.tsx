import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AuditSummary {
  balance_discrepancies: number;
  incomplete_operations: number;
  orphaned_transactions: number;
  negative_balances: number;
  duplicate_transactions: number;
  total_issues: number;
}

interface AuditSummaryTabProps {
  loading: boolean;
  correcting: boolean;
  auditSummary: AuditSummary | null;
  onRunFullAudit: () => void;
  onAutoCorrect: () => void;
}

export default function AuditSummaryTab({
  loading,
  correcting,
  auditSummary,
  onRunFullAudit,
  onAutoCorrect
}: AuditSummaryTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Общая проверка системы</CardTitle>
          <CardDescription>Комплексная проверка всех компонентов системы баллов</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button onClick={onRunFullAudit} disabled={loading} className="flex-1">
              <Icon name="PlayCircle" className="mr-2 h-4 w-4" />
              {loading ? 'Проверка...' : 'Запустить полный аудит'}
            </Button>
            <Button 
              onClick={onAutoCorrect} 
              disabled={correcting || !auditSummary}
              variant="outline"
            >
              <Icon name="Wrench" className="mr-2 h-4 w-4" />
              {correcting ? 'Исправление...' : 'Автоисправление'}
            </Button>
          </div>

          {auditSummary && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <Card className={auditSummary.balance_discrepancies > 0 ? 'border-red-200 bg-red-50' : ''}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-center">
                    {auditSummary.balance_discrepancies}
                  </div>
                  <div className="text-sm text-gray-600 text-center mt-2">
                    Расхождения балансов
                  </div>
                </CardContent>
              </Card>

              <Card className={auditSummary.incomplete_operations > 0 ? 'border-orange-200 bg-orange-50' : ''}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-center">
                    {auditSummary.incomplete_operations}
                  </div>
                  <div className="text-sm text-gray-600 text-center mt-2">
                    Покупки без списания
                  </div>
                </CardContent>
              </Card>

              <Card className={auditSummary.negative_balances > 0 ? 'border-red-200 bg-red-50' : ''}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-center">
                    {auditSummary.negative_balances}
                  </div>
                  <div className="text-sm text-gray-600 text-center mt-2">
                    Отрицательные балансы
                  </div>
                </CardContent>
              </Card>

              <Card className={auditSummary.orphaned_transactions > 0 ? 'border-yellow-200 bg-yellow-50' : ''}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-center">
                    {auditSummary.orphaned_transactions}
                  </div>
                  <div className="text-sm text-gray-600 text-center mt-2">
                    Транзакции-сироты
                  </div>
                </CardContent>
              </Card>

              <Card className={auditSummary.duplicate_transactions > 0 ? 'border-yellow-200 bg-yellow-50' : ''}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-center">
                    {auditSummary.duplicate_transactions}
                  </div>
                  <div className="text-sm text-gray-600 text-center mt-2">
                    Дубликаты транзакций
                  </div>
                </CardContent>
              </Card>

              <Card className={auditSummary.total_issues === 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-center">
                    {auditSummary.total_issues}
                  </div>
                  <div className="text-sm text-gray-600 text-center mt-2">
                    Всего проблем
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SQL-запросы для ручной проверки</CardTitle>
          <CardDescription>Скопируйте и выполните эти запросы в админ-панели PostgreSQL</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. Покупки без списания баллов (за последние 30 дней):</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`SELECT 
  p.id, p.buyer_id, u.username, u.role, p.work_id, 
  w.title, p.price_paid, p.created_at
FROM t_p63326274_course_download_plat.purchases p
JOIN t_p63326274_course_download_plat.users u ON u.id = p.buyer_id
JOIN t_p63326274_course_download_plat.works w ON w.id = p.work_id
LEFT JOIN t_p63326274_course_download_plat.transactions t 
  ON t.user_id = p.buyer_id AND t.type = 'purchase'
  AND t.amount = -p.price_paid
  AND t.created_at BETWEEN p.created_at - INTERVAL '10 seconds' 
                       AND p.created_at + INTERVAL '10 seconds'
WHERE p.created_at >= NOW() - INTERVAL '30 days'
  AND u.role != 'admin'
GROUP BY p.id, p.buyer_id, u.username, u.role, p.work_id, 
         w.title, p.price_paid, p.created_at
HAVING COUNT(t.id) = 0;`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. Расхождения в балансах пользователей:</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`SELECT 
  u.id, u.username, u.balance as current_balance,
  COALESCE(SUM(CASE 
    WHEN t.type IN ('sale', 'bonus', 'refund', 'topup') THEN t.amount 
    WHEN t.type IN ('purchase', 'withdrawal') THEN -t.amount
    ELSE 0 END), 0) as calculated_balance,
  u.balance - COALESCE(SUM(CASE 
    WHEN t.type IN ('sale', 'bonus', 'refund', 'topup') THEN t.amount 
    WHEN t.type IN ('purchase', 'withdrawal') THEN -t.amount
    ELSE 0 END), 0) as difference
FROM t_p63326274_course_download_plat.users u
LEFT JOIN t_p63326274_course_download_plat.transactions t ON u.id = t.user_id
GROUP BY u.id, u.username, u.balance
HAVING ABS(u.balance - COALESCE(SUM(CASE 
  WHEN t.type IN ('sale', 'bonus', 'refund', 'topup') THEN t.amount 
  WHEN t.type IN ('purchase', 'withdrawal') THEN -t.amount
  ELSE 0 END), 0)) > 0.01;`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">3. Пользователи с отрицательным балансом:</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`SELECT id, username, email, balance, role, created_at
FROM t_p63326274_course_download_plat.users
WHERE balance < 0
ORDER BY balance ASC;`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
