import React, { useState } from 'react';
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

const Contacts: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Contacts');
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['Contacts', 'Smart Lists', 'Restore', 'Tasks', 'Companies', 'Manage Smart Lists'];

  const contacts: Contact[] = [
    { id: '1', name: 'Mario Madra', phone: '(562) 523-6254', email: 'mark2@gmail.com', created: 'Nov 30, 2025 08:41 PM', lastActivity: '2 hours ago', tags: [] },
    { id: '2', name: 'Gabriel Angel', phone: '(909) 813-2599', email: 'ank2@gmail.com', created: 'Oct 13, 2025 10:27 AM', lastActivity: '2 months ago', tags: [] },
    { id: '3', name: 'Maria Arell', phone: '(760) 263-2591', email: 'mikk@gmail.com', created: 'Aug 18, 2025 11:10 AM', lastActivity: 'N/A', tags: [] },
    { id: '4', name: 'Maria Arell', phone: '(909) 422-4000', email: 'ank@gmail.com', created: 'Aug 15, 2025 01:25 AM', lastActivity: 'N/A', tags: [] },
  ];
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  if (selectedContact) {
    return <ContactDetail contact={selectedContact} onBack={() => setSelectedContact(null)} />;
  }

  return (
    <div className="flex flex-col h-full animate-fadeIn font-display text-zinc-300">
      {/* Tab Navigation */}
      <div className="flex items-center gap-4 border-b border-zinc-900 mb-4 overflow-x-auto custom-scroll">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-[9.5px] uppercase tracking-[0.2em] font-black transition-all whitespace-nowrap ${
              activeTab === tab ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-zinc-500 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-3 mb-4">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="p-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
          <button 
            onClick={() => setIsAddDrawerOpen(true)}
            className="bg-[#D4AF37] hover:bg-white text-black p-1.5 transition-all shadow-[0_0_10px_rgba(212,175,55,0.2)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 bg-zinc-950 text-[9px] uppercase font-black tracking-widest hover:border-zinc-600 transition-all">
              Columns
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>
          <div className="relative flex-1 lg:w-56">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-700">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
            <input 
              type="text" 
              placeholder="SEARCH..." 
              className="w-full bg-zinc-950 border border-zinc-800 text-white pl-8 pr-3 py-1.5 text-[9px] uppercase tracking-widest font-black focus:outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-zinc-800"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[9px] uppercase font-black tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all">
            Filters
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 3H2l8 9v7l4 2v-9L22 3z"/></svg>
          </button>
        </div>
      </div>

      {/* Pagination Info Top */}
      <div className="flex justify-between items-center mb-1.5 px-2">
        <p className="text-[8.5px] text-zinc-600 uppercase font-black tracking-widest">Total {contacts.length} records • 1 Page</p>
        <div className="flex items-center gap-3">
           <span className="text-[8.5px] text-zinc-500 font-black">{"< 1 / 1 >"}</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-zinc-950 border border-zinc-900 overflow-hidden relative shadow-2xl">
        <div className="overflow-x-auto h-full custom-scroll">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 bg-zinc-950 z-10 border-b border-zinc-900">
              <tr className="bg-zinc-950/50">
                <th className="px-4 py-2.5 w-8">
                  <input type="checkbox" className="w-3 h-3 bg-black border-zinc-800 text-[#D4AF37] rounded-none opacity-50" />
                </th>
                <th className="px-4 py-2.5 text-[8.5px] uppercase tracking-widest text-zinc-600 font-black">Name</th>
                <th className="px-4 py-2.5 text-[8.5px] uppercase tracking-widest text-zinc-600 font-black">Phone</th>
                <th className="px-4 py-2.5 text-[8.5px] uppercase tracking-widest text-zinc-600 font-black">Email</th>
                <th className="px-4 py-2.5 text-[8.5px] uppercase tracking-widest text-zinc-600 font-black">Created</th>
                <th className="px-4 py-2.5 text-[8.5px] uppercase tracking-widest text-zinc-600 font-black">Activity</th>
                <th className="px-4 py-2.5 text-[8.5px] uppercase tracking-widest text-zinc-600 font-black">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/40">
              {contacts.map((contact) => (
                <tr 
                    key={contact.id} 
                    className="hover:bg-zinc-900/30 transition-colors group cursor-pointer"
                    onClick={() => setSelectedContact(contact)}
                >
                  <td className="px-4 py-2.5">
                    <input type="checkbox" className="w-3 h-3 bg-black border-zinc-800 text-[#D4AF37] rounded-none opacity-30" />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[9px] font-black text-[#D4AF37] uppercase overflow-hidden group-hover:border-[#D4AF37]/40">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-[10px] font-black text-zinc-300 uppercase tracking-tight group-hover:text-white transition-colors">{contact.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-700 group-hover:text-blue-500"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      {contact.phone}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-700 group-hover:text-blue-500"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      {contact.email}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{contact.created}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    {contact.lastActivity !== 'N/A' ? (
                      <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                        <div className="w-1 h-1 rounded-full bg-green-500"></div>
                        {contact.lastActivity}
                      </div>
                    ) : (
                      <span className="text-[9px] text-zinc-800 font-black uppercase">None</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag, i) => (
                        <span key={i} className="px-1 py-0.5 bg-zinc-900 border border-zinc-800 text-[7px] font-black uppercase text-zinc-600 group-hover:text-zinc-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Info Bottom */}
      <div className="flex justify-between items-center mt-3 px-2">
        <p className="text-[8.5px] text-zinc-700 uppercase font-black tracking-widest">Total {contacts.length} records</p>
      </div>

      {/* Add Contact Drawer */}
      {isAddDrawerOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-fadeIn"
            onClick={() => setIsAddDrawerOpen(false)}
          />
          <div className="fixed top-0 right-0 h-screen w-full max-w-md bg-zinc-950 border-l border-zinc-900 z-[101] animate-slideInRight shadow-2xl flex flex-col font-display overflow-y-auto custom-scroll">
            <div className="p-4 border-b border-zinc-900 flex justify-between items-center sticky top-0 bg-zinc-950 z-10">
              <h2 className="text-lg font-black text-white uppercase tracking-tighter">Add Contact</h2>
              <button 
                onClick={() => setIsAddDrawerOpen(false)}
                className="text-zinc-600 hover:text-white transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="p-5 space-y-6 flex-1">
              {/* Contact Image Placeholder */}
              <div className="flex flex-col items-center">
                 <div className="w-20 h-20 rounded-none border-2 border-dashed border-zinc-900 bg-zinc-950 flex flex-col items-center justify-center group cursor-pointer hover:border-[#D4AF37]/50 transition-all">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-800 group-hover:text-[#D4AF37] transition-colors"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span className="text-[8px] text-zinc-700 uppercase font-black mt-2">Contact Image</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">First Name*</label>
                  <input type="text" placeholder="First Name" className="w-full bg-zinc-900 border border-zinc-800 text-white p-2 text-[10px] uppercase tracking-widest font-black focus:outline-none focus:border-[#D4AF37]/50 transition-all rounded-none placeholder:text-zinc-800" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Last Name</label>
                  <input type="text" placeholder="Last Name" className="w-full bg-zinc-900 border border-zinc-800 text-white p-2 text-[10px] uppercase tracking-widest font-black focus:outline-none focus:border-[#D4AF37]/50 transition-all rounded-none placeholder:text-zinc-800" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Email</label>
                <div className="flex gap-2">
                  <input type="email" placeholder="Enter email" className="flex-1 bg-zinc-900 border border-zinc-800 text-white p-2 text-[10px] tracking-widest font-black focus:outline-none focus:border-[#D4AF37]/50 transition-all rounded-none placeholder:text-zinc-800" />
                  <button className="p-2 border border-zinc-800 text-zinc-600 hover:text-white hover:border-zinc-600 transition-all">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Phone</label>
                <div className="flex gap-2">
                  <select className="w-20 bg-zinc-900 border border-zinc-800 text-zinc-400 p-2 text-[10px] font-black uppercase focus:outline-none focus:border-[#D4AF37]/50 rounded-none">
                    <option>Select</option>
                    <option>Mobile</option>
                    <option>Home</option>
                    <option>Work</option>
                  </select>
                  <input type="text" placeholder="Enter phone" className="flex-1 bg-zinc-900 border border-zinc-800 text-white p-2 text-[10px] tracking-widest font-black focus:outline-none focus:border-[#D4AF37]/50 transition-all rounded-none placeholder:text-zinc-800" />
                  <button className="p-2 border border-zinc-800 text-zinc-600 hover:text-white hover:border-zinc-600 transition-all">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Contact Type</label>
                <select className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 p-2 text-[10px] font-black uppercase focus:outline-none focus:border-[#D4AF37]/50 rounded-none">
                  <option>Select an option</option>
                  <option>Lead</option>
                  <option>Customer</option>
                  <option>Affiliate</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Time Zone</label>
                <select className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 p-2 text-[10px] font-black uppercase focus:outline-none focus:border-[#D4AF37]/50 rounded-none">
                  <option>Select an option</option>
                  <option>EST</option>
                  <option>CST</option>
                  <option>MST</option>
                  <option>PST</option>
                </select>
              </div>

              <div className="space-y-4 pt-3 border-t border-zinc-900">
                 <label className="flex items-center gap-2.5 group cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5 bg-zinc-900 border-zinc-800 text-[#D4AF37] rounded-none focus:ring-0" />
                    <span className="text-[9px] font-black text-zinc-400 group-hover:text-white uppercase tracking-widest transition-colors">DND All Channels</span>
                 </label>

                 <div className="space-y-2">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Channels</p>
                    <div className="grid grid-cols-2 gap-3">
                       {['Email', 'Text Messages', 'Calls & Voicemail', 'Inbound Calls and SMS'].map(channel => (
                          <label key={channel} className="flex items-center gap-2.5 group cursor-pointer">
                             <input type="checkbox" className="w-3.5 h-3.5 bg-zinc-900 border-zinc-800 text-[#D4AF37] rounded-none focus:ring-0" />
                             <span className="text-[8.5px] font-black text-zinc-500 group-hover:text-white uppercase tracking-widest transition-colors">{channel}</span>
                          </label>
                       ))}
                    </div>
                 </div>
              </div>
            </div>

            <div className="p-3 border-t border-zinc-900 bg-zinc-950 sticky bottom-0 z-10 flex flex-col sm:flex-row gap-2">
              <button className="text-[9px] text-zinc-500 hover:text-white uppercase font-black tracking-widest py-2 px-4 transition-colors">
                Save and Add Another
              </button>
              <div className="flex gap-2 ml-auto">
                 <button 
                  onClick={() => setIsAddDrawerOpen(false)}
                  className="bg-zinc-900 border border-zinc-800 text-white text-[9px] uppercase font-black tracking-widest px-6 py-2 hover:bg-zinc-800 transition-all"
                 >
                   Cancel
                 </button>
                 <button className="bg-[#D4AF37] text-black text-[9px] uppercase font-black tracking-widest px-6 py-2 hover:bg-white transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                   Save
                 </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Contacts;
