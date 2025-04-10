
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
        }
      } catch (error) {
        console.error('Error parsing response:', error);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    sendMessage.mutate(input);
    setInput('');
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-6 text-primary">Assistant IA</h1>
      
      <Card className="flex-grow mb-4 border-2 border-primary/20">
        <ScrollArea className="h-[calc(100vh-12rem)] p-6">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`mb-6 flex ${
                msg.role === 'user' 
                  ? 'justify-end' 
                  : 'justify-start'
              }`}
            >
              <div 
                className={`max-w-[80%] p-4 rounded-2xl shadow-lg ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-muted mr-auto'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </Card>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez votre question..."
          disabled={sendMessage.isPending}
          className="text-base p-6 border-2 border-primary/20"
        />
        <Button 
          type="submit" 
          disabled={sendMessage.isPending}
          size="lg"
          className="bg-primary hover:bg-primary/90"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
