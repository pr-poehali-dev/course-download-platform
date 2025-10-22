import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface FavoriteItem {
  id: number;
  title: string;
  type: string;
  subject: string;
  price: number;
  rating: number;
}

interface FavoritesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: FavoriteItem[];
  onRemoveItem: (id: number) => void;
  onAddToCart: (item: FavoriteItem) => void;
}

export default function FavoritesDialog({
  open,
  onOpenChange,
  items,
  onRemoveItem,
  onAddToCart
}: FavoritesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Heart" size={24} className="text-red-500" />
            Избранное
            {items.length > 0 && (
              <Badge variant="secondary">{items.length}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Heart" size={64} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Список избранного пуст</p>
              <p className="text-muted-foreground">Добавляйте работы, чтобы вернуться к ним позже</p>
            </div>
          ) : (
            items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{item.title}</h4>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <Badge variant="outline">{item.type}</Badge>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Icon name="BookOpen" size={14} />
                          {item.subject}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Icon name="Star" size={14} className="fill-yellow-400 text-yellow-400" />
                          {item.rating}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 font-semibold text-lg">
                        <Icon name="Coins" size={18} className="text-primary" />
                        {item.price}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            onAddToCart(item);
                            onRemoveItem(item.id);
                          }}
                        >
                          <Icon name="ShoppingCart" size={16} className="mr-2" />
                          В корзину
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                        >
                          <Icon name="X" size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
