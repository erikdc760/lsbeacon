
import React, { useState } from 'react';
import { UserRole } from '../../types';

interface HelpTabProps {
  role: UserRole;
}

interface HelpfulLink {
  id: string;
  label: string;
  url: string;
}

const HelpTab: React.FC<HelpTabProps> = ({ role }) => {
  const isOwner = role === UserRole.COMPANY_OWNER || role === UserRole.SUPER_ADMIN;
  
  const [links, setLinks] = useState<HelpfulLink[]>([
    { id: '1', label: 'Company Knowledge Base', url: '#' },
    { id: '2', label: 'Training Video Portal', url: '#' },
    { id: '3', label: 'Marketing Assets Folder', url: '#' },
    { id: '4', label: 'Script Repository', url: '#' },
  ]);

  const [isEditing, setIsEditing] = useState(false);

  const faqs = [
    { q: 'How do I handle a "No Show" disposition?', a: 'When a lead is marked as No Show, it returns to the regular lead pool. You should attempt to re-contact them within 24 hours.' },
    { q: 'What is Ghost Mode coaching?', a: 'A company owner can join your live call silently. You will hear a short chime, but the client will not hear the coach.' },
    { q: 'Where are my sales recorded?', a: 'Sales are tracked in the Personal Tracker and Company Arena. Ensure you set the "Sale Made" disposition to record the ALP.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6 animate-fadeIn font-display">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-6">
        <div>
          <h1 className="text-lg lg:text-xl font-black text-white uppercase tracking-tighter">Resources & Intel</h1>
          <p className="text-zinc-500 text-[8px] lg:text-[9px] uppercase tracking-[0.2em] mt-0.5">Organization Protocol & Knowledge Base</p>
        </div>
        {isOwner && (
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="w-full sm:w-auto bg-[#D4AF37] text-black text-[9px] uppercase font-black px-4 py-2 hover:bg-white transition-all"
          >
            {isEditing ? 'Save Changes' : 'Edit Resources'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-zinc-950 border border-zinc-900 p-4 lg:p-6 rounded-none shadow-2xl">
          <h3 className="text-[9px] lg:text-[11px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-4 border-b border-zinc-900 pb-3 flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-[#D4AF37]"></div>
            Standard Operating Procedures
          </h3>
          <ul className="space-y-3">
            {['Script: Mortgage Protection', 'Script: Final Expense', 'Handling Objections Guide', 'Zelle Payment Workflow'].map((item) => (
              <li key={item} className="flex items-center gap-2 group cursor-pointer">
                <div className="w-1 h-1 bg-zinc-800 group-hover:bg-[#D4AF37] transition-all"></div>
                <span className="text-[9px] lg:text-[10px] text-zinc-500 group-hover:text-white transition-colors uppercase font-black tracking-widest">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-4 lg:p-6 rounded-none shadow-2xl">
          <h3 className="text-[9px] lg:text-[11px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-4 border-b border-zinc-900 pb-3 flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-[#D4AF37]"></div>
            Strategic Links
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {links.map((link) => (
              <a 
                key={link.id} 
                href={link.url}
                className="flex items-center justify-between p-2.5 bg-zinc-900/50 border border-zinc-800 hover:border-[#D4AF37] hover:bg-zinc-900 transition-all group"
              >
                <span className="text-[9px] text-zinc-400 group-hover:text-white uppercase font-black tracking-widest">{link.label}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600 group-hover:text-[#D4AF37]"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
              </a>
            ))}
            {isEditing && (
              <button className="p-2.5 border border-dashed border-zinc-800 text-zinc-700 text-[9px] font-black uppercase tracking-widest hover:border-white hover:text-white transition-all">
                + Add New Link
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 p-4 lg:p-6 rounded-none shadow-2xl">
        <h3 className="text-[9px] lg:text-[11px] font-black text-white uppercase tracking-[0.3em] mb-4 border-b border-zinc-900 pb-3">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4 lg:space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="space-y-1.5 group">
              <p className="text-[9px] lg:text-[10px] font-black text-[#D4AF37] uppercase tracking-widest flex items-start gap-3">
                <span className="text-zinc-700">Q.</span> {faq.q}
              </p>
              <div className="pl-6 border-l border-zinc-900">
                <p className="text-[9px] lg:text-[10px] text-zinc-500 leading-relaxed font-black uppercase tracking-tight">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-zinc-900 text-center">
        <p className="text-[8px] text-zinc-700 uppercase font-black tracking-[0.4em]">Internal Resource Access Only • Unauthorized Distribution Forbidden</p>
      </div>
    </div>
  );
};

export default HelpTab;
