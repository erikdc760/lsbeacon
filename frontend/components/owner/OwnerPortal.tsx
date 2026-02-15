
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
import LeadDesignation from './LeadDesignation';
import HelpTab from './HelpTab';
import TeamManagement from './TeamManagement';
import LiveCalls from './LiveCalls';
import TeamPerformance from './TeamPerformance';
import BeaconModal from '../agent/BeaconModal';

interface PortalProps {
  user: User;
  onLogout: () => void;
}

const OwnerPortal: React.FC<PortalProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBeaconOpen, setIsBeaconOpen] = useState(false);
  const [beaconInitialNumber, setBeaconInitialNumber] = useState<string | undefined>();
  const [beaconInitialTab, setBeaconInitialTab] = useState<'Manual Call' | 'Beacon' | undefined>();

  const handleOpenBeacon = (number?: string, tab?: 'Manual Call' | 'Beacon') => {
    setBeaconInitialNumber(number);
    setBeaconInitialTab(tab);
    setIsBeaconOpen(true);
  };

  const renderContent = () => {
    const props = { role: user.role };
    switch (activeTab) {
      case 'Dashboard': return <Dashboard />;
      case 'Announcements': return <Announcements {...props} />;
      case 'Contacts': return <Contacts onOpenBeacon={handleOpenBeacon} />;
      case 'Conversations': return <Conversations />;
      case 'Pain Tracker': return <PainTracker {...props} />;
      case 'Personal Tracker': return <PersonalTracker />;
      case 'Company Arena': return <CompanyArena />;
      case 'Lead Designation': return <LeadDesignation />;
      case 'Company Help Tab': return <HelpTab {...props} />;
      case 'Team Management': return <TeamManagement />;
      case 'Live Calls': return <LiveCalls />;
      case 'Team Performance': return <TeamPerformance />;
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
        onOpenBeacon={() => handleOpenBeacon()}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <TopBar user={user} onLogout={onLogout} onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 bg-black relative flex flex-col min-h-0 overflow-hidden">
          <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]"></div>
          <div className={`flex-1 relative z-10 min-h-0 transition-all duration-500 ease-in-out flex flex-col ${activeTab === 'Dashboard' ? '' : activeTab === 'Contacts' ? 'p-4' : 'p-4 pb-20 lg:p-12 overflow-y-auto custom-scroll'}`}>
            <div className="animate-fadeIn flex-1 flex flex-col min-h-0">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      <BeaconModal 
        isOpen={isBeaconOpen} 
        onClose={() => setIsBeaconOpen(false)} 
        role={user.role}
        initialNumber={beaconInitialNumber}
        initialTab={beaconInitialTab}
      />
    </div>
  );
};

export default OwnerPortal;
