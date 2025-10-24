import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export default function WorkDetailPage() {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [userReview, setUserReview] = useState('');
  const [userRating, setUserRating] = useState(0);

  const work = {
    id: parseInt(id || '1'),
    title: 'Курсовая работа по менеджменту',
    description: 'Полноценная курсовая работа по теме "Стратегическое планирование в современной организации". Включает в себя теоретическую и практическую части, список литературы, приложения.',
    category: 'Менеджмент',
    price: 150,
    author: 'Мария Петрова',
    authorRating: 4.9,
    authorSales: 45,
    rating: 4.8,
    reviewsCount: 12,
    pages: 45,
    format: 'DOCX',
    size: '2.3 МБ',
    uploadDate: '2024-09-15',
    sales: 28,
    tags: ['стратегия', 'планирование', 'менеджмент', 'организация']
  };

  const reviews: Review[] = [
    {
      id: 1,
      author: 'Александр И.',
      rating: 5,
      date: '2024-10-20',
      comment: 'Отличная работа! Все требования выполнены, структура четкая, источники актуальные. Рекомендую!'
    },
    {
      id: 2,
      author: 'Елена К.',
      rating: 5,
      date: '2024-10-18',
      comment: 'Качественная работа, помогла разобраться в теме. Спасибо автору!'
    },
    {
      id: 3,
      author: 'Дмитрий С.',
      rating: 4,
      date: '2024-10-15',
      comment: 'Хорошая работа, но пришлось немного доработать под требования своего преподавателя.'
    }
  ];

  const relatedWorks = [
    {
      id: 2,
      title: 'Анализ финансовых показателей предприятия',
      category: 'Экономика',
      price: 100,
      rating: 4.7
    },
    {
      id: 3,
      title: 'Проектирование базы данных',
      category: 'Информатика',
      price: 200,
      rating: 4.9
    }
  ];

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное',
      description: isFavorite ? 'Работа удалена из вашего списка избранного' : 'Теперь вы можете быстро найти эту работу'
    });
  };

  const handlePurchase = () => {
    toast({
      title: 'Переход к оплате',
      description: `Покупка работы "${work.title}" за ${work.price} баллов`
    });
  };

  const handleSubmitReview = () => {
    if (!userReview || userRating === 0) {
      toast({
        title: 'Ошибка',
        description: 'Поставьте оценку и напишите отзыв',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Отзыв отправлен',
      description: 'Спасибо за ваш отзыв!'
    });
    
    setUserReview('');
    setUserRating(0);
  };

  const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name="Star"
            size={interactive ? 24 : 16}
            className={`${
              star <= rating
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" asChild>
            <Link to="/">
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Назад в каталог
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <Badge className="mb-3">{work.category}</Badge>
                    <CardTitle className="text-3xl mb-2">{work.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {renderStars(work.rating)}
                        <span className="ml-1">{work.rating}</span>
                        <span>({work.reviewsCount} отзывов)</span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Icon name="Download" size={14} />
                        {work.sales} продаж
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleFavorite}
                    className={isFavorite ? 'text-red-500' : ''}
                  >
                    <Icon
                      name="Heart"
                      size={24}
                      className={isFavorite ? 'fill-red-500' : ''}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Описание работы</h3>
                  <p className="text-muted-foreground">{work.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Страниц</p>
                    <p className="font-semibold">{work.pages}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Формат</p>
                    <p className="font-semibold">{work.format}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Размер</p>
                    <p className="font-semibold">{work.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Загружено</p>
                    <p className="font-semibold">
                      {new Date(work.uploadDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Теги</h3>
                  <div className="flex flex-wrap gap-2">
                    {work.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Об авторе</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="User" size={32} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{work.author}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {renderStars(Math.round(work.authorRating))}
                        <span>{work.authorRating}</span>
                      </div>
                      <span>{work.authorSales} продаж</span>
                    </div>
                  </div>
                  <Button variant="outline">
                    Все работы автора
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Отзывы ({reviews.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-b pb-6">
                  <h4 className="font-semibold mb-3">Оставить отзыв</h4>
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-2 block">Ваша оценка</Label>
                      {renderStars(userRating, true, setUserRating)}
                    </div>
                    <Textarea
                      placeholder="Расскажите о вашем опыте использования этой работы..."
                      value={userReview}
                      onChange={(e) => setUserReview(e.target.value)}
                      rows={4}
                    />
                    <Button onClick={handleSubmitReview}>
                      <Icon name="Send" size={16} className="mr-2" />
                      Отправить отзыв
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{review.author}</p>
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.date).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-4xl">{work.price}</CardTitle>
                <CardDescription>баллов</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="lg" onClick={handlePurchase}>
                  <Icon name="ShoppingCart" size={18} className="mr-2" />
                  Купить работу
                </Button>
                <Button variant="outline" className="w-full" onClick={handleToggleFavorite}>
                  <Icon name="Heart" size={18} className="mr-2" />
                  {isFavorite ? 'В избранном' : 'Добавить в избранное'}
                </Button>

                <div className="pt-4 border-t space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="Shield" size={16} />
                    <span>Безопасная сделка</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="Download" size={16} />
                    <span>Мгновенное скачивание</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="RefreshCw" size={16} />
                    <span>Возврат в течение 7 дней</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Похожие работы</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedWorks.map((relatedWork) => (
                  <Link
                    key={relatedWork.id}
                    to={`/work/${relatedWork.id}`}
                    className="block p-3 border rounded-lg hover:border-primary transition-colors"
                  >
                    <Badge variant="outline" className="mb-2">
                      {relatedWork.category}
                    </Badge>
                    <h4 className="font-semibold mb-2 text-sm">{relatedWork.title}</h4>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        {renderStars(Math.round(relatedWork.rating))}
                        <span className="text-muted-foreground ml-1">
                          {relatedWork.rating}
                        </span>
                      </div>
                      <span className="font-semibold text-primary">
                        {relatedWork.price} б.
                      </span>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}