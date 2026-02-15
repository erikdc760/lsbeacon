import React, { useEffect, useMemo, useState } from 'react';
import { companyApi } from '../../api';
import NotificationModal from '../NotificationModal';
import ProvisioningModal from './ProvisioningModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'agent' | 'company_owner';
  supervisor_id?: string | null;
  telnyx_number?: string | null;
}

type HierarchyResponse = {
    owner: User | null;
    agents: User[];
    unassignedAgents: User[];
};

const TeamManagement: React.FC = () => {
    const [view, setView] = useState<'create' | 'list' | 'hierarchy'>('create');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'agent' as 'agent' });
    const [users, setUsers] = useState<User[]>([]);
    const [hierarchy, setHierarchy] = useState<HierarchyResponse | null>(null);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [loading, setLoading] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
    const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
    const [notification, setNotification] = useState<{
        isOpen: boolean;
        type: 'alert' | 'confirm' | 'success' | 'error';
        title: string;
        message: string;
        onConfirm?: () => void;
    }>({ isOpen: false, type: 'alert', title: '', message: '' });

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'alert' = 'alert') => {
        setNotification({ isOpen: true, type, title, message });
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setNotification({ isOpen: true, type: 'confirm', title, message, onConfirm });
    };

    useEffect(() => {
        if (view === 'list') fetchUsers();
        if (view === 'hierarchy') fetchHierarchy();
    }, [view]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await companyApi.listUsers('all');
            setUsers(data.users || []);
        } catch (err) {
            console.error(err);
            setMessage('Failed to load users.');
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const fetchHierarchy = async () => {
        try {
            setLoading(true);
            const data = await companyApi.getHierarchy();
            setHierarchy(data);
        } catch (err: any) {
            console.error(err);
            setHierarchy(null);
            setMessage(err.message || 'Failed to load hierarchy.');
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const agents = useMemo(() => users.filter(u => u.role === 'agent'), [users]);

    const assignAgent = async (agentId: string, supervisorId: string | null) => {
        try {
            setLoading(true);
            await companyApi.assignAgent(agentId, supervisorId || null);
            // Refresh current view
            if (view === 'hierarchy') {
                await fetchHierarchy();
            } else {
                await fetchUsers();
            }
        } catch (err: any) {
            console.error(err);
            showAlert('Operation Failed', err.message || 'Failed to assign agent', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const payload: any = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            };

            await companyApi.createUser(payload);
            setStatus('success');
            showAlert('Success', `User ${formData.name} created successfully.`, 'success');
            setFormData({ name: '', email: '', password: '', role: 'agent' });
            await fetchUsers();
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message);
            showAlert('Creation Error', err.message, 'error');
        }
    };

    const confirmTransfer = async (userId: string) => {
        showConfirm(
            "Transfer Ownership",
            "Are you sure? You will lose access as Company Owner and be downgraded to Agent.",
            async () => {
                try {
                    await companyApi.transferOwnership(userId);
                    showAlert('Success', "Ownership Transferred. System will now reload.", 'success');
                    setTimeout(() => window.location.reload(), 2000);
                } catch (err: any) {
                    showAlert('Error', err.message, 'error');
                }
            }
        );
    }

    return (
        <div className="animate-fadeIn space-y-6 lg:space-y-8 font-display pb-12">
            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification({ ...notification, isOpen: false })}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onConfirm={notification.onConfirm}
            />
            {/* Header and Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter">
                        Enterprise <span className="text-[#D4AF37]">Management</span>
                    </h2>
                    <p className="text-[9px] lg:text-[10px] text-zinc-500 uppercase tracking-[0.2em] lg:tracking-[0.3em] font-bold">Organization Hierarchy & Provisioning</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-zinc-950 border border-zinc-900 px-4 lg:px-6 py-2 lg:py-3 flex flex-col items-center min-w-[80px] lg:min-w-[100px]">
                        <span className="text-[8px] lg:text-[9px] text-zinc-600 uppercase font-black tracking-widest">Team Size</span>
                        <span className="text-lg lg:text-xl font-black text-white tracking-widest leading-none mt-1">{users.length}</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-6 lg:gap-8 border-b border-zinc-900/50 overflow-x-auto no-scrollbar whitespace-nowrap">
                {[
                    { id: 'create', label: 'Provision User' },
                    { id: 'list', label: 'Team Directory' },
                    { id: 'hierarchy', label: 'Organization Map' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setView(tab.id as any)}
                        className={`pb-4 text-[9px] lg:text-[10px] uppercase font-black tracking-[0.2em] transition-all relative ${
                            view === tab.id ? 'text-[#D4AF37]' : 'text-zinc-600 hover:text-white'
                        }`}
                    >
                        {tab.label}
                        {view === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]" />
                        )}
                    </button>
                ))}
            </div>

            {view === 'create' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-zinc-950 border border-zinc-900 p-6 lg:p-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#D4AF37] lg:w-[120px] lg:h-[120px]">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                                </svg>
                            </div>

                            <div className="mb-6 lg:mb-8">
                                <h3 className="text-xs lg:text-sm text-white uppercase font-black tracking-widest">Provision New Identity</h3>
                                <p className="text-[9px] lg:text-[10px] text-zinc-600 uppercase mt-1">Authorized creation of organizational entities</p>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6 lg:space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                                    <div className="space-y-2 lg:space-y-3">
                                        <label className="text-[8px] lg:text-[9px] uppercase font-black text-zinc-500 tracking-widest ml-1">Legal Name</label>
                                        <input 
                                            name="name" 
                                            value={formData.name} 
                                            onChange={e => setFormData({...formData, name: e.target.value})} 
                                            className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37] text-white px-4 lg:px-5 py-3 lg:py-4 text-xs transition-all outline-none uppercase tracking-widest font-bold" 
                                            required 
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2 lg:space-y-3">
                                        <label className="text-[8px] lg:text-[9px] uppercase font-black text-zinc-500 tracking-widest ml-1">E-Mail Address</label>
                                        <input 
                                            name="email" 
                                            type="email" 
                                            value={formData.email} 
                                            onChange={e => setFormData({...formData, email: e.target.value})} 
                                            className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37] text-white px-4 lg:px-5 py-3 lg:py-4 text-xs transition-all outline-none tracking-widest font-bold" 
                                            required 
                                            placeholder="identity@enterprise.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                                    <div className="space-y-2 lg:space-y-3">
                                        <label className="text-[8px] lg:text-[9px] uppercase font-black text-zinc-500 tracking-widest ml-1">Secured Access Key</label>
                                        <input 
                                            name="password" 
                                            value={formData.password} 
                                            onChange={e => setFormData({...formData, password: e.target.value})} 
                                            className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37] text-white px-4 lg:px-5 py-3 lg:py-4 text-xs transition-all outline-none tracking-widest font-bold" 
                                            required 
                                            placeholder="Temporary Key"
                                        />
                                    </div>
                                    <div className="space-y-2 lg:space-y-3">
                                        <label className="text-[8px] lg:text-[9px] uppercase font-black text-zinc-500 tracking-widest ml-1">Access Tier (Role)</label>
                                        <select 
                                            name="role" 
                                            value={formData.role} 
                                            onChange={e => setFormData({...formData, role: e.target.value as any})} 
                                            className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37] text-white px-4 lg:px-5 py-3 lg:py-4 text-xs transition-all outline-none uppercase tracking-widest font-bold appearance-none"
                                        >
                                            <option value="agent">Standard Agent</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-zinc-900/50">
                                    <p className="text-[8px] lg:text-[9px] text-zinc-600 uppercase leading-relaxed max-w-xs font-bold tracking-wider text-center sm:text-left">
                                        By provisioning this account, you grant platform access and authority based on the selected tier.
                                    </p>
                                    <button 
                                        type="submit" 
                                        disabled={status === 'loading'} 
                                        className="w-full sm:w-auto bg-[#D4AF37] text-black font-black text-[10px] uppercase px-8 lg:px-10 py-4 lg:py-5 tracking-[0.2em] lg:tracking-[0.3em] hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(212,175,55,0.2)] disabled:opacity-50"
                                    >
                                        {status === 'loading' ? 'Executing...' : 'Authorize Inclusion'}
                                    </button>
                                </div>

                                {message && (
                                    <div className={`p-4 border text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${
                                        status === 'success' ? 'bg-green-900/10 border-green-900/50 text-green-500' : 'bg-red-900/10 border-red-900/50 text-red-500'
                                    }`}>
                                        {message}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-zinc-900/30 border border-zinc-900 p-6 lg:p-8 space-y-6">
                            <h4 className="text-[8px] lg:text-[9px] text-[#D4AF37] uppercase font-black tracking-[.2em]">Deployment Guide</h4>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <span className="text-zinc-700 font-black text-xs lg:text-sm">01</span>
                                    <p className="text-[9px] lg:text-[10px] text-zinc-500 leading-relaxed uppercase tracking-widest">Provision <span className="text-white">Agents</span> to establish the front-line force.</p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-zinc-700 font-black text-xs lg:text-sm">02</span>
                                    <p className="text-[9px] lg:text-[10px] text-zinc-500 leading-relaxed uppercase tracking-widest">Assign agents to your <span className="text-white">Direct Supervision</span> for performance tracking.</p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-zinc-700 font-black text-xs lg:text-sm">03</span>
                                    <p className="text-[9px] lg:text-[10px] text-zinc-500 leading-relaxed uppercase tracking-widest">Use the <span className="text-white">Organization Map</span> to visualize your managed units.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {view === 'list' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-900 pb-4 mb-4 gap-4">
                        <div className="space-y-1">
                            <h3 className="text-xs lg:text-sm font-black text-white uppercase tracking-widest">Team Registry</h3>
                            <p className="text-[8px] lg:text-[9px] text-zinc-500 uppercase tracking-widest">Real-time status of all organizational personnel</p>
                        </div>
                        <button 
                            onClick={fetchUsers} 
                            disabled={loading}
                            className="w-full sm:w-auto bg-black border border-zinc-800 hover:border-[#D4AF37] text-zinc-500 hover:text-[#D4AF37] text-[9px] font-black uppercase px-6 py-3 transition-all tracking-[0.2em] disabled:opacity-50"
                        >
                            {loading ? 'Refreshing...' : 'Pull Registry Sync'}
                        </button>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-900 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-[#D4AF37]/5 border-b border-zinc-900">
                                    <tr className="text-left text-[9px] uppercase font-black tracking-widest text-[#D4AF37]/70">
                                        <th className="px-6 py-4">Identity Info</th>
                                        <th className="px-6 py-4">Access Tier</th>
                                        <th className="px-6 py-4">Phone Number</th>
                                        <th className="px-6 py-4">Command Authority</th>
                                        <th className="px-6 py-4 text-right">Operational Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-900">
                                    {users.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-[10px] text-zinc-600 uppercase font-black tracking-[0.3em]">
                                                Registry is currently empty
                                            </td>
                                        </tr>
                                    )}
                                    {users.map(u => (
                                        <tr key={u.id} className="group hover:bg-zinc-900/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-white uppercase tracking-widest group-hover:text-[#D4AF37] transition-colors">{u.name}</span>
                                                    <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest mt-1">{u.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`text-[9px] font-black uppercase px-3 py-1 tracking-widest border ${
                                                    u.role === 'company_owner' ? 'bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]' : 'bg-zinc-800/50 border-zinc-800 text-zinc-500'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                {u.telnyx_number ? (
                                                    <span className="text-[10px] bg-green-900/20 text-green-500 border border-green-900/30 px-3 py-1.5 font-bold tracking-wider">
                                                        {u.telnyx_number}
                                                    </span>
                                                ) : u.role === 'agent' ? (
                                                    <span className="text-[9px] text-red-500/70 uppercase font-black tracking-widest">NOT PROVISIONED</span>
                                                ) : (
                                                    <span className="text-[9px] text-zinc-700 uppercase font-black tracking-widest">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                {u.role === 'agent' ? (
                                                    <select
                                                        value={u.supervisor_id || ''}
                                                        onChange={(e) => assignAgent(u.id, e.target.value || null)}
                                                        className="bg-black border border-zinc-900 text-[10px] uppercase font-black tracking-widest px-3 py-2 outline-none focus:border-[#D4AF37] transition-all w-full max-w-[200px]"
                                                        disabled={loading}
                                                    >
                                                        <option value="">(UNASSIGNED)</option>
                                                        {users.filter(o => o.role === 'company_owner').map(o => (
                                                            <option key={o.id} value={o.id}>OWNER: {o.name || o.email}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-[9px] text-zinc-700 uppercase font-black tracking-widest">N/A - Hierarchical Lead</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    {(u.role === 'agent' || u.role === 'company_owner') && (
                                                        <button 
                                                            onClick={() => { setSelectedAgent(u); setIsProvisionModalOpen(true); }}
                                                            className="bg-[#D4AF37]/10 border border-[#D4AF37]/40 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black text-[8px] font-black uppercase px-4 py-2 transition-all tracking-widest"
                                                        >
                                                            {u.telnyx_number ? 'Change Number' : 'Provision Number'}
                                                        </button>
                                                    )}
                                                    <button onClick={() => confirmTransfer(u.id)} className="bg-red-950/20 border border-red-900/40 hover:bg-red-900 text-red-500 hover:text-white text-[8px] font-black uppercase px-4 py-2 transition-all tracking-widest">
                                                        Transfer
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
            )}

            {view === 'hierarchy' && (
                <div className="space-y-12 pb-12">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
                        <div className="space-y-1">
                            <h3 className="text-xs lg:text-sm font-black text-white uppercase tracking-widest">Organization Map</h3>
                            <p className="text-[8px] lg:text-[9px] text-zinc-500 uppercase tracking-widest">Structural visualization of command and control</p>
                        </div>
                        <button 
                            onClick={fetchHierarchy} 
                            disabled={loading}
                            className="w-full sm:w-auto bg-black border border-zinc-800 hover:border-[#D4AF37] text-zinc-500 hover:text-[#D4AF37] text-[9px] font-black uppercase px-6 py-3 transition-all tracking-[0.2em] disabled:opacity-50"
                        >
                            {loading ? 'Updating Map...' : 'Relink Map Structure'}
                        </button>
                    </div>

                    {loading && <div className="text-center py-20 animate-pulse text-[10px] text-zinc-600 uppercase font-black tracking-[0.5em]">Rendering Structure...</div>}

                    <div className="relative">
                        {/* Owner Node */}
                        {hierarchy?.owner && (
                            <div className="flex justify-center mb-16 relative">
                                <div className="bg-zinc-950 border-2 border-[#D4AF37] p-6 lg:p-8 min-w-[260px] lg:min-w-[300px] text-center shadow-[0_0_50px_rgba(212,175,55,0.1)] relative z-10">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#D4AF37] text-black text-[8px] lg:text-[9px] font-black px-4 py-1 uppercase tracking-widest whitespace-nowrap">
                                        Supreme Authority
                                    </div>
                                    <h4 className="text-lg lg:text-xl font-black text-white tracking-widest uppercase">{hierarchy.owner.name || 'Organization Owner'}</h4>
                                    <p className="text-[9px] lg:text-[10px] text-zinc-500 uppercase font-bold tracking-[.3em] mt-2">{hierarchy.owner.email}</p>
                                    
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] h-12 lg:h-16 bg-gradient-to-b from-[#D4AF37] to-zinc-900 translate-y-full" />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 lg:gap-12 pt-8">
                            <div className="relative group col-span-full">
                                <div className="bg-zinc-950 border border-zinc-900 group-hover:border-[#D4AF37]/50 transition-all p-6 lg:p-8 relative">
                                    <div className="flex items-center justify-between gap-4 mb-6 border-b border-zinc-900 pb-4">
                                        <div className="space-y-1">
                                            <span className="text-[7px] lg:text-[8px] text-[#D4AF37] uppercase font-black tracking-widest">Managed Units</span>
                                            <h5 className="text-sm lg:text-md font-black text-white uppercase tracking-widest">Directly Supervised Agents</h5>
                                        </div>
                                        <div className="bg-zinc-900 px-3 lg:px-4 py-1.5 lg:py-2 border border-zinc-800">
                                            <span className="text-[7px] lg:text-[8px] text-zinc-500 block uppercase font-black tracking-widest">Units</span>
                                            <span className="text-md lg:text-lg font-black text-white">{hierarchy?.agents?.length || 0}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {(hierarchy?.agents || []).length === 0 && (
                                            <div className="col-span-full border border-dashed border-zinc-900 py-6 text-center">
                                                <span className="text-[9px] text-zinc-700 uppercase font-black tracking-widest">No direct units assigned</span>
                                            </div>
                                        )}
                                        {(hierarchy?.agents || []).map((a) => (
                                            <div key={a.id} className="flex items-center justify-between bg-black border border-zinc-900 hover:border-zinc-800 p-4 group/unit transition-all hover:bg-zinc-900/40">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-black text-zinc-300 uppercase tracking-widest group-hover/unit:text-white">{a.name || 'Field Operative'}</p>
                                                    <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-widest">{a.email}</p>
                                                </div>
                                                <button
                                                    onClick={() => assignAgent(a.id, null)}
                                                    className="sm:opacity-0 group-hover/unit:opacity-100 text-[8px] font-black text-zinc-700 hover:text-red-500 uppercase tracking-[.2em] transition-all"
                                                    disabled={loading}
                                                >
                                                    Detach
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {(hierarchy?.unassignedAgents || []).length > 0 && (
                            <div className="mt-16 lg:mt-20">
                                <div className="border border-zinc-900 bg-zinc-950 p-6 lg:p-10 relative">
                                    <div className="absolute top-0 left-6 lg:left-10 -translate-y-1/2 bg-zinc-950 border border-zinc-900 px-4 lg:px-6 py-2 text-[8px] lg:text-[10px] font-black text-red-500 uppercase tracking-[.2em] lg:tracking-[.4em] whitespace-nowrap">
                                        Unassigned Operatives
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                                        {hierarchy!.unassignedAgents.map((a) => (
                                            <div key={a.id} className="bg-black border border-zinc-900 p-4 space-y-4 group/un">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-black text-white uppercase tracking-widest">{a.name || 'Idle Operative'}</p>
                                                    <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">{a.email}</p>
                                                </div>

                                                <select
                                                    value={a.supervisor_id || ''}
                                                    onChange={(e) => assignAgent(a.id, e.target.value || null)}
                                                    className="w-full bg-zinc-950 border border-zinc-800 text-[9px] font-black uppercase tracking-widest px-3 py-2 outline-none focus:border-[#D4AF37] text-zinc-400 group-hover/un:text-white transition-all"
                                                    disabled={loading}
                                                >
                                                    <option value="">Attach to Owner...</option>
                                                    {hierarchy?.owner && (
                                                        <option value={hierarchy.owner.id}>{hierarchy.owner.name || hierarchy.owner.email}</option>
                                                    )}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <ProvisioningModal
                isOpen={isProvisionModalOpen}
                onClose={() => setIsProvisionModalOpen(false)}
                agent={selectedAgent}
                onSuccess={(num) => {
                    showAlert('Success', `Number ${num} provisioned successfully.`, 'success');
                    fetchUsers();
                    fetchHierarchy();
                }}
            />
        </div>
    );
};

export default TeamManagement;
