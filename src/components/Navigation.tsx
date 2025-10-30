import { useState } from 'react';
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
  isLoggedIn?: boolean;
}

export default function Navigation({
  onCartClick,
  onFavoritesClick,
  onPromoClick,
  onPaymentClick,
  userBalance = 0,
  cartCount = 0,
  favoritesCount = 0,
  isLoggedIn = false,
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b bg-white/95 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 md:gap-3">
            <Icon name="Cpu" size={24} className="text-primary md:w-8 md:h-8" />
            <h1 className="text-lg md:text-2xl font-bold">Tech Forma</h1>
          </a>
          
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm">
            <a href="/" className="hover:text-primary transition-colors">Главная</a>
            <a href="/catalog" className="hover:text-primary transition-colors">Каталог</a>
            <a href="/ai-assistant" className="hover:text-primary transition-colors flex items-center gap-1">
              <Icon name="Bot" size={16} />
              TechMentor Pro
            </a>
            <a href="/marketplace" className="hover:text-primary transition-colors">Авторам</a>
            <a href="/#blog" className="hover:text-primary transition-colors">Блог</a>
            <a href="/#support" className="hover:text-primary transition-colors">Поддержка</a>
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
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
                <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-primary/10 rounded-full cursor-pointer" onClick={onPromoClick}>
                  <Icon name="Coins" size={16} className="text-primary md:w-5 md:h-5" />
                  <span className="font-semibold text-sm md:text-base">{userBalance}</span>
                </div>
              </div>
            )}
            
            {onPaymentClick && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onPaymentClick}
                className="hidden sm:flex text-xs md:text-sm h-8 md:h-9"
              >
                <Icon name="Plus" size={14} className="mr-1 md:mr-2" />
                <span className="hidden md:inline">Пополнить</span>
                <span className="md:hidden">+</span>
              </Button>
            )}

            {isLoggedIn ? (
              <Button size="sm" asChild className="text-xs md:text-sm h-8 md:h-9">
                <a href="/profile">
                  <Icon name="UserCircle" size={14} className="mr-0 md:mr-2" />
                  <span className="hidden md:inline">Личный кабинет</span>
                </a>
              </Button>
            ) : (
              <>
                <Button size="sm" variant="ghost" asChild className="text-xs md:text-sm h-8 md:h-9 hidden md:flex">
                  <a href="/login">
                    <Icon name="LogIn" size={14} className="mr-2" />
                    Вход
                  </a>
                </Button>
                <Button size="sm" asChild className="text-xs md:text-sm h-8 md:h-9">
                  <a href="/register">
                    <Icon name="UserPlus" size={14} className="mr-0 md:mr-2" />
                    <span className="hidden md:inline">Регистрация</span>
                    <span className="md:hidden">Вход</span>
                  </a>
                </Button>
              </>
            )}

            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={24} />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <nav className="flex flex-col gap-4">
              <a 
                href="/" 
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon name="Home" size={20} className="text-primary" />
                <span className="font-medium">Главная</span>
              </a>
              <a 
                href="/catalog" 
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon name="BookOpen" size={20} className="text-primary" />
                <span className="font-medium">Каталог</span>
              </a>
              <a 
                href="/ai-assistant" 
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon name="Bot" size={20} className="text-primary" />
                <span className="font-medium">TechMentor Pro</span>
              </a>
              <a 
                href="/marketplace" 
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon name="Briefcase" size={20} className="text-primary" />
                <span className="font-medium">Авторам</span>
              </a>
              <a 
                href="/#blog" 
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon name="Newspaper" size={20} className="text-primary" />
                <span className="font-medium">Блог</span>
              </a>
              <a 
                href="/#support" 
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon name="HelpCircle" size={20} className="text-primary" />
                <span className="font-medium">Поддержка</span>
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}