import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import WorkManager from '@/components/WorkManager';
import WorksManagement from '@/components/WorksManagement';
import UsersManagement from '@/components/UsersManagement';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import PlatformSettings from '@/components/PlatformSettings';
import SupportAdmin from '@/components/SupportAdmin';
import ModerationPanel from '@/components/ModerationPanel';
import PlatformFinances from '@/components/PlatformFinances';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabs from '@/components/admin/AdminTabs';
import SyncTab from '@/components/admin/SyncTab';
import BlogManagement from '@/components/admin/BlogManagement';
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
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
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
      setStats({
        totalWorks: 0,
        totalUsers: 0,
        totalPurchases: 0,
        totalRevenue: 0,
        popularWorks: []
      });
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

        <TabsContent value="blog" className="space-y-6">
          <BlogManagement />
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">SEO & Индексация</h3>
                  <p className="text-muted-foreground mt-1">Управление sitemap и SEO настройками</p>
                </div>
                <Icon name="Globe" size={32} className="text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <a 
                  href="/admin/sitemap" 
                  target="_blank"
                  className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <Icon name="FileText" size={24} className="text-blue-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Динамический Sitemap</h4>
                      <p className="text-sm text-gray-600">508 URL (20 статических + 488 работ)</p>
                    </div>
                  </div>
                  <Icon name="ExternalLink" size={20} className="text-gray-400 group-hover:text-blue-600" />
                </a>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Ссылка для Яндекс.Вебмастер:</h4>
                  <code className="text-sm bg-white px-3 py-2 rounded border block overflow-x-auto">
                    {func2url['sitemap']}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <SupportAdmin />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <PlatformSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}