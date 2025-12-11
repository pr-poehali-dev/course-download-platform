import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Work {
  id: number;
  title: string;
  description: string;
  preview_image_url?: string;
  cover_images?: string[];
  composition?: string;
  category: string;
  price_points: number;
  author?: string;
  downloads?: number;
  status?: 'active' | 'moderation' | 'blocked';
  yandex_disk_link?: string;
}

interface WorksTableProps {
  works: Work[];
  loading: boolean;
  onEdit: (work: Work) => void;
  onDelete: (workId: number) => void;
  onStatusChange: (workId: number, status: 'active' | 'moderation' | 'blocked') => void;
}

export default function WorksTable({
  works,
  loading,
  onEdit,
  onDelete,
  onStatusChange
}: WorksTableProps) {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Активна</Badge>;
      case 'moderation':
        return <Badge className="bg-yellow-500">На модерации</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Заблокирована</Badge>;
      default:
        return <Badge>Активна</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Список работ ({works.length})</CardTitle>
        <CardDescription>Управление загруженными работами</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Загрузка...</div>
        ) : works.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Работы не найдены
          </div>
        ) : (
          <div className="space-y-4">
            {works.map((work) => (
              <div key={work.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold truncate">{work.title}</h3>
                      {getStatusBadge(work.status)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {work.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Tag" size={14} />
                        {work.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Coins" size={14} />
                        {work.price_points} б.
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Download" size={14} />
                        {work.downloads || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="User" size={14} />
                        {work.author || 'Неизвестен'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select
                      value={work.status || 'active'}
                      onValueChange={(value) => onStatusChange(work.id, value as 'active' | 'moderation' | 'blocked')}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Активна</SelectItem>
                        <SelectItem value="moderation">На модерации</SelectItem>
                        <SelectItem value="blocked">Заблокирована</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(work)}
                    >
                      <Icon name="Pencil" size={16} />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDelete(work.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
