import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4"
            asChild
          >
            <Link to="/">
              <Icon name="Home" size={18} className="mr-2" />
              На главную
            </Link>
          </Button>
          
          <Badge variant="outline" className="mb-4">
            <Icon name="FileText" size={14} className="mr-2" />
            Юридические документы
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Пользовательское соглашение</h1>
          <p className="text-muted-foreground">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Info" size={20} className="text-primary" />
                1. Общие положения
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между 
                администрацией платформы Tech Forma (далее — «Платформа») и пользователями сервиса.
              </p>
              <p>
                Регистрируясь на Платформе, вы подтверждаете свое согласие с условиями данного Соглашения. 
                Если вы не согласны с каким-либо пунктом, пожалуйста, не используйте сервис.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Users" size={20} className="text-primary" />
                2. Регистрация и аккаунт
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                2.1. Для использования функций Платформы необходимо пройти регистрацию, предоставив 
                достоверную информацию.
              </p>
              <p>
                2.2. Вы обязуетесь не передавать свои учетные данные третьим лицам и несете полную 
                ответственность за действия, совершенные под вашей учетной записью.
              </p>
              <p>
                2.3. В случае обнаружения несанкционированного доступа к аккаунту, необходимо 
                незамедлительно сообщить об этом администрации.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-500/30 bg-orange-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="ShieldAlert" size={20} className="text-orange-600" />
                3. Загрузка работ и ответственность автора
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-4">
                <p className="font-bold text-orange-800 mb-2">
                  ⚠️ ВАЖНО: Полная ответственность автора
                </p>
                <p className="text-sm text-orange-700">
                  Загружая работу на Платформу, вы принимаете на себя полную юридическую и финансовую 
                  ответственность за содержание материала.
                </p>
              </div>

              <p className="font-semibold text-foreground">
                3.1. Гарантии и заверения автора
              </p>
              <p>
                Загружая работу, вы гарантируете и заверяете, что:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Вы являетесь единоличным автором работы или имеете письменное разрешение правообладателя</li>
                <li>Работа создана вами лично и не содержит плагиата</li>
                <li>Работа не нарушает авторские права, патентные права или иные права интеллектуальной собственности третьих лиц</li>
                <li>Все источники, цитаты и заимствования оформлены в соответствии с академическими стандартами</li>
                <li>У вас есть все необходимые права для публикации и распространения работы</li>
              </ul>

              <p className="font-semibold text-foreground mt-4">
                3.2. Запрещается загружать:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Работы, полностью или частично скопированные из других источников без надлежащего цитирования</li>
                <li>Работы, купленные у третьих лиц или выполненные другими авторами</li>
                <li>Материалы, нарушающие авторские права, товарные знаки или патенты</li>
                <li>Работы, содержащие конфиденциальную информацию работодателей или учебных заведений</li>
                <li>Вредоносный код, вирусы или программное обеспечение</li>
                <li>Оскорбительный, дискриминационный или противозаконный контент</li>
              </ul>

              <p className="font-semibold text-foreground mt-4">
                3.3. Личная ответственность автора
              </p>
              <p>
                Автор работы принимает на себя следующие обязательства:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Несет полную юридическую ответственность за нарушение прав третьих лиц</li>
                <li>Обязуется возместить Платформе все убытки, возникшие в связи с претензиями третьих лиц</li>
                <li>Освобождает Платформу от любой ответственности за содержание загруженной работы</li>
                <li>Обязуется выступить в качестве ответчика в судебных разбирательствах, связанных с его работой</li>
                <li>Возмещает Платформе судебные издержки, штрафы и компенсации, понесенные из-за нарушений автора</li>
              </ul>

              <p className="font-semibold text-foreground mt-4">
                3.4. Права Платформы
              </p>
              <p>
                Администрация Платформы имеет право:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Удалить любую работу без предварительного уведомления и объяснения причин</li>
                <li>Приостановить или заблокировать аккаунт автора при подозрении на нарушение авторских прав</li>
                <li>Передать данные автора правообладателям или правоохранительным органам по запросу</li>
                <li>Провести модерацию работы перед публикацией (срок модерации до 7 рабочих дней)</li>
                <li>Требовать от автора подтверждения авторства (копии документов, черновики, исходники)</li>
                <li>Предъявить автору регрессные требования в случае исков третьих лиц</li>
              </ul>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                <p className="font-bold text-red-800 mb-2">
                  ⚠️ ВНИМАНИЕ: Уголовная ответственность
                </p>
                <p className="text-sm text-red-700">
                  Нарушение авторских прав в РФ влечет уголовную ответственность по ст. 146 УК РФ: 
                  штраф до 200 000 рублей или лишение свободы до 2 лет. При повторных нарушениях — 
                  до 6 лет лишения свободы. Загружая чужую работу, вы рискуете уголовным преследованием.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Coins" size={20} className="text-primary" />
                4. Балльная система и платежи
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-semibold text-foreground">
                4.1. Принцип работы балльной системы
              </p>
              <p>
                Платформа использует замкнутую систему внутренних баллов для обмена работами между пользователями. 
                Баллы — это внутренняя валюта платформы, не являющаяся денежным средством.
              </p>

              <p className="font-semibold text-foreground mt-4">
                4.2. Способы получения баллов
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Покупка баллов</strong> — пользователи могут приобрести баллы за реальные деньги через платежные системы</li>
                <li><strong>Загрузка работ</strong> — авторы получают баллы за каждое скачивание их работ другими пользователями</li>
                <li><strong>Промокоды и акции</strong> — начисление бонусных баллов в рамках маркетинговых программ</li>
                <li><strong>Реферальная программа</strong> — получение баллов за приглашенных пользователей</li>
              </ul>

              <p className="font-semibold text-foreground mt-4">
                4.3. Использование баллов
              </p>
              <p>
                Баллы используются исключительно для доступа к работам на Платформе. За баллы можно:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Скачивать работы других пользователей</li>
                <li>Добавлять работы в избранное с приоритетом</li>
                <li>Получать доступ к премиум-материалам</li>
              </ul>

              <p className="font-semibold text-foreground mt-4">
                4.4. Важные ограничения
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <p className="font-bold text-yellow-800 mb-2">⚠️ Баллы НЕ являются денежным средством</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                  <li>Баллы не подлежат обмену на денежные средства</li>
                  <li>Баллы не подлежат выводу с Платформы</li>
                  <li>Баллы не могут быть переданы другим пользователям</li>
                  <li>Баллы не имеют срока действия, но могут быть аннулированы при нарушении правил</li>
                  <li>При блокировке аккаунта баллы не возвращаются и не компенсируются</li>
                </ul>
              </div>

              <p className="font-semibold text-foreground mt-4">
                4.5. Платежи
              </p>
              <p>
                4.5.1. Все платежи за покупку баллов обрабатываются через защищенные платежные шлюзы. 
                Администрация не хранит данные банковских карт пользователей.
              </p>
              <p>
                4.5.2. Возврат средств возможен только в случае технических ошибок при обработке платежа 
                (двойное списание, ошибка зачисления баллов). Срок обращения — 14 дней с момента платежа.
              </p>
              <p>
                4.5.3. Возврат средств за приобретенные баллы после их использования для скачивания работ 
                не предусмотрен.
              </p>
              <p>
                4.5.4. Платформа не несет ответственности за качество приобретенных работ. Претензии 
                по качеству не являются основанием для возврата баллов или денежных средств.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="BookOpen" size={20} className="text-primary" />
                5. Использование материалов
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                5.1. Все материалы на Платформе предоставляются исключительно в ознакомительных и 
                образовательных целях.
              </p>
              <p>
                5.2. Материалы могут использоваться как референсные источники, примеры оформления, 
                структуры и методологии выполнения работ.
              </p>
              <p>
                5.3. Запрещается:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Копирование материалов без изменений и выдача их за собственные</li>
                <li>Распространение скачанных работ третьим лицам</li>
                <li>Использование материалов в коммерческих целях без согласия автора</li>
              </ul>
              <p>
                5.4. Пользователь несет полную ответственность за использование скачанных материалов.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Scale" size={20} className="text-primary" />
                6. Ограничение ответственности Платформы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-semibold text-foreground">
                6.1. Платформа как посредник
              </p>
              <p>
                Платформа выступает исключительно в качестве технического посредника между авторами и 
                пользователями. Мы предоставляем только инфраструктуру для размещения работ.
              </p>

              <p className="font-semibold text-foreground mt-4">
                6.2. Отказ от гарантий
              </p>
              <p>
                Администрация не несет ответственности за:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Качество, достоверность, актуальность и законность размещенных работ</li>
                <li>Нарушение авторских прав третьих лиц авторами работ</li>
                <li>Убытки пользователей, возникшие в результате использования материалов</li>
                <li>Академические последствия использования работ (отчисление, аннулирование диплома и т.д.)</li>
                <li>Претензии правообладателей к пользователям, скачавшим работы</li>
                <li>Технические сбои, потерю данных или недоступность сервиса</li>
              </ul>

              <p className="font-semibold text-foreground mt-4">
                6.3. Процедура рассмотрения претензий о нарушении авторских прав
              </p>
              <p>
                При получении обоснованной претензии о нарушении авторских прав:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Платформа удаляет спорный материал в течение 24 часов</li>
                <li>Блокирует аккаунт автора до выяснения обстоятельств</li>
                <li>Предоставляет правообладателю контактные данные автора работы</li>
                <li>Оказывает содействие в досудебном урегулировании спора</li>
                <li>Не возвращает автору заработанные баллы за удаленную работу</li>
              </ul>

              <p className="font-semibold text-foreground mt-4">
                6.4. Санкции за нарушения
              </p>
              <p>
                При нарушении условий Соглашения Администрация вправе:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Заблокировать аккаунт без возврата баллов и средств</li>
                <li>Удалить все работы пользователя</li>
                <li>Передать данные нарушителя правоохранительным органам</li>
                <li>Внести пользователя в черный список (запрет на регистрацию)</li>
                <li>Предъявить регрессные требования о возмещении ущерба</li>
              </ul>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                <p className="font-bold text-blue-800 mb-2">
                  ℹ️ Важно знать
                </p>
                <p className="text-sm text-blue-700">
                  Платформа сотрудничает с правообладателями и правоохранительными органами. 
                  Мы храним логи всех действий пользователей (IP-адреса, время загрузки, метаданные файлов) 
                  и предоставляем их по официальным запросам в рамках расследований.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Settings" size={20} className="text-primary" />
                7. Изменение условий
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                7.1. Администрация оставляет за собой право изменять условия настоящего Соглашения 
                в одностороннем порядке.
              </p>
              <p>
                7.2. Новая редакция вступает в силу с момента размещения на сайте, если иное не 
                предусмотрено новой редакцией Соглашения.
              </p>
              <p>
                7.3. Продолжение использования Платформы после изменения условий означает принятие 
                новой редакции Соглашения.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Icon name="Mail" size={24} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-2">Остались вопросы?</p>
                  <p className="text-sm text-muted-foreground">
                    Если у вас возникли вопросы по Пользовательскому соглашению, свяжитесь с нами 
                    через форму обратной связи в разделе "Поддержка".
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}