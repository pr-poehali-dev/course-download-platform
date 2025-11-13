import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import AgeBadge from '@/components/AgeBadge';

export default function Footer() {
  return (
    <footer className="bg-muted/50 py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Icon name="Cpu" size={28} className="text-primary" />
              <h3 className="font-bold text-lg">Tech Forma</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Технологичная платформа для обмена студенческими работами
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Платформа</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/catalog" className="hover:text-primary transition-colors">Каталог работ</Link></li>
              <li><a href="/#upload" className="hover:text-primary transition-colors">Загрузить работу</a></li>
              <li><a href="/#pricing" className="hover:text-primary transition-colors">Покупка баллов</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Информация</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/#about" className="hover:text-primary transition-colors">О платформе</a></li>
              <li><a href="/#faq" className="hover:text-primary transition-colors">Вопросы и ответы</a></li>
              <li><Link to="/usage-rules" className="hover:text-primary transition-colors">Правила использования</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Юридическая информация</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/#support" className="hover:text-primary transition-colors">Связаться с нами</a></li>
              <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Политика конфиденциальности</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-primary transition-colors">Пользовательское соглашение</Link></li>
              <li><Link to="/offer" className="hover:text-primary transition-colors">Договор-оферта</Link></li>
              <li><Link to="/requisites" className="hover:text-primary transition-colors">Контакты</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center text-sm text-muted-foreground">
            <p>© 2025 Tech Forma. Все материалы предоставлены в ознакомительных целях.</p>
            <div className="flex items-center justify-center">
              <AgeBadge />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}