import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { useState, useEffect } from 'react';
import func2url from '../../backend/func2url.json';

interface ReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  userId?: number;
}

export default function ReferralDialog({
  open,
  onOpenChange,
  username,
  userId
}: ReferralDialogProps) {
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState(0);
  const [earned, setEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const referralLink = referralCode ? `${window.location.origin}/register?ref=${referralCode}` : '';

  useEffect(() => {
    const loadReferralData = async () => {
      if (!userId || !open) return;
      
      setLoading(true);
      try {
        const response = await fetch(`${func2url['user-data']}?user_id=${userId}&action=referrals`);
        const data = await response.json();
        
        if (data.referral) {
          setReferralCode(data.referral.code);
          setReferrals(data.referral.referred_count);
          setEarned(data.referral.total_earned);
        }
      } catch (error) {
        console.error('Failed to load referral data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadReferralData();
  }, [userId, open]);

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
                  Получай <span className="font-bold text-primary">600 баллов</span> за каждого приглашенного друга
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
              <li>Скопируйте реферальную ссылку</li>
              <li>Отправьте ссылку другу</li>
              <li>Друг переходит по ссылке и регистрируется</li>
              <li>Вы получаете 600 баллов на счёт</li>
              <li>Друг получает стартовый бонус 1000 баллов</li>
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