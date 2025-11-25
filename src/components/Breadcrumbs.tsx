import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const allItems = [{ name: 'Главная', href: '/' }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://techforma.pro${item.href}`
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>
      
      <nav aria-label="Хлебные крошки" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          {allItems.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && (
                <Icon name="ChevronRight" size={16} className="text-gray-400" />
              )}
              {index === allItems.length - 1 ? (
                <span className="font-medium text-foreground">{item.name}</span>
              ) : (
                <Link 
                  to={item.href} 
                  className="hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
