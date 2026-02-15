
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
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
      },
      { 
        name: 'Campaign Management', 
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/><path d="M12 22V12"/></svg>
      },
      { 
        name: 'Lead Designation', 
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 10V4a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v6"/><rect x="15" y="10" width="4" height="4"/><path d="M17 14v5"/></svg> 
      },
      { 
        name: 'Phantom Mode', 
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8 2 5 5 5 9c0 2.5.5 4.5 1.5 6.5L4 22h16l-2.5-6.5C18.5 13.5 19 11.5 19 9c0-4-3-7-7-7z"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/><path d="M8 15c1.5 1.5 6.5 1.5 8 0"/></svg>
      },
      {
        name: 'Company Management',
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-4m8 4v-4m-8-5h1m8 0h1m-9-4h1m8 0h1" /></svg>
      },
      {
        name: 'Number Registry',
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
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
          isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 w-20 lg:hover:w-72 lg:hover:delay-150'
        }`}
      >
        <div className="p-6 flex flex-col items-center gap-4 overflow-hidden border-b border-zinc-900/30">
          <div className="relative shrink-0">
            <img src="/logo.png" alt="Beacon Logo" className="w-8 h-8 object-contain relative z-10" />
            <div className="absolute inset-0 bg-[#D4AF37] blur-2xl opacity-20 scale-150"></div>
          </div>
          <div className="text-center opacity-0 group-hover/sidebar:opacity-100 transition-all duration-500 transform translate-y-2 group-hover/sidebar:translate-y-0 whitespace-nowrap">
            <h2 className="text-lg font-black tracking-tighter text-white uppercase leading-none">
              <span className="text-[#D4AF37]">BEACON</span> 
            </h2>
            <p className="text-[7px] text-zinc-600 uppercase tracking-[0.5em] mt-1.5 font-black">Strategic_Intelligence</p>
          </div>
          {onCloseMobileMenu && (
            <button 
              onClick={onCloseMobileMenu}
              className="lg:hidden absolute top-0 right-0 p-6 text-zinc-600 hover:text-white transition-colors flex items-center justify-center"
              style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        <nav className="flex-1 mt-8 px-4 group-hover/sidebar:px-6 space-y-2 overflow-y-auto custom-scroll overflow-x-hidden">
          <div className="text-[7px] lg:text-[8px] uppercase tracking-[0.5em] text-zinc-700 mb-8 font-black opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-500 whitespace-nowrap px-2">Operational Grid</div>
          
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => handleTabClick(tab.name)}
              className={`w-full text-left h-11 px-3.5 rounded-none transition-all duration-300 relative group/item flex items-center gap-4 overflow-hidden ${
                activeTab === tab.name 
                  ? 'text-[#D4AF37] bg-white/[0.03]' 
                  : 'text-zinc-500 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              {activeTab === tab.name && (
                <div className="absolute left-0 top-0 w-[2px] h-full bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)] animate-pulse"></div>
              )}
              <div className={`shrink-0 transition-transform duration-300 ${activeTab === tab.name ? 'scale-110' : 'group-hover/item:scale-110'}`}>
                {tab.icon}
              </div>
              <span className="uppercase text-[9px] font-black tracking-[0.2em] transition-all duration-500 opacity-0 group-hover/sidebar:opacity-100 transform translate-x-2 group-hover/sidebar:translate-x-0 whitespace-nowrap">
                {tab.name}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-zinc-900/30 opacity-0 group-hover/sidebar:opacity-100 transition-all duration-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-black text-[#D4AF37]">V2</div>
            <div className="flex flex-col">
              <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest leading-none">System</span>
              <span className="text-[7px] text-zinc-700 font-black uppercase tracking-widest mt-1">Encrypted_v2.4.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
