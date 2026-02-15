import React, { useState } from 'react';
import { apiFetch } from '../../api/client';
import ContactDetail from './ContactDetail';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  created: string;
  lastActivity: string;
  tags: string[];
}

interface ContactsProps {
  onOpenBeacon?: (number?: string, tab?: 'Manual Call' | 'Beacon') => void;
}

const Contacts: React.FC<ContactsProps> = ({ onOpenBeacon }) => {
  const [activeTab, setActiveTab] = useState('Contacts');
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDesignateModalOpen, setIsDesignateModalOpen] = useState(false);
  const [designatingContact, setDesignatingContact] = useState<Contact | null>(null);
  const [agents, setAgents] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    type: 'Lead',
    dnd: false,
    tags: [] as string[]
  });

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = ['Contacts', 'Smart Lists', 'Restore', 'Tasks', 'Companies', 'Manage Smart Lists'];

  React.useEffect(() => {
    fetchContacts();
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const data = await apiFetch('/api/owner/team-performance'); 
      if (Array.isArray(data)) {
        setAgents(data.map((a: any) => ({ id: a.id, name: a.name })));
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  };

  const fetchContacts = async () => {
    try {
      const data = await apiFetch('/api/owner/contacts');
      if (Array.isArray(data)) {
        setContacts(data.map((c: any) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email,
            created: c.created_at ? new Date(c.created_at).toLocaleString() : 'N/A', // basic format
            lastActivity: c.last_activity || 'N/A',
            tags: c.tags || []
        })));
      } else {
          // Fallback
         setContacts([
            { id: '1', name: 'Mario Madra', phone: '(562) 523-6254', email: 'mark2@gmail.com', created: 'Nov 30, 2025 08:41 PM', lastActivity: '2 hours ago', tags: [] },
            { id: '2', name: 'Gabriel Angel', phone: '(909) 813-2599', email: 'ank2@gmail.com', created: 'Oct 13, 2025 10:27 AM', lastActivity: '2 months ago', tags: [] },
            { id: '3', name: 'Maria Arell', phone: '(760) 263-2591', email: 'mikk@gmail.com', created: 'Aug 18, 2025 11:10 AM', lastActivity: 'N/A', tags: [] },
            { id: '4', name: 'Maria Arell', phone: '(909) 422-4000', email: 'ank@gmail.com', created: 'Aug 15, 2025 01:25 AM', lastActivity: 'N/A', tags: [] },
        ]);
      }
      setLoading(false);
    } catch (error) {
       console.error("Failed to fetch contacts", error);
       setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.phone) {
        alert("First Name and Phone are required.");
        return;
    }
    try {
      const response = await apiFetch('/api/owner/contacts', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (response) {
        setIsAddDrawerOpen(false);
        fetchContacts(); // Refresh list
        // Reset form
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            type: 'Lead',
            dnd: false,
            tags: []
        });
      }
    } catch (err) {
      console.error('Error saving contact:', err);
    }
  };

  if (selectedContact) {
    return <ContactDetail contact={selectedContact} onBack={() => setSelectedContact(null)} />;
  }

  return (
    <div className="flex flex-col h-full animate-fadeIn font-display text-zinc-300">
      {/* Tab Navigation */}
      <div className="flex items-center gap-6 border-b border-zinc-900 mb-6 overflow-x-auto custom-scroll">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[11px] uppercase tracking-[0.2em] font-black transition-all whitespace-nowrap ${
              activeTab === tab ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-zinc-500 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="p-2 text-zinc-500 hover:text-white transition-colors cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
          <button 
            onClick={() => setIsAddDrawerOpen(true)}
            className="bg-[#D4AF37] hover:bg-white text-black p-2 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 border border-zinc-800 bg-zinc-950 text-[10px] uppercase font-black tracking-widest hover:border-zinc-600 transition-all">
              Columns
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>
          <div className="relative flex-1 lg:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
            <input 
              type="text" 
              placeholder="QUICK SEARCH..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white pl-10 pr-4 py-2 text-[10px] uppercase tracking-widest font-black focus:outline-none focus:border-[#D4AF37]/50 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] uppercase font-black tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all">
            More Filters
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9v7l4 2v-9L22 3z"/></svg>
          </button>
        </div>
      </div>

      {/* Pagination Info Top */}
      <div className="flex justify-between items-center mb-2 px-4">
        <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Total {filteredContacts.length} records, 1 of 1 Pages</p>
        <div className="flex items-center gap-4">
           <span className="text-[10px] text-zinc-400 font-black">{"< 1 / 1 >"}</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-zinc-950 border border-zinc-900 overflow-hidden relative shadow-2xl">
        <div className="overflow-x-auto h-full custom-scroll">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 bg-zinc-950 z-10">
              <tr className="border-b border-zinc-900 bg-zinc-950">
                <th className="px-6 py-4 w-10">
                  <input type="checkbox" className="w-4 h-4 bg-black border-zinc-800 text-[#D4AF37] rounded-none" />
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-zinc-500 font-black">Name</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-zinc-500 font-black">Phone</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-zinc-500 font-black">Email</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-zinc-500 font-black">Created</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-zinc-500 font-black">Last Activity</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-zinc-500 font-black">Tags</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#D4AF37] font-black text-right">Commands</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50">
              {filteredContacts.map((contact) => (
                <tr 
                  key={contact.id} 
                  className="hover:bg-zinc-900/30 transition-colors group cursor-pointer"
                  onClick={() => setSelectedContact(contact)}
                >
                  <td className="px-6 py-4">
                    <input type="checkbox" className="w-4 h-4 bg-black border-zinc-800 text-[#D4AF37] rounded-none" onClick={(e) => e.stopPropagation()} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-black text-white uppercase overflow-hidden">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-[11px] lg:text-xs font-black text-white uppercase tracking-tight group-hover:text-[#D4AF37] transition-colors">{contact.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[11px] lg:text-xs font-black text-zinc-400 group-hover:text-white transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      {contact.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[11px] lg:text-xs font-black text-zinc-400 group-hover:text-white transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      {contact.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{contact.created}</p>
                  </td>
                  <td className="px-6 py-4">
                    {contact.lastActivity !== 'N/A' ? (
                      <div className="flex items-center gap-2 text-[10px] text-green-500 font-black uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        {contact.lastActivity}
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-700 font-black uppercase">---</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-[8px] font-black uppercase text-zinc-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onOpenBeacon?.(contact.phone, 'Manual Call'); 
                        }}
                        className="p-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all group/btn"
                        title="INITIATE SECURE CALL"
                       >
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover/btn:scale-110 transition-transform"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                       </button>
                       <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setDesignatingContact(contact);
                          setIsDesignateModalOpen(true);
                        }}
                        className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-all group/btn"
                        title="DESIGNATE TO UNIT"
                       >
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover/btn:scale-110 transition-transform"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M16 11h6"/></svg>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Info Bottom */}
      <div className="flex justify-between items-center mt-4 px-4">
        <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Total {filteredContacts.length} records, 1 of 1 Pages</p>
      </div>

      {/* Add Contact Drawer */}
      {isAddDrawerOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-fadeIn"
            onClick={() => setIsAddDrawerOpen(false)}
          />
          <div className="fixed top-0 right-0 h-screen w-full max-w-lg bg-zinc-950 border-l border-zinc-900 z-[101] animate-slideInRight shadow-2xl flex flex-col font-display overflow-y-auto custom-scroll">
            <div className="p-6 border-b border-zinc-900 flex justify-between items-center sticky top-0 bg-zinc-950 z-10">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Authorized Provisioning</h2>
              <button 
                onClick={() => setIsAddDrawerOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="p-8 space-y-8 flex-1">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">First Name*</label>
                  <input 
                    type="text" 
                    placeholder="Enter First Name" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white p-3 text-xs uppercase tracking-widest font-black focus:outline-none focus:border-[#D4AF37]/50 transition-all rounded-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Last Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter Last Name" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white p-3 text-xs uppercase tracking-widest font-black focus:outline-none focus:border-[#D4AF37]/50 transition-all rounded-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Email</label>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Please enter email address" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-white p-3 text-xs tracking-widest font-black focus:outline-none focus:border-[#D4AF37]/50 transition-all rounded-none" 
                  />
                  <button className="p-3 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Phone*</label>
                <input 
                  type="text" 
                  placeholder="Enter phone number" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white p-3 text-xs tracking-widest font-black focus:outline-none focus:border-[#D4AF37]/50 transition-all rounded-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Contact Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 p-3 text-xs font-black uppercase focus:outline-none focus:border-[#D4AF37]/50 rounded-none"
                >
                  <option value="Lead">Lead</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>

              <div className="pt-6 border-t border-zinc-900">
                 <label className="flex items-center gap-3 group cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.dnd}
                      onChange={(e) => setFormData({ ...formData, dnd: e.target.checked })}
                      className="w-4 h-4 bg-zinc-900 border-zinc-800 text-[#D4AF37] rounded-none focus:ring-0" 
                    />
                    <span className="text-[10px] font-black text-zinc-400 group-hover:text-white uppercase tracking-widest transition-colors">DND Status</span>
                 </label>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-900 bg-zinc-950 sticky bottom-0 z-10 flex flex-col sm:flex-row gap-3">
              <button className="text-[10px] text-zinc-500 hover:text-white uppercase font-black tracking-widest py-3 px-6 transition-colors">
                Save and Add Another
              </button>
              <div className="flex gap-3 ml-auto">
                 <button 
                   onClick={() => setIsAddDrawerOpen(false)}
                   className="bg-zinc-900 border border-zinc-800 text-white text-[10px] uppercase font-black tracking-widest px-8 py-3 hover:bg-zinc-800 transition-all"
                 >
                   Cancel
                 </button>
                 <button 
                  onClick={handleSave}
                  className="bg-[#D4AF37] text-black text-[10px] uppercase font-black tracking-widest px-8 py-3 hover:bg-white transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                 >
                   Save
                 </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Designate Modal */}
      {isDesignateModalOpen && designatingContact && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsDesignateModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-zinc-950 border border-[#D4AF37]/30 p-8 shadow-2xl">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Designate Lead</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-8">Assigning: <span className="text-white">{designatingContact.name}</span></p>
            
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Select Operative</label>
                  <select className="w-full bg-black border border-zinc-900 p-4 text-xs font-black uppercase text-[#D4AF37] focus:outline-none focus:border-[#D4AF37] transition-all">
                    <option>Choose Agent...</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                  </select>
               </div>

               <div className="flex gap-4">
                  <button 
                  onClick={() => setIsDesignateModalOpen(false)}
                  className="flex-1 py-4 bg-zinc-900 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                  >
                    Abort
                  </button>
                  <button 
                  onClick={() => {
                    // Integration logic would go here
                    setIsDesignateModalOpen(false);
                    setDesignatingContact(null);
                  }}
                  className="flex-[2] py-4 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all"
                  >
                    Confirm Designation
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
