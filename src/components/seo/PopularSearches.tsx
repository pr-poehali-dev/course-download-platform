import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function PopularSearches() {
  const popularSearches = [
    {
      category: 'Курсовые работы',
      queries: [
        { text: 'купить курсовую работу недорого', url: '/catalog?search=курсовая' },
        { text: 'готовые курсовые работы', url: '/catalog?search=курсовая' },
        { text: 'курсовая работа цена', url: '/catalog?search=курсовая' },
        { text: 'где купить курсовую', url: '/catalog?search=курсовая' }
      ]
    },
    {
      category: 'Дипломные работы',
      queries: [
        { text: 'купить дипломную работу', url: '/catalog?search=дипломная' },
        { text: 'готовые дипломы', url: '/catalog?search=диплом' },
        { text: 'диплом купить недорого', url: '/catalog?search=диплом' },
        { text: 'вкр купить', url: '/catalog?search=вкр' }
      ]
    },
    {
      category: 'Другие работы',
      queries: [
        { text: 'купить реферат', url: '/catalog?search=реферат' },
        { text: 'отчет по практике купить', url: '/catalog?search=практика' },
        { text: 'контрольная работа купить', url: '/catalog?search=контрольная' },
        { text: 'лабораторная работа купить', url: '/catalog?search=лабораторная' }
      ]
    }
  ];

  return (
    <section className="w-full py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Популярные запросы студентов
          </h2>
          <p className="text-lg text-muted-foreground">
            Что чаще всего ищут студенты в 2025 году
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularSearches.map((section, index) => (
            <Card key={index} className="p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Icon name="Search" size={20} className="text-primary" />
                {section.category}
              </h3>
              <ul className="space-y-3">
                {section.queries.map((query, qIndex) => (
                  <li key={qIndex}>
                    <a
                      href={query.url}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                    >
                      <Icon name="TrendingUp" size={14} className="text-gray-400 group-hover:text-primary" />
                      <span className="group-hover:underline">{query.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/blog/gde-kupit-kursovuyu-rabotu-nedorogo-2025'}>
            <Icon name="BookOpen" size={32} className="mx-auto mb-2 text-primary" />
            <h4 className="font-bold text-sm mb-1">Где купить курсовую?</h4>
            <p className="text-xs text-muted-foreground">Топ-5 сервисов 2025</p>
          </Card>

          <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/blog/kak-kupit-kursovuyu-rabotu-bezopasno-instrukciya'}>
            <Icon name="Shield" size={32} className="mx-auto mb-2 text-green-600" />
            <h4 className="font-bold text-sm mb-1">Безопасная покупка</h4>
            <p className="text-xs text-muted-foreground">Пошаговая инструкция</p>
          </Card>

          <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/blog/skolko-stoit-kupit-kursovuyu-rabotu-2025-ceny'}>
            <Icon name="DollarSign" size={32} className="mx-auto mb-2 text-orange-600" />
            <h4 className="font-bold text-sm mb-1">Актуальные цены</h4>
            <p className="text-xs text-muted-foreground">Сколько стоит в 2025?</p>
          </Card>

          <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/catalog'}>
            <Icon name="Package" size={32} className="mx-auto mb-2 text-purple-600" />
            <h4 className="font-bold text-sm mb-1">500+ работ</h4>
            <p className="text-xs text-muted-foreground">Полный каталог</p>
          </Card>
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl border border-primary/20">
          <div className="text-center max-w-2xl mx-auto">
            <Icon name="Lightbulb" size={48} className="mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-3">
              Не нашли нужный запрос?
            </h3>
            <p className="text-muted-foreground mb-6">
              Используйте расширенный поиск в каталоге или напишите нам — мы поможем найти именно то, что вам нужно
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="/catalog"
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              >
                <Icon name="Search" size={18} className="mr-2" />
                Открыть каталог
              </a>
              <a
                href="mailto:tech.forma@yandex.ru"
                className="inline-flex items-center px-6 py-3 bg-white text-primary rounded-lg hover:bg-gray-50 transition-colors font-semibold border-2 border-primary"
              >
                <Icon name="Mail" size={18} className="mr-2" />
                Написать нам
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
