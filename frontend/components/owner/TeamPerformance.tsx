
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ownerApi } from '../../api/owner';

interface Agent {
  id: string;
  name: string;
  calls: number;
  sales: number;
  conversionRate: number;
  alp: number;
  quality: number;
  status: 'online' | 'offline' | 'on-call';
}

const TeamPerformance: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await ownerApi.getTeamPerformance();
        if (Array.isArray(data)) setAgents(data);
      } catch (err) {
        console.error(err);
        setAgents([
          { id: '1', name: 'SARAH CONNOR', calls: 156, sales: 23, conversionRate: 14.7, alp: 28600, quality: 96, status: 'on-call' },
          { id: '2', name: 'JOHN REESE', calls: 142, sales: 19, conversionRate: 13.4, alp: 24800, quality: 94, status: 'online' },
          { id: '3', name: 'ELLEN RIPLEY', calls: 98, sales: 12, conversionRate: 12.2, alp: 15400, quality: 91, status: 'online' },
          { id: '4', name: 'RICK DECKARD', calls: 112, sales: 8, conversionRate: 7.1, alp: 11200, quality: 88, status: 'on-call' },
        ]);
      }
    };
    fetchTeam();
  }, []);

  const weeklyTrend = [
    { week: 'W1', calls: 820, sales: 98 },
    { week: 'W2', calls: 945, sales: 112 },
    { week: 'W3', calls: 890, sales: 105 },
    { week: 'W4', calls: 1020, sales: 128 },
    { week: 'W5', calls: 871, sales: 98 },
  ];

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [sortBy, setSortBy] = useState<'calls' | 'sales' | 'conversionRate'>('sales');

  const sortedAgents = [...agents].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="animate-fadeIn space-y-6 lg:space-y-10 pb-20 font-display">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900/50 pb-6 lg:pb-8">
        <div className="space-y-2">
          <h2 className="text-2xl lg:text-4xl font-black text-white uppercase tracking-tighter">
            Team <span className="text-[#D4AF37]">Performance</span>
          </h2>
          <p className="text-[8px] lg:text-[10px] text-zinc-600 uppercase tracking-[0.2em] lg:tracking-[0.4em] font-black">Strategic Field_Intelligence & Operative Analytics</p>
        </div>
      </div>

      {/* Team Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { label: 'Strength', val: agents.length, sub: 'Operatives', color: 'text-white' },
          { label: 'Volume', val: agents.reduce((sum, a) => sum + a.calls, 0), sub: 'Payload', color: 'text-zinc-400' },
          { label: 'ALP', val: `$${(agents.reduce((sum, a) => sum + a.alp, 0) / 1000).toFixed(1)}K`, sub: 'Velocity', color: 'text-[#D4AF37]' },
          { label: 'System', val: `${agents.length > 0 ? Math.round(agents.reduce((sum, a) => sum + a.quality, 0) / agents.length) : 0}%`, sub: 'Compliance', color: 'text-white' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-zinc-950 border border-zinc-900 px-4 lg:px-8 py-4 lg:py-6 relative overflow-hidden group hover:border-[#D4AF37]/50 transition-all">
            <div className="absolute top-0 right-0 w-16 lg:w-24 h-16 lg:h-24 bg-[#D4AF37]/5 -mr-8 lg:-mr-12 -mt-8 lg:-mt-12 rounded-full blur-2xl group-hover:bg-[#D4AF37]/10 transition-all" />
            <p className="text-[7px] lg:text-[9px] uppercase font-black tracking-widest text-zinc-600 mb-1 lg:mb-2">{stat.label}</p>
            <p className={`text-xl lg:text-3xl font-black tracking-tighter ${stat.color}`}>{stat.val}</p>
            <p className="text-[6px] lg:text-[8px] text-zinc-700 mt-1 lg:mt-2 font-black tracking-[0.2em] lg:tracking-[0.3em] uppercase">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-10">
        <div className="xl:col-span-8 space-y-6 lg:space-y-10">
          {/* Weekly Trend Chart */}
          <div className="bg-zinc-950 border border-zinc-900 p-4 lg:p-8 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-10 gap-4">
              <div>
                <h3 className="text-xs text-white uppercase font-black tracking-[0.2em]">Operational Pulse</h3>
                <p className="text-[8px] lg:text-[9px] text-zinc-600 uppercase mt-1 tracking-widest">5-Week Performance History</p>
              </div>
              <div className="flex gap-4 lg:gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-[#D4AF37]" />
                  <span className="text-[7px] lg:text-[8px] text-zinc-500 uppercase font-black tracking-widest">Payload</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-500" />
                  <span className="text-[7px] lg:text-[8px] text-zinc-500 uppercase font-black tracking-widest">Yield</span>
                </div>
              </div>
            </div>
            <div className="h-48 lg:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="0" stroke="#121212" vertical={false} />
                  <XAxis dataKey="week" stroke="#262626" fontSize={8} axisLine={false} tickLine={false} tick={{ fontWeight: 900 }} />
                  <YAxis stroke="#262626" fontSize={8} axisLine={false} tickLine={false} tick={{ fontWeight: 900 }} />
                  <Tooltip 
                    cursor={{ stroke: '#D4AF37', strokeWidth: 1 }}
                    contentStyle={{ background: '#09090b', border: '1px solid #18181b', borderRadius: '0', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}
                  />
                  <Line type="monotone" dataKey="calls" stroke="#D4AF37" strokeWidth={2} lg:strokeWidth={3} dot={{ fill: '#D4AF37', r: 0 }} activeDot={{ r: 4, fill: '#D4AF37' }} />
                  <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} lg:strokeWidth={3} dot={{ fill: '#10b981', r: 0 }} activeDot={{ r: 4, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Agent Performance Table */}
          <div className="bg-zinc-950 border border-zinc-900 overflow-hidden">
            <div className="p-4 lg:p-8 border-b border-zinc-900 bg-zinc-900/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] text-white">Personnel Registry</h3>
              <div className="flex bg-black border border-zinc-900 p-1 w-full sm:w-auto overflow-x-auto">
                {['calls', 'sales', 'conversionRate'].map((type) => (
                  <button 
                    key={type}
                    onClick={() => setSortBy(type as any)}
                    className={`flex-1 sm:flex-none px-3 lg:px-4 py-1.5 lg:py-2 text-[7px] lg:text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      sortBy === type ? 'bg-[#D4AF37] text-black shadow-lg' : 'text-zinc-600 hover:text-white'
                    }`}
                  >
                    {type === 'conversionRate' ? 'Conv %' : type}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px] lg:min-w-0">
                <thead>
                  <tr className="bg-black">
                    <th className="px-4 lg:px-8 py-3 lg:py-5 text-[7px] lg:text-[9px] uppercase tracking-[0.2em] lg:tracking-[0.3em] text-zinc-500 font-black">Rank</th>
                    <th className="px-4 lg:px-8 py-3 lg:py-5 text-[7px] lg:text-[9px] uppercase tracking-[0.2em] lg:tracking-[0.3em] text-zinc-500 font-black">Operative</th>
                    <th className="px-4 lg:px-8 py-3 lg:py-5 text-[7px] lg:text-[9px] uppercase tracking-[0.2em] lg:tracking-[0.3em] text-zinc-500 font-black text-center">Protocol</th>
                    <th className="px-4 lg:px-8 py-3 lg:py-5 text-[7px] lg:text-[9px] uppercase tracking-[0.2em] lg:tracking-[0.3em] text-zinc-500 font-black text-center">Volume</th>
                    <th className="px-4 lg:px-8 py-3 lg:py-5 text-[7px] lg:text-[9px] uppercase tracking-[0.2em] lg:tracking-[0.3em] text-zinc-500 font-black text-center">Yield</th>
                    <th className="px-4 lg:px-8 py-3 lg:py-5 text-[7px] lg:text-[9px] uppercase tracking-[0.2em] lg:tracking-[0.3em] text-zinc-500 font-black text-right">ALP Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {sortedAgents.map((agent, index) => (
                    <tr 
                      key={agent.id} 
                      className="group hover:bg-[#D4AF37]/5 transition-all cursor-pointer"
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <td className="px-4 lg:px-8 py-4 lg:py-6">
                        <span className={`w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center text-[8px] lg:text-[10px] font-black ${
                          index === 0 ? 'bg-[#D4AF37] text-black' : 'bg-black text-zinc-700 border border-zinc-900'
                        }`}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-4 lg:px-8 py-4 lg:py-6">
                        <span className="text-[10px] lg:text-xs font-black text-white uppercase tracking-widest group-hover:text-[#D4AF37] transition-colors">{agent.name}</span>
                        <span className="block text-[7px] lg:text-[8px] text-zinc-700 font-bold uppercase tracking-widest mt-0.5 lg:mt-1">ID_{agent.id.slice(0,6)}</span>
                      </td>
                      <td className="px-4 lg:px-8 py-4 lg:py-6">
                        <div className="flex items-center justify-center gap-1.5 lg:gap-2">
                          <div className={`w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full ${
                            agent.status === 'on-call' ? 'bg-green-500 animate-pulse' :
                            agent.status === 'online' ? 'bg-blue-500' : 'bg-zinc-800'
                          }`} />
                          <span className={`text-[7px] lg:text-[9px] uppercase font-black tracking-[0.1em] lg:tracking-[0.2em] ${
                            agent.status === 'on-call' ? 'text-green-500' :
                            agent.status === 'online' ? 'text-blue-500' : 'text-zinc-700'
                          }`}>
                            {agent.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-8 py-4 lg:py-6 text-center text-[10px] lg:text-xs text-white font-black">{agent.calls}</td>
                      <td className="px-4 lg:px-8 py-4 lg:py-6 text-center text-[10px] lg:text-xs text-[#D4AF37] font-black">{agent.sales}</td>
                      <td className="px-4 lg:px-8 py-4 lg:py-6 text-right text-[10px] lg:text-xs text-zinc-400 font-black">${agent.alp.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar / Detail Panel */}
        <div className="xl:col-span-4 space-y-10">
          <div className="bg-zinc-950 border border-zinc-900 p-8 sticky top-8">
            <div className="mb-10 text-center">
              <h3 className="text-xs text-[#D4AF37] uppercase font-black tracking-[0.3em]">Operative Profile</h3>
              <p className="text-[9px] text-zinc-600 uppercase mt-2 tracking-widest">Detail_Analysis_Protocol</p>
            </div>

            {selectedAgent ? (
              <div className="space-y-8 animate-fadeIn">
                <div className="text-center py-6 border-y border-zinc-900 bg-zinc-900/10">
                  <h4 className="text-xl font-black text-white uppercase tracking-[0.1em] leading-none">{selectedAgent.name}</h4>
                  <p className="text-[10px] text-[#D4AF37] uppercase font-black tracking-[0.4em] mt-3">Active Operative</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black border border-zinc-900 p-4">
                    <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mb-1">Conversion</p>
                    <p className="text-sm font-black text-white">{selectedAgent.conversionRate}%</p>
                  </div>
                  <div className="bg-black border border-zinc-900 p-4">
                    <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mb-1">Quality</p>
                    <p className="text-sm font-black text-white">{selectedAgent.quality}%</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <button className="w-full bg-white text-black font-black uppercase tracking-[0.3em] py-4 text-[9px] hover:bg-[#D4AF37] transition-all">
                    Initiate Proxy Comms
                  </button>
                  <button className="w-full bg-black border border-zinc-800 text-zinc-500 font-black uppercase tracking-[0.3em] py-4 text-[9px] hover:border-red-900/50 hover:text-red-500 transition-all">
                    Flag for Review
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center space-y-4 border border-dashed border-zinc-900">
                <p className="text-[9px] text-zinc-700 uppercase font-black tracking-[0.4em]">Select Operative for Intelligence</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Agent Detail Panel */}
      {selectedAgent && (
        <div className="bg-zinc-950 border border-[#D4AF37] p-8 lg:p-10 shadow-3xl animate-slideDown">
          <div className="flex justify-between items-start mb-8 border-b border-zinc-900 pb-6">
            <div>
              <h3 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tighter">{selectedAgent.name}</h3>
              <p className="text-[9px] text-[#D4AF37] uppercase tracking-[0.4em] mt-2 font-black">Detailed_Field_Report // ID: {selectedAgent.id}</p>
            </div>
            <button 
              onClick={() => setSelectedAgent(null)}
              className="p-2 bg-zinc-900 text-zinc-500 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10">
            {[
              { label: 'Weekly Calls', val: selectedAgent.calls, color: 'text-white' },
              { label: 'Sales Made', val: selectedAgent.sales, color: 'text-[#D4AF37]' },
              { label: 'Conversion', val: `${selectedAgent.conversionRate}%`, color: 'text-white' },
              { label: 'Total ALP', val: `$${selectedAgent.alp.toLocaleString()}`, color: 'text-green-500' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-black border border-zinc-900 p-6">
                <p className="text-[8px] lg:text-[9px] uppercase font-black tracking-widest text-zinc-600 mb-3">{stat.label}</p>
                <p className={`text-xl lg:text-3xl font-black tracking-tighter ${stat.color}`}>{stat.val}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button className="flex-1 py-4 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all shadow-xl">
              SCHEDULE 1-ON-1 BRIEFING
            </button>
            <button className="flex-1 py-4 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">
              VIEW FULL CALL REPOSITORY
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPerformance;
