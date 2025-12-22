import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserFiltersBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  sortBy: 'registration' | 'activity' | 'balance' | 'purchases';
  onSortByChange: (value: 'registration' | 'activity' | 'balance' | 'purchases') => void;
}

export default function UserFiltersBar({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  sortBy,
  onSortByChange
}: UserFiltersBarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Фильтры и поиск</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Поиск</Label>
            <div className="relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Имя или email..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-filter">Статус</Label>
            <Select value={filterStatus} onValueChange={onFilterStatusChange}>
              <SelectTrigger id="status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="suspended">Приостановленные</SelectItem>
                <SelectItem value="blocked">Заблокированные</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort-by">Сортировка</Label>
            <Select value={sortBy} onValueChange={(value: any) => onSortByChange(value)}>
              <SelectTrigger id="sort-by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activity">По активности</SelectItem>
                <SelectItem value="registration">По дате регистрации</SelectItem>
                <SelectItem value="balance">По балансу</SelectItem>
                <SelectItem value="purchases">По покупкам</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
