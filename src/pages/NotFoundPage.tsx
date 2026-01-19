import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Icon from "@/components/ui/icon";

// Типы для Яндекс.Метрики
declare global {
  interface Window {
    ym?: (counterId: number, event: string, goal: string, params?: Record<string, unknown>) => void;
  }
}

const NotFoundPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const popularCategories = [
    { name: 'Чертежи DWG', url: '/catalog?category=dwg', icon: 'Ruler' },
    { name: '3D-модели', url: '/catalog?category=3d', icon: 'Box' },
    { name: 'Расчёты', url: '/catalog?category=calc', icon: 'Calculator' },
    { name: 'Документация', url: '/catalog?category=docs', icon: 'FileText' },
  ];

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  useEffect(() => {
    // Устанавливаем правильный статус 404 для страницы
    if (typeof window !== 'undefined') {
      // Добавляем meta-тег со статусом 404
      const metaStatus = document.createElement('meta');
      metaStatus.httpEquiv = 'status';
      metaStatus.content = '404';
      metaStatus.id = 'meta-status-404';
      
      // Удаляем старый если есть
      const oldMeta = document.getElementById('meta-status-404');
      if (oldMeta) oldMeta.remove();
      
      document.head.appendChild(metaStatus);
      
      // Отправляем событие в аналитику
      if (window.ym) {
        window.ym(99299244, 'reachGoal', '404_error', { url: location.pathname });
      }
      
      return () => {
        const meta = document.getElementById('meta-status-404');
        if (meta) meta.remove();
      };
    }
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Ошибка 404: Страница не найдена</title>
        <meta name="description" content="Запрашиваемая страница не найдена. Вернитесь на главную или перейдите в каталог чертежей и 3D-моделей." />
        <meta name="robots" content="noindex, nofollow" />
        <meta httpEquiv="status" content="404 Not Found" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Ошибка 404: Страница не найдена",
            "description": "Запрашиваемая страница не существует",
            "url": `https://techforma.pro${location.pathname}`
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation isLoggedIn={false} />
        
        <main className="flex-grow flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-2xl">
            <div className="mb-8">
              <Icon name="FileQuestion" size={120} className="text-primary/30 mx-auto mb-6" />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-4 text-foreground">404</h1>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
              Страница не найдена (404)
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-2">
              Запрашиваемая страница <code className="bg-muted px-2 py-1 rounded text-sm">{location.pathname}</code> не существует.
            </p>
            <p className="text-base md:text-lg text-muted-foreground mb-8">
              Возможно, она была удалена или вы ввели неверный адрес.
              <br />
              Вернитесь на главную или воспользуйтесь каталогом работ.
            </p>
            
            {/* Поиск по сайту */}
            <form onSubmit={handleSearch} className="mb-8 max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по каталогу работ..."
                  className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-border bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-accent rounded-md transition-colors"
                  aria-label="Поиск"
                >
                  <Icon name="Search" size={20} className="text-muted-foreground" />
                </button>
              </div>
            </form>

            {/* Основные кнопки */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold shadow-md"
              >
                <Icon name="Home" size={20} />
                На главную
              </a>
              <a
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-border rounded-lg hover:bg-accent transition-colors font-semibold text-foreground"
              >
                <Icon name="FolderOpen" size={20} />
                Весь каталог
              </a>
            </div>

            {/* Популярные категории */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Популярные категории:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {popularCategories.map((category) => (
                  <a
                    key={category.url}
                    href={category.url}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all group"
                  >
                    <Icon name={category.icon as any} size={28} className="text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-center text-foreground">{category.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Дополнительные ссылки */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <a href="/blog" className="hover:text-primary transition-colors flex items-center gap-1">
                <Icon name="BookOpen" size={16} />
                Блог
              </a>
              <a href="/contacts" className="hover:text-primary transition-colors flex items-center gap-1">
                <Icon name="Mail" size={16} />
                Контакты
              </a>
              <a href="/marketplace" className="hover:text-primary transition-colors flex items-center gap-1">
                <Icon name="Store" size={16} />
                Маркетплейс
              </a>
            </div>
            
            <div className="text-sm text-muted-foreground/60 mt-8">
              <p>Статус ответа сервера: <strong>404 Not Found</strong></p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default NotFoundPage;