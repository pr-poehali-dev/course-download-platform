import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function SEOGuard() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const mainDomain = 'https://techforma.pro';
    
    // Список несуществующих путей, которые должны редиректить на главную
    const nonExistentPaths = [
      '/index.html', '/index.php', '/page', '/shop/page',
      '/product', '/category', '/linkexchange', '/default.aspx',
      '/index.php/page', '/index.php/homepage'
    ];
    
    // Проверяем, является ли путь несуществующим
    const isNonExistent = nonExistentPaths.some(p => 
      path === p || path === p + '/'
    );
    
    // Если это несуществующий путь - редиректим на главную
    if (isNonExistent) {
      window.location.replace('/');
      return;
    }
    
    // Проверяем наличие технических расширений в URL
    const hasTechExtension = /\.(php|html|aspx|htm)($|\/)/.test(path);
    
    // Проверяем trailing slash (кроме корня)
    const hasTrailingSlash = path.length > 1 && path.endsWith('/');
    
    // Формируем канонический URL (чистый, без расширений и слешей)
    let cleanPath = path;
    
    // Убираем технические расширения
    cleanPath = cleanPath.replace(/\.(php|html|aspx|htm)(\/|$)/g, '$2');
    
    // Убираем trailing slash
    if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
      cleanPath = cleanPath.slice(0, -1);
    }
    
    // Убираем UTM метки и рекламные параметры из canonical URL
    const cleanSearch = new URLSearchParams(location.search);
    const adsParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', '_ym_uid', 'yclid', 'ref'];
    adsParams.forEach(param => cleanSearch.delete(param));
    const cleanSearchString = cleanSearch.toString() ? '?' + cleanSearch.toString() : '';
    
    // Обновляем или создаём canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = mainDomain + cleanPath + cleanSearchString;
    
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
      
      // Делаем редирект на чистый URL
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