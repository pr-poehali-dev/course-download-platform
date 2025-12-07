import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import AdminPanel from '@/components/AdminPanel';
import Breadcrumbs from '@/components/Breadcrumbs';
import SEO from '@/components/SEO';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Админ-панель" noindex={true} />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        <Button 
          variant="ghost" 
          className="mb-6"
          asChild
        >
          <Link to="/">
            <Icon name="Home" size={18} className="mr-2" />
            На главную
          </Link>
        </Button>
        
        <AdminPanel />
      </div>
    </div>
  );
}