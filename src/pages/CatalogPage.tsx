import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Icon from '@/components/ui/icon';
import { authService } from '@/lib/auth';
import func2url from '../../backend/func2url.json';
import QuickViewModal from '@/components/catalog/QuickViewModal';
import CatalogFilters from '@/components/catalog/CatalogFilters';
import PreviewCarousel from '@/components/PreviewCarousel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const navigate = useNavigate();
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

  const normalizeWorkType = (workType: string, title: string = ''): string => {
    const wt = workType.toLowerCase().trim();
    const t = title.toLowerCase().trim();
    
    if (/курсовая|курсовой/.test(wt) || /курсовая|курсовой/.test(t)) return 'Курсовая работа';
    if ((/дипломная|диплом/.test(wt) && !/часть/.test(wt)) || /дипломная|дипломной/.test(t)) return 'Дипломная работа';
    if (/диссертация/.test(wt) || /диссертация/.test(t)) return 'Диссертация';
    if (/реферат/.test(wt) || /реферат/.test(t)) return 'Реферат';
    if (/практическая|практика|отчет/.test(wt) || /практика|отчет/.test(t)) return 'Практика';
    if (/вкр|выпускная\s*квалификационная|аттестационная/.test(wt) || /вкр|выпускная\s*квалификационная/.test(t)) return 'Выпускная квалификационная работа';
    if (/литературный\s*обзор/.test(wt) || /литературный\s*обзор/.test(t)) return 'Литературный обзор';
    if (/чертеж/.test(wt) || /чертеж/.test(t)) return 'Чертежи';
    if (/контрольная/.test(wt) || /контрольная/.test(t)) return 'Контрольная работа';
    if (/лабораторная/.test(wt) || /лабораторная/.test(t)) return 'Лабораторная работа';
    if (/расчетно-графическая/.test(wt) || /расчетно-графическая/.test(t)) return 'Расчетно-графическая работа';
    
    return 'Техническая работа';
  };

  const extractWorkInfo = (folderName: string) => {
    const match = folderName.trim().match(/^(.+?)\s*\((.+?)\)\s*$/);
    if (match) {
      return {
        title: match[1].trim(),
        workType: normalizeWorkType(match[2].trim(), match[1].trim())
      };
    }
    return {
      title: folderName,
      workType: normalizeWorkType('', folderName)
    };
  };

  const determineSubject = (title: string, apiSubject?: string): string => {
    if (apiSubject && apiSubject !== 'coursework' && apiSubject !== 'thesis' && apiSubject !== 'unknown') {
      return apiSubject;
    }
    
    const t = title.toLowerCase();
    
    if (/электро|электри|энергет|эу|ру/.test(t)) return 'Электроэнергетика';
    if (/автоматиз|управлен|асу|контрол|регулир/.test(t)) return 'Автоматизация';
    if (/строител|бетон|конструк|здание|сооружен/.test(t)) return 'Строительство';
    if (/механ|привод|станок|оборудован|экскаватор/.test(t)) return 'Механика';
    if (/газ|газопровод|нефт/.test(t)) return 'Газоснабжение';
    if (/програм|по|алгоритм|дискрет/.test(t)) return 'Программирование';
    if (/безопасн|охран|труд|защит/.test(t)) return 'Безопасность';
    if (/тепло|водоснабжен|вентиляц|отоплен/.test(t)) return 'Теплоснабжение';
    if (/транспорт|дорог|судов|автомобил|локомотив|комбайн/.test(t)) return 'Транспорт';
    if (/гидравлик|гидро/.test(t)) return 'Гидравлика';
    
    return 'Общая инженерия';
  };

  const determinePrice = (workType: string, title: string): number => {
    const wt = workType.toLowerCase();
    
    if (/диссертация/.test(wt)) return 3000;
    if (/дипломная|диплом|вкр|выпускная/.test(wt)) return 1500;
    if (/курсовая/.test(wt)) return 600;
    if (/практика|отчет|реферат|контрольная|лабораторная|расчетно-графическая/.test(wt)) return 200;
    
    return 600;
  };

  const determineRating = (workType: string): number => {
    const wt = workType.toLowerCase();
    
    if (/дипломная|диплом/.test(wt)) return 5.0;
    if (/курсовая|курсовой/.test(wt)) return 4.9;
    if (/отчет.*практ/.test(wt)) return 4.8;
    if (/практическая|практика/.test(wt)) return 4.7;
    if (/контрольная/.test(wt)) return 4.7;
    if (/реферат/.test(wt)) return 4.7;
    
    return 4.8;
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
    const CACHE_KEY = 'catalog_works_cache_v8';
    const CACHE_DURATION = 24 * 60 * 60 * 1000;
    
    localStorage.removeItem('catalog_works_cache');
    localStorage.removeItem('catalog_works_cache_v2');
    localStorage.removeItem('catalog_works_cache_v3');
    localStorage.removeItem('catalog_works_cache_v4');
    localStorage.removeItem('catalog_works_cache_v5');
    localStorage.removeItem('catalog_works_cache_v6');
    localStorage.removeItem('catalog_works_cache_v7');

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
            
            const isNew = Math.random() > 0.85;
            const discount = Math.random() > 0.75 ? [10, 15, 20, 25][Math.floor(Math.random() * 4)] : 0;
            
            const workInfo = extractWorkInfo(work.title);
            const workType = work.work_type ? normalizeWorkType(work.work_type, work.title) : workInfo.workType;
            const rating = work.rating && work.rating > 0 ? parseFloat(String(work.rating)) : determineRating(workType);
            const finalRating = rating < 4.7 ? 4.7 : rating;
            
            return {
              id: String(work.id),
              folderName: work.title,
              title: work.title,
              workType: workType,
              subject: determineSubject(work.title, work.subject),
              description: work.preview || `Готовая работа по теме "${work.title}". Включает теоретическую часть, практические расчеты и выводы.`,
              composition: determineComposition(workType, work.title),
              universities: extractUniversity(work.title),
              price: determinePrice(workType, work.title),
              rating: finalRating,
              previewUrl: previewUrls[0] || work.preview_image_url || null,
              previewUrls: previewUrls,
              yandexDiskLink: work.file_url || '',
              isNew,
              isHit: false,
              discount,
              pageCount: work.page_count || 0,
              fileCount: work.file_count || 0
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

    if (filterSubject !== 'all') {
      filtered = filtered.filter(work => work.subject.toLowerCase() === filterSubject.toLowerCase());
    }

    if (priceRange !== 'all') {
      filtered = filtered.filter(work => {
        if (priceRange === '0-300') return work.price <= 300;
        if (priceRange === '300-800') return work.price > 300 && work.price <= 800;
        if (priceRange === '800-2000') return work.price > 800 && work.price <= 2000;
        if (priceRange === '2000+') return work.price > 2000;
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
  }, [searchQuery, filterSubject, priceRange, sortBy, works]);

  const subjects = Array.from(new Set(works.map(w => w.subject)));

  return (
    <div className="min-h-screen bg-white">
      <Navigation isLoggedIn={isLoggedIn} />
      
      <main className="container mx-auto px-4 py-6 mt-16 max-w-[1400px]">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold mb-6">Каталог готовых работ</h1>
          
          <CatalogFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterSubject={filterSubject}
            onFilterSubjectChange={setFilterSubject}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            subjects={subjects}
            onResetFilters={() => {
              setSearchQuery('');
              setFilterSubject('all');
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
            <TooltipProvider>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredWorks.map((work) => (
                <Link
                  key={work.id}
                  to={`/work/${work.id}`}
                  className="group bg-white rounded-lg md:rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 block"
                >
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/3] overflow-hidden">
                    {work.previewUrl || (work.previewUrls && work.previewUrls.length > 0) ? (
                      <>
                        <img 
                          src={work.previewUrl || work.previewUrls?.[0] || ''} 
                          alt={work.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </>
                    ) : (
                      <div className="w-full h-full relative">
                        <img 
                          src="https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/e0139de0-3660-402a-8d29-d07f5dac95b3.jpg"
                          alt={work.workType}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-4">
                          <span className="text-sm font-semibold text-white drop-shadow-lg">{work.workType}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-2 pointer-events-none">
                      {work.discount && (
                        <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                          −{work.discount}%
                        </div>
                      )}
                      {work.isNew && (
                        <Badge className="bg-green-500 text-white shadow-lg">
                          <Icon name="Sparkles" size={12} className="mr-1" />
                          Новинка
                        </Badge>
                      )}
                      {work.isHit && (
                        <Badge className="bg-orange-500 text-white shadow-lg">
                          <Icon name="Flame" size={12} className="mr-1" />
                          Хит
                        </Badge>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setQuickViewWork(work);
                      }}
                      className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 z-10 pointer-events-auto"
                    >
                      <Icon name="Eye" size={20} className="text-blue-600" />
                    </button>
                  </div>

                  <div className="p-4 md:p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold text-gray-700">{work.rating.toFixed(1)}</span>
                      </div>
                      <Badge variant="outline" className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                        {work.workType}
                      </Badge>
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h3 className="font-bold text-sm md:text-[15px] mb-2 line-clamp-2 leading-snug min-h-[42px] group-hover:text-primary transition-colors cursor-help">
                          {work.title.charAt(0).toUpperCase() + work.title.slice(1)}
                        </h3>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p>{work.title.charAt(0).toUpperCase() + work.title.slice(1)}</p>
                      </TooltipContent>
                    </Tooltip>

                    <p className="text-xs text-gray-600 line-clamp-2 mb-3 min-h-[32px] leading-relaxed">
                      {work.description}
                    </p>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Icon name="Package" size={14} className="text-blue-600" />
                        <span className="line-clamp-1">{work.composition}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Icon name="Tag" size={14} className="text-purple-600" />
                        <span className="font-medium">{work.subject}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div>
                        {work.discount ? (
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-400 line-through">{work.price} б.</span>
                            <div className="flex flex-col">
                              <span className="text-xl font-bold text-green-600">{Math.round(work.price * (1 - work.discount / 100))} б.</span>
                              <span className="text-xs text-gray-500">({Math.round(work.price * (1 - work.discount / 100)) * 5}₽)</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-xl font-bold text-gray-900">{work.price} б.</span>
                            <span className="text-xs text-gray-500">({work.price * 5}₽)</span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-blue-600 flex items-center gap-1.5">
                        <Icon name="ArrowRight" size={16} />
                        Подробнее
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              </div>
            </TooltipProvider>
            
            <QuickViewModal
              work={quickViewWork}
              open={!!quickViewWork}
              onClose={() => setQuickViewWork(null)}
            />
        )}
      </main>
    </div>
  );
}