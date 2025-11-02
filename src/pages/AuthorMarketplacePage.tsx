import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { authService } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function AuthorMarketplacePage() {
  const navigate = useNavigate();
  const [userStr] = useState(localStorage.getItem('user'));
  const user = userStr ? JSON.parse(userStr) : null;
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.verify();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  const features = [
    {
      icon: 'TrendingUp',
      title: 'Высокий процент',
      description: 'Получайте 90% от каждой продажи, мы берём всего 10%'
    },
    {
      icon: 'Shield',
      title: 'Защита авторства',
      description: 'Ваши работы защищены от копирования и плагиата'
    },
    {
      icon: 'Zap',
      title: 'Баллы для покупок',
      description: 'Тратьте заработанные баллы на работы других авторов'
    },
    {
      icon: 'Users',
      title: 'Большая аудитория',
      description: 'Тысячи студентов ищут готовые работы каждый день'
    },
    {
      icon: 'FileCheck',
      title: 'Легкая загрузка',
      description: 'Загружайте работы за пару минут через простую форму'
    },
    {
      icon: 'DollarSign',
      title: 'Пассивный доход',
      description: 'Одна работа может продаваться неограниченное количество раз'
    }
  ];

  const stats = [
    { value: '500+', label: 'Продано работ' },
    { value: '90%', label: 'Ваша выплата' },
    { value: '24/7', label: 'Работает магазин' }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Зарегистрируйтесь',
      description: 'Создайте аккаунт или войдите, если уже есть'
    },
    {
      step: 2,
      title: 'Загрузите работу',
      description: 'Заполните описание и загрузите файлы (PDF, DOCX, чертежи)'
    },
    {
      step: 3,
      title: 'Модерация',
      description: 'Мы проверим работу на качество и уникальность (1-2 дня)'
    },
    {
      step: 4,
      title: 'Получайте баллы',
      description: 'Работа появится в каталоге, вы получаете 90% баллов с каждой продажи'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation isLoggedIn={isLoggedIn} />
      
      <main className="container mx-auto px-4 py-12 mt-16 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Продавайте свои студенческие работы
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Загружайте готовые курсовые, дипломы и контрольные — получайте баллы для покупки работ других авторов. 
            90% баллов с каждой продажи остаются у вас!
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              className="text-lg px-8 h-14"
              onClick={() => user ? navigate('/upload') : navigate('/')}
            >
              <Icon name="Upload" size={20} className="mr-2" />
              {user ? 'Загрузить работу' : 'Начать зарабатывать'}
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 h-14"
              onClick={() => navigate('/catalog')}
            >
              <Icon name="Search" size={20} className="mr-2" />
              Посмотреть каталог
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="p-8 text-center border-2">
              <div className="text-5xl font-bold text-blue-600 mb-2">{stat.value}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </Card>
          ))}
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Почему авторы выбирают нас
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Icon name={feature.icon} size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Как это работает
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="p-12 text-center bg-gradient-to-r from-blue-50 to-indigo-50 border-2">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Готовы начать обмен работами?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Загрузите свою работу прямо сейчас — получайте баллы и покупайте работы других студентов!
          </p>
          <Button 
            size="lg"
            className="text-lg px-8 h-14"
            onClick={() => user ? navigate('/upload') : navigate('/')}
          >
            <Icon name="Rocket" size={20} className="mr-2" />
            {user ? 'Загрузить работу' : 'Зарегистрироваться'}
          </Button>
        </Card>
      </main>
    </div>
  );
}