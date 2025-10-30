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

  const YANDEX_DISK_URL = 'https://disk.yandex.ru/d/usjmeUqnkY9IfQ';
  const API_BASE = 'https://cloud-api.yandex.net/v1/disk/public/resources';

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
    const CACHE_KEY = 'catalog_works_cache_v2';
    const CACHE_DURATION = 24 * 60 * 60 * 1000;
    
    localStorage.removeItem('catalog_works_cache');

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
                description: `${workType} • ${subject}`,
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
    };

    fetchWorks();
  }, []);



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
                  <SelectItem value="all">Все типы ({getWorkTypeCount('all')})</SelectItem>
                  {getWorkTypeCount('Курсовая работа') > 0 && <SelectItem value="Курсовая работа">Курсовая работа ({getWorkTypeCount('Курсовая работа')})</SelectItem>}
                  {getWorkTypeCount('Дипломная работа') > 0 && <SelectItem value="Дипломная работа">Дипломная работа ({getWorkTypeCount('Дипломная работа')})</SelectItem>}
                  {getWorkTypeCount('Диссертация') > 0 && <SelectItem value="Диссертация">Диссертация ({getWorkTypeCount('Диссертация')})</SelectItem>}
                  {getWorkTypeCount('Реферат') > 0 && <SelectItem value="Реферат">Реферат ({getWorkTypeCount('Реферат')})</SelectItem>}
                  {getWorkTypeCount('Практическая') > 0 && <SelectItem value="Практическая">Практическая ({getWorkTypeCount('Практическая')})</SelectItem>}
                  {getWorkTypeCount('Практика') > 0 && <SelectItem value="Практика">Практика ({getWorkTypeCount('Практика')})</SelectItem>}
                  {getWorkTypeCount('Выпускная квалификационная работа') > 0 && <SelectItem value="Выпускная квалификационная работа">Выпускная квалификационная работа ({getWorkTypeCount('Выпускная квалификационная работа')})</SelectItem>}
                  {getWorkTypeCount('Литературный обзор') > 0 && <SelectItem value="Литературный обзор">Литературный обзор ({getWorkTypeCount('Литературный обзор')})</SelectItem>}
                  {getWorkTypeCount('Чертежи') > 0 && <SelectItem value="Чертежи">Чертежи ({getWorkTypeCount('Чертежи')})</SelectItem>}
                </SelectContent>
              </Select>

              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-[200px] h-11 border-gray-300 rounded-md">
                  <SelectValue placeholder="Предмет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все предметы ({getSubjectCount('all')})</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject} ({getSubjectCount(subject)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 aspect-[4/3] overflow-hidden flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Icon name="FileText" className="text-indigo-400 group-hover:text-indigo-500 transition-colors" size={64} />
                    <span className="text-sm font-medium text-gray-600">{work.workType}</span>
                  </div>
                  
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
                    {work.title.charAt(0).toUpperCase() + work.title.slice(1).toLowerCase()}
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