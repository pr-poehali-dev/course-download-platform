import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export default function AboutSection() {
  return (
    <section id="about" className="py-16 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">О платформе</h2>
            <p className="text-lg text-gray-600">
              Техническая библиотека для инженеров и студентов
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Icon name="Target" size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Наша миссия</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Помогать учиться эффективнее через обмен материалами. База справочных работ для обучения.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Icon name="Shield" size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Безопасность</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Безопасное хранение материалов. Модерация всех загружаемых файлов.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Icon name="Users" size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Сообщество</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Растущее сообщество студентов и инженеров, обменивающихся знаниями.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Icon name="Coins" size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Балльная система</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Делись материалами — получай баллы. Используй баллы для доступа к работам других.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="AlertTriangle" size={20} className="text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-yellow-900">Правовое уведомление</h3>
                <p className="text-sm text-yellow-800 leading-relaxed">
                  Материалы предназначены для образовательных целей как справочные пособия. 
                  <strong> Все материалы требуют обязательной авторской переработки.</strong> 
                  Прямое копирование запрещено.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}