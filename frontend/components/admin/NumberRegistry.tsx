import React, { useEffect, useState } from 'react';
import { phoneApi } from '../../api';
import { adminApi } from '../../api';

interface PhoneNumber {
    id: string;
    phone_number: string;
    area_code: string;
    status: 'available' | 'assigned';
    company_id: string | null;
    assigned_to: string | null;
    telnyx_phone_id: string | null;
    connection_id: string | null;
    purchased_at: string;
    created_at: string;
    assigned_user?: {
        id: string;
        name: string;
        email: string;
        role: string;
    } | null;
    company?: {
        id: string;
        name: string;
    } | null;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    company_id: string;
}

const NumberRegistry: React.FC = () => {
    const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'available' | 'assigned'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [assignModal, setAssignModal] = useState<{ isOpen: boolean; number: PhoneNumber | null }>({ isOpen: false, number: null });
    const [selectedUserId, setSelectedUserId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [registryRes, companiesRes] = await Promise.all([
                phoneApi.getNumberRegistry(),
                adminApi.getCompanies()
            ]);
            setNumbers(registryRes.numbers || []);
            
            // Extract all users from companies
            const allUsers: User[] = [];
            for (const company of companiesRes.companies || []) {
                if (company.owners) {
                    allUsers.push(...company.owners.map((u: any) => ({ ...u, company_id: company.id })));
                }
            }
            setUsers(allUsers);
        } catch (error) {
            console.error('Failed to fetch registry:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnassign = async (phoneNumberId: string) => {
        setActionLoading(phoneNumberId);
        try {
            await phoneApi.unassignNumber(phoneNumberId);
            await fetchData();
        } catch (error) {
            console.error('Failed to unassign:', error);
            alert('Failed to unassign number');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAssign = async () => {
        if (!assignModal.number || !selectedUserId) return;
        setActionLoading(assignModal.number.id);
        try {
            await phoneApi.assignNumber(assignModal.number.id, selectedUserId);
            setAssignModal({ isOpen: false, number: null });
            setSelectedUserId('');
            await fetchData();
        } catch (error) {
            console.error('Failed to assign:', error);
            alert('Failed to assign number');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredNumbers = numbers.filter(num => {
        const matchesFilter = filter === 'all' || num.status === filter;
        const matchesSearch = !searchTerm || 
            num.phone_number.includes(searchTerm) || 
            num.area_code?.includes(searchTerm) ||
            num.assigned_user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            num.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const stats = {
        total: numbers.length,
        available: numbers.filter(n => n.status === 'available').length,
        assigned: numbers.filter(n => n.status === 'assigned').length
    };

    return (
        <div className="animate-fadeIn space-y-6 lg:space-y-8 font-display h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter">
                        Number <span className="text-[#D4AF37]">Registry</span>
                    </h2>
                    <p className="text-[9px] lg:text-[10px] text-zinc-500 uppercase tracking-[0.2em] lg:tracking-[0.3em] font-bold">
                        Telnyx Phone Number Inventory & Assignment Management
                    </p>
                </div>

                <div className="flex gap-3">
                    <div className="bg-zinc-950 border border-zinc-900 px-4 py-2 flex flex-col items-center min-w-[70px]">
                        <span className="text-[7px] text-zinc-600 uppercase font-black tracking-widest">Total</span>
                        <span className="text-lg font-black text-white">{stats.total}</span>
                    </div>
                    <div className="bg-zinc-950 border border-green-900/30 px-4 py-2 flex flex-col items-center min-w-[70px]">
                        <span className="text-[7px] text-green-600 uppercase font-black tracking-widest">Available</span>
                        <span className="text-lg font-black text-green-500">{stats.available}</span>
                    </div>
                    <div className="bg-zinc-950 border border-[#D4AF37]/30 px-4 py-2 flex flex-col items-center min-w-[70px]">
                        <span className="text-[7px] text-[#D4AF37] uppercase font-black tracking-widest">Assigned</span>
                        <span className="text-lg font-black text-[#D4AF37]">{stats.assigned}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-2">
                    {(['all', 'available', 'assigned'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${
                                filter === f
                                    ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                                    : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:border-zinc-700 hover:text-white'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Search numbers, users, companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 text-[10px] px-4 py-2.5 text-white outline-none focus:border-[#D4AF37] transition-colors uppercase tracking-widest"
                    />
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 bg-zinc-950 border border-zinc-900 overflow-hidden flex flex-col min-h-0">
                <div className="overflow-auto flex-1 custom-scroll">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-[#D4AF37]/5 border-b border-zinc-900 sticky top-0 z-10">
                            <tr className="text-left text-[8px] uppercase font-black tracking-widest text-[#D4AF37]/70">
                                <th className="px-4 py-3">Phone Number</th>
                                <th className="px-4 py-3">Area Code</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Assigned To</th>
                                <th className="px-4 py-3">Company</th>
                                <th className="px-4 py-3">Purchased</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <div className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.5em] animate-pulse">
                                            Loading Registry...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredNumbers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <div className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.3em]">
                                            No phone numbers found
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredNumbers.map((num) => (
                                    <tr key={num.id} className="group hover:bg-zinc-900/30 transition-colors">
                                        <td className="px-4 py-4">
                                            <span className="text-[11px] font-mono font-bold text-white tracking-wider">
                                                {num.phone_number}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-[10px] text-zinc-500 font-bold">{num.area_code || '-'}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`text-[8px] font-black uppercase px-2 py-1 tracking-widest border ${
                                                num.status === 'available'
                                                    ? 'bg-green-900/20 border-green-900/30 text-green-500'
                                                    : 'bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]'
                                            }`}>
                                                {num.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {num.assigned_user ? (
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">
                                                        {num.assigned_user.name}
                                                    </p>
                                                    <p className="text-[8px] text-zinc-600 uppercase tracking-wider">
                                                        {num.assigned_user.role}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] text-zinc-700 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                                {num.company?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-[9px] text-zinc-600">
                                                {new Date(num.purchased_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {num.status === 'assigned' ? (
                                                    <button
                                                        onClick={() => handleUnassign(num.id)}
                                                        disabled={actionLoading === num.id}
                                                        className="text-[8px] font-black uppercase px-3 py-1.5 tracking-widest bg-red-950/20 border border-red-900/40 text-red-500 hover:bg-red-900 hover:text-white transition-all disabled:opacity-50"
                                                    >
                                                        {actionLoading === num.id ? '...' : 'Unassign'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setAssignModal({ isOpen: true, number: num })}
                                                        className="text-[8px] font-black uppercase px-3 py-1.5 tracking-widest bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
                                                    >
                                                        Assign
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assign Modal */}
            {assignModal.isOpen && assignModal.number && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0A0A0A] border border-[#1A1A1A] w-full max-w-md p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-[14px] font-black text-white uppercase tracking-tighter">
                                    Assign Number
                                </h3>
                                <p className="text-[10px] text-[#D4AF37] font-mono mt-1">
                                    {assignModal.number.phone_number}
                                </p>
                            </div>
                            <button 
                                onClick={() => setAssignModal({ isOpen: false, number: null })} 
                                className="text-gray-500 hover:text-white"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] text-gray-400 uppercase font-bold">Select User</label>
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="w-full bg-black border border-[#1A1A1A] text-[11px] px-3 py-3 text-white outline-none focus:border-[#D4AF37] transition-colors uppercase tracking-widest"
                            >
                                <option value="">-- Select User --</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.role})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setAssignModal({ isOpen: false, number: null })}
                                className="flex-1 bg-zinc-900 text-zinc-400 text-[9px] font-bold py-3 uppercase tracking-wider hover:bg-zinc-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={!selectedUserId || actionLoading === assignModal.number.id}
                                className="flex-1 bg-[#D4AF37] text-black text-[9px] font-bold py-3 uppercase tracking-wider hover:bg-[#B48F27] transition-all disabled:opacity-50"
                            >
                                {actionLoading === assignModal.number.id ? 'Assigning...' : 'Assign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NumberRegistry;
