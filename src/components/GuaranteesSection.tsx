import Icon from '@/components/ui/icon';

export default function GuaranteesSection() {
  const guarantees = [
    {
      icon: 'ShieldCheck',
      title: 'Возврат баллов',
      description: 'Если работа не соответствует описанию — вернем баллы в течение 24 часов'
    },
    {
      icon: 'FileCheck',
      title: 'Модерация контента',
      description: 'Проверяем работы на наличие запрещённого контента перед публикацией'
    },
    {
      icon: 'Clock',
      title: 'Мгновенный доступ',
      description: 'Получите работу сразу после покупки — за 2 минуты'
    },
    {
      icon: 'Headphones',
      title: 'Поддержка 24/7',
      description: 'Техподдержка отвечает в течение 1 часа в любое время'
    },
    {
      icon: 'Lock',
      title: 'Безопасность данных',
      description: 'Ваши данные защищены — никому не передаем информацию о покупках'
    },
    {
      icon: 'Award',
      title: 'Стабильная платформа',
      description: 'Работаем с 2020 года — более 2500 пользователей платформы'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Почему нам доверяют?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Мы заботимся о каждом студенте и гарантируем прозрачность сделок
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guarantees.map((item, index) => (
            <div 
              key={index}
              className="group p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Icon name={item.icon as any} size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Icon name="Info" size={24} className="text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                💡 Как работает возврат баллов?
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <strong>1.</strong> Скачали работу, но она не подходит? Напишите в поддержку в течение 24 часов
                </p>
                <p>
                  <strong>2.</strong> Опишите проблему — почему работа не соответствует описанию
                </p>
                <p>
                  <strong>3.</strong> Модератор проверит вашу заявку и вернет баллы на баланс
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}