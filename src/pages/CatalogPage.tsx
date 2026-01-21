import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { authService } from '@/lib/auth';
import func2url from '../../backend/func2url.json';
import QuickViewModal from '@/components/catalog/QuickViewModal';
import Breadcrumbs from '@/components/Breadcrumbs';
import CatalogFilters from '@/components/catalog/CatalogFilters';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import ExitIntentModal from '@/components/ExitIntentModal';
import { getUserDiscount } from '@/utils/discount';
import { trackEvent, metrikaEvents } from '@/utils/metrika';
import { useScrollTracking } from '@/hooks/useScrollTracking';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import CatalogLoadingState from '@/components/catalog/CatalogLoadingState';
import CatalogWorkCard from '@/components/catalog/CatalogWorkCard';


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
  yandexDiskLink: string | null;
  purchaseCount?: number;
  isHit?: boolean;
  isNew?: boolean;
  discount?: number;
  pageCount?: number;
  fileCount?: number;
  authorId?: number | null;
  views?: number;
  downloads?: number;
  reviewsCount?: number;
}

export default function CatalogPage() {
  useScrollTracking();
  
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const navigate = useNavigate();
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [quickViewWork, setQuickViewWork] = useState<Work | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [userBalance, setUserBalance] = useState(0);
  const userDiscount = getUserDiscount(userBalance);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const ITEMS_PER_PAGE = 24;

  // Отладка: смотрим текущую страницу
  useEffect(() => {
    console.log('📄 Текущая страница:', currentPage, 'URL params:', searchParams.toString());
  }, [currentPage, searchParams]);

  useEffect(() => {
    trackEvent(metrikaEvents.CATALOG_OPEN);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      // Сначала проверяем localStorage на случай если backend недоступен
      const cachedUserStr = localStorage.getItem('user');
      const cachedUser = cachedUserStr ? JSON.parse(cachedUserStr) : null;
      
      // Пытаемся получить свежие данные
      const freshUser = await authService.verify();
      
      // Используем свежие данные если есть, иначе кэш
      const currentUser = freshUser || cachedUser;
      
      setIsLoggedIn(!!currentUser);
      setIsAdmin(currentUser?.role === 'admin');
      
      if (currentUser) {
        setUserId(currentUser.id);
        setUserBalance(currentUser.balance || 0);
        loadFavorites(currentUser.id);
        
        // Обновляем кэш если получили свежие данные
        if (freshUser) {
          localStorage.setItem('user', JSON.stringify(freshUser));
        }
      }
    };
    checkAuth();
  }, []);

  const loadFavorites = async (userId: number) => {
    try {
      const response = await fetch(`${func2url['user-data']}?user_id=${userId}&action=favorites`);
      const data = await response.json();
      if (data.favorites) {
        const favoriteIds = new Set(data.favorites.map((f: any) => String(f.work_id || f.id)));
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  // ✅ Мемоизируем callback для избежания лишних ререндеров карточек
  const toggleFavorite = useCallback(async (workId: string) => {
    if (!userId) {
      alert('Войдите в систему для добавления в избранное');
      return;
    }

    try {
      const response = await fetch(func2url['toggle-favorite'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, work_id: parseInt(workId) })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          if (data.action === 'added') {
            newFavorites.add(workId);
          } else {
            newFavorites.delete(workId);
          }
          return newFavorites;
        });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, [userId]);

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

  const determineRating = (workType: string): number => {
    const wt = workType.toLowerCase();
    
    if (/диссертация/.test(wt)) return 5.0;
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

  const determineComposition = (workType: string, title: string, hasRealCover: boolean): string => {
    const wt = workType.toLowerCase();
    const t = title.toLowerCase();
    
    if (/диссертация/.test(wt)) {
      return 'Диссертация, автореферат, презентация, раздаточный материал';
    }
    if (/дипломная/.test(wt)) {
      if (hasRealCover || /газопровод|электро|система|модернизация/.test(t)) {
        return 'ПЗ, графика, чертежи';
      }
      return 'ПЗ, презентация';
    }
    if (/курсовая/.test(wt)) {
      if (hasRealCover || /расчет|проект|модернизация/.test(t)) {
        return 'ПЗ, чертежи';
      }
      return 'Пояснительная записка';
    }
    if (/отчет.*практ|практическая/.test(wt)) {
      return 'Отчёт, дневник, характеристика';
    }
    if (/реферат/.test(wt)) {
      return 'Реферат';
    }
    if (/контрольная/.test(wt)) {
      return 'Решение задач';
    }
    
    return 'Документация, материалы';
  };

  const determinePrice = (workType: string): number => {
    const wt = workType.toLowerCase();
    
    if (/диссертация/.test(wt)) return 400;
    if (/дипломная|диплом/.test(wt)) return 350;
    if (/курсовая|курсовой/.test(wt)) return 280;
    if (/отчет.*практ/.test(wt)) return 200;
    if (/практическая|практика/.test(wt)) return 180;
    if (/контрольная/.test(wt)) return 150;
    if (/реферат/.test(wt)) return 120;
    if (/вкр/.test(wt)) return 350;
    
    return 250;
  };

  useEffect(() => {
    const loadWorks = async () => {
      setLoading(true);
      setLoadingProgress(10);
      
      try {
        // ✅ Пробуем загрузить из кеша для мгновенного отображения
        const cachedWorks = localStorage.getItem('catalog_cache');
        const cacheTime = localStorage.getItem('catalog_cache_time');
        const now = Date.now();
        
        // Если кеш свежий (меньше 5 минут), показываем его сразу
        if (cachedWorks && cacheTime && (now - parseInt(cacheTime) < 5 * 60 * 1000)) {
          setWorks(JSON.parse(cachedWorks));
          setLoading(false);
          setLoadingProgress(0);
        }
        
        const response = await fetch(func2url.works);
        setLoadingProgress(40);
        
        const data = await response.json();
        setLoadingProgress(60);
        
        if (data.works) {
          const processedWorks: Work[] = data.works.map((work: any) => {
            const { title, workType } = extractWorkInfo(work.title || work.folder_name);
            const hasRealCover = work.preview_image_url && !work.preview_image_url.includes('e0139de0-3660-402a-8d29-d07f5dac95b3.jpg');
            
            return {
              id: String(work.id),
              folderName: work.folder_name || work.title,
              title: title,
              workType: workType,
              subject: determineSubject(title, work.category),
              description: work.description || `${workType} по предмету "${determineSubject(title, work.category)}"`,
              composition: work.composition || determineComposition(workType, title, hasRealCover),
              universities: extractUniversity(title),
              price: work.price_points || determinePrice(workType),
              rating: determineRating(workType),
              previewUrl: work.preview_image_url || null,
              previewUrls: work.cover_images || [],
              yandexDiskLink: work.yandex_disk_link || null,
              purchaseCount: work.downloads || 0,
              isHit: false,
              isNew: false,
              discount: 0,
              authorId: work.author_id || null
            };
          });
          
          setWorks(processedWorks);
          
          // ✅ Сохраняем в кеш для следующего визита
          localStorage.setItem('catalog_cache', JSON.stringify(processedWorks));
          localStorage.setItem('catalog_cache_time', Date.now().toString());
        }
        
        setLoadingProgress(100);
      } catch (error) {
        console.error('Failed to load works:', error);
      } finally {
        setTimeout(() => {
          setLoading(false);
          setLoadingProgress(0);
        }, 300);
      }
    };

    loadWorks();
  }, []);

  // ✅ Восстанавливаем позицию скролла при возврате из работы
  useEffect(() => {
    const savedPosition = sessionStorage.getItem('catalog_scroll_position');
    if (savedPosition && !loading) {
      // Даём время на рендер, затем скроллим
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition));
        // Удаляем сохранённую позицию
        sessionStorage.removeItem('catalog_scroll_position');
      }, 100);
    } else if (!loading) {
      // При смене страницы через URL скроллим вверх
      window.scrollTo(0, 0);
    }
  }, [loading, currentPage]);

  // ✅ Оптимизированная фильтрация с useMemo для мгновенного поиска
  const filteredWorks = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    
    let filtered = works;

    // Фильтр по поиску
    if (searchQuery) {
      filtered = filtered.filter(w => {
        const titleMatch = w.title.toLowerCase().includes(searchLower);
        const descMatch = w.description.toLowerCase().includes(searchLower);
        const subjectMatch = w.subject.toLowerCase().includes(searchLower);
        return titleMatch || descMatch || subjectMatch;
      });
    }

    // Фильтр по предмету
    if (filterSubject && filterSubject !== 'all') {
      filtered = filtered.filter(w => w.subject === filterSubject);
    }

    // Фильтр по цене
    if (priceRange && priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      if (max) {
        filtered = filtered.filter(w => w.price >= min && w.price <= max);
      } else {
        filtered = filtered.filter(w => w.price >= min);
      }
    }

    // Сортировка
    if (sortBy === 'price-asc') {
      return [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      return [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      return [...filtered].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'popular') {
      return [...filtered].sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0));
    } else if (sortBy === 'new') {
      return [...filtered].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return filtered;
  }, [searchQuery, filterSubject, priceRange, sortBy, works]);

  // ✅ Мемоизируем список предметов
  const subjects = useMemo(() => Array.from(new Set(works.map(w => w.subject))), [works]);

  // Обработчики фильтров с автосбросом страницы
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setSearchParams({});
  }, [setSearchParams]);

  const handleFilterSubjectChange = useCallback((value: string) => {
    setFilterSubject(value);
    setSearchParams({});
  }, [setSearchParams]);

  const handlePriceRangeChange = useCallback((value: string) => {
    setPriceRange(value);
    setSearchParams({});
  }, [setSearchParams]);

  const handleSortByChange = useCallback((value: string) => {
    setSortBy(value);
    setSearchParams({});
  }, [setSearchParams]);

  // ✅ Пагинация для быстрой загрузки (показываем только 24 работы за раз)
  const paginatedWorks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredWorks.slice(startIndex, endIndex);
  }, [filteredWorks, currentPage, ITEMS_PER_PAGE]);

  const totalPages = Math.ceil(filteredWorks.length / ITEMS_PER_PAGE);

  // Проверяем, что текущая страница не превышает максимальную
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setSearchParams({});
    }
  }, [totalPages, currentPage, setSearchParams]);

  const getCategoryTitle = () => {
    if (filterSubject && filterSubject !== 'all') {
      return `${filterSubject} — купить готовые работы от 200₽`;
    }
    if (searchQuery) {
      return `Поиск: "${searchQuery}" — готовые работы от 200₽`;
    }
    return 'Каталог курсовых работ и дипломов от 200₽ — готовые работы';
  };

  const getCategoryDescription = () => {
    if (filterSubject && filterSubject !== 'all') {
      return `Готовые работы по предмету "${filterSubject}". Скачайте курсовые, дипломы, рефераты мгновенно после оплаты. Гарантия уникальности 95%.`;
    }
    if (searchQuery) {
      return `Результаты поиска "${searchQuery}". ${filteredWorks.length} работ найдено. Мгновенное скачивание после оплаты.`;
    }
    return 'Купить курсовые работы и дипломы в каталоге. 500+ готовых студенческих работ по всем предметам от 200₽. Гарантия уникальности 95%, мгновенное скачивание после оплаты';
  };

  // ✅ Мемоизируем JSON-LD схему - пересчитывается только при изменении работ
  const jsonLdSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Главная',
            'item': 'https://techforma.pro/'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Каталог работ',
            'item': 'https://techforma.pro/catalog'
          }
        ]
      },
      {
        '@type': 'CollectionPage',
        'name': 'Каталог инженерных материалов',
        'description': 'Чертежи DWG/DXF, 3D-модели STEP/STL, технические расчёты от 200₽',
        'numberOfItems': filteredWorks.length
      }
    ]
  }), [filteredWorks.length]);

  const getCatalogSEOTitle = () => {
    const pageText = currentPage > 1 ? ` — Страница ${currentPage}` : '';
    if (filterSubject !== 'all') {
      return `Чертежи ${filterSubject}${pageText} | Tech Forma`;
    }
    return `Каталог чертежей DWG${pageText} | Tech Forma`;
  };

  const getCatalogSEODescription = () => {
    const pageText = currentPage > 1 ? ` Страница ${currentPage}.` : '';
    if (filterSubject !== 'all') {
      return `Скачать чертежи DWG и 3D-модели по ${filterSubject}. ${filteredWorks.length} материалов для студентов и инженеров.${pageText} Мгновенный доступ после оплаты.`;
    }
    return `Каталог из ${filteredWorks.length}+ чертежей DWG, 3D-моделей и технических расчётов. Для студентов и инженеров.${pageText} Скачать материалы сразу после оплаты.`;
  };

  const hasQueryParams = searchQuery || filterSubject !== 'all' || priceRange !== 'all' || sortBy !== 'default';

  // Canonical URL: для страницы 1 - без page, для остальных - с page
  const canonicalUrl = currentPage === 1 
    ? 'https://techforma.pro/catalog'
    : `https://techforma.pro/catalog?page=${currentPage}`;

  // Prev/Next для пагинации
  const prevUrl = currentPage > 2 
    ? `https://techforma.pro/catalog?page=${currentPage - 1}`
    : currentPage === 2 
    ? 'https://techforma.pro/catalog'
    : null;
  
  const nextUrl = currentPage < totalPages 
    ? `https://techforma.pro/catalog?page=${currentPage + 1}`
    : null;

  return (
    <>
      <Helmet>
        <title>{getCatalogSEOTitle()}</title>
        <meta name="description" content={getCatalogSEODescription()} />
        <link rel="canonical" href={canonicalUrl} />
        {prevUrl && <link rel="prev" href={prevUrl} />}
        {nextUrl && <link rel="next" href={nextUrl} />}
        {hasQueryParams && currentPage === 1 && <meta name="robots" content="noindex, follow" />}
        {currentPage > 1 && <meta name="robots" content="noindex, follow" />}
        <script type="application/ld+json">
          {JSON.stringify(jsonLdSchema)}
        </script>
      </Helmet>

      <ExitIntentModal />
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/30 to-white">
      <Navigation isLoggedIn={isLoggedIn} />
      
      <main className="container mx-auto px-4 py-6 mt-16 max-w-[1400px]">
        <Breadcrumbs items={[
          { label: 'Главная', href: '/' },
          { label: 'Каталог работ' }
        ]} />
        
        <div className="mb-8">
          <CatalogHeader worksCount={filteredWorks.length} />
          
          <CatalogFilters
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            filterSubject={filterSubject}
            onFilterSubjectChange={handleFilterSubjectChange}
            priceRange={priceRange}
            onPriceRangeChange={handlePriceRangeChange}
            sortBy={sortBy}
            onSortByChange={handleSortByChange}
            subjects={subjects}
            onResetFilters={() => {
              setSearchQuery('');
              setFilterSubject('all');
              setPriceRange('all');
              setSortBy('default');
              setSearchParams({});
            }}
          />
        </div>

        <CatalogLoadingState
          loading={loading}
          loadingProgress={loadingProgress}
          isEmpty={filteredWorks.length === 0}
        />

        {!loading && filteredWorks.length > 0 && (
          <>
            <TooltipProvider>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {paginatedWorks.map((work) => (
                  <CatalogWorkCard
                    key={work.id}
                    work={work}
                    isAdmin={isAdmin}
                    isFavorite={favorites.has(work.id)}
                    userDiscount={userDiscount}
                    onToggleFavorite={toggleFavorite}
                    onNavigate={(workId) => {
                      // ✅ Сохраняем позицию скролла для админов
                      sessionStorage.setItem('catalog_scroll_position', window.scrollY.toString());
                      navigate(`/work/${workId}`);
                    }}
                  />
                ))}
              </div>
            </TooltipProvider>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 mb-8 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => {
                    const newPage = currentPage - 1;
                    console.log('Назад: новая страница', newPage, 'текущая', currentPage);
                    setSearchParams(newPage === 1 ? {} : { page: String(newPage) });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                >
                  <Icon name="ChevronLeft" size={20} />
                  Назад
                </Button>
                
                <div className="flex gap-2 items-center">
                  {/* Первая страница */}
                  {currentPage > 3 && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchParams({});
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-10 h-10"
                      >
                        1
                      </Button>
                      {currentPage > 4 && <span className="px-2">...</span>}
                    </>
                  )}
                  
                  {/* Окно из 5 страниц вокруг текущей */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    // Пропускаем если это первая страница и мы уже показали её выше
                    if (pageNum === 1 && currentPage > 3) return null;
                    // Пропускаем если это последняя страница и мы покажем её ниже
                    if (pageNum === totalPages && currentPage < totalPages - 2) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        onClick={() => {
                          console.log('Клик на страницу:', pageNum, 'Текущая:', currentPage);
                          setSearchParams(pageNum === 1 ? {} : { page: String(pageNum) });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-10 h-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  {/* Последняя страница */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <span className="px-2">...</span>}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchParams({ page: String(totalPages) });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-10 h-10"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const newPage = currentPage + 1;
                    console.log('Вперёд: новая страница', newPage, 'текущая', currentPage);
                    setSearchParams({ page: String(newPage) });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                >
                  Вперёд
                  <Icon name="ChevronRight" size={20} />
                </Button>
              </div>
            )}
            
            <QuickViewModal
              work={quickViewWork}
              open={!!quickViewWork}
              onClose={() => setQuickViewWork(null)}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
    </>
  );
}