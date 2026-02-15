
import React, { useState } from 'react';
import { UserRole } from '../../types';

interface PainTrackerProps {
  role: UserRole;
}

interface Tracker {
  id: string;
  label: string;
  key: string;
}

const PainTracker: React.FC<PainTrackerProps> = ({ role }) => {
  const [trackers, setTrackers] = useState<Tracker[]>([
    { id: '1', label: 'Threat Level', key: 'status' },
    { id: '2', label: 'Last Intercept', key: 'lastCalled' },
  ]);

  const [isAddingTracker, setIsAddingTracker] = useState(false);
  const [newTrackerLabel, setNewTrackerLabel] = useState('');

  const leads = [
    { id: '1', name: 'ROBERT JOHNSON', phone: '+1 (555) 123-4567', status: 'CRITICAL', lastCalled: '2H AGO', assignedTo: 'JOHN DOE', score: 88 },
    { id: '2', name: 'MARIA GARCIA', phone: '+1 (555) 987-6543', status: 'WARN', lastCalled: '1D AGO', assignedTo: 'JOHN DOE', score: 45 },
    { id: '3', name: 'JAMES WILSON', phone: '+1 (555) 444-3322', status: 'NEW', lastCalled: 'N/A', assignedTo: 'JANE SMITH', score: 92 },
    { id: '4', name: 'PATRICIA MOORE', phone: '+1 (555) 111-2222', status: 'CRITICAL', lastCalled: '4H AGO', assignedTo: 'JANE SMITH', score: 76 },
    { id: '5', name: 'LINDA DAVIS', phone: '+1 (555) 333-8888', status: 'RESOLVED', lastCalled: '10M AGO', assignedTo: 'SARAH MILLER', score: 100 },
  ];

  const canManageTrackers = role === UserRole.COMPANY_OWNER || role === UserRole.SUPER_ADMIN;
  const canAddLeads = role === UserRole.COMPANY_OWNER || role === UserRole.SUPER_ADMIN;

  const handleAddTracker = () => {
    if (newTrackerLabel.trim()) {
      const newTracker: Tracker = {
        id: String(Date.now()),
        label: newTrackerLabel,
        key: newTrackerLabel.toLowerCase().replace(/\s+/g, '_')
      };
      setTrackers([...trackers, newTracker]);
      setNewTrackerLabel('');
      setIsAddingTracker(false);
    }
  };

  const removeTracker = (id: string) => {
    if (canManageTrackers) {
      setTrackers(trackers.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fadeIn font-display">
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6">
        <div>
          <h1 className="text-2xl lg:text-4xl font-black text-white uppercase tracking-tighter">PAIN INTERFACE</h1>
          <div className="h-1 w-16 lg:w-24 bg-[#D4AF37] mt-2 shadow-[0_0_15px_#D4AF37]"></div>
          <p className="text-zinc-600 text-[8px] lg:text-[10px] uppercase tracking-[0.2em] mt-4 font-black">Recovery Console / Lapsed Policy Reclamation</p>
        </div>
        
        <div className="flex gap-4">
          {canManageTrackers && (
            <button 
              onClick={() => setIsAddingTracker(!isAddingTracker)}
              className="bg-zinc-900 border border-zinc-800 text-[#D4AF37] text-[10px] uppercase font-black tracking-widest px-6 py-3 hover:bg-zinc-800 transition-all"
            >
              {isAddingTracker ? 'Cancel' : 'Manage Trackers'}
            </button>
          )}
          {canAddLeads && (
            <button className="bg-white text-black text-[10px] uppercase font-black tracking-widest px-6 py-3 hover:bg-[#D4AF37] transition-all">
              Add New Case
            </button>
          )}
        </div>
      </div>

      {isAddingTracker && canManageTrackers && (
        <div className="bg-zinc-950 border border-zinc-900 p-6 flex flex-col md:flex-row gap-4 items-end animate-slideDown">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-black">Tracker Label (e.g., Threat Level, Last Intercept)</label>
            <input 
              className="w-full bg-black border border-zinc-800 p-3 text-white text-xs focus:border-[#D4AF37] outline-none"
              placeholder="ENTER TRACKER NAME..."
              value={newTrackerLabel}
              onChange={(e) => setNewTrackerLabel(e.target.value)}
            />
          </div>
          <button 
            onClick={handleAddTracker}
            className="bg-[#D4AF37] text-black text-[10px] uppercase font-black tracking-widest px-8 py-3.5 hover:bg-white transition-all"
          >
            Deploy Tracker
          </button>
        </div>
      )}

      <div className="bg-black border border-zinc-900 rounded-none overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950">
                <th className="px-8 py-5 text-[9px] uppercase tracking-widest text-zinc-500 font-black">Identity</th>
                <th className="px-8 py-5 text-[9px] uppercase tracking-widest text-zinc-500 font-black">Comms</th>
                {trackers.map(tracker => (
                  <th key={tracker.id} className="px-8 py-5 text-[9px] uppercase tracking-widest text-zinc-500 font-black group relative">
                    <div className="flex items-center gap-2">
                      {tracker.label}
                      {canManageTrackers && (
                        <button 
                          onClick={() => removeTracker(tracker.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-white transition-opacity"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                {(role === UserRole.SUPER_ADMIN || role === UserRole.COMPANY_OWNER) && (
                  <th className="px-8 py-5 text-[9px] uppercase tracking-widest text-zinc-500 font-black">Operator</th>
                )}
                <th className="px-8 py-5 text-[9px] uppercase tracking-widest text-zinc-500 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-zinc-950/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-[#D4AF37] transition-colors">{lead.name}</p>
                    <div className="w-16 h-0.5 bg-zinc-900 mt-2">
                      <div className="h-full bg-[#D4AF37]" style={{ width: `${lead.score}%` }}></div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs text-zinc-500 font-mono tracking-tighter uppercase">{lead.phone}</p>
                  </td>
                  {trackers.map(tracker => (
                    <td key={tracker.id} className="px-8 py-6">
                      {tracker.key === 'status' ? (
                        <span className={`px-2 py-0.5 text-[8px] uppercase font-black tracking-widest border ${
                          lead.status === 'NEW' ? 'border-blue-900 text-blue-400 bg-blue-950/30' :
                          lead.status === 'CRITICAL' ? 'border-red-900 text-red-400 bg-red-950/30' :
                          lead.status === 'RESOLVED' ? 'border-green-900 text-green-400 bg-green-950/30' :
                          'border-[#D4AF37] text-[#D4AF37] bg-black'
                        }`}>
                          {lead.status}
                        </span>
                      ) : (
                        <p className="text-[10px] text-zinc-400 uppercase font-black">{(lead as any)[tracker.key] || 'N/A'}</p>
                      )}
                    </td>
                  ))}
                  {(role === UserRole.SUPER_ADMIN || role === UserRole.COMPANY_OWNER) && (
                    <td className="px-8 py-6">
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{lead.assignedTo}</p>
                    </td>
                  )}
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-zinc-500 hover:text-[#D4AF37] bg-zinc-900 border border-zinc-800 hover:border-[#D4AF37]">
                        DIAL
                      </button>
                      <button className="p-2 text-zinc-500 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-400">
                        EDIT
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PainTracker;
