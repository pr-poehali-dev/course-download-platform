import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

const testimonials = [
  {
    id: 1,
    name: 'Анна Михайлова',
    role: 'Студентка 3 курса, Информатика',
    content: 'Нашла отличный пример курсовой по алгоритмам и структурам данных. Помогло понять подход к реализации. Сэкономила кучу времени!',
    rating: 5,
    avatar: 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/635e5e5b-e003-4fbc-bd96-adffbbeabd1a.jpg'
  },
  {
    id: 2,
    name: 'Дмитрий Козлов',
    role: 'Студент 4 курса, Программирование',
    content: 'Загрузил свою дипломную работу по разработке веб-приложения и уже получил достаточно баллов для покупок. Взаимовыгодно!',
    rating: 5,
    avatar: 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/59c5e93e-9b7d-4c3f-beb8-4c3065f56831.jpg'
  },
  {
    id: 3,
    name: 'Елена Смирнова',
    role: 'Студентка 2 курса, Машиностроение',
    content: 'Искала примеры расчетов деталей машин — нашла именно то, что нужно. Качество на высоте, всё понятно оформлено.',
    rating: 5,
    avatar: 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/0936f6cd-ef31-4e47-8f3f-1fd604e87311.jpg'
  },
  {
    id: 4,
    name: 'Александр Петров',
    role: 'Студент 5 курса, Разработка ПО',
    content: 'Платформа помогла найти актуальные дипломные работы по микросервисной архитектуре. Структура и подход вдохновили на собственное исследование.',
    rating: 5,
    avatar: 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/13b69d91-e3af-4d12-a658-e2b91da39647.jpg'
  },
  {
    id: 5,
    name: 'Мария Новикова',
    role: 'Студентка 3 курса, Электротехника',
    content: 'Искала материалы по расчету электрических цепей для курсовой. Нашла подробные схемы и описания. Всё систематизировано.',
    rating: 5,
    avatar: 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/6f9980b6-e4d0-4ce5-8e3e-bb3cf39401db.jpg'
  },
  {
    id: 6,
    name: 'Игорь Волков',
    role: 'Студент 4 курса, Робототехника',
    content: 'Загрузил несколько своих работ по системам управления роботами и получил доступ к нужным материалам. Очень удобная система обмена!',
    rating: 5,
    avatar: 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/826d26b3-1adc-4a70-ac5b-1ca311c7115e.jpg'
  },
  {
    id: 7,
    name: 'Ольга Кузнецова',
    role: 'Студентка 2 курса, Data Science',
    content: 'Нашла отличные примеры анализа данных и машинного обучения. Поняла, как правильно оформить свой проект. Спасибо!',
    rating: 5,
    avatar: 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/c2dbf536-2c74-4f34-b243-c85547e0b9db.jpg'
  },
  {
    id: 8,
    name: 'Максим Соколов',
    role: 'Студент 3 курса, Аэрокосмическая техника',
    content: 'Отличная база расчетов и чертежей летательных аппаратов! Помогло разобраться с аэродинамическими расчетами.',
    rating: 5,
    avatar: 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/440faf8d-8ee5-4d2e-aca4-439ca093da6a.jpg'
  },
  {
    id: 9,
    name: 'Виктория Егорова',
    role: 'Студентка 4 курса, Кибербезопасность',
    content: 'Нашла качественные работы по криптографии и защите информации. Очень помогло при подготовке дипломного проекта!',
    rating: 5,
    avatar: 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/d78e10ec-1f89-43cb-aac6-8d859c431175.jpg'
  }
];

export default function TestimonialsSection() {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  const displayedTestimonials = testimonials.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

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
            Присоединяйтесь к растущему сообществу студентов для обмена работами
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {displayedTestimonials.map((testimonial, index) => (
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
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                    loading="lazy"
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

        <div className="flex items-center justify-center gap-4 mt-12">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            className="rounded-full"
          >
            <Icon name="ChevronLeft" size={20} />
          </Button>
          
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentPage 
                    ? 'bg-primary w-8' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="rounded-full"
          >
            <Icon name="ChevronRight" size={20} />
          </Button>
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            <Icon name="Users" size={16} className="inline mr-2" />
            Присоединяйся к растущему сообществу студентов
          </p>
        </div>
      </div>
    </section>
  );
}