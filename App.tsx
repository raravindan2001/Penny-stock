
import React, { useState, useEffect } from 'react';
import { 
  Search, TrendingUp, AlertTriangle, Rocket, LogOut, 
  Activity, Clock, CheckCircle2, XCircle, Award
} from 'lucide-react';
import { analyzeStock, discoverStocks } from './services/geminiService';
import { AnalysisResult, User, DiscoveryStock, PriceBucket, SevenStepMetrics } from './types';
import TrajectoryChart from './components/TrajectoryChart';
import AuthModal from './components/AuthModal';
import LandingView from './components/LandingView';

const SevenStepScorecard: React.FC<{ metrics: SevenStepMetrics }> = ({ metrics }) => {
  const criteria = [
    { label: "P/E Ratio", value: metrics.peRatio, target: "< 20", pass: metrics.peRatio < 20 },
    { label: "ROIC", value: `${metrics.roic}%`, target: "> 15%", pass: metrics.roic > 15 },
    { label: "D/E Ratio", value: metrics.deRatio, target: "< 1", pass: metrics.deRatio < 1 },
    { label: "EPS CAGR", value: `${metrics.epsCAGR}%`, target: "> 10%", pass: metrics.epsCAGR > 10 },
    { label: "ROE", value: `${metrics.roe}%`, target: "> 15%", pass: metrics.roe > 15 },
    { label: "EBIT Margin", value: `${metrics.ebitMargin}%`, target: "> 10%", pass: metrics.ebitMargin > 10 },
    { label: "Gross Margin", value: `${metrics.grossMargin}%`, target: "> 40%", pass: metrics.grossMargin > 40 },
  ];

  return (
    <div className="bg-[#0a111a] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
      <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-3 italic underline decoration-emerald-500 decoration-2 underline-offset-8">
        <Award className="w-6 h-6 text-emerald-500" /> Identify Stocks 7 Step
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {criteria.map((c, i) => (
          <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${c.pass ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
            <div className="flex-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{c.label}</p>
              <p className={`text-xl font-black font-mono ${c.pass ? 'text-emerald-400' : 'text-rose-400'}`}>{c.value}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[9px] font-bold text-slate-600 uppercase">Goal: {c.target}</p>
              <div className="flex justify-end mt-1">
                {c.pass ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-500" />}
              </div>
            </div>
          </div>
        ))}
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

  useEffect(() => {
    const saved = localStorage.getItem('pennystocks_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

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
      setError("Analysis Node Error: Verify Ticker or API status.");
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
      setError("Discovery Timeout.");
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pennystocks_user');
    setResult(null);
    setDiscoveryResults([]);
  };

  return (
    <div className="min-h-screen bg-[#05090f] text-slate-200 selection:bg-emerald-500/30">
      {/* Auth Layer */}
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
              </div>

              <div className="flex-1 max-w-md mx-8 hidden md:block">
                <div className="relative">
                  <input 
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search Ticker (e.g. TATAELXSI)..."
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-10 text-sm focus:border-emerald-500 outline-none transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hidden sm:block">
                  Terminal: {user.email.split('@')[0]}
                </span>
                <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-rose-400 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto p-6">
            {!result && !isAnalyzing && discoveryResults.length === 0 && (
              <div className="py-20 text-center space-y-8">
                <div className="inline-flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 px-4 py-1 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">Neural Scanning Active</span>
                </div>
                <h2 className="text-6xl md:text-8xl font-black text-white mb-6 uppercase tracking-tighter italic">Terminal</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {(['under20', 'under50', 'under100', 'multibagger'] as PriceBucket[]).map(b => (
                    <button 
                      key={b} 
                      onClick={() => handleDiscovery(b)} 
                      className="px-8 py-4 bg-slate-900 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-500 transition-all hover:-translate-y-1"
                    >
                      {b.replace('under', '₹')} Alpha Scan
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isDiscovering && (
              <div className="py-40 text-center animate-pulse">
                <Clock className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                <p className="font-black uppercase tracking-[0.4em] text-slate-500 text-sm">Deep Scan In Progress...</p>
              </div>
            )}

            {discoveryResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                {discoveryResults.map((s, i) => (
                  <div key={i} onClick={() => handleSearch(s.symbol)} className="bg-slate-900/50 border border-white/5 p-8 rounded-[2.5rem] hover:border-emerald-500/50 hover:bg-slate-900 transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <TrendingUp className="w-24 h-24 text-white" />
                    </div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div>
                        <h3 className="text-3xl font-black text-white group-hover:text-emerald-400 uppercase tracking-tighter italic transition-colors">{s.symbol}</h3>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{s.name}</p>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg text-[9px] font-black border border-emerald-500/20">{s.exchange}</span>
                    </div>
                    <div className="flex items-end justify-between relative z-10">
                      <span className="text-4xl font-black text-white font-mono">₹{s.price}</span>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest leading-none mb-1">7-Step Score</p>
                        <p className="text-2xl font-black text-emerald-500">{s.passCount}/7</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isAnalyzing && (
              <div className="py-40 text-center">
                <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-10 shadow-[0_0_50px_rgba(16,185,129,0.2)]" />
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Deep Diving Financials...</h3>
                <p className="text-slate-500 mt-4 font-bold uppercase tracking-widest text-xs animate-pulse">Running Identify Stocks 7 Step Algorithm</p>
              </div>
            )}

            {result && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="flex flex-col lg:flex-row gap-10">
                  <div className="flex-1 space-y-10">
                    <div className="flex flex-wrap items-center justify-between gap-6 bg-[#0a111a] p-8 rounded-[2.5rem] border border-white/5">
                      <div className="space-y-1">
                        <h2 className="text-7xl font-black text-white tracking-tighter italic uppercase">{symbol}</h2>
                        <p className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-500" /> Sector: {result.sector}
                        </p>
                      </div>
                      <div className={`px-10 py-5 rounded-2xl text-xl font-black uppercase border-2 flex flex-col items-center ${result.verdict === 'Bullish' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                        <span className="text-[10px] tracking-[0.3em] mb-1">Verdict</span>
                        {result.verdict}
                      </div>
                    </div>
                    
                    <TrajectoryChart data={result.trajectory} />
                    
                    <div className="bg-slate-900/40 p-12 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-5">
                          <Rocket className="w-32 h-32 text-white" />
                       </div>
                       <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                        <Activity className="w-5 h-5 text-emerald-500" /> Neural Analysis Summary
                       </h3>
                       <p className="text-xl text-slate-300 leading-relaxed font-medium italic relative z-10">{result.summary}</p>
                    </div>
                  </div>

                  <div className="lg:w-[400px] shrink-0 space-y-8">
                    <SevenStepScorecard metrics={result.metrics} />
                    
                    <div className="bg-[#0a111a] p-8 rounded-[2.5rem] border border-white/5">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Bullish Catalysts</h3>
                      <div className="space-y-6">
                        {result.catalysts.map((c, i) => (
                          <div key={i} className="flex gap-4 text-sm font-bold text-slate-400 group">
                            <div className="mt-1 shrink-0">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 group-hover:scale-125 transition-transform" />
                            </div>
                            <span className="leading-relaxed">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-rose-500/5 p-8 rounded-[2.5rem] border border-rose-500/10">
                      <h3 className="text-xs font-black text-rose-500/50 uppercase tracking-[0.3em] mb-8">Risk Factors</h3>
                      <div className="space-y-6">
                        {result.risks.map((r, i) => (
                          <div key={i} className="flex gap-4 text-sm font-bold text-slate-400">
                            <div className="mt-1 shrink-0">
                              <AlertTriangle className="w-5 h-5 text-rose-500/50" />
                            </div>
                            <span className="leading-relaxed italic">{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="max-w-md mx-auto mt-20 bg-rose-500/5 border border-rose-500/20 p-12 rounded-[3rem] text-center shadow-2xl">
                <div className="bg-rose-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10 text-rose-500" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-3 italic">Terminal Error</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">{error}</p>
                <button onClick={() => setError(null)} className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-rose-500/20">Restart Engine</button>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
};

export default App;
