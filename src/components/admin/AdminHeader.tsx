import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ThemeToggle } from '@/components/ThemeToggle';

interface AdminHeaderProps {
  onLogout: () => void;
}

export default function AdminHeader({ onLogout }: AdminHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Админ-панель</h1>
        <p className="text-muted-foreground">Статистика и аналитика платформы</p>
      </div>
      <div className="flex gap-2">
        <ThemeToggle />
        <Button onClick={onLogout} variant="outline">
          <Icon name="LogOut" size={18} className="mr-2" />
          Выйти
        </Button>
      </div>
    </div>
  );
}
