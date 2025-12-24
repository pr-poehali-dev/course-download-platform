import { useEffect, useRef } from 'react';
import { trackEvent, metrikaEvents } from '@/utils/metrika';

export const useScrollTracking = () => {
  const scrollDepths = useRef({
    25: false,
    50: false,
    75: false,
    100: false
  });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return;
      
      rafRef.current = requestAnimationFrame(() => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrollTop = window.scrollY;
        const scrollPercent = (scrollTop / documentHeight) * 100;

        if (scrollPercent >= 25 && !scrollDepths.current[25]) {
          scrollDepths.current[25] = true;
          trackEvent(metrikaEvents.SCROLL_25);
        }
        if (scrollPercent >= 50 && !scrollDepths.current[50]) {
          scrollDepths.current[50] = true;
          trackEvent(metrikaEvents.SCROLL_50);
        }
        if (scrollPercent >= 75 && !scrollDepths.current[75]) {
          scrollDepths.current[75] = true;
          trackEvent(metrikaEvents.SCROLL_75);
        }
        if (scrollPercent >= 99 && !scrollDepths.current[100]) {
          scrollDepths.current[100] = true;
          trackEvent(metrikaEvents.SCROLL_100);
        }
        
        rafRef.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);
};