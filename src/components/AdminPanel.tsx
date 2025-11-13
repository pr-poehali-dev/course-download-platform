import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import WorkManager from '@/components/WorkManager';
import WorksManagement from '@/components/WorksManagement';
import UsersManagement from '@/components/UsersManagement';
import FinanceManagement from '@/components/FinanceManagement';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import PlatformSettings from '@/components/PlatformSettings';
import SupportAdmin from '@/components/SupportAdmin';
import ModerationPanel from '@/components/ModerationPanel';
import PlatformFinances from '@/components/PlatformFinances';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabs from '@/components/admin/AdminTabs';
import SyncTab from '@/components/admin/SyncTab';
import func2url from '../../backend/func2url.json';

const ADMIN_EMAIL = 'admin@techforma.pro';
const ADMIN_PASSWORD = 'TF2025!SecureAdmin#Pass$9876';

interface StatData {
  totalWorks: number;
  totalUsers: number;
  totalPurchases: number;
  totalRevenue: number;
  popularWorks: Array<{
    id: number;
    title: string;
    purchases: number;
    revenue: number;
  }>;
}

export default function AdminPanel() {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_authenticated') === 'true';
  });
  const [stats, setStats] = useState<StatData>({
    totalWorks: 0,
    totalUsers: 0,
    totalPurchases: 0,
    totalRevenue: 0,
    popularWorks: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(func2url.works);
      const data = await response.json();
      
      if (data.works) {
        const totalWorks = data.works.length;
        const totalRevenue = data.works.reduce((sum: number, w: any) => sum + (w.price || w.price_points || 0), 0);
        
        setStats({
          totalWorks,
          totalUsers: 0,
          totalPurchases: 0,
          totalRevenue,
          popularWorks: data.works.slice(0, 5).map((w: any, idx: number) => ({
            id: w.id || idx,
            title: w.title,
            purchases: 0,
            revenue: w.price || w.price_points || 0
          }))
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (adminEmail === ADMIN_EMAIL && adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      
      const adminUser = {
        id: 999999,
        username: 'admin',
        email: ADMIN_EMAIL,
        balance: 999999999,
        referral_code: 'ADMIN',
        role: 'admin'
      };
      localStorage.setItem('user', JSON.stringify(adminUser));
      
      toast({
        title: 'Вход выполнен',
        description: 'Добро пожаловать в админ-панель'
      });
    } else {
      toast({
        title: 'Ошибка доступа',
        description: 'Неверный email или пароль',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('user');
    toast({
      title: 'Выход выполнен',
      description: 'Вы вышли из админ-панели'
    });
  };

  if (!isAuthenticated) {
    return (
      <AdminLoginForm
        adminEmail={adminEmail}
        adminPassword={adminPassword}
        onEmailChange={setAdminEmail}
        onPasswordChange={setAdminPassword}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <AdminHeader onLogout={handleLogout} />

      <Tabs defaultValue="finances" className="space-y-6">
        <AdminTabs />

        <TabsContent value="finances" className="space-y-6">
          <PlatformFinances />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <ModerationPanel />
        </TabsContent>

        <TabsContent value="works" className="space-y-6">
          <WorksManagement />
          <WorkManager adminEmail={ADMIN_EMAIL} />
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <SyncTab />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UsersManagement />
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <SupportAdmin />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <FinanceManagement />
          <PlatformSettings />
        </TabsContent>

        <TabsContent value="seller-stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="gradient-green-yellow">
              <CardHeader className="pb-2">
                <div className="text-white/80 flex items-center gap-2 text-sm">
                  <Icon name="FileText" size={18} />
                  Загружено работ
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-1">12</div>
                <p className="text-sm text-white/80">В каталоге</p>
              </CardContent>
            </Card>

            <Card className="gradient-purple-pink">
              <CardHeader className="pb-2">
                <div className="text-white/80 flex items-center gap-2 text-sm">
                  <Icon name="Download" size={18} />
                  Продано работ
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-1">48</div>
                <p className="text-sm text-white/80">Всего скачиваний</p>
              </CardContent>
            </Card>

            <Card className="gradient-orange-red">
              <CardHeader className="pb-2">
                <div className="text-white/80 flex items-center gap-2 text-sm">
                  <Icon name="Coins" size={18} />
                  Баланс
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-1">4,800</div>
                <p className="text-sm text-white/80">баллов заработано</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}