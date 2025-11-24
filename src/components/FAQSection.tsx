import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Helmet } from 'react-helmet-async';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'Как купить готовую курсовую или диплом на Tech Forma?',
    answer: 'Зарегистрируйтесь на платформе и получите 1000 приветственных баллов. Выберите работу в каталоге, оплатите баллами, и мгновенно скачайте архив с файлами. Поддерживаются форматы: DOCX, PDF, DWG, CDW и другие.'
  },
  {
    question: 'Какая уникальность готовых работ?',
    answer: 'Уникальность готовых работ составляет от 65% до 85%. Вы можете повысить её до 90-95%, перефразируя текст и добавляя свои примеры. Это стандартная практика при использовании готовых работ как образцов.'
  },
  {
    question: 'Сколько стоят работы на Tech Forma?',
    answer: 'Цены начинаются от 100 баллов за реферат, 200-400 баллов за курсовую работу и 600-1500 баллов за дипломную работу. Это в 10 раз дешевле, чем заказывать работу с нуля у авторов.'
  },
  {
    question: 'Сколько времени доступна работа после покупки?',
    answer: 'После покупки у вас есть 7 дней для скачивания работы. В профиле в разделе "Мои покупки" вы видите оставшееся время доступа для каждой работы. После истечения срока кнопка скачивания блокируется.'
  },
  {
    question: 'Можно ли сдавать готовую работу без изменений?',
    answer: 'НЕТ. Готовая работа — это образец для изучения. Обязательно перефразируйте текст, обновите данные, добавьте свои примеры и измените титульный лист. Это повысит уникальность и защитит от обнаружения.'
  },
  {
    question: 'Как работает система баллов?',
    answer: 'При регистрации вы получаете 1000 баллов бесплатно. 1 балл = 5 рублей при покупке пакетов баллов. Баллы можно пополнить картой в разделе "Баланс", заработать за загрузку своих работ или получить по реферальной программе.'
  },
  {
    question: 'Можно ли вернуть баллы, если работа не подошла?',
    answer: 'Да, если работа не соответствует описанию, обратитесь в поддержку в течение 24 часов через раздел "Поддержка" в профиле. Мы вернем баллы или подберем альтернативную работу.'
  },
  {
    question: 'Какие форматы файлов поддерживаются?',
    answer: 'Платформа поддерживает документы (DOCX, PDF), таблицы (XLS, XLSX), презентации (PPT, PPTX), чертежи (DWG, DXF, CDW, FRW) и 3D-модели (STEP). При загрузке работы автоматически генерируются превью.'
  },
  {
    question: 'Что такое "Пакет для защиты"?',
    answer: 'Это специальный инструмент для подготовки к защите дипломной работы. После покупки работы вы можете создать пакет, который включает презентацию, речь для защиты и ответы на вопросы комиссии.'
  },
  {
    question: 'Как посмотреть работу перед покупкой?',
    answer: 'В каталоге доступна функция "Быстрый просмотр" с превью страниц работы. На странице работы вы видите детальное описание, состав архива, информацию об авторе, использованном ПО и количество файлов.'
  },
  {
    question: 'Как добавить работу в избранное?',
    answer: 'При наведении на карточку работы появляется иконка сердца. Нажмите на неё, чтобы добавить в избранное. Все избранные работы доступны в профиле на вкладке "Избранное".'
  },
  {
    question: 'Могу ли я продать свои работы на платформе?',
    answer: 'Да! Загружайте свои курсовые, дипломы, чертежи и другие работы через кнопку "Загрузить работу" в профиле. Работы проходят модерацию, после чего становятся доступны в каталоге. Вы видите статистику скачиваний на вкладке "Мои работы".'
  },
  {
    question: 'Это законно?',
    answer: 'Да, покупка готовых работ как образцов для изучения абсолютно легальна. Это аналогично покупке учебника или методического пособия. Важно использовать материал этично: дорабатывать, перефразировать и добавлять авторские идеи.'
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqData.map(item => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer
      }
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Часто задаваемые вопросы</h2>
            <p className="text-lg text-muted-foreground">
              Ответы на популярные вопросы о работе с Tech Forma
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((item, index) => (
              <Card 
                key={index} 
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => toggleFAQ(index)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Icon 
                          name="HelpCircle" 
                          size={20} 
                          className="text-primary flex-shrink-0" 
                        />
                        {item.question}
                      </h3>
                      {openIndex === index && (
                        <p className="text-muted-foreground mt-3 ml-7 leading-relaxed">
                          {item.answer}
                        </p>
                      )}
                    </div>
                    <Icon 
                      name={openIndex === index ? "ChevronUp" : "ChevronDown"} 
                      size={20} 
                      className="text-muted-foreground flex-shrink-0 mt-1" 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-6 bg-primary/5 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-2">Не нашли ответ?</h3>
            <p className="text-muted-foreground mb-4">
              Напишите нам в поддержку — ответим в течение 5 минут!
            </p>
            <a 
              href="mailto:tech.forma@yandex.ru" 
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              <Icon name="Mail" size={18} />
              tech.forma@yandex.ru
            </a>
          </div>
        </div>
      </section>
    </>
  );
}