import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

interface CartItem {
  id: number;
  title: string;
  type: string;
  subject: string;
  price: number;
}

interface CartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  onRemoveItem: (id: number) => void;
  onCheckout: () => void;
  userBalance: number;
}

export default function CartDialog({
  open,
  onOpenChange,
  items,
  onRemoveItem,
  onCheckout,
  userBalance
}: CartDialogProps) {
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const canAfford = userBalance >= totalPrice;

  const handleCheckout = () => {
    if (!canAfford) {
      toast({
        title: 'Недостаточно баллов',
        description: 'Пополните баланс для покупки',
        variant: 'destructive',
      });
      return;
    }
    onCheckout();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="ShoppingCart" size={24} className="text-primary" />
            Корзина
            {items.length > 0 && (
              <Badge variant="secondary">{items.length}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="ShoppingCart" size={64} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Корзина пуста</p>
              <p className="text-muted-foreground">Добавьте работы из каталога</p>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">{item.title}</h4>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{item.type}</Badge>
                          <span className="flex items-center gap-1">
                            <Icon name="BookOpen" size={14} />
                            {item.subject}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 font-semibold text-lg">
                          <Icon name="Coins" size={18} className="text-primary" />
                          {item.price}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                        >
                          <Icon name="Trash2" size={16} className="mr-2" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Всего работ:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Итого:</span>
                  <div className="flex items-center gap-2">
                    <Icon name="Coins" size={20} className="text-primary" />
                    <span className="text-2xl font-bold">{totalPrice}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Ваш баланс:</span>
                  <span className={userBalance >= totalPrice ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {userBalance} баллов
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <DialogFooter>
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Продолжить покупки
              </Button>
              <Button 
                onClick={handleCheckout} 
                disabled={!canAfford}
                className="flex-1"
              >
                <Icon name="CreditCard" size={16} className="mr-2" />
                Оформить заказ
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
