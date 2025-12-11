import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import SEO from '@/components/SEO';

interface MentorAuthScreenProps {
  onNavigateHome: () => void;
}

export default function MentorAuthScreen({ onNavigateHome }: MentorAuthScreenProps) {
  return (
    <>
      <SEO title="Вход требуется — TechMentor" />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Icon name="Lock" size={48} className="mx-auto mb-4 text-primary" />
            <CardTitle className="text-2xl">Требуется авторизация</CardTitle>
            <CardDescription>
              Для доступа к TechMentor необходимо войти в аккаунт
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" size="lg" onClick={onNavigateHome}>
              <Icon name="LogIn" size={18} className="mr-2" />
              Войти в аккаунт
            </Button>
            <Button variant="outline" className="w-full" size="lg" onClick={onNavigateHome}>
              <Icon name="Home" size={18} className="mr-2" />
              На главную
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
