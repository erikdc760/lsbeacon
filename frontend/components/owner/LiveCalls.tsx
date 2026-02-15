
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/client';

interface LiveCall {
  id: string;
  agent: string;
  contact: string;
  duration: string;
  status: 'dialing' | 'talking' | 'wrap-up';
  phoneNumber: string;
  leadType: string;
}

const LiveCalls: React.FC = () => {
  const [liveCalls, setLiveCalls] = useState<LiveCall[]>([]);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const data = await apiFetch('/api/owner/live-calls');
        if (Array.isArray(data)) setLiveCalls(data);
      } catch (err) {
        console.error(err);
        setLiveCalls([
          { id: '1', agent: 'Sarah Connor', contact: 'Michael Chen', duration: '08:45', status: 'talking', phoneNumber: '555-0101', leadType: 'Facebook' },
        ]);
      }
    };
    fetchCalls();
  }, []);

  const [selectedCall, setSelectedCall] = useState<LiveCall | null>(null);
  const [ghostModeActive, setGhostModeActive] = useState(false);

  const handleJoinGhostMode = (call: LiveCall) => {
    setSelectedCall(call);
    setGhostModeActive(true);
  };

  const handleLeaveGhostMode = () => {
    setGhostModeActive(false);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <h2 className="text-2xl lg:text-3xl font-black tracking-tighter text-[#D4AF37] uppercase">Live Call Monitoring</h2>
        <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.4em] text-zinc-600 mt-1">GHOST MODE COACHING INTERFACE</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-green-900/50 p-4">
          <p className="text-[8px] uppercase tracking-widest text-green-400 mb-2">Active Calls</p>
          <p className="text-2xl font-black text-white">
            {liveCalls.filter(c => c.status === 'talking').length}
          </p>
        </div>
        <div className="bg-zinc-950 border border-blue-900/50 p-4">
          <p className="text-[8px] uppercase tracking-widest text-blue-400 mb-2">Dialing</p>
          <p className="text-2xl font-black text-white">
            {liveCalls.filter(c => c.status === 'dialing').length}
          </p>
        </div>
        <div className="bg-zinc-950 border border-[#D4AF37]/50 p-4">
          <p className="text-[8px] uppercase tracking-widest text-[#D4AF37] mb-2">Ghost Mode</p>
          <p className="text-2xl font-black text-white">
            {ghostModeActive ? '1' : '0'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Live Calls List */}
        <div className="bg-zinc-950 border border-zinc-900 p-4 space-y-3 max-h-[600px] overflow-y-auto custom-scroll">
          <div className="pb-3 border-b border-zinc-900 mb-3">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Active Team Calls</p>
          </div>
          {liveCalls.length === 0 ? (
            <div className="h-40 flex items-center justify-center">
              <p className="text-zinc-600 text-sm uppercase tracking-widest">No active calls</p>
            </div>
          ) : (
            liveCalls.map((call) => (
              <div
                key={call.id}
                onClick={() => setSelectedCall(call)}
                className={`p-4 border transition-all cursor-pointer ${
                  selectedCall?.id === call.id
                    ? 'border-[#D4AF37] bg-zinc-900/50'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm font-bold text-white">{call.agent}</p>
                    <p className="text-[9px] text-zinc-500 uppercase mt-1">→ {call.contact}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {call.status === 'talking' && (
                      <>
                        <div className="w-2 h-2 bg-green-500 animate-pulse rounded-full"></div>
                        <span className="text-[8px] uppercase tracking-widest text-green-400">LIVE</span>
                      </>
                    )}
                    {call.status === 'dialing' && (
                      <>
                        <div className="w-2 h-2 bg-blue-500 animate-pulse rounded-full"></div>
                        <span className="text-[8px] uppercase tracking-widest text-blue-400">DIALING</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-[8px] text-zinc-600">
                    <span>{call.phoneNumber}</span>
                    <span>{call.leadType}</span>
                  </div>
                  <span className="text-[#D4AF37] text-sm font-mono">{call.duration}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ghost Mode Interface */}
        <div className="bg-zinc-950 border border-zinc-900 p-6">
          {selectedCall ? (
            <div className="space-y-6">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4">Call Control</p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-zinc-600">Agent</span>
                    <span className="text-sm font-bold text-white">{selectedCall.agent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-zinc-600">Contact</span>
                    <span className="text-sm text-white">{selectedCall.contact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-zinc-600">Phone</span>
                    <span className="text-sm text-white font-mono">{selectedCall.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-zinc-600">Duration</span>
                    <span className="text-sm text-[#D4AF37] font-mono font-bold">{selectedCall.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-zinc-600">Lead Type</span>
                    <span className="text-sm text-white">{selectedCall.leadType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-zinc-600">Status</span>
                    <span className={`text-sm font-bold ${
                      selectedCall.status === 'talking' ? 'text-green-400' :
                      selectedCall.status === 'dialing' ? 'text-blue-400' :
                      'text-zinc-400'
                    }`}>
                      {selectedCall.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {selectedCall.status === 'talking' && (
                <div className="pt-6 border-t border-zinc-900">
                  {!ghostModeActive ? (
                    <button 
                      onClick={() => handleJoinGhostMode(selectedCall)}
                      className="w-full py-3 bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-widest hover:bg-[#D4AF37]/80 transition-all rounded-none mb-2"
                    >
                      Join as Ghost (Silent Coach)
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-[#D4AF37]/10 border border-[#D4AF37] p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-[#D4AF37] animate-pulse rounded-full"></div>
                          <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest">Ghost Mode Active</p>
                        </div>
                        <p className="text-zinc-400 text-[8px] uppercase">You can hear the call. Agent & client cannot hear you.</p>
                      </div>
                      <button 
                        onClick={handleLeaveGhostMode}
                        className="w-full py-3 border border-zinc-800 text-zinc-400 text-[9px] font-black uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-all rounded-none"
                      >
                        Leave Ghost Mode
                      </button>
                    </div>
                  )}
                  <button className="w-full py-3 border border-zinc-800 text-zinc-400 text-[9px] font-black uppercase tracking-widest hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all rounded-none mt-2">
                    Quick Coaching Notes
                  </button>
                </div>
              )}

              {selectedCall.status === 'dialing' && (
                <div className="pt-6 border-t border-zinc-900">
                  <div className="bg-blue-900/10 border border-blue-800 p-4 text-center">
                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">Call Connecting</p>
                    <p className="text-zinc-400 text-[8px] uppercase">Ghost Mode will be available once call connects</p>
                  </div>
                </div>
              )}

              <div className="bg-black border border-zinc-800 p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-3">Real-Time Notes</p>
                <textarea
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] rounded-none resize-none"
                  rows={4}
                  placeholder="Add coaching observations during the call..."
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
              <div className="w-24 h-24 border border-zinc-800 flex items-center justify-center rounded-none">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="1">
                  <path d="M12 2C7.58 2 4 5.58 4 10V22L12 18L20 22V10C20 5.58 16.42 2 12 2Z" />
                  <circle cx="9" cy="10" r="1" />
                  <circle cx="15" cy="10" r="1" />
                </svg>
              </div>
              <p className="text-zinc-600 text-sm uppercase tracking-widest text-center">Select an active call<br/>to begin monitoring</p>
            </div>
          )}
        </div>
      </div>

      {/* Ghost Mode Info Banner */}
      <div className="bg-zinc-950 border border-zinc-900 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#D4AF37]/10 border border-[#D4AF37]/50 flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-black text-[#D4AF37] uppercase tracking-tight mb-2">Ghost Mode Guidelines</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              When joining a call in Ghost Mode, the agent will hear a brief chime notification, but the client will remain unaware of your presence. 
              Use this feature for real-time coaching and quality assurance.
            </p>
            <ul className="space-y-1 text-[10px] text-zinc-500">
              <li>• Keep notes brief and actionable</li>
              <li>• Provide feedback immediately after call ends</li>
              <li>• Use Ghost Mode to identify training opportunities</li>
              <li>• Respect agent focus - avoid excessive interruptions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCalls;
