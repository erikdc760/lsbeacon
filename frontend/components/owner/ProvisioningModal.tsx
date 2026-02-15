import React, { useState, useMemo } from 'react';
import { phoneApi } from '../../api';
import { US_AREA_CODES } from '../../constants/areaCodes';

interface ProvisioningModalProps {
    isOpen: boolean;
    onClose: () => void;
    agent: { id: string, name: string } | null;
    onSuccess: (number: string) => void;
}

const ProvisioningModal: React.FC<ProvisioningModalProps> = ({ isOpen, onClose, agent, onSuccess }) => {
    const [areaCode, setAreaCode] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [numbers, setNumbers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [buying, setBuying] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredAreaCodes = useMemo(() => {
        if (!searchTerm) return US_AREA_CODES;
        const lowerSearch = searchTerm.toLowerCase();
        return US_AREA_CODES.filter(
            item => item.code.includes(lowerSearch) || item.region.toLowerCase().includes(lowerSearch)
        );
    }, [searchTerm]);

    if (!isOpen || !agent) return null;

    const handleSearch = async () => {
        if (!areaCode) return;
        setLoading(true);
        try {
            const data = await phoneApi.searchNumbers(areaCode);
            setNumbers(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAreaCode = (code: string) => {
        setAreaCode(code);
        setSearchTerm(code);
        setShowDropdown(false);
    };

    const handleBuy = async (phoneNumber: string) => {
        setBuying(true);
        try {
            await phoneApi.buyNumber(phoneNumber, agent.id);
            onSuccess(phoneNumber);
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to purchase number. Check backend logs and Telnyx API setup.');
        } finally {
            setBuying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0A0A0A] border border-[#1A1A1A] w-full max-w-md p-6 space-y-4" onClick={() => setShowDropdown(false)}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-[14px] font-black text-white uppercase tracking-tighter">
                            PROVISION NUMBER
                        </h3>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest">
                            Agent: {agent.name}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-2 relative" onClick={(e) => e.stopPropagation()}>
                    <label className="text-[9px] text-gray-400 uppercase font-bold">Search Area Code or Region</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setAreaCode(e.target.value.substring(0, 3)); // Naive assumption, but safe for manual entry
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                placeholder="e.g. 212 or New York"
                                className="w-full bg-black border border-[#1A1A1A] text-[11px] px-3 py-2 text-white outline-none focus:border-[#D4AF37] transition-colors"
                            />
                            {showDropdown && (
                                <div className="absolute top-full left-0 w-full max-h-[150px] overflow-y-auto bg-zinc-900 border border-zinc-800 z-50 custom-scrollbar shadow-xl">
                                    {filteredAreaCodes.map((item) => (
                                        <div 
                                            key={item.code} 
                                            className="px-3 py-2 hover:bg-zinc-800 cursor-pointer flex justify-between items-center group"
                                            onClick={() => handleSelectAreaCode(item.code)}
                                        >
                                            <span className="text-[10px] font-bold text-[#D4AF37]">{item.code}</span>
                                            <span className="text-[9px] text-zinc-400 group-hover:text-white truncate max-w-[180px]">{item.region}</span>
                                        </div>
                                    ))}
                                    {filteredAreaCodes.length === 0 && (
                                        <div className="px-3 py-2 text-[9px] text-zinc-500 italic">No matching area codes</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading || !areaCode}
                            className="bg-[#D4AF37] text-black text-[9px] font-bold px-4 uppercase tracking-wider hover:bg-[#B48F27] disabled:opacity-50 h-[34px]"
                        >
                            {loading ? '...' : 'Search'}
                        </button>
                    </div>
                </div>

                <div className="max-h-[200px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {numbers.length === 0 && !loading && (
                        <p className="text-[9px] text-gray-600 text-center py-4 italic">Enter area code to find numbers</p>
                    )}
                    {numbers.map((num: any) => (
                        <div key={num.phone_number} className="flex items-center justify-between p-2 bg-[#111] border border-[#1A1A1A] hover:border-[#333] group">
                            <span className="text-[11px] text-gray-300 font-mono tracking-wider">{num.phone_number}</span>
                            <button
                                onClick={() => handleBuy(num.phone_number)}
                                disabled={buying}
                                className="text-[8px] font-bold text-[#D4AF37] uppercase tracking-widest bg-[#D4AF37]/5 px-2 py-1 border border-[#D4AF37]/20 hover:bg-[#D4AF37] hover:text-black transition-all"
                            >
                                {buying ? 'BUYING...' : 'PURCHASE'}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="pt-2 border-t border-[#111]">
                    <p className="text-[8px] text-gray-600 leading-tight">
                        * Purchasing a number will automatically bill your Telnyx balance and assign it to this agent for immediate use in the dialer.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProvisioningModal;
