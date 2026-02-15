import React, { useState } from 'react';
import AutoDialer from './AutoDialer';
import Announcements from './Announcements';
import HelpTab from './HelpTab';
import { UserRole } from '../../types';

interface BeaconModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  initialNumber?: string;
  initialTab?: BeaconTab;
}

type BeaconTab = 'Announcements' | 'Beacon' | 'Live Calls' | 'Call Logs' | 'Manual Call' | 'Help';

const BeaconModal: React.FC<BeaconModalProps> = ({ 
  isOpen, 
  onClose, 
  role, 
  initialNumber = '', 
  initialTab = 'Beacon' 
}) => {
  const [activeTab, setActiveTab] = useState<BeaconTab>(initialTab);
  const [manualNumber, setManualNumber] = useState(initialNumber);

  React.useEffect(() => {
    if (isOpen) {
      if (initialNumber) setManualNumber(initialNumber);
      if (initialTab) setActiveTab(initialTab);
    }
  }, [isOpen, initialNumber, initialTab]);

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'Announcements': return <Announcements role={role} />;
      case 'Beacon': return <AutoDialer />;
      case 'Manual Call': return (
        <div className="flex flex-col items-center justify-center h-full max-w-xs mx-auto space-y-4 animate-fadeIn">
          <div className="w-full">
            <label className="block text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2 text-center">Enter Target Number</label>
            <input 
              type="text" 
              value={manualNumber}
              onChange={(e) => setManualNumber(e.target.value)}
              placeholder="+1 (000) 000-0000"
              className="w-full bg-zinc-950 border border-zinc-800 text-[#D4AF37] text-lg font-black text-center py-3 focus:outline-none focus:border-[#D4AF37] transition-all tracking-widest"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((num) => (
              <button 
                key={num}
                onClick={() => setManualNumber(prev => prev + num)}
                className="aspect-square bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm font-black text-white hover:bg-[#D4AF37] hover:text-black transition-all"
              >
                {num}
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full">
             <button 
              onClick={() => setManualNumber('')}
              className="flex-1 py-3 border border-zinc-900 text-zinc-500 font-black uppercase text-[9px] tracking-widest hover:text-white transition-all"
            >
              Clear
            </button>
            <button 
              className="flex-[2] py-3 bg-green-600 text-white font-black uppercase text-[9px] tracking-widest hover:bg-green-500 transition-all flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Initiate Call
            </button>
          </div>
        </div>
      );
      case 'Live Calls': return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 p-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="aspect-video bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <span className="text-[8px] font-black uppercase text-zinc-600">Monitor #{i}</span>
            </div>
          ))}
        </div>
      );
      case 'Call Logs': return (
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center bg-zinc-950 border border-zinc-900 p-2">
            <input className="bg-black border border-zinc-800 text-white text-[9px] p-2 w-48 uppercase font-black" placeholder="Filter..." />
          </div>
          <div className="text-center py-12 text-zinc-700 text-[9px] uppercase font-black tracking-widest">Advanced Filtering Search Grid</div>
        </div>
      );
      case 'Help': return <HelpTab role={role} />;
      default: return <AutoDialer />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 lg:p-4 md:p-3">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl h-[92vh] bg-black border border-[#D4AF37]/30 flex flex-col shadow-[0_0_50px_rgba(0,0,0,1)] animate-scaleIn">
        {/* Modal Header/Tabs */}
        <div className="bg-zinc-950 border-b border-zinc-900 flex justify-between items-center overflow-x-auto custom-scroll shrink-0">
          <div className="flex">
            {['Announcements', 'Beacon', 'Manual Call', 'Live Calls', 'Call Logs', 'Help'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as BeaconTab)}
                className={`px-3 py-2.5 text-[8px] font-black uppercase tracking-widest transition-all border-r border-zinc-900 ${
                  activeTab === tab ? 'bg-[#D4AF37] text-black shadow-[0_0_20px_#D4AF37]' : 'text-zinc-600 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button 
            onClick={onClose}
            className="px-3 py-2.5 text-zinc-600 hover:text-red-500 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 lg:p-6">
          {renderContent()}
        </div>

        {/* Modal Footer */}
        <div className="bg-zinc-950 border-t border-zinc-900 px-3 py-2 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-green-500 animate-pulse"></div>
            <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">BEACON v2.4.0</span>
          </div>
          <p className="text-[7px] font-black text-zinc-700 uppercase tracking-widest">Legacy Shield Strategic Assets</p>
        </div>
      </div>
    </div>
  );
};

export default BeaconModal;
