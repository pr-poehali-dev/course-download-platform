import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import {
  WORK_TYPES,
  SUBJECTS,
  URGENCY_OPTIONS,
  DEFAULT_FORM_DATA,
  calculatePrice,
  type CalculatorFormData,
} from '@/data/priceCalculator';

export default function PriceCalculator() {
  const [formData, setFormData] = useState<CalculatorFormData>(DEFAULT_FORM_DATA);
  const [result, setResult] = useState(calculatePrice(DEFAULT_FORM_DATA));
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    try {
      const newResult = calculatePrice(formData);
      setResult(newResult);
    } catch (error) {
      console.error('Error calculating price:', error);
    }
  }, [formData]);

  const selectedWorkType = WORK_TYPES.find(w => w.value === formData.workType);
  const selectedUrgency = URGENCY_OPTIONS.find(u => u.value === formData.urgency);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">💰 Калькулятор стоимости</h2>
        <p className="text-muted-foreground text-lg">
          Узнай точную цену за 30 секунд
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Тип работы</Label>
              <div className="grid grid-cols-2 gap-2">
                {WORK_TYPES.map((workType) => (
                  <button
                    key={workType.value}
                    onClick={() => setFormData({ ...formData, workType: workType.value })}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      formData.workType === workType.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name={workType.icon as any} size={18} className="text-primary" />
                      <span className="font-medium text-sm">{workType.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      от {workType.basePrice}₽
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Предмет</Label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full p-3 rounded-lg border-2 border-border bg-background focus:border-primary outline-none transition-colors"
              >
                {SUBJECTS.map((subject) => (
                  <option key={subject.value} value={subject.value}>
                    {subject.label}
                    {subject.coefficient > 1.0 && ` (+${Math.round((subject.coefficient - 1) * 100)}%)`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Объём страниц</Label>
                <span className="text-2xl font-bold text-primary">{formData.pages}</span>
              </div>
              <Slider
                value={[formData.pages]}
                onValueChange={(value) => setFormData({ ...formData, pages: value[0] })}
                min={5}
                max={100}
                step={5}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 стр</span>
                <span>100 стр</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Срок выполнения</Label>
              <div className="grid grid-cols-2 gap-2">
                {URGENCY_OPTIONS.map((urgency) => (
                  <button
                    key={urgency.value}
                    onClick={() => setFormData({ ...formData, urgency: urgency.value })}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      formData.urgency === urgency.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{urgency.label}</div>
                    {urgency.coefficient > 1.0 && (
                      <span className="text-xs text-orange-500">
                        +{Math.round((urgency.coefficient - 1) * 100)}%
                      </span>
                    )}
                    {urgency.coefficient < 1.0 && (
                      <span className="text-xs text-green-500">
                        -{Math.round((1 - urgency.coefficient) * 100)}%
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Оригинальность</Label>
                <span className="text-xl font-bold text-primary">{formData.originality}%</span>
              </div>
              <Slider
                value={[formData.originality]}
                onValueChange={(value) => setFormData({ ...formData, originality: value[0] })}
                min={50}
                max={95}
                step={5}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>50%</span>
                <span>95%</span>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Презентация к работе</Label>
                  <p className="text-xs text-muted-foreground">+300₽</p>
                </div>
                <Switch
                  checked={formData.withPresentation}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, withPresentation: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Гарантия доработок</Label>
                  <p className="text-xs text-muted-foreground">+150₽</p>
                </div>
                <Switch
                  checked={formData.withEdits}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, withEdits: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border-2 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Итоговая стоимость</p>
                  <p className="text-5xl font-bold text-primary">
                    {result.totalPrice.toLocaleString('ru-RU')}₽
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/20">
                  <div>
                    <Icon name="Calendar" size={24} className="mx-auto text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Срок сдачи</p>
                    <p className="font-semibold">{result.deadline}</p>
                  </div>
                  <div>
                    <Icon name="Users" size={24} className="mx-auto text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Доступно авторов</p>
                    <p className="font-semibold">{result.availableAuthors}</p>
                  </div>
                </div>

                {selectedWorkType && selectedUrgency && (
                  <div className="pt-4 border-t border-primary/20 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name={selectedWorkType.icon as any} size={16} />
                      <span>{selectedWorkType.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon name="Clock" size={16} />
                      <span>{selectedUrgency.label}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button size="lg" className="w-full text-lg">
                <Icon name="ShoppingCart" size={20} className="mr-2" />
                Заказать за {result.totalPrice.toLocaleString('ru-RU')}₽
              </Button>
              
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Icon name={showDetails ? 'ChevronUp' : 'ChevronDown'} size={16} />
                {showDetails ? 'Скрыть детали' : 'Показать детали расчёта'}
              </button>
            </CardFooter>
          </Card>

          {showDetails && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Icon name="Calculator" size={18} />
                  Детали расчёта
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Базовая стоимость</span>
                    <span className="font-medium">{result.basePrice}₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Коэффициент предмета</span>
                    <span className="font-medium">×{result.subjectMultiplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Коэффициент срочности</span>
                    <span className="font-medium">×{result.urgencyMultiplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Коэффициент объёма</span>
                    <span className="font-medium">×{result.pagesMultiplier.toFixed(2)}</span>
                  </div>
                  {formData.withPresentation && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Презентация</span>
                      <span className="font-medium">+{result.presentationPrice}₽</span>
                    </div>
                  )}
                  {formData.withEdits && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Гарантия доработок</span>
                      <span className="font-medium">+{result.editsPrice}₽</span>
                    </div>
                  )}
                  <div className="pt-2 border-t flex justify-between font-bold">
                    <span>Итого</span>
                    <span className="text-primary">{result.totalPrice}₽</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <Icon name="Sparkles" size={24} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">Специальное предложение!</p>
                  <p className="text-muted-foreground text-xs">
                    Закажи сегодня и получи <span className="font-bold text-orange-500">скидку 10%</span> на следующую работу
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
