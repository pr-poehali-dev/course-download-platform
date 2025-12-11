import { useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const MODES = {
  tutor: { label: 'Репетитор', desc: 'Объясняет по шагам, задаёт наводящие вопросы' },
  outline: { label: 'План', desc: 'Помогает структурировать работу' },
  rewrite: { label: 'Переформулирование', desc: 'Улучшает стиль и читаемость' }
};

interface MentorChatTabProps {
  messages: Message[];
  input: string;
  onInputChange: (value: string) => void;
  chatLoading: boolean;
  onSendMessage: () => void;
  mode: 'tutor' | 'outline' | 'rewrite';
  onModeChange: (mode: 'tutor' | 'outline' | 'rewrite') => void;
  title: string;
  onTitleChange: (value: string) => void;
  requirements: string;
  onRequirementsChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export default function MentorChatTab({
  messages,
  input,
  onInputChange,
  chatLoading,
  onSendMessage,
  mode,
  onModeChange,
  title,
  onTitleChange,
  requirements,
  onRequirementsChange,
  onKeyPress
}: MentorChatTabProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      {/* Sidebar */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">Контекст работы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-xs text-muted-foreground">
              Название/дисциплина
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Напр.: Курсовая по ТОиР"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="requirements" className="text-xs text-muted-foreground">
              Требования вуза (кратко)
            </Label>
            <Textarea
              id="requirements"
              value={requirements}
              onChange={(e) => onRequirementsChange(e.target.value)}
              placeholder="Объём, ГОСТы, структура, число источников..."
              rows={5}
              className="mt-1.5"
            />
          </div>

          <div className="border-t pt-4">
            <Label className="text-xs text-muted-foreground">Режим работы</Label>
            <Select value={mode} onValueChange={(v: any) => onModeChange(v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MODES).map(([key, { label, desc }]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground">{desc}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="secondary" className="text-xs">
              <Icon name="CheckCircle" size={12} className="mr-1" />
              Планы и чек-листы
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Icon name="Lightbulb" size={12} className="mr-1" />
              Мини-примеры
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Chat */}
      <Card className="flex flex-col h-[calc(100vh-200px)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Bot" size={20} className="text-primary" />
            TechMentor — чат-репетитор
          </CardTitle>
          <CardDescription>
            Помогаю разобраться в материале и подготовить работу самостоятельно
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4 p-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted border'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-muted border rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </CardContent>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyPress}
              placeholder="Опиши задачу или задай вопрос..."
              rows={2}
              className="resize-none"
              disabled={chatLoading}
            />
            <Button
              onClick={onSendMessage}
              disabled={chatLoading || !input.trim()}
              size="icon"
              className="h-auto"
            >
              <Icon name="Send" size={18} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
