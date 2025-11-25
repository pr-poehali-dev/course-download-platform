import Icon from '@/components/ui/icon';

export default function PopularCategoriesLinks() {
  const categories = [
    { name: 'Курсовые по электроэнергетике', url: '/catalog?subject=Электроэнергетика', icon: 'Zap' },
    { name: 'Курсовые по автоматизации', url: '/catalog?subject=Автоматизация', icon: 'Settings' },
    { name: 'Курсовые по программированию', url: '/catalog?subject=Программирование', icon: 'Code' },
    { name: 'Дипломы по строительству', url: '/catalog?subject=Строительство', icon: 'Building' },
    { name: 'Курсовые по экономике', url: '/catalog?subject=Общая инженерия', icon: 'TrendingUp' },
    { name: 'Дипломные работы', url: '/catalog?workType=Дипломная работа', icon: 'GraduationCap' },
    { name: 'Все курсовые работы', url: '/catalog?workType=Курсовая работа', icon: 'BookOpen' },
    { name: 'Рефераты и контрольные', url: '/catalog?workType=Реферат', icon: 'FileText' },
  ];

  return (
    <section className="w-full py-12 bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
          Популярные категории студенческих работ
        </h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Быстрый доступ к самым востребованным категориям курсовых и дипломных работ
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <a
              key={index}
              href={category.url}
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon name={category.icon as any} size={20} className="text-primary" />
              </div>
              <span className="text-sm font-medium group-hover:text-primary transition-colors">
                {category.name}
              </span>
            </a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/catalog" 
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            Смотреть все 500+ работ в каталоге
            <Icon name="ArrowRight" size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
