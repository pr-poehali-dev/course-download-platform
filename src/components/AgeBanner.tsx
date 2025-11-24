import Icon from '@/components/ui/icon';

export default function AgeBanner() {
  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white text-center py-2 px-4 text-xs sm:text-sm shadow-md">
      <div className="container mx-auto flex items-center justify-center gap-2 flex-wrap">
        <Icon name="ShieldAlert" size={16} className="flex-shrink-0" />
        <strong className="font-bold">18+</strong>
        <span className="hidden sm:inline">•</span>
        <span>Материалы только для ознакомления и изучения структуры оформления</span>
        <span className="hidden md:inline">•</span>
        <span className="hidden md:inline">База референсных материалов</span>
      </div>
    </div>
  );
}
