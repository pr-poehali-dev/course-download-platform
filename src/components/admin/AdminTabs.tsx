import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

export default function AdminTabs() {
  return (
    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-10">
      <TabsTrigger value="finances">
        <Icon name="DollarSign" size={18} className="mr-2" />
        Финансы
      </TabsTrigger>
      <TabsTrigger value="analytics">
        <Icon name="BarChart3" size={18} className="mr-2" />
        Аналитика
      </TabsTrigger>
      <TabsTrigger value="moderation">
        <Icon name="CheckCircle" size={18} className="mr-2" />
        Модерация
      </TabsTrigger>
      <TabsTrigger value="works">
        <Icon name="FileText" size={18} className="mr-2" />
        Работы
      </TabsTrigger>
      <TabsTrigger value="users">
        <Icon name="Users" size={18} className="mr-2" />
        Пользователи
      </TabsTrigger>
      <TabsTrigger value="emails">
        <Icon name="Mail" size={18} className="mr-2" />
        Email
      </TabsTrigger>
      <TabsTrigger value="blog">
        <Icon name="BookOpen" size={18} className="mr-2" />
        Блог
      </TabsTrigger>
      <TabsTrigger value="sync">
        <Icon name="CloudDownload" size={18} className="mr-2" />
        Синхронизация
      </TabsTrigger>
      <TabsTrigger value="seo">
        <Icon name="Globe" size={18} className="mr-2" />
        SEO
      </TabsTrigger>
      <TabsTrigger value="support">
        <Icon name="MessageSquare" size={18} className="mr-2" />
        Тикеты
      </TabsTrigger>
    </TabsList>
  );
}