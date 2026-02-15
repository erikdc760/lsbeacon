
import React, { useState } from 'react';
import { User, TabType } from '../../types';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Dashboard from './Dashboard';
import CampaignManagement from './CampaignManagement';
import LeadDesignation from './LeadDesignation';
import PhantomMode from './PhantomMode';
import CompanyManagement from './CompanyManagement';
import NumberRegistry from './NumberRegistry';

interface PortalProps {
  user: User;
  onLogout: () => void;
}

const AdminPortal: React.FC<PortalProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <Dashboard />;
      case 'Campaign Management': return <CampaignManagement />;
      case 'Lead Designation': return <LeadDesignation />;
      case 'Phantom Mode': return <PhantomMode />;
      case 'Company Management': return <CompanyManagement />;
      case 'Number Registry': return <NumberRegistry />;
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
      />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <TopBar user={user} onLogout={onLogout} onOpenMobileMenu={() => setIsMobileMenuOpen(true)} onNavigate={setActiveTab} />
        <main className="flex-1 bg-black relative flex flex-col min-h-0 overflow-hidden">
          <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]"></div>
          <div className="flex-1 relative z-10 min-h-0 transition-all duration-500 ease-in-out p-4 overflow-hidden flex flex-col">
            <div className="animate-fadeIn flex-1 flex flex-col min-h-0">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPortal;
