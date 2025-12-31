
import React, { useState } from 'react';
import { X, Mail, Lock, ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
  initialMode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setError(null);
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      
      if (password.length < 6) {
        setError('Security Error: Password must be at least 6 characters.');
        return;
      }
      
      onLogin({ email });
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
      <div className="bg-[#0a111a] border border-slate-800 w-full max-w-md rounded-[3rem] p-10 relative shadow-[0_0_100px_rgba(16,185,129,0.1)] animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute right-8 top-8 text-slate-600 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-emerald-500/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-emerald-500/10 shadow-inner">
            <ShieldCheck className="w-10 h-10 text-emerald-500" />
          </div>
          
          <div className="flex justify-center gap-3 mb-6">
            {(['signin', 'signup'] as const).map((m) => (
              <button 
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`text-[10px] font-black uppercase tracking-[0.2em] px-8 py-2.5 rounded-full border transition-all ${mode === m ? 'bg-emerald-500 border-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' : 'border-slate-800 text-slate-600 hover:border-slate-700'}`}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </h2>
          
          <p className="text-slate-500 mt-3 text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
            Access your Lau- PennyStocks account to track NSE & BSE trajectories.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-center">
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest leading-tight">{error}</p>
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full bg-slate-950 border-2 border-slate-800/50 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white focus:border-emerald-500/50 focus:ring-0 outline-none transition-all group-hover:border-slate-700 placeholder:text-slate-800"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-slate-950 border-2 border-slate-800/50 rounded-2xl py-4 pl-14 pr-14 text-sm font-bold text-white focus:border-emerald-500/50 focus:ring-0 outline-none transition-all group-hover:border-slate-700 placeholder:text-slate-800"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/10 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-lg tracking-tight uppercase"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-900 flex flex-col items-center gap-3">
          <p className="text-[9px] text-slate-700 text-center uppercase tracking-[0.3em] font-black max-w-[250px] leading-relaxed">
            Secure Connection Active <br/> NSE & BSE Market Hub
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
