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
        { text: 'проекты KOMPAS-3D', url: '/catalog?search=kompas' },
        { text: 'чертежи AutoCAD бесплатно', url: '/catalog?search=autocad' },
        { text: 'файлы DXF скачать', url: '/catalog?search=dxf' },
        { text: 'чертежи CDW КОМПАС', url: '/catalog?search=cdw' }
      ]
    },
    {
      category: 'Расчёты',
      queries: [
        { text: 'расчёт прочности', url: '/catalog?search=прочность' },
        { text: 'гидравлические расчёты', url: '/catalog?search=гидравлика' },
        { text: 'тепловые расчёты', url: '/catalog?search=тепло' },
        { text: 'расчёт деформаций', url: '/catalog?search=деформация' },
        { text: 'расчёт электрических нагрузок', url: '/catalog?search=электрические+нагрузки' },
        { text: 'расчёт освещения', url: '/catalog?search=освещение' },
        { text: 'прочностной анализ', url: '/catalog?search=прочностной+анализ' }
      ]
    },
    {
      category: 'Системы проектирования',
      queries: [
        { text: 'AutoCAD проекты', url: '/catalog?search=autocad' },
        { text: 'SolidWorks сборки', url: '/catalog?search=solidworks' },
        { text: 'Inventor модели', url: '/catalog?search=inventor' },
        { text: 'КОМПАС чертежи', url: '/catalog?search=компас' },
        { text: 'CATIA модели', url: '/catalog?search=catia' },
        { text: 'Revit проекты', url: '/catalog?search=revit' },
        { text: 'NX Siemens', url: '/catalog?search=nx+siemens' }
      ]
    },
    {
      category: 'Курсовые и дипломы',
      queries: [
        { text: 'курсовая по электроснабжению', url: '/catalog?search=электроснабжение' },
        { text: 'дипломный проект скачать', url: '/catalog?search=дипломный+проект' },
        { text: 'курсовой проект механика', url: '/catalog?search=механика' },
        { text: 'РГР по сопромату', url: '/catalog?search=сопромат' },
        { text: 'курсовая электропривод', url: '/catalog?search=электропривод' },
        { text: 'готовая курсовая работа', url: '/catalog?search=курсовая' },
        { text: 'диплом энергетика', url: '/catalog?search=энергетика' }
      ]
    },
    {
      category: 'Специальности',
      queries: [
        { text: 'теплоэнергетика проекты', url: '/catalog?search=теплоэнергетика' },
        { text: 'электроэнергетика расчёты', url: '/catalog?search=электроэнергетика' },
        { text: 'машиностроение чертежи', url: '/catalog?search=машиностроение' },
        { text: 'строительство проекты', url: '/catalog?search=строительство' },
        { text: 'автоматизация производства', url: '/catalog?search=автоматизация' },
        { text: 'нефтегаз проекты', url: '/catalog?search=нефтегаз' }
      ]
    },
    {
      category: 'Типы работ',
      queries: [
        { text: 'РГР с решениями', url: '/catalog?search=ргр' },
        { text: 'расчётно-графическая работа', url: '/catalog?search=расчётно-графическая' },
        { text: 'контрольная работа ТММ', url: '/catalog?search=тмм' },
        { text: 'лабораторные работы', url: '/catalog?search=лабораторные' },
        { text: 'практические задания', url: '/catalog?search=практические' },
        { text: 'курсовик с чертежами', url: '/catalog?search=чертежи' },
        { text: 'готовые проекты студентам', url: '/catalog?search=проекты' },
        { text: 'технические чертежи скачать', url: '/catalog?search=технические+чертежи' }
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="cyber-card rounded-xl p-4 text-center hover:shadow-lg transition-all cursor-pointer group" onClick={() => window.location.href = '/catalog?format=dwg'}>
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/30 transition-colors">
              <Icon name="FileText" size={20} className="text-primary" />
            </div>
            <h4 className="font-bold text-xs mb-1 text-foreground">DWG</h4>
            <p className="text-xs text-muted-foreground">250+</p>
          </div>

          <div className="cyber-card rounded-xl p-4 text-center hover:shadow-lg transition-all cursor-pointer group" onClick={() => window.location.href = '/catalog?format=step'}>
            <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-secondary/30 transition-colors">
              <Icon name="Box" size={20} className="text-secondary" />
            </div>
            <h4 className="font-bold text-xs mb-1 text-foreground">STEP</h4>
            <p className="text-xs text-muted-foreground">180+</p>
          </div>

          <div className="cyber-card rounded-xl p-4 text-center hover:shadow-lg transition-all cursor-pointer group" onClick={() => window.location.href = '/catalog?format=stl'}>
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/30 transition-colors">
              <Icon name="Printer" size={20} className="text-primary" />
            </div>
            <h4 className="font-bold text-xs mb-1 text-foreground">STL</h4>
            <p className="text-xs text-muted-foreground">120+</p>
          </div>

          <div className="cyber-card rounded-xl p-4 text-center hover:shadow-lg transition-all cursor-pointer group" onClick={() => window.location.href = '/catalog?search=компас'}>
            <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-secondary/30 transition-colors">
              <Icon name="Compass" size={20} className="text-secondary" />
            </div>
            <h4 className="font-bold text-xs mb-1 text-foreground">КОМПАС</h4>
            <p className="text-xs text-muted-foreground">200+</p>
          </div>

          <div className="cyber-card rounded-xl p-4 text-center hover:shadow-lg transition-all cursor-pointer group" onClick={() => window.location.href = '/catalog?type=calculations'}>
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/30 transition-colors">
              <Icon name="Calculator" size={20} className="text-primary" />
            </div>
            <h4 className="font-bold text-xs mb-1 text-foreground">Расчёты</h4>
            <p className="text-xs text-muted-foreground">95+</p>
          </div>

          <div className="cyber-card rounded-xl p-4 text-center hover:shadow-lg transition-all cursor-pointer group" onClick={() => window.location.href = '/catalog'}>
            <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-secondary/30 transition-colors">
              <Icon name="Database" size={20} className="text-secondary" />
            </div>
            <h4 className="font-bold text-xs mb-1 text-foreground">Каталог</h4>
            <p className="text-xs text-muted-foreground">500+</p>
          </div>
        </div>
      </div>
    </section>
  );
}