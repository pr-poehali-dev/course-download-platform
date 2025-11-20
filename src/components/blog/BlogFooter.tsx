import { Link } from 'react-router-dom';

export default function BlogFooter() {
  return (
    <footer className="border-t py-8 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 Tech Forma. Все права защищены</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link to="/privacy-policy" className="hover:text-primary">Политика конфиденциальности</Link>
            <Link to="/terms-of-service" className="hover:text-primary">Пользовательское соглашение</Link>
            <Link to="/usage-rules" className="hover:text-primary">Правила использования</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}