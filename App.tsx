
import React, { useState, useEffect } from 'react';
import { 
  Search, TrendingUp, AlertTriangle, Info, ExternalLink, 
  Loader2, Rocket, LogIn, LogOut, RefreshCcw,
  Handshake, DollarSign, ArrowUpRight, Percent, Filter,
  Layers, ChevronRight, PieChart, Activity, Clock,
  Table as TableIcon, LayoutGrid, Zap, Award, UserPlus, Globe
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
  
  // Auth state
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
    try {
      const data = await discoverStocks(bucket);
      setDiscoveryResults(data);
      setResult(null);
    } catch (err: any) {
      setError("Market Screener node timed out. Please retry.");
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
    try {
      const data = await analyzeStock(searchSymbol.toUpperCase());
      setResult(data);
      setDiscoveryResults([]);
      setSymbol(searchSymbol.toUpperCase());
    } catch (err: any) {
      setError(err.message || 'Analysis aborted. Ticker verification failed.');
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
    <div className="min-h-screen flex flex-col bg-[#05090f]">
      {showAuth && (
        <AuthModal 
          initialMode={authMode} 
          onClose={() => setShowAuth(false)} 
          onLogin={handleLogin} 
        />
      )}

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#0a111a]/90 backdrop-blur-2xl border-b border-white/5 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => {setResult(null); setDiscoveryResults([]); setSymbol(''); setLastDiscoveryBucket(null);}}>
            <div className="bg-emerald-500 p-2.5 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform">
              <Rocket className="text-slate-900 w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tighter text-white uppercase leading-none">LAU- PENNYSTOCKS</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-emerald-500 font-black uppercase tracking-[0.2em]">Institutional</span>
                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">www.lau-pennystocks.in</span>
              </div>
            </div>
          </div>

          {user && (
            <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-8 relative hidden md:block">
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="Deep Search NSE/BSE..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:border-emerald-500/50 outline-none transition-all text-white placeholder:text-slate-800"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
              <button type="submit" className="hidden" />
            </form>
          )}

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Operator Access</span>
                  <span className="text-xs font-black text-white lowercase truncate max-w-[140px]">{user.email}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-slate-900 hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 p-3 rounded-xl border border-slate-800 transition-all flex items-center gap-2 group shadow-xl"
                  title="Secure Logout"
                >
                  <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span className="text-[10px] font-black uppercase hidden md:inline">Exit Stream</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => openAuth('signin')}
                  className="hidden md:flex items-center gap-2 text-slate-400 hover:text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                >
                  Operator Portal
                </button>
                <button 
                  onClick={() => openAuth('signup')}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-emerald-500/20"
                >
                  Create Node
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {!user ? (
        <LandingView onGetStarted={openAuth} />
      ) : (
        <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Dashboard Search Section for Mobile/Logged In */}
          <div className="md:hidden mb-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="Search Ticker..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-emerald-500/50 outline-none transition-all text-white placeholder:text-slate-800"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
            </form>
          </div>

          {/* Screener Categories Section */}
          {!result && !isAnalyzing && (
            <div className="mb-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                  <h2 className="text-4xl font-black text-white flex items-center gap-4 tracking-tighter uppercase italic">
                    <Filter className="w-8 h-8 text-emerald-500" /> Market Scanner
                  </h2>
                  <p className="text-slate-600 font-bold mt-2 uppercase tracking-[0.3em] text-[10px]">Real-time Segment Analysis • Active Nodes: NSE & BSE</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <button 
                    onClick={() => handleBucketDiscovery('multibagger')}
                    className={`px-8 py-4 border rounded-2xl text-xs font-black transition-all flex items-center gap-3 ${lastDiscoveryBucket === 'multibagger' ? 'bg-amber-500 border-amber-500 text-slate-900 shadow-2xl shadow-amber-500/20 scale-105' : 'bg-slate-900 border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-slate-900 hover:border-amber-500 shadow-xl'}`}
                  >
                    <Award className="w-5 h-5" /> TOP 20 MULTIBAGGER RADAR
                  </button>
                  <div className="h-10 w-px bg-slate-800 mx-2 hidden md:block"></div>
                  {(['under20', 'under50', 'under100'] as PriceBucket[]).map(bucket => (
                    <button 
                      key={bucket}
                      onClick={() => handleBucketDiscovery(bucket)}
                      className={`px-5 py-4 border rounded-2xl text-[10px] font-black transition-all ${lastDiscoveryBucket === bucket ? 'bg-emerald-500 border-emerald-500 text-slate-900 shadow-2xl shadow-emerald-500/20 scale-105' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-slate-800 shadow-lg'}`}
                    >
                      {bucket.toUpperCase().replace('UNDER', '₹')} TERMINAL
                    </button>
                  ))}
                </div>
              </div>

              {isDiscovering ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-48 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] w-full"></div>
                  ))}
                </div>
              ) : discoveryResults.length > 0 ? (
                <div className="bg-[#0a111a] border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden relative group/table">
                  <div className="absolute top-8 right-10 z-10 flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">Terminal Layout</span>
                    <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 shadow-inner">
                      <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-emerald-500 text-slate-900' : 'text-slate-700'}`}><TableIcon className="w-4 h-4" /></button>
                      <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-emerald-500 text-slate-900' : 'text-slate-700'}`}><LayoutGrid className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {viewMode === 'table' ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                          <tr className="border-b border-white/5 bg-slate-950/50">
                            <th className="px-10 py-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Institutional Ticker</th>
                            <th className="px-10 py-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Exchange Node</th>
                            <th className="px-10 py-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Growth Segment</th>
                            <th className="px-10 py-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Current LTP</th>
                            {lastDiscoveryBucket === 'multibagger' && (
                              <>
                                <th className="px-10 py-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">5Y Perf Matrix</th>
                                <th className="px-10 py-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">M-B Score</th>
                              </>
                            )}
                            <th className="px-10 py-10 text-right"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {discoveryResults.map((s, i) => (
                            <tr key={i} onClick={() => handleSearch(s.symbol)} className="group border-b border-white/5 hover:bg-white/[0.03] transition-all cursor-pointer">
                              <td className="px-10 py-8">
                                <span className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{s.symbol}</span>
                                <p className="text-[10px] text-slate-600 font-bold uppercase truncate max-w-[140px] mt-1">{s.name}</p>
                              </td>
                              <td className="px-10 py-8">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black border ${s.exchange === 'NSE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                  {s.exchange} NODE
                                </span>
                              </td>
                              <td className="px-10 py-8">
                                <span className="px-3 py-1 bg-slate-900/80 rounded-lg border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-tighter group-hover:text-emerald-500/70 transition-colors">
                                  {s.segment || s.sector}
                                </span>
                              </td>
                              <td className="px-10 py-8">
                                <span className="text-xl font-black text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">₹{s.price}</span>
                              </td>
                              {lastDiscoveryBucket === 'multibagger' && (
                                <>
                                  <td className="px-10 py-8">
                                    <div className="flex items-center gap-2">
                                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                      <span className="text-sm font-black text-slate-300">{s.historicalCAGR || 'N/A'}</span>
                                    </div>
                                  </td>
                                  <td className="px-10 py-8">
                                    <div className="flex items-center gap-3">
                                      <div className="h-1.5 w-16 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${s.multibaggerScore}%` }}></div>
                                      </div>
                                      <span className="text-[11px] font-black text-amber-500">{s.multibaggerScore}</span>
                                    </div>
                                  </td>
                                </>
                              )}
                              <td className="px-10 py-8 text-right">
                                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all inline-block">
                                  <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-slate-900 transition-colors" />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {discoveryResults.map((s, i) => (
                        <div key={i} onClick={() => handleSearch(s.symbol)} className="bg-slate-950/40 border border-slate-800 p-8 rounded-[2.5rem] hover:border-emerald-500/30 transition-all cursor-pointer group hover:-translate-y-2 shadow-xl">
                          <div className="flex justify-between items-start mb-8">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase">{s.symbol}</h4>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black ${s.exchange === 'NSE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                  {s.exchange}
                                </span>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">{s.segment || s.sector}</span>
                            </div>
                            <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl text-lg font-black border border-emerald-500/20">₹{s.price}</div>
                          </div>
                          {s.multibaggerScore && (
                            <div className="mb-6 flex items-center justify-between bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
                              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">M-B Score Index</span>
                              <span className="text-base font-black text-amber-500">{s.multibaggerScore} <span className="text-[10px] opacity-60">/ 100</span></span>
                            </div>
                          )}
                          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed italic font-medium">"{s.potential}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : !result && (
                <div className="bg-slate-900/10 border border-dashed border-slate-800 p-32 rounded-[4rem] text-center backdrop-blur-sm group">
                  <Globe className="w-24 h-24 text-slate-800 mx-auto mb-10 animate-spin-slow opacity-50 group-hover:text-emerald-500 group-hover:opacity-100 transition-all duration-1000" />
                  <h3 className="text-slate-600 font-black uppercase tracking-[0.6em] text-lg mb-6">Initialize Global Indian Market Stream</h3>
                  <p className="text-slate-800 font-bold uppercase tracking-[0.3em] text-xs">Select a terminal bucket above to start deep-dive scanning</p>
                </div>
              )}
            </div>
          )}

          {/* Analysis View (Remains similar but with refined spacing) */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-52">
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-emerald-500 blur-[200px] opacity-10 animate-pulse"></div>
                <Loader2 className="w-32 h-32 text-emerald-500 animate-spin relative" />
              </div>
              <h3 className="text-5xl font-black text-white tracking-tighter text-center uppercase leading-none mb-4">Decompiling Market Vectors...</h3>
              <p className="text-slate-700 font-black uppercase tracking-[0.4em] text-xs">Accessing NSE-BSE Neural Nodes</p>
            </div>
          )}

          {result && !isAnalyzing && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="lg:col-span-2 space-y-12">
                {/* Result Dashboard Panel */}
                <div className="bg-[#0a111a] p-10 md:p-16 rounded-[4rem] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
                  <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] pointer-events-none"></div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-10 mb-20">
                    <div className="flex items-center gap-10">
                      <div className="w-28 h-28 bg-emerald-500/10 rounded-[3rem] flex items-center justify-center border border-emerald-500/20 shadow-inner group">
                        <Layers className="w-14 h-14 text-emerald-500 group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h2 className="text-7xl font-black tracking-tighter text-white mb-4 uppercase">{symbol}</h2>
                        <div className="flex flex-wrap items-center gap-6">
                          <span className="bg-slate-900 text-slate-400 text-[11px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest border border-white/5">{result.sectorClassification}</span>
                          <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <Clock className="w-4 h-4 text-emerald-500" />
                            <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Node Sync: {result.lastUpdated}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-5">
                      <button onClick={handleRefresh} className="p-6 bg-slate-950 border border-slate-800 rounded-3xl text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-2xl group"><RefreshCcw className="w-7 h-7 group-active:rotate-180 transition-transform duration-1000" /></button>
                      <div className={`px-12 py-6 rounded-3xl border text-xl font-black flex items-center gap-5 shadow-2xl ${getVerdictColor(result.verdict)}`}>
                        <PieChart className="w-7 h-7" />
                        {result.verdict.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
                    <div className="bg-slate-950 border border-slate-800 p-12 rounded-[3rem] hover:border-emerald-500/30 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none"></div>
                      <h4 className="text-slate-600 text-[11px] font-black uppercase tracking-[0.4em] mb-8">REVENUE VELOCITY QoQ</h4>
                      <div className="flex items-center justify-between">
                        <p className="text-6xl font-black text-white group-hover:text-emerald-400 transition-colors drop-shadow-lg">{result.revenueGrowthQoQ}</p>
                        <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20"><ArrowUpRight className="w-10 h-10 text-emerald-500" /></div>
                      </div>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-12 rounded-[3rem] hover:border-emerald-500/30 transition-all">
                      <h4 className="text-slate-600 text-[11px] font-black uppercase tracking-[0.4em] mb-10 text-center">INSTITUTIONAL MARGINS</h4>
                      <div className="flex items-end justify-between gap-6 h-28">
                        {result.operatingMargins.map((m, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center">
                            <div className="w-full bg-emerald-500/20 border-t-4 border-emerald-500 rounded-t-2xl transition-all hover:bg-emerald-500/40" style={{ height: `${Math.max(15, Math.min(100, Math.abs(m.value * 3.5)))}%` }}></div>
                            <span className="text-[10px] text-slate-600 mt-5 font-black uppercase">{m.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-400 leading-relaxed text-3xl font-medium mb-16 border-l-[12px] border-emerald-500/20 pl-12 italic">"{result.summary}"</p>
                  
                  <div className="pt-10 border-t border-white/5">
                    <TrajectoryChart data={result.trajectory} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="bg-[#0a111a] border border-white/5 p-14 rounded-[4rem] shadow-2xl relative">
                    <div className="absolute top-10 right-10 opacity-10"><Handshake className="w-20 h-20 text-emerald-500" /></div>
                    <h4 className="text-emerald-400 font-black text-2xl mb-12 flex items-center gap-6 uppercase tracking-tighter">Strategic Catalyst Deals</h4>
                    <div className="space-y-10">
                      {result.futureDeals.map((deal, i) => (
                        <div key={i} className="flex gap-8 items-start group">
                          <span className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex-shrink-0 flex items-center justify-center text-emerald-500 text-lg font-black border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-slate-900 transition-all duration-300">0{i+1}</span> 
                          <p className="text-slate-400 text-lg font-medium leading-relaxed pt-3">{deal}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#0a111a] border border-white/5 p-14 rounded-[4rem] shadow-2xl relative">
                    <div className="absolute top-10 right-10 opacity-10"><DollarSign className="w-20 h-20 text-amber-500" /></div>
                    <h4 className="text-amber-400 font-black text-2xl mb-12 flex items-center gap-6 uppercase tracking-tighter">Scale Intelligence</h4>
                    <div className="space-y-10">
                      {result.investmentOpportunities.map((opp, i) => (
                        <div key={i} className="flex gap-8 items-start group">
                          <span className="w-14 h-14 rounded-2xl bg-amber-500/10 flex-shrink-0 flex items-center justify-center text-amber-500 text-xl font-black border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-900 transition-all duration-300">+</span> 
                          <p className="text-slate-400 text-lg font-medium leading-relaxed pt-3">{opp}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Sources & Notice */}
              <div className="space-y-10">
                <div className="bg-[#0a111a] p-12 rounded-[4rem] border border-white/5 sticky top-32 shadow-2xl">
                  <div className="flex items-center justify-between mb-12">
                    <h4 className="text-2xl font-black flex items-center gap-5 text-white uppercase tracking-tighter"><Info className="w-10 h-10 text-emerald-500" /> DEEP SOURCES</h4>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-5 py-2 rounded-full border border-emerald-500/20 uppercase tracking-[0.3em]">Verified</span>
                  </div>
                  <div className="space-y-6">
                    {result.sources.length > 0 ? result.sources.map((source, i) => (
                      <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="group block p-8 bg-slate-950 border border-slate-800 rounded-[2rem] transition-all hover:border-emerald-500/50 hover:translate-x-4 shadow-xl">
                        <div className="flex justify-between items-start gap-6">
                          <span className="text-base font-bold text-slate-400 line-clamp-2 leading-relaxed group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{source.title}</span>
                          <ExternalLink className="w-5 h-5 text-slate-800 flex-shrink-0 group-hover:text-emerald-500" />
                        </div>
                      </a>
                    )) : (
                      <p className="text-sm text-slate-800 font-black uppercase text-center py-16 tracking-widest">Syncing with Exchange records...</p>
                    )}
                  </div>
                  <div className="mt-20 pt-12 border-t border-slate-900">
                    <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.6em] mb-8">DISCLAIMER</h5>
                    <p className="text-[13px] leading-relaxed text-slate-800 font-black italic uppercase italic">
                      AI GENERATED PROJECTIONS ARE SPECULATIVE. INVESTING IN PENNY STOCKS CARRIES EXTREME RISK. WWW.LAU-PENNYSTOCKS.IN IS AN ANALYSIS TERMINAL, NOT A BROKERAGE.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Global Footer */}
      <footer className="border-t border-white/5 py-32 px-6 bg-[#03060a] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16 text-center md:text-left">
          <div className="max-w-md">
            <div className="flex items-center gap-5 mb-8 justify-center md:justify-start">
              <div className="bg-emerald-500 p-2.5 rounded-xl">
                <Rocket className="w-6 h-6 text-slate-900" />
              </div>
              <span className="font-black text-white text-3xl tracking-tighter uppercase">LAU- PENNYSTOCKS</span>
            </div>
            <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6 uppercase tracking-wider">
              "The premier institutional-grade analysis engine for Indian micro-cap equities. Detect trajectories, predict multibaggers, master the markets."
            </p>
            <p className="text-slate-800 text-[10px] font-black uppercase tracking-[0.4em]">© 2024 WWW.LAU-PENNYSTOCKS.IN • FINANCIAL AI NODE V4.2</p>
          </div>
          <div className="flex flex-wrap justify-center gap-16 font-black uppercase tracking-[0.3em] text-[11px] text-slate-700">
            <div className="flex flex-col gap-6">
              <span className="text-white text-xs tracking-[0.5em] mb-2 opacity-30">TERMINAL</span>
              <a href="#" className="hover:text-emerald-400 transition-all">NSE Radar</a>
              <a href="#" className="hover:text-emerald-400 transition-all">BSE Radar</a>
              <a href="#" className="hover:text-emerald-400 transition-all">Trajectory Engine</a>
            </div>
            <div className="flex flex-col gap-6">
              <span className="text-white text-xs tracking-[0.5em] mb-2 opacity-30">LEGAL</span>
              <a href="#" className="hover:text-emerald-400 transition-all">Privacy Protocol</a>
              <a href="#" className="hover:text-emerald-400 transition-all">Terms of Access</a>
              <a href="#" className="hover:text-emerald-400 transition-all">Risk Disclosure</a>
            </div>
            <div className="flex flex-col gap-6">
              <span className="text-white text-xs tracking-[0.5em] mb-2 opacity-30">NODE STATUS</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-emerald-500">SYSTEMS OPERATIONAL</span>
              </div>
              <a href="#" className="hover:text-emerald-400 transition-all">v4.2 Changelog</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
