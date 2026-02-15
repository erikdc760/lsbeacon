
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, TabType } from '../../types';

interface SearchItem {
  label: string;
  tab: TabType;
  keywords: string[];
}

const searchableItems: SearchItem[] = [
  { label: 'Dashboard', tab: 'Dashboard', keywords: ['dashboard', 'home', 'overview', 'command', 'intelligence', 'stats', 'dials', 'alp'] },
  { label: 'Campaign Management', tab: 'Campaign Management', keywords: ['campaign', 'campaigns', 'management', 'marketing'] },
  { label: 'Lead Designation', tab: 'Lead Designation', keywords: ['lead', 'leads', 'designation', 'contacts'] },
  { label: 'Phantom Mode', tab: 'Phantom Mode', keywords: ['phantom', 'mode', 'stealth', 'hidden'] },
  { label: 'Company Management', tab: 'Company Management', keywords: ['company', 'companies', 'management', 'entities', 'organization'] },
];

interface TopBarProps {
  user: User | null;
  onLogout: () => void;
  onOpenMobileMenu?: () => void;
  onNavigate?: (tab: TabType) => void;
}

const TopBar: React.FC<TopBarProps> = ({ user, onLogout, onOpenMobileMenu, onNavigate }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const filtered = searchableItems.filter(item =>
      item.label.toLowerCase().includes(lowerQuery) ||
      item.keywords.some(kw => kw.includes(lowerQuery))
    );
    setSearchResults(filtered);
    setShowResults(true);
  };

  const handleSelectResult = (item: SearchItem) => {
    if (onNavigate) {
      onNavigate(item.tab);
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
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

      <div className="flex-1 max-w-md mx-8 hidden lg:block" ref={searchRef}>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#D4AF37] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search dashboard sections..." 
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery && setShowResults(true)}
            className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-11 pr-4 py-2 text-[11px] uppercase tracking-widest font-black focus:outline-none focus:border-[#D4AF37]/50 focus:bg-zinc-900 transition-all rounded-none"
          />
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 shadow-2xl z-50 max-h-64 overflow-y-auto">
              {searchResults.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectResult(item)}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-900 transition-colors border-b border-zinc-900 last:border-0 flex items-center gap-3"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                  <span className="text-[10px] text-white uppercase tracking-widest font-black">{item.label}</span>
                </button>
              ))}
            </div>
          )}
          {showResults && searchQuery && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 shadow-2xl z-50 px-4 py-3">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">No results found</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
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
