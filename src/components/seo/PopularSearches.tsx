import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function PopularSearches() {
  const popularSearches = [
    {
      category: 'CAD-форматы',
      queries: [
        { text: 'чертежи DWG скачать', url: '/catalog?search=dwg' },
        { text: 'модели STEP', url: '/catalog?search=step' },
        { text: 'файлы STL для печати', url: '/catalog?search=stl' },
        { text: 'проекты KOMPAS-3D', url: '/catalog?search=kompas' }
      ]
    },
    {
      category: 'Расчёты',
      queries: [
        { text: 'расчёт прочности', url: '/catalog?search=прочность' },
        { text: 'гидравлические расчёты', url: '/catalog?search=гидравлика' },
        { text: 'тепловые расчёты', url: '/catalog?search=тепло' },
        { text: 'расчёт деформаций', url: '/catalog?search=деформация' }
      ]
    },
    {
      category: 'Системы проектирования',
      queries: [
        { text: 'AutoCAD проекты', url: '/catalog?search=autocad' },
        { text: 'SolidWorks сборки', url: '/catalog?search=solidworks' },
        { text: 'Inventor модели', url: '/catalog?search=inventor' },
        { text: 'КОМПАС чертежи', url: '/catalog?search=компас' }
      ]
    }
  ];

  return (
    <section className="w-full py-20 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground section-title-line">
            Популярные запросы
          </h2>
          <p className="text-lg text-muted-foreground">
            Что чаще всего ищут инженеры на платформе
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularSearches.map((section, index) => (
            <div key={index} className="cyber-card rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <Icon name="Search" size={20} className="text-primary" />
                {section.category}
              </h3>
              <ul className="space-y-3">
                {section.queries.map((query, qIndex) => (
                  <li key={qIndex}>
                    <a
                      href={query.url}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                    >
                      <Icon name="TrendingUp" size={14} className="text-muted-foreground group-hover:text-primary" />
                      <span className="group-hover:underline">{query.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="cyber-card rounded-xl p-6 text-center hover:shadow-lg transition-all cursor-pointer group" onClick={() => window.location.href = '/catalog?format=dwg'}>
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/30 transition-colors">
              <Icon name="FileText" size={24} className="text-primary" />
            </div>
            <h4 className="font-bold text-sm mb-1 text-foreground">Формат DWG</h4>
            <p className="text-xs text-muted-foreground">250+ чертежей</p>
          </div>

          <div className="cyber-card rounded-xl p-6 text-center hover:shadow-lg transition-all cursor-pointer group" onClick={() => window.location.href = '/catalog?format=step'}>
            <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-secondary/30 transition-colors">
              <Icon name="Box" size={24} className="text-secondary" />
            </div>
            <h4 className="font-bold text-sm mb-1 text-foreground">3D-модели</h4>
            <p className="text-xs text-muted-foreground">180+ файлов</p>
          </div>

          <div className="cyber-card rounded-xl p-6 text-center hover:shadow-lg transition-all cursor-pointer group" onClick={() => window.location.href = '/catalog?type=calculations'}>
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/30 transition-colors">
              <Icon name="Calculator" size={24} className="text-primary" />
            </div>
            <h4 className="font-bold text-sm mb-1 text-foreground">Расчёты</h4>
            <p className="text-xs text-muted-foreground">95+ примеров</p>
          </div>

          <div className="cyber-card rounded-xl p-6 text-center hover:shadow-lg transition-all cursor-pointer group" onClick={() => window.location.href = '/catalog'}>
            <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-secondary/30 transition-colors">
              <Icon name="Database" size={24} className="text-secondary" />
            </div>
            <h4 className="font-bold text-sm mb-1 text-foreground">Весь каталог</h4>
            <p className="text-xs text-muted-foreground">500+ материалов</p>
          </div>
        </div>
      </div>
    </section>
  );
}