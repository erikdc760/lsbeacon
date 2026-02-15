import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminApi } from '../../api';

const dataALP = [
  { name: '01/06', alp: 400 },
  { name: '01/07', alp: 700 },
  { name: '01/08', alp: 500 },
  { name: '01/09', alp: 900 },
  { name: '01/10', alp: 1100 },
  { name: '01/11', alp: 850 },
  { name: '01/12', alp: 1200 },
];

const dataDials = [
  { name: '01/06', dials: 200 },
  { name: '01/07', dials: 450 },
  { name: '01/08', dials: 300 },
  { name: '01/09', dials: 500 },
  { name: '01/10', dials: 350 },
  { name: '01/11', dials: 400 },
  { name: '01/12', dials: 550 },
];

const Dashboard: React.FC = () => {
  const [typedText, setTypedText] = useState("");
  const [ownerName, setOwnerName] = useState("ADMINISTRATOR COMMAND");
  const [quote, setQuote] = useState("VISION WITHOUT EXECUTION IS HALLUCINATION.");
  const [isEditing, setIsEditing] = useState(false);
  const [directiveStatus, setDirectiveStatus] = useState({ loading: true, saving: false, error: '' });
  const [aggregates, setAggregates] = useState({
    totalCompanies: 0,
    totalAgents: 0,
    totalCampaigns: 0,
    activeDeployments: 0
  });
  
  useEffect(() => {
    fetchAggregates();
    fetchDirectives();
  }, []);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(quote.slice(0, i));
      i++;
      if (i > quote.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [quote]);

  const fetchAggregates = async () => {
    try {
      const data = await adminApi.getDashboardAggregates();
      if (data) setAggregates(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDirectives = async () => {
    setDirectiveStatus({ loading: true, saving: false, error: '' });
    try {
      const data = await adminApi.getDashboardDirectives();
      if (data?.owner_name) setOwnerName(String(data.owner_name).toUpperCase());
      if (data?.quote) setQuote(String(data.quote).toUpperCase());
    } catch (error: any) {
      setDirectiveStatus({ loading: false, saving: false, error: error?.message || 'Failed to load directives.' });
      return;
    }
    setDirectiveStatus({ loading: false, saving: false, error: '' });
  };

  const handleDirectiveToggle = async () => {
    if (!isEditing) {
      setDirectiveStatus(prev => ({ ...prev, error: '' }));
      setIsEditing(true);
      return;
    }

    setDirectiveStatus(prev => ({ ...prev, saving: true, error: '' }));
    try {
      const updated = await adminApi.updateDashboardDirectives({
        owner_name: ownerName.trim(),
        quote: quote.trim(),
      });
      if (updated?.owner_name) setOwnerName(String(updated.owner_name).toUpperCase());
      if (updated?.quote) setQuote(String(updated.quote).toUpperCase());
      setIsEditing(false);
      setDirectiveStatus(prev => ({ ...prev, saving: false }));
    } catch (error: any) {
      setDirectiveStatus(prev => ({ ...prev, saving: false, error: error?.message || 'Failed to save directives.' }));
    }
  };

  return (
    <div className="animate-fadeIn space-y-8 font-display h-full overflow-y-auto custom-scroll">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900/50 pb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            Command <span className="text-[#D4AF37]">Intelligence</span>
          </h2>
          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-black">Global Operations Control Hub</p>
        </div>
        
        {/* Quick Stats Summary */}
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">Entities</p>
            <p className="text-lg font-black text-white">{aggregates.totalCompanies}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-[#D4AF37] uppercase font-black tracking-widest">Active Ops</p>
            <p className="text-lg font-black text-white">{aggregates.totalCampaigns}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-950 border border-zinc-900 p-6 relative overflow-hidden group hover:border-[#D4AF37]/30 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Network Payload</p>
              <h3 className="text-xl font-black text-white tracking-tighter mt-1 uppercase">Company Dials (7D)</h3>
            </div>
          </div>
          
          <div className="h-48 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataDials}>
                <defs>
                  <linearGradient id="colorDials" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.05}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="#121212" vertical={false} />
                <XAxis dataKey="name" stroke="#262626" fontSize={8} axisLine={false} tickLine={false} tick={{ fontWeight: 900 }} />
                <Tooltip 
                  cursor={{ stroke: '#D4AF37', strokeWidth: 1 }}
                  contentStyle={{ background: '#09090b', border: '1px solid #18181b', borderRadius: '0', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }} 
                />
                <Area type="monotone" dataKey="dials" stroke="#D4AF37" fill="url(#colorDials)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-6 relative overflow-hidden group hover:border-zinc-700 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Enterprise Yield</p>
              <h3 className="text-xl font-black text-white tracking-tighter mt-1 uppercase">Company ALP (7D)</h3>
            </div>
          </div>

          <div className="h-48 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataALP}>
                <CartesianGrid strokeDasharray="0" stroke="#121212" vertical={false} />
                <XAxis dataKey="name" stroke="#262626" fontSize={8} axisLine={false} tickLine={false} tick={{ fontWeight: 900 }} />
                <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #18181b', borderRadius: '0', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }} />
                <Bar dataKey="alp" fill="#D4AF37" shape={(props: any) => {
                  const { x, y, width, height } = props;
                  return <rect x={x} y={y} width={width} height={height} fill={props.payload.alp > 600 ? '#D4AF37' : '#111'} />;
                }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="group bg-black border border-zinc-900 min-h-[300px] flex flex-col relative overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2070" 
            className="w-full h-full object-cover opacity-[0.05] group-hover:scale-105 transition-transform duration-[20s] grayscale"
            alt="Corporate Core"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative z-10">
          <div className="mb-6 flex flex-col items-center">
             <div className="w-12 h-[1px] bg-[#D4AF37] mb-6 shadow-[0_0_20px_#D4AF37]" />
             {isEditing ? (
               <input 
                 className="bg-black/50 border border-[#D4AF37] text-[#D4AF37] text-center uppercase tracking-[0.4em] font-black px-4 py-2 text-xs outline-none focus:bg-black/80 transition-all"
                 value={ownerName}
                 onChange={(e) => setOwnerName(e.target.value.toUpperCase())}
                 autoFocus
               />
             ) : (
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D4AF37] mb-6 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">{ownerName}</p>
             )}
          </div>

          <div className="max-w-4xl w-full">
            {isEditing ? (
              <textarea 
                className="w-full bg-black/50 border border-zinc-900 text-white text-xl lg:text-3xl text-center uppercase font-black tracking-tighter leading-tight p-6 outline-none focus:bg-black/80 focus:border-[#D4AF37]/30 transition-all"
                value={quote}
                onChange={(e) => setQuote(e.target.value.toUpperCase())}
                rows={2}
              />
            ) : (
              <h2 className="text-2xl lg:text-4xl font-black text-white tracking-tighter uppercase leading-tight mb-8">
                "{typedText}"
              </h2>
            )}

            {directiveStatus.error && (
              <p className="text-[9px] text-red-500 uppercase tracking-widest mb-6">
                {directiveStatus.error}
              </p>
            )}
            
            <div className="mt-8 flex justify-center gap-4">
              <button 
                onClick={handleDirectiveToggle}
                className="bg-zinc-950 border border-zinc-900 text-zinc-500 font-black text-[9px] px-8 py-4 uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all shadow-2xl"
              >
                {directiveStatus.saving ? "Saving..." : (isEditing ? "Save Protocol" : "Modify Directives")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
