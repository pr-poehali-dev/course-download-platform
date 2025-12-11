import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import { authService } from '@/lib/auth';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import AuditSummaryTab from '@/components/audit/AuditSummaryTab';
import IncompletePurchasesTab from '@/components/audit/IncompletePurchasesTab';
import BalanceDiscrepanciesTab from '@/components/audit/BalanceDiscrepanciesTab';
import UserAuditTab from '@/components/audit/UserAuditTab';

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

          <TabsContent value="summary">
            <AuditSummaryTab
              loading={loading}
              correcting={correcting}
              auditSummary={auditSummary}
              onRunFullAudit={runFullAudit}
              onAutoCorrect={autoCorrectIssues}
            />
          </TabsContent>

          <TabsContent value="incomplete">
            <IncompletePurchasesTab
              loading={loading}
              purchases={incompletePurchases}
              onCheck={checkIncompleteOperations}
            />
          </TabsContent>

          <TabsContent value="discrepancies">
            <BalanceDiscrepanciesTab
              loading={loading}
              discrepancies={discrepancies}
              onCheck={checkBalanceDiscrepancies}
            />
          </TabsContent>

          <TabsContent value="user">
            <UserAuditTab
              userId={userAuditId}
              onUserIdChange={setUserAuditId}
              loading={loadingUserAudit}
              userAudit={userAudit}
              onAudit={auditUser}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
