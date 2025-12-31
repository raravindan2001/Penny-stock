
import React, { useState } from 'react';
import { X, Check, ShieldCheck, CreditCard, Loader2, Sparkles, Smartphone, Copy, Clock } from 'lucide-react';

interface SubscriptionModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onTrialStart: () => void;
  userHasTrialed?: boolean;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, onSuccess, onTrialStart, userHasTrialed }) => {
  const [step, setStep] = useState<'plan' | 'payment' | 'processing'>('plan');
  const [copied, setCopied] = useState(false);
  const upiId = "9047699948@pthdfc";

  const handlePayment = () => {
    setStep('processing');
    setTimeout(() => {
      onSuccess();
    }, 3000);
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="bg-[#0a111a] border border-white/10 w-full max-w-xl rounded-[3rem] overflow-hidden relative shadow-2xl animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute right-8 top-8 text-slate-500 hover:text-white z-20">
          <X className="w-6 h-6" />
        </button>

        {step === 'plan' && (
          <div className="p-12">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Institutional Access</span>
            </div>
            
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 italic">Alpha Pro Yearly</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">Unlock the full terminal capability including multi-segment deep scans and export controls.</p>

            <div className="space-y-4 mb-10">
              {[
                "Unlimited 14-Point Alpha Scans",
                "Advanced 15-Year Trajectory Mapping",
                "Priority Neural Data Access",
                "Full Export to Excel (.csv)",
                "Segment-Wise Intelligence Clusters"
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="bg-emerald-500/20 p-1 rounded-full">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-sm font-bold text-slate-300">{f}</span>
                </div>
              ))}
            </div>

            <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 mb-8 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Annual Subscription</p>
                <h3 className="text-4xl font-black text-white font-mono">₹5,000<span className="text-lg text-slate-600 font-sans">/yr</span></h3>
              </div>
              <div className="text-right">
                <span className="bg-emerald-500 text-slate-900 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Best Value</span>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => setStep('payment')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black py-5 rounded-2xl text-lg uppercase tracking-widest transition-all hover:-translate-y-1 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
              >
                <Smartphone className="w-6 h-6" /> Unlock with Paytm
              </button>
              
              {!userHasTrialed && (
                <button 
                  onClick={onTrialStart}
                  className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4 text-emerald-500" /> Start Free 2-Day Website Tour
                </button>
              )}
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="p-12">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 italic">Direct Paytm Payment</h2>
            <p className="text-slate-500 text-sm font-medium mb-8">Send ₹5,000 to the UPI ID below to activate your Institutional Terminal immediately.</p>
            
            <div className="bg-slate-950 border-2 border-slate-800 p-8 rounded-[2.5rem] mb-10 text-center relative overflow-hidden group">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Merchant UPI Address</p>
              <div className="flex flex-col items-center gap-4">
                <span className="text-2xl font-black text-white font-mono select-all tracking-tight">{upiId}</span>
                <button 
                  onClick={copyUpi}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-emerald-500 text-slate-900' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied to Clipboard' : 'Copy UPI ID'}
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00baf2]/5 blur-3xl -mr-10 -mt-10" />
            </div>

            <button 
              onClick={handlePayment}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-5 rounded-2xl text-lg uppercase tracking-widest transition-all hover:-translate-y-1 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
            >
              Verify Payment & Unlock
            </button>
            
            <p className="text-center text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mt-8 leading-relaxed">
              Manual verification takes &lt; 2 minutes. <br/> Your account will be upgraded to Pro status.
            </p>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-20 text-center space-y-8">
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Smartphone className="w-10 h-10 text-blue-500 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Validating Transaction...</h3>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Verifying with 9047699948@pthdfc terminal</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionModal;
