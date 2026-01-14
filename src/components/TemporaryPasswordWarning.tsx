import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface TemporaryPasswordWarningProps {
  onChangePassword: () => void;
}

export default function TemporaryPasswordWarning({ onChangePassword }: TemporaryPasswordWarningProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-900">
                <strong>Вы используете временный пароль.</strong> Рекомендуем сменить его для безопасности вашего аккаунта.
              </p>
            </div>
            <button
              onClick={onChangePassword}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
            >
              Сменить пароль
            </button>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-amber-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5 text-amber-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
