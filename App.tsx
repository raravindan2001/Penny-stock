
import React, { useState, useEffect } from 'react';
import { 
  Search, TrendingUp, AlertTriangle, Info, ExternalLink, 
  Loader2, Rocket, LogOut, RefreshCcw, Handshake, 
  DollarSign, Filter, Layers, ChevronRight, PieChart, 
  Activity, Clock, Table as TableIcon, LayoutGrid, Zap, Award, Globe
} from 'lucide-react';
import { analyzeStock, discoverStocks } from './services/geminiService';
import { AnalysisResult, User, DiscoveryStock, PriceBucket } from './types';
import TrajectoryChart from './components/TrajectoryChart';
import AuthModal from './components/AuthModal';
import LandingView from './components/LandingView';

const App: React.FC = () => {
  const [symbol, setSymbol] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [discoveryResults, setDiscoveryResults] = useState<DiscoveryStock[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastDiscoveryBucket, setLastDiscoveryBucket] = useState<PriceBucket | null>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    const savedUser = localStorage.getItem('pennyPulseUser');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('pennyPulseUser', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pennyPulseUser');
    setResult(null);
    setDiscoveryResults([]);
    setSymbol('');
    setLastDiscoveryBucket(null);
  };

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const handleBucketDiscovery = async (bucket: PriceBucket) => {
    if (!user) {
      openAuth('signin');
      return;
    }
    setLastDiscoveryBucket(bucket);
    setIsDiscovering(true);
    setError(null);
    setResult(null); // Clear analysis when discovery starts
    try {
      const data = await discoverStocks(bucket);
      setDiscoveryResults(data);
    } catch (err: any) {
      setError("Market Terminal offline. Retrying connection...");
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleSearch = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const searchSymbol = typeof e === 'string' ? e : symbol;
    
    if (!user) {
      openAuth('signin');
      return;
    }
    if (!searchSymbol.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setDiscoveryResults([]); // Clear discovery when analysis starts
    try {
      const data = await analyzeStock(searchSymbol.toUpperCase());
      setResult(data);
      setSymbol(searchSymbol.toUpperCase());
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please verify ticker code.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefresh = () => {
    if (result) handleSearch(symbol);
    else if (lastDiscoveryBucket) handleBucketDiscovery(lastDiscoveryBucket);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Bullish': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Bearish': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#05090f] selection:bg-emerald-500 selection:text-white">
      {showAuth && (
        <AuthModal 
          initialMode={authMode} 
          onClose={() => setShowAuth(false)} 
          onLogin={handleLogin} 
        />
      )}

      {/* Persistent Navigation */}
      <header className="sticky top-0 z-50 bg-[#0a111a]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 cursor-pointer group shrink-0" onClick={() => {setResult(null); setDiscoveryResults([]); setSymbol(''); setLastDiscoveryBucket(null);}}>
            <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-all">
              <Rocket className="text-slate-900 w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tighter text-white uppercase leading-none">LAU- PENNYSTOCKS</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">www.lau-pennystocks.in</span>
              </div>
            </div>
          </div>

          {user && (
            <form onSubmit={handleSearch} className="flex-1 max-w-xl relative hidden md:block">
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="Deep-dive NSE/BSE Tickers..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:border-emerald-500/50 outline-none transition-all text-white placeholder:text-slate-700"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            </form>
          )}

          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Active Pro Terminal</span>
                  <span className="text-xs font-black text-white lowercase truncate max-w-[140px]">{user.email}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-slate-900/50 hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 p-3 rounded-xl border border-slate-800 transition-all shadow-lg"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => openAuth('signin')} className="hidden md:flex text-slate-500 hover:text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all">Log In</button>
                <button onClick={() => openAuth('signup')} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/10">Register</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Dynamic Viewport */}
      {!user ? (
        <LandingView onGetStarted={openAuth} />
      ) : (
        <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10">
          
          {/* Discovery Dashboard */}
          {!result && !isAnalyzing && (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-2">
                   <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                      <Globe className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Market Discovery</h2>
                   </div>
                  <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Scanning 8,000+ NSE & BSE Instruments</p>
                </div>
                
                <div className="flex flex-wrap gap-3 items-center">
                  <button 
                    onClick={() => handleBucketDiscovery('multibagger')} 
                    className={`px-8 py-4 border rounded-2xl text-xs font-black transition-all flex items-center gap-3 ${lastDiscoveryBucket === 'multibagger' ? 'bg-amber-500 border-amber-500 text-slate-900 shadow-2xl shadow-amber-500/20 scale-[1.02]' : 'bg-slate-950 border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-slate-900 shadow-xl'}`}
                  >
                    <Award className="w-5 h-5" /> MULTIBAGGER RADAR
                  </button>
                  <div className="h-8 w-px bg-slate-800 mx-2 hidden md:block"></div>
                  {(['under20', 'under50', 'under100'] as PriceBucket[]).map(bucket => (
                    <button 
                      key={bucket} 
                      onClick={() => handleBucketDiscovery(bucket)} 
                      className={`px-5 py-4 border rounded-2xl text-[10px] font-black transition-all ${lastDiscoveryBucket === bucket ? 'bg-emerald-500 border-emerald-500 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-emerald-500/50 hover:text-emerald-400'}`}
                    >
                      {bucket.toUpperCase().replace('UNDER', '₹')} TERMINAL
                    </button>
                  ))}
                </div>
              </div>

              {isDiscovering ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-56 bg-slate-900/40 border border-slate-800/50 rounded-[2.5rem] w-full" />
                  ))}
                </div>
              ) : discoveryResults.length > 0 ? (
                <div className="bg-[#0a111a] border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                  <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Opportunities Found ({discoveryResults.length})</span>
                    <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800">
                      <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-emerald-500 text-slate-900' : 'text-slate-700'}`}><TableIcon className="w-4 h-4" /></button>
                      <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-emerald-500 text-slate-900' : 'text-slate-700'}`}><LayoutGrid className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {viewMode === 'table' ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                          <tr className="bg-slate-950/50">
                            <th className="px-10 py-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">Company / Symbol</th>
                            <th className="px-10 py-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">Exchange</th>
                            <th className="px-10 py-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">Segment</th>
                            <th className="px-10 py-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">Current Price</th>
                            {lastDiscoveryBucket === 'multibagger' && <th className="px-10 py-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">Growth Index</th>}
                            <th className="px-10 py-8 text-right"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {discoveryResults.map((s, i) => (
                            <tr key={i} onClick={() => handleSearch(s.symbol)} className="group border-b border-white/5 hover:bg-emerald-500/[0.02] transition-all cursor-pointer">
                              <td className="px-10 py-6">
                                <span className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tighter">{s.symbol}</span>
                                <p className="text-[10px] text-slate-600 font-bold uppercase truncate max-w-[200px] mt-1">{s.name}</p>
                              </td>
                              <td className="px-10 py-6">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black border ${s.exchange === 'NSE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                  {s.exchange}
                                </span>
                              </td>
                              <td className="px-10 py-6">
                                <span className="px-3 py-1 bg-slate-900 rounded-lg border border-slate-800 text-[10px] font-black text-slate-500 uppercase">
                                  {s.segment || s.sector}
                                </span>
                              </td>
                              <td className="px-10 py-6">
                                <span className="text-2xl font-black text-emerald-500 font-mono">₹{s.price}</span>
                              </td>
                              {lastDiscoveryBucket === 'multibagger' && (
                                <td className="px-10 py-6">
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-1 bg-slate-900 rounded-full overflow-hidden">
                                      <div className="h-full bg-amber-500" style={{ width: `${s.multibaggerScore || 0}%` }} />
                                    </div>
                                    <span className="text-[11px] font-black text-amber-500">{s.multibaggerScore}</span>
                                  </div>
                                </td>
                              )}
                              <td className="px-10 py-6 text-right">
                                <ChevronRight className="w-5 h-5 text-slate-800 group-hover:text-emerald-500 transition-all ml-auto translate-x-0 group-hover:translate-x-1" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                      {discoveryResults.map((s, i) => (
                        <div key={i} onClick={() => handleSearch(s.symbol)} className="group bg-slate-950 border border-white/5 p-8 rounded-[2.5rem] hover:border-emerald-500/30 transition-all cursor-pointer relative overflow-hidden">
                          <div className="flex justify-between items-start mb-8">
                            <div>
                              <span className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tighter">{s.symbol}</span>
                              <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">{s.name}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black border ${s.exchange === 'NSE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                              {s.exchange}
                            </span>
                          </div>
                          <div className="flex items-end justify-between">
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest block">Last Price</span>
                              <span className="text-4xl font-black text-emerald-500 font-mono tracking-tighter">₹{s.price}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest block mb-1">Sector</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{s.segment || s.sector}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-40 bg-slate-900/10 border border-dashed border-white/10 rounded-[4rem] group hover:bg-slate-900/20 transition-all">
                   <div className="relative inline-block mb-8">
                    <Layers className="w-20 h-20 text-slate-800 group-hover:text-emerald-500/40 transition-all" />
                    <Activity className="w-10 h-10 text-emerald-500 absolute -bottom-2 -right-2 animate-bounce" />
                   </div>
                   <h3 className="text-xl font-black text-slate-700 uppercase tracking-tighter mb-4">Terminal Standby</h3>
                   <p className="text-slate-600 font-bold uppercase tracking-[0.4em] text-[10px] max-w-sm mx-auto leading-relaxed">Select a category above or search a specific ticker to initiate neural trajectory analysis.</p>
                </div>
              )}
            </div>
          )}

          {/* Analysis View (5/10/15 Years Trajectory) */}
          {(isAnalyzing || result) && (
            <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-40">
                  <div className="relative mb-12">
                    <div className="w-32 h-32 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
                    <Rocket className="w-12 h-12 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter text-center">Neural Trajectory Mapping...</h3>
                  <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-[10px] mt-4 text-center">Aggregating cross-exchange market signals & institutional data</p>
                </div>
              ) : result && (
                <div className="space-y-10 pb-20">
                  {/* Result Header */}
                  <div className="flex flex-col lg:flex-row items-start justify-between gap-10">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-6 mb-6">
                        <h2 className="text-7xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">{symbol}</h2>
                        <div className={`px-8 py-3 rounded-2xl text-lg font-black uppercase border shadow-2xl ${getVerdictColor(result.verdict)}`}>
                          {result.verdict} OUTLOOK
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-3 bg-slate-900/80 px-6 py-3 rounded-2xl border border-white/5 shadow-xl">
                          <Activity className="w-5 h-5 text-emerald-500" />
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{result.sectorClassification}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-900/80 px-6 py-3 rounded-2xl border border-white/5 shadow-xl">
                          <Clock className="w-5 h-5 text-slate-600" />
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Node Updated: {result.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={handleRefresh} className="p-6 bg-slate-900 border border-white/5 rounded-3xl text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-2xl group active:scale-95">
                      <RefreshCcw className="w-8 h-8 group-hover:rotate-180 transition-transform duration-700" />
                    </button>
                  </div>

                  {/* Projections Matrix */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    <div className="xl:col-span-2 space-y-10">
                      {/* Interactive Chart */}
                      <div className="bg-[#0a111a] p-2 rounded-[3.5rem] border border-white/5 shadow-2xl overflow-hidden">
                        <TrajectoryChart data={result.trajectory} />
                      </div>

                      {/* Summary Analysis */}
                      <div className="bg-[#0a111a] border border-white/5 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Zap className="w-32 h-32 text-amber-500" />
                        </div>
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                          <Zap className="w-5 h-5 text-amber-500" /> Executive Analysis Summary
                        </h3>
                        <p className="text-slate-300 text-2xl leading-relaxed font-medium italic border-l-8 border-emerald-500/20 pl-10">
                          {result.summary}
                        </p>
                      </div>

                      {/* Strategic Matrix */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[3.5rem] p-12 shadow-xl group hover:border-emerald-500/30 transition-all">
                          <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                            <TrendingUp className="w-5 h-5" /> Bullish Catalysts
                          </h3>
                          <ul className="space-y-6">
                            {result.catalysts.map((c, i) => (
                              <li key={i} className="flex items-start gap-4 text-base text-slate-400 font-bold leading-relaxed">
                                <div className="mt-2 w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-rose-500/[0.03] border border-rose-500/10 rounded-[3.5rem] p-12 shadow-xl group hover:border-rose-500/30 transition-all">
                          <h3 className="text-xs font-black text-rose-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5" /> Risk Factors
                          </h3>
                          <ul className="space-y-6">
                            {result.risks.map((r, i) => (
                              <li key={i} className="flex items-start gap-4 text-base text-slate-400 font-bold leading-relaxed">
                                <div className="mt-2 w-2 h-2 rounded-full bg-rose-500 shrink-0 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Operational Sidebar */}
                    <div className="space-y-10">
                      <div className="bg-[#0a111a] border border-white/5 rounded-[3.5rem] p-10 shadow-2xl">
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.4em] mb-10">Operational Metrics</h3>
                        <div className="space-y-10">
                          <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 shadow-inner group">
                            <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest block mb-3">Revenue Velocity (QoQ)</span>
                            <span className="text-5xl font-black text-white group-hover:text-emerald-500 transition-colors tracking-tighter">{result.revenueGrowthQoQ}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest block mb-4">Operating Efficiency</span>
                            <div className="space-y-4">
                              {result.operatingMargins.map((m, i) => (
                                <div key={i} className="flex justify-between items-center bg-slate-950/50 p-4 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all">
                                  <span className="text-xs font-black text-slate-500 uppercase">{m.year}</span>
                                  <span className="text-sm font-black text-emerald-400 font-mono">{m.value}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#0a111a] border border-white/5 rounded-[3.5rem] p-10 shadow-2xl">
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.4em] mb-10">Expansion Horizon</h3>
                        <div className="space-y-6">
                          {result.futureDeals.map((d, i) => (
                            <div key={i} className="flex items-start gap-4 bg-slate-950/40 p-6 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                              <Handshake className="w-6 h-6 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                              <span className="text-sm font-bold text-slate-300 leading-relaxed tracking-tight">{d}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {result.sources.length > 0 && (
                        <div className="bg-slate-950/80 border border-white/5 rounded-[3.5rem] p-10 shadow-2xl">
                          <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] mb-10">Live Citations</h3>
                          <div className="space-y-4">
                            {result.sources.map((s, i) => (
                              <a 
                                key={i} 
                                href={s.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/30 hover:bg-slate-900 border border-transparent hover:border-emerald-500/30 transition-all group"
                              >
                                <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-300 truncate max-w-[200px]">{s.title}</span>
                                <ExternalLink className="w-4 h-4 text-slate-800 group-hover:text-emerald-500" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="max-w-md mx-auto mt-20 bg-rose-500/10 border border-rose-500/20 p-12 rounded-[3.5rem] text-center shadow-2xl animate-in zoom-in duration-300">
              <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Analysis Terminal Fault</h3>
              <p className="text-slate-400 text-base font-medium leading-relaxed">{error}</p>
              <button onClick={() => setError(null)} className="mt-10 px-10 py-4 bg-rose-500/20 text-rose-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Reset Node</button>
            </div>
          )}
        </main>
      )}

      {/* Global Footer */}
      <footer className="mt-auto border-t border-white/5 py-20 px-6 bg-[#03060a]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-5 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
            <Rocket className="text-emerald-500 w-8 h-8" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Lau- PennyStocks</h2>
          </div>
          <div className="text-center lg:text-left">
            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.3em] leading-relaxed max-w-lg">
              © {new Date().getFullYear()} Lau- PennyStocks Engine. High-performance micro-cap analyst powered by Gemini Neural Models. Professional financial software for educational purposes.
            </p>
          </div>
          <div className="flex items-center gap-10">
            <a href="#" className="text-[11px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-colors">Privacy Hub</a>
            <a href="#" className="text-[11px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-colors">Risk Protocol</a>
            <div className="h-6 w-px bg-slate-900" />
            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Live Terminal
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
