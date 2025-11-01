import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

export default function AddWorkManualPage() {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [workType, setWorkType] = useState('');
  const [subject, setSubject] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [result, setResult] = useState<any>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !imageFile) {
      alert('Заполни название и загрузи фото!');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = (reader.result as string).split(',')[1];

        const response = await fetch(func2url['add-work-manual'], {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            work_type: workType,
            subject,
            price_points: parseInt(price) || 0,
            image_base64: base64Image,
            image_filename: imageFile.name
          })
        });

        const data = await response.json();
        setResult(data);

        if (data.success) {
          setTitle('');
          setDescription('');
          setWorkType('');
          setSubject('');
          setPrice('');
          setImageFile(null);
          setImagePreview('');
        }
      };
      
      reader.readAsDataURL(imageFile);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setResult({ success: false, error: 'Ошибка загрузки' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📤 Добавить работу</h1>
          <p className="text-gray-600">Загрузи фото работы и заполни карточку</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-lg">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Фото работы *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
              {imagePreview ? (
                <div className="space-y-4">
                  <img 
                    src={imagePreview} 
                    alt="Превью" 
                    className="max-h-64 mx-auto rounded-lg shadow-md"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                  >
                    <Icon name="X" className="mr-2 h-4 w-4" />
                    Удалить
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Icon name="Upload" className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-2">Нажми для загрузки</p>
                  <p className="text-sm text-gray-400">PNG, JPG до 10MB</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Название работы *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Курсовая по химии"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Описание
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание работы..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Тип работы
              </label>
              <Input
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                placeholder="Курсовая"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Предмет
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Химия"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Цена (баллы)
            </label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="100"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading || !title || !imageFile}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {loading ? (
              <>
                <Icon name="Loader2" className="mr-2 h-5 w-5 animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                <Icon name="Send" className="mr-2 h-5 w-5" />
                Добавить работу
              </>
            )}
          </Button>
        </form>

        {result && (
          <div className={`mt-6 p-6 rounded-xl border-2 ${
            result.success 
              ? 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-start gap-3">
              <Icon 
                name={result.success ? 'CheckCircle2' : 'XCircle'} 
                className={result.success ? 'text-green-600' : 'text-red-600'}
                size={24}
              />
              <div className="flex-1">
                <h3 className={`font-semibold ${
                  result.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {result.success ? '✅ Работа добавлена!' : '❌ Ошибка'}
                </h3>
                <p className={`text-sm mt-1 ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.success 
                    ? `ID: ${result.work_id} | Фото: ${result.image_url}`
                    : result.error || 'Неизвестная ошибка'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
