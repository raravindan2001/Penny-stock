
import React from 'react';
import { Rocket, TrendingUp, ShieldCheck, Zap, Globe, BarChart3, ChevronRight, PieChart, Layers, Crown } from 'lucide-react';

interface LandingViewProps {
  onGetStarted: (mode: 'signin' | 'signup') => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col animate-in fade-in duration-1000">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full"></div>
          <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-6 py-2 rounded-full mb-8">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">PRO Terminal Now Active</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-tight mb-8 uppercase">
            Predicting the next <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 italic">Multibagger</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 font-medium mb-12 max-w-3xl mx-auto leading-relaxed italic">
            "The world's most advanced AI-driven terminal for NSE & BSE penny stock trajectories. Real-time data. Data-driven logic. Professional growth tracking."
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => onGetStarted('signup')}
              className="group bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-2xl shadow-emerald-500/20 flex items-center gap-3"
            >
              Start Analysis
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onGetStarted('signin')}
              className="px-10 py-5 rounded-2xl border border-slate-800 bg-slate-900/50 text-white font-black text-lg uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              Sign In
            </button>
          </div>

          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-50">
            {[
              { label: 'Market Cap Analyzed', val: '$2.4T+' },
              { label: 'AI Data Nodes', val: '1,024' },
              { label: 'Real-time Tickers', val: '8,000+' },
              { label: 'Uptime', val: '99.99%' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-black text-white font-mono">{stat.val}</div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6">
         <div className="max-w-4xl mx-auto text-center bg-[#0a111a] border border-white/5 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Crown className="w-64 h-64 text-amber-500" />
            </div>
            <h2 className="text-sm font-black text-amber-500 uppercase tracking-[0.4em] mb-4">Pricing Protocol</h2>
            <h3 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-8">Alpha Pro Yearly</h3>
            <div className="text-7xl font-black text-white mb-10 font-mono">₹5,000<span className="text-xl text-slate-600 font-sans">/yr</span></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-left max-w-2xl mx-auto mb-12">
               {[
                 "Full Excel/CSV Data Export",
                 "Segment-Wise Deep Discovery",
                 "15Y Growth Vectoring",
                 "Exclusive Multi-Bagged Radar",
                 "Institutional 14-Point Check",
                 "Priority Neural Grounding"
               ].map((f, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <Check className="w-4 h-4 text-amber-500" />
                   <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">{f}</span>
                 </div>
               ))}
            </div>

            <button 
              onClick={() => onGetStarted('signup')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-12 py-5 rounded-2xl font-black text-xl uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20"
            >
              Get Started with Paytm
            </button>
         </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 border-t border-white/5 bg-[#03060a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Professional grade arsenal</h2>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Everything you need to master the Indian micro-cap market</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: Globe,
                title: "Cross-Exchange Neural Radar",
                desc: "Simultaneous scanning of NSE and BSE terminals. We aggregate micro-signals from both exchanges to detect price anomalies early.",
                color: "text-emerald-500"
              },
              {
                icon: BarChart3,
                title: "5Y - 10Y Trajectory Projections",
                desc: "Proprietary AI models trained on 20 years of historical Indian equity cycles. Visualize growth vectors for the next decade.",
                color: "text-blue-500"
              },
              {
                icon: PieChart,
                title: "Segment-Wise Intelligence",
                desc: "Classification into high-growth sectors: Green Energy, EV Defense, and Infra. We filter the noise to show you the leaders.",
                color: "text-amber-500"
              },
              {
                icon: TrendingUp,
                title: "Top 20 High-Growth Radar",
                desc: "A daily list of 20 stocks with the highest 'Multibagger Score', calculated via volume clusters and sector tailwinds.",
                color: "text-rose-500"
              },
              {
                icon: ShieldCheck,
                title: "Risk-Adjusted Valuations",
                desc: "Detailed risk scoring for every penny stock. Don't just look at returns; look at the probability of sustained growth.",
                color: "text-indigo-500"
              },
              {
                icon: Layers,
                title: "Deep Grounding Metadata",
                desc: "Every projection is linked to verified sources. We trace every bullish catalyst back to official filings and news reports.",
                color: "text-cyan-500"
              }
            ].map((f, i) => (
              <div key={i} className="bg-slate-900/30 border border-slate-800 p-10 rounded-[2.5rem] hover:border-emerald-500/30 transition-all group">
                <f.icon className={`w-12 h-12 ${f.color} mb-8 group-hover:scale-110 transition-transform`} />
                <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-[3rem] p-16 text-center shadow-[0_0_80px_rgba(16,185,129,0.2)]">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 uppercase tracking-tighter italic">Ready to start?</h2>
          <p className="text-slate-900/70 text-lg font-bold mb-12 uppercase tracking-wide">Join thousands of traders identifying growth trajectories early.</p>
          <button 
            onClick={() => onGetStarted('signup')}
            className="bg-slate-950 text-white px-12 py-5 rounded-2xl font-black text-xl uppercase tracking-widest hover:bg-black transition-all shadow-2xl"
          >
            Sign Up Now
          </button>
        </div>
      </section>
    </div>
  );
};

const Check = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

export default LandingView;
