import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { useState, useEffect } from 'react';
import SupportTab from '@/components/profile/SupportTab';
import SalesTab from '@/components/profile/SalesTab';
import ProfileTab from '@/components/profile/ProfileTab';
import PurchasesTab from '@/components/profile/PurchasesTab';
import UploadsTab from '@/components/profile/UploadsTab';
import ReferralTab from '@/components/profile/ReferralTab';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  email: string;
  balance: number;
  onLogout: () => void;
  purchases: any[];
  onOpenReferral: () => void;
  userId: number | null;
  onBalanceUpdate: (newBalance: number) => void;
}

export default function ProfileDialog({ 
  open, 
  onOpenChange, 
  username, 
  email, 
  balance,
  onLogout,
  purchases,
  onOpenReferral,
  userId,
  onBalanceUpdate
}: ProfileDialogProps) {
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ username, email });
  const [activeTab, setActiveTab] = useState('profile');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    workType: '',
    price: '',
    subject: '',
    description: '',
    file: null as File | null,
    files: [] as File[]
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [userWorks, setUserWorks] = useState<any[]>([]);
  const [worksLoading, setWorksLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      loadUserWorks();
    }
  }, [open, userId]);

  const loadUserWorks = async () => {
    if (!userId) return;
    
    setWorksLoading(true);
    try {
      const response = await fetch(`https://functions.poehali.dev/bca1c84a-e7e6-4b4c-8b15-85a8f319e0b0/user/${userId}`, {
        headers: { 'X-User-Id': userId.toString() }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserWorks(data.works || []);
      }
    } catch (error) {
      console.error('Error loading user works:', error);
    } finally {
      setWorksLoading(false);
    }
  };

  const handleUploadWork = async () => {
    if (!userId) return;
    
    if (!email) {
      toast({
        title: 'Требуется подтверждение почты',
        description: 'Подтвердите email для загрузки работ',
        variant: 'destructive'
      });
      return;
    }
    
    const filesToUpload = uploadForm.files.length > 0 ? uploadForm.files : (uploadForm.file ? [uploadForm.file] : []);
    
    if (filesToUpload.length === 0) {
      toast({
        title: 'Нет файлов',
        description: 'Выберите хотя бы один файл',
        variant: 'destructive'
      });
      return;
    }
    
    setUploadLoading(true);
    
    try {
      // Конвертируем все файлы в base64
      const filesData = await Promise.all(
        filesToUpload.map(file => {
          return new Promise<{name: string, size: number, data: string}>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                name: file.name,
                size: file.size,
                data: reader.result as string
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );
      
      const uploadData = {
        title: uploadForm.title,
        workType: uploadForm.workType,
        subject: uploadForm.subject,
        description: uploadForm.description,
        price: parseInt(uploadForm.price),
        files: filesData
      };
      
      const response = await fetch('https://functions.poehali.dev/bca1c84a-e7e6-4b4c-8b15-85a8f319e0b0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString()
        },
        body: JSON.stringify(uploadData)
      });
      
      const result = await response.json();
      
      setUploadLoading(false);
      
      if (response.ok && result.success) {
        if (result.newBalance) {
          onBalanceUpdate(result.newBalance);
        }
        
        toast({
          title: 'Работа загружена!',
          description: `${result.message}. Начислено +${result.bonusEarned} баллов!`
        });
        
        setUploadForm({
          title: '',
          workType: '',
          price: '',
          subject: '',
          description: '',
          file: null,
          files: []
        });
        
        loadUserWorks();
      } else {
        toast({
          title: 'Ошибка загрузки',
          description: result.error || 'Не удалось загрузить работу',
          variant: 'destructive'
        });
      }
    } catch (error) {
      setUploadLoading(false);
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при загрузке',
        variant: 'destructive'
      });
    }
  };

  const handleSaveProfile = () => {
    toast({
      title: 'Профиль обновлён',
      description: 'Ваши данные успешно сохранены',
    });
    setEditMode(false);
  };

  const handleLogout = () => {
    onLogout();
    onOpenChange(false);
    toast({
      title: 'Вы вышли из системы',
      description: 'До скорой встречи!',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: {[key: string]: {label: string, variant: any}} = {
      'pending': { label: 'На модерации', variant: 'secondary' },
      'approved': { label: 'Одобрено', variant: 'default' },
      'rejected': { label: 'Отклонено', variant: 'destructive' }
    };
    
    const statusInfo = statusMap[status] || statusMap['pending'];
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="User" size={24} className="text-primary" />
            Личный кабинет
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">
              <Icon name="UserCircle" size={16} className="mr-2" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="purchases">
              <Icon name="ShoppingBag" size={16} className="mr-2" />
              Покупки
            </TabsTrigger>
            <TabsTrigger value="uploads">
              <Icon name="FileUp" size={16} className="mr-2" />
              Мои работы
            </TabsTrigger>
            <TabsTrigger value="sales">
              <Icon name="TrendingUp" size={16} className="mr-2" />
              Мои продажи
            </TabsTrigger>
            <TabsTrigger value="referral">
              <Icon name="Users" size={16} className="mr-2" />
              Рефералы
            </TabsTrigger>
            <TabsTrigger value="support">
              <Icon name="HelpCircle" size={16} className="mr-2" />
              Поддержка
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab
              balance={balance}
              editMode={editMode}
              editData={editData}
              username={username}
              email={email}
              onEditDataChange={setEditData}
              onEditModeChange={setEditMode}
              onSaveProfile={handleSaveProfile}
              onLogout={handleLogout}
              onTopUpBalance={() => {
                onOpenChange(false);
                window.location.href = '/profile?tab=balance';
              }}
              onContactSupport={() => setActiveTab('support')}
            />
          </TabsContent>

          <TabsContent value="purchases">
            <PurchasesTab purchases={purchases} />
          </TabsContent>

          <TabsContent value="uploads">
            <UploadsTab
              uploadForm={uploadForm}
              uploadLoading={uploadLoading}
              userWorks={userWorks}
              worksLoading={worksLoading}
              email={email}
              onUploadFormChange={setUploadForm}
              onUploadWork={handleUploadWork}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="sales">
            <SalesTab userId={userId} />
          </TabsContent>

          <TabsContent value="referral">
            <ReferralTab onOpenReferral={onOpenReferral} />
          </TabsContent>

          <TabsContent value="support">
            <SupportTab userEmail={email} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}