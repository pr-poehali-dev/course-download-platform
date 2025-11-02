import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function ConvertRarPage() {
  const downloadScript = () => {
    // Создаём и скачиваем скрипт
    const scriptUrl = '/convert_rar_to_zip_local.py';
    const a = document.createElement('a');
    a.href = scriptUrl;
    a.download = 'convert_rar_to_zip_local.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Icon name="PackageOpen" size={32} className="text-blue-600" />
            <h1 className="text-3xl font-bold">Конвертация RAR → ZIP</h1>
          </div>

          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="AlertTriangle" size={24} className="text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Почему нужна локальная конвертация?</h3>
                <p className="text-sm text-yellow-800 mb-2">
                  Cloud Functions не поддерживают библиотеку для работы с RAR из-за отсутствия системной утилиты <code className="bg-yellow-100 px-1 rounded">unrar</code>.
                </p>
                <p className="text-sm text-yellow-800">
                  Поэтому мы подготовили Python скрипт, который вы запустите <strong>один раз</strong> на своём компьютере, 
                  и он автоматически конвертирует все 485 RAR файлов в ZIP прямо в облаке.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Шаг 1 */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">Установите зависимости</h3>
                  <p className="text-sm text-blue-800 mb-3">Откройте терминал и выполните:</p>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-blue-700 mb-1">macOS:</p>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`brew install unrar
pip3 install boto3 rarfile psycopg2-binary tqdm`}
                      </pre>
                    </div>

                    <div>
                      <p className="text-xs text-blue-700 mb-1">Ubuntu/Debian:</p>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`sudo apt-get install unrar
pip3 install boto3 rarfile psycopg2-binary tqdm`}
                      </pre>
                    </div>

                    <div>
                      <p className="text-xs text-blue-700 mb-1">Windows:</p>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`# Скачайте unrar с https://www.rarlab.com/
pip install boto3 rarfile psycopg2-binary tqdm`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Шаг 2 */}
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-2">Скачайте скрипт</h3>
                  <p className="text-sm text-green-800 mb-3">
                    Скрипт уже готов и находится в корне проекта.
                  </p>
                  <Button onClick={downloadScript} className="bg-green-600 hover:bg-green-700">
                    <Icon name="Download" size={18} className="mr-2" />
                    Скачать convert_rar_to_zip_local.py
                  </Button>
                </div>
              </div>
            </Card>

            {/* Шаг 3 */}
            <Card className="p-6 bg-purple-50 border-purple-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-900 mb-2">Настройте секреты</h3>
                  <p className="text-sm text-purple-800 mb-3">
                    Откройте скрипт в редакторе и заполните 3 переменные:
                  </p>
                  
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-purple-200">
                      <p className="text-xs font-mono text-purple-700 mb-1">YANDEX_S3_KEY_ID</p>
                      <p className="text-sm text-purple-800">
                        Найдите в секретах проекта на poehali.dev
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded border border-purple-200">
                      <p className="text-xs font-mono text-purple-700 mb-1">YANDEX_S3_SECRET_KEY</p>
                      <p className="text-sm text-purple-800">
                        Найдите в секретах проекта на poehali.dev
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded border border-purple-200">
                      <p className="text-xs font-mono text-purple-700 mb-1">DATABASE_URL</p>
                      <p className="text-sm text-purple-800">
                        Найдите в секретах проекта на poehali.dev
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-purple-100 rounded">
                    <p className="text-xs text-purple-900">
                      💡 <strong>Где найти секреты?</strong> Проект → Настройки → Секреты
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Шаг 4 */}
            <Card className="p-6 bg-orange-50 border-orange-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 mb-2">Запустите скрипт</h3>
                  <p className="text-sm text-orange-800 mb-3">
                    В терминале выполните:
                  </p>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`python3 convert_rar_to_zip_local.py`}
                  </pre>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="Clock" size={16} className="text-orange-600 mt-0.5" />
                      <p className="text-sm text-orange-800">
                        <strong>Время выполнения:</strong> ~20-30 минут (485 файлов)
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="HardDrive" size={16} className="text-orange-600 mt-0.5" />
                      <p className="text-sm text-orange-800">
                        <strong>Использует:</strong> ~500 МБ дискового пространства временно
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Wifi" size={16} className="text-orange-600 mt-0.5" />
                      <p className="text-sm text-orange-800">
                        <strong>Интернет:</strong> Стабильное соединение обязательно
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Шаг 5 */}
            <Card className="p-6 bg-pink-50 border-pink-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-pink-900 mb-2">После завершения</h3>
                  <p className="text-sm text-pink-800 mb-3">
                    Когда скрипт завершит работу, перейдите на страницу извлечения превью:
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/extract-previews'}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    <Icon name="Image" size={18} className="mr-2" />
                    Перейти к извлечению превью
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* FAQ */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="HelpCircle" size={20} className="text-gray-600" />
              Частые вопросы
            </h3>

            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">
                  ❓ Можно ли конвертировать частями?
                </p>
                <p className="text-sm text-gray-700">
                  Да! Скрипт можно прервать (Ctrl+C) и запустить снова - он пропустит уже конвертированные файлы.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">
                  ❓ Что если появится ошибка?
                </p>
                <p className="text-sm text-gray-700">
                  Скрипт продолжит работу и покажет все ошибки в конце. Большинство ошибок не критичны.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">
                  ❓ Можно ли запустить на сервере?
                </p>
                <p className="text-sm text-gray-700">
                  Да, скрипт работает на любой Linux/macOS/Windows машине с Python 3.8+.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">
                  ❓ Удалятся ли RAR файлы?
                </p>
                <p className="text-sm text-gray-700">
                  Да, после успешной конвертации RAR файлы автоматически удаляются из S3 для экономии места.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
