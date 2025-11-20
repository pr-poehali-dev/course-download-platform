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
    answer: 'Зарегистрируйтесь на платформе и получите 1000 приветственных баллов. Выберите работу в каталоге, оплатите баллами или картой, и мгновенно скачайте файл в формате DOCX.'
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
    question: 'Можно ли сдавать готовую работу без изменений?',
    answer: 'НЕТ. Готовая работа — это образец для изучения. Обязательно перефразируйте текст, обновите данные, добавьте свои примеры и измените титульный лист. Это повысит уникальность и защитит от обнаружения.'
  },
  {
    question: 'Как работает система баллов?',
    answer: 'При регистрации вы получаете 1000 баллов бесплатно. 1 балл = 5 рублей при покупке пакетов баллов. Баллы можно пополнить картой, заработать за загрузку своих работ или получить по реферальной программе.'
  },
  {
    question: 'Можно ли вернуть деньги, если работа не подошла?',
    answer: 'Да, если работа не соответствует описанию, обратитесь в поддержку в течение 24 часов. Мы вернем баллы или подберем альтернативную работу.'
  },
  {
    question: 'Какие предметы представлены в каталоге?',
    answer: 'В каталоге 500+ работ по экономике, юриспруденции, менеджменту, IT, технике, медицине и другим специальностям. База пополняется ежедневно.'
  },
  {
    question: 'Как быстро я получу работу после оплаты?',
    answer: 'Мгновенно! После оплаты вы сразу получаете ссылку на скачивание файла в формате DOCX. Никаких ожиданий и задержек.'
  },
  {
    question: 'Могу ли я продать свои работы на платформе?',
    answer: 'Да! Загружайте свои курсовые, дипломы и рефераты. За каждую загруженную работу вы получаете баллы, а за каждую покупку — 70% от стоимости. Это отличный способ заработать на старых работах.'
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
              href="mailto:support@techforma.pro" 
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              <Icon name="Mail" size={18} />
              support@techforma.pro
            </a>
          </div>
        </div>
      </section>
    </>
  );
}