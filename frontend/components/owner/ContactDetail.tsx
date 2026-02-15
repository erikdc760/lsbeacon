import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  text: string;
  type: string;
  timestamp: string;
  sender: string;
}

interface ContactDetailProps {
  contact: any;
  onBack: () => void;
}

const ContactDetail: React.FC<ContactDetailProps> = ({ contact, onBack }) => {
  const [activeLeftTab, setActiveLeftTab] = useState<'contact' | 'company'>('contact');
  const [activeCommTab, setActiveCommTab] = useState('sms');
  const [message, setMessage] = useState('');
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [owner, setOwner] = useState('Gabriel_Castillo');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: contact?.name?.split(' ')[0] || 'Mario',
    lastName: contact?.name?.split(' ')[1] || 'Marin',
    address: '4838 Holly Ave',
    city: 'Long Beach',
    state: 'California',
    postalCode: '90805',
    phone: contact?.phone || '+1 562-825-6254',
    email: contact?.email || 'mario@example.com',
    dob: 'Dec 3rd 1958',
    insuranceProvider: 'GTL',
    rateClass: 'Guaranteed Issue',
    policyNumber: 'GTL6192204',
    monthlyPremium: '141.99',
    monthlyDraft: '3',
    policyWhy: 'protecting spouse. prior client wanting another policy',
    annualPremium: '1,704.00',
    coverageAmount: '15,000.00',
    insured: 'mario',
    beneficiary: 'illia',
    initialDraft: 'Nov 3rd 2025',
    applicationDate: 'Nov 1st 2025',
    levelGraded: 'Level',
    freePaidLeads: 'FREE LEAD',
    leadType: 'free',
    notesOnSale: 'another family protected',
    closerClubLead: 'No',
    contactSource: 'submit sale form',
    contactType: 'Lead',
    businessName: '',
    country: 'United States',
    website: '',
    timeZone: 'GMT-08:00 America/Los_Angeles (PST)',
    leadOrigin: 'None Of The Above',
    yourTeam: 'Select',
    workLocation: '',
    officeLocation: 'Riverside'
  });

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: `Opportunity created: ${formData.firstName} ${formData.lastName} created in stage Sold`, type: 'internal', timestamp: '05:50 PM', sender: 'System' }
  ]);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    contact: false,
    policyInfo: false,
    leads: false,
    additionalInfo: false,
    generalInfo: false,
    submitSaleForm: false,
    quiz: false
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      type: activeCommTab,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'Me'
    };
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  const FormDropdown = ({ label, value, options, onChange, tagColor }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="space-y-1 relative">
        {label && <label className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider">{label}</label>}
        <div 
          className="w-full bg-zinc-950 border border-zinc-900 p-1.5 text-[11px] text-white font-medium focus:outline-none flex items-center justify-between cursor-pointer hover:border-[#D4AF37]/50 transition-all"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
             {tagColor ? (
                <div className={`flex items-center ${tagColor === 'red' ? 'bg-red-500/10 text-red-500 border-red-500/20' : tagColor === 'blue' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-zinc-800 text-zinc-300 border-zinc-700'} text-[8px] px-1.5 py-0.5 rounded border font-bold`}>
                  {value}
                  <svg className="ml-1 opacity-50" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </div>
             ) : (
                <span className={!value ? 'text-zinc-800' : 'text-zinc-200'}>{value || 'Select...'}</span>
             )}
          </div>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-zinc-700 transition-transform ${isOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
        </div>
        
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />
            <div className="absolute z-[100] left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((opt: string) => (
                <div 
                  key={opt}
                  className="px-3 py-2 text-[10px] text-zinc-400 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] cursor-pointer transition-colors font-bold uppercase border-b border-zinc-900/50 last:border-0"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const DatePickerField = ({ label, value, onChange }: any) => (
    <div className="space-y-1">
        <label className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider">{label}</label>
        <div className="relative">
            <input 
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 p-1.5 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37] transition-all"
            />
            <svg className="absolute right-2 top-2 text-zinc-800" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#050505] font-display text-zinc-300 overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 sm:py-2 bg-[#09090b] border-b border-zinc-900 shrink-0 gap-3">
        <div className="flex items-center gap-4 lg:gap-6 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={onBack}
              className="p-1 hover:bg-zinc-800 rounded-full transition-colors text-[#D4AF37]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <h1 className="text-xs lg:text-sm font-black text-white uppercase tracking-widest whitespace-nowrap">{formData.firstName} {formData.lastName}</h1>
          </div>
          <div className="flex items-center gap-4 text-[9px] lg:text-[10px] text-zinc-500 font-bold uppercase tracking-wider shrink-0">
            <div className="flex items-center gap-2">
              <span>1 of 4 selected</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-0.5 hover:text-[#D4AF37]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button className="p-0.5 hover:text-[#D4AF37]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        </div>
        <button className="w-full sm:w-auto bg-[#22c55e] hover:bg-green-600 text-white px-4 py-2 sm:py-1.5 rounded text-[9px] lg:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
          Add Sale
        </button>
      </div>

      {/* Main Container */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        
        {/* LEFT COLUMN - Fields */}
        <div className="w-full lg:w-[320px] flex flex-col bg-[#09090b] border-b lg:border-b-0 lg:border-r border-zinc-900 shrink-0 h-1/2 lg:h-full">
          {/* Tabs */}
          <div className="flex border-b border-zinc-900 shrink-0">
            <button 
              className={`flex-1 py-3 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeLeftTab === "contact" ? "text-blue-500" : "text-zinc-600 hover:text-zinc-400"}`}
              onClick={() => setActiveLeftTab("contact")}
            >
              Contact
              {activeLeftTab === "contact" && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-blue-500" />}
            </button>
            <button 
              className={`flex-1 py-3 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeLeftTab === "company" ? "text-blue-500" : "text-zinc-600 hover:text-zinc-400"}`}
              onClick={() => setActiveLeftTab("company")}
            >
              Company
              {activeLeftTab === "company" && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-blue-500" />}
            </button>
          </div>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6 bg-[#050505]">
            
            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" className="w-3 h-3 rounded bg-zinc-900 border-zinc-800 text-[#D4AF37] focus:ring-0 focus:ring-offset-0" />
              <label className="text-[9px] lg:text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hide empty fields</label>
            </div>

            {/* Contact Section */}
            <div className="border border-zinc-900 bg-zinc-900/30">
              <button 
                onClick={() => toggleSection("contact")}
                className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
               >
                <span className="text-[9px] lg:text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${expandedSections.contact ? "rotate-0" : "-rotate-90"}`}><path d="M9 18l6-6-6-6"/></svg>
                    Contact
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-zinc-500 transition-transform ${expandedSections.contact ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6"/></svg>
              </button>

              {expandedSections.contact && (
                <div className="p-3 space-y-3 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider">First Name</label>
                    <input 
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 p-1.5 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37] transition-all rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider">Last Name</label>
                    <input 
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 p-1.5 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37] transition-all rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider">Street Address</label>
                      <div className="hidden sm:flex items-center gap-1.5 grayscale opacity-70">
                         <span className="text-[7px] text-zinc-700 font-bold uppercase">View maps:</span>
                         <div className="flex gap-1">
                            <div className="w-3.5 h-3.5 rounded bg-blue-600 flex items-center justify-center p-0.5"><svg viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>
                            <div className="w-3.5 h-3.5 rounded overflow-hidden"><img src="https://www.google.com/images/branding/product/ico/maps15_b_48dp.png" className="w-full h-full object-cover" /></div>
                            <div className="w-3.5 h-3.5 rounded bg-zinc-800 flex items-center justify-center p-0.5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-400"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
                         </div>
                      </div>
                    </div>
                    <input 
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 p-1.5 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37] transition-all rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider">City</label>
                    <input 
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 p-1.5 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37] transition-all rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider">State</label>
                    <input 
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 p-1.5 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37] transition-all rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider">Postal Code</label>
                    <input 
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 p-1.5 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37] transition-all rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider">Phone</label>
                    <div className="relative">
                      <input 
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 p-1.5 pr-8 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37] transition-all rounded"
                      />
                      <button className="absolute right-2 top-1.5 text-zinc-800 hover:text-[#D4AF37] transition-colors"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider">Email</label>
                    <div className="relative">
                      <input 
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 p-1.5 pr-8 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37] transition-all rounded placeholder:text-zinc-800"
                      />
                      <button className="absolute right-2 top-1.5 text-zinc-800 hover:text-[#D4AF37] transition-colors"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider">Date Of Birth</label>
                    <div className="relative">
                      <input 
                        value={formData.dob}
                        onChange={(e) => handleInputChange("dob", e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 p-1.5 pr-8 text-[11px] text-white font-medium focus:outline-none focus:border-[#D4AF37] transition-all rounded"
                      />
                      <button className="absolute right-2 top-1.5 text-zinc-800 hover:text-red-500 transition-colors" onClick={() => handleInputChange("dob", "")}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Policy Info Section */}
            <div className="border border-zinc-900 bg-zinc-900/30">
              <button 
                onClick={() => toggleSection("policyInfo")}
                className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
               >
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${expandedSections.policyInfo ? "rotate-0" : "-rotate-90"}`}><path d="M9 18l6-6-6-6"/></svg>
                    Policy Info
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-zinc-500 transition-transform ${expandedSections.policyInfo ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6"/></svg>
              </button>

              {expandedSections.policyInfo && (
                <div className="p-3 space-y-3 animate-fadeIn">
                  
                  <FormDropdown 
                    label="Insurance Provider"
                    value={formData.insuranceProvider}
                    options={["GTL", "Foresters", "Mutual of Omaha", "TransAmerica", "SBLI", "CICA", "Baltimore Life", "Royal Neighbors of America", "Family Benefit", "Trinity", "Combined", "Aflac", "Liberty Bankers", "North American", "F&G", "Fidelity Life", "Elco Mutual", "Gerber"]}
                    onChange={(val: string) => handleInputChange("insuranceProvider", val)}
                  />

                  <FormDropdown 
                    label="Rate Class"
                    value={formData.rateClass}
                    options={["Guaranteed Issue", "Preferred", "Standard", "Grader"]}
                    onChange={(val: string) => handleInputChange("rateClass", val)}
                    tagColor="red"
                  />

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Policy #</label>
                    <input 
                      value={formData.policyNumber}
                      onChange={(e) => handleInputChange("policyNumber", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 p-2 text-xs text-white font-medium focus:outline-none focus:border-[#D4AF37] transition-all rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Monthly Premium</label>
                      <div className="relative">
                        <span className="absolute left-2 top-2 text-zinc-500 text-xs">$</span>
                        <input 
                          value={formData.monthlyPremium}
                          onChange={(e) => handleInputChange("monthlyPremium", e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-900 p-2 pl-6 text-xs text-white font-medium focus:outline-none focus:border-[#D4AF37] transition-all rounded"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Monthly Draft</label>
                      <input 
                        value={formData.monthlyDraft}
                        onChange={(e) => handleInputChange("monthlyDraft", e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 p-2 text-xs text-white font-medium focus:outline-none focus:border-[#D4AF37] transition-all rounded"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Their Why For Having The Policy</label>
                    <textarea 
                      value={formData.policyWhy}
                      onChange={(e) => handleInputChange("policyWhy", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 p-2 text-xs text-white font-medium focus:outline-none focus:border-[#D4AF37] transition-all h-16 resize-none rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Policy Annual Premium</label>
                      <div className="relative">
                        <span className="absolute left-2 top-2 text-zinc-500 text-xs">$</span>
                        <input 
                          value={formData.annualPremium}
                          onChange={(e) => handleInputChange("annualPremium", e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-900 p-2 pl-6 text-[10px] text-[#D4AF37] font-black focus:outline-none rounded"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Coverage Amount</label>
                      <div className="relative">
                        <span className="absolute left-2 top-2 text-zinc-500 text-xs font-medium">$</span>
                        <input 
                          value={formData.coverageAmount}
                          onChange={(e) => handleInputChange("coverageAmount", e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-900 p-2 pl-6 text-xs text-white font-medium focus:outline-none rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Insured</label>
                    <input 
                      value={formData.insured}
                      onChange={(e) => handleInputChange("insured", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 p-2 text-xs text-white font-medium focus:outline-none uppercase rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Policy Beneficiary</label>
                    <input 
                      value={formData.beneficiary}
                      onChange={(e) => handleInputChange("beneficiary", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 p-2 text-xs text-white font-medium focus:outline-none rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <DatePickerField 
                      label="Initial Draft"
                      value={formData.initialDraft}
                      onChange={(val: string) => handleInputChange("initialDraft", val)}
                    />

                    <DatePickerField 
                      label="Application Date"
                      value={formData.applicationDate}
                      onChange={(val: string) => handleInputChange("applicationDate", val)}
                    />
                  </div>

                  <FormDropdown 
                    label="Level/Graded"
                    value={formData.levelGraded}
                    options={["Level", "Graded"]}
                    onChange={(val: string) => handleInputChange("levelGraded", val)}
                  />

                </div>
              )}
            </div>

            {/* LEADS Section */}
            <div className="border border-zinc-900 bg-zinc-900/30">
              <button 
                onClick={() => toggleSection("leads")}
                className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
               >
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${expandedSections.leads ? "rotate-0" : "-rotate-90"}`}><path d="M9 18l6-6-6-6"/></svg>
                    FREE OR PAID LEADS
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-zinc-500 transition-transform ${expandedSections.leads ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6"/></svg>
              </button>

              {expandedSections.leads && (
                <div className="p-3 space-y-4 animate-fadeIn">
                  
                  <FormDropdown 
                    value={formData.freePaidLeads}
                    options={["FREE LEAD", "PAID LEAD"]}
                    onChange={(val: string) => handleInputChange("freePaidLeads", val)}
                    tagColor="blue"
                  />

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Lead Type</label>
                    <input 
                      value={formData.leadType}
                      onChange={(e) => handleInputChange("leadType", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 p-2 text-xs text-white font-medium focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Notes On Sale (For Discord)</label>
                    <input 
                      value={formData.notesOnSale}
                      onChange={(e) => handleInputChange("notesOnSale", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 p-2 text-xs text-white font-medium focus:outline-none"
                    />
                  </div>

                  <FormDropdown 
                    label="Closer Club Lead"
                    value={formData.closerClubLead}
                    options={["Yes", "No"]}
                    onChange={(val: string) => handleInputChange("closerClubLead", val)}
                    tagColor="red"
                  />

                </div>
              )}
            </div>

            {/* Additional Info Section */}
            <div className="border border-zinc-900 bg-zinc-900/30">
              <button 
                onClick={() => toggleSection("additionalInfo")}
                className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
               >
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${expandedSections.additionalInfo ? "rotate-0" : "-rotate-90"}`}><path d="M9 18l6-6-6-6"/></svg>
                    Additional Info
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-zinc-500 transition-transform ${expandedSections.additionalInfo ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6"/></svg>
              </button>

              {expandedSections.additionalInfo && (
                <div className="p-3 space-y-3 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Contact Source</label>
                    <input 
                      value={formData.contactSource}
                      onChange={(e) => handleInputChange("contactSource", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 p-2 text-xs text-white font-medium focus:outline-none focus:border-[#D4AF37] transition-all rounded"
                    />
                  </div>

                  <FormDropdown 
                    label="Contact Type"
                    value={formData.contactType}
                    options={["Lead", "Client", "Prospect"]}
                    onChange={(val: string) => handleInputChange("contactType", val)}
                  />

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Business Name</label>
                    <input 
                      value={formData.businessName}
                      placeholder="Business Name"
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 p-2 text-xs text-white placeholder:text-zinc-800 rounded"
                    />
                  </div>

                  <FormDropdown 
                    label="Country"
                    value={formData.country}
                    options={["United States", "Canada", "Mexico", "United Kingdom"]}
                    onChange={(val: string) => handleInputChange("country", val)}
                  />

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Website</label>
                    <input 
                      value={formData.website}
                      placeholder="Website"
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 p-2 text-xs text-white placeholder:text-zinc-800 rounded"
                    />
                  </div>

                  <FormDropdown 
                    label="Time Zone"
                    value={formData.timeZone}
                    options={["GMT-08:00 America/Los_Angeles (PST)", "GMT-05:00 America/New_York (EST)", "GMT-06:00 America/Chicago (CST)"]}
                    onChange={(val: string) => handleInputChange("timeZone", val)}
                  />
                </div>
              )}
            </div>

            {/* General Info Section */}
            <div className="border border-zinc-900 bg-zinc-900/30">
              <button 
                onClick={() => toggleSection("generalInfo")}
                className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
               >
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${expandedSections.generalInfo ? "rotate-0" : "-rotate-90"}`}><path d="M9 18l6-6-6-6"/></svg>
                    General Info
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-zinc-500 transition-transform ${expandedSections.generalInfo ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {expandedSections.generalInfo && (
                <div className="p-3 space-y-3 animate-fadeIn">
                  <FormDropdown 
                    label="Lead Origin"
                    value={formData.leadOrigin}
                    options={["None Of The Above", "Website", "Referral", "Cold Call"]}
                    onChange={(val: string) => handleInputChange("leadOrigin", val)}
                    tagColor="blue"
                  />
                </div>
              )}
            </div>

            {/* Form | Submit Sale Form Section */}
            <div className="border border-zinc-900 bg-zinc-900/30">
              <button 
                onClick={() => toggleSection("submitSaleForm")}
                className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
               >
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${expandedSections.submitSaleForm ? "rotate-0" : "-rotate-90"}`}><path d="M9 18l6-6-6-6"/></svg>
                    Form | Submit Sale Form
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-zinc-500 transition-transform ${expandedSections.submitSaleForm ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {expandedSections.submitSaleForm && (
                <div className="p-3 space-y-3 animate-fadeIn">
                  <FormDropdown 
                    label="Your Team"
                    value={formData.yourTeam}
                    options={["Select", "Team A", "Team B"]}
                    onChange={(val: string) => handleInputChange("yourTeam", val)}
                  />
                  <FormDropdown 
                    label="Do You Work Remotely Or From The Office?"
                    value={formData.workLocation}
                    options={["Select", "Remote", "Office"]}
                    onChange={(val: string) => handleInputChange("workLocation", val)}
                  />
                  <FormDropdown 
                    label="Which Office Are You In?"
                    value={formData.officeLocation}
                    options={["Riverside", "Other"]}
                    onChange={(val: string) => handleInputChange("officeLocation", val)}
                  />
                </div>
              )}
            </div>

            {/* Quiz | Quiz 0 Section */}
            <div className="border border-zinc-900 bg-zinc-900/30">
              <button 
                onClick={() => toggleSection("quiz")}
                className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
               >
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${expandedSections.quiz ? "rotate-0" : "-rotate-90"}`}><path d="M9 18l6-6-6-6"/></svg>
                    Quiz | Quiz 0
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-zinc-500 transition-transform ${expandedSections.quiz ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {expandedSections.quiz && (
                 <div className="p-6 text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                    No fields added to this folder
                 </div>
              )}
            </div>

            {/* ACTIONS Section */}
            <div className="pt-4 space-y-4 pb-20">
               <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1 border-b border-zinc-900 pb-2">Actions</h3>
               
               <div className="border border-zinc-900 bg-zinc-900/30">
                  <button className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                        Tags
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500"><path d="M9 5l7 7-7 7"/></svg>
                  </button>
               </div>

               <div className="border border-zinc-900 bg-[#09090b]/50 p-4 space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">DND</span>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900/50 rounded-lg p-4 space-y-4 shadow-inner">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-zinc-300 uppercase tracking-wider">DND all channels</span>
                       <button className="w-5 h-5 bg-red-500/10 border border-red-500/20 rounded flex items-center justify-center text-red-500"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                    </div>

                    <div className="flex items-center gap-3">
                       <div className="h-px bg-zinc-900 flex-1"></div>
                       <span className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em]">OR</span>
                       <div className="h-px bg-zinc-900 flex-1"></div>
                    </div>

                    <div className="space-y-3">
                        {[
                          { label: "Emails", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
                          { label: "Text Messages", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
                          { label: "Calls & Voicemails", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> }
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <span className="text-zinc-600">{item.icon}</span>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.label}</span>
                             </div>
                             <div className="w-4 h-4 border border-zinc-800 rounded bg-zinc-950"></div>
                          </div>
                        ))}
                    </div>

                    <div className="pt-2">
                       <div className="flex items-center justify-between border-t border-zinc-900 pt-3">
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] font-black text-zinc-300 uppercase tracking-wider">DND Inbound Calls and SMS</span>
                             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                          </div>
                          <div className="w-4 h-4 border border-zinc-800 rounded bg-zinc-950"></div>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-1 pt-4 text-center">
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Created by: <span className="text-blue-500 hover:underline cursor-pointer">Manual addition by Gabriel Caceres</span></p>
                    <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">Created on: Nov 3 2025, 5:42 PM (PST)</p>
                  </div>

                  <button className="w-full bg-zinc-950 border border-zinc-900 py-3 rounded text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] hover:text-white hover:bg-zinc-900 transition-all flex items-center justify-center gap-2 shadow-lg">
                    View Audit Logs
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </button>
               </div>
            </div>
          </div>

          {/* Footer Save/Cancel Bar */}
          <div className="h-16 bg-[#09090b] border-t border-zinc-900 flex items-center justify-between px-4 shrink-0 shadow-2xl">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">1 Changes made</span>
              <div className="flex items-center gap-3">
                <button className="px-5 py-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-white transition-colors bg-zinc-900/50 border border-zinc-800 rounded">Cancel</button>
                <button className="px-6 py-2 text-[10px] font-black text-black uppercase tracking-widest bg-[#D4AF37] hover:bg-white transition-all rounded shadow-lg shadow-gold-900/20">Save</button>
              </div>
          </div>
        </div>

        {/* CENTER COLUMN - Communication Feed */}
        <div className="flex-1 flex flex-col bg-[#050505] relative min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 bg-[#09090b] border-b border-zinc-900 h-14">
             <div className="flex items-center gap-10">
                 <div className="relative">
                    <label className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em] block mb-1">Owner (Assign To)</label>
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setShowOwnerDropdown(!showOwnerDropdown)}>
                        <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center text-[10px] text-[#D4AF37] font-bold border border-zinc-800">GC</div>
                        <span className="text-[10px] text-zinc-300 font-black uppercase tracking-wider group-hover:text-white transition-colors">{owner}</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-700 transition-all group-hover:text-[#D4AF37]"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                    {showOwnerDropdown && (
                        <div className="absolute z-[100] left-0 mt-2 w-48 bg-zinc-950 border border-zinc-900 shadow-2xl py-1">
                            {["Gabriel_Castillo", "Admin_User", "Unassigned"].map(u => (
                                <div key={u} className="px-3 py-2 text-[9px] font-black text-zinc-500 hover:text-[#D4AF37] hover:bg-zinc-900 cursor-pointer uppercase tracking-widest" onClick={() => { setOwner(u); setShowOwnerDropdown(false); }}>{u}</div>
                            ))}
                        </div>
                    )}
                 </div>
                 <div>
                    <label className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em] block mb-1">Followers</label>
                    <div className="flex items-center gap-1">
                        <button className="flex items-center gap-2 px-2 py-1 rounded border border-dashed border-zinc-800 text-zinc-700 hover:border-zinc-500 hover:text-white transition-all">
                            <span className="text-[8px] font-black uppercase">Followers</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                        </button>
                    </div>
                 </div>
             </div>
             
             <div className="flex gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 3h20M4 8h16M7 13h10M10 18h4"/></svg>
                </button>
             </div>
          </div>

          {/* Feed Content */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col items-center custom-scrollbar gap-6">
             <div className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] bg-[#09090b] border border-zinc-900 px-4 py-1.5 rounded shadow-lg">Nov 3rd, 2025</div>

             {messages.map((ms, idx) => (
                <div key={idx} className={`w-full max-w-2xl bg-zinc-950 border ${ms.type === "internal" ? "border-zinc-800" : "border-[#D4AF37]/10"} rounded-lg p-4 relative group hover:border-[#D4AF37]/30 transition-all`}>
                    <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded bg-zinc-900 flex items-center justify-center ${ms.type === "internal" ? "text-blue-500" : "text-[#D4AF37]"} shrink-0 border border-zinc-800`}>
                            {ms.type === "internal" ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{ms.sender}</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium">{ms.text}</p>
                            {ms.type === "internal" && (
                                <div className="mt-4 pt-4 border-t border-zinc-900 flex justify-between items-center">
                                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em]">Sales Pipeline</span>
                                    <button className="text-[9px] font-black text-blue-500 uppercase tracking-wider hover:text-blue-400 transition-colors">View opportunity</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <span className="absolute -right-16 top-4 text-[9px] font-black text-zinc-700 uppercase tracking-tighter">{ms.timestamp}</span>
                </div>
             ))}
          </div>

          {/* Message Area */}
          <div className="p-4 bg-[#09090b] border-t border-zinc-900 shrink-0">
             <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex gap-6">
                    {(["SMS", "WhatsApp", "Kixie SMS", "Internal Comment"]).map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveCommTab(tab.toLowerCase().replace(" ", ""))}
                            className={`text-[9px] font-black uppercase tracking-[0.25em] transition-all relative pb-2 ${activeCommTab === tab.toLowerCase().replace(" ", "") ? (tab === "Internal Comment" ? "text-blue-500 border-b-2 border-blue-500" : "text-[#D4AF37] border-b-2 border-[#D4AF37]") : "text-zinc-600 hover:text-zinc-400"}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-4 bg-zinc-800 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-2 h-2 bg-zinc-500 rounded-full"></div>
                    </div>
                </div>
             </div>

             <div className="flex gap-4 mb-3 px-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">From:</span>
                    <div className="px-3 py-1 bg-[#050505] border border-zinc-800 rounded text-[10px] text-zinc-300 font-bold flex items-center gap-2 cursor-pointer hover:border-zinc-700 transition-colors">
                        +1 562-825-6254
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-600"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">To:</span>
                    <div className="px-3 py-1 bg-[#050505] border border-zinc-800 rounded text-[10px] text-zinc-300 font-bold flex items-center gap-2 cursor-pointer hover:border-zinc-700 transition-colors">
                        {formData.phone}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-600"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                </div>
             </div>
             
             <div className="bg-[#050505] border border-zinc-900 rounded-lg overflow-hidden">
                <div className="p-3 min-h-[100px] relative">
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={activeCommTab === "internalcomment" ? "Write an internal note..." : "Type a message..."} 
                        className="w-full bg-transparent text-xs text-zinc-200 focus:outline-none resize-none placeholder:text-zinc-800 p-1"
                        rows={4}
                    />
                </div>
                
                <div className="flex items-center justify-between p-2 bg-[#09090b]/50 border-t border-zinc-900">
                    <div className="flex items-center gap-3 px-2">
                        <button className="text-zinc-500 hover:text-zinc-300"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg></button>
                        <button className="text-zinc-500 hover:text-zinc-300"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></button>
                        <button className="text-zinc-500 hover:text-zinc-300"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></button>
                        <button className="text-zinc-500 hover:text-zinc-300"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Segs: 0</span>
                        <button 
                            onClick={() => setMessage('')}
                            className="text-[10px] text-zinc-400 hover:text-white font-black uppercase tracking-widest transition-colors"
                        >
                            Clear
                        </button>
                        <button 
                            className={`h-8 px-6 ${activeCommTab === "internalcomment" ? "bg-blue-600 hover:bg-blue-500" : "bg-[#D4AF37] hover:bg-white text-black"} font-black text-[10px] uppercase tracking-widest transition-all rounded shadow-xl flex items-center gap-2`}
                            onClick={handleSendMessage}
                        >
                            Send
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                        </button>
                    </div>
                </div>
             </div>
          </div>
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #18181b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #27272a;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ContactDetail;
