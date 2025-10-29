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
            const workPromises = data._embedded.items
              .filter((item: any) => item.type === 'dir')
              .map(async (item: any) => {
                const { title, workType } = extractWorkInfo(item.name);
                const subject = determineSubject(title);
                const price = determinePrice(workType, title);
                const universities = extractUniversity(title);
                const composition = determineComposition(workType, title);

                let previewUrl = null;
                try {
                  const folderResponse = await fetch(
                    `${API_BASE}?public_key=${encodeURIComponent(YANDEX_DISK_URL)}&path=${encodeURIComponent('/' + item.name)}&limit=20`
                  );
                  const folderData = await folderResponse.json();
                  
                  if (folderData._embedded && folderData._embedded.items) {
                    const previewFile = folderData._embedded.items.find((file: any) => 
                      file.name.toLowerCase().includes('preview') && 
                      (file.name.toLowerCase().endsWith('.png') || file.name.toLowerCase().endsWith('.jpg'))
                    );
                    
                    if (previewFile && previewFile.file) {
                      previewUrl = previewFile.file;
                    }
                  }
                } catch (previewError) {
                  console.log(`No preview for ${item.name}`);
                }

                return {
                  id: item.resource_id,
                  title,
                  workType,
                  subject,
                  description: `Работа по теме: ${title}`,
                  composition,
                  universities,
                  price,
                  previewUrl,
                  yandexDiskLink: item.public_url || YANDEX_DISK_URL
                };
              });

            const batchWorks = await Promise.all(workPromises);
            allWorks.push(...batchWorks);
          }
        } catch (error) {
          console.error(`Error fetching offset ${offset}:`, error);
        }
      }

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredWorks.map((work) => (
              <div key={work.id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200">
                <div className="relative bg-gray-100 aspect-[4/3] overflow-hidden">
                  {work.previewUrl ? (
                    <img 
                      src={work.previewUrl} 
                      alt={work.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                      <Icon name="FileText" className="text-gray-300" size={48} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      {work.workType}
                    </Badge>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 min-h-[40px] leading-tight">
                    {work.title}
                  </h3>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <Icon name="Tag" size={14} />
                    <span>{work.subject}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">{work.price}</span>
                      <span className="text-sm text-gray-500">₽</span>
                    </div>
                    
                    <Button 
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 rounded-md"
                      onClick={() => window.open(work.yandexDiskLink, '_blank')}
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
