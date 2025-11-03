import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CatalogFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onFilterTypeChange: (value: string) => void;
  filterSubject: string;
  onFilterSubjectChange: (value: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (value: string) => void;
  priceRange: string;
  onPriceRangeChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  categories: Category[];
  workTypes: string[];
  subjects: string[];
  totalResults: number;
  onResetFilters: () => void;
}

export default function CatalogFilters({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterSubject,
  onFilterSubjectChange,
  filterCategory,
  onFilterCategoryChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortByChange,
  categories,
  workTypes,
  subjects,
  totalResults,
  onResetFilters
}: CatalogFiltersProps) {
  const activeFiltersCount = [
    filterType !== 'all',
    filterSubject !== 'all',
    filterCategory !== 'all',
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
            onClick={onResetFilters}
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
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              <Icon name="FileText" size={14} className="inline mr-1" />
              Тип работы
            </label>
            <Select value={filterType} onValueChange={onFilterTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Все типы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                {workTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              <Icon name="BookOpen" size={14} className="inline mr-1" />
              Предмет
            </label>
            <Select value={filterSubject} onValueChange={onFilterSubjectChange}>
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
              <Icon name="Tag" size={14} className="inline mr-1" />
              Категория
            </label>
            <Select value={filterCategory} onValueChange={onFilterCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Все категории" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.slug} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              <Icon name="Coins" size={14} className="inline mr-1" />
              Цена
            </label>
            <Select value={priceRange} onValueChange={onPriceRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Любая цена" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Любая цена</SelectItem>
                <SelectItem value="0-300">До 300 ₽</SelectItem>
                <SelectItem value="300-600">300 - 600 ₽</SelectItem>
                <SelectItem value="600-1000">600 - 1000 ₽</SelectItem>
                <SelectItem value="1000+">От 1000 ₽</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              <Icon name="ArrowUpDown" size={14} className="inline mr-1" />
              Сортировка
            </label>
            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger>
                <SelectValue placeholder="По умолчанию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">По умолчанию</SelectItem>
                <SelectItem value="price-asc">Сначала дешевле</SelectItem>
                <SelectItem value="price-desc">Сначала дороже</SelectItem>
                <SelectItem value="rating">По рейтингу</SelectItem>
                <SelectItem value="popular">По популярности</SelectItem>
                <SelectItem value="new">Сначала новые</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Найдено работ: <span className="font-semibold text-gray-900">{totalResults}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
