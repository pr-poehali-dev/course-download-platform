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
  fileFormats?: string[];
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
  const GET_WORK_FILES_URL = 'https://functions.poehali.dev/ec3bbe78-f975-4ae0-9b3f-3a3fc67dd7d1';

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

  const determineUniversities = (subject: string): string[] => {
    switch(subject) {
      case 'электроэнергетика':
        return [
          'МЭИ (Национальный исследовательский университет «МЭИ»)',
          'Санкт-Петербургский политехнический университет Петра Великого',
          'Новосибирский государственный технический университет',
          'Уральский федеральный университет',
          'Казанский государственный энергетический университет'
        ];
      case 'автоматизация':
        return [
          'МГТУ им. Н.Э. Баумана',
          'МИФИ (Национальный исследовательский ядерный университет «МИФИ»)',
          'Санкт-Петербургский политехнический университет Петра Великого',
          'Томский политехнический университет',
          'Пермский национальный исследовательский политехнический университет'
        ];
      case 'строительство':
        return [
          'НИУ МГСУ (Московский государственный строительный университет)',
          'СПбГАСУ (Санкт-Петербургский архитектурно-строительный университет)',
          'Казанский государственный архитектурно-строительный университет',
          'Уральский федеральный университет',
          'Сибирский федеральный университет'
        ];
      case 'механика':
        return [
          'МГТУ им. Н.Э. Баумана',
          'Санкт-Петербургский политехнический университет Петра Великого',
          'МАМИ (Московский политехнический университет)',
          'Южно-Уральский государственный университет',
          'Самарский университет'
        ];
      case 'газоснабжение':
        return [
          'РГУ нефти и газа им. И.М. Губкина',
          'Уфимский государственный нефтяной технический университет',
          'Тюменский индустриальный университет',
          'Санкт-Петербургский горный университет',
          'Томский политехнический университет'
        ];
      case 'программирование':
        return [
          'МГУ им. М.В. Ломоносова',
          'МФТИ (Московский физико-технический институт)',
          'НИУ ВШЭ (Национальный исследовательский университет «Высшая школа экономики»)',
          'ИТМО (Университет ИТМО)',
          'Санкт-Петербургский государственный университет'
        ];
      case 'безопасность':
        return [
          'МГТУ им. Н.Э. Баумана',
          'Академия ГПС МЧС России',
          'Санкт-Петербургский университет ГПС МЧС России',
          'Уральский институт ГПС МЧС России',
          'Ивановская пожарно-спасательная академия ГПС МЧС России'
        ];
      case 'теплоснабжение':
        return [
          'МЭИ (Национальный исследовательский университет «МЭИ»)',
          'Санкт-Петербургский политехнический университет Петра Великого',
          'Казанский государственный энергетический университет',
          'Уральский федеральный университет',
          'Новосибирский государственный технический университет'
        ];
      case 'транспорт':
        return [
          'МАДИ (Московский автомобильно-дорожный государственный технический университет)',
          'МИИТ (Российский университет транспорта)',
          'ПГУПС (Петербургский государственный университет путей сообщения)',
          'СибАДИ (Сибирский государственный автомобильно-дорожный университет)',
          'Самарский государственный университет путей сообщения'
        ];
      case 'гидравлика':
        return [
          'МГСУ (Московский государственный строительный университет)',
          'СПбГАСУ (Санкт-Петербургский архитектурно-строительный университет)',
          'Санкт-Петербургский политехнический университет Петра Великого',
          'Томский политехнический университет',
          'Новосибирский государственный технический университет'
        ];
      default:
        return [
          'Технические университеты России',
          'Политехнические институты',
          'Инженерные вузы'
        ];
    }
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
            const universitiesList = determineUniversities(subject);
            
            // Формируем прямую ссылку на папку работы
            const folderPublicUrl = `${YANDEX_DISK_URL}:${item.path}`;

            const previewUrl = null;
            let fileFormats: string[] = [];
            let parsedDescription: string | null = null;
            let parsedComposition: string[] = composition;
            
            // Get real file composition
            try {
              const filesResponse = await fetch(
                `${GET_WORK_FILES_URL}?folder_name=${encodeURIComponent(item.name)}&public_key=${encodeURIComponent(YANDEX_DISK_URL)}`
              );
              
              if (filesResponse.ok) {
                const filesData = await filesResponse.json();
                
                if (filesData.composition && filesData.composition.length > 0) {
                  parsedComposition = filesData.composition;
                }
              }
            } catch (error) {
              console.log('Error fetching work files:', error);
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
                
                if (parserData.description) {
                  parsedDescription = parserData.description;
                }
                
                if (parserData.composition && parserData.composition.length > 0) {
                  parsedComposition = parserData.composition;
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
              universities: universitiesList.join(', '),
              price,
              previewUrl,
              yandexDiskLink: folderPublicUrl,
              fileFormats: fileFormats.length > 0 ? fileFormats : undefined
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

            <div className="mb-8">
              <div className="w-full aspect-[4/3] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-gray-200">
                <Icon name="FileText" className="text-indigo-400 mb-4" size={80} />
                <span className="text-lg font-medium text-gray-700">{work.workType}</span>
                <span className="text-sm text-gray-500 mt-2">{work.subject}</span>
              </div>
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

              {work.fileFormats && work.fileFormats.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Форматы файлов</h2>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <Icon name="FileType" size={20} className="flex-shrink-0 text-gray-400" />
                    <div className="text-sm font-medium text-gray-900">{work.fileFormats.join(', ')}</div>
                  </div>
                </div>
              )}

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
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Подходит для университетов</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-2.5">
                      {work.universities.split(', ').map((uni, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Icon name="GraduationCap" size={18} className="mt-0.5 flex-shrink-0 text-blue-600" />
                          <span className="text-gray-700">{uni}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 sticky top-20 border-2 border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center mb-5 pb-5 border-b border-border">
                <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Стоимость</div>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-4xl font-extrabold text-primary">
                    {work.price.toLocaleString()}
                  </span>
                  <span className="text-lg font-medium text-muted-foreground">баллов</span>
                </div>
              </div>

              <Button 
                size="default"
                className="w-full font-semibold rounded-lg mb-5 shadow-md hover:shadow-lg transition-all duration-200 h-11"
                onClick={handlePurchaseAndDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Скачивание...
                  </>
                ) : (
                  <>
                    <Icon name="Download" size={18} className="mr-2" />
                    Купить и скачать
                  </>
                )}
              </Button>

              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="CheckCircle2" size={16} className="text-primary" />
                  </div>
                  <span className="font-medium">Проверенное качество</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Zap" size={16} className="text-primary" />
                  </div>
                  <span className="font-medium">Мгновенный доступ</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Shield" size={16} className="text-primary" />
                  </div>
                  <span className="font-medium">Гарантия возврата</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Star" size={16} className="text-primary" />
                  </div>
                  <span className="font-medium">Премиум поддержка</span>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-border">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Icon name="Lock" size={14} />
                  <span>Безопасная покупка</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}