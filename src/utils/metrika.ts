declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: any[]) => void;
  }
}

const METRIKA_ID = 99299244;

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.ym) {
    // Логи только в режиме разработки
    if (import.meta.env.DEV) {
      console.log('📊 Метрика:', eventName, params);
    }
    window.ym(METRIKA_ID, 'reachGoal', eventName, params);
  } else if (import.meta.env.DEV) {
    console.warn('⚠️ Яндекс.Метрика не загружена');
  }
};

export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(METRIKA_ID, 'hit', url, {
      title: title || document.title,
      referer: document.referrer
    });
  }
};

export const trackScroll = (depth: number) => {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(METRIKA_ID, 'reachGoal', `scroll_${depth}`);
  }
};

export const metrikaEvents = {
  CATALOG_OPEN: 'catalog_open',
  CATALOG_SEARCH: 'catalog_search',
  CATALOG_FILTER: 'catalog_filter',
  WORK_VIEW: 'work_view',
  WORK_DOWNLOAD: 'work_download',
  WORK_QUICKVIEW: 'work_quickview',
  WORK_BUY_CLICK: 'work_buy_click',
  WORK_PURCHASE_CLICK: 'work_purchase_click',
  WORK_FAVORITE: 'work_favorite',
  BUTTON_CLICK: 'button_click',
  SCROLL_25: 'scroll_25',
  SCROLL_50: 'scroll_50',
  SCROLL_75: 'scroll_75',
  SCROLL_100: 'scroll_100',
  BLOG_ARTICLE_VIEW: 'blog_article_view',
  BLOG_LIST_VIEW: 'blog_list_view',
  CTA_CLICK: 'cta_click',
  SEARCH: 'search',
  FILTER_APPLY: 'filter_apply',
  AUTH_OPEN: 'auth_open',
  AUTH_CLOSE: 'auth_close',
  REGISTER_SUCCESS: 'register_success',
  LOGIN_SUCCESS: 'login_success',
  CONTACT_CLICK: 'contact_click',
  FAQ_OPEN: 'faq_open',
  PAYMENT_OPEN: 'payment_open',
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_SUCCESS: 'payment_success',
  PREMIUM_SUBSCRIBE_CLICK: 'premium_subscribe_click',
  REFERRAL_COPY: 'referral_copy',
  PROFILE_TAB: 'profile_tab'
};