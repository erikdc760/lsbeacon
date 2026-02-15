import React, { useState } from 'react';
import { adminApi } from '../../api';
import { Company, Campaign } from '../../api/admin';
import NotificationModal from '../NotificationModal';
import { 
    useCompanies, 
    useCreateCompany, 
    useRemoveCompany, 
    useCreateCampaign, 
    useUpdateCampaign, 
    useRemoveCampaign 
} from '../../hooks/useAdmin';

type ViewMode = 'selection' | 'all-companies' | 'company-campaigns' | 'add-company' | 'remove-company' | 'add-campaign' | 'remove-campaign';

const CompanyManagement: React.FC = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const { data: companiesData, isLoading: companiesLoading, error: companiesError } = useCompanies(page, limit);
    const companies = companiesData?.companies || [];
    
    const createCompanyMutation = useCreateCompany();
    const removeCompanyMutation = useRemoveCompany();
    const createCampaignMutation = useCreateCampaign();
    const updateCampaignMutation = useUpdateCampaign();
    const removeCampaignMutation = useRemoveCampaign();

    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [addCompanyError, setAddCompanyError] = useState('');
    const [addCampaignError, setAddCampaignError] = useState('');
    
    // Notification Modal State
    const [notification, setNotification] = useState<{
        isOpen: boolean;
        type: 'alert' | 'confirm' | 'success' | 'error';
        title: string;
        message: string;
        onConfirm?: () => void;
    }>({
        isOpen: false,
        type: 'alert',
        title: '',
        message: ''
    });

    const showAlert = (title: string, message: string, type: 'alert' | 'success' | 'error' = 'alert') => {
        setNotification({ isOpen: true, type, title, message });
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setNotification({ isOpen: true, type: 'confirm', title, message, onConfirm });
    };
    
    // Modal states
    const [showAddCompany, setShowAddCompany] = useState(false);
    const [showRemoveCompany, setShowRemoveCompany] = useState(false);
    const [showAddCampaign, setShowAddCampaign] = useState(false);
    const [showRemoveCampaign, setShowRemoveCampaign] = useState(false);
    const [showAllCompanies, setShowAllCompanies] = useState(false);
    const [showCompanyCampaigns, setShowCompanyCampaigns] = useState(false);
    const [showEditCampaign, setShowEditCampaign] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

    // Dynamic Source states
    const [showOtherSource, setShowOtherSource] = useState(false);
    const [otherSource, setOtherSource] = useState('');

    // Form Data
    const [companyForm, setCompanyForm] = useState({
        name: '',
        relations: 'Independent' as 'Affiliate' | 'Independent',
        agency_name: '',
        size: 'Medium' as 'Small' | 'Medium' | 'Large',
        est_monthly_output: '',
        notes: '',
        // Owner Details
        ownerName: '',
        ownerEmail: '',
        ownerPassword: ''
    });

    const [campaignForm, setCampaignForm] = useState({
        name: '',
        start_date: '',
        start_time: '9:00 AM',
        end_date: '',
        is_ongoing: false,
        daily_budget: '',
        est_volume: '',
        source: '',
        lead_description: ''
    });

    const [removeCampaignData, setRemoveCampaignData] = useState({
        companyId: '',
        campaignId: '',
        note: ''
    });

    const handleAddCompany = async () => {
        setAddCompanyError('');
        if (!companyForm.name || !companyForm.ownerEmail || !companyForm.ownerPassword) {
            setAddCompanyError('Company name, owner email, and password are required.');
            return;
        }

        try {
            await createCompanyMutation.mutateAsync({
                name: companyForm.ownerName || companyForm.name + ' Owner',
                email: companyForm.ownerEmail,
                password: companyForm.ownerPassword,
                companyName: companyForm.name,
                relations: companyForm.relations,
                agency_name: companyForm.agency_name,
                size: companyForm.size,
                est_monthly_output: companyForm.est_monthly_output,
                notes: companyForm.notes
            });
            setShowAddCompany(false);
            setCompanyForm({ 
                name: '', 
                relations: 'Independent', 
                agency_name: '', 
                size: 'Medium', 
                est_monthly_output: '', 
                notes: '',
                ownerName: '',
                ownerEmail: '',
                ownerPassword: ''
            });
            showAlert('Success', 'Company and Owner protocol established.', 'success');
        } catch (error: any) {
            console.error(error);
            const message = error?.message || 'Failed to establish company protocol.';
            if (message.toLowerCase().includes('email') && message.toLowerCase().includes('exist')) {
                setAddCompanyError('This email is already in use. Please use a different email.');
            } else {
                setAddCompanyError(message);
            }
        }
    };

    const handleRemoveCompany = async () => {
        if (!selectedCompanyId) return;
        
        const companyName = companies.find(c => c.id === selectedCompanyId)?.name || 'this company';
        
        showConfirm(
            'Terminate Entity',
            `Are you sure you want to terminate ${companyName} and all associated data? This action is irreversible.`,
            async () => {
                try {
                    await removeCompanyMutation.mutateAsync(selectedCompanyId);
                    setSelectedCompanyId('');
                    showAlert('Success', 'Entity protocol terminated.', 'success');
                } catch (error: any) {
                    console.error(error);
                    showAlert('Error', error?.message || 'Failed to terminate entity protocol.', 'error');
                }
            }
        );
    };

    const handleAddCampaign = async () => {
        setAddCampaignError('');
        if (!selectedCompanyId) return;
        if (!campaignForm.name) {
            setAddCampaignError('Campaign name is required.');
            return;
        }

        if (campaignForm.daily_budget && isNaN(Number(campaignForm.daily_budget))) {
            setAddCampaignError('Daily budget must be a valid number.');
            return;
        }

        if (campaignForm.est_volume && !Number.isInteger(Number(campaignForm.est_volume))) {
            setAddCampaignError('Estimated volume must be a whole (integer) number.');
            return;
        }

        const finalSource = campaignForm.source === 'other' ? otherSource : campaignForm.source;

        try {
            await createCampaignMutation.mutateAsync({ 
                ...campaignForm, 
                source: finalSource,
                company_id: selectedCompanyId 
            });
            setShowAddCampaign(false);
            setCampaignForm({ name: '', start_date: '', start_time: '9:00 AM', end_date: '', is_ongoing: false, daily_budget: '', est_volume: '', source: '', lead_description: '' });
            setShowOtherSource(false);
            setOtherSource('');
            showAlert('Success', 'Campaign protocol deployed.', 'success');
        } catch (error: any) {
            setAddCampaignError(error?.message || 'Failed to add campaign.');
        }
    };

    const handleRemoveCampaign = async () => {
        if (!removeCampaignData.campaignId) return;
        
        showConfirm(
            'Terminate Campaign',
            'Are you sure you want to terminate this campaign protocol?',
            async () => {
                try {
                    await removeCampaignMutation.mutateAsync(removeCampaignData.campaignId);
                    setShowRemoveCampaign(false);
                    showAlert('Success', 'Campaign protocol terminated.', 'success');
                } catch (error: any) {
                    console.error(error);
                    showAlert('Error', error?.message || 'Failed to terminate campaign protocol.', 'error');
                }
            }
        );
    };

    const handleEditCampaign = (campaign: Campaign) => {
        setEditingCampaign(campaign);
        
        const standardSources = ['fb', 'google', 'direct'];
        const isStandard = !campaign.source || standardSources.includes(campaign.source);

        setCampaignForm({
            name: campaign.name || '',
            start_date: campaign.start_date || '',
            start_time: campaign.start_time || '9:00 AM',
            end_date: campaign.end_date || '',
            is_ongoing: campaign.is_ongoing || false,
            daily_budget: campaign.daily_budget || '',
            est_volume: campaign.est_volume || '',
            source: isStandard ? (campaign.source || '') : 'other',
            lead_description: campaign.lead_description || ''
        });

        if (!isStandard) {
            setShowOtherSource(true);
            setOtherSource(campaign.source || '');
        } else {
            setShowOtherSource(false);
            setOtherSource('');
        }

        setShowEditCampaign(true);
    };

    const handleUpdateCampaign = async () => {
        if (!editingCampaign) return;
        setAddCampaignError('');
        if (!campaignForm.name) {
            setAddCampaignError('Campaign name is required.');
            return;
        }

        const finalSource = campaignForm.source === 'other' ? otherSource : campaignForm.source;

        try {
            await updateCampaignMutation.mutateAsync({
                id: editingCampaign.id,
                data: {
                    ...campaignForm,
                    source: finalSource
                }
            });
            setShowEditCampaign(false);
            setEditingCampaign(null);
            setCampaignForm({ name: '', start_date: '', start_time: '9:00 AM', end_date: '', is_ongoing: false, daily_budget: '', est_volume: '', source: '', lead_description: '' });
            setShowOtherSource(false);
            setOtherSource('');
            showAlert('Success', 'Campaign protocol updated.', 'success');
        } catch (error: any) {
            setAddCampaignError(error?.message || 'Failed to update campaign.');
        }
    };

    const selectedCompany = companies.find(c => c.id === selectedCompanyId);

    // Group companies by first letter for dropdown
    const groupedCompanies: { [key: string]: Company[] } = {};
    companies.forEach(c => {
        const firstLetter = c.name.charAt(0).toUpperCase();
        if (!groupedCompanies[firstLetter]) groupedCompanies[firstLetter] = [];
        groupedCompanies[firstLetter].push(c);
    });
    const alphabet = Object.keys(groupedCompanies).sort();

    const loading = companiesLoading || createCompanyMutation.isPending || removeCompanyMutation.isPending || createCampaignMutation.isPending || updateCampaignMutation.isPending || removeCampaignMutation.isPending;

    return (
        <div className="min-h-full bg-black text-white p-6 font-display relative selection:bg-[#D4AF37] selection:text-black">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]"></div>
            
            <div className="relative z-10 max-w-6xl mx-auto">
                <h1 className="text-zinc-600 text-[9px] uppercase tracking-[0.4em] font-black mb-6">Company Management Protocol</h1>
                {companiesError && (
                    <p className="text-[9px] text-red-500 uppercase tracking-widest mb-6">{(companiesError as any)?.message || 'Failed to fetch companies'}</p>
                )}

                {!showAllCompanies && !showCompanyCampaigns && (
                    <div className="flex flex-col md:flex-row gap-6 items-start animate-fadeIn">
                        {/* Left Side: Select Company Card */}
                        <div className="flex-1 bg-zinc-950/40 border border-zinc-900/50 p-0.5">
                             <div className="bg-black/40 border border-zinc-900/50 p-6">
                                <h2 className="text-[#D4AF37] text-[9px] uppercase tracking-widest font-black mb-4">Company</h2>
                                
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <select 
                                            value={selectedCompanyId}
                                            onChange={(e) => setSelectedCompanyId(e.target.value)}
                                            className="w-full bg-black border border-zinc-800 text-white px-4 py-3 text-[11px] uppercase tracking-widest focus:outline-none focus:border-[#D4AF37]/50 appearance-none rounded-none cursor-pointer"
                                        >
                                            <option value="">Select Company</option>
                                            {alphabet.map(letter => (
                                                <optgroup key={letter} label={letter} className="bg-zinc-950 text-zinc-500 text-[10px]">
                                                    {groupedCompanies[letter].map(c => (
                                                        <option key={c.id} value={c.id} className="bg-black text-white text-[11px] py-2">
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M1 1L5 5L9 1" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Custom Styled List (Alternative to select as shown in screenshot) */}
                                    <div className="max-h-[400px] overflow-y-auto border border-zinc-900/20 custom-scroll">
                                        {alphabet.map(letter => (
                                            <div key={letter} className="mb-4">
                                                <div className="flex items-center gap-4 mb-2 px-4">
                                                    <span className="text-[#D4AF37] text-[11px] font-black">{letter}</span>
                                                    <div className="h-[1px] flex-1 bg-zinc-900"></div>
                                                </div>
                                                {groupedCompanies[letter].map(c => (
                                                    <div 
                                                        key={c.id}
                                                        onClick={() => setSelectedCompanyId(c.id)}
                                                        className={`px-8 py-3 text-[11px] uppercase tracking-widest cursor-pointer transition-all border-l-2 ${selectedCompanyId === c.id ? 'border-[#D4AF37] bg-white/5 text-white' : 'border-transparent text-zinc-500 hover:text-white'}`}
                                                    >
                                                        {c.name}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* Right Side: Action Buttons */}
                        <div className="w-full md:w-56 space-y-2">
                            <button 
                                onClick={() => selectedCompanyId && setShowCompanyCampaigns(true)}
                                disabled={!selectedCompanyId}
                                className="w-full bg-black border border-zinc-800 text-zinc-300 px-4 py-3 text-[9px] uppercase tracking-[0.2em] font-black hover:border-[#D4AF37]/50 hover:text-white transition-all disabled:opacity-30 text-left flex justify-between items-center group"
                            >
                                View Campaigns
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            </button>
                            <button 
                                onClick={() => selectedCompanyId && setShowAddCampaign(true)}
                                disabled={!selectedCompanyId}
                                className="w-full bg-black border border-zinc-800 text-zinc-300 px-4 py-3 text-[9px] uppercase tracking-[0.2em] font-black hover:border-[#D4AF37]/50 hover:text-white transition-all disabled:opacity-30 text-left"
                            >
                                Link Campaign
                            </button>
                            <button 
                                onClick={() => selectedCompanyId && setShowRemoveCampaign(true)}
                                disabled={!selectedCompanyId}
                                className="w-full bg-black border border-zinc-800 text-zinc-300 px-4 py-3 text-[9px] uppercase tracking-[0.2em] font-black hover:border-[#D4AF37]/50 hover:text-white transition-all disabled:opacity-30 text-left"
                            >
                                Remove Campaign
                            </button>
                            <div className="h-2"></div>
                            <button 
                                onClick={() => setShowAddCompany(true)}
                                className="w-full bg-black border border-zinc-800 text-zinc-300 px-4 py-3 text-[9px] uppercase tracking-[0.2em] font-black hover:border-[#D4AF37]/50 hover:text-white transition-all text-left"
                            >
                                Add Company
                            </button>
                            <button 
                                onClick={() => setShowRemoveCompany(true)}
                                className="w-full bg-black border border-zinc-800 text-zinc-300 px-4 py-3 text-[9px] uppercase tracking-[0.2em] font-black hover:border-[#D4AF37]/50 hover:text-white transition-all text-left"
                            >
                                Remove Company
                            </button>
                            <button 
                                onClick={() => setShowAllCompanies(true)}
                                className="w-full bg-[#D4AF37] text-black px-4 py-3 text-[9px] uppercase tracking-[0.2em] font-black hover:bg-white transition-all text-left mt-2 shadow-[0_10px_30px_rgba(212,175,55,0.2)]"
                            >
                                View All Entities
                            </button>
                        </div>
                    </div>
                )}

                {/* View: All Companies table (Screenshot 6) */}
                {showAllCompanies && (
                    <div className="animate-fadeIn space-y-6">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-6">
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">All Companies</h2>
                        </div>
                        
                        <div className="bg-zinc-950/30 border border-zinc-900 overflow-hidden shadow-2xl">
                            <table className="w-full border-collapse">
                                <thead className="bg-black/50 border-b border-zinc-900">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[9px] uppercase font-black text-zinc-500 tracking-widest">Name</th>
                                        <th className="px-6 py-4 text-left text-[9px] uppercase font-black text-zinc-500 tracking-widest">Relations</th>
                                        <th className="px-6 py-4 text-left text-[9px] uppercase font-black text-zinc-500 tracking-widest">Agency Name</th>
                                        <th className="px-6 py-4 text-left text-[9px] uppercase font-black text-zinc-500 tracking-widest">Size</th>
                                        <th className="px-6 py-4 text-right text-[9px] uppercase font-black text-zinc-500 tracking-widest">Est. Monthly Output</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.map((c) => (
                                        <React.Fragment key={c.id}>
                                            <tr 
                                                className={`border-b border-zinc-900/50 hover:bg-zinc-900/20 cursor-pointer transition-colors ${selectedCompanyId === c.id ? 'bg-[#D4AF37]/5' : ''}`}
                                                onClick={() => {
                                                    setSelectedCompanyId(c.id);
                                                    setShowAllCompanies(false);
                                                    setShowCompanyCampaigns(true);
                                                }}
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`transition-transform duration-300 ${selectedCompanyId === c.id ? 'rotate-180' : '-rotate-90'}`}>
                                                             <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#D4AF37" strokeWidth="1.5">
                                                                <path d="M1 1L4 4L7 1" />
                                                            </svg>
                                                        </div>
                                                        <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedCompanyId === c.id ? 'text-[#D4AF37]' : 'text-white'}`}>{c.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-[10px] text-zinc-400 uppercase tracking-widest">{c.relations || 'N/A'}</td>
                                                <td className="px-6 py-5 text-[10px] text-zinc-400 uppercase tracking-widest">{c.agency_name || 'N/A'}</td>
                                                <td className="px-6 py-5 text-[10px] text-zinc-400 uppercase tracking-widest">{c.size || 'N/A'}</td>
                                                <td className="px-6 py-5 text-right text-[11px] font-bold text-white tracking-widest">{c.est_monthly_output || '0'}</td>
                                            </tr>
                                            {selectedCompanyId === c.id && c.campaigns && (
                                                <tr className="bg-black/60 border-b border-zinc-900/50">
                                                    <td colSpan={5} className="px-12 py-6">
                                                        <div className="space-y-4 max-w-2xl">
                                                            {c.campaigns.map(camp => (
                                                                <div key={camp.id} className="flex items-center justify-between text-[10px] group transition-all">
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="uppercase tracking-widest text-zinc-400 group-hover:text-zinc-200">{camp.name}</span>
                                                                        <span className={`px-2 py-0.5 border text-[7px] font-black tracking-tighter ${camp.status === 'ACTIVE' ? 'border-green-900/50 text-green-500 bg-green-500/5' : 'border-zinc-800 text-zinc-500'}`}>
                                                                            {camp.status}
                                                                        </span>
                                                                    </div>
                                                                    <div className="h-[1px] flex-1 mx-4 bg-zinc-900/50"></div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                            {/* Pagination Controls */}
                            <div className="flex items-center justify-between px-6 py-4 bg-black/50 border-t border-zinc-900">
                                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">
                                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, companiesData?.total || 0)} of {companiesData?.total || 0} Entities
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        disabled={page === 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        className="px-4 py-2 border border-zinc-800 text-[9px] uppercase font-black tracking-widest hover:border-[#D4AF37] disabled:opacity-30 disabled:hover:border-zinc-800 transition-all"
                                    >
                                        Prev
                                    </button>
                                    <button 
                                        disabled={page * limit >= (companiesData?.total || 0)}
                                        onClick={() => setPage(p => p + 1)}
                                        className="px-4 py-2 border border-zinc-800 text-[9px] uppercase font-black tracking-widest hover:border-[#D4AF37] disabled:opacity-30 disabled:hover:border-zinc-800 transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-8 flex justify-center">
                            <button 
                                onClick={() => setShowAllCompanies(false)}
                                className="bg-black border border-zinc-900 px-12 py-3 text-[10px] uppercase font-black tracking-[0.3em] hover:text-white hover:border-[#D4AF37] transition-all text-zinc-500"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                )}

                {/* View: Company Campaigns (Screenshot 3) */}
                {showCompanyCampaigns && selectedCompany && (
                    <div className="animate-fadeIn space-y-8">
                        <div className="bg-zinc-950/20 border border-zinc-900 flex items-center justify-between p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 border border-[#D4AF37]/30">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
                                        <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                                        <path d="M2 17L12 22L22 17" />
                                        <path d="M2 12L12 17L22 12" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">{selectedCompany.name}</h2>
                            </div>
                            <button 
                                onClick={() => setShowAddCampaign(true)}
                                className="bg-black border border-zinc-800 px-6 py-2 text-[10px] uppercase font-black tracking-widest hover:border-[#D4AF37] transition-all text-zinc-400 hover:text-white"
                            >
                                + Add Campaign
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {(selectedCompany.campaigns || []).map((camp) => (
                                <div key={camp.id} className="bg-zinc-950 border border-zinc-900 p-8 shadow-2xl relative group overflow-hidden">
                                    <div className="flex flex-col md:flex-row justify-between mb-8 gap-6 relative z-10">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] group-hover:text-[#D4AF37] transition-colors">{camp.name}</h3>
                                                <span className={`px-3 py-1 text-[9px] font-black border ${camp.status === 'ACTIVE' ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5' : 'border-zinc-800 text-zinc-500'}`}>
                                                    {camp.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleEditCampaign(camp)}
                                                className="px-4 py-1.5 bg-zinc-900/50 border border-zinc-800 text-[9px] uppercase font-black hover:border-[#D4AF37] transition-all text-zinc-500 hover:text-[#D4AF37]"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setRemoveCampaignData({ ...removeCampaignData, campaignId: camp.id, companyId: selectedCompany.id });
                                                    setShowRemoveCampaign(true);
                                                }}
                                                className="px-4 py-1.5 bg-zinc-900/50 border border-zinc-800 text-[9px] uppercase font-black hover:border-red-900 hover:text-red-500 transition-all text-zinc-500"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 relative z-10">
                                        <div className="space-y-4">
                                            <div className="flex justify-between border-b border-zinc-900/50 pb-2">
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Start Date & Time:</span>
                                                <span className="text-[10px] text-zinc-300 uppercase tracking-widest font-bold">{camp.start_date}, {camp.start_time}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-zinc-900/50 pb-2">
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">End Date & Time:</span>
                                                <span className="text-[10px] text-zinc-300 uppercase tracking-widest font-bold">{camp.end_date || 'Ongoing'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between border-b border-zinc-900/50 pb-2">
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Daily Budget:</span>
                                                <span className="text-[10px] text-zinc-300 tracking-widest font-bold">${camp.daily_budget}/day</span>
                                            </div>
                                            <div className="flex justify-between border-b border-zinc-900/50 pb-2">
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Estimated Volume:</span>
                                                <span className="text-[10px] text-zinc-300 tracking-widest font-bold">{camp.est_volume}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-zinc-900/50 space-y-6 relative z-10">
                                        <div className="flex gap-16">
                                            <div className="w-32 flex-shrink-0">
                                                <span className="text-[9px] text-[#D4AF37] uppercase font-black tracking-[0.2em]">Source</span>
                                            </div>
                                            <span className="text-[10px] text-zinc-400 uppercase tracking-widest">{camp.source}</span>
                                        </div>
                                        <div className="flex gap-16">
                                            <div className="w-32 flex-shrink-0">
                                                <span className="text-[9px] text-[#D4AF37] uppercase font-black tracking-[0.2em]">Lead Description:</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed max-w-2xl">
                                                {camp.lead_description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-10 flex justify-center">
                            <button 
                                onClick={() => setShowCompanyCampaigns(false)}
                                className="bg-black border border-zinc-900 px-12 py-3 text-[10px] uppercase font-black tracking-[0.3em] hover:text-white hover:border-[#D4AF37] transition-all text-zinc-500"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Components */}
            {/* Modal: Add Company */}
            {showAddCompany && (
                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-start sm:justify-center p-4 overflow-y-auto custom-scroll">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fadeIn" onClick={() => setShowAddCompany(false)}></div>
                    <div className="bg-[#0c0c0c] border border-zinc-800 w-full max-w-3xl relative z-10 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.9)] animate-scaleUp my-8 sm:my-20 max-h-none sm:max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-zinc-900/50 bg-zinc-950/50 flex-shrink-0">
                            <h3 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Establish Entity Protocol</h3>
                            <button onClick={() => setShowAddCompany(false)} className="text-zinc-600 hover:text-white transition-colors">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-8 overflow-y-auto custom-scroll">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Company Data */}
                                <div className="space-y-4">
                                    <h4 className="text-[9px] text-zinc-400 uppercase font-black tracking-[0.2em] border-b border-zinc-900 pb-2">Company Parameters</h4>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] text-zinc-600 uppercase font-black tracking-widest ml-1">Company Name</label>
                                        <input 
                                            type="text" 
                                            value={companyForm.name}
                                            onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                                            className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-3 py-2 text-[10px] text-white uppercase tracking-widest outline-none transition-all"
                                            placeholder="ENTER NAME..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[8px] text-zinc-600 uppercase font-black tracking-widest ml-1">Relations</label>
                                            <select 
                                                value={companyForm.relations}
                                                onChange={(e) => setCompanyForm({...companyForm, relations: e.target.value as any})}
                                                className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-3 py-2 text-[10px] text-white uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="Independent">Independent</option>
                                                <option value="Affiliate">Affiliate</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[8px] text-zinc-600 uppercase font-black tracking-widest ml-1">Size Range</label>
                                            <select 
                                                value={companyForm.size}
                                                onChange={(e) => setCompanyForm({...companyForm, size: e.target.value as any})}
                                                className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-3 py-2 text-[10px] text-white uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="Small">Small</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Large">Large</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] text-zinc-600 uppercase font-black tracking-widest ml-1">Agency Reference (Opt)</label>
                                        <input 
                                            type="text" 
                                            value={companyForm.agency_name}
                                            onChange={(e) => setCompanyForm({...companyForm, agency_name: e.target.value})}
                                            className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-4 py-3 text-[11px] text-white uppercase tracking-widest outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] text-zinc-600 uppercase font-black tracking-widest ml-1">Est. Monthly Output</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-[11px]">$</span>
                                            <input 
                                                type="text" 
                                                value={companyForm.est_monthly_output}
                                                onChange={(e) => setCompanyForm({...companyForm, est_monthly_output: e.target.value})}
                                                className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 pl-8 pr-4 py-3 text-[11px] text-white uppercase tracking-widest outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Owner Data */}
                                <div className="space-y-6">
                                    <h4 className="text-[10px] text-zinc-400 uppercase font-black tracking-[0.2em] border-b border-zinc-900 pb-2">Owner Credentials</h4>
                                    <div className="space-y-2">
                                        <label className="text-[9px] text-zinc-600 uppercase font-black tracking-widest ml-1">Owner Full Name</label>
                                        <input 
                                            type="text" 
                                            value={companyForm.ownerName}
                                            onChange={(e) => setCompanyForm({...companyForm, ownerName: e.target.value})}
                                            className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-4 py-3 text-[11px] text-white uppercase tracking-widest outline-none transition-all"
                                            placeholder="ENTER NAME..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] text-zinc-600 uppercase font-black tracking-widest ml-1">Access Email</label>
                                        <input 
                                            type="email" 
                                            value={companyForm.ownerEmail}
                                            onChange={(e) => setCompanyForm({...companyForm, ownerEmail: e.target.value})}
                                            className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-4 py-3 text-[11px] text-zinc-white outline-none transition-all"
                                            placeholder="EMAIL..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] text-zinc-600 uppercase font-black tracking-widest ml-1">Secure Password</label>
                                        <input 
                                            type="password" 
                                            value={companyForm.ownerPassword}
                                            onChange={(e) => setCompanyForm({...companyForm, ownerPassword: e.target.value})}
                                            className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-4 py-3 text-[11px] text-white outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="pt-4 p-4 border border-zinc-900/50 bg-zinc-950/30">
                                        <p className="text-[8px] text-zinc-500 uppercase tracking-widest leading-relaxed">
                                            Creating an entity protocol will automatically generate a <span className="text-[#D4AF37]">Company Owner</span> role and link it to this entity.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[9px] text-zinc-600 uppercase font-black tracking-widest ml-1">Strategic Notes (Opt)</label>
                                <textarea 
                                    value={companyForm.notes}
                                    onChange={(e) => setCompanyForm({...companyForm, notes: e.target.value})}
                                    className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-4 py-3 text-[11px] text-white uppercase tracking-widest outline-none transition-all h-20 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 p-8 border-t border-zinc-900/50 flex-shrink-0">
                            {addCompanyError && (
                                <p className="text-[9px] text-red-500 uppercase tracking-widest text-center">{addCompanyError}</p>
                            )}
                            <div className="flex gap-4">
                                <button onClick={() => setShowAddCompany(false)} className="flex-1 bg-zinc-900/50 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest py-4 hover:text-white transition-all">Cancel</button>
                                <button 
                                    onClick={handleAddCompany} 
                                    disabled={loading}
                                    className="flex-1 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest py-4 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Deploying...' : 'Establish Protocol'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Remove Company */}
            {showRemoveCompany && (
                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-start sm:justify-center p-4 overflow-y-auto custom-scroll">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fadeIn" onClick={() => setShowRemoveCompany(false)}></div>
                    <div className="bg-[#0c0c0c] border border-zinc-800 w-full max-w-md relative z-10 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.9)] animate-scaleUp my-8 sm:my-20 flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-900/50 bg-zinc-950/50">
                            <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-[0.3em]">Remove Company</h3>
                            <button onClick={() => setShowRemoveCompany(false)} className="text-zinc-600 hover:text-white transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest ml-1">Company</label>
                                <select 
                                    value={selectedCompanyId}
                                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                                    className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-4 py-3 text-[11px] text-white uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select Company</option>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="text-center py-4 bg-zinc-900/10 border border-zinc-900/50">
                                <p className="text-zinc-500 text-[11px] uppercase tracking-widest leading-relaxed">
                                    Are you sure you want to permanently <span className="text-white border-b border-zinc-700">remove</span> this company and all associated data?
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setShowRemoveCompany(false)} className="flex-1 bg-zinc-900/50 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest py-4 hover:text-white transition-all">Cancel</button>
                                <button onClick={handleRemoveCompany} className="flex-1 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest py-4 hover:bg-red-600 hover:text-white transition-all">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Add Campaign */}
            {showAddCampaign && (
                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-start sm:justify-center p-4 overflow-y-auto custom-scroll">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fadeIn" onClick={() => setShowAddCampaign(false)}></div>
                    <div className="bg-[#0c0c0c] border border-zinc-800 w-full max-w-lg relative z-10 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.9)] animate-scaleUp my-8 sm:my-20 max-h-none sm:max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-900/50 bg-zinc-950/50">
                            <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-[0.3em]">Add Campaign</h3>
                            <button onClick={() => setShowAddCampaign(false)} className="text-zinc-600 hover:text-white transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <div className="p-8 space-y-6 overflow-y-auto custom-scroll">
                            <div className="space-y-2">
                                <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest ml-1">Campaign Name</label>
                                <input 
                                    type="text" 
                                    value={campaignForm.name}
                                    onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                                    className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-4 py-3 text-[11px] text-white uppercase tracking-widest outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest ml-1">Start Date & Time</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="date" 
                                            value={campaignForm.start_date}
                                            onChange={(e) => setCampaignForm({...campaignForm, start_date: e.target.value})}
                                            className="flex-1 bg-black border border-zinc-900 px-4 py-3 text-[11px] text-white outline-none focus:border-[#D4AF37]/30 [color-scheme:dark]" 
                                        />
                                        <input 
                                            type="text" 
                                            value={campaignForm.start_time} 
                                            onChange={(e) => setCampaignForm({...campaignForm, start_time: e.target.value})} 
                                            className="w-24 bg-black border border-zinc-900 px-4 py-3 text-[11px] text-white outline-none focus:border-[#D4AF37]/30 uppercase" 
                                            placeholder="9:00 AM" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 relative">
                                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest ml-1">End Date & Time</label>
                                    <input 
                                        type="date" 
                                        disabled={campaignForm.is_ongoing} 
                                        value={campaignForm.end_date}
                                        onChange={(e) => setCampaignForm({...campaignForm, end_date: e.target.value})}
                                        className="w-full bg-black border border-zinc-900 px-4 py-3 text-[11px] text-white outline-none disabled:opacity-30 focus:border-[#D4AF37]/30 [color-scheme:dark]" 
                                    />
                                    <div className="mt-2 flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            id="ongoing"
                                            checked={campaignForm.is_ongoing}
                                            onChange={(e) => setCampaignForm({...campaignForm, is_ongoing: e.target.checked})}
                                            className="accent-[#D4AF37] h-3 w-3" 
                                        />
                                        <label htmlFor="ongoing" className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.2em] cursor-pointer">Ongoing</label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest ml-1">Daily Budget</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-[11px]">$</span>
                                        <input 
                                            type="text" 
                                            value={campaignForm.daily_budget}
                                            onChange={(e) => setCampaignForm({...campaignForm, daily_budget: e.target.value})}
                                            className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 pl-8 pr-4 py-3 text-[11px] text-white outline-none transition-all placeholder:text-zinc-800"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest ml-1">Estimated Volume</label>
                                    <input 
                                        type="text" 
                                        value={campaignForm.est_volume}
                                        onChange={(e) => setCampaignForm({...campaignForm, est_volume: e.target.value})}
                                        className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-4 py-3 text-[11px] text-white outline-none transition-all placeholder:text-zinc-800 uppercase"
                                        placeholder="ENTER VOLUME..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest ml-1">Source</label>
                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <select 
                                            className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-4 py-3 text-[11px] text-white uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer"
                                            value={campaignForm.source}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setCampaignForm({...campaignForm, source: val});
                                                setShowOtherSource(val === 'other');
                                            }}
                                        >
                                            <option value="">Select Source</option>
                                            <option value="fb">Facebook Ads</option>
                                            <option value="google">Google Search</option>
                                            <option value="direct">Direct Traffic</option>
                                            <option value="other">Other...</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                                        </div>
                                    </div>
                                    {showOtherSource && (
                                        <input 
                                            type="text"
                                            placeholder="ENTER CUSTOM SOURCE..."
                                            className="flex-[1.5] bg-black border border-[#D4AF37]/50 px-4 py-3 text-[11px] text-white uppercase tracking-widest outline-none transition-all animate-in slide-in-from-left-2 duration-200"
                                            value={otherSource}
                                            onChange={(e) => setOtherSource(e.target.value)}
                                            autoFocus
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest ml-1">Lead Description</label>
                                <textarea 
                                    value={campaignForm.lead_description}
                                    onChange={(e) => setCampaignForm({...campaignForm, lead_description: e.target.value})}
                                    className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-4 py-3 text-[11px] text-white uppercase tracking-widest outline-none transition-all h-24 resize-none placeholder:text-zinc-800"
                                    placeholder="ENTER SPECIFICATIONS..."
                                />
                            </div>

                            <div className="flex flex-col gap-4 pt-4">
                                {addCampaignError && (
                                    <p className="text-[9px] text-red-500 uppercase tracking-widest text-center">{addCampaignError}</p>
                                )}
                                <div className="flex gap-4">
                                    <button onClick={() => setShowAddCampaign(false)} className="flex-1 bg-zinc-900/50 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest py-4 hover:text-white transition-all">Cancel</button>
                                    <button onClick={handleAddCampaign} disabled={loading} className="flex-1 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest py-4 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50">
                                        {loading ? 'Processing...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Remove Campaign */}
            {showRemoveCampaign && (
                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-start sm:justify-center p-4 overflow-y-auto custom-scroll">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fadeIn" onClick={() => setShowRemoveCampaign(false)}></div>
                    <div className="bg-[#0c0c0c] border border-zinc-800 w-full max-w-md relative z-10 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.9)] animate-scaleUp my-8 sm:my-20 flex flex-col">
                         <div className="flex items-center justify-between p-6 border-b border-zinc-900/50 bg-zinc-950/50">
                            <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-[0.3em]">Remove Campaign</h3>
                            <button onClick={() => setShowRemoveCampaign(false)} className="text-zinc-600 hover:text-white transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex justify-center mb-2">
                                <div className="flex items-center gap-2 border border-[#D4AF37]/30 px-4 py-2 bg-[#D4AF37]/5">
                                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
                                        <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                                    </svg>
                                    <span className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-black">{selectedCompany?.name}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest ml-1">Company</label>
                                <select 
                                    value={removeCampaignData.companyId}
                                    onChange={(e) => setRemoveCampaignData({...removeCampaignData, companyId: e.target.value})}
                                    className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-4 py-3 text-[11px] text-white uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select Company</option>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest ml-1">Campaign</label>
                                <select 
                                    value={removeCampaignData.campaignId}
                                    onChange={(e) => setRemoveCampaignData({...removeCampaignData, campaignId: e.target.value})}
                                    className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-4 py-3 text-[11px] text-white uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select Campaign</option>
                                    {companies.find(c => c.id === removeCampaignData.companyId)?.campaigns?.map(camp => (
                                        <option key={camp.id} value={camp.id}>{camp.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest ml-1">Note</label>
                                <input 
                                    type="text" 
                                    value={removeCampaignData.note}
                                    onChange={(e) => setRemoveCampaignData({...removeCampaignData, note: e.target.value})}
                                    className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-4 py-3 text-[11px] text-white uppercase tracking-widest outline-none transition-all"
                                    placeholder="Morning FB traffic - English"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setShowRemoveCampaign(false)} className="flex-1 bg-zinc-900/50 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest py-4 hover:text-white transition-all">Cancel</button>
                                <button onClick={handleRemoveCampaign} className="flex-1 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest py-4 hover:bg-red-600 hover:text-white transition-all">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Edit Campaign */}
            {showEditCampaign && editingCampaign && (
                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-start sm:justify-center p-4 overflow-y-auto custom-scroll">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fadeIn" onClick={() => { setShowEditCampaign(false); setEditingCampaign(null); }}></div>
                    <div className="bg-[#0c0c0c] border border-zinc-800 w-full max-w-lg relative z-10 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.9)] animate-scaleUp my-8 sm:my-20 max-h-none sm:max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-900/50 bg-zinc-950/50 flex-shrink-0">
                            <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-[0.3em]">Edit Campaign</h3>
                            <button onClick={() => { setShowEditCampaign(false); setEditingCampaign(null); }} className="text-zinc-600 hover:text-white transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto custom-scroll">
                            <div className="space-y-2">
                                <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest ml-1">Campaign Name</label>
                                <input 
                                    type="text" 
                                    value={campaignForm.name}
                                    onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                                    className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-4 py-3 text-[11px] text-white uppercase tracking-widest outline-none transition-all"
                                    placeholder="ENTER NAME..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest ml-1">Start Date</label>
                                    <input 
                                        type="date" 
                                        value={campaignForm.start_date}
                                        onChange={(e) => setCampaignForm({...campaignForm, start_date: e.target.value})}
                                        className="w-full bg-black border border-zinc-900 px-4 py-3 text-[11px] text-white outline-none focus:border-[#D4AF37]/30 [color-scheme:dark]" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest ml-1">Start Time</label>
                                    <select 
                                        className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-4 py-3 text-[11px] text-white uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer"
                                        value={campaignForm.start_time}
                                        onChange={(e) => setCampaignForm({...campaignForm, start_time: e.target.value})}
                                    >
                                        {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest ml-1">End Date</label>
                                    <input 
                                        type="date" 
                                        disabled={campaignForm.is_ongoing} 
                                        value={campaignForm.end_date}
                                        onChange={(e) => setCampaignForm({...campaignForm, end_date: e.target.value})}
                                        className="w-full bg-black border border-zinc-900 px-4 py-3 text-[11px] text-white outline-none disabled:opacity-30 focus:border-[#D4AF37]/30 [color-scheme:dark]" 
                                    />
                                </div>
                                <div className="space-y-2 flex items-end pb-3">
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            id="edit-ongoing"
                                            checked={campaignForm.is_ongoing}
                                            onChange={(e) => setCampaignForm({...campaignForm, is_ongoing: e.target.checked})}
                                            className="accent-[#D4AF37] h-3 w-3" 
                                        />
                                        <label htmlFor="edit-ongoing" className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.2em] cursor-pointer">Ongoing</label>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest ml-1">Daily Budget</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-[11px]">$</span>
                                        <input 
                                            type="text" 
                                            value={campaignForm.daily_budget}
                                            onChange={(e) => setCampaignForm({...campaignForm, daily_budget: e.target.value})}
                                            className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 pl-8 pr-4 py-3 text-[11px] text-white outline-none transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest ml-1">Est. Volume</label>
                                    <input 
                                        type="text" 
                                        value={campaignForm.est_volume}
                                        onChange={(e) => setCampaignForm({...campaignForm, est_volume: e.target.value})}
                                        className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-4 py-3 text-[11px] text-white outline-none transition-all uppercase"
                                        placeholder="VOLUME..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest ml-1">Source</label>
                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <select 
                                            className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-4 py-3 text-[11px] text-white uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer"
                                            value={campaignForm.source}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setCampaignForm({...campaignForm, source: val});
                                                setShowOtherSource(val === 'other');
                                            }}
                                        >
                                            <option value="">Select Source</option>
                                            <option value="fb">Facebook Ads</option>
                                            <option value="google">Google Search</option>
                                            <option value="direct">Direct Traffic</option>
                                            <option value="other">Other...</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                                        </div>
                                    </div>
                                    {showOtherSource && (
                                        <input 
                                            type="text"
                                            placeholder="ENTER CUSTOM SOURCE..."
                                            className="flex-[1.5] bg-black border border-[#D4AF37]/50 px-4 py-3 text-[11px] text-white uppercase tracking-widest outline-none transition-all animate-in slide-in-from-left-2 duration-200"
                                            value={otherSource}
                                            onChange={(e) => setOtherSource(e.target.value)}
                                            autoFocus
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest ml-1">Lead Description</label>
                                <textarea 
                                    value={campaignForm.lead_description}
                                    onChange={(e) => setCampaignForm({...campaignForm, lead_description: e.target.value})}
                                    className="w-full bg-black border border-zinc-900 focus:border-[#D4AF37]/50 px-4 py-3 text-[11px] text-white uppercase tracking-widest outline-none transition-all h-20 resize-none"
                                    placeholder="ENTER SPECIFICATIONS..."
                                />
                            </div>
                            <div className="flex flex-col gap-4 pt-4">
                                {addCampaignError && (
                                    <p className="text-[9px] text-red-500 uppercase tracking-widest text-center">{addCampaignError}</p>
                                )}
                                <div className="flex gap-4">
                                    <button onClick={() => { setShowEditCampaign(false); setEditingCampaign(null); }} className="flex-1 bg-zinc-900/50 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest py-4 hover:text-white transition-all">Cancel</button>
                                    <button onClick={handleUpdateCampaign} disabled={loading} className="flex-1 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest py-4 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50">
                                        {loading ? 'Processing...' : 'Update'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Modal */}
            <NotificationModal 
                isOpen={notification.isOpen}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClose={() => setNotification({ ...notification, isOpen: false })}
                onConfirm={notification.onConfirm}
            />
        </div>
    );
};

export default CompanyManagement;
