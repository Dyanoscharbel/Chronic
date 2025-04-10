
import { useState } from 'react';
import { Send } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatbotPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest('POST', '/api/chatbot', { message });
    },
    onSuccess: async (response) => {
      try {
        const data = await response.json();
        if (data?.message) {
          setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
        } else {
          console.error('Invalid response format:', data);
        }
      } catch (error) {
        console.error('Error parsing response:', error);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    sendMessage.mutate(input);
    setInput('');
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Assistant IA</h1>
      
      <Card className="mb-4">
        <ScrollArea className="h-[500px] p-4">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`mb-4 ${
                msg.role === 'user' 
                  ? 'text-right' 
                  : 'text-left'
              }`}
            >
              <div className={`inline-block p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </ScrollArea>
      </Card>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tapez votre message..."
          disabled={sendMessage.isPending}
        />
        <Button type="submit" disabled={sendMessage.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
