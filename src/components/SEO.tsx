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
  title: 'Tech Forma — Инженерная платформа | Чертежи DWG, 3D-модели, CAD проекты',
  description: '⭐ Инженерная платформа для студентов и специалистов. 500+ чертежей DWG/DXF, 3D-модели STEP/STL, технические расчёты, проектная документация. База справочных материалов для обучения и практики.',
  keywords: 'чертежи dwg скачать, cad проекты, 3d модели step, технические расчёты примеры, проектная документация, инженерная платформа, учебные материалы инженеров, чертежи для студентов, dxf файлы, solidworks модели, компас чертежи',
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
    
    const normalizeUrl = (url: string) => {
      if (url === DEFAULT_SEO.baseUrl || url === `${DEFAULT_SEO.baseUrl}/`) return DEFAULT_SEO.baseUrl;
      return url.endsWith('/') ? url : `${url}/`;
    };
    
    const canonicalUrl = canonical || normalizeUrl(`${DEFAULT_SEO.baseUrl}${location.pathname}`);

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
    const isCatalogPage = location.pathname === '/catalog' || location.pathname === '/catalog/';
    
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
          'inLanguage': 'ru-RU',
          'publisher': {
            '@id': `${DEFAULT_SEO.baseUrl}/#organization`
          },
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
          },
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': 'пр-кт Богатырский, д. 18, корп. 1, кв. 95',
            'addressLocality': 'Санкт-Петербург',
            'postalCode': '197198',
            'addressCountry': 'RU'
          },
          'geo': {
            '@type': 'GeoCoordinates',
            'latitude': '59.938955',
            'longitude': '30.315644'
          },
          'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': '4.8',
            'reviewCount': '150',
            'bestRating': '5',
            'worstRating': '1'
          },
          'sameAs': [
            'https://vk.com/techforma',
            'https://t.me/techforma'
          ]
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
          'name': 'Категории материалов',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Чертежи DWG/DXF',
              'url': `${DEFAULT_SEO.baseUrl}/catalog?category=drawings`
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': '3D-модели STEP/STL',
              'url': `${DEFAULT_SEO.baseUrl}/catalog?category=3d-models`
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': 'Технические расчёты',
              'url': `${DEFAULT_SEO.baseUrl}/catalog?category=calculations`
            },
            {
              '@type': 'ListItem',
              'position': 4,
              'name': 'Проектная документация',
              'url': `${DEFAULT_SEO.baseUrl}/catalog?category=documentation`
            }
          ]
        },
        {
          '@type': 'FAQPage',
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'Что такое Tech Forma?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Tech Forma — это инженерная платформа для студентов и специалистов, где можно скачать чертежи DWG/DXF, 3D-модели STEP/STL, технические расчёты и проектную документацию. База содержит более 500 работ для обучения и практики.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Какие форматы файлов доступны?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'На платформе доступны чертежи в форматах DWG и DXF (AutoCAD, КОМПАС), 3D-модели в форматах STEP, STL, SLDPRT (SolidWorks), технические расчёты в Excel/PDF и проектная документация.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Как скачать чертежи?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Для скачивания чертежей нужно зарегистрироваться, пополнить баланс баллами и приобрести нужную работу. После покупки файл доступен для скачивания в течение 7 дней.'
              }
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