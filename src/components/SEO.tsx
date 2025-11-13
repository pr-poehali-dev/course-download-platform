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
  title: 'Tech Forma — Маркетплейс студенческих работ',
  description: 'Каталог курсовых, дипломов, чертежей. Маркетплейс для студентов. Покупай за баллы, продавай свои работы.',
  keywords: 'курсовые работы, дипломы, рефераты, студенческие работы купить, чертежи, маркетплейс работ',
  ogImage: 'https://cdn.poehali.dev/internal/img/og.png',
  siteName: 'Tech Forma'
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
    const currentUrl = `${window.location.origin}${location.pathname}`;
    const canonicalUrl = canonical || currentUrl;

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
    setMetaTag('og:url', currentUrl, true);
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

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': DEFAULT_SEO.siteName,
      'url': window.location.origin,
      'description': DEFAULT_SEO.description,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${window.location.origin}/catalog?search={search_term_string}`,
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