
import React, { useState, useEffect } from 'react';
import { 
  Search, TrendingUp, AlertTriangle, Rocket, LogOut, 
  Activity, Clock, CheckCircle2, XCircle, Award, ShieldCheck,
  Zap, PieChart, Layers, ChevronRight, BarChart3, Binary,
  FileSpreadsheet, Download, Sparkles, Crown, Timer
} from 'lucide-react';
import { analyzeStock, discoverStocks } from './services/geminiService';
import { AnalysisResult, User, DiscoveryStock, PriceBucket, InstitutionalMetrics } from './types';
import TrajectoryChart from './components/TrajectoryChart';
import AuthModal from './components/AuthModal';
import LandingView from './components/LandingView';
import SubscriptionModal from './components/SubscriptionModal';

const Binoculars = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M16 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M7 10V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8"/><path d="M4 14V9a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v5"/><path d="M8 14h8"/><path d="M12 14v4"/><path d="M12 2v2"/><path d="M9 18l-3 4"/><path d="M15 18l3 4"/></svg>
);

const AlphaScorecard: React.FC<{ metrics: InstitutionalMetrics }> = ({ metrics }) => {
  const quant = [
    { label: "P/E Ratio", value: metrics.peRatio, target: "< 20", pass: metrics.peRatio < 20 },
    { label: "ROIC", value: `${metrics.roic}%`, target: "> 15%", pass: metrics.roic > 15 },
    { label: "D/E Ratio", value: metrics.deRatio, target: "< 1", pass: metrics.deRatio < 1 },
    { label: "EPS CAGR", value: `${metrics.epsCAGR}%`, target: "> 10%", pass: metrics.epsCAGR > 10 },
    { label: "ROE", value: `${metrics.roe}%`, target: "> 15%", pass: metrics.roe > 15 },
    { label: "Rev CAGR", value: `${metrics.revenueCAGR}%`, target: "> 15%", pass: metrics.revenueCAGR > 15 },
    { label: "EBIT Margin", value: `${metrics.ebitMargin}%`, target: "> 10%", pass: metrics.ebitMargin > 10 },
    { label: "Gross Margin", value: `${metrics.grossMargin}%`, target: "> 40%", pass: metrics.grossMargin > 40 },
  ];

  const gov = [
    { label: "Promoter Holding", value: `${metrics.promoterHolding}%`, target: "> 50%", pass: metrics.promoterHolding > 50 },
    { label: "Pledged Shares", value: `${metrics.pledgedPercentage}%`, target: "< 10%", pass: metrics.pledgedPercentage < 10 },
    { label: "FCF Status", value: metrics.fcfStatus, target: "Pos & Grow", pass: metrics.fcfStatus === 'Positive & Growing' },
  ];

  const qual = [
    { label: "Ind. Tailwinds", score: metrics.industryTailwinds },
    { label: "Comp. Moat", score: metrics.competitiveMoat },
    { label: "Valuation Entry", score: metrics.valuationSafety },
    { label: "Mgt Governance", score: metrics.managementGovernance },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#0a111a] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-3 italic">
          <Binary className="w-6 h-6 text-emerald-500" /> Alpha 14-Point Scan
        </h3>
        
        <div className="space-y-8">
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 border-l-2 border-emerald-500 pl-2">Quantitative Matrix</p>
            <div className="grid grid-cols-2 gap-3">
              {quant.map((c, i) => (
                <div key={i} className={`p-4 rounded-2xl border transition-all ${c.pass ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
                  <p className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">{c.label}</p>
                  <p className={`text-lg font-black font-mono ${c.pass ? 'text-emerald-400' : 'text-rose-400'}`}>{c.value}</p>
                  <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-2">
                    <span className="text-[8px] text-slate-600 font-bold uppercase">{c.target}</span>
                    {c.pass ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-rose-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 border-l-2 border-blue-500 pl-2">Governance & Liquidity</p>
            <div className="space-y-3">
              {gov.map((c, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${c.pass ? 'bg-blue-500/5 border-blue-500/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
                   <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">{c.label}</p>
                    <p className={`text-sm font-black ${c.pass ? 'text-blue-400' : 'text-rose-400'}`}>{c.value}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-slate-600 uppercase">{c.target}</p>
                    {c.pass ? <CheckCircle2 className="w-4 h-4 text-blue-500 ml-auto" /> : <XCircle className="w-4 h-4 text-rose-500 ml-auto" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 border-l-2 border-amber-500 pl-2">Institutional Qualitative</p>
            <div className="space-y-4">
              {qual.map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.label}</span>
                    <span className="text-xs font-black text-white">{c.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${c.score > 70 ? 'bg-emerald-500' : c.score > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [symbol, setSymbol] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [discoveryResults, setDiscoveryResults] = useState<DiscoveryStock[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pennystocks_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const isProAccess = user?.isPro || (user?.trialExpiresAt && user.trialExpiresAt > Date.now());

  const handleSearch = async (target?: string) => {
    const s = target || symbol;
    if (!s) return;
    setIsAnalyzing(true);
    setError(null);
    setDiscoveryResults([]);
    try {
      const data = await analyzeStock(s.toUpperCase());
      setResult(data);
    } catch (e) {
      console.error(e);
      setError("Market Terminal Offline: Verify Node Connectivity.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDiscovery = async (bucket: PriceBucket) => {
    setIsDiscovering(true);
    setResult(null);
    try {
      const data = await discoverStocks(bucket);
      setDiscoveryResults(data);
    } catch (e) {
      console.error(e);
      setError("Cloud Logic Exception: Re-scanning required.");
    } finally {
      setIsDiscovering(false);
    }
  };

  const downloadCSV = (data: string, filename: string) => {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDiscoveryToCSV = () => {
    if (!isProAccess) {
      setShowSubscription(true);
      return;
    }
    if (discoveryResults.length === 0) return;
    const headers = ['Symbol', 'Name', 'Price (INR)', 'Exchange', 'Alpha Pass Count (/14)', 'Segment'];
    const rows = discoveryResults.map(s => [
      s.symbol,
      `"${s.name}"`,
      s.price,
      s.exchange,
      s.passCount,
      `"${s.segment}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(csvContent, `alpha_scan_discovery_${new Date().getTime()}.csv`);
  };

  const exportAnalysisToCSV = () => {
    if (!isProAccess) {
      setShowSubscription(true);
      return;
    }
    if (!result || !symbol) return;
    const m = result.metrics;
    const data = [
      ['Analysis Report', `Ticker: ${symbol}`],
      ['Sector', result.sector],
      ['Verdict', result.verdict],
      [''],
      ['Alpha 14-Point Scan Metrics'],
      ['P/E Ratio', m.peRatio],
      ['ROIC (%)', m.roic],
      ['Debt-to-Equity', m.deRatio],
      ['EPS 5Y CAGR (%)', m.epsCAGR],
      ['ROE (%)', m.roe],
      ['Revenue CAGR (%)', m.revenueCAGR],
      ['EBIT Margin (%)', m.ebitMargin],
      ['Gross Margin (%)', m.grossMargin],
      ['Free Cash Flow Status', m.fcfStatus],
      ['Promoter Holding (%)', m.promoterHolding],
      ['Pledged Percentage (%)', m.pledgedPercentage],
      ['Industry Tailwinds Score', m.industryTailwinds],
      ['Competitive Moat Score', m.competitiveMoat],
      ['Valuation Safety Score', m.valuationSafety],
      ['Management Governance Score', m.managementGovernance],
      [''],
      ['Growth Trajectory Projections'],
      ['Year', 'Price Target (INR)', 'Label'],
      ...result.trajectory.map(t => [t.year, t.price, t.label])
    ];
    const csvContent = data.map(r => r.join(',')).join('\n');
    downloadCSV(csvContent, `${symbol}_institutional_audit_${new Date().getTime()}.csv`);
  };

  const handleProSuccess = () => {
    if (user) {
      const updatedUser = { ...user, isPro: true, trialExpiresAt: undefined };
      setUser(updatedUser);
      localStorage.setItem('pennystocks_user', JSON.stringify(updatedUser));
      setShowSubscription(false);
    }
  };

  const handleTrialStart = () => {
    if (user) {
      const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
      const updatedUser = { ...user, trialExpiresAt: Date.now() + twoDaysInMs };
      setUser(updatedUser);
      localStorage.setItem('pennystocks_user', JSON.stringify(updatedUser));
      setShowSubscription(false);
    }
  };

  const segments = discoveryResults.reduce((acc, curr) => {
    if (!acc[curr.segment]) acc[curr.segment] = [];
    acc[curr.segment].push(curr);
    return acc;
  }, {} as Record<string, DiscoveryStock[]>);

  const getTrialRemainingText = () => {
    if (!user?.trialExpiresAt) return null;
    const diff = user.trialExpiresAt - Date.now();
    if (diff <= 0) return "Trial Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h left in Tour`;
  };

  return (
    <div className="min-h-screen bg-[#05090f] text-slate-200 selection:bg-emerald-500/30">
      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)} 
          onLogin={(u) => { 
            setUser(u); 
            localStorage.setItem('pennystocks_user', JSON.stringify(u)); 
            setShowAuth(false);
          }} 
        />
      )}

      {showSubscription && (
        <SubscriptionModal 
          onClose={() => setShowSubscription(false)} 
          onSuccess={handleProSuccess} 
          onTrialStart={handleTrialStart}
          userHasTrialed={!!user?.trialExpiresAt}
        />
      )}

      {!user ? (
        <LandingView onGetStarted={() => setShowAuth(true)} />
      ) : (
        <>
          <header className="sticky top-0 z-50 bg-[#0a111a]/80 backdrop-blur-xl border-b border-white/5 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => {setResult(null); setDiscoveryResults([]);}}>
                <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Rocket className="w-5 h-5 text-slate-900" />
                </div>
                <h1 className="text-xl font-black tracking-tighter text-white italic uppercase">LAU-PENNYSTOCKS.IN</h1>
                {user.isPro && (
                  <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ml-2">
                    <Crown className="w-3 h-3" /> PRO
                  </span>
                )}
                {!user.isPro && user.trialExpiresAt && user.trialExpiresAt > Date.now() && (
                  <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ml-2">
                    <Timer className="w-3 h-3" /> TOUR MODE
                  </span>
                )}
              </div>

              <div className="flex-1 max-w-md mx-8 hidden md:block">
                <div className="relative">
                  <input 
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search Institutional Ticker..."
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-10 text-sm focus:border-emerald-500 outline-none transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <div className="flex items-center gap-6">
                {!user.isPro && (
                  <div className="flex items-center gap-3">
                    {user.trialExpiresAt && user.trialExpiresAt > Date.now() && (
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5">
                         {getTrialRemainingText()}
                       </span>
                    )}
                    <button 
                      onClick={() => setShowSubscription(true)}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20"
                    >
                      <Crown className="w-3 h-3" /> {user.trialExpiresAt && user.trialExpiresAt > Date.now() ? 'Buy Pro' : 'Upgrade'}
                    </button>
                  </div>
                )}
                <div className="text-right hidden sm:block">
                  <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none">Status: Connected</p>
                  <p className="text-[10px] font-black text-white uppercase mt-1">{user.email.split('@')[0]}</p>
                </div>
                <button onClick={() => { setUser(null); localStorage.removeItem('pennystocks_user'); }} className="p-2 text-slate-500 hover:text-rose-400 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto p-6">
            {!result && !isAnalyzing && discoveryResults.length === 0 && (
              <div className="py-20 text-center space-y-12">
                <div className="inline-flex items-center gap-3 bg-[#0a111a] border border-white/5 px-6 py-2 rounded-full shadow-2xl">
                  <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Multi-Step Alpha Scanning Engine</span>
                </div>
                <h2 className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter italic">Alpha Node</h2>
                <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
                  {(['under20', 'under50', 'under100', 'multibagger'] as PriceBucket[]).map(b => (
                    <button 
                      key={b} 
                      onClick={() => handleDiscovery(b)} 
                      className="group relative px-8 py-5 bg-slate-900 border border-white/10 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all hover:-translate-y-2 hover:border-emerald-500/50"
                    >
                      <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-5 blur-xl transition-opacity rounded-3xl" />
                      <span className="relative z-10">{b.replace('under', '₹')} Radar Scan</span>
                    </button>
                  ))}
                </div>
                {!isProAccess && (
                  <div className="max-w-md mx-auto pt-10">
                    <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-[2rem] text-center">
                       <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-4">Limited Access Enabled</p>
                       <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">Upgrade to Alpha Pro for ₹5,000/year or start a free 2-day website tour to unlock all features.</p>
                       <button 
                         onClick={() => setShowSubscription(true)}
                         className="px-8 py-3 bg-amber-500 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform"
                       >
                         Unlock Pro / Start Tour
                       </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isDiscovering && (
              <div className="py-40 text-center space-y-8">
                <div className="w-24 h-24 border-t-4 border-emerald-500 border-r-4 border-transparent rounded-full animate-spin mx-auto mb-6 shadow-[0_0_80px_rgba(16,185,129,0.1)]" />
                <p className="font-black uppercase tracking-[0.5em] text-slate-500 text-sm animate-pulse">Scanning Exchange Nodes...</p>
              </div>
            )}

            {discoveryResults.length > 0 && (
              <div className="space-y-16 animate-in fade-in duration-700">
                <div className="flex justify-between items-center mb-8 bg-[#0a111a] p-6 rounded-3xl border border-white/5">
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Market Discovery Results</h3>
                  <button 
                    onClick={exportDiscoveryToCSV}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-slate-900 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all group"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    {isProAccess ? 'Export to Excel (.csv)' : 'Export (Pro/Tour only)'}
                  </button>
                </div>

                {Object.entries(segments).map(([segment, stocks]) => (
                  <div key={segment} className="space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-px flex-1 bg-white/5" />
                      <h3 className="text-sm font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-3">
                        <Layers className="w-4 h-4" /> {segment} Segment
                      </h3>
                      <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {stocks.map((s, i) => (
                        <div key={i} onClick={() => handleSearch(s.symbol)} className="bg-[#0a111a] border border-white/5 p-8 rounded-[2.5rem] hover:border-emerald-500/40 hover:bg-slate-900/50 transition-all cursor-pointer group relative overflow-hidden">
                           <div className="flex justify-between items-start mb-6">
                            <div>
                              <h3 className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase italic tracking-tighter">{s.symbol}</h3>
                              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{s.name}</p>
                            </div>
                            <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg text-[9px] font-black border border-emerald-500/20">{s.exchange}</span>
                          </div>
                          <div className="flex items-end justify-between">
                            <span className="text-4xl font-black text-white font-mono">₹{s.price}</span>
                            <div className="text-right">
                              <p className="text-[9px] text-slate-600 font-black uppercase mb-1">Alpha Pass</p>
                              <p className="text-2xl font-black text-emerald-500">{s.passCount}/14</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isAnalyzing && (
              <div className="py-40 text-center">
                <Binary className="w-20 h-20 text-emerald-500 mx-auto mb-8 animate-bounce" />
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Running Institutional Audit...</h3>
                <p className="text-slate-500 mt-4 font-bold uppercase tracking-widest text-xs">Applying 14-Point Alpha Validation Protocol</p>
              </div>
            )}

            {result && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex flex-col lg:flex-row gap-10">
                  <div className="flex-1 space-y-10">
                    <div className="bg-[#0a111a] p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <TrendingUp className="w-64 h-64 text-white" />
                      </div>
                      <div className="relative z-10 flex flex-wrap items-center justify-between gap-8">
                        <div className="space-y-2">
                          <h2 className="text-8xl font-black text-white tracking-tighter italic uppercase leading-none">{symbol}</h2>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] bg-emerald-500/5 px-3 py-1 rounded-lg border border-emerald-500/10">Sector: {result.sector}</span>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Node ID: {Math.random().toString(16).slice(2, 10)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4 items-end">
                          <div className={`px-12 py-6 rounded-[2rem] border-2 shadow-2xl ${result.verdict === 'Bullish' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-2 opacity-50">Validation Verdict</p>
                            <p className="text-3xl font-black italic">{result.verdict}</p>
                          </div>
                          <button 
                            onClick={exportAnalysisToCSV}
                            className="flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                            <Download className="w-4 h-4 text-emerald-500" />
                            {isProAccess ? 'Download Audit Report' : 'Download (Pro/Tour only)'}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <TrajectoryChart data={result.trajectory} />
                    
                    <div className="bg-slate-900/40 p-12 rounded-[3rem] border border-white/5 relative">
                       <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.5em] mb-8 flex items-center gap-3">
                        <Binoculars className="w-5 h-5 text-emerald-500" /> Professional Grade Summary
                       </h3>
                       <p className="text-2xl text-slate-300 leading-relaxed font-medium italic relative z-10">{result.summary}</p>
                    </div>
                  </div>

                  <div className="lg:w-[420px] shrink-0">
                    <AlphaScorecard metrics={result.metrics} />
                    
                    <div className="mt-8 space-y-4">
                       <div className="bg-emerald-500/5 p-8 rounded-[2.5rem] border border-emerald-500/10">
                        <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><Zap className="w-4 h-4" /> Growth Catalysts</h3>
                        <div className="space-y-4">
                          {result.catalysts.map((c, i) => (
                            <div key={i} className="flex gap-4 text-xs font-bold text-slate-400 leading-relaxed">
                              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              {c}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-rose-500/5 p-8 rounded-[2.5rem] border border-rose-500/10">
                        <h3 className="text-xs font-black text-rose-500/50 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Risk Assessment</h3>
                        <div className="space-y-4">
                          {result.risks.map((r, i) => (
                            <div key={i} className="flex gap-4 text-xs font-bold text-slate-500 leading-relaxed italic">
                              <div className="mt-1.5 w-1.5 h-1.5 bg-rose-500/50 shrink-0 rotate-45" />
                              {r}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="max-w-md mx-auto mt-20 bg-rose-500/5 border border-rose-500/10 p-12 rounded-[3rem] text-center">
                <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 italic">Node Fault</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">{error}</p>
                <button onClick={() => setError(null)} className="mt-10 w-full py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20">Re-initialize</button>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
};

export default App;
