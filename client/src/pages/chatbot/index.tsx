import { useState, useEffect } from 'react';
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
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  // Sauvegarder les messages quand ils changent
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

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
        if (error instanceof Error) {
          setMessages(prev => [...prev, { role: 'assistant', content: error.message }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: 'Une erreur est survenue' }]);
        }
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
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
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Assistant IA</h1>

      <Card className="mb-4">
        <ScrollArea className="h-[500px] p-4">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`mb-4 flex ${
                msg.role === 'user' 
                  ? 'justify-end' 
                  : 'justify-start'
              }`}
            >
              <div 
                className={`max-w-[80%] p-4 rounded-xl shadow-lg ${
                  msg.role === 'user'
                    ? 'bg-[var(--primary-dark)] text-white font-medium'
                    : 'bg-muted/90 border border-border'
                }`}
              >
                <p className={`text-sm mb-2 ${msg.role === 'user' ? 'text-primary-foreground/90' : 'text-foreground/70'}`}>
                  {msg.role === 'user' ? 'Vous' : 'Assistant'}
                </p>
                <p className="break-words leading-relaxed">{msg.content}</p>
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