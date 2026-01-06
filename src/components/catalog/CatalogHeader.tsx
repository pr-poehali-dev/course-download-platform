import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface CatalogHeaderProps {
  worksCount: number;
}

// ✅ Мемоизация для предотвращения лишних ререндеров
const CatalogHeader = memo(function CatalogHeader({ worksCount }: CatalogHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-3">
        Каталог инженерных материалов — чертежи DWG, 3D-модели, расчёты от 200₽
      </h1>
      <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
        500+ инженерных материалов по всем направлениям. Скачайте чертёж DWG, 3D-модель или расчёт мгновенно после оплаты
      </p>
      <Badge className="glass-card border-blue-200 text-sm">
        <Icon name="FileText" size={14} className="mr-1" />
        {worksCount} {worksCount === 1 ? 'работа' : worksCount < 5 ? 'работы' : 'работ'}
      </Badge>
    </div>
  );
});

export default CatalogHeader;