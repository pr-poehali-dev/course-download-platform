import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom">
      <Card className="max-w-4xl mx-auto p-6 shadow-2xl border-2">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-shrink-0">
            <Icon name="Cookie" size={40} className="text-primary" />
          </div>
          
          <div className="flex-1 space-y-2">
            <h3 className="font-bold text-lg">Мы используем cookies</h3>
            <p className="text-sm text-muted-foreground">
              Мы используем файлы cookies для улучшения работы сайта, анализа посещаемости 
              и персонализации контента. Продолжая использовать сайт, вы соглашаетесь 
              с использованием cookies в соответствии с{' '}
              <a href="/privacy-policy" className="text-primary hover:underline">
                Политикой конфиденциальности
              </a>.
            </p>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={handleDecline}
              className="min-w-[100px]"
            >
              Отклонить
            </Button>
            <Button 
              onClick={handleAccept}
              className="min-w-[100px]"
            >
              Принять
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
