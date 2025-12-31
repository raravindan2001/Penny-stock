
import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, ShieldCheck, Loader2, BellRing, RefreshCcw, BellOff } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSmsAlert, setShowSmsAlert] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const alertTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    let interval: number;
    if (resendTimer > 0) {
      interval = window.setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const triggerRealNotification = (code: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Lau- PennyStocks", {
          body: `Your secure verification code is: ${code}. Authorized access to AI Terminal 4.2.`,
          icon: 'https://cdn-icons-png.flaticon.com/512/2534/2534204.png', // Generic stock icon
          tag: 'otp-code'
        });
      } catch (e) {
        console.error("Mobile notification failed:", e);
      }
    }
  };

  const triggerMockSms = () => {
    const code = "1234";
    if (alertTimeoutRef.current) window.clearTimeout(alertTimeoutRef.current);
    
    // 1. Trigger system-level notification (The "Receive on Mobile" part)
    triggerRealNotification(code);
    
    // 2. Trigger in-app visual mock
    setShowSmsAlert(true);
    alertTimeoutRef.current = window.setTimeout(() => setShowSmsAlert(false), 8000);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;

    // Request permission if not already granted
    if (notificationPermission !== 'granted') {
      await requestPermission();
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setResendTimer(30);
      triggerMockSms();
    }, 1200);
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResendTimer(30);
      triggerMockSms();
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ phone });
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      {/* Mock SMS Notification - Visual In-App Helper */}
      {showSmsAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] w-full max-w-sm animate-in slide-in-from-top zoom-in duration-500">
          <div className="bg-[#1e293b] border-2 border-emerald-500/50 p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-start gap-4 mx-4 ring-4 ring-emerald-500/10">
            <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
              <BellRing className="w-6 h-6 text-slate-900" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Incoming SMS</p>
                <span className="text-[10px] text-slate-500 font-bold">JUST NOW</span>
              </div>
              <p className="text-sm text-slate-100 mt-1 leading-tight font-medium">
                Lau- PennyStocks: Your verification code is <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black text-base tracking-wider">1234</span>. Sent to system tray.
              </p>
            </div>
            <button onClick={() => setShowSmsAlert(false)} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#0a111a] border border-slate-800 w-full max-w-md rounded-[3rem] p-10 relative shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        <button onClick={onClose} className="absolute right-8 top-8 text-slate-600 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-emerald-500/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-emerald-500/10 shadow-inner">
            {step === 'phone' ? (
              <Phone className="w-10 h-10 text-emerald-500" />
            ) : (
              <ShieldCheck className="w-10 h-10 text-emerald-500 animate-pulse" />
            )}
          </div>
          
          <div className="flex justify-center gap-3 mb-6">
            {(['signin', 'signup'] as const).map((m) => (
              <button 
                key={m}
                onClick={() => setMode(m)}
                className={`text-[10px] font-black uppercase tracking-[0.2em] px-5 py-1.5 rounded-full border transition-all ${mode === m ? 'bg-emerald-500 border-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' : 'border-slate-800 text-slate-600 hover:border-slate-700'}`}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <h2 className="text-3xl font-black text-white tracking-tighter">
            {step === 'phone' ? (mode === 'signin' ? 'Welcome Back' : 'Create Profile') : 'Verify Identity'}
          </h2>
          
          {step === 'phone' && notificationPermission !== 'granted' && (
            <button 
              onClick={requestPermission}
              className="mt-4 flex items-center gap-2 mx-auto text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20 hover:bg-amber-500/20 transition-all"
            >
              <BellOff className="w-3 h-3" /> Enable Mobile Notifications for OTP
            </button>
          )}

          <p className="text-slate-500 mt-3 text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
            {step === 'phone' 
              ? 'Verification is delivered via browser push to your device notification tray.' 
              : `System code sent to mobile ending in ${phone.slice(-4)}`}
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-black text-lg">+91</span>
              <input
                type="tel"
                autoFocus
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="98765 43210"
                required
                className="w-full bg-slate-950 border-2 border-slate-800/50 rounded-2xl py-5 pl-16 pr-6 text-xl font-bold text-white focus:border-emerald-500/50 focus:ring-0 outline-none transition-all group-hover:border-slate-700 placeholder:text-slate-800"
              />
            </div>
            <button
              disabled={loading || phone.length < 10}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/10 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-lg tracking-tight"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (mode === 'signin' ? 'Log In Securely' : 'Sign Up with OTP')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-2">
              <input
                type="text"
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="0 0 0 0"
                maxLength={4}
                required
                className="w-full bg-slate-950 border-2 border-slate-800/50 rounded-2xl py-6 px-6 text-center tracking-[1.5rem] text-4xl font-black text-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-900"
              />
              <div className="flex justify-between items-center px-1">
                 <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
                  Mobile Push Active
                </p>
                <button 
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading || resendTimer > 0}
                  className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors ${resendTimer > 0 ? 'text-slate-700 cursor-not-allowed' : 'text-emerald-500 hover:text-emerald-400 underline underline-offset-4'}`}
                >
                  <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </div>

            <button
              disabled={loading || otp.length < 4}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/10 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-lg tracking-tight"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Authorize Terminal'}
            </button>
            
            <button 
              type="button" 
              onClick={() => setStep('phone')} 
              className="w-full text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hover:text-slate-400 transition-colors pt-2"
            >
              Change phone number
            </button>
          </form>
        )}

        <div className="mt-10 pt-8 border-t border-slate-900 flex flex-col items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-slate-800" />
          <p className="text-[9px] text-slate-700 text-center uppercase tracking-[0.3em] font-black max-w-[200px] leading-relaxed">
            Verify system tray for code "1234"
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
