import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Category {
  name: string;
  slug: string;
  description: string;
  icon: string;
  count: number;
  keywords: string[];
}

export default function CategoryLinksSection() {
  const categories: Category[] = [
    {
      name: 'Курсовые работы',
      slug: 'kursovye-raboty',
      description: 'Готовые курсовые работы по всем предметам от 200₽',
      icon: 'FileText',
      count: 350,
      keywords: ['курсовая работа купить', 'готовые курсовые', 'курсовая недорого']
    },
    {
      name: 'Дипломные работы',
      slug: 'diplomnye-raboty',
      description: 'ВКР и дипломные проекты с гарантией качества от 500₽',
      icon: 'GraduationCap',
      count: 120,
      keywords: ['диплом купить', 'готовые дипломы', 'дипломная работа']
    },
    {
      name: 'Рефераты',
      slug: 'referaty',
      description: 'Рефераты по всем дисциплинам от 100₽',
      icon: 'FileCheck',
      count: 80,
      keywords: ['реферат купить', 'готовые рефераты', 'скачать реферат']
    },
    {
      name: 'Контрольные работы',
      slug: 'kontrolnye-raboty',
      description: 'Готовые контрольные работы от 150₽',
      icon: 'ClipboardCheck',
      count: 60,
      keywords: ['контрольная купить', 'готовые контрольные', 'контрольная работа']
    },
    {
      name: 'Отчеты по практике',
      slug: 'otchety-po-praktike',
      description: 'Отчеты по практике с дневниками от 200₽',
      icon: 'Briefcase',
      count: 45,
      keywords: ['отчет по практике купить', 'готовый отчет практика']
    },
    {
      name: 'Лабораторные работы',
      slug: 'laboratornye-raboty',
      description: 'Лабораторные работы с расчетами от 100₽',
      icon: 'FlaskConical',
      count: 70,
      keywords: ['лабораторная работа купить', 'готовые лабораторные']
    },
    {
      name: 'Чертежи',
      slug: 'chertezhi',
      description: 'Технические чертежи в AutoCAD от 250₽',
      icon: 'Ruler',
      count: 55,
      keywords: ['чертежи купить', 'чертежи AutoCAD', 'технические чертежи']
    },
    {
      name: 'Диссертации',
      slug: 'dissertacii',
      description: 'Магистерские и кандидатские диссертации от 1000₽',
      icon: 'BookOpen',
      count: 25,
      keywords: ['диссертация купить', 'магистерская диссертация']
    }
  ];

  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Категории студенческих работ
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Выберите нужный тип работы и найдите готовое решение за минуты
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card
              key={category.slug}
              className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
            >
              <div className="flex flex-col h-full">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon name={category.icon as any} size={24} className="text-primary" />
                </div>
                
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4 flex-grow">
                  {category.description}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm font-semibold text-primary">
                    {category.count}+ работ
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group-hover:bg-primary/10"
                    onClick={() => window.location.href = `/catalog?category=${category.slug}`}
                  >
                    Смотреть
                    <Icon name="ArrowRight" size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-8 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl border border-primary/20">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-3">
              Не нашли нужную категорию?
            </h3>
            <p className="text-muted-foreground mb-6">
              В каталоге более 500 работ по всем дисциплинам. Используйте поиск или фильтры для точного результата
            </p>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90"
              onClick={() => window.location.href = '/catalog'}
            >
              <Icon name="Search" size={18} className="mr-2" />
              Открыть полный каталог
            </Button>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 p-6 rounded-lg border-l-4 border-primary">
          <h4 className="text-lg font-bold mb-3 text-primary">
            💡 Популярные запросы студентов
          </h4>
          <div className="flex flex-wrap gap-2">
            {[
              'купить курсовую работу недорого',
              'готовые дипломы',
              'где купить курсовую',
              'скачать реферат',
              'купить отчет по практике',
              'готовые контрольные работы',
              'чертежи AutoCAD купить',
              'купить лабораторную работу'
            ].map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                onClick={() => window.location.href = `/catalog?search=${encodeURIComponent(keyword)}`}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
