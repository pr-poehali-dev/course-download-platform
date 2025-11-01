import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { authService } from '@/lib/auth';
import func2url from '../../backend/func2url.json';

interface UploadFile {
  workId: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  zipUrl?: string;
  previewUrl?: string;
  error?: string;
}

export default function BatchUploadPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = await authService.verify();
      if (!user || user.role !== 'admin') {
        navigate('/');
        return;
      }
      setIsAdmin(true);
    };
    checkAdmin();
  }, [navigate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    const newFiles: UploadFile[] = selectedFiles.map(file => {
      // Извлекаем workId из названия файла (например: "123_work.zip" -> "123")
      const workId = file.name.split('_')[0] || '';
      
      return {
        workId,
        file,
        status: 'pending'
      };
    });
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleWorkIdChange = (index: number, newWorkId: string) => {
    setFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, workId: newWorkId } : f
    ));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    setUploading(true);
    
    const BATCH_UPLOAD_URL = func2url['batch-upload-works'];
    
    // Конвертируем файлы в base64
    const filesData = await Promise.all(
      files.map(async ({ workId, file }) => {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(file);
        });
        
        return {
          workId,
          name: file.name,
          base64
        };
      })
    );
    
    try {
      const response = await fetch(BATCH_UPLOAD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: filesData })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Обновляем статусы
        setFiles(prev => prev.map(f => {
          const uploaded = data.uploaded.find((u: any) => u.workId === f.workId);
          if (uploaded) {
            return {
              ...f,
              status: 'success',
              zipUrl: uploaded.zipUrl,
              previewUrl: uploaded.previewUrl
            };
          }
          
          const error = data.errors.find((e: any) => e.workId === f.workId);
          if (error) {
            return {
              ...f,
              status: 'error',
              error: error.error
            };
          }
          
          return f;
        }));
        
        alert(`✅ Загружено: ${data.successful}/${data.total} работ`);
      } else {
        alert('❌ Ошибка загрузки: ' + data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Ошибка загрузки файлов');
    } finally {
      setUploading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation isLoggedIn={true} />
      
      <main className="container mx-auto px-4 py-6 mt-16 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Массовая загрузка работ</h1>
            <p className="text-gray-600 mt-2">Загрузите ZIP-архивы работ с автоматическим созданием превью</p>
          </div>
          <Button onClick={() => navigate('/admin')} variant="outline">
            <Icon name="ArrowLeft" className="mr-2" size={18} />
            Назад
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Инструкция</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Переименуйте ZIP-файлы: <code className="bg-gray-100 px-2 py-1 rounded">ID_название.zip</code></li>
            <li>Например: <code className="bg-gray-100 px-2 py-1 rounded">cm123_курсовая.zip</code></li>
            <li>Выберите все файлы сразу (можно выбрать несколько)</li>
            <li>Система автоматически извлечёт ID из названия</li>
            <li>Проверьте ID и нажмите "Загрузить всё"</li>
          </ol>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-4">
            <label className="cursor-pointer">
              <Button type="button" variant="outline" className="w-full" asChild>
                <span>
                  <Icon name="Upload" className="mr-2" size={20} />
                  Выбрать ZIP-файлы
                </span>
              </Button>
              <input
                type="file"
                accept=".zip"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {files.length > 0 && (
            <>
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {files.map((f, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded border ${
                      f.status === 'success' ? 'bg-green-50 border-green-200' :
                      f.status === 'error' ? 'bg-red-50 border-red-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{f.file.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">ID работы:</span>
                        <input
                          type="text"
                          value={f.workId}
                          onChange={(e) => handleWorkIdChange(index, e.target.value)}
                          className="text-xs border rounded px-2 py-1 w-32"
                          disabled={f.status !== 'pending'}
                        />
                      </div>
                      {f.error && (
                        <div className="text-xs text-red-600 mt-1">{f.error}</div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {f.status === 'success' && (
                        <Icon name="CheckCircle" className="text-green-600" size={20} />
                      )}
                      {f.status === 'error' && (
                        <Icon name="XCircle" className="text-red-600" size={20} />
                      )}
                      {f.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={uploadFiles}
                disabled={uploading || files.some(f => !f.workId)}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                    Загрузка... ({files.filter(f => f.status === 'success').length}/{files.length})
                  </>
                ) : (
                  <>
                    <Icon name="Upload" className="mr-2" size={20} />
                    Загрузить всё ({files.length} файлов)
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
