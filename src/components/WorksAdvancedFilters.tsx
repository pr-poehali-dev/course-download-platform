import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FiltersState {
  search: string;
  category: string;
  status: string;
  priceMin: string;
  priceMax: string;
  sortBy: string;
}

interface WorksAdvancedFiltersProps {
  onFilterChange: (filters: FiltersState) => void;
  categories: string[];
}

export default function WorksAdvancedFilters({ onFilterChange, categories }: WorksAdvancedFiltersProps) {
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    category: 'all',
    status: 'all',
    priceMin: '',
    priceMax: '',
    sortBy: 'newest'
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FiltersState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: FiltersState = {
      search: '',
      category: 'all',
      status: 'all',
      priceMin: '',
      priceMax: '',
      sortBy: 'newest'
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.category !== 'all' ||
    filters.status !== 'all' ||
    filters.priceMin !== '' ||
    filters.priceMax !== '';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Фильтры и поиск</CardTitle>
            <CardDescription>
              Найдите нужные работы по параметрам
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="search">Поиск</Label>
            <div className="relative">
              <Icon 
                name="Search" 
                size={18} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
              />
              <Input
                id="search"
                placeholder="Поиск по названию..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-[180px]">
            <Label>Сортировка</Label>
            <Select value={filters.sortBy} onValueChange={(val) => updateFilter('sortBy', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Новые</SelectItem>
                <SelectItem value="oldest">Старые</SelectItem>
                <SelectItem value="price_asc">Цена ↑</SelectItem>
                <SelectItem value="price_desc">Цена ↓</SelectItem>
                <SelectItem value="popular">Популярные</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isExpanded && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Категория</Label>
                <Select value={filters.category} onValueChange={(val) => updateFilter('category', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Статус</Label>
                <Select value={filters.status} onValueChange={(val) => updateFilter('status', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="active">Активные</SelectItem>
                    <SelectItem value="moderation">На модерации</SelectItem>
                    <SelectItem value="blocked">Заблокированные</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="priceMin">Цена от</Label>
                  <Input
                    id="priceMin"
                    type="number"
                    placeholder="0"
                    value={filters.priceMin}
                    onChange={(e) => updateFilter('priceMin', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="priceMax">до</Label>
                  <Input
                    id="priceMax"
                    type="number"
                    placeholder="10000"
                    value={filters.priceMax}
                    onChange={(e) => updateFilter('priceMax', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <Button onClick={resetFilters} variant="outline" size="sm" className="w-full">
                <Icon name="X" size={16} className="mr-2" />
                Сбросить все фильтры
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
