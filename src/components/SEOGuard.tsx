import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function SEOGuard() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    
    // Проверяем наличие технических расширений в URL
    const hasTechExtension = /\.(php|html|aspx|htm)($|\/)/.test(path);
    
    // Проверяем trailing slash (кроме корня)
    const hasTrailingSlash = path.length > 1 && path.endsWith('/');
    
    // Если URL содержит технические расширения или лишний слеш
    if (hasTechExtension || hasTrailingSlash) {
      // Добавляем meta noindex
      let metaRobots = document.querySelector('meta[name="robots"]');
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.setAttribute('name', 'robots');
        document.head.appendChild(metaRobots);
      }
      metaRobots.setAttribute('content', 'noindex, nofollow');
      
      // Пытаемся очистить URL
      let cleanPath = path;
      
      // Удаляем технические расширения
      cleanPath = cleanPath.replace(/\.(php|html|aspx|htm)(\/|$)/g, '$2');
      
      // Удаляем trailing slash
      if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
        cleanPath = cleanPath.slice(0, -1);
      }
      
      // Если путь изменился, делаем редирект
      if (cleanPath !== path) {
        window.location.replace(cleanPath + location.search + location.hash);
      }
    } else {
      // URL правильный - убираем noindex если он был
      const metaRobots = document.querySelector('meta[name="robots"]');
      if (metaRobots && metaRobots.getAttribute('content') === 'noindex, nofollow') {
        metaRobots.setAttribute('content', 'index, follow');
      }
    }
  }, [location]);

  return null;
}
