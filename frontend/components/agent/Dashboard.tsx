
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiFetch } from '../../api/client';


interface ChartData {
  name: string;
  sales?: number;
  dials?: number;
}

const Dashboard: React.FC = () => {
  const [typedText, setTypedText] = useState("");
  const [dataSales, setDataSales] = useState<ChartData[]>([]);
  const [dataDials, setDataDials] = useState<ChartData[]>([]);
  
  const fullText = "WHEN THE GOING GETS TOUGH, THE TOUGH GETS GOING.";
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 50);

    const fetchData = async () => {
      try {
        const data = await apiFetch('/api/agent/dashboard');
        if (data.sales) setDataSales(data.sales);
        if (data.dials) setDataDials(data.dials);
      } catch (err) {
        console.error(err);
        setDataSales([{ name: '01/06', sales: 400 }, { name: '01/07', sales: 700 }]);
        setDataDials([{ name: '01/06', dials: 200 }, { name: '01/07', dials: 450 }]);
      }
    }
    fetchData();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 lg:space-y-6 animate-fadeIn font-display h-full overflow-y-auto custom-scroll p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-900/50 p-4 lg:p-6 rounded-none hover:border-[#D4AF37]/40 transition-all duration-500 group overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[#D4AF37]/5">
          <div className="flex justify-between items-center mb-4 lg:mb-6 relative z-10">
            <div>
              <p className="text-[7px] lg:text-[8px] font-black uppercase tracking-[0.4em] text-[#D4AF37]/70">Performance Metrics</p>
              <h3 className="text-lg lg:text-xl font-black text-white tracking-tighter mt-1 uppercase">Company Dials (7D)</h3>
            </div>
            <div className="w-1.5 h-1.5 bg-[#D4AF37] animate-pulse shadow-[0_0_20px_#D4AF37] rounded-full"></div>
          </div>
          <div className="h-32 lg:h-44 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataDials}>
                <defs>
                  <linearGradient id="colorDials" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="#121212" vertical={false} />
                <XAxis dataKey="name" stroke="#262626" fontSize={8} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ stroke: '#D4AF37', strokeWidth: 1.5 }}
                  contentStyle={{ background: '#050505', border: '1px solid #1f1f1f', borderRadius: '0', fontSize: '8px', fontWeight: '900', textTransform: 'uppercase' }} 
                />
                <Area type="monotone" dataKey="dials" stroke="#D4AF37" fill="url(#colorDials)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-900/50 p-4 lg:p-6 rounded-none hover:border-white/20 transition-all duration-500 group overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center mb-4 lg:mb-6 relative z-10">
            <div>
              <p className="text-[7px] lg:text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600">Revenue Cycle</p>
              <h3 className="text-lg lg:text-xl font-black text-white tracking-tighter mt-1 uppercase">Company ALP (7D)</h3>
            </div>
            <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full"></div>
          </div>
          <div className="h-32 lg:h-44 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataSales}>
                <CartesianGrid strokeDasharray="0" stroke="#121212" vertical={false} />
                <XAxis dataKey="name" stroke="#262626" fontSize={8} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#050505', border: '1px solid #1f1f1f', borderRadius: '0', fontSize: '8px', fontWeight: '900', textTransform: 'uppercase' }} />
                <Bar dataKey="sales" fill="#D4AF37" shape={(props: any) => {
                  const { x, y, width, height } = props;
                  return <rect x={x} y={y} width={width} height={height} fill={props.payload.sales > 600 ? '#D4AF37' : '#1a1a1a'} />;
                }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="group bg-black border border-zinc-900/50 min-h-[300px] lg:min-h-[400px] flex flex-col relative overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] rounded-none">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2070" 
            className="w-full h-full object-cover opacity-[0.05] group-hover:scale-105 transition-transform duration-[20s] grayscale"
            alt="Corporate Core"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20"></div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 lg:p-12 relative z-10">
          <div className="mb-6 lg:mb-10 flex flex-col items-center">
             <div className="w-10 lg:w-14 h-[1px] bg-[#D4AF37] mb-4 lg:mb-6 shadow-[0_0_30px_#D4AF37]"></div>
             <p className="text-[7px] lg:text-[9px] font-black uppercase tracking-[0.6em] text-[#D4AF37] mb-4 lg:mb-6 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">COMPANY OWNER NAME</p>
          </div>

          <div className="max-w-4xl w-full">
            <h2 className="text-2xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-[0.85] mb-4 lg:mb-6 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              "{typedText}"
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
