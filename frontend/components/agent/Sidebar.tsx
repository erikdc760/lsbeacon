import React from 'react';
import { UserRole, TabType } from '../../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  role: UserRole;
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
  onOpenBeacon?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, role, isMobileMenuOpen, onCloseMobileMenu, onOpenBeacon }) => {
  const getTabs = (): { name: TabType; icon: React.ReactNode }[] => {
    return [
      { 
        name: 'Dashboard', 
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> 
      },
      { 
        name: 'Announcements', 
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> 
      },
      { 
        name: 'Contacts', 
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> 
      },
      { 
        name: 'Conversations', 
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /><path d="M8 12h.01" /><path d="M12 12h.01" /><path d="M16 12h.01" /></svg> 
      },
      { 
        name: 'Pain Tracker', 
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2v4" /><path d="M12 18v4" /><path d="M2 12h4" /><path d="M18 12h4" /><circle cx="12" cy="12" r="3" /></svg> 
      },
      { 
        name: 'Personal Tracker', 
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 12L2 9Z" /><path d="M11 3 8 9l3 12 3-12-3-6Z" /><path d="M2 9h20" /></svg> 
      },
      { 
        name: 'Company Arena', 
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> 
      },
      { 
        name: 'Company Help Tab', 
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> 
      },

      // ✅ NEW TAB: Pathfinder (tiny globe icon)
      {
        name: 'Pathfinder',
        icon: (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a14 14 0 0 1 0 20" />
            <path d="M12 2a14 14 0 0 0 0 20" />
          </svg>
        )
      }
    ];
  };

  const tabs = getTabs();

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobileMenu}
        />
      )}
      
      <aside 
        className={`fixed lg:relative inset-y-0 left-0 bg-[#050505] border-r border-zinc-900/50 flex flex-col z-50 font-display transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group/sidebar ${
          isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 w-16 lg:hover:w-64 lg:hover:delay-150'
        }`}
      >
        <div className="p-4 flex flex-col items-center gap-3 overflow-hidden border-b border-zinc-900/30">
          <div className="relative shrink-0">
            <img src="/logo.png" alt="Beacon Logo" className="w-6 h-6 object-contain relative z-10" />
            <div className="absolute inset-0 bg-[#D4AF37] blur-2xl opacity-20 scale-150"></div>
          </div>
          <div className="text-center opacity-0 group-hover/sidebar:opacity-100 transition-all duration-500 transform translate-y-2 group-hover/sidebar:translate-y-0 whitespace-nowrap">
            <h2 className="text-base font-black tracking-tighter text-white uppercase leading-none">
              <span className="text-[#D4AF37]">BEACON</span> 
            </h2>
            <p className="text-[6px] text-zinc-600 uppercase tracking-[0.5em] mt-1 font-black">Strategic_Intelligence</p>
          </div>
          {onCloseMobileMenu && (
            <button 
              onClick={onCloseMobileMenu}
              className="lg:hidden absolute top-0 right-0 p-4 text-zinc-600 hover:text-white transition-colors flex items-center justify-center"
              style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        <nav className="flex-1 mt-4 px-3 group-hover/sidebar:px-4 space-y-1 overflow-y-auto custom-scroll overflow-x-hidden">
          <div className="text-[7px] uppercase tracking-[0.5em] text-zinc-700 mb-4 font-black opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-500 whitespace-nowrap px-2">Operational Grid</div>
          
          <button
            onClick={onOpenBeacon}
            className="w-full text-left relative h-12 mb-6 group/beacon overflow-hidden rounded-none transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-transparent opacity-0 group-hover/beacon:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 border border-[#D4AF37]/10 group-hover/beacon:border-[#D4AF37]/30 transition-colors"></div>
            <div className="absolute left-0 top-0 w-[1px] h-full bg-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
            
            <div className="flex items-center gap-3 px-3 relative z-10 h-full">
              <div className="shrink-0 flex items-center justify-center">
                <div className="relative">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 transition-transform duration-500 group-hover/beacon:scale-110">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    <circle cx="12" cy="12" r="3" className="animate-ping opacity-20" fill="#D4AF37"/>
                  </svg>
                  <div className="absolute inset-0 bg-[#D4AF37] blur-lg opacity-0 group-hover/beacon:opacity-20 transition-opacity"></div>
                </div>
              </div>
              <div className="flex flex-col opacity-0 group-hover/sidebar:opacity-100 transition-all duration-500 transform translate-x-4 group-hover/sidebar:translate-x-0">
                <span className="text-[10px] font-black text-white tracking-[0.25em] uppercase leading-none">BEACON OPS</span>
                <span className="text-[5px] text-[#D4AF37] font-black tracking-[0.4em] uppercase mt-1 opacity-60">Strategic_Uplink</span>
              </div>
            </div>
            
            {/* Enterprise scan effect */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent -translate-y-full group-hover/beacon:animate-scan"></div>
          </button>

          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => handleTabClick(tab.name)}
              className={`w-full text-left h-9 px-3 rounded-none transition-all duration-300 relative group/item flex items-center gap-3 overflow-hidden ${
                activeTab === tab.name 
                  ? 'text-[#D4AF37] bg-white/[0.03]' 
                  : 'text-zinc-500 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              {activeTab === tab.name && (
                <div className="absolute left-0 top-0 w-[2.5px] h-full bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)] animate-pulse"></div>
              )}
              <div className={`shrink-0 transition-transform duration-300 ${activeTab === tab.name ? 'scale-110' : 'group-hover/item:scale-110'}`}>
                {tab.icon}
              </div>
              <span className="uppercase text-[8px] font-black tracking-[0.2em] transition-all duration-500 opacity-0 group-hover/sidebar:opacity-100 transform translate-x-2 group-hover/sidebar:translate-x-0 whitespace-nowrap">
                {tab.name}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-900/30 opacity-0 group-hover/sidebar:opacity-100 transition-all duration-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[9px] font-black text-[#D4AF37]">V2</div>
            <div className="flex flex-col">
              <span className="text-[7px] text-zinc-500 font-black uppercase tracking-widest leading-none">System</span>
              <span className="text-[6px] text-zinc-700 font-black uppercase tracking-widest mt-0.5">Encrypted_v2.4.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
