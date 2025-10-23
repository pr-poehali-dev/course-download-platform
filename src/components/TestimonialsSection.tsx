import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const testimonials = [
  {
    id: 1,
    name: 'Анна М.',
    role: 'Студентка 3 курса, Экономика',
    content: 'Нашла отличный пример курсовой по маркетингу. Помогло понять структуру и подход к анализу. Сэкономила кучу времени!',
    rating: 5,
    avatar: '👩‍🎓'
  },
  {
    id: 2,
    name: 'Дмитрий К.',
    role: 'Студент 4 курса, Программирование',
    content: 'Загрузил свою дипломную работу и уже заработал достаточно баллов, чтобы купить несколько нужных мне материалов. Взаимовыгодно!',
    rating: 5,
    avatar: '👨‍💻'
  },
  {
    id: 3,
    name: 'Елена С.',
    role: 'Студентка 2 курса, Строительство',
    content: 'Искала примеры чертежей систем водоснабжения — нашла именно то, что нужно. Качество на высоте, всё понятно оформлено.',
    rating: 5,
    avatar: '👷‍♀️'
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.id} 
              className="border-2 hover:border-primary/30 hover:shadow-xl transition-all hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
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
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
