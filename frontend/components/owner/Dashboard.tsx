
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ownerApi } from '../../api/owner';

const Dashboard: React.FC = () => {
  const [dataSales, setDataSales] = useState<any[]>([]);
  const [dataDials, setDataDials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [typedText, setTypedText] = useState("");
  const [ownerName, setOwnerName] = useState("COMMANDER ALPHA");
  const [quote, setQuote] = useState("DISCIPLINE DISPELS FEAR.");
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await ownerApi.getDashboardStats();
        if (data.dataSales) setDataSales(data.dataSales);
        if (data.dataDials) setDataDials(data.dataDials);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        // Fallback data
        setDataSales([
          { name: '01/06', sales: 400 },
          { name: '01/07', sales: 700 },
          { name: '01/08', sales: 500 },
          { name: '01/09', sales: 900 },
          { name: '01/10', sales: 1100 },
          { name: '01/11', sales: 850 },
          { name: '01/12', sales: 1200 },
        ]);
        setDataDials([
          { name: '01/06', dials: 200 },
          { name: '01/07', dials: 450 },
          { name: '01/08', dials: 300 },
          { name: '01/09', dials: 500 },
          { name: '01/10', dials: 350 },
          { name: '01/11', dials: 400 },
          { name: '01/12', dials: 550 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  return (
    <div className="animate-fadeIn space-y-10 font-display h-full overflow-y-auto custom-scroll">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900/50 pb-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
            Central <span className="text-[#D4AF37]">Command</span> Hub
          </h2>
          <p className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] font-black">Strategic Corporate Overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        <div className="bg-zinc-950 border border-zinc-900 p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group hover:border-[#D4AF37]/30 transition-all">
          <div className="flex justify-between items-center mb-8 lg:mb-10 relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Engagement Metrics</p>
              <h3 className="text-xl lg:text-2xl font-black text-white tracking-tighter mt-2 uppercase">Outbound Saturation (7D)</h3>
            </div>
            <div className="w-2 h-2 bg-[#D4AF37] animate-pulse shadow-[0_0_20px_#D4AF37] rounded-full" />
          </div>
          <div className="h-48 lg:h-56 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataDials}>
                <defs>
                  <linearGradient id="colorDialsOwner" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="#121212" vertical={false} />
                <XAxis dataKey="name" stroke="#262626" fontSize={9} axisLine={false} tickLine={false} tick={{ fontWeight: 900 }} />
                <Tooltip 
                  cursor={{ stroke: '#D4AF37', strokeWidth: 1.5 }}
                  contentStyle={{ background: '#09090b', border: '1px solid #18181b', borderRadius: '0', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} 
                />
                <Area type="monotone" dataKey="dials" stroke="#D4AF37" fill="url(#colorDialsOwner)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group hover:border-zinc-700 transition-all">
          <div className="flex justify-between items-center mb-8 lg:mb-10 relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Economic Pulse</p>
              <h3 className="text-xl lg:text-2xl font-black text-white tracking-tighter mt-2 uppercase">Settlement Velocity (7D)</h3>
            </div>
            <div className="w-2 h-2 bg-zinc-800 rounded-full" />
          </div>
          <div className="h-48 lg:h-56 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataSales}>
                <CartesianGrid strokeDasharray="0" stroke="#121212" vertical={false} />
                <XAxis dataKey="name" stroke="#262626" fontSize={9} axisLine={false} tickLine={false} tick={{ fontWeight: 900 }} />
                <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #18181b', borderRadius: '0', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                <Bar dataKey="sales" fill="#D4AF37" shape={(props: any) => {
                  const { x, y, width, height } = props;
                  return <rect x={x} y={y} width={width} height={height} fill={props.payload.sales > 600 ? '#D4AF37' : '#18181b'} />;
                }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="group bg-black border border-zinc-900 min-h-[400px] lg:min-h-[500px] flex flex-col relative overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070" 
            className="w-full h-full object-cover opacity-[0.05] group-hover:scale-105 transition-transform duration-[20s] grayscale"
            alt="Corporate Skyline"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 lg:p-20 relative z-10">
          <div className="mb-8 lg:mb-12 flex flex-col items-center">
             <div className="w-12 lg:w-16 h-[1px] bg-[#D4AF37] mb-6 lg:mb-8 shadow-[0_0_30px_#D4AF37]" />
             {isEditing ? (
               <input 
                 className="bg-black/50 border border-[#D4AF37] text-[#D4AF37] text-center uppercase tracking-[0.6em] font-black px-4 lg:px-6 py-2 lg:py-3 text-xs lg:text-sm outline-none focus:bg-black/80 transition-all"
                 value={ownerName}
                 onChange={(e) => setOwnerName(e.target.value.toUpperCase())}
                 autoFocus
               />
             ) : (
               <p className="text-[9px] lg:text-[11px] font-black uppercase tracking-[0.4em] lg:tracking-[0.6em] text-[#D4AF37] mb-6 lg:mb-8 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">{ownerName}</p>
             )}
          </div>

          <div className="max-w-5xl w-full">
            {isEditing ? (
              <textarea 
                className="w-full bg-black/50 border border-zinc-900 text-2xl lg:text-7xl text-center uppercase font-black tracking-tighter leading-[0.85] p-6 lg:p-8 outline-none focus:bg-black/80 focus:border-[#D4AF37]/30 transition-all"
                value={quote}
                onChange={(e) => setQuote(e.target.value.toUpperCase())}
                rows={3}
              />
            ) : (
              <h2 className="text-3xl lg:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85] mb-8 lg:mb-12 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] whitespace-pre-wrap">
                "{typedText}"
              </h2>
            )}
            
            <div className="mt-8 lg:mt-16 flex justify-center gap-4 lg:gap-6">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="bg-zinc-950 border border-zinc-900 text-zinc-500 font-black text-[9px] lg:text-[10px] px-6 lg:px-10 py-4 lg:py-5 uppercase tracking-[0.2em] lg:tracking-[0.3em] hover:bg-white hover:text-black transition-all shadow-2xl"
              >
                {isEditing ? "Save Parameters" : "Edit Directives"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
