import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface BlogNavigationProps {
  onBackClick: () => void;
}

export default function BlogNavigation({ onBackClick }: BlogNavigationProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Icon name="GraduationCap" size={32} className="text-primary" />
            <span className="text-2xl font-bold">StudHub</span>
          </Link>
          <Button onClick={onBackClick} variant="outline">
            <Icon name="Home" size={18} className="mr-2" />
            На главную
          </Button>
        </div>
      </div>
    </header>
  );
}
