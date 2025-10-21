import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

interface TermsAcceptanceDialogProps {
  open: boolean;
  onAccept: () => void;
}

export default function TermsAcceptanceDialog({ open, onAccept }: TermsAcceptanceDialogProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const handleAccept = () => {
    if (agreedToTerms && agreedToPrivacy) {
      onAccept();
    }
  };

  const canAccept = agreedToTerms && agreedToPrivacy;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="FileText" size={32} className="text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">Принятие соглашений</DialogTitle>
          <DialogDescription className="text-center">
            Перед использованием платформы, пожалуйста, ознакомьтесь с документами
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-lg mb-2">Основные положения:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="mt-1 text-green-600 flex-shrink-0" />
                  <span>Вы подтверждаете, что являетесь совершеннолетним пользователем</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="mt-1 text-green-600 flex-shrink-0" />
                  <span>Вы обязуетесь использовать платформу в соответствии с законодательством РФ</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="mt-1 text-green-600 flex-shrink-0" />
                  <span>Вы несёте ответственность за сохранность своих учётных данных</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="mt-1 text-green-600 flex-shrink-0" />
                  <span>Платформа имеет право изменять условия использования с уведомлением пользователей</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Конфиденциальность:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Shield" size={16} className="mt-1 text-blue-600 flex-shrink-0" />
                  <span>Мы собираем только необходимые данные для работы сервиса</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Shield" size={16} className="mt-1 text-blue-600 flex-shrink-0" />
                  <span>Ваши персональные данные защищены и не передаются третьим лицам</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Shield" size={16} className="mt-1 text-blue-600 flex-shrink-0" />
                  <span>Вы можете запросить удаление своих данных в любое время</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <Icon name="Info" size={16} className="inline mr-2" />
                Для получения подробной информации, пожалуйста, ознакомьтесь с полными версиями документов по ссылкам ниже.
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="space-y-4 mt-4">
          <div className="flex items-start space-x-3 p-3 bg-secondary/30 rounded-lg">
            <Checkbox 
              id="terms" 
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              className="mt-1"
            />
            <label 
              htmlFor="terms" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Я прочитал(а) и принимаю{' '}
              <Link to="/terms-of-service" target="_blank" className="text-primary hover:underline">
                Пользовательское соглашение
              </Link>
              {' '}и{' '}
              <Link to="/usage-rules" target="_blank" className="text-primary hover:underline">
                Правила использования
              </Link>
            </label>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-secondary/30 rounded-lg">
            <Checkbox 
              id="privacy" 
              checked={agreedToPrivacy}
              onCheckedChange={(checked) => setAgreedToPrivacy(checked as boolean)}
              className="mt-1"
            />
            <label 
              htmlFor="privacy" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Я прочитал(а) и принимаю{' '}
              <Link to="/privacy-policy" target="_blank" className="text-primary hover:underline">
                Политику конфиденциальности
              </Link>
              {' '}и даю согласие на обработку персональных данных
            </label>
          </div>

          <Button 
            onClick={handleAccept} 
            disabled={!canAccept}
            className="w-full h-12 text-lg gradient-purple-blue"
          >
            <Icon name="Check" size={20} className="mr-2" />
            Принять и продолжить
          </Button>

          {!canAccept && (
            <p className="text-sm text-center text-muted-foreground">
              Пожалуйста, примите все соглашения для продолжения
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
