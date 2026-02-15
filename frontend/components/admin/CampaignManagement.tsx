
import React, { useState } from 'react';
import { adminApi } from '../../api';
import { Company, Campaign } from '../../api/admin';
import NotificationModal from '../NotificationModal';
import { 
    useCompanies, 
    useCampaigns, 
    useCreateCampaign, 
    useUpdateCampaign, 
    useRemoveCampaign 
} from '../../hooks/useAdmin';

const CampaignManagement: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(12); // Grid layout, 3 columns
  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns(page, limit);
  const { data: companiesData } = useCompanies(1, 1000); // Load many for selection
  
  const campaigns = campaignsData?.campaigns || [];
  const companies = companiesData?.companies || [];

  const createCampaignMutation = useCreateCampaign();
  const updateCampaignMutation = useUpdateCampaign();
  const removeCampaignMutation = useRemoveCampaign();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [showOtherSource, setShowOtherSource] = useState(false);
  const [otherSource, setOtherSource] = useState('');

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

  const [formData, setFormData] = useState({
    name: '',
    company_id: '',
    startDate: '',
    startTime: '9:00 AM',
    endDate: '',
    isOngoing: false,
    dailyBudget: '',
    estimatedVolume: '',
    source: '',
    description: ''
  });

  const loading = campaignsLoading || createCampaignMutation.isPending || updateCampaignMutation.isPending || removeCampaignMutation.isPending;

  const handleSave = async () => {
    if (!formData.name || !formData.company_id) {
       showAlert('Validation Error', 'Campaign Name and Company are required.', 'error');
       return;
    }

    // Validate numeric fields
    if (formData.dailyBudget && isNaN(Number(formData.dailyBudget))) {
      showAlert('Validation Error', 'Daily Budget must be a valid number.', 'error');
      return;
    }

    if (formData.estimatedVolume && !Number.isInteger(Number(formData.estimatedVolume))) {
      showAlert('Validation Error', 'Estimated Volume must be a whole (integer) number.', 'error');
      return;
    }

    const finalSource = showOtherSource ? otherSource : formData.source;

    try {
      await createCampaignMutation.mutateAsync({
        name: formData.name,
        company_id: formData.company_id,
        start_date: formData.startDate,
        start_time: formData.startTime,
        end_date: formData.isOngoing ? undefined : formData.endDate,
        is_ongoing: formData.isOngoing,
        daily_budget: formData.dailyBudget,
        est_volume: formData.estimatedVolume,
        source: finalSource,
        lead_description: formData.description
      });
      showAlert('Success', 'Campaign protocol deployed successfully.', 'success');
      setShowAddForm(false);
      resetForm();
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      const detail = error instanceof Error ? error.message : 'Failed to deploy campaign protocol.';
      showAlert('Deployment Error', detail, 'error');
    }
  };

  const handleRemove = async (id: string) => {
    showConfirm(
      'Terminate Protocol', 
      'Are you sure you want to terminate this campaign protocol?',
      async () => {
        try {
          await removeCampaignMutation.mutateAsync(id);
          showAlert('Success', 'Campaign protocol terminated.', 'success');
        } catch (error: any) {
          console.error('Error removing campaign:', error);
          const detail = error instanceof Error ? error.message : 'Failed to terminate protocol.';
          showAlert('Error', detail, 'error');
        }
      }
    );
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    
    const standardSources = ['fb', 'google', 'direct'];
    const isStandard = !campaign.source || standardSources.includes(campaign.source);

    setFormData({
      name: campaign.name || '',
      company_id: campaign.company_id || '',
      startDate: campaign.start_date || '',
      startTime: campaign.start_time || '9:00 AM',
      endDate: campaign.end_date || '',
      isOngoing: campaign.is_ongoing || false,
      dailyBudget: String(campaign.daily_budget || ''),
      estimatedVolume: String(campaign.est_volume || ''),
      source: isStandard ? (campaign.source || '') : 'other',
      description: campaign.lead_description || ''
    });

    if (!isStandard) {
        setShowOtherSource(true);
        setOtherSource(campaign.source || '');
    } else {
        setShowOtherSource(false);
        setOtherSource('');
    }

    setShowEditForm(true);
  };

  const handleUpdate = async () => {
    if (!editingCampaign) return;
    if (!formData.name) {
      showAlert('Validation Error', 'Campaign Name is required.', 'error');
      return;
    }

    // Validate numeric fields
    if (formData.dailyBudget && isNaN(Number(formData.dailyBudget))) {
      showAlert('Validation Error', 'Daily Budget must be a valid number.', 'error');
      return;
    }

    if (formData.estimatedVolume && !Number.isInteger(Number(formData.estimatedVolume))) {
      showAlert('Validation Error', 'Estimated Volume must be a whole (integer) number.', 'error');
      return;
    }

    const finalSource = showOtherSource ? otherSource : formData.source;
    try {
      await updateCampaignMutation.mutateAsync({
        id: editingCampaign.id,
        data: {
            name: formData.name,
            company_id: formData.company_id,
            start_date: formData.startDate,
            start_time: formData.startTime,
            end_date: formData.isOngoing ? undefined : formData.endDate,
            is_ongoing: formData.isOngoing,
            daily_budget: formData.dailyBudget,
            est_volume: formData.estimatedVolume,
            source: finalSource,
            lead_description: formData.description
        }
      });
      showAlert('Success', 'Campaign updated successfully.', 'success');
      setShowEditForm(false);
      setEditingCampaign(null);
      resetForm();
    } catch (error: any) {
      console.error('Error updating campaign:', error);
      const detail = error instanceof Error ? error.message : 'Failed to update campaign.';
      showAlert('Error', detail, 'error');
    }
  };

  const resetForm = () => {
    setShowOtherSource(false);
    setOtherSource('');
    setFormData({
      name: '',
      company_id: '',
      startDate: '',
      startTime: '9:00 AM',
      endDate: '',
      isOngoing: false,
      dailyBudget: '',
      estimatedVolume: '',
      source: '',
      description: ''
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black font-display animate-fadeIn">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900/50 pb-6 mb-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            Campaign <span className="text-[#D4AF37]">Management</span>
          </h2>
          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-black">Strategic Campaign Orchestration & Deployment</p>
        </div>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          >
            Create New Campaign
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll pr-2 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
          {campaigns.length === 0 ? (
            <div className="col-span-full py-12 text-center border border-dashed border-zinc-900">
              <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em]">No campaigns deployed</p>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-[#09090b] border border-zinc-900 p-6 hover:border-[#D4AF37]/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 flex gap-2">
                  <button 
                    onClick={() => handleEdit(campaign)}
                    className="p-2 text-zinc-800 hover:text-[#D4AF37] transition-colors"
                    title="Edit"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button 
                    onClick={() => handleRemove(campaign.id)}
                    className="p-2 text-zinc-800 hover:text-red-500 transition-colors"
                    title="Remove"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                </div>
                <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-3">
                  {campaign.companies?.name || 'Active Campaign'}
                </p>
                <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-6 group-hover:text-[#D4AF37] transition-colors">{campaign.name}</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-widest border-b border-zinc-900/50 pb-2">
                    <span className="text-zinc-500">Daily Budget</span>
                    <span className="text-white">${campaign.daily_budget || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-widest border-b border-zinc-900/50 pb-2">
                    <span className="text-zinc-500">Est. Volume</span>
                    <span className="text-white">{campaign.est_volume || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-widest">
                    <span className="text-zinc-500">Source</span>
                    <span className="text-blue-500 uppercase">{campaign.source || 'N/A'}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleEdit(campaign)}
                  className="w-full mt-6 py-3 bg-zinc-950 border border-zinc-900 text-zinc-500 text-[8px] font-black uppercase tracking-widest hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
                >
                  View Details / Edit
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {campaignsData && campaignsData.total > limit && (
          <div className="flex items-center justify-between px-6 py-8 border-t border-zinc-900 mt-4 mb-8">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, campaignsData.total)} of {campaignsData.total} Campaigns
            </div>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-6 py-3 border border-zinc-800 text-[10px] uppercase font-black tracking-widest hover:border-[#D4AF37] disabled:opacity-30 disabled:hover:border-zinc-800 transition-all text-white"
              >
                Previous
              </button>
              <button 
                disabled={page * limit >= campaignsData.total}
                onClick={() => setPage(p => p + 1)}
                className="px-6 py-3 border border-zinc-800 text-[10px] uppercase font-black tracking-widest hover:border-[#D4AF37] disabled:opacity-30 disabled:hover:border-zinc-800 transition-all text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Campaign Modal - Wrapped for Responsiveness */}
      {showAddForm && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-start sm:justify-center p-4 overflow-y-auto custom-scroll">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fadeIn" onClick={() => setShowAddForm(false)}></div>
          <div className="bg-[#09090b] border border-zinc-900 shadow-2xl relative overflow-hidden max-w-2xl w-full my-8 sm:my-20 max-h-none sm:max-h-[90vh] flex flex-col z-10 animate-scaleUp">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 -mr-16 -mt-16 rounded-full blur-3xl pointer-events-none" />
            
            {/* Form Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-black/40 flex-shrink-0">
              <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-[0.4em]">Add Campaign</h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="p-2 text-zinc-600 hover:text-[#D4AF37] transition-all border border-zinc-900 hover:border-[#D4AF37]/30 group"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:rotate-90 transition-transform duration-300"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto custom-scroll">
              {/* Company Selection - NEW */}
              <div className="space-y-4">
                <label className="text-[9px] text-[#D4AF37]/70 font-black uppercase tracking-[0.3em]">Target Company / Entity</label>
                <div className="relative group">
                  <select 
                    className="w-full bg-black/50 border border-zinc-900 p-3 appearance-none text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37]/50 transition-all uppercase tracking-widest"
                    value={formData.company_id}
                    onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                  >
                    <option value="">SELECT COMPANY...</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none p-1.5 border border-zinc-900 rounded group-hover:border-[#D4AF37]/30 transition-colors">
                    <svg className="text-zinc-700 group-hover:text-[#D4AF37] transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              {/* Campaign Name */}
              <div className="space-y-4">
                <label className="text-[9px] text-[#D4AF37]/70 font-black uppercase tracking-[0.3em]">Campaign Name</label>
                <input 
                  type="text"
                  placeholder="ENTER CAMPAIGN NAME..."
                  className="w-full bg-black/50 border border-zinc-900 p-3 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-zinc-800 uppercase tracking-widest"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* Start Date & Time */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[9px] text-[#D4AF37]/70 font-black uppercase tracking-[0.3em]">Start Date & Time</label>
                  <div className="flex gap-6 items-center">
                    <div className="relative flex-1 group">
                      <input 
                        type="date"
                        className="w-full bg-black/50 border border-zinc-900 p-3 pr-4 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37]/50 transition-all uppercase tracking-widest [color-scheme:dark]"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      />
                    </div>
                    <div className="text-zinc-800 font-black">—</div>
                    <div className="relative flex-1 group">
                      <select 
                        className="w-full bg-black/50 border border-zinc-900 p-3 pr-10 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37]/50 appearance-none transition-all uppercase tracking-widest"
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      >
                        <option>9:00 AM</option>
                        <option>10:00 AM</option>
                        <option>11:00 AM</option>
                        <option>12:00 PM</option>
                        <option>01:00 PM</option>
                        <option>02:00 PM</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 border border-zinc-900 rounded group-hover:border-[#D4AF37]/30 transition-colors">
                        <svg className="text-zinc-700 group-hover:text-[#D4AF37] transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] text-[#D4AF37]/70 font-black uppercase tracking-[0.3em]">End Date & Time</label>
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setFormData({...formData, isOngoing: !formData.isOngoing})}>
                      <div className={`w-5 h-5 border border-zinc-900 flex items-center justify-center transition-all ${formData.isOngoing ? 'bg-[#D4AF37] border-[#D4AF37]' : 'bg-black'}`}>
                        {formData.isOngoing && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">Ongoing</span>
                    </div>
                  </div>
                  <div className="relative group">
                    <input 
                      type="date"
                      disabled={formData.isOngoing}
                      className={`w-full bg-black/50 border border-zinc-900 p-3 pr-4 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37]/50 transition-all uppercase tracking-widest [color-scheme:dark] ${formData.isOngoing ? 'opacity-20 cursor-not-allowed border-zinc-950' : ''}`}
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Budget & Volume */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[9px] text-[#D4AF37]/70 font-black uppercase tracking-[0.3em]">Daily Budget</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37] font-black text-sm">$</div>
                    <input 
                      type="text"
                      placeholder="0.00"
                      className="w-full bg-black/50 border border-zinc-900 p-3 pl-9 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37]/50 transition-all uppercase tracking-widest"
                      value={formData.dailyBudget}
                      onChange={(e) => setFormData({...formData, dailyBudget: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] text-[#D4AF37]/70 font-black uppercase tracking-[0.3em]">Estimated Volume</label>
                  <input 
                    type="text"
                    placeholder="ENTER VOLUME..."
                    className="w-full bg-black/50 border border-zinc-900 p-3 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-zinc-800 uppercase tracking-widest"
                    value={formData.estimatedVolume}
                    onChange={(e) => setFormData({...formData, estimatedVolume: e.target.value})}
                  />
                </div>
              </div>

              {/* Source */}
              <div className="space-y-4">
                <label className="text-[9px] text-[#D4AF37]/70 font-black uppercase tracking-[0.3em]">Source</label>
                <div className="flex gap-4">
                  <div className="relative flex-1 group">
                    <select 
                      className="w-full bg-black/50 border border-zinc-900 p-3 appearance-none text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37]/50 transition-all uppercase tracking-widest"
                      value={formData.source}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({...formData, source: val});
                        if (val === 'other') setShowOtherSource(true);
                        else setShowOtherSource(false);
                      }}
                    >
                      <option value="">SELECT SOURCE...</option>
                      <option value="fb">Facebook Ads</option>
                      <option value="google">Google Search</option>
                      <option value="direct">Direct Traffic</option>
                      <option value="other">Other...</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none p-1.5 border border-zinc-900 rounded group-hover:border-[#D4AF37]/30 transition-colors">
                      <svg className="text-zinc-700 group-hover:text-[#D4AF37] transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>

                  {showOtherSource && (
                    <div className="flex-[1.5] animate-in slide-in-from-left-4 duration-300">
                      <input 
                        type="text"
                        placeholder="ENTER CUSTOM SOURCE..."
                        className="w-full bg-black/50 border border-[#D4AF37]/30 p-3 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37] transition-all uppercase tracking-widest placeholder:text-zinc-800"
                        value={otherSource}
                        onChange={(e) => setOtherSource(e.target.value)}
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Description */}
              <div className="space-y-4">
                <label className="text-[9px] text-[#D4AF37]/70 font-black uppercase tracking-[0.3em]">Lead Description</label>
                <textarea 
                  rows={4}
                  placeholder="ENTER CAMPAIGN SPECIFICATIONS..."
                  className="w-full bg-black/50 border border-zinc-900 p-4 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-zinc-800 resize-none uppercase tracking-widest leading-relaxed"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
            </div>

            {/* Form Footer */}
            <div className="px-6 py-4 bg-black/60 border-t border-zinc-900 flex justify-end gap-4 flex-shrink-0">
              <button 
                onClick={() => { setShowAddForm(false); resetForm(); }}
                className="px-6 py-2 border border-zinc-900 text-zinc-500 text-[9px] font-black uppercase tracking-[0.4em] hover:bg-zinc-900 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-[0.4em] hover:bg-white hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all shadow-2xl shadow-[#D4AF37]/20 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Save Protocol'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {showEditForm && editingCampaign && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-start sm:justify-center p-4 overflow-y-auto custom-scroll">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fadeIn" onClick={() => { setShowEditForm(false); setEditingCampaign(null); resetForm(); }}></div>
          <div className="bg-[#09090b] border border-zinc-900 shadow-2xl relative overflow-hidden max-w-2xl w-full my-8 sm:my-20 max-h-none sm:max-h-[90vh] flex flex-col z-10 animate-scaleUp">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 -mr-16 -mt-16 rounded-full blur-3xl pointer-events-none" />
            
            {/* Form Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-black/40 flex-shrink-0">
              <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-[0.4em]">Edit Campaign</h3>
              <button 
                onClick={() => { setShowEditForm(false); setEditingCampaign(null); resetForm(); }}
                className="p-2 text-zinc-600 hover:text-[#D4AF37] transition-all border border-zinc-900 hover:border-[#D4AF37]/30 group"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:rotate-90 transition-transform duration-300"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto custom-scroll">
              {/* Company Selection */}
              <div className="space-y-4">
                <label className="text-[9px] text-[#D4AF37]/70 font-black uppercase tracking-[0.3em]">Target Company / Entity</label>
                <div className="relative group">
                  <select 
                    className="w-full bg-black/50 border border-zinc-900 p-3 appearance-none text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37]/50 transition-all uppercase tracking-widest"
                    value={formData.company_id}
                    onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                  >
                    <option value="">SELECT COMPANY...</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none p-1.5 border border-zinc-900 rounded group-hover:border-[#D4AF37]/30 transition-colors">
                    <svg className="text-zinc-700 group-hover:text-[#D4AF37] transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              {/* Campaign Name */}
              <div className="space-y-4">
                <label className="text-[9px] text-[#D4AF37]/70 font-black uppercase tracking-[0.3em]">Campaign Name</label>
                <input 
                  type="text"
                  placeholder="ENTER CAMPAIGN NAME..."
                  className="w-full bg-black/50 border border-zinc-900 p-3 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-zinc-800 uppercase tracking-widest"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* Start Date & Time */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[9px] text-[#D4AF37]/70 font-black uppercase tracking-[0.3em]">Start Date & Time</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="date"
                      className="flex-1 bg-black/50 border border-zinc-900 p-3 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37]/50 transition-all uppercase tracking-widest [color-scheme:dark]"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                    <select 
                      className="flex-1 bg-black/50 border border-zinc-900 p-3 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37]/50 appearance-none transition-all uppercase tracking-widest"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    >
                      {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(t => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] text-[#D4AF37]/70 font-black uppercase tracking-[0.3em]">End Date</label>
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setFormData({...formData, isOngoing: !formData.isOngoing})}>
                      <div className={`w-5 h-5 border border-zinc-900 flex items-center justify-center transition-all ${formData.isOngoing ? 'bg-[#D4AF37] border-[#D4AF37]' : 'bg-black'}`}>
                        {formData.isOngoing && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">Ongoing</span>
                    </div>
                  </div>
                  <input 
                    type="date"
                    disabled={formData.isOngoing}
                    className={`w-full bg-black/50 border border-zinc-900 p-3 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37]/50 transition-all uppercase tracking-widest [color-scheme:dark] ${formData.isOngoing ? 'opacity-20 cursor-not-allowed' : ''}`}
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              {/* Budget & Volume */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[9px] text-[#D4AF37]/70 font-black uppercase tracking-[0.3em]">Daily Budget</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37] font-black text-sm">$</div>
                    <input 
                      type="text"
                      placeholder="0.00"
                      className="w-full bg-black/50 border border-zinc-900 p-3 pl-9 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37]/50 transition-all uppercase tracking-widest"
                      value={formData.dailyBudget}
                      onChange={(e) => setFormData({...formData, dailyBudget: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] text-[#D4AF37]/70 font-black uppercase tracking-[0.3em]">Estimated Volume</label>
                  <input 
                    type="text"
                    placeholder="ENTER VOLUME..."
                    className="w-full bg-black/50 border border-zinc-900 p-3 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-zinc-800 uppercase tracking-widest"
                    value={formData.estimatedVolume}
                    onChange={(e) => setFormData({...formData, estimatedVolume: e.target.value})}
                  />
                </div>
              </div>

              {/* Source */}
              <div className="space-y-4">
                <label className="text-[9px] text-[#D4AF37]/70 font-black uppercase tracking-[0.3em]">Source</label>
                <div className="flex gap-4">
                  <div className="relative flex-1 group">
                    <select 
                      className="w-full bg-black/50 border border-zinc-900 p-3 appearance-none text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37]/50 transition-all uppercase tracking-widest"
                      value={formData.source}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({...formData, source: val});
                        if (val === 'other') setShowOtherSource(true);
                        else setShowOtherSource(false);
                      }}
                    >
                      <option value="">SELECT SOURCE...</option>
                      <option value="fb">Facebook Ads</option>
                      <option value="google">Google Search</option>
                      <option value="direct">Direct Traffic</option>
                      <option value="other">Other...</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none p-1 border border-zinc-900 rounded group-hover:border-[#D4AF37]/30 transition-colors">
                      <svg className="text-zinc-700 group-hover:text-[#D4AF37] transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>

                  {showOtherSource && (
                    <div className="flex-[1.5] animate-in slide-in-from-left-4 duration-300">
                      <input 
                        type="text"
                        placeholder="ENTER CUSTOM SOURCE..."
                        className="w-full bg-black/50 border border-[#D4AF37]/30 p-3 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37] transition-all uppercase tracking-widest placeholder:text-zinc-800"
                        value={otherSource}
                        onChange={(e) => setOtherSource(e.target.value)}
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Description */}
              <div className="space-y-4">
                <label className="text-[9px] text-[#D4AF37]/70 font-black uppercase tracking-[0.3em]">Lead Description</label>
                <textarea 
                  rows={4}
                  placeholder="ENTER CAMPAIGN SPECIFICATIONS..."
                  className="w-full bg-black/50 border border-zinc-900 p-4 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-zinc-800 resize-none uppercase tracking-widest leading-relaxed"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
            </div>

            {/* Form Footer */}
            <div className="px-6 py-4 bg-black/60 border-t border-zinc-900 flex justify-end gap-4 flex-shrink-0">
              <button 
                onClick={() => { setShowEditForm(false); setEditingCampaign(null); resetForm(); }}
                className="px-6 py-2 border border-zinc-900 text-zinc-500 text-[9px] font-black uppercase tracking-[0.4em] hover:bg-zinc-900 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                disabled={loading}
                className="px-6 py-2 bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-[0.4em] hover:bg-white hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all shadow-2xl shadow-[#D4AF37]/20 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Update Campaign'}
              </button>
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

export default CampaignManagement;
