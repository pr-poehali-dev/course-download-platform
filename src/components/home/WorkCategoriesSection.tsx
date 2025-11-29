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
          <div className="inline-block px-4 py-2 cyber-card rounded-full text-xs uppercase tracking-widest text-primary mb-4">
            <Icon name="Grid3x3" size={14} className="inline mr-2" />
            База материалов
          </div>
          <h2 className="text-3xl sm:text-5xl font-black mb-4 text-primary" style={{fontFamily: 'Orbitron'}}>
            КАТЕГОРИИ
          </h2>
          <p className="text-base text-cyan-300 max-w-2xl mx-auto tracking-wide">
            Справочные пособия для обучения
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div 
              key={category.id} 
              onClick={() => onCatalogClick(category.id)}
              className="cyber-card rounded-lg p-6 hover:scale-105 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-cyber-cyan rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-primary/50 transition-all">
                  <Icon name={category.icon as any} size={28} className="text-background" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground uppercase tracking-wide">{category.title}</h3>
                <p className="text-sm text-cyan-400 mb-4 leading-relaxed">{category.description}</p>
                <div className="text-xs text-primary/70 flex items-center gap-2 font-mono">
                  <Icon name="Database" size={14} />
                  <span>{category.stats}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}