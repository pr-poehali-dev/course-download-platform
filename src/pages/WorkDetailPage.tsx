import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { authService } from '@/lib/auth';
import func2url from '../../backend/func2url.json';
import TrustRating from '@/components/TrustRating';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Helmet } from 'react-helmet-async';
import { recentlyViewedStorage } from '@/utils/recentlyViewed';
import { getFakeAuthor, incrementViewCount, getViewCount } from '@/utils/fakeAuthors';
import ReviewsSection from '@/components/ReviewsSection';
import WorkActivityTracker from '@/components/WorkActivityTracker';
import { toast } from '@/components/ui/use-toast';
import { getUserDiscount } from '@/utils/discount';
import Breadcrumbs from '@/components/Breadcrumbs';


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
  authorName?: string | null;
  language?: string;
  software?: string[];
  viewsCount?: number;
  downloadsCount?: number;
  reviewsCount?: number;
  keywords?: string[];
  discount?: number;
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
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedWork, setEditedWork] = useState<Partial<Work>>({});
  const [isPurchased, setIsPurchased] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userDiscount, setUserDiscount] = useState<number>(0);


  useEffect(() => {
    const checkAuth = async () => {
      // ✅ ПРИНУДИТЕЛЬНО получаем СВЕЖИЕ данные из backend, НЕ из localStorage
      const freshUser = await authService.verify();
      setIsLoggedIn(!!freshUser);
      
      // ✅ КРИТИЧНО: Обновляем localStorage свежими данными сразу после загрузки
      if (freshUser) {
        localStorage.setItem('user', JSON.stringify(freshUser));
        console.log('🔄 localStorage ОБНОВЛЕН свежими данными:', freshUser);
        
        // Рассчитываем дисконт пользователя на основе баланса
        const discount = getUserDiscount(freshUser.balance || 0);
        setUserDiscount(discount);
        console.log(`💰 Баланс: ${freshUser.balance}, Скидка: ${discount}%`);
      }
      
      // Проверяем, куплена ли работа
      if (freshUser && actualWorkId) {
        try {
          const response = await fetch(`${func2url['user-data']}?user_id=${freshUser.id}&action=purchases`);
          const data = await response.json();
          console.log('Purchases data:', data);
          console.log('Current work ID:', actualWorkId);
          if (data.purchases) {
            const purchased = data.purchases.some((p: any) => String(p.work_id) === String(actualWorkId));
            console.log('Is purchased:', purchased);
            setIsPurchased(purchased);
          }
        } catch (error) {
          console.error('Error checking purchase:', error);
        }
      }
      
      // Проверяем, является ли пользователь админом
      if (freshUser && freshUser.role === 'admin') {
        setShowUploadButton(true);
        setIsAdmin(true);
      }
    };
    checkAuth();
  }, [actualWorkId]);

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
          const coverImages: string[] = data.cover_images || [];
          
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
          
          if (coverImages && coverImages.length > 0) {
            setGallery(coverImages);
          } else if (previewUrl) {
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
            authorName: data.author_name || null,
            language: data.language || 'Русский',
            software: data.software || [],
            viewsCount: data.views_count || 0,
            downloadsCount: data.downloads || 0,
            reviewsCount: data.reviews_count || 0,
            keywords: data.keywords || [],
            fileFormats: undefined,
            authorId: data.author_id
          };
          
          setWork(workData);
          
          // Увеличиваем счетчик просмотров
          incrementViewCount(workData.id);
          
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
            
            // Проверяем совпадения
            const sameSubject = w.subject === work.subject;
            const sameType = w.workType === work.workType;
            
            // Проверяем похожесть по названию (общие ключевые слова)
            const currentTitleWords = work.title.toLowerCase().split(/\s+/).filter(word => word.length > 3);
            const workTitleWords = w.title.toLowerCase().split(/\s+/).filter(word => word.length > 3);
            const commonWords = currentTitleWords.filter(word => workTitleWords.includes(word));
            const hasSimilarTitle = commonWords.length >= 2; // Минимум 2 общих слова длиннее 3 символов
            
            // Показываем работы с тем же типом ИЛИ похожим названием
            return sameType || hasSimilarTitle || sameSubject;
          });
          
          // Сортируем: приоритет работам с тем же типом и похожим названием
          filtered.sort((a, b) => {
            const currentTitleWords = work.title.toLowerCase().split(/\s+/).filter(word => word.length > 3);
            
            const aWords = a.title.toLowerCase().split(/\s+/).filter(word => word.length > 3);
            const aCommon = currentTitleWords.filter(word => aWords.includes(word)).length;
            const aType = a.workType === work.workType ? 1 : 0;
            const aSubject = a.subject === work.subject ? 1 : 0;
            const aScore = (aType * 10) + (aCommon * 3) + aSubject;
            
            const bWords = b.title.toLowerCase().split(/\s+/).filter(word => word.length > 3);
            const bCommon = currentTitleWords.filter(word => bWords.includes(word)).length;
            const bType = b.workType === work.workType ? 1 : 0;
            const bSubject = b.subject === work.subject ? 1 : 0;
            const bScore = (bType * 10) + (bCommon * 3) + bSubject;
            
            return bScore - aScore;
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

  const handleDeleteWork = async () => {
    if (!window.confirm('⚠️ Вы уверены, что хотите удалить эту работу? Это действие необратимо!')) {
      return;
    }
    
    try {
      const response = await fetch(`${func2url['delete-work']}?workId=${actualWorkId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Email': 'rekrutiw@yandex.ru'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка удаления работы');
      }
      
      toast({
        title: '✅ Работа удалена',
        description: 'Работа успешно удалена из каталога',
      });
      
      setTimeout(() => {
        navigate('/catalog');
      }, 1500);
    } catch (error) {
      console.error('Error deleting work:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить работу',
        variant: 'destructive',
      });
    }
  };

  const handlePurchaseAndDownload = async () => {
    // Показываем сразу уведомление о начале
    toast({
      title: '🔵 Кнопка нажата!',
      description: 'Начинаем обработку покупки...',
      duration: 3000,
    });
    
    console.log('🔵 BUTTON CLICKED! Starting handlePurchaseAndDownload');
    
    if (!actualWorkId || !work) {
      console.log('❌ Missing workId or work:', { actualWorkId, work });
      toast({
        title: '❌ Ошибка',
        description: `Нет workId или work. workId=${actualWorkId}`,
        duration: 5000,
      });
      return;
    }
    
    const userStr = localStorage.getItem('user');
    console.log('👤 localStorage user:', userStr);
    
    if (!userStr) {
      toast({
        title: '❌ Нет данных пользователя',
        description: 'localStorage пуст, перенаправляем на логин',
        duration: 5000,
      });
      alert('Войдите в систему для покупки работы');
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userStr);
    const userId = user.id;
    
    setDownloading(true);
    
    try {
      // ✅ КРИТИЧНО: Получаем СВЕЖИЕ данные пользователя из backend перед покупкой
      toast({
        title: '🔄 Получаем актуальный баланс',
        description: 'Проверяем ваш текущий баланс в базе данных...',
        duration: 2000,
      });
      
      const authResponse = await fetch(func2url['auth'] + '?action=verify', {
        headers: {
          'X-Auth-Token': localStorage.getItem('token') || ''
        }
      });
      
      let freshUser = user;
      if (authResponse.ok) {
        const authData = await authResponse.json();
        if (authData.user) {
          freshUser = authData.user;
          // Обновляем localStorage свежими данными
          localStorage.setItem('user', JSON.stringify(freshUser));
          console.log('✅ Fresh user data from backend:', freshUser);
        }
      }
      
      toast({
        title: '👤 Актуальные данные',
        description: `ID: ${userId}, баланс: ${freshUser.balance} баллов, роль: ${freshUser.role}`,
        duration: 3000,
      });
      
      // Перепроверяем покупку перед действием
      let isAlreadyPurchased = isPurchased;
      
      try {
        const checkResponse = await fetch(`${func2url['user-data']}?user_id=${userId}&action=purchases`);
        const checkData = await checkResponse.json();
        if (checkData.purchases) {
          isAlreadyPurchased = checkData.purchases.some((p: any) => String(p.work_id) === String(actualWorkId));
          console.log('Double-check: Is purchased?', isAlreadyPurchased);
          setIsPurchased(isAlreadyPurchased);
        }
      } catch (error) {
        console.error('Error double-checking purchase:', error);
      }
      
      let downloadToken;
      
      // Если работа уже куплена, просто генерируем токен для скачивания
      if (isAlreadyPurchased) {
        console.log('Work already purchased, generating download token...');
        toast({
          title: '✅ Работа уже куплена',
          description: 'Генерируем токен для скачивания...',
          duration: 3000,
        });
        const tokenResponse = await fetch(`${PURCHASE_WORK_URL}?action=generate-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': String(userId)
          },
          body: JSON.stringify({
            workId: actualWorkId
          })
        });
        
        const tokenData = await tokenResponse.json();
        
        if (!tokenResponse.ok) {
          throw new Error(tokenData.error || 'Ошибка генерации токена');
        }
        
        downloadToken = tokenData.token;
      } else {
        // Если не куплена, пытаемся купить за баллы (используем freshUser!)
        const applicableDiscount = work.discount || userDiscount;
        const finalPrice = applicableDiscount > 0
          ? Math.round(work.price * (1 - applicableDiscount / 100))
          : work.price;
        
        console.log('💰 Work not purchased, attempting to purchase with баллы...', { 
          url: PURCHASE_WORK_URL, 
          userId, 
          workId: actualWorkId, 
          price: finalPrice,
          originalPrice: work.price,
          discount: work.discount,
          userBalance: freshUser.balance,
          userRole: freshUser.role
        });
        toast({
          title: '💰 Покупка работы',
          description: `Списываем ${finalPrice} баллов с баланса ${freshUser.balance}...`,
          duration: 3000,
        });
        const purchaseResponse = await fetch(PURCHASE_WORK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': String(userId)
          },
          body: JSON.stringify({
            workId: actualWorkId,
            userId: userId,
            price: finalPrice
          })
        });
        
        const purchaseData = await purchaseResponse.json();
        console.log('💳 Purchase response:', purchaseData);
        
        if (!purchaseResponse.ok) {
          // Если недостаточно баллов, получим payUrl для пополнения
          if (purchaseData.payUrl) {
            localStorage.setItem('pendingWorkPurchase', actualWorkId);
            window.location.href = purchaseData.payUrl;
            return;
          }
          throw new Error(purchaseData.error || 'Ошибка покупки');
        }
        
        // Получаем токен из ответа покупки
        downloadToken = purchaseData.downloadToken;
        
        // Обновляем статус покупки
        setIsPurchased(true);
        console.log('✅ Work purchased! Setting isPurchased to true');
        
        // Обновляем баланс пользователя в localStorage (если не админ)
        if (freshUser.role !== 'admin' && purchaseData.newBalance !== undefined) {
          freshUser.balance = purchaseData.newBalance;
          localStorage.setItem('user', JSON.stringify(freshUser));
        }
      }
      
      if (!downloadToken) {
        throw new Error('Не получен токен для скачивания');
      }
      
      // Шаг 2: Скачивание с использованием токена
      const downloadResponse = await fetch(
        `${DOWNLOAD_WORK_URL}?workId=${encodeURIComponent(actualWorkId)}&token=${encodeURIComponent(downloadToken)}`,
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
        
        // Отслеживаем скачивание
        fetch(func2url['work-stats'], {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ work_id: parseInt(actualWorkId), action: 'download' })
        }).catch(err => console.error('Failed to track download:', err));
      } catch (fetchError) {
        // Если fetch не сработал, открываем в новой вкладке
        window.location.href = downloadData.download_url;
        
        // Отслеживаем скачивание
        fetch(func2url['work-stats'], {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ work_id: parseInt(actualWorkId), action: 'download' })
        }).catch(err => console.error('Failed to track download:', err));
      }
      
      console.log('📢 Showing notification:', { isAlreadyPurchased, userRole: freshUser.role, isAdmin: freshUser.role === 'admin' });
      
      if (isAlreadyPurchased) {
        console.log('ℹ️ Work already purchased');
        toast({
          title: '✅ Работа уже куплена!',
          description: 'Скачивание началось...',
        });
      } else if (freshUser.role === 'admin') {
        console.log('👑 Admin download (free)');
        toast({
          title: '✅ Скачивание началось!',
          description: 'Файл сохранится в папку "Загрузки"',
        });
      } else {
        const oldBalance = freshUser.balance || 0;
        const finalPrice = work.discount 
          ? Math.round(work.price * (1 - work.discount / 100))
          : work.price;
        const deducted = finalPrice;
        const newBalance = purchaseData.newBalance || (oldBalance - deducted);
        
        console.log('💸 Showing deduction notification:', { oldBalance, deducted, newBalance });
        
        toast({
          title: '💳 Покупка успешна!',
          description: `Списано ${deducted} баллов\nНовый баланс: ${newBalance} баллов\n\n📥 Скачивание началось...`,
          duration: 5000,
        });
      }
      
      // Обновляем статус покупки
      if (!isAlreadyPurchased) {
        setIsPurchased(true);
      }
      
      // Открываем защитный пакет после успешной покупки
      navigate(`/defense-kit?workId=${actualWorkId}`);
      
    } catch (error) {
      console.error('Purchase/Download error:', error);
      alert(error instanceof Error ? error.message : 'Ошибка при покупке или скачивании');
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveWorkEdits = async () => {
    if (!actualWorkId || !work) return;
    
    try {
      const updatedData = {
        workId: actualWorkId,
        title: editedWork.title !== undefined ? editedWork.title : work.title,
        description: editedWork.description !== undefined ? editedWork.description : work.description,
        composition: editedWork.composition !== undefined ? editedWork.composition : work.composition,
        language: editedWork.language !== undefined ? editedWork.language : work.language,
        software: editedWork.software !== undefined ? editedWork.software : work.software,
        keywords: editedWork.keywords !== undefined ? editedWork.keywords : work.keywords,
        authorName: editedWork.authorName !== undefined ? editedWork.authorName : work.authorName
      };
      
      const response = await fetch(`${func2url['update-work']}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка обновления работы');
      }
      
      const newWork = {
        ...work,
        ...updatedData
      };
      
      setWork(newWork);
      setEditedWork({});
      setIsEditMode(false);
      
      localStorage.removeItem('catalog_works_cache_v9');
      
      alert('✅ Работа успешно обновлена!');
      
    } catch (error) {
      console.error('Error updating work:', error);
      alert('❌ Ошибка при обновлении работы: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
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
    const files = e.target.files;
    if (!files || files.length === 0 || !actualWorkId) return;

    const maxFiles = 5;
    const selectedFiles = Array.from(files).slice(0, maxFiles);
    
    if (files.length > maxFiles) {
      alert(`⚠️ Можно загрузить максимум ${maxFiles} изображений. Будут загружены первые ${maxFiles}.`);
    }

    setUploadingImage(true);

    try {
      const imagePromises = selectedFiles.map(file => {
        return new Promise<{file: string, filename: string}>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Image = (reader.result as string).split(',')[1];
            resolve({ file: base64Image, filename: file.name });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const images = await Promise.all(imagePromises);

      const UPLOAD_PREVIEW_URL = func2url['upload-preview'];
      const response = await fetch(UPLOAD_PREVIEW_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_id: actualWorkId,
          images: images
        })
      });

      const data = await response.json();

      if (data.success && data.all_urls && data.all_urls.length > 0) {
        setGallery(data.all_urls);
        setSelectedImage(0);
        
        if (work) {
          setWork({ ...work, previewUrl: data.all_urls[0] });
        }
        
        // Очищаем кеш каталога, чтобы новые изображения появились сразу
        localStorage.removeItem('catalog_works_cache_v9');
        
        alert(`✅ Успешно загружено ${data.all_urls.length} изображений! Обновите каталог, чтобы увидеть изменения.`);
      } else {
        alert('❌ Ошибка: ' + (data.error || 'Не удалось загрузить изображения'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Ошибка загрузки');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleExtractImagesFromArchive = async () => {
    if (!actualWorkId || !work) return;

    setExtractingImages(true);

    try {
      // Используем генератор превью из Word файлов
      const GENERATE_PREVIEW_URL = func2url['generate-work-preview'];
      const response = await fetch(`${GENERATE_PREVIEW_URL}?work_id=${actualWorkId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.preview_urls && data.preview_urls.length > 0) {
        setGallery(data.preview_urls);
        setSelectedImage(0);
        
        if (work) {
          setWork({ ...work, previewUrl: data.preview_urls[0] });
        }
        
        // Очищаем кеш каталога
        localStorage.removeItem('catalog_works_cache_v9');
        
        alert(`✅ Извлечено ${data.preview_urls.length} изображений из архива!`);
      } else {
        alert('⚠️ Изображения не найдены в архиве. Попробуйте загрузить вручную.');
      }
    } catch (error) {
      console.error('Extract error:', error);
      alert('❌ Ошибка извлечения изображений. Попробуйте загрузить вручную.');
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
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/30 to-white">
      <SEO 
        title={work ? `${work.title} — купить за ${work.price} баллов` : 'Просмотр работы'}
        description={work ? `${work.workType} по предмету "${work.subject}". ${work.description.substring(0, 150)}` : 'Детальная информация о студенческой работе'}
        keywords={work ? `${work.workType}, ${work.subject}, курсовая, диплом, купить` : 'студенческие работы'}
      />
      
      <Navigation isLoggedIn={isLoggedIn} />

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            'name': work.title,
            'description': work.description,
            'category': work.workType,
            'image': gallery.length > 0 ? gallery[0] : undefined,
            'offers': {
              '@type': 'Offer',
              'price': work.price,
              'priceCurrency': 'RUB',
              'availability': 'https://schema.org/InStock',
              'url': `https://techforma.pro/work/${actualWorkId}`
            },
            'aggregateRating': {
              '@type': 'AggregateRating',
              'ratingValue': work.rating,
              'bestRating': 5,
              'worstRating': 1,
              'reviewCount': work.reviewsCount || 1
            },
            'brand': {
              '@type': 'Brand',
              'name': 'Tech Forma'
            },
            'sku': actualWorkId,
            'additionalProperty': [
              {
                '@type': 'PropertyValue',
                'name': 'Предмет',
                'value': work.subject
              },
              {
                '@type': 'PropertyValue',
                'name': 'Тип работы',
                'value': work.workType
              }
            ]
          })}
        </script>
      </Helmet>
      
      <main className="container mx-auto px-4 py-4 md:py-6 mt-16 max-w-[1200px]">
        <Breadcrumbs items={[
          { label: 'Главная', href: '/' },
          { label: 'Каталог работ', href: '/catalog' },
          { label: 'Работа' }
        ]} />
        
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
              
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 leading-tight flex-1">
                  {work.title.charAt(0).toUpperCase() + work.title.slice(1)}
                </h1>
                {showUploadButton && (
                  <Button
                    variant={isEditMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (isEditMode) {
                        handleSaveWorkEdits();
                      } else {
                        setIsEditMode(true);
                        setEditedWork({
                          title: work.title,
                          description: work.description,
                          composition: work.composition
                        });
                      }
                    }}
                    className={isEditMode ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    <Icon name={isEditMode ? "Save" : "Edit"} size={16} className="mr-1" />
                    {isEditMode ? "Сохранить" : "Редактировать"}
                  </Button>
                )}
              </div>

              <div className="glass-card tech-border rounded-xl p-4">
                <TrustRating 
                  rating={work.rating}
                  purchaseCount={0}
                  isHit={false}
                  isNew={false}
                />
              </div>
            </div>

            {/* Статистика работы */}
            <div className="glass-card tech-border rounded-xl p-4 mb-6">
              <WorkActivityTracker 
                workId={parseInt(work.id)} 
                initialViews={work.viewsCount || 0}
                initialDownloads={work.downloadsCount || 0}
                initialReviews={work.reviewsCount || 0}
                onView={true}
                showLabels={true}
              />
            </div>

            <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
              {gallery.length > 0 ? (
                <>
                  <div 
                    className="bg-white rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm max-h-[600px] flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => {
                      setModalImageIndex(selectedImage);
                      setShowImageModal(true);
                    }}
                  >
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
                      accept="image/jpeg,image/jpg,image/png"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                  
                  <Button 
                    type="button"
                    variant="destructive"
                    className="w-full"
                    onClick={handleDeleteWork}
                  >
                    <Icon name="Trash2" className="mr-2 h-4 w-4" />
                    🗑️ Удалить работу
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Информация о работе: Автор, Язык, Софт */}
              <div className="glass-card tech-border rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Icon name="User" size={20} className="flex-shrink-0 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-0.5">Автор работы</div>
                    {isEditMode ? (
                      <Input
                        value={editedWork.authorName !== undefined ? editedWork.authorName || '' : work.authorName || ''}
                        onChange={(e) => setEditedWork({...editedWork, authorName: e.target.value || null})}
                        placeholder="Оставьте пустым для работ от платформы"
                        className="text-sm"
                      />
                    ) : (
                      <div className="font-medium text-gray-900">
                        {work.authorName || getFakeAuthor(work.id)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Icon name="Globe" size={20} className="flex-shrink-0 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-0.5">Язык работы</div>
                    {isEditMode ? (
                      <Input
                        value={editedWork.language || work.language || 'Русский'}
                        onChange={(e) => setEditedWork({...editedWork, language: e.target.value})}
                        placeholder="Русский"
                        className="text-sm"
                      />
                    ) : (
                      <div className="font-medium text-gray-900">{work.language}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Icon name="Code2" size={20} className="flex-shrink-0 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-0.5">Использованное ПО</div>
                    {isEditMode ? (
                      <Textarea
                        value={(editedWork.software || work.software || []).join(', ')}
                        onChange={(e) => setEditedWork({
                          ...editedWork, 
                          software: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        })}
                        placeholder="AutoCAD, КОМПАС-3D, Microsoft Word (через запятую)"
                        className="min-h-[60px] text-sm"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(work.software && work.software.length > 0) ? (
                          work.software.map((soft, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {soft}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">Не указано</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Описание работы</h2>
                {isEditMode ? (
                  <Textarea
                    value={editedWork.description || work.description}
                    onChange={(e) => setEditedWork({...editedWork, description: e.target.value})}
                    className="min-h-[150px] text-gray-700"
                    placeholder="Введите описание работы"
                  />
                ) : (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {work.description}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Содержание архива</h2>
                {isEditMode ? (
                  <Textarea
                    value={(editedWork.composition || work.composition).join('\n')}
                    onChange={(e) => setEditedWork({
                      ...editedWork, 
                      composition: e.target.value.split('\n').filter(line => line.trim())
                    })}
                    className="min-h-[120px] text-gray-700"
                    placeholder="Каждый пункт с новой строки"
                  />
                ) : (
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
                )}
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

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Ключевые слова</h2>
                {isEditMode ? (
                  <Textarea
                    value={(editedWork.keywords || work.keywords || []).join(', ')}
                    onChange={(e) => setEditedWork({
                      ...editedWork, 
                      keywords: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    })}
                    placeholder="курсовая работа, механика, расчет (через запятую)"
                    className="min-h-[80px] text-sm"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(work.keywords && work.keywords.length > 0) ? (
                      work.keywords.map((keyword, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors"
                          onClick={() => {
                            navigate(`/catalog?keyword=${encodeURIComponent(keyword)}`);
                          }}
                        >
                          <Icon name="Hash" size={12} className="mr-1" />
                          {keyword}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">Теги не добавлены</span>
                    )}
                  </div>
                )}
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
            <div className="glass-card tech-border rounded-xl p-4 md:p-6 lg:sticky lg:top-20 hover:shadow-xl transition-all">
              <div className="text-center mb-4 md:mb-5 pb-4 md:pb-5 border-b border-border">
                <div className="text-[10px] md:text-xs font-semibold text-muted-foreground mb-1 md:mb-2 uppercase tracking-wider">Стоимость</div>
                <div className="flex items-baseline justify-center gap-1.5">
                  {(work.discount || userDiscount > 0) ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl md:text-2xl font-semibold text-muted-foreground line-through">
                          {work.price.toLocaleString()}
                        </span>
                        <Badge className="bg-red-500 text-white text-xs">−{work.discount || userDiscount}%</Badge>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl md:text-4xl font-extrabold text-green-600">
                          {Math.round(work.price * (1 - (work.discount || userDiscount) / 100)).toLocaleString()}
                        </span>
                        <span className="text-base md:text-lg font-medium text-muted-foreground">баллов</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="text-3xl md:text-4xl font-extrabold text-primary">
                        {work.price.toLocaleString()}
                      </span>
                      <span className="text-base md:text-lg font-medium text-muted-foreground">баллов</span>
                    </>
                  )}
                </div>
              </div>



              <Button 
                size="default"
                className="w-full font-semibold rounded-lg mb-3 shadow-md hover:shadow-lg transition-all duration-200 h-10 md:h-11 text-sm md:text-base"
                onClick={() => {
                  console.log('🟢 BUTTON ONCLICK TRIGGERED!', {
                    isPurchased,
                    isAdmin,
                    downloading,
                    workId: actualWorkId,
                    workPrice: work?.price
                  });
                  handlePurchaseAndDownload();
                }}
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Скачивание...
                  </>
                ) : isPurchased ? (
                  <>
                    <Icon name="Download" size={18} className="mr-2" />
                    Скачать работу
                  </>
                ) : (
                  <>
                    <Icon name="Download" size={18} className="mr-2" />
                    Купить за {(work.discount || userDiscount > 0) ? Math.round(work.price * (1 - (work.discount || userDiscount) / 100)).toLocaleString() : work.price.toLocaleString()} баллов
                  </>
                )}
              </Button>

              <Button 
                variant="secondary"
                size="default"
                className="w-full font-semibold rounded-lg mb-4 md:mb-5 h-10 md:h-11 text-sm md:text-base bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  if (!isPurchased) {
                    alert('⚠️ Сначала нужно купить работу, чтобы создать пакет для защиты');
                    return;
                  }
                  navigate(`/defense-kit?workId=${actualWorkId}`);
                }}
                disabled={!isPurchased}
              >
                <Icon name="GraduationCap" size={18} className="mr-2" />
                {isPurchased ? 'Создать пакет для защиты' : '🔒 Купите работу для пакета защиты'}
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

              </div>

              <div className="mt-5 pt-5 border-t border-border">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Icon name="Lock" size={14} />
                  <span>Безопасная покупка</span>
                </div>
              </div>
              
              <WorkActivityTracker 
                workId={parseInt(actualWorkId || '0')} 
                onView={true}
                showLabels={false}
              />
            </div>
          </div>
        </div>

        <ReviewsSection workId={actualWorkId} isPurchased={isPurchased} />

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
      
      {/* Image Gallery Modal */}
      {showImageModal && gallery.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div 
            className="relative max-w-7xl w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              onClick={() => setShowImageModal(false)}
            >
              <Icon name="X" size={24} />
            </Button>

            {/* Previous button */}
            {gallery.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 text-white hover:bg-white/20 z-10 h-12 w-12"
                onClick={() => setModalImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length)}
              >
                <Icon name="ChevronLeft" size={32} />
              </Button>
            )}

            {/* Image */}
            <img 
              src={gallery[modalImageIndex]} 
              alt={`${work?.title} - страница ${modalImageIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />

            {/* Next button */}
            {gallery.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 text-white hover:bg-white/20 z-10 h-12 w-12"
                onClick={() => setModalImageIndex((prev) => (prev + 1) % gallery.length)}
              >
                <Icon name="ChevronRight" size={32} />
              </Button>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
              {modalImageIndex + 1} / {gallery.length}
            </div>
          </div>
        </div>
      )}

      {/* Секция отзывов - в самом конце */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ReviewsSection 
          workId={actualWorkId} 
          isPurchased={isPurchased}
          isAdmin={isAdmin}
        />
      </div>

      <Footer />
    </div>
  );
}