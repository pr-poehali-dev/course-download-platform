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
        return 'Пояснительная записка, графика, чертежи';
      }
      return 'Пояснительная записка, графика';
    }
    if (/курсовая/.test(wt)) {
      if (/проектирование|расчет|схема/.test(t)) {
        return 'Пояснительная записка, чертежи';
      }
      return 'Пояснительная записка';
    }
    if (/отчет/.test(wt)) {
      return 'Отчёт, дневник практики';
    }
    
    return 'Пояснительная записка';
  };

  useEffect(() => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const fetchPreviewForItem = async (item: any): Promise<string | null> => {
      try {
        await sleep(50);
        const folderResponse = await fetch(
          `${API_BASE}?public_key=${encodeURIComponent(YANDEX_DISK_URL)}&path=${encodeURIComponent('/' + item.name)}&limit=20`
        );
        
        if (!folderResponse.ok) return null;
        
        const folderData = await folderResponse.json();
        
        if (folderData._embedded && folderData._embedded.items) {
          const previewFile = folderData._embedded.items.find((file: any) => 
            file.name.toLowerCase().includes('preview') && 
            (file.name.toLowerCase().endsWith('.png') || file.name.toLowerCase().endsWith('.jpg'))
          );
          
          if (previewFile && previewFile.file) {
            return previewFile.file;
          }
        }
      } catch (error) {
        return null;
      }
      return null;
    };

    const fetchWorks = async () => {
      setLoading(true);
      const allWorks: Work[] = [];

      const totalBatches = 5;
      for (let i = 0; i < totalBatches; i++) {
        const offset = i * 100;
        setLoadingProgress(Math.round((i / totalBatches) * 100));
        
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
                yandexDiskLink: item.public_url || YANDEX_DISK_URL,
                _item: item
              };
            });

            allWorks.push(...works);
          }
        } catch (error) {
          console.error(`Error fetching offset ${offset}:`, error);
        }
      }

      setWorks(allWorks);
      setFilteredWorks(allWorks);
      setLoadingProgress(100);
      setLoading(false);

      for (let i = 0; i < allWorks.length; i++) {
        const work = allWorks[i];
        if ((work as any)._item) {
          const previewUrl = await fetchPreviewForItem((work as any)._item);
          if (previewUrl) {
            const updatedWorks = [...allWorks];
            updatedWorks[i] = { ...work, previewUrl };
            setWorks([...updatedWorks]);
            setFilteredWorks([...updatedWorks]);
          }
        }
      }
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

          <div className="text-sm text-gray-600">
            Найдено работ: <span className="font-semibold">{filteredWorks.length}</span>
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
                className="group bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => window.location.href = `/work-detail/${work.id}`}
              >
                <div className="relative bg-gray-50 aspect-[4/3] overflow-hidden border-b border-gray-100">
                  {work.previewUrl ? (
                    <img 
                      src={work.previewUrl} 
                      alt={work.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="FileText" className="text-gray-300" size={56} />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-3">
                    <Badge className="bg-gray-100 text-gray-700 text-[11px] font-medium px-2.5 py-1 rounded-sm border-0">
                      {work.workType}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-[15px] text-gray-900 mb-3 line-clamp-3 leading-snug min-h-[63px]">
                    {work.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2 text-[13px] text-gray-600">
                      <Icon name="Package" size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
                      <span className="line-clamp-2">{work.composition}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[13px] text-gray-600">
                      <Icon name="Tag" size={16} className="flex-shrink-0 text-gray-400" />
                      <span>{work.subject}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold text-gray-900">{work.price.toLocaleString()}</span>
                        <span className="text-base text-gray-500 font-medium">баллов</span>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-5 rounded font-medium shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(work.yandexDiskLink, '_blank');
                      }}
                    >
                      Купить
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