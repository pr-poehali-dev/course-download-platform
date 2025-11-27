import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { authService } from '@/lib/auth';
import func2url from '../../backend/func2url.json';

interface SitemapData {
  total_urls: number;
  static_urls: number;
  work_urls: number;
  urls: Array<{
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: string;
  }>;
}

export default function SitemapViewPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sitemapData, setSitemapData] = useState<SitemapData | null>(null);
  const navigate = useNavigate();

  const SITEMAP_URL = func2url['sitemap'];

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.verify();
      setIsLoggedIn(!!user);
      
      if (user?.role === 'admin') {
        setIsAdmin(true);
        loadSitemap();
      } else {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

  const loadSitemap = async () => {
    try {
      const response = await fetch(`${SITEMAP_URL}?format=json`);
      const data = await response.json();
      setSitemapData(data);
    } catch (error) {
      console.error('Failed to load sitemap:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation isLoggedIn={isLoggedIn} />
        <main className="container mx-auto px-4 py-20 mt-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600">Загрузка sitemap...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/30 to-white">
      <Navigation isLoggedIn={isLoggedIn} />
      
      <main className="container mx-auto px-4 py-6 mt-16 max-w-7xl">
        <Button 
          variant="ghost" 
          className="mb-6 text-gray-600 hover:text-gray-900"
          onClick={() => navigate('/admin')}
        >
          <Icon name="ArrowLeft" size={18} className="mr-2" />
          Назад в админку
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Динамический Sitemap</h1>
          <p className="text-gray-600">
            Просмотр всех URL, доступных для индексации поисковыми системами
          </p>
        </div>

        {sitemapData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card tech-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Всего URL</span>
                  <Icon name="Globe" size={20} className="text-blue-600" />
                </div>
                <div className="text-3xl font-bold">{sitemapData.total_urls}</div>
              </div>

              <div className="glass-card tech-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Статические страницы</span>
                  <Icon name="FileText" size={20} className="text-green-600" />
                </div>
                <div className="text-3xl font-bold">{sitemapData.static_urls}</div>
              </div>

              <div className="glass-card tech-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Карточки работ</span>
                  <Icon name="Package" size={20} className="text-purple-600" />
                </div>
                <div className="text-3xl font-bold">{sitemapData.work_urls}</div>
              </div>
            </div>

            <div className="glass-card tech-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Ссылки для robots.txt</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(SITEMAP_URL, '_blank')}
                >
                  <Icon name="ExternalLink" size={16} className="mr-2" />
                  Открыть XML
                </Button>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400">
                <code>Sitemap: {SITEMAP_URL}</code>
              </div>
            </div>

            <div className="glass-card tech-border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Примеры URL (первые 20)</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sitemapData.urls.slice(0, 20).map((url, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <a 
                        href={url.loc} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm truncate block"
                      >
                        {url.loc}
                      </a>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>📅 {url.lastmod}</span>
                        <span>🔄 {url.changefreq}</span>
                        <span>⭐ {url.priority}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {url.loc.includes('/work/') ? 'Работа' : 'Страница'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card tech-border rounded-xl p-6 bg-blue-50">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Как использовать этот sitemap?</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Откройте <a href="https://webmaster.yandex.ru" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Яндекс.Вебмастер</a></li>
                    <li>Добавьте сайт techforma.pro (если еще не добавлен)</li>
                    <li>В разделе "Индексирование → Файлы Sitemap" добавьте URL: <code className="bg-white px-2 py-1 rounded text-xs">{SITEMAP_URL}</code></li>
                    <li>Яндекс начнёт индексацию всех 488 карточек работ автоматически</li>
                    <li>Sitemap обновляется автоматически при добавлении новых работ</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
