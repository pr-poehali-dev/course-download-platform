import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Category {
  name: string;
  slug: string;
  description: string;
  icon: string;
  count: number;
}

export default function CategoryLinksSection() {
  const categories: Category[] = [
    {
      name: 'Чертежи DWG',
      slug: 'dwg',
      description: 'AutoCAD чертежи деталей, узлов, сборок',
      icon: 'PenTool',
      count: 250,
    },
    {
      name: 'Модели STEP/STL',
      slug: '3d-models',
      description: '3D-модели для печати и обработки',
      icon: 'Box',
      count: 180,
    },
    {
      name: 'Проекты KOMPAS',
      slug: 'kompas',
      description: 'Чертежи и спецификации KOMPAS-3D',
      icon: 'FileCheck',
      count: 120,
    },
    {
      name: 'Расчёты прочности',
      slug: 'strength',
      description: 'Прочностные и деформационные расчёты',
      icon: 'Calculator',
      count: 95,
    },
    {
      name: 'SolidWorks проекты',
      slug: 'solidworks',
      description: 'Модели и сборки SolidWorks',
      icon: 'Wrench',
      count: 140,
    },
    {
      name: 'Гидравлика',
      slug: 'hydraulics',
      description: 'Гидравлические схемы и расчёты',
      icon: 'Droplet',
      count: 60,
    },
    {
      name: 'Электротехника',
      slug: 'electrical',
      description: 'Электрические схемы и проекты',
      icon: 'Zap',
      count: 85,
    },
    {
      name: 'Техдокументация',
      slug: 'docs',
      description: 'ТЗ, пояснительные записки, отчёты',
      icon: 'FileText',
      count: 110,
    }
  ];

  return (
    <section className="w-full py-20 bg-muted/30 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground section-title-line">
            Категории материалов
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Найдите нужные чертежи, модели или расчёты по направлению
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.slug}
              className="cyber-card rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => window.location.href = `/catalog?category=${category.slug}`}
            >
              <div className="flex flex-col h-full">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors border-2 border-primary/20">
                  <Icon name={category.icon as any} size={28} className="text-primary" />
                </div>
                
                <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4 flex-grow leading-relaxed">
                  {category.description}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Icon name="Database" size={14} />
                    {category.count}+ файлов
                  </span>
                  <Icon name="ArrowRight" size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 cyber-card rounded-2xl p-8 border-2 border-primary/30">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Icon name="Search" size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">
              Не нашли нужную категорию?
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              В каталоге 2000+ инженерных материалов. Используйте расширенный поиск по форматам, типам и дисциплинам
            </p>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white shadow-md"
              onClick={() => window.location.href = '/catalog'}
            >
              <Icon name="Filter" size={18} className="mr-2" />
              Открыть полный каталог
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
