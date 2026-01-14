import { useState, useEffect } from 'react';
import TemporaryPasswordWarning from './TemporaryPasswordWarning';
import ChangePasswordModal from './ChangePasswordModal';

interface AppWrapperProps {
  children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isTemporaryPassword, setIsTemporaryPassword] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsTemporaryPassword(user.is_temporary_password === true);
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
  }, []);

  return (
    <>
      {isTemporaryPassword && (
        <TemporaryPasswordWarning onChangePassword={() => setShowPasswordModal(true)} />
      )}
      
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        isTemporaryPassword={isTemporaryPassword}
      />
      
      {children}
    </>
  );
}
