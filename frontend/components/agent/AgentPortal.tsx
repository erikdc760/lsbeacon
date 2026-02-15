import React, { useState } from 'react';
import { User, TabType, UserRole } from '../../types';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Dashboard from './Dashboard';
import Announcements from './Announcements';
import Contacts from './Contacts';
import Conversations from './Conversations';
import PainTracker from './PainTracker';
import PersonalTracker from './PersonalTracker';
import CompanyArena from './CompanyArena';
import HelpTab from './HelpTab';
import BeaconModal from './BeaconModal';
import SalesAI from './sales-AI';

interface PortalProps {
  user: User;
  onLogout: () => void;
}

const AgentPortal: React.FC<PortalProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBeaconOpen, setIsBeaconOpen] = useState(false);

  const renderContent = () => {
    const props = { role: user.role };
    switch (activeTab) {
      case 'Dashboard': return <Dashboard />;
      case 'Announcements': return <Announcements {...props} />;
      case 'Contacts': return <Contacts />;
      case 'Conversations': return <Conversations />;
      case 'Pain Tracker': return <PainTracker {...props} />;
      case 'Personal Tracker': return <PersonalTracker />;
      case 'Company Arena': return <CompanyArena />;
      case 'Company Help Tab': return <HelpTab {...props} />;
      case 'Pathfinder': return <SalesAI />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden selection:bg-[#D4AF37] selection:text-black font-display">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        role={user.role} 
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        onOpenBeacon={() => setIsBeaconOpen(true)}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <TopBar user={user} onLogout={onLogout} onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 bg-black relative flex flex-col min-h-0 overflow-hidden">
          <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]"></div>
          <div className={`flex-1 relative z-10 min-h-0 transition-all duration-500 ease-in-out flex flex-col ${activeTab === 'Dashboard' ? '' : activeTab === 'Contacts' ? 'p-2' : 'p-2 pb-16 lg:p-4 overflow-y-auto custom-scroll'}`}>
            <div className={`animate-fadeIn flex-1 flex flex-col min-h-0 ${activeTab === 'Dashboard' || activeTab === 'Contacts' ? '' : ''}`}>
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      <BeaconModal 
        isOpen={isBeaconOpen} 
        onClose={() => setIsBeaconOpen(false)} 
        role={user.role}
      />
    </div>
  );
};

export default AgentPortal;
