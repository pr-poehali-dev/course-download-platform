import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

export default function AgeVerificationModal() {
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const hasVerified = localStorage.getItem('age_verified_18plus');
    if (!hasVerified) {
      setTimeout(() => setOpen(true), 500);
    }
  }, []);

  const handleConfirm = () => {
    if (!agreed) return;
    localStorage.setItem('age_verified_18plus', 'true');
    setOpen(false);
  };

  const handleDecline = () => {
    alert('Доступ к платформе разрешен только лицам, достигшим 18 лет.');
    window.location.href = 'https://yandex.ru';
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Icon name="ShieldAlert" size={32} className="text-red-600" />
          </div>
          <DialogTitle className="text-center text-xl">⚠️ Подтверждение возраста (18+)</DialogTitle>
          <DialogDescription className="text-center">
            Материалы на платформе предназначены ТОЛЬКО для лиц, достигших 18 лет
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-slate-700 font-medium mb-2">
              📋 Все материалы предоставляются ИСКЛЮЧИТЕЛЬНО:
            </p>
            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
              <li>Для ознакомления и изучения структуры</li>
              <li>Для изучения правил оформления по ГОСТ</li>
              <li>Для образовательных целей</li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-900 font-bold mb-2">
              ❌ ЗАПРЕЩЕНО:
            </p>
            <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
              <li>Сдавать работы как свои без переработки</li>
              <li>Использовать в коммерческих целях</li>
              <li>Нарушать авторские права</li>
            </ul>
          </div>

          <div className="flex items-start space-x-3 pt-2">
            <Checkbox 
              id="age-confirm" 
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <label 
              htmlFor="age-confirm" 
              className="text-sm leading-relaxed cursor-pointer"
            >
              Я подтверждаю, что мне исполнилось <strong>18 лет</strong> и я ознакомлен(а) с правилами использования материалов платформы
            </label>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleDecline}
            className="w-full sm:w-auto"
          >
            <Icon name="X" size={16} className="mr-2" />
            Мне нет 18 лет
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!agreed}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
          >
            <Icon name="CheckCircle" size={16} className="mr-2" />
            Подтверждаю (18+)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}