import React, { lazy, Suspense } from 'react';
import { LucideProps } from 'lucide-react';

interface IconProps extends LucideProps {
  name: string;
  fallback?: string;
}

// Динамический импорт только нужной иконки
const Icon: React.FC<IconProps> = ({ name, fallback = 'CircleAlert', ...props }) => {
  const LazyIcon = lazy(() => 
    import('lucide-react').then((module) => {
      const IconComponent = (module as Record<string, React.FC<LucideProps>>)[name];
      
      if (!IconComponent) {
        // Если иконка не найдена, используем fallback
        const FallbackIcon = (module as Record<string, React.FC<LucideProps>>)[fallback];
        
        if (!FallbackIcon) {
          return { default: () => <span className="text-xs text-gray-400">[icon]</span> };
        }
        
        return { default: FallbackIcon };
      }
      
      return { default: IconComponent };
    }).catch(() => ({
      default: () => <span className="text-xs text-gray-400">[icon]</span>
    }))
  );

  return (
    <Suspense fallback={<span className="inline-block w-4 h-4" />}>
      <LazyIcon {...props} />
    </Suspense>
  );
};

export default Icon;