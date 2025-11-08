import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { authService } from '@/lib/auth';
import func2url from '../../backend/func2url.json';
import TrustRating from '@/components/TrustRating';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { recentlyViewedStorage } from '@/utils/recentlyViewed';

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
  authorId?: number | null;
}

export default function WorkDetailPage() {
  const { id, workId } = useParams();
  const actualWorkId = id || workId;
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
  const [similarWorks, setSimilarWorks] = useState<Work[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

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
      workType: 'Другое'
    };
  };

  const determineSubject = (title: string): string => {
    const t = title.toLowerCase();
    
    if (/электро|электри|энергет|эу|ру/.test(t)) return 'Электроэнергетика';
    if (/автоматиз|управлен|асу|контрол|регулир/.test(t)) return 'Автоматизация';
    if (/строител|бетон|конструк|здание|сооружен/.test(t)) return 'Строительство';
    if (/механ|привод|станок|оборудован/.test(t)) return 'Механика';
    if (/газ|газопровод|нефт/.test(t)) return 'Газоснабжение';
    if (/програм|по|алгоритм|дискрет/.test(t)) return 'Программирование';
    if (/безопасн|охран|труд|защит/.test(t)) return 'Безопасность';
    if (/тепло|водоснабжен|вентиляц|отоплен/.test(t)) return 'Теплоснабжение';
    if (/транспорт|дорог|судов|автомобил|локомотив/.test(t)) return 'Транспорт';
    if (/гидравлик|гидро/.test(t)) return 'Гидравлика';
    
    return 'Общая инженерия';
  };

  const determineUniversities = (subject: string): string[] => {
    switch(subject) {
      case 'Электроэнергетика':
        return [
          'МЭИ (Национальный исследовательский университет «МЭИ»)',
          'Санкт-Петербургский политехнический университет Петра Великого',
          'Новосибирский государственный технический университет',
          'Уральский федеральный университет',
          'Казанский государственный энергетический университет'
        ];
      case 'Автоматизация':
        return [
          'МГТУ им. Н.Э. Баумана',
          'МИФИ (Национальный исследовательский ядерный университет «МИФИ»)',
          'Санкт-Петербургский политехнический университет Петра Великого',
          'Томский политехнический университет',
          'Пермский национальный исследовательский политехнический университет'
        ];
      case 'Строительство':
        return [
          'НИУ МГСУ (Московский государственный строительный университет)',
          'СПбГАСУ (Санкт-Петербургский архитектурно-строительный университет)',
          'Казанский государственный архитектурно-строительный университет',
          'Уральский федеральный университет',
          'Сибирский федеральный университет'
        ];
      case 'Механика':
        return [
          'МГТУ им. Н.Э. Баумана',
          'Санкт-Петербургский политехнический университет Петра Великого',
          'МАМИ (Московский политехнический университет)',
          'Южно-Уральский государственный университет',
          'Самарский университет'
        ];
      case 'Газоснабжение':
        return [
          'РГУ нефти и газа им. И.М. Губкина',
          'Уфимский государственный нефтяной технический университет',
          'Тюменский индустриальный университет',
          'Санкт-Петербургский горный университет',
          'Томский политехнический университет'
        ];
      case 'Программирование':
        return [
          'МГУ им. М.В. Ломоносова',
          'МФТИ (Московский физико-технический институт)',
          'НИУ ВШЭ (Национальный исследовательский университет «Высшая школа экономики»)',
          'ИТМО (Университет ИТМО)',
          'Санкт-Петербургский государственный университет'
        ];
      case 'Безопасность':
        return [
          'МГТУ им. Н.Э. Баумана',
          'Академия ГПС МЧС России',
          'Санкт-Петербургский университет ГПС МЧС России',
          'Уральский институт ГПС МЧС России',
          'Ивановская пожарно-спасательная академия ГПС МЧС России'
        ];
      case 'Теплоснабжение':
        return [
          'МЭИ (Национальный исследовательский университет «МЭИ»)',
          'Санкт-Петербургский политехнический университет Петра Великого',
          'Казанский государственный энергетический университет',
          'Уральский федеральный университет',
          'Новосибирский государственный технический университет'
        ];
      case 'Транспорт':
        return [
          'МАДИ (Московский автомобильно-дорожный государственный технический университет)',
          'МИИТ (Российский университет транспорта)',
          'ПГУПС (Петербургский государственный университет путей сообщения)',
          'СибАДИ (Сибирский государственный автомобильно-дорожный университет)',
          'Самарский государственный университет путей сообщения'
        ];
      case 'Гидравлика':
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
          const workType = data.work_type || 'Техническая работа';
          const subject = data.subject || determineSubject(title);
          const price = data.price_points || data.price || 600;
          const rating = parseFloat(data.rating) || determineRating(workType);
          const universities = data.universities || extractUniversity(title);
          const universitiesList = determineUniversities(subject);
          
          const folderPublicUrl = data.yandex_disk_link || data.file_url || YANDEX_DISK_URL;

          const previewUrl: string | null = data.preview_image_url || null;
          
          // Get real composition and description from Yandex Disk
          let parsedDescription = data.description || generateDetailedDescription(workType, title, subject);
          let parsedComposition = data.composition ? data.composition.split(',').map((c: string) => c.trim()) : determineComposition(workType, title);
          
          try {
            const filesResponse = await fetch(
              `${GET_WORK_FILES_URL}?folder_name=${encodeURIComponent(title)}&public_key=${encodeURIComponent(YANDEX_DISK_URL)}`
            );
            if (filesResponse.ok) {
              const filesData = await filesResponse.json();
              if (filesData.composition && filesData.composition.length > 0) {
                parsedComposition = filesData.composition;
              }
              if (filesData.description && filesData.description.length > 50) {
                parsedDescription = filesData.description;
              }
            }
          } catch (err) {
            console.log('Could not fetch real composition, using default');
          }
          
          if (previewUrl) {
            setGallery([previewUrl]);
          }
          
          const workData = {
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
            fileFormats: undefined,
            authorId: data.author_id
          };
          
          setWork(workData);
          
          recentlyViewedStorage.add({
            id: workData.id,
            title: workData.title,
            workType: workData.workType,
            subject: workData.subject,
            price: workData.price,
            rating: workData.rating,
            previewUrl: workData.previewUrl
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

  useEffect(() => {
    const fetchSimilarWorks = async () => {
      if (!work) return;
      
      setLoadingSimilar(true);
      try {
        const response = await fetch(
          `https://functions.poehali.dev/a16a43fc-fa7d-4c72-ad15-ba566d2c7413?limit=100`
        );
        
        if (response.ok) {
          const data = await response.json();
          const works = Array.isArray(data) ? data : (data.works || []);
          
          const allWorks = works.map((w: any) => ({
            id: String(w.id),
            title: w.title,
            workType: w.work_type || 'Техническая работа',
            subject: w.subject || determineSubject(w.title),
            description: w.description || '',
            composition: w.composition ? w.composition.split(',').map((c: string) => c.trim()) : [],
            universities: w.universities || null,
            price: w.price_points || w.price || 600,
            rating: parseFloat(w.rating) || 4.5,
            previewUrl: w.preview_image_url || null,
            yandexDiskLink: w.yandex_disk_link || YANDEX_DISK_URL,
            authorId: w.author_id
          }));
          
          // Фильтруем похожие работы
          const filtered = allWorks.filter((w: Work) => {
            // Исключаем текущую работу
            if (w.id === actualWorkId) return false;
            
            // Приоритет 1: Тот же предмет И тот же тип
            const sameSubject = w.subject === work.subject;
            const sameType = w.workType === work.workType;
            
            return sameSubject || sameType;
          });
          
          // Сортируем: сначала с совпадением и предмета, и типа
          filtered.sort((a, b) => {
            const aMatch = (a.subject === work.subject ? 2 : 0) + (a.workType === work.workType ? 1 : 0);
            const bMatch = (b.subject === work.subject ? 2 : 0) + (b.workType === work.workType ? 1 : 0);
            return bMatch - aMatch;
          });
          
          setSimilarWorks(filtered.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching similar works:', error);
      } finally {
        setLoadingSimilar(false);
      }
    };
    
    fetchSimilarWorks();
  }, [work, actualWorkId]);

  const handlePurchaseAndDownload = async () => {
    if (!actualWorkId || !work) return;
    
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
      const orderResponse = await fetch(`${PURCHASE_WORK_URL}?action=create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId)
        },
        body: JSON.stringify({
          workId: actualWorkId
        })
      });
      
      const orderData = await orderResponse.json();
      
      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Ошибка создания заказа');
      }
      
      if (orderData.alreadyPaid) {
        setDownloading(false);
      } else if (orderData.payUrl) {
        window.location.href = orderData.payUrl;
        return;
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
      <SEO 
        title={work ? `${work.title} — купить за ${work.price} баллов` : 'Просмотр работы'}
        description={work ? `${work.workType} по предмету "${work.subject}". ${work.description.substring(0, 150)}` : 'Детальная информация о студенческой работе'}
        keywords={work ? `${work.workType}, ${work.subject}, курсовая, диплом, купить` : 'студенческие работы'}
      />
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
            <div className="mb-6">
              <div className="flex gap-2 mb-3">
                <Badge className="bg-gray-100 text-gray-700 text-[10px] md:text-xs font-medium px-2 md:px-3 py-1 rounded-sm border-0">
                  {work.workType}
                </Badge>
                {(work.authorId === 999999 || work.authorId === null) && (
                  <Badge className="bg-green-600 text-white text-[10px] md:text-xs font-medium px-2 md:px-3 py-1 rounded-sm border-0">
                    🛡️ Официальная работа
                  </Badge>
                )}
              </div>
              
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {work.title.charAt(0).toUpperCase() + work.title.slice(1)}
              </h1>

              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200">
                <TrustRating 
                  rating={work.rating}
                  purchaseCount={0}
                  isHit={false}
                  isNew={false}
                />
              </div>
            </div>

            <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
              {gallery.length > 0 ? (
                <>
                  <div className="bg-white rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm max-h-[600px] flex items-center justify-center">
                    <img 
                      src={gallery[selectedImage]} 
                      alt={`${work.title} - страница ${selectedImage + 1}`}
                      className="w-full h-auto max-h-[600px] object-contain"
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
                <div className="w-full aspect-[4/3] flex items-center justify-center rounded-lg border-2 border-gray-200 overflow-hidden relative">
                  <img 
                    src="https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/e0139de0-3660-402a-8d29-d07f5dac95b3.jpg"
                    alt="Превью работы"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/60 via-black/30 to-transparent">
                    <span className="text-xl font-bold text-white drop-shadow-lg">{work.workType}</span>
                    <span className="text-sm text-white/90 mt-2 drop-shadow-md">{work.subject}</span>
                  </div>
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
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="text-3xl md:text-4xl font-extrabold text-primary">
                      {work.price.toLocaleString()}
                    </span>
                    <span className="text-base md:text-lg font-medium text-muted-foreground">баллов</span>
                  </div>
                  <span className="text-xs md:text-sm text-gray-500">= {(work.price * 5).toLocaleString()}₽</span>
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
                variant="secondary"
                size="default"
                className="w-full font-semibold rounded-lg mb-3 h-10 md:h-11 text-sm md:text-base bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                onClick={() => navigate(`/defense-kit?workId=${actualWorkId}`)}
              >
                <Icon name="GraduationCap" size={18} className="mr-2" />
                Создать пакет для защиты
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

        {similarWorks.length > 0 && (
          <div className="mt-12 pb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Похожие работы</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarWorks.map((similarWork) => (
                <div
                  key={similarWork.id}
                  onClick={() => navigate(`/work/${similarWork.id}`)}
                  className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all cursor-pointer group overflow-hidden"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                    <img
                      src={similarWork.previewUrl || "https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/e0139de0-3660-402a-8d29-d07f5dac95b3.jpg"}
                      alt={similarWork.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = "https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/e0139de0-3660-402a-8d29-d07f5dac95b3.jpg";
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-white/90 text-gray-700 text-xs px-2 py-1">
                        {similarWork.workType}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                      {similarWork.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {similarWork.subject}
                      </Badge>
                      <div className="text-sm font-bold text-primary">
                        {similarWork.price} ₽
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
      <Footer />
    </div>
  );
}