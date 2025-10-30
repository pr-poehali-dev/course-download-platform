import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface Work {
  id: string;
  title: string;
  workType: string;
  subject: string;
  description: string;
  composition: string;
  universities: string | null;
  price: number;
  previewUrl: string | null;
  yandexDiskLink: string;
}

export default function CatalogPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [filteredWorks, setFilteredWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingPreviews, setLoadingPreviews] = useState(false);

  const YANDEX_DISK_URL = 'https://disk.yandex.ru/d/usjmeUqnkY9IfQ';
  const API_BASE = 'https://cloud-api.yandex.net/v1/disk/public/resources';

  const extractWorkInfo = (folderName: string) => {
    const match = folderName.trim().match(/^(.+?)\s*\((.+?)\)\s*$/);
    if (match) {
      return {
        title: match[1].trim(),
        workType: match[2].trim()
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
    
    if (/практическая|практика/.test(wt) && !/отчет/.test(wt)) return 1000;
    if (/отчет.*практ/.test(wt)) return 1500;
    if (/курсовая|курсовой/.test(wt)) {
      if (/проектирование|расчет|модернизация|разработка/.test(t)) return 2200;
      return 1800;
    }
    if (/дипломная|диплом/.test(wt)) {
      if (/модернизация|проектирование системы|разработка|автоматизация/.test(t)) return 6000;
      return 5000;
    }
    if (/реферат/.test(wt)) return 1200;
    if (/контрольная/.test(wt)) return 1500;
    
    return 1500;
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
    const CACHE_KEY = 'catalog_works_cache';
    const CACHE_DURATION = 24 * 60 * 60 * 1000;

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
      
      const cachedWorks = loadFromCache();
      if (cachedWorks) {
        setWorks(cachedWorks);
        setFilteredWorks(cachedWorks);
        setLoadingProgress(100);
        setLoading(false);
        return;
      }

      const allWorks: Work[] = [];

      const totalBatches = 5;
      for (let i = 0; i < totalBatches; i++) {
        const offset = i * 100;
        setLoadingProgress(Math.round((i / totalBatches) * 100));
        
        await sleep(200);
        
        try {
          const response = await fetch(
            `${API_BASE}?public_key=${encodeURIComponent(YANDEX_DISK_URL)}&limit=100&offset=${offset}`
          );
          const data = await response.json();

          if (data._embedded && data._embedded.items) {
            const folders = data._embedded.items.filter((item: any) => item.type === 'dir');
            
            const works = folders.map((item: any) => {
              const { title, workType } = extractWorkInfo(item.name);
              const subject = determineSubject(title);
              const price = determinePrice(workType, title);
              const universities = extractUniversity(title);
              const composition = determineComposition(workType, title);

              return {
                id: item.resource_id,
                title,
                workType,
                subject,
                description: `Работа по теме: ${title}`,
                composition,
                universities,
                price,
                previewUrl: null,
                yandexDiskLink: item.public_url || YANDEX_DISK_URL
              };
            });

            allWorks.push(...works);
          }
        } catch (error) {
          console.error(`Error fetching offset ${offset}:`, error);
        }
      }

      saveToCache(allWorks);
      setWorks(allWorks);
      setFilteredWorks(allWorks);
      setLoadingProgress(100);
      setLoading(false);
      
      loadPreviews(allWorks);
    };

    fetchWorks();
  }, []);

  const loadPreviews = async (worksList: Work[]) => {
    setLoadingPreviews(true);
    const PREVIEW_CACHE_KEY = 'catalog_previews_cache';
    
    const loadPreviewCache = (): Record<string, string> => {
      try {
        const cached = localStorage.getItem(PREVIEW_CACHE_KEY);
        return cached ? JSON.parse(cached) : {};
      } catch {
        return {};
      }
    };

    const savePreviewCache = (cache: Record<string, string>) => {
      try {
        localStorage.setItem(PREVIEW_CACHE_KEY, JSON.stringify(cache));
      } catch (error) {
        console.error('Preview cache save error:', error);
      }
    };

    const previewCache = loadPreviewCache();
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    const updatedWorks = [...worksList];
    let hasUpdates = false;

    for (let i = 0; i < updatedWorks.length; i++) {
      const work = updatedWorks[i];
      
      if (previewCache[work.id]) {
        updatedWorks[i] = { ...work, previewUrl: previewCache[work.id] };
        hasUpdates = true;
        continue;
      }

      await sleep(300);

      try {
        const folderName = work.title + ' (' + work.workType + ')';
        const response = await fetch(
          `${API_BASE}?public_key=${encodeURIComponent(YANDEX_DISK_URL)}&path=${encodeURIComponent('/' + folderName)}&limit=20`
        );
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        if (data._embedded && data._embedded.items) {
          const previewFile = data._embedded.items.find((file: any) => 
            file.name.toLowerCase().includes('preview') && 
            (file.name.toLowerCase().endsWith('.png') || file.name.toLowerCase().endsWith('.jpg'))
          );
          
          if (previewFile && previewFile.file) {
            updatedWorks[i] = { ...work, previewUrl: previewFile.file };
            previewCache[work.id] = previewFile.file;
            hasUpdates = true;
            
            if (i % 10 === 0) {
              setWorks([...updatedWorks]);
              setFilteredWorks([...updatedWorks]);
              savePreviewCache(previewCache);
            }
          }
        }
      } catch (error) {
        continue;
      }
    }

    if (hasUpdates) {
      setWorks([...updatedWorks]);
      setFilteredWorks([...updatedWorks]);
      savePreviewCache(previewCache);
    }
    
    setLoadingPreviews(false);
  };

  useEffect(() => {
    let filtered = works;

    if (searchQuery) {
      filtered = filtered.filter(work =>
        work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(work => work.workType === filterType);
    }

    if (filterSubject !== 'all') {
      filtered = filtered.filter(work => work.subject === filterSubject);
    }

    setFilteredWorks(filtered);
  }, [searchQuery, filterType, filterSubject, works]);

  const workTypes = Array.from(new Set(works.map(w => w.workType)));
  const subjects = Array.from(new Set(works.map(w => w.subject)));

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 mt-16 max-w-[1400px]">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-6">Каталог готовых работ</h1>
          
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Поиск работ по названию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[200px] h-11 border-gray-300 rounded-md">
                  <SelectValue placeholder="Тип работы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  {workTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-[200px] h-11 border-gray-300 rounded-md">
                  <SelectValue placeholder="Предмет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все предметы</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Найдено работ: <span className="font-semibold">{filteredWorks.length}</span>
            </div>
            {loadingPreviews && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                <span>Загружаются изображения...</span>
              </div>
            )}
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWorks.map((work) => (
              <div 
                key={work.id} 
                className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => window.location.href = `/work-detail/${work.id}`}
              >
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/3] overflow-hidden">
                  {work.previewUrl ? (
                    <>
                      <img 
                        src={work.previewUrl} 
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                      {loadingPreviews ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600"></div>
                          <span className="text-xs text-gray-400">Загрузка...</span>
                        </>
                      ) : (
                        <Icon name="FileText" className="text-gray-300 group-hover:text-gray-400 transition-colors" size={56} />
                      )}
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3">
                    <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      {work.price.toLocaleString()} б.
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-3">
                    <Badge className="bg-primary/10 text-primary text-[11px] font-semibold px-3 py-1 rounded-full border-0">
                      {work.workType}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-[15px] mb-3 line-clamp-3 leading-snug min-h-[63px] group-hover:text-primary transition-colors">
                    {work.title}
                  </h3>
                  
                  <div className="space-y-2.5 mb-4">
                    <div className="flex items-start gap-2.5 text-[13px] text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon name="Package" size={14} className="text-blue-600" />
                      </div>
                      <span className="line-clamp-2 leading-relaxed">{work.composition}</span>
                    </div>
                    
                    <div className="flex items-center gap-2.5 text-[13px] text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Icon name="Tag" size={14} className="text-purple-600" />
                      </div>
                      <span className="font-medium">{work.subject}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-11 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/work-detail/${work.id}`;
                      }}
                    >
                      <Icon name="ShoppingCart" size={18} className="mr-2" />
                      Купить сейчас
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}