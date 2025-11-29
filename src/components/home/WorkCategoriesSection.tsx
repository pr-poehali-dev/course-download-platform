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
    <section className="w-full py-20 bg-background border-b border-primary/20" id="categories">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground section-title-line">
            Категории материалов
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Справочные пособия для обучения
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div 
              key={category.id} 
              onClick={() => onCatalogClick(category.id)}
              className="cyber-card rounded-lg p-6 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                <Icon name={category.icon as any} size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{category.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{category.description}</p>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Icon name="FileText" size={14} />
                <span>{category.stats}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}