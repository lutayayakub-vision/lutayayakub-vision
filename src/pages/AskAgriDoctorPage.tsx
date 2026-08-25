import { useState, useRef, useEffect } from 'react';
import { Card, Button, PageContainer } from '@/components/Layout';
import { MessageCircle, Send, Sparkles, Leaf, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Disease } from '@/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  'Why are my maize leaves turning yellow?',
  'How do I prevent tomato diseases?',
  'When should I plant beans?',
  'What causes banana leaves to turn brown?',
  'My coffee leaves have spots. What should I do?',
];

export function AskAgriDoctorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from('diseases').select('*, crops(name)').then(({ data }) => {
      if (data) setDiseases(data);
    });
    setMessages([{
      role: 'assistant',
      content: 'Hello! I\'m AgriDoctor, your AI farming assistant. Ask me anything about your crops — diseases, planting, prevention, or general farming questions. I\'ll answer in simple, farmer-friendly language.',
    }]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  function generateResponse(question: string): string {
    const lower = question.toLowerCase();
    const matchedDiseases = diseases.filter(d => {
      const cropName = (d as any).crops?.name ?? '';
      return lower.includes(cropName.toLowerCase()) || lower.includes(d.name.toLowerCase());
    });

    if (lower.includes('yellow') && lower.includes('maize')) {
      return 'Yellow leaves on maize can be caused by a few things:\n\n1. **Nitrogen deficiency** — the most common cause. The plant needs nutrients. Apply organic manure or a balanced fertilizer.\n\n2. **Maize Streak Virus** — look for yellow streaks running along the leaves. This is spread by small insects called leafhoppers.\n\n3. **Water stress** — too much or too little water can cause yellowing.\n\nWhat to do:\n- Check if the yellowing is in streaks or general.\n- If it\'s streaks, remove the affected plants and control weeds.\n- If it\'s general yellowing, apply fertilizer or compost.\n- If unsure, take a photo and use the Diagnose My Crop feature for a closer look.';
    }

    if (lower.includes('prevent') && lower.includes('tomato')) {
      return 'Here are practical ways to prevent tomato diseases:\n\n1. **Space your plants well** — good airflow keeps leaves dry and reduces disease.\n\n2. **Avoid wetting the leaves** when watering. Water the soil, not the plant.\n\n3. **Remove affected leaves** as soon as you see spots or yellowing.\n\n4. **Rotate your crops** — don\'t plant tomatoes in the same soil two seasons in a row.\n\n5. **Use mulch** around the base to stop soil from splashing onto leaves.\n\n6. **Plant resistant varieties** when available — ask your local supplier.\n\nThese simple steps prevent most common tomato problems like Early Blight and Late Blight.';
    }

    if (lower.includes('plant') && lower.includes('beans')) {
      return 'In Uganda, beans are typically planted at these times:\n\n1. **First season** — March to May, when the main rains begin.\n\n2. **Second season** — August to October, for the second rains.\n\nTips for planting beans:\n- Plant at the start of the rains so seeds germinate well.\n- Space rows about 40-50cm apart.\n- Plant seeds 2-3cm deep, about 10cm apart within rows.\n- Beans do well in well-drained soil with good organic matter.\n- Avoid planting during heavy flooding, which can rot the seeds.\n\nWould you like to know about common bean diseases too?';
    }

    if (lower.includes('banana') && (lower.includes('brown') || lower.includes('turn'))) {
      return 'Banana leaves turning brown is common in Uganda. The main causes are:\n\n1. **Black Sigatoka** — a disease that causes dark streaks on leaves, which then turn yellow and brown. It spreads in wet, humid conditions.\n\n2. **Natural aging** — the oldest (lowest) leaves naturally turn brown and die as the plant grows. This is normal.\n\n3. **Water stress** — too little water during dry periods can cause browning.\n\nWhat to do:\n- If you see dark streaks on leaves, remove and destroy the affected leaves.\n- Improve spacing between plants for better airflow.\n- If only the bottom leaves are brown and the rest look healthy, it may just be natural aging.\n- Take a photo and use the Diagnose feature if you\'re not sure.';
    }

    if (lower.includes('coffee') && lower.includes('spot')) {
      return 'Spots on coffee leaves are most likely **Coffee Leaf Rust**. Here\'s what to know:\n\n**What it looks like:**\n- Small yellow spots on the upper side of leaves\n- Orange or yellowish powder on the underside of leaves\n- Leaves may drop early\n\n**What causes it:**\n- A fungus that spreads by wind and rain, especially in cool, wet conditions.\n\n**What you can do:**\n1. Remove affected leaves and burn or bury them.\n2. Improve airflow by pruning and spacing plants.\n3. Keep the ground around plants clean of fallen leaves.\n4. Plant resistant varieties if available.\n5. Consult an agricultural extension officer before using any chemical treatment.\n\nYou can also take a clear photo and use the Diagnose My Crop feature for a closer analysis.';
    }

    if (matchedDiseases.length > 0) {
      const d = matchedDiseases[0];
      let response = `This sounds like it could be **${d.name}**.\n\n`;
      if (d.description) response += `${d.description}\n\n`;
      if (d.symptoms) response += `**Symptoms:** ${d.symptoms}\n\n`;
      if (d.causes) response += `**Causes:** ${d.causes}\n\n`;
      if (d.recommended_actions) response += `**What to do:** ${d.recommended_actions}\n\n`;
      if (d.prevention) response += `**Prevention:** ${d.prevention}\n\n`;
      response += `Remember: This is general guidance. For serious problems, consult an agricultural extension officer.`;
      return response;
    }

    return 'That\'s a great question! Here are some general tips:\n\n1. **Monitor your crops regularly** — check leaves, stems, and fruits for any changes in color or texture.\n\n2. **Keep good field hygiene** — remove diseased plants and fallen leaves.\n\n3. **Ensure proper spacing** — good airflow between plants reduces disease.\n\n4. **Water wisely** — water the soil, not the leaves, to prevent fungal diseases.\n\n5. **Rotate crops** — don\'t plant the same crop in the same soil every season.\n\nFor a specific problem, try taking a photo with the **Diagnose My Crop** feature, or ask me about a particular crop or symptom.';
  }

  async function handleSend(text?: string) {
    const question = text ?? input;
    if (!question.trim() || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    await new Promise(r => setTimeout(r, 1200));

    const response = generateResponse(question);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  }

  return (
    <PageContainer>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-primary-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-500" />
          Ask AgriDoctor
        </h1>
        <p className="text-gray-500 mt-1">Your AI farming assistant — ask in simple language</p>
      </div>

      <Card className="flex flex-col h-[calc(100vh-220px)] min-h-[400px] overflow-hidden">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mr-2 flex-shrink-0">
                  <Leaf className="w-4 h-4" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-primary-50 text-gray-700 rounded-bl-md'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mr-2 flex-shrink-0">
                <Leaf className="w-4 h-4" />
              </div>
              <div className="bg-primary-50 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggested questions */}
        {messages.length <= 1 && !loading && (
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-400 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-xs bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors border border-primary-100"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-primary-50 p-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your crops…"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-sm"
          />
          <Button onClick={() => handleSend()} disabled={loading || !input.trim()} className="!px-3">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </Card>

      <div className="mt-3 flex items-start gap-2 bg-amber-50 rounded-xl p-3">
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          AI answers are general guidance, not a professional diagnosis. For serious problems, consult an agricultural extension officer.
        </p>
      </div>
    </PageContainer>
  );
}
