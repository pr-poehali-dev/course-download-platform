import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface WorkCategoriesSectionProps {
  onCatalogClick: (category?: string) => void;
}

export default function WorkCategoriesSection({ onCatalogClick }: WorkCategoriesSectionProps) {
  const categories = [
    {
      id: 'coursework',
      title: 'Курсовые работы',
      description: 'Готовые курсовые работы по всем дисциплинам',
      icon: 'BookOpen',
      stats: '250+ работ',
      keywords: 'Купить курсовую работу недорого от 200₽. Готовые курсовые проекты с гарантией уникальности.'
    },
    {
      id: 'diploma',
      title: 'Дипломные работы',
      description: 'Дипломы и ВКР по всем специальностям',
      icon: 'GraduationCap',
      stats: '150+ работ',
      keywords: 'Купить дипломную работу или ВКР. Готовые дипломные проекты с документами.'
    },
    {
      id: 'referat',
      title: 'Рефераты',
      description: 'Рефераты и доклады быстро и недорого',
      icon: 'FileText',
      stats: '100+ работ',
      keywords: 'Скачать реферат по любому предмету. Готовые рефераты с оформлением по ГОСТ.'
    },
    {
      id: 'other',
      title: 'Контрольные работы',
      description: 'Контрольные, лабораторные, расчеты',
      icon: 'Calculator',
      stats: '50+ работ',
      keywords: 'Купить контрольную работу или лабораторную. Решенные задачи и расчеты.'
    }
  ];

  return (
    <section className="w-full py-12 sm:py-16 bg-white" id="categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Готовые студенческие работы по всем предметам
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Выберите нужный тип работы и найдите готовое решение за несколько минут
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-all hover:border-primary cursor-pointer group">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon name={category.icon as any} size={24} className="text-primary" />
                </div>
                <CardTitle className="text-xl">{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="CheckCircle2" size={16} className="text-green-600" />
                  <span>{category.stats}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {category.keywords}
                </p>
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                  onClick={() => onCatalogClick(category.id)}
                >
                  Смотреть работы
                  <Icon name="ArrowRight" size={16} className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
