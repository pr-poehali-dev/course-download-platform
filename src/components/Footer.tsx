import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border py-16" itemScope itemType="https://schema.org/Organization">
      <meta itemProp="name" content="TechForma" />
      <meta itemProp="url" content="https://techforma.pro" />
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-md">
                <Icon name="Ruler" size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-xl text-foreground">TechForma</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Инженерная платформа для студентов и специалистов
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground text-sm">Информация</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/#about" className="hover:text-primary transition-colors">О платформе</a></li>
              <li><a href="/#categories" className="hover:text-primary transition-colors">Категории</a></li>
              <li><Link to="/catalog" className="hover:text-primary transition-colors">Каталог</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground text-sm">Документы</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Конфиденциальность</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-primary transition-colors">Соглашение</Link></li>
              <li><Link to="/offer" className="hover:text-primary transition-colors">Оферта</Link></li>
              <li><Link to="/contacts" className="hover:text-primary transition-colors">Контакты</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground text-sm">Контакты</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Icon name="Mail" size={16} className="text-primary flex-shrink-0" />
                <a href="mailto:tech.forma@yandex.ru" className="hover:text-primary transition-colors" itemProp="email">
                  tech.forma@yandex.ru
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm1.46 13.31c-.76 1.17-2.07 1.94-3.53 1.94-1.46 0-2.77-.77-3.53-1.94-.37-.57-.37-1.31 0-1.88.76-1.17 2.07-1.94 3.53-1.94s2.77.77 3.53 1.94c.37.57.37 1.31 0 1.88z"/>
                </svg>
                <a href="https://vk.com/club234274626" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  Группа ВКонтакте
                </a>
              </li>
              <li className="flex items-center gap-2 pt-2 border-t border-border">
                <Icon name="Shield" size={16} className="text-purple-600 flex-shrink-0" />
                <Link to="/admin" className="hover:text-purple-600 transition-colors font-medium">
                  Админ-панель
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              © 2025 TechForma. Все материалы предоставляются только для изучения.
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>ИП Гагарская Елизавета Александровна</p>
              <p>ИНН: 290540407146 | ОГРНИП: 325290000045931</p>
              <p>ОКВЭД: 47.91.2 — Торговля розничная через интернет</p>
            </div>
            <div className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm">
              18+
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}