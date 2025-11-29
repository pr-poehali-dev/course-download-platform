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
      title: 'Примеры учебных проектов',
      description: 'Образцы оформления и структуры проектов',
      icon: 'BookOpen',
      stats: '250+ примеров',
      keywords: 'Примеры учебных проектов для изучения. Образцы оформления и структурирования.'
    },
    {
      id: 'diploma',
      title: 'Техническая документация',
      description: 'Проектная документация и технические отчёты',
      icon: 'GraduationCap',
      stats: '150+ материалов',
      keywords: 'Примеры проектной документации и технических отчётов для изучения.'
    },
    {
      id: 'referat',
      title: 'Чертежи и CAD',
      description: 'Технические чертежи и CAD-проекты',
      icon: 'FileText',
      stats: '100+ чертежей',
      keywords: 'Чертежи DWG, DXF, CAD-проекты для изучения. Примеры оформления.'
    },
    {
      id: 'other',
      title: 'Технические расчёты',
      description: 'Примеры расчётов и вычислений',
      icon: 'Calculator',
      stats: '50+ примеров',
      keywords: 'Примеры технических расчётов и вычислений. Образцы для изучения.'
    }
  ];

  return (
    <section className="w-full py-12 sm:py-16 bg-white" id="categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            База технических материалов для обучения
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Справочные пособия, примеры проектов и техническая документация
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