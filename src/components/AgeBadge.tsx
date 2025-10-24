import { Badge } from '@/components/ui/badge';

export default function AgeBadge() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge 
        variant="destructive" 
        className="text-lg font-bold px-4 py-2 shadow-lg border-2 border-white"
      >
        18+
      </Badge>
    </div>
  );
}
