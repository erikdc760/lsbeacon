
import React, { useState } from 'react';

type MetricType = 'ALP' | 'Dials' | 'Retention' | 'Lead Ratio' | 'Profitability';
type TimePeriod = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

const CompanyArena: React.FC = () => {
  const [activeMetric, setActiveMetric] = useState<MetricType>('ALP');
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('Monthly');

  const rankings = [
    { rank: 1, name: 'John Doe', dials: 1245, sales: 32, alp: '$42,500', retention: '94%', ratio: '4:1', profit: '$12k', trend: 'up' },
    { rank: 2, name: 'Sarah Miller', dials: 1102, sales: 28, alp: '$38,200', retention: '91%', ratio: '3:1', profit: '$10k', trend: 'up' },
    { rank: 3, name: 'Jane Smith', dials: 980, sales: 25, alp: '$31,000', retention: '88%', ratio: '2.5:1', profit: '$8k', trend: 'down' },
    { rank: 4, name: 'Mike Ross', dials: 850, sales: 18, alp: '$24,400', retention: '85%', ratio: '2:1', profit: '$6k', trend: 'steady' },
    { rank: 5, name: 'Alice Wong', dials: 720, sales: 14, alp: '$19,800', retention: '92%', ratio: '3.5:1', profit: '$5k', trend: 'up' },
  ];

  const getMetricValue = (agent: any) => {
    switch (activeMetric) {
      case 'ALP': return agent.alp;
      case 'Dials': return agent.dials;
      case 'Retention': return agent.retention;
      case 'Lead Ratio': return agent.ratio;
      case 'Profitability': return agent.profit;
      default: return agent.alp;
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn font-display">
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-3 mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tighter">Company Arena</h1>
          <p className="text-zinc-500 text-[8px] lg:text-[9px] uppercase tracking-[0.2em] mt-1">Global Organization Leaderboards</p>
        </div>
        
        <div className="flex bg-zinc-950 border border-zinc-900 p-0.5">
          {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p as TimePeriod)}
              className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all ${
                activePeriod === p ? 'bg-[#D4AF37] text-black' : 'text-zinc-500 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
        {['ALP', 'Dials', 'Retention', 'Lead Ratio', 'Profitability'].map((m) => (
          <button
            key={m}
            onClick={() => setActiveMetric(m as MetricType)}
            className={`p-2 border text-[8px] font-black uppercase tracking-widest transition-all text-center ${
              activeMetric === m ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5 shadow-[0_0_20px_rgba(212,175,55,0.05)]' : 'border-zinc-900 text-zinc-600 hover:border-zinc-700'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-none overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zinc-900 bg-zinc-900/30 flex justify-between items-center">
          <h3 className="text-[9px] font-black uppercase tracking-widest text-white">
            Top Performers <span className="text-[#D4AF37] ml-2">[{activePeriod}]</span>
          </h3>
          <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Tracking: {activeMetric}</div>
        </div>
        
        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-zinc-900">
                <th className="px-6 py-3 text-[9px] uppercase tracking-widest text-zinc-500 font-black">Rank</th>
                <th className="px-6 py-3 text-[9px] uppercase tracking-widest text-zinc-500 font-black">Agent</th>
                <th className="px-6 py-3 text-[9px] uppercase tracking-widest text-zinc-500 font-black text-right">{activeMetric}</th>
                <th className="px-6 py-3 text-[9px] uppercase tracking-widest text-zinc-500 font-black text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {rankings.map((agent) => (
                <tr key={agent.rank} className="hover:bg-zinc-900/30 transition-colors group">
                  <td className="px-6 py-3">
                    <span className={`w-7 h-7 flex items-center justify-center font-black text-[10px] ${
                      agent.rank === 1 ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 
                      agent.rank === 2 ? 'bg-zinc-300 text-black' : 
                      agent.rank === 3 ? 'bg-orange-900 text-white' : 
                      'bg-zinc-950 text-zinc-700 border border-zinc-900'
                    }`}>
                      {agent.rank}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-[11px] font-black text-white uppercase tracking-tight group-hover:text-[#D4AF37] transition-colors">{agent.name}</td>
                  <td className="px-6 py-3 text-[10px] text-white text-right font-black font-mono tracking-tighter">
                    {getMetricValue(agent)}
                  </td>
                  <td className="px-6 py-3 text-center">
                    {agent.trend === 'up' && <span className="text-green-500 text-[10px]">▲</span>}
                    {agent.trend === 'down' && <span className="text-red-500 text-[10px]">▼</span>}
                    {agent.trend === 'steady' && <span className="text-zinc-600 text-[10px]">●</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompanyArena;
