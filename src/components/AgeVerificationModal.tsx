import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function AgeVerificationModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasVerified = localStorage.getItem('age_verified');
    if (!hasVerified) {
      setOpen(true);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem('age_verified', 'true');
    setOpen(false);
  };

  const handleDecline = () => {
    alert('Доступ к платформе разрешен только лицам, достигшим 18 лет.');
    window.location.href = 'https://google.com';
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <Icon name="ShieldAlert" size={48} className="text-red-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Подтверждение возраста 18+
          </DialogTitle>
          <DialogDescription className="text-center text-base space-y-4 pt-4">
            <p className="font-semibold text-lg text-slate-900">
              Вам исполнилось 18 лет?
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
              <p className="text-sm text-amber-900">
                <Icon name="AlertTriangle" size={16} className="inline mr-2" />
                <strong>Внимание:</strong> Все материалы на платформе предназначены <strong>ИСКЛЮЧИТЕЛЬНО для ознакомления и изучения</strong> структуры оформления работ по ГОСТ.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left text-sm">
              <p className="text-blue-900">
                <Icon name="Info" size={16} className="inline mr-2" />
                Tech Forma — это маркетплейс (посредник). Платформа НЕ создаёт контент, НЕ проверяет и НЕ гарантирует оригинальность работ.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            onClick={handleConfirm}
            className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
          >
            <Icon name="Check" size={20} className="mr-2" />
            Да, мне есть 18 лет
          </Button>
          <Button 
            onClick={handleDecline}
            variant="outline"
            className="w-full h-12 text-lg border-red-300 text-red-600 hover:bg-red-50"
          >
            <Icon name="X" size={20} className="mr-2" />
            Нет, мне нет 18 лет
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
