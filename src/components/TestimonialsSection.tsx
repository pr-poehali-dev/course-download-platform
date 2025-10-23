import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useEffect, useState } from 'react';

const testimonials = [
  {
    id: 1,
    name: 'Анна Михайлова',
    role: 'Студентка 3 курса, Экономика',
    content: 'Нашла отличный пример курсовой по маркетингу. Помогло понять структуру и подход к анализу. Сэкономила кучу времени!',
    rating: 5,
    avatar: 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/cb6b9b2a-0da1-4164-8d76-57d3256af599.jpg'
  },
  {
    id: 2,
    name: 'Дмитрий Козлов',
    role: 'Студент 4 курса, Программирование',
    content: 'Загрузил свою дипломную работу и уже заработал достаточно баллов, чтобы купить несколько нужных мне материалов. Взаимовыгодно!',
    rating: 5,
    avatar: 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/c4616db5-dedc-4c94-a08e-5c7234ab5c41.jpg'
  },
  {
    id: 3,
    name: 'Елена Смирнова',
    role: 'Студентка 2 курса, Строительство',
    content: 'Искала примеры чертежей систем водоснабжения — нашла именно то, что нужно. Качество на высоте, всё понятно оформлено.',
    rating: 5,
    avatar: 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/20b6149d-afd0-4f08-9ae8-11cdd05de9cd.jpg'
  },
  {
    id: 4,
    name: 'Александр Петров',
    role: 'Студент 5 курса, Финансы',
    content: 'Платформа помогла найти актуальные дипломные работы по моей теме. Структура и подход вдохновили на собственное исследование.',
    rating: 5,
    avatar: 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/896c9497-5274-49b1-ac7c-45a7de3e8e36.jpg'
  },
  {
    id: 5,
    name: 'Мария Новикова',
    role: 'Студентка 3 курса, Медицина',
    content: 'Искала материалы по анатомии для курсовой. Нашла подробные схемы и описания. Всё систематизировано и понятно.',
    rating: 5,
    avatar: 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/556d9208-0212-4021-bb0f-f196c87a5b03.jpg'
  },
  {
    id: 6,
    name: 'Игорь Волков',
    role: 'Студент 4 курса, Юриспруденция',
    content: 'Загрузил несколько своих работ по гражданскому праву и получил доступ к нужным материалам. Очень удобная система обмена!',
    rating: 5,
    avatar: 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/2ed9f1c0-172e-4043-bbc4-a91b7eaeb236.jpg'
  },
  {
    id: 7,
    name: 'Ольга Кузнецова',
    role: 'Студентка 2 курса, Дизайн',
    content: 'Нашла вдохновение в портфолио других студентов. Поняла, как правильно оформить свой дипломный проект. Спасибо!',
    rating: 5,
    avatar: 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/cb6b9b2a-0da1-4164-8d76-57d3256af599.jpg'
  },
  {
    id: 8,
    name: 'Максим Соколов',
    role: 'Студент 3 курса, Архитектура',
    content: 'Отличная база чертежей и проектов! Помогло разобраться с нормативами и стандартами оформления.',
    rating: 5,
    avatar: 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/c4616db5-dedc-4c94-a08e-5c7234ab5c41.jpg'
  }
];

export default function TestimonialsSection() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const cardWidth = 384;
  const gap = 32;

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setScrollPosition(prev => {
        const maxScroll = testimonials.length * (cardWidth + gap);
        const newPosition = prev + 1;
        return newPosition >= maxScroll ? 0 : newPosition;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            <Icon name="MessageSquare" size={14} className="mr-2" />
            Отзывы студентов
          </Badge>
          <h2 className="text-5xl font-bold mb-4">Что говорят о нас</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Более 5000 студентов уже используют платформу для обмена работами
          </p>
        </div>

        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="flex gap-8 transition-transform"
            style={{ 
              transform: `translateX(-${scrollPosition}px)`,
              width: `${testimonials.length * 2 * (cardWidth + gap)}px`
            }}
          >
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <Card 
                key={`${testimonial.id}-${index}`}
                className="border-2 hover:border-primary/30 hover:shadow-xl transition-all hover:-translate-y-2 flex-shrink-0"
                style={{ width: `${cardWidth}px` }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Icon key={i} name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            <Icon name="Users" size={16} className="inline mr-2" />
            Присоединяйся к растущему сообществу студентов
          </p>
        </div>
      </div>
    </section>
  );
}