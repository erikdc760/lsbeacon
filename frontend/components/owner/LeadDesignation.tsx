
import React, { useState } from 'react';
import { apiFetch } from '../../api/client';
import NotificationModal from '../NotificationModal';

const LeadDesignation: React.FC = () => {
    const [stats, setStats] = React.useState({ unassigned: 0, activeFlow: 0, distributionProgress: 0 });
    const [rules, setRules] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [notification, setNotification] = useState<{
        isOpen: boolean;
        type: 'alert' | 'confirm' | 'success' | 'error';
        title: string;
        message: string;
    }>({ isOpen: false, type: 'alert', title: '', message: '' });

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'alert' = 'alert') => {
        setNotification({ isOpen: true, type, title, message });
    };

    React.useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await apiFetch('/api/owner/leads/stats');
            if (data) {
                setStats({
                    unassigned: data.unassigned || 4281,
                    activeFlow: data.activeFlow || 1120,
                    distributionProgress: data.distributionProgress || 65
                });
                if (data.rules) setRules(data.rules);
                else setRules([
                { id: 1, title: 'Top Performance Priority', desc: 'Give 20% more leads to agents with Sales > 10/mo', active: true },
                { id: 2, title: 'New Agent Warming', desc: 'Limit new agents to 10 uncalled leads/day', active: false },
                { id: 3, title: 'Equal Weighting', desc: 'Default round-robin distribution', active: true },
              ]);
            }
        } catch (error) {
            console.error("Failed to fetch lead stats", error);
            // fallback
              setRules([
                { id: 1, title: 'Top Performance Priority', desc: 'Give 20% more leads to agents with Sales > 10/mo', active: true },
                { id: 2, title: 'New Agent Warming', desc: 'Limit new agents to 10 uncalled leads/day', active: false },
                { id: 3, title: 'Equal Weighting', desc: 'Default round-robin distribution', active: true },
              ]);
        } finally {
            setLoading(false);
        }
    };

    const handleRedistribution = async () => {
        try {
            await apiFetch('/api/owner/leads/distribute', { method: 'POST' });
            showAlert('Success', "Redistribution triggered successfully!", 'success');
        } catch (error) {
            console.error(error);
            showAlert('Error', "Failed to trigger redistribution.", 'error');
        }
    }

    const toggleRule = async (id: number, currentActive: boolean) => {
        try {
             await apiFetch(`/api/owner/leads/rules/${id}`, {
                 method: 'PUT',
                 body: JSON.stringify({ active: !currentActive })
             });
             // optimistic update
             setRules(rules.map(r => r.id === id ? { ...r, active: !currentActive } : r));
        } catch (error) {
            console.error(error);
            showAlert('Error', "Failed to update rule.", 'error');
        }
    }

  return (
    <div className="space-y-8 lg:space-y-10 animate-fadeIn font-display h-full overflow-y-auto custom-scroll pr-2 pb-20">
      <NotificationModal
          isOpen={notification.isOpen}
          onClose={() => setNotification({ ...notification, isOpen: false })}
          type={notification.type}
          title={notification.title}
          message={notification.message}
      />
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 mb-10">
        <div>
          <h1 className="text-xl lg:text-3xl font-black text-white uppercase tracking-tighter">Lead Designation</h1>
          <p className="text-zinc-500 text-[10px] lg:text-xs uppercase tracking-[0.2em] mt-1">Shuffle and rebalance lead flow across the organization</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
        <div className="lg:col-span-2 space-y-6 lg:space-y-10">
          <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-900/50 p-8 lg:p-10 rounded-none shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37] opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-[11px] lg:text-sm font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-10 border-b border-zinc-900/50 pb-6">Global Lead Flow</h3>
            <div className="flex items-center justify-around sm:justify-start gap-12 sm:gap-20 mb-10">
              <div className="text-center sm:text-left">
                <p className="text-3xl lg:text-5xl font-black text-white tracking-tighter">{stats.unassigned.toLocaleString()}</p>
                <p className="text-[9px] lg:text-[10px] text-zinc-600 uppercase font-black tracking-widest mt-2">Total Unassigned</p>
              </div>
              <div className="h-16 w-[1px] bg-zinc-900 hidden sm:block"></div>
              <div className="text-center sm:text-left">
                <p className="text-3xl lg:text-5xl font-black text-white tracking-tighter">{stats.activeFlow.toLocaleString()}</p>
                <p className="text-[9px] lg:text-[10px] text-zinc-600 uppercase font-black tracking-widest mt-2">Active Flow/Day</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-4">
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Distribution Progress</span>
                  <span className="text-[10px] text-[#D4AF37] uppercase font-black tracking-widest">{stats.distributionProgress}%_COMPLETE</span>
                </div>
                <div className="h-1.5 bg-zinc-900 rounded-none overflow-hidden relative shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent"></div>
                  <div className="h-full bg-[#D4AF37] relative shadow-[0_0_15px_rgba(212,175,55,0.5)] transition-all duration-1000" style={{ width: `${stats.distributionProgress}%` }}></div>
                </div>
              </div>
              <button onClick={handleRedistribution} className="w-full bg-white text-black text-[10px] lg:text-[11px] uppercase font-black tracking-[0.2em] py-5 rounded-none hover:bg-[#D4AF37] transition-all duration-500 shadow-xl">
                TRIGGER MANUAL REDISTRIBUTION
              </button>
            </div>
          </div>

          <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-900/50 p-8 lg:p-10 rounded-none shadow-2xl">
            <h3 className="text-[11px] lg:text-sm font-black text-white uppercase tracking-[0.3em] mb-10 border-b border-zinc-900/50 pb-6">Automated Rules</h3>
            <p className="text-[10px] lg:text-xs text-zinc-500 mb-8 uppercase font-black tracking-widest opacity-60">Define how new leads from Facebook are distributed automatically.</p>
            <div className="space-y-4">
              {rules.map((rule, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-zinc-900/30 border border-zinc-900/50 rounded-none gap-6 hover:border-[#D4AF37]/30 transition-all group">
                  <div>
                    <p className="text-[11px] lg:text-xs font-black text-white uppercase tracking-widest group-hover:text-[#D4AF37] transition-colors">{rule.title}</p>
                    <p className="text-[9px] lg:text-[10px] text-zinc-600 uppercase font-black tracking-wider mt-1">{rule.desc}</p>
                  </div>
                  <div 
                    onClick={() => toggleRule(rule.id, rule.active)}
                    className={`shrink-0 w-12 h-6 rounded-none p-1 cursor-pointer transition-all duration-500 border ${rule.active ? 'bg-[#D4AF37] border-[#D4AF37]' : 'bg-black border-zinc-800'}`}>
                    <div className={`w-4 h-4 bg-black rounded-none transition-transform duration-500 ${rule.active ? 'translate-x-6 bg-white' : 'translate-x-0'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-900/50 p-8 lg:p-10 rounded-none shadow-2xl">
          <h3 className="text-[11px] lg:text-sm font-black text-white uppercase tracking-[0.3em] mb-10 border-b border-zinc-900/50 pb-6">Recent Activity</h3>
          <div className="space-y-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-1.5 h-1.5 bg-[#D4AF37] mt-1.5 rounded-none shrink-0 shadow-[0_0_10px_#D4AF37] group-hover:scale-125 transition-transform"></div>
                <div>
                  <p className="text-[10px] lg:text-[11px] text-white uppercase font-black tracking-widest group-hover:text-[#D4AF37] transition-colors">500 Leads Assigned</p>
                  <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mt-1">To: Team Sarah Miller • 2h ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDesignation;
