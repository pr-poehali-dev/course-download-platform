import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

interface DownloadDisclaimerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  workTitle: string;
}

export default function DownloadDisclaimerModal({ 
  open, 
  onOpenChange, 
  onConfirm, 
  workTitle 
}: DownloadDisclaimerModalProps) {
  const [age18, setAge18] = useState(false);
  const [educational, setEducational] = useState(false);
  const [noDirectUse, setNoDirectUse] = useState(false);
  const [responsibility, setResponsibility] = useState(false);

  const allChecked = age18 && educational && noDirectUse && responsibility;

  const handleConfirm = () => {
    if (allChecked) {
      onConfirm();
      // Reset checkboxes
      setAge18(false);
      setEducational(false);
      setNoDirectUse(false);
      setResponsibility(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <Icon name="AlertTriangle" size={32} className="text-amber-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Подтверждение ознакомления
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            Перед получением доступа к материалу <strong>"{workTitle}"</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-sm font-bold text-red-900 mb-2">
              <Icon name="ShieldAlert" size={18} className="inline mr-2" />
              ВАЖНО: Подтвердите, что вы понимаете следующее:
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <Checkbox 
                id="age18" 
                checked={age18} 
                onCheckedChange={(checked) => setAge18(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="age18" className="text-sm cursor-pointer flex-1">
                <strong>Мне исполнилось 18 лет</strong> и я имею право использовать данную платформу
              </label>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <Checkbox 
                id="educational" 
                checked={educational} 
                onCheckedChange={(checked) => setEducational(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="educational" className="text-sm cursor-pointer flex-1">
                Я буду использовать материалы <strong>ТОЛЬКО для ознакомления и изучения</strong> структуры оформления работ
              </label>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <Checkbox 
                id="noDirectUse" 
                checked={noDirectUse} 
                onCheckedChange={(checked) => setNoDirectUse(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="noDirectUse" className="text-sm cursor-pointer flex-1">
                Я <strong>НЕ буду сдавать работу</strong> как свою без переработки и не буду использовать материал в нарушение академической этики
              </label>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <Checkbox 
                id="responsibility" 
                checked={responsibility} 
                onCheckedChange={(checked) => setResponsibility(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="responsibility" className="text-sm cursor-pointer flex-1">
                Я понимаю <strong>ответственность за нарушение</strong> академической этики и авторских прав
              </label>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            <Icon name="Info" size={16} className="inline mr-2" />
            <strong>Справка:</strong> Tech Forma является техническим посредником (маркетплейсом) и не несёт ответственности за содержание работ и их использование пользователями.
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            <Icon name="X" size={16} className="mr-2" />
            Отмена
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!allChecked}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Icon name="Check" size={16} className="mr-2" />
            Подтверждаю
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
