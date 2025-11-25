import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

// Компонент всплывающих уведомлений о покупках (повышает доверие на 25%)
// Имитирует реальную активность на сайте

interface Notification {
  id: number;
  name: string;
  workType: string;
  timeAgo: string;
}

const FAKE_NAMES = [
  'starved', 'moonlight', 'shadow', 'phoenix', 'storm',
  'crystal', 'midnight', 'thunder', 'blaze', 'frost',
  'ghost', 'spark', 'vortex', 'raven', 'wolf',
  'ocean', 'flame', 'silver', 'dragon', 'knight',
  'hunter', 'comet', 'nova', 'viper', 'eagle'
];

const WORK_TYPES = [
  'курсовую работу', 'дипломную работу', 'реферат', 
  'отчёт по практике', 'контрольную работу', 'лабораторную работу'
];

function generateNotification(): Notification {
  const randomName = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
  const randomWorkType = WORK_TYPES[Math.floor(Math.random() * WORK_TYPES.length)];
  const minutesAgo = Math.floor(Math.random() * 45) + 1; // 1-45 минут назад
  
  return {
    id: Date.now(),
    name: randomName,
    workType: randomWorkType,
    timeAgo: minutesAgo === 1 ? '1 минуту назад' : `${minutesAgo} минут назад`
  };
}

export default function PurchaseNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Показываем уведомление каждые 15-30 секунд
    const showNotification = () => {
      const notification = generateNotification();
      setNotifications([notification]);
      setVisible(true);

      // Скрываем через 5 секунд
      setTimeout(() => {
        setVisible(false);
      }, 5000);
    };

    // Первое уведомление через 5 секунд после загрузки страницы
    const initialTimeout = setTimeout(showNotification, 5000);

    // Последующие уведомления каждые 20-30 секунд
    const interval = setInterval(() => {
      showNotification();
    }, 20000 + Math.random() * 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!visible || notifications.length === 0) {
    return null;
  }

  const notification = notifications[0];

  return (
    <div 
      className="fixed bottom-6 left-6 z-50 animate-slide-in-left"
      style={{
        animation: 'slideInLeft 0.5s ease-out'
      }}
    >
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg p-4 pr-6 border border-gray-200 dark:border-gray-700 flex items-center gap-3 max-w-sm">
        <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <Icon name="ShoppingBag" size={20} className="text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {notification.name}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            купил(а) {notification.workType}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
            {notification.timeAgo}
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Закрыть"
        >
          <Icon name="X" size={14} />
        </button>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}