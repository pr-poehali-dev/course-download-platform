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
      title: 'Проектная документация',
      description: 'Технические задания, пояснительные записки, отчёты',
      icon: 'FileText',
      stats: '250+ документов',
      color: 'primary',
      keywords: 'Проектная документация, техническое задание'
    },
    {
      id: 'diploma',
      title: 'Чертежи DWG/DXF',
      description: 'AutoCAD, KOMPAS-3D, SolidWorks чертежи и схемы',
      icon: 'PenTool',
      stats: '150+ чертежей',
      color: 'secondary',
      keywords: 'Чертежи DWG DXF AutoCAD KOMPAS SolidWorks'
    },
    {
      id: 'referat',
      title: '3D-модели и сборки',
      description: 'Модели деталей, узлов, сборочные чертежи',
      icon: 'Box',
      stats: '100+ моделей',
      color: 'primary',
      keywords: '3D модели сборки детали'
    },
    {
      id: 'other',
      title: 'Расчёты и анализ',
      description: 'Прочностные, тепловые, гидравлические расчёты',
      icon: 'Calculator',
      stats: '50+ расчётов',
      color: 'secondary',
      keywords: 'Расчёты прочность анализ'
    }
  ];

  return (
    <section className="w-full py-20 bg-muted/30 border-b border-border" id="categories">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground section-title-line">
            Категории материалов
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Основные направления инженерных материалов
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const colorClass = category.color === 'primary' ? 'text-primary bg-primary/10 border-primary/20' : 'text-secondary bg-secondary/10 border-secondary/20';
            const iconColorClass = category.color === 'primary' ? 'text-primary' : 'text-secondary';
            
            return (
            <div 
              key={category.id} 
              onClick={() => onCatalogClick(category.id)}
              className="relative cyber-card rounded-xl p-6 transition-all cursor-pointer group overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-20 h-20 ${category.color === 'primary' ? 'bg-primary' : 'bg-secondary'} opacity-5 rounded-bl-full`}></div>
              
              <div className={`relative w-14 h-14 ${colorClass} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border-2`}>
                <Icon name={category.icon as any} size={28} className={iconColorClass} />
              </div>
              
              <div className="relative">
                <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">{category.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{category.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Icon name="Database" size={14} />
                    <span>{category.stats}</span>
                  </div>
                  <Icon name="ArrowRight" size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          );
          })}
        </div>
      </div>
    </section>
  );
}