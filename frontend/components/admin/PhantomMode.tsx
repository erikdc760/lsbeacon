
import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api';

const PhantomMode: React.FC = () => {
  const [stats, setStats] = useState({ liveAgents: 0, dailyDials: 0 });
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await adminApi.getCompanies();
        const list = (data?.companies || []).map((c: any) => ({ id: c.id, name: c.name }));
        setCompanies(list);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to load companies.');
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const data = await adminApi.getPhantomStats(selectedCompanyId || undefined);
        if (data) setStats(data);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to load phantom metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedCompanyId]);

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-6">
      <div className="w-24 h-24 border border-[#D4AF37] flex items-center justify-center rounded-none animate-pulse">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
          <path d="M12 2C7.58 2 4 5.58 4 10V22L12 18L20 22V10C20 5.58 16.42 2 12 2Z" />
          <circle cx="9" cy="10" r="1" />
          <circle cx="15" cy="10" r="1" />
        </svg>
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-display text-[#D4AF37] uppercase tracking-widest mb-2">Phantom Mode Active</h1>
        <p className="text-zinc-600 text-xs uppercase tracking-widest">Visibility into all company operations (Read-Only)</p>
      </div>
      
      <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-sm max-w-lg w-full mt-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Select Company Instance</p>
            <select
              className="bg-black border border-zinc-800 text-[#D4AF37] text-xs px-2 py-1 focus:outline-none"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
            >
              <option value="">All Companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 p-4 border border-zinc-800 rounded-sm">
              <p className="text-[9px] text-zinc-600 uppercase font-bold mb-1">Live Agents</p>
              <p className="text-xl font-bold text-white">{stats.liveAgents}</p>
            </div>
            <div className="bg-zinc-900/50 p-4 border border-zinc-800 rounded-sm">
              <p className="text-[9px] text-zinc-600 uppercase font-bold mb-1">Daily Dials</p>
              <p className="text-xl font-bold text-white">{stats.dailyDials.toLocaleString()}</p>
            </div>
          </div>

          {loading && (
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Loading metrics...</p>
          )}
          {errorMessage && (
            <p className="text-[9px] text-red-500 uppercase tracking-widest">{errorMessage}</p>
          )}

          <button className="w-full bg-[#D4AF37]/10 border border-[#D4AF37]/50 text-[#D4AF37] text-[10px] uppercase font-bold tracking-widest py-3 rounded-sm hover:bg-[#D4AF37]/20 transition-all">
            Enter Stealth View
          </button>
        </div>
      </div>
      
      <p className="text-[9px] text-zinc-700 uppercase max-w-xs text-center leading-relaxed">
        Warning: Action in phantom mode is purely observational. All system metrics will remain unaffected by your presence.
      </p>
    </div>
  );
};

export default PhantomMode;
