import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { authService } from '@/lib/auth';
import func2url from '../../backend/func2url.json';

interface Work {
  id: string;
  title: string;
  workType: string;
  subject: string;
  description: string;
  composition: string[];
  universities: string | null;
  price: number;
  rating: number;
  previewUrl: string | null;
  yandexDiskLink: string;
  fileFormats?: string[];
}

export default function WorkDetailPage() {
  const { id, workId } = useParams();
  const actualWorkId = id || workId;
  console.log('WorkDetailPage params:', { id, workId, actualWorkId });
  const navigate = useNavigate();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [showingPdfPreview, setShowingPdfPreview] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [loadingPdfPreview, setLoadingPdfPreview] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showUploadButton, setShowUploadButton] = useState(false);
  const [extractingImages, setExtractingImages] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.verify();
      setIsLoggedIn(!!user);
      
      // Проверяем, является ли пользователь админом
      if (user && user.role === 'admin') {
        setShowUploadButton(true);
      }
    };
    checkAuth();
  }, []);

  const YANDEX_DISK_URL = 'https://disk.yandex.ru/d/usjmeUqnkY9IfQ';
  const API_BASE = 'https://cloud-api.yandex.net/v1/disk/public/resources';
  const WORK_PARSER_URL = func2url['work-parser'];
  const DOWNLOAD_WORK_URL = func2url['download-work'];
  const PURCHASE_WORK_URL = func2url['purchase-work'];
  const GET_WORK_FILES_URL = func2url['get-work-files'];
  const PDF_PREVIEW_URL = func2url['pdf-preview'];

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
    
    if (/практическая|практика/.test(wt) && !/отчет/.test(wt)) return 250;
    if (/отчет.*практ/.test(wt)) return 400;
    if (/курсовая|курсовой/.test(wt)) {
      if (/проектирование|расчет|модернизация|разработка/.test(t)) return 600;
      return 500;
    }
    if (/дипломная|диплом/.test(wt)) {
      if (/модернизация|проектирование системы|разработка|автоматизация/.test(t)) return 1200;
      return 1000;
    }
    if (/реферат/.test(wt)) return 200;
    if (/контрольная/.test(wt)) return 300;
    
    return 350;
  };

  const determineRating = (workType: string): number => {
    const wt = workType.toLowerCase();
    
    if (/дипломная|диплом/.test(wt)) return 5.0;
    if (/курсовая|курсовой/.test(wt)) return 4.8;
    if (/отчет.*практ/.test(wt)) return 4.7;
    if (/практическая|практика/.test(wt)) return 4.6;
    if (/контрольная/.test(wt)) return 4.5;
    if (/реферат/.test(wt)) return 4.4;
    
    return 4.5;
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
      if (!actualWorkId) {
        navigate('/catalog');
        return;
      }

      try {
        const response = await fetch(
          `https://functions.poehali.dev/a16a43fc-fa7d-4c72-ad15-ba566d2c7413?id=${actualWorkId}`
        );
        const data = await response.json();

        if (data && data.id) {
          const title = data.title;
          const workType = data.work_type || 'другое';
          const subject = data.subject || determineSubject(title);
          const price = data.price_points || determinePrice(workType, title);
          const rating = parseFloat(data.rating) || determineRating(workType);
          const universities = data.universities || extractUniversity(title);
          const composition = data.composition ? data.composition.split(',').map((c: string) => c.trim()) : determineComposition(workType, title);
          const universitiesList = determineUniversities(subject);
          
          const folderPublicUrl = data.yandex_disk_link || data.file_url || YANDEX_DISK_URL;

          const previewUrl: string | null = data.preview_image_url || null;
          const fileFormats: string[] = [];
          const parsedDescription = data.description || generateDetailedDescription(workType, title, subject);
          const parsedComposition = composition;
          
          if (previewUrl) {
            setGallery([previewUrl]);
          }
          
          setWork({
            id: String(data.id),
            title,
            workType,
            subject,
            description: parsedDescription,
            composition: parsedComposition,
            universities: universitiesList.join(', '),
            price,
            rating,
            previewUrl,
            yandexDiskLink: folderPublicUrl,
            fileFormats: undefined
          });
          setLoading(false);
        } else {
          navigate('/catalog');
        }
      } catch (error) {
        console.error('Error fetching work:', error);
        navigate('/catalog');
      } finally {
        setLoading(false);
      }
    };

    fetchWork();
  }, [actualWorkId, navigate]);

  const handlePurchaseAndDownload = async () => {
    if (!actualWorkId || !work) return;
    
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
          workId: actualWorkId,
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
      
      // Шаг 2: Получение ссылки на скачивание
      const downloadResponse = await fetch(
        `${DOWNLOAD_WORK_URL}?workId=${encodeURIComponent(actualWorkId)}&publicKey=${encodeURIComponent(YANDEX_DISK_URL)}`,
        {
          headers: {
            'X-User-Id': String(userId)
          }
        }
      );
      
      if (!downloadResponse.ok) {
        throw new Error('Ошибка скачивания');
      }
      
      const downloadData = await downloadResponse.json();
      
      // Скачиваем файл напрямую (работает на всех устройствах)
      try {
        const fileResponse = await fetch(downloadData.download_url);
        const blob = await fileResponse.blob();
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadData.filename || `${work.title.substring(0, 50)}.rar`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (fetchError) {
        // Если fetch не сработал, открываем в новой вкладке
        window.location.href = downloadData.download_url;
      }
      
      // Обновляем баланс пользователя в localStorage (если не админ)
      if (user.role !== 'admin') {
        user.balance = purchaseData.newBalance;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      const message = purchaseData.isAdmin 
        ? '✅ Скачивание началось!\n\nФайл сохранится в папку "Загрузки"' 
        : purchaseData.alreadyPurchased 
          ? '✅ Работа уже куплена!\n\nСкачивание началось...' 
          : `✅ Покупка успешна!\n\n💰 Списано ${work.price} баллов\n💵 Баланс: ${purchaseData.newBalance}\n\n📥 Скачивание началось...`;
      
      alert(message);
      
    } catch (error) {
      console.error('Purchase/Download error:', error);
      alert(error instanceof Error ? error.message : 'Ошибка при покупке или скачивании');
    } finally {
      setDownloading(false);
    }
  };

  const handleShowPdfPreview = async () => {
    if (!work) return;
    
    setLoadingPdfPreview(true);
    
    try {
      const folderName = work.title;
      const response = await fetch(
        `${PDF_PREVIEW_URL}?folder_name=${encodeURIComponent(folderName)}&public_key=${encodeURIComponent(YANDEX_DISK_URL)}&page_count=3`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Не удалось загрузить превью');
      }
      
      const data = await response.json();
      
      const binaryString = atob(data.preview);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setPdfPreviewUrl(url);
      setShowingPdfPreview(true);
      
    } catch (error) {
      console.error('PDF preview error:', error);
      alert(error instanceof Error ? error.message : 'Не удалось загрузить превью PDF');
    } finally {
      setLoadingPdfPreview(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !workId) return;

    setUploadingImage(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = (reader.result as string).split(',')[1];

        const UPDATE_PREVIEW_URL = func2url['update-work-preview'];
        const response = await fetch(UPDATE_PREVIEW_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            work_id: workId,
            image_base64: base64Image,
            image_filename: file.name
          })
        });

        const data = await response.json();

        if (data.success) {
          setGallery([data.image_url]);
          setSelectedImage(0);
          
          if (work) {
            setWork({ ...work, previewUrl: data.image_url });
          }
          
          alert('✅ Фото успешно загружено!');
        } else {
          alert('❌ Ошибка: ' + data.error);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Ошибка загрузки');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleExtractImagesFromArchive = async () => {
    if (!workId) return;

    setExtractingImages(true);

    try {
      const UPDATE_PREVIEW_URL = func2url['update-work-preview'];
      const response = await fetch(UPDATE_PREVIEW_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_id: workId,
          extract_from_archive: true
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.all_images && data.all_images.length > 0) {
          setGallery(data.all_images);
          setSelectedImage(0);
          
          if (work) {
            setWork({ ...work, previewUrl: data.image_url });
          }
          
          alert(`✅ Извлечено ${data.count} изображений из архива!`);
        } else {
          alert('⚠️ PNG изображения не найдены в архиве');
        }
      } else {
        alert('❌ Ошибка: ' + (data.error || data.message));
      }
    } catch (error) {
      console.error('Extract error:', error);
      alert('❌ Ошибка извлечения изображений');
    } finally {
      setExtractingImages(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation isLoggedIn={isLoggedIn} />
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
      <Navigation isLoggedIn={isLoggedIn} />
      
      <main className="container mx-auto px-4 py-4 md:py-6 mt-16 max-w-[1200px]">
        <Button 
          variant="ghost" 
          className="mb-4 md:mb-6 text-gray-600 hover:text-gray-900 text-sm md:text-base"
          onClick={() => navigate('/catalog')}
        >
          <Icon name="ArrowLeft" size={18} className="mr-2" />
          Назад к каталогу
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <Badge className="bg-gray-100 text-gray-700 text-[10px] md:text-xs font-medium px-2 md:px-3 py-1 rounded-sm border-0">
                {work.workType}
              </Badge>
              <div className="flex items-center gap-1.5">
                <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="text-base md:text-lg font-bold text-gray-800">{work.rating}</span>
                <span className="text-xs md:text-sm text-gray-500">/5.0</span>
              </div>
            </div>

            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
              {work.title}
            </h1>

            <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
              {gallery.length > 0 ? (
                <>
                  <div className="bg-white rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                    <img 
                      src={gallery[selectedImage]} 
                      alt={`${work.title} - страница ${selectedImage + 1}`}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </div>
                  
                  {gallery.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {gallery.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage === index 
                              ? 'border-blue-600 ring-2 ring-blue-200 scale-105' 
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <img 
                            src={image} 
                            alt={`Превью ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full aspect-[4/3] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-gray-200">
                  <Icon name="FileText" className="text-indigo-400 mb-4" size={80} />
                  <span className="text-lg font-medium text-gray-700">{work.workType}</span>
                  <span className="text-sm text-gray-500 mt-2">{work.subject}</span>
                </div>
              )}

              {showUploadButton && (
                <div className="mt-4 space-y-2">
                  <Button 
                    type="button"
                    variant="default"
                    disabled={extractingImages}
                    className="w-full"
                    onClick={handleExtractImagesFromArchive}
                  >
                    {extractingImages ? (
                      <>
                        <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                        Извлечение изображений...
                      </>
                    ) : (
                      <>
                        <Icon name="Image" className="mr-2 h-4 w-4" />
                        🖼️ Извлечь PNG из архива
                      </>
                    )}
                  </Button>
                  
                  <label className="cursor-pointer">
                    <Button 
                      type="button"
                      variant="outline"
                      disabled={uploadingImage}
                      className="w-full"
                      asChild
                    >
                      <span>
                        {uploadingImage ? (
                          <>
                            <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                            Загрузка...
                          </>
                        ) : (
                          <>
                            <Icon name="Upload" className="mr-2 h-4 w-4" />
                            📎 Загрузить файл вручную
                          </>
                        )}
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
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
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Предметная область</h2>
                <div className="flex items-center gap-2 md:gap-3">
                  <Icon name="Tag" size={18} className="flex-shrink-0 text-gray-400" />
                  <Badge className="bg-blue-50 text-blue-700 text-xs md:text-sm font-normal px-2 md:px-3 py-1 border-0">
                    {work.subject}
                  </Badge>
                </div>
              </div>

              {work.universities && (
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Подходит для университетов</h2>
                  <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                    <ul className="space-y-2">
                      {work.universities.split(', ').map((uni, index) => (
                        <li key={index} className="flex items-start gap-2 md:gap-3">
                          <Icon name="GraduationCap" size={16} className="mt-0.5 flex-shrink-0 text-blue-600" />
                          <span className="text-xs md:text-sm text-gray-700">{uni}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg md:rounded-xl p-4 md:p-6 lg:sticky lg:top-20 border-2 border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center mb-4 md:mb-5 pb-4 md:pb-5 border-b border-border">
                <div className="text-[10px] md:text-xs font-semibold text-muted-foreground mb-1 md:mb-2 uppercase tracking-wider">Стоимость</div>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-3xl md:text-4xl font-extrabold text-primary">
                    {work.price.toLocaleString()}
                  </span>
                  <span className="text-base md:text-lg font-medium text-muted-foreground">баллов</span>
                </div>
              </div>

              <Button 
                size="default"
                className="w-full font-semibold rounded-lg mb-3 shadow-md hover:shadow-lg transition-all duration-200 h-10 md:h-11 text-sm md:text-base"
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

              <Button 
                variant="outline"
                size="default"
                className="w-full font-semibold rounded-lg mb-4 md:mb-5 h-10 md:h-11 text-sm md:text-base"
                onClick={handleShowPdfPreview}
                disabled={loadingPdfPreview}
              >
                {loadingPdfPreview ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="Eye" size={18} className="mr-2" />
                    Посмотреть превью
                  </>
                )}
              </Button>

              <div className="space-y-2.5 md:space-y-3">
                <div className="flex items-center gap-2 md:gap-2.5 text-xs md:text-sm">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="CheckCircle2" size={14} className="text-primary" />
                  </div>
                  <span className="font-medium">Проверенное качество</span>
                </div>
                <div className="flex items-center gap-2 md:gap-2.5 text-xs md:text-sm">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Zap" size={14} className="text-primary" />
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

      {showingPdfPreview && pdfPreviewUrl && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowingPdfPreview(false);
            if (pdfPreviewUrl) {
              URL.revokeObjectURL(pdfPreviewUrl);
              setPdfPreviewUrl(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Превью работы (первые 3 страницы)</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowingPdfPreview(false);
                  if (pdfPreviewUrl) {
                    URL.revokeObjectURL(pdfPreviewUrl);
                    setPdfPreviewUrl(null);
                  }
                }}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              <iframe
                src={pdfPreviewUrl}
                className="w-full h-full"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}