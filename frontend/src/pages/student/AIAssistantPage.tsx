import React, { useState } from 'react';
import { assistantService } from '../../lib/services';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Compass, 
  ShieldCheck, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'AI' | 'USER';
  text: string;
  timestamp: string;
}

const SAMPLE_PROMPTS = [
  'Where is the main NIE Lost & Found locker located?',
  'How do I verify ownership of a lost calculator?',
  'I found a wallet in Sir MV Block, what do I do?',
  'How are Good Samaritan points calculated?'
];

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'AI',
      text: 'Namaskara! I am your SAHAYAK Campus Assistant for NIE North Campus. How can I assist you with recovering an item or navigating handover protocols today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const aiReply = await assistantService.askQuestion(textToSend);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'AI',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-blue-ice text-sahayak-blue font-semibold text-xs">
          <Sparkles className="w-3.5 h-3.5 text-sahayak-gold" />
          <span>NIE Neural Campus Assistant</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
          SAHAYAK AI Guidance
        </h1>
        <p className="text-xs sm:text-sm text-sahayak-text-secondary max-w-lg mx-auto">
          Get real-time answers about NIE campus collection points, recovery steps, and verification procedures.
        </p>
      </div>

      {/* Main Chat Container */}
      <NeumorphicCard className="p-0 border border-sahayak-brown/15 shadow-neumorph-lg flex flex-col h-[560px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-sahayak-cream-soft/30">
          {messages.map((m) => {
            const isAI = m.sender === 'AI';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-sahayak-blue text-white flex items-center justify-center shrink-0 shadow-neumorph-sm">
                    <Sparkles className="w-4 h-4 text-sahayak-gold" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-neumorph-sm ${
                    isAI
                      ? 'bg-sahayak-cream border border-sahayak-brown/15 text-sahayak-text-primary rounded-tl-none whitespace-pre-line'
                      : 'bg-sahayak-blue text-white rounded-tr-none'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className={`text-[10px] block mt-1 ${isAI ? 'text-sahayak-text-muted' : 'text-white/70'}`}>
                    {m.timestamp}
                  </span>
                </div>

                {!isAI && (
                  <div className="w-8 h-8 rounded-xl bg-sahayak-blue-deep text-sahayak-gold flex items-center justify-center shrink-0 shadow-neumorph-sm font-bold text-xs">
                    YOU
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sahayak-blue text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-sahayak-gold animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-sahayak-cream border border-sahayak-brown/15 text-xs text-sahayak-text-muted italic">
                Thinking & querying NIE North campus directory...
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-3 bg-sahayak-cream border-t border-sahayak-brown/10 flex flex-wrap gap-2 overflow-x-auto">
          {SAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-3 py-1.5 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/15 text-sahayak-text-secondary hover:border-sahayak-blue hover:text-sahayak-blue transition-all whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-sahayak-cream border-t border-sahayak-brown/10 flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything about NIE lost & found, location lockers, or claim steps..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-sahayak-cream-soft border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="px-5 py-2.5 rounded-xl bg-sahayak-blue text-white font-bold text-xs shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </NeumorphicCard>
    </div>
  );
};
