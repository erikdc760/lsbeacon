
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const PersonalTracker: React.FC = () => {
  const [viewMode, setViewMode] = useState<'MONTH' | 'YTD'>('MONTH');
  
  const weeklyData = [
    { day: 'MON', dials: 245, sales: 3, revenue: 4200 },
    { day: 'TUE', dials: 312, sales: 5, revenue: 7800 },
    { day: 'WED', dials: 290, sales: 4, revenue: 6100 },
    { day: 'THU', dials: 450, sales: 8, revenue: 12500 },
    { day: 'FRI', dials: 180, sales: 2, revenue: 2900 },
    { day: 'SAT', dials: 95, sales: 1, revenue: 1100 },
    { day: 'SUN', dials: 40, sales: 0, revenue: 0 },
  ];

  const ytdData = [
    { month: 'JAN', dials: 4500, revenue: 85000 },
    { month: 'FEB', dials: 5200, revenue: 92000 },
    { month: 'MAR', dials: 4800, revenue: 78000 },
    { month: 'APR', dials: 6100, revenue: 115000 },
    { month: 'MAY', dials: 5500, revenue: 105000 },
    { month: 'JUN', dials: 5900, revenue: 120000 },
  ];

  const stats = [
    { label: 'Avg Daily Dials', value: '284', change: '+12%', color: '#D4AF37' },
    { label: 'Retention Rate', value: '92.4%', change: '+1.5%', color: '#ffffff' },
    { label: 'Lead/Referral Ratio', value: '3:1', change: 'STABLE', color: '#D4AF37' },
    { label: 'Sales/100 Leads', value: '8.4', change: '+0.8', color: '#ffffff' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn font-display">
      <div className="flex flex-col">
        <h1 className="text-2xl lg:text-4xl font-black text-white uppercase tracking-tighter">PERFORMANCE ENGINE</h1>
        <div className="h-1 w-16 lg:w-24 bg-[#D4AF37] mt-2 shadow-[0_0_15px_#D4AF37]"></div>
        <p className="text-zinc-600 text-[9px] lg:text-[10px] uppercase tracking-[0.2em] mt-4 font-black">Personal Analytical Output & Quota Tracking</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-zinc-950 border border-zinc-900 p-6 lg:p-8 rounded-none group hover:border-[#D4AF37]/50 transition-all shadow-xl">
            <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.3em] text-zinc-600 mb-4 font-black">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl lg:text-3xl font-black leading-none tracking-tighter" style={{ color: stat.color }}>{stat.value}</h3>
              <span className={`text-[9px] font-mono font-black ${stat.change.includes('+') ? 'text-green-500' : 'text-zinc-600'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          onClick={() => setViewMode(viewMode === 'MONTH' ? 'YTD' : 'MONTH')}
          className="bg-zinc-950 border border-zinc-900 p-6 lg:p-10 rounded-none h-[400px] lg:h-[500px] flex flex-col cursor-pointer hover:border-[#D4AF37]/30 transition-all group"
        >
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">{viewMode === 'MONTH' ? 'Last Month ALP' : 'Year to Date ALP'}</p>
              <p className="text-[10px] lg:text-xs text-zinc-600 uppercase mt-1 font-black">Click to toggle Month/YTD view</p>
            </div>
            <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{viewMode} VIEW</div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewMode === 'MONTH' ? weeklyData : ytdData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="#121212" vertical={false} />
                <XAxis dataKey={viewMode === 'MONTH' ? 'day' : 'month'} stroke="#262626" fontSize={9} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#262626" fontSize={9} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #1f1f1f', borderRadius: '0', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey={viewMode === 'MONTH' ? 'revenue' : 'revenue'} stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div 
          onClick={() => setViewMode(viewMode === 'MONTH' ? 'YTD' : 'MONTH')}
          className="bg-zinc-950 border border-zinc-900 p-6 lg:p-10 rounded-none h-[400px] lg:h-[500px] flex flex-col cursor-pointer hover:border-white/20 transition-all group"
        >
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">{viewMode === 'MONTH' ? 'Last Month Dials' : 'Year to Date Dials'}</p>
              <p className="text-[10px] lg:text-xs text-zinc-600 uppercase mt-1 font-black">Click to toggle Month/YTD view</p>
            </div>
            <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{viewMode} VIEW</div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewMode === 'MONTH' ? weeklyData : ytdData}>
                <CartesianGrid strokeDasharray="0" stroke="#121212" vertical={false} />
                <XAxis dataKey={viewMode === 'MONTH' ? 'day' : 'month'} stroke="#262626" fontSize={9} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#262626" fontSize={9} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#0a0a0a'}}
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #1f1f1f', borderRadius: '0', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Bar dataKey="dials" fill="#D4AF37" shape={<rect rx={0} ry={0} />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalTracker;
