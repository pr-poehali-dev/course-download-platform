import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export default function UsageRules() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="BookOpen" size={32} className="text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-3">Правила использования</h1>
        <p className="text-muted-foreground">
          Руководство для комфортной работы с платформой
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="CheckCircle" size={20} className="text-green-600" />
                Разрешенные действия
              </CardTitle>
              <Badge className="bg-green-500">Можно</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-4">
              <div className="flex gap-3">
                <Icon name="BookMarked" size={20} className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Использовать работы для обучения</p>
                  <p className="text-sm text-muted-foreground">
                    Изучайте приобретенные материалы, используйте как справочную информацию для подготовки своих проектов
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Icon name="Upload" size={20} className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Загружать собственные работы</p>
                  <p className="text-sm text-muted-foreground">
                    Делитесь своими курсовыми, дипломами и чертежами с другими студентами и получайте баллы для покупок
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Icon name="Search" size={20} className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Искать и просматривать каталог</p>
                  <p className="text-sm text-muted-foreground">
                    Свободно изучайте доступные работы, используйте фильтры и поиск для нахождения нужных материалов
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Icon name="MessageSquare" size={20} className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Обращаться в поддержку</p>
                  <p className="text-sm text-muted-foreground">
                    При любых вопросах или проблемах используйте форму технической поддержки
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Icon name="Star" size={20} className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Оценивать качество работ</p>
                  <p className="text-sm text-muted-foreground">
                    Оставляйте отзывы и рейтинги, помогайте другим студентам сделать правильный выбор
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="XCircle" size={20} className="text-red-600" />
                Запрещенные действия
              </CardTitle>
              <Badge className="bg-red-500">Нельзя</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-4">
              <div className="flex gap-3">
                <Icon name="Copyright" size={20} className="text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Загружать пиратский контент и чужие работы</p>
                  <p className="text-sm text-muted-foreground">
                    Строго запрещено: чужие курсовые/дипломы, платные курсы из интернета, учебники издательств без разрешения, 
                    скачанные работы с других сайтов. Только ваши авторские материалы! Нарушение = блокировка + передача данных правообладателю.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Icon name="Repeat" size={20} className="text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Перепродавать купленные работы</p>
                  <p className="text-sm text-muted-foreground">
                    Приобретенные материалы предназначены только для личного использования
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Icon name="Users" size={20} className="text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Создавать множественные аккаунты</p>
                  <p className="text-sm text-muted-foreground">
                    Один пользователь = один аккаунт. Мультиаккаунты будут заблокированы
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Icon name="AlertTriangle" size={20} className="text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Размещать вредоносный контент</p>
                  <p className="text-sm text-muted-foreground">
                    Запрещены файлы с вирусами, вредоносным кодом или незаконным содержимым
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Icon name="Bot" size={20} className="text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Использовать автоматизацию</p>
                  <p className="text-sm text-muted-foreground">
                    Запрещены боты, парсеры и другие автоматизированные инструменты
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Icon name="Zap" size={20} className="text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Попытки взлома системы</p>
                  <p className="text-sm text-muted-foreground">
                    Любые попытки обхода защиты, взлома или эксплуатации уязвимостей строго запрещены
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileUp" size={20} className="text-blue-600" />
                Требования к загружаемым работам
              </CardTitle>
              <Badge className="bg-blue-500">Важно</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Icon name="Check" size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <span><strong>Авторство:</strong> работа должна быть создана вами или у вас есть право на её публикацию</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <span><strong>Качество:</strong> работа должна соответствовать заявленному описанию и теме</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <span><strong>Формат:</strong> поддерживаемые форматы: PDF, DOC, DOCX, DWG, JPG, PNG</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <span><strong>Размер:</strong> максимальный размер файла — 50 МБ</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <span><strong>Описание:</strong> подробно опишите работу, укажите тему, предмет, тип работы</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <span><strong>Цена:</strong> установите справедливую цену в баллах</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-red-50/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Copyright" size={20} className="text-red-600" />
                Защита авторских прав — это серьёзно!
              </CardTitle>
              <Badge className="bg-red-500">Критично</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="bg-red-100 border-l-4 border-red-600 p-4 rounded">
              <p className="font-bold text-red-800 mb-2">
                ⚠️ ВНИМАНИЕ: Последствия нарушения авторских прав
              </p>
              <p className="text-sm text-red-700">
                Загрузка пиратского контента — это не просто нарушение правил платформы, 
                это уголовное преступление по статье 146 УК РФ (до 2 лет лишения свободы + штраф до 200 тыс. руб.)
              </p>
            </div>

            <ul className="space-y-3 mt-4">
              <li className="flex items-start gap-2">
                <Icon name="AlertTriangle" size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-red-700">1-е нарушение:</span> Предупреждение + удаление материала + штраф 1000 баллов
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="XOctagon" size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-red-700">2-е нарушение:</span> Блокировка аккаунта на 30 дней без возврата баллов
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Ban" size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-red-700">3-е нарушение:</span> Перманентная блокировка без права восстановления
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Scale" size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-red-700">Жалоба правообладателя:</span> Передача ваших данных (ФИО, email, IP) + возмещение убытков
                </div>
              </li>
            </ul>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-4">
              <p className="font-bold text-yellow-800 mb-2">
                📧 Жалоба на пиратский контент: tech.forma@yandex.ru
              </p>
              <p className="text-sm text-yellow-700">
                Если вы правообладатель или обнаружили пиратский контент — отправьте жалобу. 
                Материал будет удалён в течение 24 часов, нарушитель заблокирован.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="ShieldAlert" size={20} className="text-yellow-600" />
                Модерация и безопасность
              </CardTitle>
              <Badge className="bg-yellow-500">Внимание</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Все загруженные работы проходят модерацию для обеспечения качества и безопасности платформы.
            </p>
            <ul className="space-y-3 mt-4">
              <li className="flex items-start gap-2">
                <Icon name="Eye" size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <span>Модерация может занять до 24 часов</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Trash2" size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <span>Работы, нарушающие правила, будут удалены без предупреждения</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Ban" size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <span>За систематические нарушения аккаунт может быть заблокирован</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Flag" size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <span>Если вы обнаружили нарушение, используйте кнопку «Пожаловаться»</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Lightbulb" size={20} className="text-purple-600" />
                Рекомендации для пользователей
              </CardTitle>
              <Badge className="bg-purple-500">Советы</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Icon name="TrendingUp" size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Качество превыше количества</p>
                  <p className="text-sm">Лучше загрузить одну качественную работу, чем десять посредственных</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Image" size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Добавляйте превью</p>
                  <p className="text-sm">Скриншоты и изображения помогают понять содержание работы</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Tag" size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Используйте правильные категории</p>
                  <p className="text-sm">Это поможет другим студентам быстрее найти вашу работу</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="DollarSign" size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Адекватная цена</p>
                  <p className="text-sm">Изучите цены на похожие работы перед установкой своей</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="MessageCircle" size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Будьте на связи</p>
                  <p className="text-sm">Отвечайте на вопросы покупателей через систему комментариев</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Heart" size={20} className="text-primary" />
              Этика сообщества
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Tech Forma — это сообщество студентов, помогающих друг другу в обучении. Давайте создадим комфортную атмосферу для всех:
            </p>
            <ul className="space-y-2 mt-4">
              <li className="flex items-center gap-2">
                <Icon name="ThumbsUp" size={16} className="text-primary" />
                Относитесь с уважением к другим пользователям
              </li>
              <li className="flex items-center gap-2">
                <Icon name="HelpCircle" size={16} className="text-primary" />
                Помогайте новичкам разобраться с платформой
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Award" size={16} className="text-primary" />
                Цените качественные работы и благодарите авторов
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Shield" size={16} className="text-primary" />
                Сообщайте о нарушениях, чтобы платформа оставалась безопасной
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center p-6 bg-muted rounded-lg">
          <Icon name="Mail" size={32} className="mx-auto text-primary mb-3" />
          <p className="text-muted-foreground">
            Остались вопросы? Свяжитесь с нами через форму поддержки на сайте.
          </p>
        </div>
      </div>
    </div>
  );
}