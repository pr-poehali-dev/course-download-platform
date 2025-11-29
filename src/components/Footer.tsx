import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border py-16">
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
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground text-sm">Контакты</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Icon name="Mail" size={16} className="text-primary" />
                <a href="mailto:tech.forma@yandex.ru" className="hover:text-primary transition-colors">tech.forma@yandex.ru</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 TechForma. Все материалы предоставляются только для изучения.
          </p>
        </div>
      </div>
    </footer>
  );
}