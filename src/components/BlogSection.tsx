import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const BLOG_POSTS = [
  {
    id: 1,
    title: 'Как написать идеальную курсовую работу',
    excerpt: 'Пошаговое руководство: от выбора темы до защиты. Структура, оформление, типичные ошибки и советы.',
    category: 'Советы',
    readTime: '8 мин',
    date: '20.10.2024',
    icon: 'BookOpen'
  },
  {
    id: 2,
    title: '10 способов сдать сессию без стресса',
    excerpt: 'Эффективные методики подготовки, тайм-менеджмент для студентов и психологические лайфхаки.',
    category: 'Обучение',
    readTime: '6 мин',
    date: '18.10.2024',
    icon: 'GraduationCap'
  },
  {
    id: 3,
    title: 'ГОСТ 2024: новые требования к оформлению',
    excerpt: 'Актуальные стандарты оформления студенческих работ, шрифты, отступы, список литературы.',
    category: 'Оформление',
    readTime: '10 мин',
    date: '15.10.2024',
    icon: 'FileText'
  },
  {
    id: 4,
    title: 'Как найти научные источники для диплома',
    excerpt: 'Лучшие базы данных, библиотеки, журналы. Критерии отбора литературы и правильное цитирование.',
    category: 'Исследования',
    readTime: '7 мин',
    date: '12.10.2024',
    icon: 'Search'
  },
  {
    id: 5,
    title: 'Антиплагиат: как повысить уникальность текста',
    excerpt: 'Легальные способы повышения оригинальности работы без потери смысла и качества.',
    category: 'Советы',
    readTime: '5 мин',
    date: '10.10.2024',
    icon: 'Shield'
  },
  {
    id: 6,
    title: 'Презентация к диплому: что важно знать',
    excerpt: 'Структура, дизайн, количество слайдов. Как подготовиться к защите и ответить на вопросы комиссии.',
    category: 'Защита',
    readTime: '9 мин',
    date: '08.10.2024',
    icon: 'Presentation'
  }
];

export default function BlogSection() {
  const navigate = useNavigate();

  return (
    <section id="blog" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Блог и советы</h2>
          <p className="text-lg text-muted-foreground">
            Полезные статьи для успешной учебы
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post) => (
            <Card 
              key={post.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/blog/${post.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={post.icon as any} size={24} className="text-primary" />
                  </div>
                  <Badge variant="secondary">{post.category}</Badge>
                </div>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Icon name="Calendar" size={14} />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Clock" size={14} />
                      {post.readTime}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/blog/${post.id}`);
                    }}
                  >
                    <Icon name="ArrowRight" size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            <Icon name="BookOpen" size={18} className="mr-2" />
            Все статьи блога
          </Button>
        </div>
      </div>
    </section>
  );
}