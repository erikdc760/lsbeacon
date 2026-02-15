
import React, { useState } from 'react';
import { apiFetch } from '../../api/client';
import { agentApi } from '../../api';

interface QueueItem {
  id: string;
  contact_id?: string;
  name?: string;
  phone?: string;
  location?: string;
}

const AutoDialer: React.FC = () => {
  const [status, setStatus] = useState('Online');
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentContact, setCurrentContact] = useState<QueueItem | null>(null);
  const [isOnCall, setIsOnCall] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'dialing' | 'connected' | 'ended'>('idle');

  React.useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
     try {
         const data = await apiFetch('/api/agent/queue');
         if (Array.isArray(data)) setQueue(data);
         else setQueue([1,2,3,4,5,6,7,8,9,10].map(i => ({ id: `${i}0042`, location: 'CALIFORNIA, US' })));
     } catch (error) {
         console.error("Failed to fetch queue");
         setQueue([1,2,3,4,5,6,7,8,9,10].map(i => ({ id: `${i}0042`, location: 'CALIFORNIA, US' })));
     }
  };

  const handleInitiateCall = async (contact: QueueItem) => {
    if (!contact.contact_id) return;
    setCurrentContact(contact);
    setCallStatus('dialing');
    try {
      await agentApi.initiateCall(contact.contact_id);
      setCallStatus('connected');
      setIsOnCall(true);
    } catch (err) {
      console.error('Call failed:', err);
      setCallStatus('ended');
      setTimeout(() => setCallStatus('idle'), 2000);
    }
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setIsOnCall(false);
    setCurrentContact(null);
    setTimeout(() => setCallStatus('idle'), 1000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 h-full font-display animate-fadeIn overflow-hidden">
      {/* Sidebar Section: Contact List */}
      <div className="w-full lg:w-56 bg-zinc-950 border border-zinc-900 p-3 lg:p-4 space-y-2 lg:overflow-y-auto custom-scroll h-[140px] lg:h-full shrink-0">
        <h3 className="text-[7px] lg:text-[8px] uppercase font-black text-zinc-600 mb-1 lg:mb-4 tracking-[0.2em] border-b border-zinc-900 pb-1 lg:pb-2 text-center lg:text-left">QUEUE PRIORITY</h3>
        <div className="flex lg:flex-col gap-1.5 lg:gap-2 overflow-x-auto lg:overflow-x-visible pb-1.5 lg:pb-0 custom-scroll h-full lg:h-auto">
          {queue.length > 0 ? queue.map((item, i) => (
            <div 
              key={i} 
              onClick={() => handleInitiateCall(item)}
              className="min-w-[130px] lg:min-w-0 p-2 lg:p-3 border border-zinc-900 bg-black hover:border-[#D4AF37] lg:hover:translate-x-1 transition-all cursor-pointer group flex justify-between items-center rounded-none shrink-0 lg:shrink"
            >
               <div className="min-w-0">
                  <p className="text-[8px] lg:text-[9px] font-black text-zinc-500 group-hover:text-white uppercase tracking-tight truncate">{item.name || `Lead: #${item.id}`}</p>
                  <p className="text-[6px] lg:text-[7px] text-zinc-700 mt-0.5 uppercase font-black tracking-widest truncate">{item.location || 'UNKNOWN'}</p>
               </div>
               <div className="w-1 lg:w-1.5 h-1 lg:h-1.5 bg-zinc-900 group-hover:bg-[#D4AF37] shrink-0"></div>
            </div>
          )) : (
             <div className="text-zinc-500 text-[10px] text-center w-full">No leads...</div>
          )}
        </div>
      </div>

      {/* Main Dialer Interface */}
      <div className="flex-1 flex flex-col space-y-2 lg:space-y-4 min-h-0">
        {/* Top Control Bar */}
        <div className="bg-zinc-950 border border-zinc-900 p-2 lg:p-4 flex flex-col sm:flex-row justify-between items-center gap-2 lg:gap-4 shadow-xl rounded-none shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-2 lg:gap-6 w-full sm:w-auto">
             <div className="flex flex-col items-center sm:items-start">
               <span className="text-[6px] lg:text-[7px] uppercase text-zinc-700 font-black tracking-widest">Active Operator</span>
               <span className="text-[9px] lg:text-xs font-black text-white uppercase tracking-tight">VON_STEIN</span>
             </div>
             <div className="hidden sm:block h-6 w-px bg-zinc-900"></div>
             <div className="flex items-center gap-2 lg:gap-4">
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className={`p-1.5 lg:p-2.5 border rounded-none transition-all duration-300 relative group ${isMuted ? 'border-red-900 text-red-500 bg-red-950/20' : 'border-zinc-800 text-zinc-500 hover:text-[#D4AF37] hover:border-[#D4AF37]'}`}
                >
                  {isMuted ? (
                    <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5L6 9H2V15H6L11 19V5Z"/><path d="M23 9L17 15"/><path d="M17 9L23 15"/></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5L6 9H2V15H6L11 19V5Z"/><path d="M19.07 4.93C20.946 6.80596 22 9.35013 22 12C22 14.6499 20.946 17.194 19.07 19.07"/></svg>
                  )}
                </button>
                <button className="p-1.5 lg:p-2.5 border border-zinc-800 text-zinc-500 hover:text-white hover:border-white transition-all relative group rounded-none">
                  <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                </button>
             </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[7px] lg:text-[8px] font-black text-zinc-600 uppercase tracking-widest">Status</span>
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value)}
              className="flex-1 sm:flex-none bg-black border border-zinc-800 text-[#D4AF37] text-[8px] lg:text-[10px] px-2 lg:px-4 py-1.5 lg:py-2 uppercase font-black focus:outline-none focus:border-[#D4AF37] transition-all cursor-pointer rounded-none"
            >
              <option>ONLINE</option>
              <option>QUEUE_READY</option>
              <option>MAINTENANCE</option>
            </select>
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-2 lg:gap-4 overflow-hidden min-h-0">
          {/* Intelligence Core */}
          <div className="lg:col-span-4 bg-zinc-950 border border-zinc-900 flex flex-col overflow-hidden shadow-xl rounded-none order-2 lg:order-1 h-[150px] lg:h-full shrink-0">
             <div className="p-2 lg:p-3 bg-zinc-900/50 border-b border-zinc-800 flex justify-between items-center rounded-none shrink-0">
                <span className="text-[7px] lg:text-[8px] font-black uppercase text-white tracking-[0.1em]">INTELLIGENCE CORE</span>
                <span className="flex items-center gap-1.5 text-[6px] lg:text-[7px] text-[#D4AF37] uppercase font-black">
                   <div className="w-1 h-1 bg-[#D4AF37] animate-ping"></div>
                   LIVE
                </span>
             </div>
             <div className="flex-1 p-2 lg:p-4 space-y-2 lg:space-y-3 overflow-y-auto custom-scroll bg-black/20 rounded-none">
                <button className="group w-full text-left p-2.5 lg:p-4 border border-zinc-800 hover:border-[#D4AF37] transition-all relative overflow-hidden rounded-none">
                   <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.1em] relative z-10">Sales Protocol V4</span>
                </button>
                <button className="w-full text-left p-2.5 lg:p-4 border border-zinc-800 hover:border-white transition-all text-[8px] lg:text-[10px] font-black uppercase tracking-[0.1em] rounded-none">Medical Underwriting</button>
                <button className="w-full text-left p-2.5 lg:p-4 border border-zinc-800 hover:border-white transition-all text-[8px] lg:text-[10px] font-black uppercase tracking-[0.1em] rounded-none">Objection Matrix</button>
             </div>
          </div>

          {/* Connected Target */}
          <div className="lg:col-span-8 bg-black border border-zinc-900 flex flex-col overflow-hidden shadow-2xl relative rounded-none order-1 lg:order-2 flex-1 min-h-0">
             <div className="p-3 lg:p-6 border-b border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-3 lg:gap-4 bg-zinc-950/50 relative z-10 rounded-none shrink-0">
                <div className="space-y-1 lg:space-y-2 text-center sm:text-left">
                   <p className="text-[6px] lg:text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em]">CONNECTED TARGET</p>
                   <div className="space-y-0.5">
                      <h2 className="text-xl lg:text-3xl font-black text-white uppercase tracking-tighter leading-tight">MARIA GARCIA</h2>
                      <p className="text-[7px] lg:text-[9px] text-[#D4AF37] font-black tracking-[0.2em] uppercase">LEVEL: ALPHA</p>
                   </div>
                   <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 lg:gap-3 text-[7px] lg:text-[9px] font-mono text-zinc-500 uppercase tracking-widest pt-0.5 lg:pt-1">
                      <span>NEW YORK</span>
                      <span className="text-white">+1 (555) 987-6543</span>
                   </div>
                </div>
                <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                   <button className="flex-1 sm:flex-none bg-white text-black px-3 lg:px-6 py-2 lg:py-3 uppercase font-black text-[8px] lg:text-[10px] tracking-[0.1em] hover:bg-[#D4AF37] transition-all rounded-none">SALE MADE</button>
                   <button className="flex-1 sm:flex-none bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 lg:px-6 py-2 lg:py-3 uppercase font-black text-[8px] lg:text-[10px] tracking-[0.1em] hover:text-white hover:border-zinc-500 transition-all rounded-none text-center">OVERVIEW</button>
                </div>
             </div>

             <div className="flex-1 p-3 lg:p-6 overflow-y-auto custom-scroll space-y-4 lg:space-y-6 relative z-10 rounded-none">
                <div className="space-y-4 lg:space-y-6 max-w-2xl">
                   {[
                     { q: "PRIMARY CONCERN", h: "Motivation for today's inquiry?" },
                     { q: "FINANCIAL SCOPE", h: "Monthly budget for asset protection?" }
                   ].map((item, i) => (
                     <div key={i} className="space-y-1 lg:space-y-2 group">
                        <label className="text-[7px] lg:text-[9px] font-black text-zinc-600 uppercase tracking-[0.1em] group-focus-within:text-[#D4AF37] transition-colors">{item.q}</label>
                        <textarea 
                          className="w-full bg-zinc-950/50 border border-zinc-900 p-2 lg:p-4 text-[10px] lg:text-xs text-zinc-300 focus:outline-none focus:border-[#D4AF37] transition-all rounded-none placeholder-zinc-800 leading-relaxed" 
                          rows={1} 
                          placeholder={item.h}
                        ></textarea>
                     </div>
                   ))}
                </div>
                
                <div className="pt-4 lg:pt-8 border-t border-zinc-900 flex flex-row gap-2 lg:gap-4 rounded-none">
                  <button 
                    onClick={handleEndCall}
                    disabled={!isOnCall}
                    className="flex-1 bg-red-600/10 border border-red-900/50 text-red-500 py-2.5 lg:py-5 uppercase font-black text-[8px] lg:text-[10px] tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all rounded-none disabled:opacity-30"
                  >
                    {callStatus === 'dialing' ? 'DIALING...' : 'TERMINATE'}
                  </button>
                  <button className="flex-1 bg-zinc-950 border border-zinc-800 text-white py-2.5 lg:py-5 uppercase font-black text-[8px] lg:text-[10px] tracking-[0.2em] hover:bg-zinc-900 transition-all rounded-none">HOLD</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoDialer;
