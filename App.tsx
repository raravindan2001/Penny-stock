
import React, { useState, useEffect } from 'react';
import { 
  Search, TrendingUp, AlertTriangle, Info, ExternalLink, 
  Loader2, BarChart3, Rocket, LogIn, LogOut, User as UserIcon,
  Zap, Handshake, DollarSign, ArrowUpRight, Percent, Filter,
  Layers, ChevronRight, PieChart, Activity
} from 'lucide-react';
import { analyzeStock, discoverStocks } from './services/geminiService';
import { AnalysisResult, User, DiscoveryStock, PriceBucket } from './types';
import TrajectoryChart from './components/TrajectoryChart';
import AuthModal from './components/AuthModal';

const App: React.FC = () => {
  const [symbol, setSymbol] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [discoveryResults, setDiscoveryResults] = useState<DiscoveryStock[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);

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
  };

  const handleBucketDiscovery = async (bucket: PriceBucket) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setIsDiscovering(true);
    setError(null);
    try {
      const data = await discoverStocks(bucket);
      setDiscoveryResults(data);
      setResult(null);
    } catch (err: any) {
      setError("Failed to fetch NSE screener results.");
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleSearch = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const searchSymbol = typeof e === 'string' ? e : symbol;
    
    if (!user) {
      setShowAuth(true);
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
      setError(err.message || 'Something went wrong. Check ticker.');
    } finally {
      setIsAnalyzing(false);
    }
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
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={handleLogin} />}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a111a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => {setResult(null); setDiscoveryResults([]);}}>
            <div className="bg-emerald-500 p-2.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Rocket className="text-slate-900 w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black tracking-tighter text-white uppercase">LAU- PENNYSTOCKS <span className="text-emerald-500">NSE</span></h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Institutional Engine</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-6 relative">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Search NSE Tickers (e.g. SUZLON, ZOMATO)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:border-emerald-500/50 outline-none transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <button type="submit" className="hidden" />
          </form>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Authorized Member</span>
                  <span className="text-sm font-black text-white">{user.phone}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 px-4 py-2.5 rounded-xl border border-slate-800 transition-all font-black text-xs uppercase"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuth(true)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
              >
                <LogIn className="w-4 h-4" />
                Auth Securely
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10">
        
        {/* Screener Categories Section */}
        {!result && !isAnalyzing && (
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <Filter className="w-6 h-6 text-emerald-500" /> NSE Discovery Screener
                </h2>
                <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[11px]">Real-time Category Analysis</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleBucketDiscovery('under20')}
                  className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-black text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-all flex items-center gap-2"
                >
                  <Percent className="w-3 h-3" /> UNDER ₹20
                </button>
                <button 
                  onClick={() => handleBucketDiscovery('under50')}
                  className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-black text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-all flex items-center gap-2"
                >
                  <Percent className="w-3 h-3" /> UNDER ₹50
                </button>
                <button 
                  onClick={() => handleBucketDiscovery('under100')}
                  className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-black text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-all flex items-center gap-2"
                >
                  <Percent className="w-3 h-3" /> UNDER ₹100
                </button>
              </div>
            </div>

            {isDiscovering ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-900/50 rounded-3xl border border-slate-800" />)}
              </div>
            ) : discoveryResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                {discoveryResults.map((s, i) => (
                  <div 
                    key={i} 
                    onClick={() => handleSearch(s.symbol)}
                    className="group bg-slate-900/30 border border-slate-800 p-6 rounded-3xl hover:border-emerald-500/30 transition-all cursor-pointer hover:bg-[#0a111a]"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors">{s.symbol}</h4>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.sector}</span>
                      </div>
                      <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg text-sm font-black border border-emerald-500/20">
                        ₹{s.price}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-6 line-clamp-2">{s.potential}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-[10px] font-black uppercase text-slate-600 group-hover:text-emerald-500 transition-colors">
                      Run Deep Scan <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !result && (
              <div className="bg-slate-900/10 border border-dashed border-slate-800 p-16 rounded-[2.5rem] text-center">
                <Activity className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                <h3 className="text-slate-600 font-black uppercase tracking-[0.3em] text-sm">Select a category or search a ticker to begin</h3>
              </div>
            )}
          </div>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse"></div>
              <Loader2 className="w-16 h-16 text-emerald-500 animate-spin relative" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tighter">Initializing NSE Neural Analysis...</h3>
            <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs">Simulating margins, future deals & trajectories</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/5 border border-rose-500/20 p-10 rounded-[2.5rem] text-center max-w-2xl mx-auto shadow-2xl">
            <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-white mb-2">SCAN ABORTED</h3>
            <p className="text-slate-400 font-medium">{error}</p>
            <button onClick={() => setError(null)} className="mt-8 px-10 py-4 bg-slate-900 hover:bg-slate-800 rounded-2xl transition-all font-black text-sm uppercase tracking-widest">Dismiss Report</button>
          </div>
        )}

        {result && !isAnalyzing && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="lg:col-span-2 space-y-8">
              {/* Header Stats */}
              <div className="bg-[#0a111a] p-8 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none"></div>
                
                <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20">
                      <Layers className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-5xl font-black tracking-tighter text-white mb-1">{symbol}</h2>
                      <div className="flex items-center gap-3">
                        <span className="bg-slate-800 text-slate-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">{result.sectorClassification}</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                      </div>
                    </div>
                  </div>
                  <div className={`px-8 py-4 rounded-2xl border text-sm font-black flex items-center gap-4 shadow-xl ${getVerdictColor(result.verdict)}`}>
                    <PieChart className="w-5 h-5" />
                    {result.verdict.toUpperCase()} OUTLOOK
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl hover:border-emerald-500/30 transition-all">
                    <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">REVENUE VELOCITY</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-4xl font-black text-white">{result.revenueGrowthQoQ}</p>
                      <div className="bg-emerald-500/10 p-2 rounded-lg"><ArrowUpRight className="w-6 h-6 text-emerald-500" /></div>
                    </div>
                    <p className="text-[11px] text-slate-600 font-bold mt-4 uppercase">Latest NSE Reported Quarter</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl hover:border-emerald-500/30 transition-all">
                    <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-center">3Y OPERATING MARGINS (%)</h4>
                    <div className="flex items-end justify-between gap-4 h-20">
                      {result.operatingMargins.map((m, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-emerald-500/20 border-t-4 border-emerald-500 rounded-t-xl transition-all hover:bg-emerald-500/40"
                            style={{ height: `${Math.max(10, Math.min(80, Math.abs(m.value * 2.5)))}%` }}
                          ></div>
                          <span className="text-[10px] text-slate-500 mt-3 font-black">{m.year}</span>
                          <span className="text-[10px] text-emerald-400 font-black">{m.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed text-xl font-medium mb-10 border-l-8 border-emerald-500/30 pl-8">
                  {result.summary}
                </p>

                <TrajectoryChart data={result.trajectory} />
              </div>

              {/* Opportunities/Deals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#0a111a] border border-white/5 p-10 rounded-[2.5rem] shadow-xl">
                  <h4 className="text-emerald-400 font-black text-lg mb-8 flex items-center gap-4">
                    <Handshake className="w-8 h-8" /> FUTURE DEALS
                  </h4>
                  <div className="space-y-6">
                    {result.futureDeals.map((deal, i) => (
                      <div key={i} className="flex gap-5 items-start">
                        <span className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex-shrink-0 flex items-center justify-center text-emerald-500 text-xs font-black border border-emerald-500/20">0{i+1}</span> 
                        <p className="text-slate-300 text-sm font-medium leading-relaxed pt-1">{deal}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#0a111a] border border-white/5 p-10 rounded-[2.5rem] shadow-xl">
                  <h4 className="text-amber-400 font-black text-lg mb-8 flex items-center gap-4">
                    <DollarSign className="w-8 h-8" /> OPPORTUNITIES
                  </h4>
                  <div className="space-y-6">
                    {result.investmentOpportunities.map((opp, i) => (
                      <div key={i} className="flex gap-5 items-start">
                        <span className="w-10 h-10 rounded-2xl bg-amber-500/10 flex-shrink-0 flex items-center justify-center text-amber-500 text-xs font-black border border-amber-500/20">+</span> 
                        <p className="text-slate-300 text-sm font-medium leading-relaxed pt-1">{opp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Catalysts/Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#0a111a] border border-white/5 p-10 rounded-[2.5rem]">
                  <h4 className="text-white font-black text-lg mb-8 flex items-center gap-4">
                    <TrendingUp className="w-8 h-8 text-emerald-500" /> NSE CATALYSTS
                  </h4>
                  <ul className="space-y-4">
                    {result.catalysts.map((c, i) => (
                      <li key={i} className="text-slate-400 text-sm flex gap-4 font-medium">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div> {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[#0a111a] border border-white/5 p-10 rounded-[2.5rem]">
                  <h4 className="text-white font-black text-lg mb-8 flex items-center gap-4">
                    <AlertTriangle className="w-8 h-8 text-rose-500" /> RISK EXPOSURE
                  </h4>
                  <ul className="space-y-4">
                    {result.risks.map((r, i) => (
                      <li key={i} className="text-slate-400 text-sm flex gap-4 font-medium">
                        <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></div> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Research Sidebar */}
            <div className="space-y-6">
              <div className="bg-[#0a111a] p-8 rounded-[2.5rem] border border-white/5 sticky top-24 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-lg font-black flex items-center gap-3 text-white">
                    <Info className="w-6 h-6 text-emerald-500" /> CITATIONS
                  </h4>
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 tracking-widest">Grounded</span>
                </div>
                
                <div className="space-y-4">
                  {result.sources.length > 0 ? result.sources.map((source, i) => (
                    <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="group block p-5 bg-slate-950 border border-slate-800 rounded-2xl transition-all hover:border-emerald-500/40">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-xs font-bold text-slate-300 line-clamp-2 leading-relaxed group-hover:text-emerald-400 transition-colors">{source.title}</span>
                        <ExternalLink className="w-3 h-3 text-slate-600 flex-shrink-0" />
                      </div>
                    </a>
                  )) : (
                    <div className="text-center py-10">
                      <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Analyzing Web Indices...</p>
                    </div>
                  )}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800">
                  <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">DISCLAIMER</h5>
                  <p className="text-[11px] leading-relaxed text-slate-600 font-black italic uppercase">
                    Scan results are AI-synthesized from NSE records. Penny stocks represent extreme volatility risks. 
                    Not financial advice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-16 px-6 bg-[#03060a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Rocket className="w-5 h-5 text-emerald-500" />
              <span className="font-black text-white text-xl tracking-tighter uppercase">LAU- PENNYSTOCKS NSE</span>
            </div>
            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">© 2024 Lau- PennyStocks Terminal • National Stock Exchange Node</p>
          </div>
          <div className="flex gap-10 font-black uppercase tracking-[0.2em] text-[10px] text-slate-500">
            <a href="#" className="hover:text-emerald-400 transition-colors">Neural Policy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Risk Vector</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">API Keys</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
