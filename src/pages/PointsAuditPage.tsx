import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import Navigation from '@/components/Navigation';
import { authService } from '@/lib/auth';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuditSummary {
  balance_discrepancies: number;
  incomplete_operations: number;
  orphaned_transactions: number;
  negative_balances: number;
  duplicate_transactions: number;
  total_issues: number;
}

interface BalanceDiscrepancy {
  user_id: number;
  username: string;
  role: string;
  current_balance: number;
  calculated_balance: number;
  difference: number;
  total_transactions: number;
}

interface IncompletePurchase {
  purchase_id: number;
  buyer_id: number;
  username: string;
  work_id: number;
  work_title: string;
  price_paid: number;
  created_at: string;
}

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

export default function PointsAuditPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);
  const [discrepancies, setDiscrepancies] = useState<BalanceDiscrepancy[]>([]);
  const [incompletePurchases, setIncompletePurchases] = useState<IncompletePurchase[]>([]);
  const [userAuditId, setUserAuditId] = useState('');
  const [userAudit, setUserAudit] = useState<UserAudit | null>(null);
  const [loadingUserAudit, setLoadingUserAudit] = useState(false);
  const [correcting, setCorrecting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.verify();
      if (!user || user.role !== 'admin') {
        navigate('/');
        return;
      }
      setIsAdmin(true);
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const runFullAudit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/audit-points?action=full-audit`);
      
      if (!response.ok) {
        // Если функция не существует, показываем инструкцию по запуску SQL-запросов
        toast({
          title: '⚠️ Функция аудита не развёрнута',
          description: 'Используйте SQL-запросы ниже для проверки баллов',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      setAuditSummary(data.summary);
      
      toast({
        title: data.status === 'healthy' ? '✅ Проблем не найдено' : '⚠️ Найдены проблемы',
        description: `Всего проблем: ${data.summary.total_issues}`,
      });
    } catch (error) {
      console.error('Audit error:', error);
      toast({
        title: 'Ошибка аудита',
        description: 'Не удалось выполнить проверку. Используйте SQL-запросы ниже.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIncompleteOperations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/audit-points?action=incomplete-operations`);
      const data = await response.json();
      setIncompletePurchases(data);
      
      toast({
        title: 'Проверка завершена',
        description: `Найдено покупок без списания: ${data.length}`,
      });
    } catch (error) {
      console.error('Check error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить проверку',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkBalanceDiscrepancies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/audit-points?action=balance-discrepancies`);
      const data = await response.json();
      setDiscrepancies(data);
      
      toast({
        title: 'Проверка завершена',
        description: `Найдено расхождений в балансах: ${data.length}`,
      });
    } catch (error) {
      console.error('Check error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить проверку',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const auditUser = async () => {
    if (!userAuditId) return;
    
    setLoadingUserAudit(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/api/audit-points?action=user-audit&user_id=${userAuditId}`
      );
      const data = await response.json();
      setUserAudit(data);
      
      if (data.summary.balance_match) {
        toast({
          title: '✅ Баланс корректен',
          description: `У пользователя ${data.user.username} нет проблем с балансом`,
        });
      } else {
        toast({
          title: '⚠️ Найдено расхождение',
          description: `Разница: ${data.summary.difference} баллов`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('User audit error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось проверить пользователя',
        variant: 'destructive',
      });
    } finally {
      setLoadingUserAudit(false);
    }
  };

  const autoCorrectIssues = async () => {
    if (!confirm('Автоматически создать недостающие транзакции списания? Это НЕ изменит текущий баланс пользователей.')) {
      return;
    }
    
    setCorrecting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/audit-points?action=auto-correct`);
      const data = await response.json();
      
      toast({
        title: '✅ Автокоррекция завершена',
        description: `Исправлено: ${data.corrections_made} из ${data.total_issues}`,
      });
      
      // Обновить данные после коррекции
      await runFullAudit();
    } catch (error) {
      console.error('Auto-correct error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить автокоррекцию',
        variant: 'destructive',
      });
    } finally {
      setCorrecting(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Аудит системы баллов</h1>
          <p className="text-gray-600">Проверка корректности списания и начисления баллов</p>
        </div>

        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Сводка</TabsTrigger>
            <TabsTrigger value="incomplete">Покупки без списания</TabsTrigger>
            <TabsTrigger value="discrepancies">Расхождения балансов</TabsTrigger>
            <TabsTrigger value="user">Проверка пользователя</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Общая проверка системы</CardTitle>
                <CardDescription>Комплексная проверка всех компонентов системы баллов</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button onClick={runFullAudit} disabled={loading} className="flex-1">
                    <Icon name="PlayCircle" className="mr-2 h-4 w-4" />
                    {loading ? 'Проверка...' : 'Запустить полный аудит'}
                  </Button>
                  <Button 
                    onClick={autoCorrectIssues} 
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
          </TabsContent>

          <TabsContent value="incomplete" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Покупки без транзакций списания</CardTitle>
                <CardDescription>
                  Покупки, которые завершены, но баллы не были списаны (исключая админов)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={checkIncompleteOperations} disabled={loading} className="mb-4">
                  <Icon name="Search" className="mr-2 h-4 w-4" />
                  Проверить
                </Button>

                {incompletePurchases.length > 0 ? (
                  <div className="space-y-2">
                    {incompletePurchases.map((purchase) => (
                      <Card key={purchase.purchase_id} className="border-orange-200">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold">{purchase.work_title}</div>
                              <div className="text-sm text-gray-600">
                                Покупатель: {purchase.username} (ID: {purchase.buyer_id})
                              </div>
                              <div className="text-sm text-gray-600">
                                Дата: {new Date(purchase.created_at).toLocaleString('ru-RU')}
                              </div>
                            </div>
                            <Badge variant="destructive">{purchase.price_paid} баллов</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    {loading ? 'Загрузка...' : 'Нет покупок без списания баллов'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discrepancies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Расхождения в балансах</CardTitle>
                <CardDescription>
                  Пользователи, у которых текущий баланс не соответствует истории транзакций
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={checkBalanceDiscrepancies} disabled={loading} className="mb-4">
                  <Icon name="Search" className="mr-2 h-4 w-4" />
                  Проверить
                </Button>

                {discrepancies.length > 0 ? (
                  <div className="space-y-2">
                    {discrepancies.map((disc) => (
                      <Card key={disc.user_id} className="border-red-200">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold">{disc.username}</div>
                              <div className="text-sm text-gray-600">
                                Роль: {disc.role} | Транзакций: {disc.total_transactions}
                              </div>
                              <div className="text-sm mt-2">
                                <span className="text-gray-600">Текущий:</span>{' '}
                                <span className="font-semibold">{disc.current_balance}</span> →{' '}
                                <span className="text-gray-600">Рассчитанный:</span>{' '}
                                <span className="font-semibold">{disc.calculated_balance}</span>
                              </div>
                            </div>
                            <Badge variant="destructive">
                              Разница: {disc.difference.toFixed(2)}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    {loading ? 'Загрузка...' : 'Расхождений не найдено'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Проверка конкретного пользователя</CardTitle>
                <CardDescription>Детальная диагностика баллов пользователя</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 mb-4">
                  <Input
                    type="number"
                    placeholder="ID пользователя"
                    value={userAuditId}
                    onChange={(e) => setUserAuditId(e.target.value)}
                  />
                  <Button onClick={auditUser} disabled={loadingUserAudit || !userAuditId}>
                    <Icon name="Search" className="mr-2 h-4 w-4" />
                    Проверить
                  </Button>
                </div>

                {userAudit && (
                  <div className="space-y-4">
                    <Card className={userAudit.summary.balance_match ? 'border-green-200' : 'border-red-200'}>
                      <CardHeader>
                        <CardTitle className="text-lg">{userAudit.user.username}</CardTitle>
                        <CardDescription>{userAudit.user.email} | Роль: {userAudit.user.role}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-gray-600">Текущий баланс</div>
                            <div className="text-2xl font-bold">{userAudit.summary.current_balance}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Рассчитанный</div>
                            <div className="text-2xl font-bold">{userAudit.summary.calculated_balance}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Всего начислено</div>
                            <div className="text-xl font-bold text-green-600">
                              +{userAudit.summary.total_accrual}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Всего списано</div>
                            <div className="text-xl font-bold text-red-600">
                              -{userAudit.summary.total_deduction}
                            </div>
                          </div>
                        </div>

                        {!userAudit.summary.balance_match && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                            <div className="font-semibold text-red-900">
                              Обнаружено расхождение: {userAudit.summary.difference.toFixed(2)} баллов
                            </div>
                          </div>
                        )}

                        {userAudit.summary.purchases_without_deduction > 0 && (
                          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
                            <div className="font-semibold text-orange-900">
                              Покупок без списания баллов: {userAudit.summary.purchases_without_deduction}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
