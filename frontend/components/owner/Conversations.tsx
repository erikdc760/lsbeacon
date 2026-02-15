
import React, { useState } from 'react';

type ConvType = 'SMS' | 'Call' | 'Voicemail';

interface Interaction {
  id: string;
  name: string;
  type: ConvType;
  content: string;
  date: string;
  previousAttempts: number;
  status: 'Unread' | 'Read' | 'Responded';
}

const Conversations: React.FC = () => {
  const [activeType, setActiveType] = useState<ConvType | 'ALL'>('ALL');
  
  const interactions: Interaction[] = [
    { id: '1', name: 'Robert Johnson', type: 'SMS', content: 'Hey, I had a question about the policy you mentioned...', date: '10:15 AM', previousAttempts: 3, status: 'Unread' },
    { id: '2', name: 'Maria Garcia', type: 'Call', content: 'Missed Call', date: '09:30 AM', previousAttempts: 1, status: 'Read' },
    { id: '3', name: 'James Wilson', type: 'Voicemail', content: 'Voicemail (0:45) - Regarding the quote...', date: 'Yesterday', previousAttempts: 5, status: 'Unread' },
    { id: '4', name: 'Patricia Moore', type: 'SMS', content: 'Can we reschedule our call for 3 PM?', date: 'Yesterday', previousAttempts: 2, status: 'Responded' },
  ];

  const filtered = activeType === 'ALL' ? interactions : interactions.filter(i => i.type === activeType);

  return (
    <div className="space-y-6 animate-fadeIn font-display">
      <div className="mb-10 flex flex-col lg:row justify-between lg:items-end gap-6">
        <div>
          <h1 className="text-xl lg:text-3xl font-black text-white uppercase tracking-tighter">Unified Conversations</h1>
          <p className="text-zinc-500 text-[10px] lg:text-xs uppercase tracking-[0.2em] mt-1">Cross-Channel Lead Engagement & Response Hub</p>
        </div>
        
        <div className="flex bg-zinc-950 border border-zinc-900 p-1">
          {['ALL', 'SMS', 'Call', 'Voicemail'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t as any)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeType === t ? 'bg-[#D4AF37] text-black' : 'text-zinc-500 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-zinc-950 border border-zinc-900 p-6 flex flex-col sm:flex-row items-center justify-between hover:border-[#D4AF37]/50 transition-all gap-6 group relative overflow-hidden">
            {item.status === 'Unread' && (
              <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37] shadow-[0_0_15px_#D4AF37]"></div>
            )}
            
            <div className="flex items-center gap-6 w-full sm:w-auto">
              <div className={`w-12 h-12 flex items-center justify-center border ${
                item.type === 'SMS' ? 'border-blue-900/50 text-blue-500' :
                item.type === 'Call' ? 'border-green-900/50 text-green-500' :
                'border-purple-900/50 text-purple-500'
              }`}>
                {item.type === 'SMS' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                {item.type === 'Call' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
                {item.type === 'Voicemail' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6zM18 18c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6z"/><line x1="6" y1="12" x2="18" y2="12"/></svg>}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm lg:text-base font-black text-white uppercase tracking-wider">{item.name}</h3>
                  <span className={`text-[8px] font-black px-1.5 py-0.5 border ${
                    item.status === 'Unread' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-zinc-800 text-zinc-600'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{item.content}</p>
                <div className="flex gap-4 mt-2">
                  <span className="text-[9px] text-zinc-600 uppercase font-black">Attempts: {item.previousAttempts}</span>
                  <span className="text-[9px] text-zinc-600 uppercase font-black">{item.date}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none bg-white text-black text-[10px] font-black uppercase tracking-widest px-6 py-3 hover:bg-[#D4AF37] transition-all">
                Respond Now
              </button>
              <button className="flex-1 sm:flex-none bg-zinc-900 border border-zinc-800 text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 hover:bg-zinc-800 transition-all">
                View History
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Conversations;
