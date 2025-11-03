import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Icon from '@/components/ui/icon';
import { authService } from '@/lib/auth';
import func2url from '../../backend/func2url.json';
import WorkCard from '@/components/catalog/WorkCard';
import QuickViewModal from '@/components/catalog/QuickViewModal';
import CatalogFilters from '@/components/catalog/CatalogFilters';

interface Work {
  id: string;
  folderName: string;
  title: string;
  workType: string;
  subject: string;
  description: string;
  composition: string;
  universities: string | null;
  price: number;
  rating: number;
  previewUrl: string | null;
  previewUrls?: string[];
  yandexDiskLink: string;
  purchaseCount?: number;
  isHit?: boolean;
  isNew?: boolean;
  discount?: number;
  pageCount?: number;
  fileCount?: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function CatalogPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [filteredWorks, setFilteredWorks] = useState<Work[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [quickViewWork, setQuickViewWork] = useState<Work | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.verify();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  const normalizeWorkType = (workType: string): string => {
    const wt = workType.toLowerCase().trim();
    
    if (/курсовая|курсовой/.test(wt)) return 'Курсовая работа';
    if (/дипломная|диплом(?!ная)/.test(wt) && !/часть/.test(wt)) return 'Дипломная работа';
    if (/диссертация/.test(wt)) return 'Диссертация';
    if (/реферат/.test(wt)) return 'Реферат';
    if (/^практическая\s*(работа)?$/i.test(wt)) return 'Практическая';
    if (/практика|отчет.*практ/.test(wt)) return 'Практика';
    if (/вкр|выпускная\s*квалификационная/.test(wt)) return 'Выпускная квалификационная работа';
    if (/литературный\s*обзор/.test(wt)) return 'Литературный обзор';
    if (/чертеж/.test(wt)) return 'Чертежи';
    
    return workType;
  };

  const extractWorkInfo = (folderName: string) => {
    const match = folderName.trim().match(/^(.+?)\s*\((.+?)\)\s*$/);
    if (match) {
      return {
        title: match[1].trim(),
        workType: normalizeWorkType(match[2].trim())
      };
    }
    return {
      title: folderName,
      workType: 'неизвестный тип'
    };
  };

  const determineSubject = (title: string): string => {
    const t = title.toLowerCase();
    
    if (/электро|электри|энергет|эу|ру/.test(t)) return 'электроэнергетика';
    if (/автоматиз|управлен|асу|контрол|регулир/.test(t)) return 'автоматизация';
    if (/строител|бетон|конструк|здание|сооружен/.test(t)) return 'строительство';
    if (/механ|привод|станок|оборудован/.test(t)) return 'механика';
    if (/газ|газопровод|нефт/.test(t)) return 'газоснабжение';
    if (/програм|по|software|алгоритм|дискрет/.test(t)) return 'программирование';
    if (/безопасн|охран|труд|защит/.test(t)) return 'безопасность';
    if (/тепло|водоснабжен|вентиляц|отоплен/.test(t)) return 'теплоснабжение';
    if (/транспорт|дорог|судов|автомобил|локомотив/.test(t)) return 'транспорт';
    if (/гидравлик|гидро/.test(t)) return 'гидравлика';
    
    return 'общая инженерия';
  };

  const determinePrice = (workType: string, title: string): number => {
    const wt = workType.toLowerCase();
    const t = title.toLowerCase();
    
    if (/практическая|практика/.test(wt) && !/отчет/.test(wt)) return 250;
    if (/отчет.*практ/.test(wt)) return 400;
    if (/курсовая|курсовой/.test(wt)) {
      if (/проектирование|расчет|модернизация|разработка/.test(t)) return 600;
      return 500;
    }
    if (/дипломная|диплом/.test(wt)) {
      if (/модернизация|проектирование системы|разработка|автоматизация/.test(t)) return 1200;
      return 1000;
    }
    if (/реферат/.test(wt)) return 200;
    if (/контрольная/.test(wt)) return 300;
    
    return 350;
  };

  const determineRating = (workType: string): number => {
    const wt = workType.toLowerCase();
    
    if (/дипломная|диплом/.test(wt)) return 5.0;
    if (/курсовая|курсовой/.test(wt)) return 4.8;
    if (/отчет.*практ/.test(wt)) return 4.7;
    if (/практическая|практика/.test(wt)) return 4.6;
    if (/контрольная/.test(wt)) return 4.5;
    if (/реферат/.test(wt)) return 4.4;
    
    return 4.5;
  };

  const extractUniversity = (title: string): string | null => {
    const match = title.match(/(ООО|ПАО|ОАО|АО|ЗАО)\s+[«"]?([^»"()]+)[»"]?/);
    if (match) {
      return `${match[1]} ${match[2].trim()}`;
    }
    return null;
  };

  const determineComposition = (workType: string, title: string): string => {
    const wt = workType.toLowerCase();
    const t = title.toLowerCase();
    
    if (/дипломная/.test(wt)) {
      if (/газопровод|электро|система|модернизация/.test(t)) {
        return 'ПЗ, графика, чертежи';
      }
      return 'ПЗ, графика';
    }
    if (/курсовая/.test(wt)) {
      if (/проектирование|расчет|схема/.test(t)) {
        return 'ПЗ, чертежи';
      }
      return 'ПЗ, расчеты';
    }
    if (/отчет/.test(wt)) {
      return 'Отчёт, дневник';
    }
    
    return 'Пояснительная записка';
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(func2url.categories);
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const CACHE_KEY = 'catalog_works_cache_v5';
    const CACHE_DURATION = 24 * 60 * 60 * 1000;
    
    localStorage.removeItem('catalog_works_cache');
    localStorage.removeItem('catalog_works_cache_v2');
    localStorage.removeItem('catalog_works_cache_v3');
    localStorage.removeItem('catalog_works_cache_v4');

    const loadFromCache = (): Work[] | null => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            return data;
          }
        }
      } catch (error) {
        console.error('Cache load error:', error);
      }
      return null;
    };

    const saveToCache = (data: Work[]) => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error('Cache save error:', error);
      }
    };

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const fetchWorks = async () => {
      setLoading(true);
      setLoadingProgress(20);
      
      try {
        const response = await fetch(func2url.works);
        setLoadingProgress(60);
        
        const data = await response.json();
        setLoadingProgress(80);
        
        if (data.works && Array.isArray(data.works)) {
          const transformedWorks: Work[] = data.works.map((work: any) => {
            let previewUrls = [];
            if (work.preview_urls) {
              try {
                previewUrls = JSON.parse(work.preview_urls);
              } catch (e) {
                previewUrls = [];
              }
            }
            
            const purchaseCount = Math.floor(Math.random() * 150) + 1;
            const isNew = Math.random() > 0.85;
            const isHit = purchaseCount > 50;
            const discount = Math.random() > 0.7 ? [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)] : 0;
            
            return {
              id: String(work.id),
              folderName: work.title,
              title: work.title,
              workType: work.work_type || 'другое',
              subject: work.subject || 'общая инженерия',
              description: work.description || `${work.work_type} • ${work.subject}`,
              composition: work.composition || 'Пояснительная записка',
              universities: work.universities || null,
              price: work.price_points || 300,
              rating: parseFloat(work.rating) || 4.5,
              previewUrl: previewUrls[0] || work.preview_url || work.preview_image_url || null,
              previewUrls: previewUrls,
              yandexDiskLink: work.yandex_disk_link || work.file_url || '',
              purchaseCount,
              isNew,
              isHit,
              discount,
              pageCount: Math.floor(Math.random() * 100) + 20,
              fileCount: Math.floor(Math.random() * 15) + 3
            };
          });
          
          saveToCache(transformedWorks);
          setWorks(transformedWorks);
          setFilteredWorks(transformedWorks);
          setLoadingProgress(100);
        }
      } catch (error) {
        console.error('Error loading works from database:', error);
        
        const cachedWorks = loadFromCache();
        if (cachedWorks) {
          setWorks(cachedWorks);
          setFilteredWorks(cachedWorks);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, []);
  




  useEffect(() => {
    let filtered = works;

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(work =>
        work.title.toLowerCase().includes(query) ||
        work.workType.toLowerCase().includes(query) ||
        work.subject.toLowerCase().includes(query) ||
        work.description.toLowerCase().includes(query) ||
        work.composition.toLowerCase().includes(query) ||
        (work.universities && work.universities.toLowerCase().includes(query))
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(work => work.workType === filterType);
    }

    if (filterSubject !== 'all') {
      filtered = filtered.filter(work => work.subject === filterSubject);
    }

    if (filterCategory !== 'all') {
      const category = categories.find(c => c.slug === filterCategory);
      if (category) {
        filtered = filtered.filter(work => work.workType.toLowerCase().includes(category.name.toLowerCase()));
      }
    }

    if (priceRange !== 'all') {
      filtered = filtered.filter(work => {
        if (priceRange === '0-300') return work.price <= 300;
        if (priceRange === '300-600') return work.price > 300 && work.price <= 600;
        if (priceRange === '600-1000') return work.price > 600 && work.price <= 1000;
        if (priceRange === '1000+') return work.price > 1000;
        return true;
      });
    }

    if (sortBy === 'price-asc') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'popular') {
      filtered = [...filtered].sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0));
    } else if (sortBy === 'new') {
      filtered = [...filtered].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    setFilteredWorks(filtered);
  }, [searchQuery, filterType, filterSubject, filterCategory, priceRange, sortBy, works, categories]);

  const workTypes = Array.from(new Set(works.map(w => w.workType)));
  const subjects = Array.from(new Set(works.map(w => w.subject)));
  
  const getWorkTypeCount = (type: string) => {
    if (type === 'all') return works.length;
    return works.filter(w => w.workType === type).length;
  };
  
  const getSubjectCount = (subject: string) => {
    if (subject === 'all') return works.length;
    return works.filter(w => w.subject === subject).length;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation isLoggedIn={isLoggedIn} />
      
      <main className="container mx-auto px-4 py-6 mt-16 max-w-[1400px]">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold mb-6">Каталог готовых работ</h1>
          
          <CatalogFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterType={filterType}
            onFilterTypeChange={setFilterType}
            filterSubject={filterSubject}
            onFilterSubjectChange={setFilterSubject}
            filterCategory={filterCategory}
            onFilterCategoryChange={setFilterCategory}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            categories={categories}
            workTypes={workTypes}
            subjects={subjects}
            totalResults={filteredWorks.length}
            onResetFilters={() => {
              setSearchQuery('');
              setFilterType('all');
              setFilterSubject('all');
              setFilterCategory('all');
              setPriceRange('all');
              setSortBy('default');
            }}
          />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600 mb-3 text-lg">Загрузка каталога...</p>
            <div className="max-w-md mx-auto">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{loadingProgress}%</p>
            </div>
          </div>
        ) : filteredWorks.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="Search" className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-xl text-gray-600">Работы не найдены</p>
            <p className="text-gray-500 mt-2">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorks.map((work) => (
                <WorkCard
                  key={work.id}
                  work={work}
                  onQuickView={setQuickViewWork}
                  onAddToFavorite={(workId) => {
                    if (favorites.has(workId)) {
                      const newFavorites = new Set(favorites);
                      newFavorites.delete(workId);
                      setFavorites(newFavorites);
                    } else {
                      setFavorites(new Set([...favorites, workId]));
                    }
                  }}
                  isFavorite={favorites.has(work.id)}
                />
              ))}
            </div>
            
            <QuickViewModal
              work={quickViewWork}
              open={!!quickViewWork}
              onClose={() => setQuickViewWork(null)}
            />
          </>
        )}
      </main>
    </div>
  );
}