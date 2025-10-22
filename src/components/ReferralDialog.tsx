import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';

interface ReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
}

export default function ReferralDialog({
  open,
  onOpenChange,
  username
}: ReferralDialogProps) {
  const referralCode = username.toUpperCase().replace(/\s/g, '') + Math.floor(Math.random() * 1000);
  const referralLink = `https://techforma.ru/ref/${referralCode}`;
  const [referrals, setReferrals] = useState(0);
  const [earned, setEarned] = useState(0);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Скопировано!',
      description: 'Реферальная ссылка скопирована в буфер обмена',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Users" size={24} className="text-primary" />
            Реферальная программа
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Icon name="Gift" size={48} className="mx-auto text-primary" />
                <h3 className="text-2xl font-bold">Приглашай друзей</h3>
                <p className="text-muted-foreground">
                  Получай <span className="font-bold text-primary">50 баллов</span> за каждого приглашенного друга
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Icon name="UserPlus" size={32} className="mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold">{referrals}</div>
                <div className="text-sm text-muted-foreground">Рефералов</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Icon name="Coins" size={32} className="mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold">{earned}</div>
                <div className="text-sm text-muted-foreground">Заработано</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <Label>Ваша реферальная ссылка</Label>
            <div className="flex gap-2">
              <Input value={referralLink} readOnly />
              <Button onClick={copyToClipboard}>
                <Icon name="Copy" size={16} />
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
            <p className="font-medium">Как это работает:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Поделитесь ссылкой с друзьями</li>
              <li>Друг регистрируется по вашей ссылке</li>
              <li>Вы получаете 50 баллов на счет</li>
              <li>Друг получает бонус 25 баллов</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={copyToClipboard}>
              <Icon name="Copy" size={16} className="mr-2" />
              Копировать ссылку
            </Button>
            <Button variant="outline" className="flex-1">
              <Icon name="Share2" size={16} className="mr-2" />
              Поделиться
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
