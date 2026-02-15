
import React, { useState, useEffect } from 'react';
import * as adminApi from '../../api/admin';
import NotificationModal from '../NotificationModal';

interface Rule {
  id: number;
  title: string;
  desc: string;
  active: boolean;
}

interface LeadStats {
  unassigned: number;
  activeFlow: number;
  distributionProgress: number;
  rules: Rule[];
}

const LeadDesignation: React.FC = () => {
  const [stats, setStats] = useState<LeadStats>({
    unassigned: 0,
    activeFlow: 0,
    distributionProgress: 0,
    rules: []
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Notification Modal State
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm' | 'success' | 'error';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'alert',
    title: '',
    message: ''
  });

  const showAlert = (title: string, message: string, type: 'alert' | 'success' | 'error' = 'alert') => {
    setNotification({ isOpen: true, type, title, message });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setNotification({ isOpen: true, type: 'confirm', title, message, onConfirm });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getLeadStats();
      if (data) {
        setStats(data);
        setErrorMessage('');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to load lead designation metrics.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (id: number, currentActive: boolean) => {
    try {
      setErrorMessage('');
      // Optimistic update
      setStats(prev => ({
        ...prev,
        rules: prev.rules.map(r => r.id === id ? { ...r, active: !currentActive } : r)
      }));
      
      await adminApi.toggleLeadRule(id, !currentActive);
    } catch (err) {
      console.error("Failed to toggle rule", err);
      setErrorMessage('Failed to update rule. Please try again.');
      setStats(prev => ({
        ...prev,
        rules: prev.rules.map(r => r.id === id ? { ...r, active: currentActive } : r)
      }));
    }
  };

  const handleRedistribute = async () => {
    try {
      setErrorMessage('');
      await adminApi.triggerRedistribution();
      showAlert('Success', 'Redistribution triggered successfully', 'success');
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to trigger redistribution.');
    }
  };

  return (
    <div className="animate-fadeIn space-y-6 pb-20 font-display h-full overflow-y-auto custom-scroll pr-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900/50 pb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            Lead <span className="text-[#D4AF37]">Designation</span>
          </h2>
          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-black">Force Multiplier & Rebalancing Protocol</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 p-6 lg:p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/5 -mr-24 -mt-24 rounded-full blur-[80px] pointer-events-none" />
            
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8">Global Inventory Analytics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-black border border-zinc-900 p-6 hover:border-[#D4AF37]/30 transition-all">
                <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-2">Total Unassigned Payload</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white tracking-tighter">{stats.unassigned.toLocaleString()}</span>
                  <span className="text-[8px] text-[#D4AF37] font-black uppercase tracking-widest animate-pulse">Pending Allocation</span>
                </div>
              </div>
              <div className="bg-black border border-zinc-900 p-6 hover:border-[#D4AF37]/30 transition-all">
                <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-2">Active Flow (24H)</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white tracking-tighter">{stats.activeFlow.toLocaleString()}</span>
                  <span className="text-[8px] text-green-500 font-black uppercase tracking-widest">Circulating</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-end mb-2">
                 <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Distribution Saturation</p>
                 <p className="text-xs font-black text-[#D4AF37]">{stats.distributionProgress}%</p>
               </div>
               <div className="w-full bg-black border border-zinc-100/5 h-2 overflow-hidden">
                 <div 
                   className="h-full bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.5)] transition-all duration-1000" 
                   style={{ width: `${stats.distributionProgress}%` }}
                 />
               </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 p-6 lg:p-8">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8">Operational Logic Rules</h3>
            {errorMessage && (
              <p className="text-[9px] text-red-500 uppercase tracking-widest mb-4">{errorMessage}</p>
            )}
            {loading && (
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-4">Loading metrics...</p>
            )}
            <div className="space-y-4">
              {stats.rules.map((rule) => (
                <div 
                  key={rule.id} 
                  className={`group p-6 border transition-all flex items-center justify-between gap-4 ${
                    rule.active ? 'bg-black border-[#D4AF37]/20' : 'bg-transparent border-zinc-900 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className={`text-xs font-black uppercase tracking-widest ${rule.active ? 'text-white' : 'text-zinc-600'}`}>{rule.title}</h4>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-tight">{rule.desc}</p>
                  </div>
                  <button 
                    onClick={() => handleToggleRule(rule.id, rule.active)}
                    className={`shrink-0 w-12 h-6 border transition-all relative ${
                      rule.active ? 'bg-[#D4AF37] border-[#D4AF37]' : 'bg-black border-zinc-900'
                    }`}
                  >
                    <div className={`absolute top-0.5 left-0.5 bottom-0.5 w-4.5 transition-all ${
                      rule.active ? 'translate-x-6 bg-black' : 'translate-x-0 bg-zinc-800'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 p-6 sticky top-10">
             <div className="mb-8 text-center">
                <h3 className="text-[10px] text-[#D4AF37] uppercase font-black tracking-[0.3em]">Command Override</h3>
                <p className="text-[8px] text-zinc-600 uppercase mt-1 tracking-widest">Manual Rebalance Synchronization</p>
             </div>
             
             <div className="bg-black border border-zinc-900 p-4 mb-8 text-center space-y-3">
                <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest leading-relaxed">
                  Executing redistribution will override current allocations based on active rules.
                </p>
                <p className="text-[7px] text-red-900 uppercase font-black tracking-[0.2em]">
                  * This action cannot be reversed *
                </p>
             </div>

             <button 
               onClick={handleRedistribute}
               className="w-full bg-white text-black font-black uppercase tracking-[0.2em] py-4 text-[9px] hover:bg-[#D4AF37] transition-all shadow-2xl"
             >
               Execute Rebalance
             </button>
             
             <button className="w-full mt-3 bg-black border border-zinc-900 text-zinc-700 font-black uppercase tracking-[0.2em] py-3 text-[8px] hover:text-zinc-400 transition-all">
               Deep Audit Logs
             </button>

             <div className="mt-8 pt-6 border-t border-zinc-900">
                <h4 className="text-[9px] text-[#D4AF37] uppercase font-black tracking-widest mb-4">Deep Audit Logs</h4>
                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scroll pr-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="flex gap-3 items-start pb-3 border-b border-zinc-900/50 last:border-0 group">
                      <div className="w-1 h-1 bg-[#D4AF37] mt-1.5 shrink-0 group-hover:scale-150 transition-transform shadow-[0_0_10px_#D4AF37]" />
                      <div>
                        <p className="text-[8px] text-zinc-300 uppercase font-black tracking-widest group-hover:text-white transition-colors">
                          {i % 2 === 0 ? 'Protocol Rebalance' : 'Batch Allocation'}
                        </p>
                        <p className="text-[7px] text-zinc-600 uppercase mt-0.5">
                          Unit_{i * 13} • {i * 15}m ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <NotificationModal 
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        onConfirm={notification.onConfirm}
      />

      {/* Protocol Scrawl Ticker */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-[#D4AF37]/20 h-8 flex items-center overflow-hidden z-[50]">
        <div className="flex whitespace-nowrap animate-ticker">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center mx-8">
              <span className="text-[7px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mr-4">Protocol_{i * 88}: ACTIVE</span>
              <span className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.3em] mr-4">ENCRYPTED_DATA_STREAM_FLOWING...</span>
              <span className="text-[7px] font-black text-white uppercase tracking-[0.3em] mr-4">SYS_LOAD: {20 + i}%</span>
              <div className="w-1 h-1 bg-[#D4AF37] opacity-30" />
            </div>
          ))}
          {/* Repeat for seamless loop */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i + 10} className="flex items-center mx-8">
              <span className="text-[7px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mr-4">Protocol_{i * 88}: ACTIVE</span>
              <span className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.3em] mr-4">ENCRYPTED_DATA_STREAM_FLOWING...</span>
              <span className="text-[7px] font-black text-white uppercase tracking-[0.3em] mr-4">SYS_LOAD: {20 + i}%</span>
              <div className="w-1 h-1 bg-[#D4AF37] opacity-30" />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LeadDesignation;
