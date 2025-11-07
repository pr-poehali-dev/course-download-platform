import { useState, useEffect } from 'react';
import { authService } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default function TestLoginPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        console.log('Token from localStorage:', token);
        
        const verifiedUser = await authService.verify();
        console.log('Verified user:', verifiedUser);
        
        setUser(verifiedUser);
        setError(null);
      } catch (err: any) {
        console.error('Auth error:', err);
        setError(err.message || 'Unknown error');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userId');
    setUser(null);
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Проверяем авторизацию...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Тест авторизации</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Ошибка:</strong> {error}
          </div>
        )}
        
        {user ? (
          <div className="space-y-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              ✅ Авторизация успешна!
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="font-bold mb-2">Данные пользователя:</h2>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            
            <div className="flex gap-4">
              <Button onClick={handleLogout} variant="destructive">
                Выйти
              </Button>
              <Button onClick={() => window.location.href = '/'}>
                На главную
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              ⚠️ Вы не авторизованы
            </div>
            
            <Button onClick={() => window.location.href = '/login'}>
              Войти
            </Button>
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t">
          <h3 className="font-bold mb-2">Информация из localStorage:</h3>
          <div className="bg-gray-50 rounded p-3 text-sm">
            <p><strong>auth_token:</strong> {localStorage.getItem('auth_token') || 'Не установлен'}</p>
            <p><strong>userId:</strong> {localStorage.getItem('userId') || 'Не установлен'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
