import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function SEOFAQSection() {
  const faqs = [
    {
      question: 'Где купить курсовую работу недорого?',
      answer: 'На Tech Forma вы можете купить готовые курсовые работы от 200₽. Это самые низкие цены на рынке студенческих работ. У нас более 500 готовых курсовых по всем предметам с гарантией уникальности 95%.'
    },
    {
      question: 'Сколько стоит купить курсовую работу?',
      answer: 'Цены на готовые курсовые работы начинаются от 200₽ и зависят от предмета, объема и сложности. Средняя стоимость курсовой работы — 300-500₽. Это в 5-10 раз дешевле, чем заказывать написание новой работы.'
    },
    {
      question: 'Можно ли купить дипломную работу?',
      answer: 'Да, в нашем каталоге есть готовые дипломные работы и ВКР по разным специальностям. Цены на дипломы начинаются от 500₽. Все дипломные работы проверены на уникальность и соответствуют требованиям ГОСТ.'
    },
    {
      question: 'Какая гарантия качества готовых работ?',
      answer: 'Все работы в каталоге проходят проверку на уникальность (минимум 95% по Антиплагиат.ру). Мы гарантируем соответствие работ требованиям российских вузов и оформление по ГОСТ. Если работа не подойдет, мы вернем баллы на баланс.'
    },
    {
      question: 'Как быстро можно скачать работу после оплаты?',
      answer: 'Сразу после оплаты! Вы получаете мгновенный доступ к скачиванию файла. Не нужно ждать менеджеров или подтверждений — просто оплатите и скачайте готовую курсовую или диплом за 1-2 минуты.'
    },
    {
      question: 'Можно ли купить реферат или контрольную работу?',
      answer: 'Конечно! Кроме курсовых и дипломов у нас есть готовые рефераты (от 100₽), контрольные работы, лабораторные работы, расчетно-графические задания. Выберите нужный тип работы в фильтре каталога.'
    },
    {
      question: 'Безопасно ли покупать готовые работы?',
      answer: 'Да, это полностью безопасно. Мы работаем через проверенные платежные системы. Ваши данные защищены, а покупки конфиденциальны. Тысячи студентов уже купили работы на Tech Forma без каких-либо проблем.'
    },
    {
      question: 'Что делать, если не нашел нужную работу?',
      answer: 'Если в каталоге нет подходящей готовой работы, вы можете заказать написание новой курсовой или диплома у наших авторов. Также можно оставить заявку через форму поддержки, и мы поможем найти нужную работу.'
    }
  ];

  return (
    <section className="w-full py-12 sm:py-16 bg-white" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Часто задаваемые вопросы о покупке курсовых и дипломов
          </h2>
          <p className="text-lg text-muted-foreground">
            Ответы на популярные вопросы студентов о покупке готовых работ
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-gray-50 px-6 rounded-lg border"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-semibold text-base pr-4">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/20 text-center">
          <h3 className="text-xl font-bold mb-2">Не нашли ответ на свой вопрос?</h3>
          <p className="text-muted-foreground mb-4">
            Напишите нам в поддержку, и мы ответим в течение 15 минут
          </p>
          <a 
            href="#support" 
            className="text-primary font-semibold hover:underline"
          >
            Написать в поддержку →
          </a>
        </div>
      </div>
    </section>
  );
}
