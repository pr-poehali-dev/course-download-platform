import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export default function WorkDetailPage() {
  const { workId } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);

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
    const fetchWork = async () => {
      if (!workId) {
        navigate('/catalog');
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}?public_key=${encodeURIComponent(YANDEX_DISK_URL)}&limit=500`
        );
        const data = await response.json();

        if (data._embedded && data._embedded.items) {
          const item = data._embedded.items.find((item: any) => item.resource_id === workId);
          
          if (item) {
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
            } catch (error) {
              console.log('No preview available');
            }

            setWork({
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
            });
          } else {
            navigate('/catalog');
          }
        }
      } catch (error) {
        console.error('Error fetching work:', error);
        navigate('/catalog');
      } finally {
        setLoading(false);
      }
    };

    fetchWork();
  }, [workId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="container mx-auto px-4 py-20 mt-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!work) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 mt-16 max-w-[1200px]">
        <Button 
          variant="ghost" 
          className="mb-6 text-gray-600 hover:text-gray-900"
          onClick={() => navigate('/catalog')}
        >
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          Назад к каталогу
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Badge className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-sm border-0">
                {work.workType}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
              {work.title}
            </h1>

            <div className="bg-gray-50 rounded-lg overflow-hidden mb-8">
              {work.previewUrl ? (
                <img 
                  src={work.previewUrl} 
                  alt={work.title}
                  className="w-full h-auto"
                />
              ) : (
                <div className="w-full aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <Icon name="FileText" className="text-gray-300" size={80} />
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Описание</h2>
                <p className="text-gray-700 leading-relaxed">
                  {work.description}
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Состав работы</h2>
                <div className="flex items-start gap-3">
                  <Icon name="Package" size={20} className="mt-1 flex-shrink-0 text-gray-400" />
                  <p className="text-gray-700">
                    {work.composition}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Предметная область</h2>
                <div className="flex items-center gap-3">
                  <Icon name="Tag" size={20} className="flex-shrink-0 text-gray-400" />
                  <Badge className="bg-blue-50 text-blue-700 text-sm font-normal px-3 py-1 border-0">
                    {work.subject}
                  </Badge>
                </div>
              </div>

              {work.universities && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Организация</h2>
                  <div className="flex items-start gap-3">
                    <Icon name="Building2" size={20} className="mt-1 flex-shrink-0 text-gray-400" />
                    <p className="text-gray-700">
                      {work.universities}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-20">
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">Стоимость</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">{work.price.toLocaleString()}</span>
                  <span className="text-lg text-gray-600 font-medium">баллов</span>
                </div>
              </div>

              <Button 
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-12 rounded-md mb-4"
                onClick={() => window.open(work.yandexDiskLink, '_blank')}
              >
                Купить работу
              </Button>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Icon name="Shield" size={18} className="text-green-600" />
                  <span>Гарантия качества</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Icon name="Download" size={18} className="text-blue-600" />
                  <span>Мгновенная загрузка</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Icon name="FileCheck" size={18} className="text-purple-600" />
                  <span>Проверенные материалы</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
