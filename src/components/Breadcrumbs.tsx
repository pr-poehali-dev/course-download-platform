import { Link, useLocation } from 'react-router-dom';
import { Fragment } from 'react';
import Icon from '@/components/ui/icon';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const pathToLabel: Record<string, string> = {
  '': 'Главная',
  'catalog': 'Каталог работ',
  'work': 'Работа',
  'blog': 'Блог',
  'profile': 'Профиль',
  'upload': 'Загрузить работу',
  'buy-points': 'Купить баллы',
  'admin': 'Админ-панель',
  'login': 'Вход',
  'register': 'Регистрация',
  'forgot-password': 'Восстановление пароля',
  'payment': 'Оплата',
  'defense-kit': 'Конструктор защиты',
  'marketplace': 'Маркетплейс авторов',
  'privacy-policy': 'Политика конфиденциальности',
  'terms-of-service': 'Условия использования',
  'usage-rules': 'Правила использования',
  'offer': 'Публичная оферта',
  'requisites': 'Реквизиты'
};

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const location = useLocation();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Главная', path: '/' }
    ];

    let currentPath = '';
    paths.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = pathToLabel[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      if (index === paths.length - 1 && !pathToLabel[segment]) {
        return;
      }
      
      breadcrumbs.push({
        label,
        path: currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav 
      className={`flex items-center gap-2 text-sm text-muted-foreground mb-6 ${className}`}
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((crumb, index) => (
        <Fragment key={`breadcrumb-${index}`}>
          {index > 0 && (
            <Icon name="ChevronRight" size={14} className="text-muted-foreground/50" />
          )}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium" aria-current="page">
              {crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.path}
              className="hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}