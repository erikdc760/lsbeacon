
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { apiFetch } from '../api/client';

interface LoginProps {
  onLogin: (role: UserRole, email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsInitializing(true);

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email, password }),
      });

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      // Map backend role to frontend enum
      let role: UserRole;
      switch (data.role) {
        case 'super_admin': role = UserRole.SUPER_ADMIN; break;
        case 'company_owner': role = UserRole.COMPANY_OWNER; break;
        case 'agent': role = UserRole.AGENT; break;
        default: throw new Error('Unknown role');
      }

      onLogin(role, email);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Connection failed.');
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] bg-[radial-gradient(circle_at_50%_50%,_#1a1a1a_0%,_#000000_100%)] flex flex-col items-center justify-between p-6 font-display selection:bg-[#D4AF37] selection:text-black relative overflow-hidden">
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent pointer-events-none"></div>
      
      {/* Top Spacer for centering */}
      <div className="hidden lg:block h-12"></div>

      {/* Center Content */}
      <div className="w-full max-w-xs flex flex-col items-center gap-8 animate-fadeIn relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            {/* 3D Gold Shine Effect */}
            <div className="absolute inset-0 bg-[#D4AF37] blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
            <img 
              src="/logo.png" 
              alt="Beacon Logo" 
              className="w-96 h-96 object-contain relative z-10 drop-shadow-[0_0_40px_rgba(212,175,55,0.5)] filter brightness-110" 
            />
          </div>
          <div className="flex flex-col items-center">
            <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-2"></div>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full space-y-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1 group/field">
              <label className="block text-[7px] uppercase tracking-[0.3em] text-zinc-500 font-bold group-focus-within/field:text-[#D4AF37] transition-colors">
                Credential Identifier
              </label>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 backdrop-blur-xl border border-zinc-900/50 text-white px-4 py-2.5 rounded-none focus:outline-none focus:border-[#D4AF37]/50 transition-all text-[9px] tracking-widest placeholder-zinc-800 font-bold shadow-inner"
                placeholder="ENTER ID"
                required
              />
            </div>
            <div className="space-y-1 group/field">
              <label className="block text-[7px] uppercase tracking-[0.3em] text-zinc-500 font-bold group-focus-within/field:text-[#D4AF37] transition-colors">
                Security Token
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 backdrop-blur-xl border border-zinc-900/50 text-white px-4 py-2.5 pr-10 rounded-none focus:outline-none focus:border-[#D4AF37]/50 transition-all text-[9px] tracking-widest placeholder-zinc-800 shadow-inner"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-[#D4AF37] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-2 border border-red-900/30 bg-red-950/10 rounded-none flex items-center gap-2">
                <div className="w-0.5 h-3 bg-red-500"></div>
                <p className="text-red-500 text-[7px] uppercase font-bold tracking-widest">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isInitializing}
              className={`group w-full bg-gradient-to-b from-[#D4AF37] to-[#B8860B] hover:from-white hover:to-zinc-200 text-black font-black py-3 rounded-none transition-all duration-500 uppercase tracking-[0.4em] text-[9px] shadow-[0_10px_30px_rgba(212,175,55,0.15)] flex items-center justify-center gap-2 ${isInitializing ? 'opacity-50 cursor-wait' : 'active:scale-[0.98]'}`}
            >
              {isInitializing ? (
                <div className="loader-ring"></div>
              ) : (
                <>
                  <span>AUTHENTICATE</span>
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full flex justify-center gap-8 py-8 border-t border-zinc-900/50">
        <button className="text-[10px] text-zinc-600 hover:text-[#D4AF37] font-black uppercase tracking-[0.3em] transition-colors">
          Support
        </button>
        <div className="w-px h-4 bg-zinc-800"></div>
        <button className="text-[10px] text-zinc-600 hover:text-[#D4AF37] font-black uppercase tracking-[0.3em] transition-colors">
          Sales
        </button>
      </div>
    </div>
  );
};

export default Login;
