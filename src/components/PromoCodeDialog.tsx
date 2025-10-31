import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';
import func2url from '../../backend/func2url.json';

interface PromoCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyPromo: (bonus: number, code: string, newBalance: number) => void;
  userId?: number;
}

const PROMO_CODES = {
  'WELCOME2024': { bonus: 50, description: 'Бонус для новых пользователей' },
  'STUDENT100': { bonus: 100, description: 'Специальное предложение для студентов' },
  'VIPUSER': { bonus: 200, description: 'Для VIP пользователей' }
};

export default function PromoCodeDialog({
  open,
  onOpenChange,
  onApplyPromo,
  userId
}: PromoCodeDialogProps) {
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!userId) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите, чтобы активировать промокод',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(func2url['activate-promo'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId, 
          promo_code: promoCode.toUpperCase() 
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        onApplyPromo(data.bonus_points, promoCode.toUpperCase(), data.new_balance);
        toast({
          title: 'Промокод активирован!',
          description: data.message || `Вам начислено ${data.bonus_points} баллов`,
        });
        setPromoCode('');
        onOpenChange(false);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось активировать промокод',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to activate promo:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось активировать промокод',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Gift" size={24} className="text-primary" />
            Активировать промокод
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="promo-code">Введите промокод</Label>
            <Input
              id="promo-code"
              placeholder="STUDENT100"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleApply()}
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="font-medium text-sm">Доступные промокоды:</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              {Object.entries(PROMO_CODES).map(([code, { bonus, description }]) => (
                <div key={code} className="flex justify-between items-center">
                  <span className="font-mono">{code}</span>
                  <span className="text-primary font-medium">+{bonus} баллов</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleApply} disabled={!promoCode || loading} className="w-full">
            {loading ? (
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
            ) : (
              <Icon name="Check" size={16} className="mr-2" />
            )}
            Активировать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}