import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface HomeHeaderProps {
  isLoggedIn: boolean;
  username: string;
  userBalance: number;
  availableWorks: number;
  cartItems: any[];
  favoriteItems: any[];
  mobileMenuOpen: boolean;
  onSetMobileMenuOpen: (open: boolean) => void;
  onSetAuthDialogOpen: (open: boolean) => void;
  onSetProfileDialogOpen: (open: boolean) => void;
  onSetCartDialogOpen: (open: boolean) => void;
  onSetFavoritesDialogOpen: (open: boolean) => void;
  onSetPromoDialogOpen: (open: boolean) => void;
  onSetPaymentDialogOpen: (open: boolean) => void;
  onSetReferralDialogOpen: (open: boolean) => void;
  onLogout: () => void;
}

export default function HomeHeader({
  isLoggedIn,
  username,
  userBalance,
  availableWorks,
  cartItems,
  favoriteItems,
  mobileMenuOpen,
  onSetMobileMenuOpen,
  onSetAuthDialogOpen,
  onSetProfileDialogOpen,
  onSetCartDialogOpen,
  onSetFavoritesDialogOpen,
  onSetPromoDialogOpen,
  onSetPaymentDialogOpen,
  onSetReferralDialogOpen,
  onLogout
}: HomeHeaderProps) {
  return (
    <header className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50 w-full">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
            <Icon name="Cpu" size={24} className="text-primary flex-shrink-0 sm:w-8 sm:h-8" />
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold truncate leading-tight">Tech Forma</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate leading-tight">Готовые студенческие работы</p>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            <a href="/" className="hover:text-primary transition-colors text-sm">Главная</a>
            <a href="/catalog" className="hover:text-primary transition-colors text-sm">Каталог</a>

            <a href="#blog" className="hover:text-primary transition-colors text-sm">Блог</a>
            <a href="#support" className="hover:text-primary transition-colors text-sm">Поддержка</a>
          </nav>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden h-8 w-8 sm:h-10 sm:w-10"
            onClick={() => onSetMobileMenuOpen(!mobileMenuOpen)}
          >
            <Icon name={mobileMenuOpen ? "X" : "Menu"} size={24} />
          </Button>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {isLoggedIn ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex"
                  onClick={() => onSetFavoritesDialogOpen(true)}
                >
                  <Icon name="Heart" size={18} className={favoriteItems.length > 0 ? 'text-red-500' : ''} />
                  {favoriteItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                      {favoriteItems.length}
                    </span>
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex"
                  onClick={() => onSetCartDialogOpen(true)}
                >
                  <Icon name="ShoppingCart" size={18} />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                      {cartItems.length}
                    </span>
                  )}
                </Button>
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-primary/10 rounded-full cursor-pointer" onClick={() => onSetPromoDialogOpen(true)}>
                    <Icon name="Coins" size={16} className="text-primary sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base font-bold text-primary">{userBalance}</span>
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground hidden sm:block">Доступно работ: {availableWorks}</p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full">
                      <Icon name="User" size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{username}</span>
                        <span className="text-xs text-muted-foreground font-normal">{userBalance} баллов</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onSetProfileDialogOpen(true)}>
                      <Icon name="User" size={16} className="mr-2" />
                      Профиль
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/buy-points">
                        <Icon name="Plus" size={16} className="mr-2" />
                        Пополнить баланс
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSetPromoDialogOpen(true)}>
                      <Icon name="Gift" size={16} className="mr-2" />
                      Промокод
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSetReferralDialogOpen(true)}>
                      <Icon name="Users" size={16} className="mr-2" />
                      Реферальная программа
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-red-600">
                      <Icon name="LogOut" size={16} className="mr-2" />
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => onSetAuthDialogOpen(true)} size="sm" className="text-xs sm:text-sm px-3 sm:px-4">
                Войти
              </Button>
            )}
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-white/95 backdrop-blur-md">
            <nav className="flex flex-col py-4 px-4 gap-2">
              <a 
                href="/" 
                className="py-3 px-4 hover:bg-primary/10 rounded-lg transition-colors text-base font-medium"
                onClick={() => onSetMobileMenuOpen(false)}
              >
                Главная
              </a>
              <a 
                href="/catalog" 
                className="py-3 px-4 hover:bg-primary/10 rounded-lg transition-colors text-base font-medium"
                onClick={() => onSetMobileMenuOpen(false)}
              >
                Каталог
              </a>
              <a 
                href="#blog" 
                className="py-3 px-4 hover:bg-primary/10 rounded-lg transition-colors text-base font-medium"
                onClick={() => onSetMobileMenuOpen(false)}
              >
                Блог
              </a>
              <a 
                href="#support" 
                className="py-3 px-4 hover:bg-primary/10 rounded-lg transition-colors text-base font-medium"
                onClick={() => onSetMobileMenuOpen(false)}
              >
                Поддержка
              </a>
              {isLoggedIn && (
                <>
                  <div className="border-t my-2"></div>
                  <button 
                    className="py-3 px-4 hover:bg-primary/10 rounded-lg transition-colors text-base font-medium text-left flex items-center gap-2"
                    onClick={() => {
                      onSetFavoritesDialogOpen(true);
                      onSetMobileMenuOpen(false);
                    }}
                  >
                    <Icon name="Heart" size={18} />
                    Избранное {favoriteItems.length > 0 && `(${favoriteItems.length})`}
                  </button>
                  <button 
                    className="py-3 px-4 hover:bg-primary/10 rounded-lg transition-colors text-base font-medium text-left flex items-center gap-2"
                    onClick={() => {
                      onSetCartDialogOpen(true);
                      onSetMobileMenuOpen(false);
                    }}
                  >
                    <Icon name="ShoppingCart" size={18} />
                    Корзина {cartItems.length > 0 && `(${cartItems.length})`}
                  </button>
                  <button 
                    className="py-3 px-4 hover:bg-primary/10 rounded-lg transition-colors text-base font-medium text-left flex items-center gap-2"
                    onClick={() => {
                      onSetPaymentDialogOpen(true);
                      onSetMobileMenuOpen(false);
                    }}
                  >
                    <Icon name="Plus" size={18} />
                    Пополнить баланс
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}