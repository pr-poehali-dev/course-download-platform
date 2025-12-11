import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WorksFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  loading: boolean;
  onBulkApprove: () => void;
  onRemoveDuplicates: () => void;
}

export default function WorksFilters({
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  loading,
  onBulkApprove,
  onRemoveDuplicates
}: WorksFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Фильтры и поиск</CardTitle>
            <CardDescription>Найдите нужную работу для редактирования</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={onBulkApprove} disabled={loading} variant="outline" size="sm">
              Одобрить 100 работ
            </Button>
            <Button onClick={onRemoveDuplicates} disabled={loading} variant="outline" size="sm">
              Удалить дубликаты
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Поиск по названию</Label>
            <Input
              placeholder="Введите название работы..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Категория</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Все категории" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                <SelectItem value="Чертежи">Чертежи</SelectItem>
                <SelectItem value="3D-модели">3D-модели</SelectItem>
                <SelectItem value="Расчёты">Расчёты</SelectItem>
                <SelectItem value="Проекты">Проекты</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Статус</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активна</SelectItem>
                <SelectItem value="moderation">На модерации</SelectItem>
                <SelectItem value="blocked">Заблокирована</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
