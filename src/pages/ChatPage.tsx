import { useState, useEffect, useRef } from 'react';
import { useNavigate, useRouter } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { Card, Button, PageContainer, LoadingSpinner } from '@/components/Layout';
import { ArrowLeft, Send, Sprout, AlertCircle, Stethoscope } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Message, ExpertRequest, Diagnosis } from '@/types';

export function ChatPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [request, setRequest] = useState<ExpertRequest | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const requestId = router.path.split('/').pop();

  useEffect(() => {
    if (!requestId) return;
    loadData();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [requestId]);

  async function loadData() {
    const { data: req } = await supabase
      .from('expert_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();
    setRequest(req as ExpertRequest | null);

    if (req?.diagnosis_id) {
      const { data: diag } = await supabase
        .from('diagnoses')
        .select('*')
        .eq('id', req.diagnosis_id)
        .maybeSingle();
      setDiagnosis(diag as Diagnosis | null);
    }

    await loadMessages();
    setLoading(false);
  }

  async function loadMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });
    setMessages((data ?? []) as Message[]);
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !profile?.id || !request) return;
    setSending(true);

    let receiverId: string | null = null;
    if (profile.role === 'expert') {
      receiverId = request.farmer_id;
      if (!request.expert_id) {
        await supabase.from('expert_requests').update({ expert_id: profile.id, status: 'reviewing' }).eq('id', requestId);
      }
    } else {
      receiverId = request.expert_id;
    }

    if (!receiverId) {
      setSending(false);
      return;
    }

    const { error } = await supabase.from('messages').insert({
      request_id: requestId,
      sender_id: profile.id,
      receiver_id: receiverId,
      body: input,
    });

    if (!error) {
      setInput('');
      await loadData();
    }
    setSending(false);
  }

  if (loading) return <PageContainer><LoadingSpinner /></PageContainer>;

  return (
    <PageContainer>
      <button onClick={() => navigate(profile?.role === 'expert' ? '/expert-dashboard' : '/expert-help')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-4">
        <h1 className="text-xl font-bold text-primary-900 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary-600" />
          Expert Conversation
        </h1>
        {diagnosis && (
          <div className="mt-2 flex items-center gap-2 bg-primary-50 rounded-xl p-2">
            {diagnosis.image_url && <img src={diagnosis.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />}
            <div>
              <p className="text-sm font-medium text-primary-800">{diagnosis.crop_name} — {diagnosis.ai_result}</p>
              <p className="text-xs text-gray-500">Confidence: {diagnosis.confidence}% • Severity: {diagnosis.severity}</p>
            </div>
          </div>
        )}
      </div>

      <Card className="flex flex-col h-[calc(100vh-280px)] min-h-[350px] overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle />
              <p className="text-sm text-gray-400 mt-2">No messages yet. Start the conversation.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === profile?.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    isMine ? 'bg-primary-600 text-white rounded-br-md' : 'bg-primary-50 text-gray-700 rounded-bl-md'
                  }`}>
                    {msg.body}
                    <p className={`text-xs mt-1 ${isMine ? 'text-primary-200' : 'text-gray-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-primary-50 p-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message…"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-sm"
          />
          <Button onClick={handleSend} disabled={sending || !input.trim()} className="!px-3">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </Card>

      <div className="mt-3 flex items-start gap-2 bg-amber-50 rounded-xl p-3">
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          Messages are checked every few seconds. If you don't see a reply yet, the expert may still be reviewing your case.
        </p>
      </div>
    </PageContainer>
  );
}

function MessageCircle() {
  return (
    <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-400 flex items-center justify-center">
      <Send className="w-6 h-6" />
    </div>
  );
}
