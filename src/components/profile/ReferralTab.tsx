import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ReferralTabProps {
  onOpenReferral: () => void;
}

export default function ReferralTab({ onOpenReferral }: ReferralTabProps) {
  return (
    <div className="space-y-4 pt-4">
      <Card>
        <CardHeader>
          <CardTitle>Реферальная программа</CardTitle>
          <CardDescription>Приглашайте друзей и получайте бонусы</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Users" size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Приглашайте друзей</h3>
            <p className="text-muted-foreground mb-6">
              Получайте баллы за каждого приглашённого пользователя
            </p>
            <Button onClick={onOpenReferral}>
              <Icon name="Share2" size={16} className="mr-2" />
              Открыть реферальную ссылку
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
