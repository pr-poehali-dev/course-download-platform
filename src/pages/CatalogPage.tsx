import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Каталог работ
            </h1>
            <p className="text-xl text-muted-foreground">
              {works.length} готовых работ для студентов
            </p>
          </div>

          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Поиск по названию работы..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[220px]">
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
                <SelectTrigger className="w-full md:w-[220px]">
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

            <div className="flex gap-2 text-sm text-muted-foreground">
              <span>Найдено работ: {filteredWorks.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground mb-2">Загрузка каталога...</p>
              <div className="max-w-md mx-auto">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{loadingProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorks.map(work => (
                <Card key={work.id} className="flex flex-col hover:shadow-lg transition-shadow overflow-hidden">
                  {work.previewUrl && (
                    <div className="relative h-48 bg-muted overflow-hidden">
                      <img 
                        src={work.previewUrl} 
                        alt={work.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <Badge variant="secondary">{work.workType}</Badge>
                      <Badge variant="outline">{work.subject}</Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{work.title}</CardTitle>
                    {work.universities && (
                      <CardDescription className="text-xs mt-1">
                        {work.universities}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="flex-1">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <Icon name="FileText" size={16} className="mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{work.composition}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between items-center border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Icon name="Coins" size={20} className="text-yellow-500" />
                      <span className="text-2xl font-bold text-primary">{work.price}</span>
                      <span className="text-sm text-muted-foreground">баллов</span>
                    </div>
                    <Button
                      onClick={() => window.open(work.yandexDiskLink, '_blank')}
                      size="sm"
                    >
                      <Icon name="Download" size={16} className="mr-2" />
                      Купить
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredWorks.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Search" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
              <p className="text-muted-foreground">Попробуйте изменить фильтры или поисковый запрос</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}