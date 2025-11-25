import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noindex?: boolean;
}

const DEFAULT_SEO = {
  title: 'Купить курсовую работу от 200₽ — готовые курсовые и дипломы недорого | Tech Forma',
  description: '⭐ Купить курсовую работу недорого от 200₽. 500+ готовых работ с гарантией уникальности 95%. Дипломы, рефераты, контрольные — мгновенное скачивание после оплаты. Где купить готовую курсовую? На Tech Forma!',
  keywords: 'купить курсовую работу, купить курсовую недорого, готовые курсовые работы, курсовая работа цена, где купить курсовую, купить дипломную работу, готовые дипломы, купить диплом недорого, купить реферат, курсовые работы купить онлайн',
  ogImage: 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/e25efd0b-8d04-4b71-b6d0-2a3a0d0123a4.jpg',
  siteName: 'Tech Forma',
  baseUrl: 'https://techforma.pro'
};

export default function SEO({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  ogType = 'website',
  canonical,
  noindex = false
}: SEOProps) {
  const location = useLocation();
  
  useEffect(() => {
    const fullTitle = title ? `${title} — Tech Forma` : DEFAULT_SEO.title;
    const metaDescription = description || DEFAULT_SEO.description;
    const metaKeywords = keywords || DEFAULT_SEO.keywords;
    const metaImage = ogImage || DEFAULT_SEO.ogImage;
    const canonicalUrl = canonical || `${DEFAULT_SEO.baseUrl}${location.pathname}`;

    document.title = fullTitle;

    const setMetaTag = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    setMetaTag('description', metaDescription);
    setMetaTag('keywords', metaKeywords);
    
    if (noindex) {
      setMetaTag('robots', 'noindex, nofollow');
    } else {
      const robotsElement = document.querySelector('meta[name="robots"]');
      if (robotsElement) {
        robotsElement.remove();
      }
    }

    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', metaDescription, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:url', canonicalUrl, true);
    setMetaTag('og:image', metaImage, true);
    setMetaTag('og:site_name', DEFAULT_SEO.siteName, true);
    setMetaTag('og:locale', 'ru_RU', true);

    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', metaDescription);
    setMetaTag('twitter:image', metaImage);

    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonicalUrl;

    const isHomePage = location.pathname === '/';
    
    const jsonLd = isHomePage ? {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${DEFAULT_SEO.baseUrl}/#website`,
          'name': DEFAULT_SEO.siteName,
          'alternateName': 'TechForma',
          'url': DEFAULT_SEO.baseUrl,
          'description': DEFAULT_SEO.description,
          'potentialAction': {
            '@type': 'SearchAction',
            'target': {
              '@type': 'EntryPoint',
              'urlTemplate': `${DEFAULT_SEO.baseUrl}/catalog?search={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        },
        {
          '@type': 'Organization',
          '@id': `${DEFAULT_SEO.baseUrl}/#organization`,
          'name': DEFAULT_SEO.siteName,
          'url': DEFAULT_SEO.baseUrl,
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/cd6426cd-a3e2-4cbb-b4ba-7087c677687b.jpg'
          },
          'contactPoint': {
            '@type': 'ContactPoint',
            'email': 'tech.forma@yandex.ru',
            'contactType': 'customer support',
            'areaServed': 'RU',
            'availableLanguage': 'Russian'
          }
        },
        {
          '@type': 'WebPage',
          '@id': `${DEFAULT_SEO.baseUrl}/#webpage`,
          'url': DEFAULT_SEO.baseUrl,
          'name': fullTitle,
          'description': metaDescription,
          'isPartOf': {
            '@id': `${DEFAULT_SEO.baseUrl}/#website`
          },
          'about': {
            '@id': `${DEFAULT_SEO.baseUrl}/#organization`
          }
        },
        {
          '@type': 'ItemList',
          'name': 'Категории работ',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Курсовые работы',
              'url': `${DEFAULT_SEO.baseUrl}/catalog?category=course`
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Дипломные работы',
              'url': `${DEFAULT_SEO.baseUrl}/catalog?category=diploma`
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': 'Рефераты',
              'url': `${DEFAULT_SEO.baseUrl}/catalog?category=referat`
            }
          ]
        }
      ]
    } : {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': DEFAULT_SEO.siteName,
      'url': DEFAULT_SEO.baseUrl,
      'description': DEFAULT_SEO.description,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${DEFAULT_SEO.baseUrl}/catalog?search={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]#seo-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.id = 'seo-schema';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLd);

  }, [title, description, keywords, ogImage, ogType, canonical, noindex, location.pathname]);

  return null;
}