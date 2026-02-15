
import React, { useState, useEffect } from 'react';
import { agentApi } from '../../api';
import { apiFetch } from '../../api/client';

type ConvType = 'SMS' | 'Call' | 'Voicemail';

interface Interaction {
  id: string;
  name: string;
  contact_id?: string;
  type: ConvType;
  content: string;
  date: string;
  previousAttempts: number;
  status: 'Unread' | 'Read' | 'Responded';
}

const Conversations: React.FC = () => {
  const [activeType, setActiveType] = useState<ConvType | 'ALL'>('ALL');
  const [replyingTo, setReplyingTo] = useState<Interaction | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [interactions, setInteractions] = useState<Interaction[]>([
    { id: '1', name: 'Robert Johnson', type: 'SMS', content: 'Hey, I had a question about the policy you mentioned...', date: '10:15 AM', previousAttempts: 3, status: 'Unread' },
    { id: '2', name: 'Maria Garcia', type: 'Call', content: 'Missed Call', date: '09:30 AM', previousAttempts: 1, status: 'Read' },
    { id: '3', name: 'James Wilson', type: 'Voicemail', content: 'Voicemail (0:45) - Regarding the quote...', date: 'Yesterday', previousAttempts: 5, status: 'Unread' },
    { id: '4', name: 'Patricia Moore', type: 'SMS', content: 'Can we reschedule our call for 3 PM?', date: 'Yesterday', previousAttempts: 2, status: 'Responded' },
  ]);

  useEffect(() => {
    fetchInteractions();
  }, []);

  const fetchInteractions = async () => {
    try {
      const data = await apiFetch('/api/agent/interactions');
      if (Array.isArray(data)) setInteractions(data);
    } catch (err) {
      console.error('Failed to fetch interactions');
    }
  };

  const handleSendReply = async () => {
    if (!replyingTo?.contact_id || !replyText.trim()) return;
    setSendingReply(true);
    try {
      await agentApi.sendSms(replyingTo.contact_id, replyText);
      setInteractions(prev => prev.map(i => 
        i.id === replyingTo.id ? { ...i, status: 'Responded' } : i
      ));
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      console.error('Failed to send SMS:', err);
      alert('Failed to send message. Make sure you have a provisioned Telnyx number.');
    } finally {
      setSendingReply(false);
    }
  };

  const filtered = activeType === 'ALL' ? interactions : interactions.filter(i => i.type === activeType);

  return (
    <div className="space-y-4 animate-fadeIn font-display">
      <div className="mb-6 flex flex-col lg:row justify-between lg:items-end gap-3">
        <div>
          <h1 className="text-lg font-black text-white uppercase tracking-tighter">Unified Conversations</h1>
          <p className="text-zinc-500 text-[8px] uppercase tracking-[0.2em] mt-0.5">Cross-Channel Lead Engagement & Response Hub</p>
        </div>
        
        <div className="flex bg-zinc-950 border border-zinc-900 p-0.5">
          {['ALL', 'SMS', 'Call', 'Voicemail'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t as any)}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                activeType === t ? 'bg-[#D4AF37] text-black' : 'text-zinc-500 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {filtered.map((item) => (
          <div key={item.id} className="bg-zinc-950 border border-zinc-900 p-3 flex flex-col sm:flex-row items-center justify-between hover:border-[#D4AF37]/50 transition-all gap-4 group relative overflow-hidden">
            {item.status === 'Unread' && (
              <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]"></div>
            )}
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className={`w-8 h-8 flex items-center justify-center border ${
                item.type === 'SMS' ? 'border-blue-900/50 text-blue-500' :
                item.type === 'Call' ? 'border-green-900/50 text-green-500' :
                'border-purple-900/50 text-purple-500'
              }`}>
                {item.type === 'SMS' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                {item.type === 'Call' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
                {item.type === 'Voicemail' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 18c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6zM18 18c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6z"/><line x1="6" y1="12" x2="18" y2="12"/></svg>}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-wider">{item.name}</h3>
                  <span className={`text-[7px] font-black px-1 py-0.5 border ${
                    item.status === 'Unread' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-zinc-800 text-zinc-600'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-[9px] text-zinc-400 mt-0.5 line-clamp-1">{item.content}</p>
                <div className="flex gap-3 mt-1.5">
                  <span className="text-[7.5px] text-zinc-600 uppercase font-black">Attempts: {item.previousAttempts}</span>
                  <span className="text-[7.5px] text-zinc-600 uppercase font-black">{item.date}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setReplyingTo(item)}
                className="flex-1 sm:flex-none bg-white text-black text-[9px] font-black uppercase tracking-widest px-4 py-1.5 hover:bg-[#D4AF37] transition-all"
              >
                Respond
              </button>
              <button className="flex-1 sm:flex-none bg-zinc-900 border border-zinc-800 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 hover:bg-zinc-800 transition-all">
                History
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] w-full max-w-md p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[12px] font-black text-white uppercase tracking-tighter">Reply to {replyingTo.name}</h3>
                <p className="text-[8px] text-gray-500 uppercase tracking-widest">Via SMS</p>
              </div>
              <button onClick={() => setReplyingTo(null)} className="text-gray-500 hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="bg-zinc-900/50 p-2 border-l-2 border-[#D4AF37]">
              <p className="text-[9px] text-zinc-400">{replyingTo.content}</p>
            </div>
            <textarea 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-black border border-[#1A1A1A] text-[11px] p-3 text-white outline-none focus:border-[#D4AF37] transition-colors h-24 resize-none"
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setReplyingTo(null)}
                className="flex-1 bg-zinc-900 border border-zinc-800 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 hover:bg-zinc-800 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendReply}
                disabled={sendingReply || !replyText.trim()}
                className="flex-1 bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-widest px-4 py-2 hover:bg-[#B48F27] transition-all disabled:opacity-50"
              >
                {sendingReply ? 'Sending...' : 'Send SMS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conversations;
