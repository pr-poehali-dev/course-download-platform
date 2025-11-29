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
    question: 'Как получить доступ к материалам на Tech Forma?',
    answer: 'Зарегистрируйтесь на платформе и получите 1000 приветственных баллов. Выберите материал в каталоге, оплатите баллами, и мгновенно скачайте архив с файлами. Поддерживаются форматы: DOCX, PDF, DWG, CDW и другие.'
  },
  {
    question: 'Сколько стоят материалы на Tech Forma?',
    answer: 'Цены начинаются от 100 баллов за референсные материалы, 200-400 баллов за примеры проектов и 600-1500 баллов за комплексные технические работы. Это удобный способ получить доступ к базе знаний.'
  },
  {
    question: 'Сколько времени доступен материал после получения?',
    answer: 'После получения у вас есть 7 дней для скачивания материала. В профиле в разделе "Мои покупки" вы видите оставшееся время доступа для каждого материала. После истечения срока кнопка скачивания блокируется.'
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
    question: 'Могу ли я публиковать свои материалы на платформе?',
    answer: 'Да! Загружайте чертежи, технические расчёты, проектную документацию и учебные материалы через кнопку "Загрузить работу" в профиле. Материалы проходят модерацию, после чего становятся доступны в каталоге. Вы видите статистику скачиваний на вкладке "Мои работы".'
  },
  {
    question: 'Для чего предназначена платформа?',
    answer: 'Tech Forma — техническая библиотека для инженеров и студентов. Материалы предоставляются исключительно в образовательных целях как справочные пособия и примеры оформления. Все материалы требуют авторской переработки перед использованием.'
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

      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">Часто задаваемые вопросы</h2>
            <p className="text-lg text-gray-600">
              Ответы на популярные вопросы о платформе
            </p>
          </div>

          <div className="space-y-3">
            {faqData.map((item, index) => (
              <div 
                key={index} 
                className="bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-all"
                onClick={() => toggleFAQ(index)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold mb-1 text-gray-900">
                        {item.question}
                      </h3>
                      {openIndex === index && (
                        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                          {item.answer}
                        </p>
                      )}
                    </div>
                    <Icon 
                      name={openIndex === index ? "ChevronUp" : "ChevronDown"} 
                      size={20} 
                      className="text-gray-400 flex-shrink-0 mt-1" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Не нашли ответ?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Напишите нам в поддержку
            </p>
            <a 
              href="mailto:tech.forma@yandex.ru" 
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline text-sm"
            >
              <Icon name="Mail" size={16} />
              tech.forma@yandex.ru
            </a>
          </div>
        </div>
      </section>
    </>
  );
}