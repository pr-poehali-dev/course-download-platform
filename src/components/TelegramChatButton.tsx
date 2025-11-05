import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

export default function TelegramChatButton() {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/bot-subscription');
  };

  return (
    <a
      href="/bot-subscription"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-110 flex items-center justify-center group relative cursor-pointer">
        <Icon name="MessageCircle" size={28} className="text-white" />
        
        {isHovered && (
          <div className="absolute right-full mr-4 whitespace-nowrap bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-xl animate-in fade-in slide-in-from-right-2 duration-200">
            Telegram бот с ИИ 🤖
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-gray-900"></div>
          </div>
        )}
        
        <span className="absolute -top-1 -right-1 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-2 border-white"></span>
        </span>
      </div>
    </a>
  );
}