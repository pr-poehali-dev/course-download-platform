import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface NavigationProps {
  onCartClick?: () => void;
  onFavoritesClick?: () => void;
  onPromoClick?: () => void;
  onPaymentClick?: () => void;
  userBalance?: number;
  cartCount?: number;
  favoritesCount?: number;
}

export default function Navigation({
  onCartClick,
  onFavoritesClick,
  onPromoClick,
  onPaymentClick,
  userBalance = 0,
  cartCount = 0,
  favoritesCount = 0,
}: NavigationProps) {
  return (
    <header className="border-b bg-white/95 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <Icon name="Cpu" size={32} className="text-primary" />
            <h1 className="text-2xl font-bold">Tech Forma</h1>
          </a>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="hover:text-primary transition-colors">Главная</a>
            <a href="/catalog" className="hover:text-primary transition-colors">Каталог</a>
            <a href="/ai-assistant" className="hover:text-primary transition-colors flex items-center gap-1">
              <Icon name="Bot" size={16} />
              Адаптер Работ
            </a>
            <a href="/marketplace" className="hover:text-primary transition-colors">Авторам</a>
            <a href="/#blog" className="hover:text-primary transition-colors">Блог</a>
            <a href="/#support" className="hover:text-primary transition-colors">Поддержка</a>
          </nav>

          <div className="flex items-center gap-2">
            {onFavoritesClick && (
              <Button 
                variant="ghost" 
                size="icon"
                className="relative"
                onClick={onFavoritesClick}
              >
                <Icon name="Heart" size={20} className={favoritesCount > 0 ? 'text-red-500' : ''} />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </Button>
            )}
            
            {onCartClick && (
              <Button 
                variant="ghost" 
                size="icon"
                className="relative"
                onClick={onCartClick}
              >
                <Icon name="ShoppingCart" size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            )}
            
            {onPromoClick && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full cursor-pointer" onClick={onPromoClick}>
                  <Icon name="Coins" size={20} className="text-primary" />
                  <span className="font-semibold">{userBalance}</span>
                </div>
              </div>
            )}
            
            {onPaymentClick && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onPaymentClick}
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Пополнить
              </Button>
            )}

            <Button size="sm" asChild>
              <a href="/profile">
                <Icon name="User" size={16} className="mr-2" />
                Профиль
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}