import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

export default function TestPaymentPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setResult('Запускаю тест...\n\n');

    try {
      const response = await fetch(func2url['payment'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'init_payment',
          user_id: 1000015,
          package_id: '100',
          success_url: `${window.location.origin}/payment/success`,
          fail_url: `${window.location.origin}/payment/failed`
        })
      });

      const data = await response.json();

      let resultText = `Status: ${response.status}\n\n`;
      resultText += `Response:\n${JSON.stringify(data, null, 2)}\n\n`;

      if (data.payment_url) {
        resultText += '✅ УСПЕХ! Получена ссылка на оплату:\n';
        resultText += data.payment_url;
        setResult(resultText);
      } else {
        resultText += '❌ ОШИБКА:\n';
        resultText += `Error: ${data.error || 'Unknown'}\n`;
        resultText += `Details: ${data.details || 'N/A'}\n`;
        resultText += `Error Code: ${data.error_code || 'N/A'}`;
        setResult(resultText);
      }
    } catch (error: any) {
      setResult(`❌ КРИТИЧЕСКАЯ ОШИБКА:\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const run10Tests = async () => {
    setLoading(true);
    setResult('Запускаю серию из 10 тестов...\n\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 1; i <= 10; i++) {
      setResult(prev => prev + `\nТЕСТ ${i}...\n`);

      try {
        const response = await fetch(func2url['payment'], {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'init_payment',
            user_id: 1000015,
            package_id: '100',
            success_url: `${window.location.origin}/payment/success`,
            fail_url: `${window.location.origin}/payment/failed`
          })
        });

        const data = await response.json();

        if (data.payment_url) {
          successCount++;
          setResult(prev => prev + `✅ Успех\n`);
        } else {
          errorCount++;
          setResult(prev => prev + `❌ Ошибка: ${data.error_code || 'Unknown'}\n`);
        }
      } catch (error: any) {
        errorCount++;
        setResult(prev => prev + `❌ Критическая ошибка\n`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setResult(prev => prev + `\n\n========================================\n`);
    setResult(prev => prev + `ИТОГИ:\n`);
    setResult(prev => prev + `Всего: 10\n`);
    setResult(prev => prev + `✅ Успешно: ${successCount}\n`);
    setResult(prev => prev + `❌ Ошибок: ${errorCount}\n`);
    setResult(prev => prev + `========================================`);

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Icon name="TestTube2" size={32} className="text-primary" />
              Тест платежной системы Тинькофф
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Button 
                onClick={runTest} 
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Выполняется...
                  </>
                ) : (
                  <>
                    <Icon name="Play" size={18} className="mr-2" />
                    Запустить 1 тест
                  </>
                )}
              </Button>

              <Button 
                onClick={run10Tests} 
                disabled={loading}
                variant="secondary"
                size="lg"
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Выполняется...
                  </>
                ) : (
                  <>
                    <Icon name="Zap" size={18} className="mr-2" />
                    Запустить 10 тестов
                  </>
                )}
              </Button>

              <Button 
                onClick={() => setResult('')} 
                variant="outline"
                size="lg"
              >
                <Icon name="Trash2" size={18} className="mr-2" />
                Очистить
              </Button>
            </div>

            {result && (
              <Card className="bg-slate-50">
                <CardContent className="p-6">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {result}
                  </pre>
                </CardContent>
              </Card>
            )}

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle2" size={20} className="text-green-600 mt-1 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-green-900 mb-2">Текущие настройки:</p>
                    <ul className="list-disc list-inside space-y-1 text-green-800">
                      <li>Терминал: <code className="bg-green-100 px-1">1763583059270DEMO</code></li>
                      <li>Пароль: <code className="bg-green-100 px-1">Isvm4_ae1lIiD9RM</code></li>
                      <li>Тестовая карта: 4300 0000 0000 0777</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}