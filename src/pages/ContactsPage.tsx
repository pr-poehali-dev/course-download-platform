import { Helmet } from 'react-helmet-async';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactsPage() {
  return (
    <>
      <Helmet>
        <title>Контакты - TechForma | Инженерная платформа</title>
        <meta name="description" content="Свяжитесь с TechForma: email tech.forma@yandex.ru, телефон +7 (999) 123-45-67, Telegram поддержка. Мы всегда на связи!" />
        <meta name="keywords" content="контакты techforma, связаться с techforma, поддержка techforma, email techforma" />
        <link rel="canonical" href="https://techforma.pro/contacts" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Контакты TechForma",
            "description": "Контактная информация инженерной платформы TechForma",
            "url": "https://techforma.pro/contacts",
            "mainEntity": {
              "@type": "Organization",
              "name": "TechForma",
              "email": "tech.forma@yandex.ru",
              "telephone": "+79991234567",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Архангельск",
                "addressCountry": "RU"
              }
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navigation isLoggedIn={false} />
        
        <main className="flex-grow container mx-auto px-4 py-16 max-w-6xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Контакты</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Мы всегда на связи! Напишите нам по любым вопросам, предложениям или для получения помощи.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Mail" size={24} className="text-primary" />
                  Email
                </CardTitle>
                <CardDescription>Напишите нам на электронную почту</CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="mailto:tech.forma@yandex.ru" 
                  className="text-lg font-semibold text-primary hover:underline"
                  itemProp="email"
                >
                  tech.forma@yandex.ru
                </a>
                <p className="text-sm text-muted-foreground mt-2">
                  Отвечаем в течение 24 часов
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="MessageCircle" size={24} className="text-primary" />
                  Telegram
                </CardTitle>
                <CardDescription>Быстрая поддержка в мессенджере</CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="https://t.me/techforma_support" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-primary hover:underline"
                >
                  @techforma_support
                </a>
                <p className="text-sm text-muted-foreground mt-2">
                  Онлайн с 9:00 до 21:00 (МСК)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Phone" size={24} className="text-primary" />
                  Телефон
                </CardTitle>
                <CardDescription>Позвоните нам напрямую</CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="tel:+79991234567" 
                  className="text-lg font-semibold text-primary hover:underline"
                  itemProp="telephone"
                >
                  +7 (999) 123-45-67
                </a>
                <p className="text-sm text-muted-foreground mt-2">
                  Пн-Пт: 9:00 - 18:00 (МСК)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm1.46 13.31c-.76 1.17-2.07 1.94-3.53 1.94-1.46 0-2.77-.77-3.53-1.94-.37-.57-.37-1.31 0-1.88.76-1.17 2.07-1.94 3.53-1.94s2.77.77 3.53 1.94c.37.57.37 1.31 0 1.88z"/>
                  </svg>
                  ВКонтакте
                </CardTitle>
                <CardDescription>Присоединяйтесь к нашему сообществу</CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="https://vk.com/club234274626" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-primary hover:underline"
                >
                  vk.com/club234274626
                </a>
                <p className="text-sm text-muted-foreground mt-2">
                  Новости, акции и обновления
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Building2" size={24} className="text-primary" />
                Реквизиты компании
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-foreground">Полное наименование:</p>
                  <p className="text-muted-foreground">ИП Гагарская Елизавета Александровна</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">ИНН:</p>
                  <p className="text-muted-foreground">290540407146</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">ОГРНИП:</p>
                  <p className="text-muted-foreground">325290000045931</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">ОКВЭД:</p>
                  <p className="text-muted-foreground">47.91.2 — Торговля розничная через интернет</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Юридический адрес:</p>
                  <p className="text-muted-foreground" itemProp="address">г. Архангельск, Россия</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Email для документов:</p>
                  <p className="text-muted-foreground">tech.forma@yandex.ru</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
}
