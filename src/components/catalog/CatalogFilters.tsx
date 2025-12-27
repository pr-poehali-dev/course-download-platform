import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { trackEvent, metrikaEvents } from '@/utils/metrika';

interface CatalogFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterSubject: string;
  onFilterSubjectChange: (value: string) => void;
  priceRange: string;
  onPriceRangeChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  subjects: string[];
  onResetFilters: () => void;
}

export default function CatalogFilters({
  searchQuery,
  onSearchChange,
  filterSubject,
  onFilterSubjectChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortByChange,
  subjects,
  onResetFilters
}: CatalogFiltersProps) {
  // ✅ Локальный стейт для мгновенного отображения в input
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // ✅ Debounce: обновляем родительский стейт с задержкой 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
      if (localSearch.length > 2) {
        trackEvent(metrikaEvents.CATALOG_SEARCH, { query: localSearch });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch]);

  // ✅ Синхронизируем при сбросе фильтров
  useEffect(() => {
    if (searchQuery === '') {
      setLocalSearch('');
    }
  }, [searchQuery]);

  const activeFiltersCount = [
    filterSubject !== 'all',
    priceRange !== 'all',
    searchQuery.length > 0
  ].filter(Boolean).length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="SlidersHorizontal" size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Фильтры</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount}</Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              onResetFilters();
              trackEvent(metrikaEvents.CATALOG_FILTER, { type: 'reset' });
            }}
            className="text-blue-600 hover:text-blue-700"
          >
            <Icon name="X" size={16} className="mr-1" />
            Сбросить
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Поиск по названию, предмету..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              <Icon name="BookOpen" size={14} className="inline mr-1" />
              Предметная область
            </label>
            <Select value={filterSubject} onValueChange={(value) => {
              onFilterSubjectChange(value);
              trackEvent(metrikaEvents.CATALOG_FILTER, { type: 'subject', value });
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Все предметы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все предметы</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              <Icon name="Coins" size={14} className="inline mr-1" />
              Баллы
            </label>
            <Select value={priceRange} onValueChange={(value) => {
              onPriceRangeChange(value);
              trackEvent(metrikaEvents.CATALOG_FILTER, { type: 'price', value });
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Любые баллы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Любые баллы</SelectItem>
                <SelectItem value="0-250">До 250 б.</SelectItem>
                <SelectItem value="250-700">250 - 700 б.</SelectItem>
                <SelectItem value="700-1600">700 - 1600 б.</SelectItem>
                <SelectItem value="1600+">От 1600 б.</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              <Icon name="ArrowUpDown" size={14} className="inline mr-1" />
              Сортировка
            </label>
            <Select value={sortBy} onValueChange={(value) => {
              onSortByChange(value);
              trackEvent(metrikaEvents.CATALOG_FILTER, { type: 'sort', value });
            }}>
              <SelectTrigger>
                <SelectValue placeholder="По умолчанию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">По умолчанию</SelectItem>
                <SelectItem value="price-asc">Сначала дешевле</SelectItem>
                <SelectItem value="price-desc">Сначала дороже</SelectItem>
                <SelectItem value="rating">По рейтингу</SelectItem>
                <SelectItem value="new">Сначала новые</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}