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
  composition: string[];
  universities: string | null;
  price: number;
  previewUrl: string | null;
  yandexDiskLink: string;
  pageCount?: number;
  fileFormats?: string[];
  chapters?: string[];
}

export default function WorkDetailPage() {
  const { workId } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const YANDEX_DISK_URL = 'https://disk.yandex.ru/d/usjmeUqnkY9IfQ';
  const API_BASE = 'https://cloud-api.yandex.net/v1/disk/public/resources';
  const WORK_PARSER_URL = 'https://functions.poehali.dev/9899633c-f583-430f-aac2-e02cdad0cda5';
  const DOWNLOAD_WORK_URL = 'https://functions.poehali.dev/5898b2f2-c4d9-4ff7-bd15-9600829fed08';
  const PURCHASE_WORK_URL = 'https://functions.poehali.dev/7f219e70-5e9f-44d1-9011-e6246d4274a9';

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

  const determineComposition = (workType: string, title: string): string[] => {
    const wt = workType.toLowerCase();
    const t = title.toLowerCase();
    
    if (/дипломная/.test(wt)) {
      if (/газопровод|электро|система|модернизация/.test(t)) {
        return ['Пояснительная записка', 'Графическая часть (чертежи)', 'Презентация', 'Раздаточный материал'];
      }
      return ['Пояснительная записка', 'Графическая часть', 'Презентация'];
    }
    if (/курсовая/.test(wt)) {
      if (/проектирование|расчет|схема/.test(t)) {
        return ['Пояснительная записка', 'Чертежи (графическая часть)', 'Расчеты'];
      }
      return ['Пояснительная записка', 'Расчеты'];
    }
    if (/отчет/.test(wt)) {
      return ['Отчёт по практике', 'Дневник практики', 'Характеристика'];
    }
    
    return ['Пояснительная записка'];
  };

  const generateDetailedDescription = (workType: string, title: string, subject: string): string => {
    const wt = workType.toLowerCase();
    
    let description = `Готовая работа по теме: "${title}".\n\n`;
    
    if (/дипломная/.test(wt)) {
      description += `Дипломная работа выполнена в полном соответствии с требованиями ГОСТ. `;
      description += `Включает в себя подробную пояснительную записку с теоретической и практической частями, `;
      description += `графическую часть с чертежами и схемами, а также презентацию для защиты.\n\n`;
      description += `Работа содержит актуальные данные, расчеты и обоснования принятых решений. `;
      description += `Все источники оформлены согласно ГОСТ Р 7.0.100-2018.`;
    } else if (/курсовая/.test(wt)) {
      description += `Курсовая работа выполнена по всем требованиям методических указаний. `;
      description += `Включает теоретическую часть с обзором литературы, практическую часть с расчетами, `;
      description += `а также графическую часть (при необходимости).\n\n`;
      description += `В работе представлены актуальные данные, произведены необходимые расчеты и сделаны обоснованные выводы. `;
      description += `Список литературы оформлен по ГОСТ.`;
    } else if (/отчет.*практ/.test(wt)) {
      description += `Отчет по практике составлен в соответствии с программой практики и методическими указаниями. `;
      description += `Содержит описание предприятия, выполненных работ и заданий, а также дневник практики.\n\n`;
      description += `Отчет дополнен характеристикой от руководителя практики.`;
    } else {
      description += `Работа выполнена в соответствии с методическими требованиями. `;
      description += `Содержит необходимые расчеты, обоснования и выводы.`;
    }
    
    return description;
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
            
            // Формируем прямую ссылку на папку работы
            const folderPublicUrl = `${YANDEX_DISK_URL}:${item.path}`;

            let previewUrl = null;
            let fileFormats: string[] = [];
            let pageCount: number | null = null;
            let parsedDescription: string | null = null;
            let parsedComposition: string[] = composition;
            let chapters: string[] = [];
            
            // Get preview image
            try {
              const folderResponse = await fetch(
                `${API_BASE}?public_key=${encodeURIComponent(YANDEX_DISK_URL)}&path=${encodeURIComponent('/' + item.name)}&limit=100`
              );
              const folderData = await folderResponse.json();
              
              if (folderData._embedded && folderData._embedded.items) {
                for (const file of folderData._embedded.items) {
                  const fileName = file.name.toLowerCase();
                  
                  if (fileName.includes('preview') && 
                      (fileName.endsWith('.png') || fileName.endsWith('.jpg')) && 
                      file.file && !previewUrl) {
                    previewUrl = file.file;
                    break;
                  }
                }
              }
            } catch (error) {
              console.log('Error fetching preview:', error);
            }

            // Parse work details from backend
            try {
              const parserResponse = await fetch(
                `${WORK_PARSER_URL}?workId=${encodeURIComponent(workId)}&publicKey=${encodeURIComponent(YANDEX_DISK_URL)}`
              );
              
              if (parserResponse.ok) {
                const parserData = await parserResponse.json();
                
                if (parserData.fileFormats && parserData.fileFormats.length > 0) {
                  fileFormats = parserData.fileFormats;
                }
                
                if (parserData.pageCount) {
                  pageCount = parserData.pageCount;
                }
                
                if (parserData.description) {
                  parsedDescription = parserData.description;
                }
                
                if (parserData.composition && parserData.composition.length > 0) {
                  parsedComposition = parserData.composition;
                }
                
                if (parserData.chapters && parserData.chapters.length > 0) {
                  chapters = parserData.chapters;
                }
              }
            } catch (error) {
              console.log('Error parsing work details:', error);
            }

            const detailedDescription = parsedDescription || generateDetailedDescription(workType, title, subject);
            
            setWork({
              id: item.resource_id,
              title,
              workType,
              subject,
              description: detailedDescription,
              composition: parsedComposition,
              universities,
              price,
              previewUrl,
              yandexDiskLink: folderPublicUrl,
              pageCount: pageCount,
              fileFormats: fileFormats.length > 0 ? fileFormats : undefined,
              chapters: chapters.length > 0 ? chapters : undefined
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

  const handlePurchaseAndDownload = async () => {
    if (!workId || !work) return;
    
    // Получаем userId из localStorage (предполагается, что пользователь авторизован)
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Войдите в систему для покупки работы');
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userStr);
    const userId = user.id;
    
    setDownloading(true);
    try {
      // Шаг 1: Покупка работы
      const purchaseResponse = await fetch(PURCHASE_WORK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId)
        },
        body: JSON.stringify({
          workId: workId,
          userId: userId,
          price: work.price
        })
      });
      
      const purchaseData = await purchaseResponse.json();
      
      if (!purchaseResponse.ok) {
        if (purchaseData.error === 'Insufficient balance') {
          alert(`Недостаточно баллов. У вас: ${purchaseData.balance}, нужно: ${purchaseData.required}`);
          return;
        }
        throw new Error(purchaseData.error || 'Ошибка покупки');
      }
      
      // Шаг 2: Скачивание архива
      const downloadResponse = await fetch(
        `${DOWNLOAD_WORK_URL}?workId=${encodeURIComponent(workId)}&publicKey=${encodeURIComponent(YANDEX_DISK_URL)}`
      );
      
      if (!downloadResponse.ok) {
        throw new Error('Ошибка скачивания');
      }
      
      const blob = await downloadResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${work.title.substring(0, 50)}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Обновляем баланс пользователя в localStorage
      user.balance = purchaseData.newBalance;
      localStorage.setItem('user', JSON.stringify(user));
      
      alert(purchaseData.alreadyPurchased 
        ? 'Работа уже была куплена ранее. Начинается скачивание...' 
        : `Покупка успешна! Списано ${work.price} баллов. Новый баланс: ${purchaseData.newBalance}`
      );
      
    } catch (error) {
      console.error('Purchase/Download error:', error);
      alert(error instanceof Error ? error.message : 'Ошибка при покупке или скачивании');
    } finally {
      setDownloading(false);
    }
  };

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
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Описание работы</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {work.description}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Содержание архива</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-2.5">
                    {work.composition.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Icon name="FileText" size={18} className="mt-0.5 flex-shrink-0 text-blue-600" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {work.chapters && work.chapters.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Структура работы</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {work.chapters.map((chapter, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Icon name="ChevronRight" size={18} className="mt-0.5 flex-shrink-0 text-blue-600" />
                          <span className="text-gray-700 text-sm">{chapter}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Дополнительная информация</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {work.pageCount && (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                      <Icon name="FileText" size={20} className="flex-shrink-0 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Объем работы</div>
                        <div className="text-sm font-medium text-gray-900">{work.pageCount} {work.pageCount > 50 ? 'стр.' : 'страниц'}</div>
                      </div>
                    </div>
                  )}
                  {work.fileFormats && work.fileFormats.length > 0 && (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                      <Icon name="FileType" size={20} className="flex-shrink-0 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Форматы файлов</div>
                        <div className="text-sm font-medium text-gray-900">{work.fileFormats.join(', ')}</div>
                      </div>
                    </div>
                  )}
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
                onClick={handlePurchaseAndDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Скачивание...
                  </>
                ) : (
                  <>
                    <Icon name="Download" size={20} className="mr-2" />
                    Купить и скачать
                  </>
                )}
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