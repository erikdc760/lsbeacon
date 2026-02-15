
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';

interface TopBarProps {
  user: User | null;
  onLogout: () => void;
  onOpenMobileMenu?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ user, onLogout, onOpenMobileMenu }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <header className="h-16 lg:h-20 bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-900/50 px-4 lg:px-8 flex items-center justify-between z-30 sticky top-0" style={{ WebkitBackdropFilter: 'blur(20px)', paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex items-center gap-4 lg:gap-8 relative z-50">
        {onOpenMobileMenu && (
          <button 
            onClick={onOpenMobileMenu}
            className="block lg:hidden flex items-center justify-center w-10 h-10 -ml-2 text-zinc-400 hover:text-[#D4AF37] transition-all duration-300 active:scale-95"
            aria-label="Open Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="block">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        )}
        

      </div>

      <div className="flex-1 max-w-md mx-8 hidden lg:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#D4AF37] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search across intelligence grid..." 
            className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-11 pr-4 py-2 text-[11px] uppercase tracking-widest font-black focus:outline-none focus:border-[#D4AF37]/50 focus:bg-zinc-900 transition-all rounded-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        <div className="flex items-center gap-2 border-r border-zinc-800 pr-6 mr-3 hidden sm:flex">
          <button className="p-2 text-zinc-500 hover:text-white transition-colors relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_5px_#D4AF37]"></div>
          </button>
          <button className="p-2 text-zinc-500 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-[11px] font-black text-white uppercase tracking-wider">{user?.name}</p>
            <p className="text-[9px] text-[#D4AF37] font-black uppercase tracking-widest opacity-70 mt-0.5">{user?.role?.replace('_', ' ')}</p>
          </div>
          <div className="relative group/avatar">
            <div className="absolute inset-0 bg-[#D4AF37] rounded-full blur-md opacity-0 group-hover/avatar:opacity-20 transition-opacity"></div>
            <img 
              src={user?.avatar || 'https://picsum.photos/seed/user/100/100'} 
              alt="User" 
              className="w-10 h-10 rounded-none border border-zinc-800 bg-zinc-950 object-cover group-hover:border-[#D4AF37] transition-all relative z-10 p-0.5"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-black rounded-full z-20"></div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
            title="Secure Logout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
