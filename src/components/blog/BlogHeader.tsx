import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface BlogHeaderProps {
  title: string;
  category: string;
  date: string;
  readTime: string;
}

export default function BlogHeader({ title, category, date, readTime }: BlogHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <Badge variant="secondary">{category}</Badge>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Icon name="Calendar" size={14} />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Clock" size={14} />
            {readTime}
          </span>
        </div>
      </div>
      
      <h1 className="text-5xl font-bold mb-6">{title}</h1>
    </div>
  );
}
