
import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, X, Check, Film, FolderPlus, Lock, BarChart3, Eye, Heart, TrendingUp, ChevronLeft, BookOpen, Send, Quote, Mic2, Play, Calendar, Zap, DollarSign, MousePointer2, Award, ChevronRight, ShieldAlert, AlertCircle, Info, CreditCard, Landmark, CheckCircle2 } from 'lucide-react';
import { generateVideoMetadata, generateScriptPrompt, generateVoiceover } from '../services/geminiService';
import { api } from '../services/api';
import { CATEGORIES, User, Video, CREATOR_TIERS } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CreatorStudioProps {
  onClose: () => void;
  user: User;
  videos: Video[];
  initialMode?: 'episode' | 'series' | 'monetization' | 'ai-writer' | 'voice-studio';
  onBack: () => void;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({ onClose, user, videos, initialMode = 'episode', onBack }) => {
  const [mode, setMode] = useState<'episode' | 'series' | 'monetization' | 'ai-writer' | 'voice-studio'>(initialMode);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Payout Modal State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'PayPal' | 'Bank' | 'Google Pay'>('PayPal');
  const [isPayoutProcessing, setIsPayoutProcessing] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  // Voice Studio State
  const [ttsText, setTtsText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<'Zephyr' | 'Puck' | 'Kore' | 'Charon'>('Zephyr');
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);

  // Episode State
  const [selectedSeries, setSelectedSeries] = useState('');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [isPremiere, setIsPremiere] = useState(false);

  // Monetization Dashboard State
  const currentTier = CREATOR_TIERS[user.creatorTier || 'Starter'];
  const nextTierName = user.creatorTier === 'Starter' ? 'Growing' : user.creatorTier === 'Growing' ? 'Pro' : null;
  const nextTier = nextTierName ? CREATOR_TIERS[nextTierName] : null;

  const monetizedViews = videos.reduce((sum, v) => sum + (v.monetizedViews || 0), 0);
  const rawAdRevenue = (monetizedViews / 1000) * currentTier.cpm;
  const creatorEarnings = rawAdRevenue * currentTier.share;
  
  const bonus = user.monthlyWatchTime && user.monthlyWatchTime > 100000 ? creatorEarnings * 0.05 : 0;
  const totalThisMonth = creatorEarnings + bonus;

  const chartData = [
    { day: 'Mon', revenue: totalThisMonth * 0.1 },
    { day: 'Tue', revenue: totalThisMonth * 0.15 },
    { day: 'Wed', revenue: totalThisMonth * 0.08 },
    { day: 'Thu', revenue: totalThisMonth * 0.22 },
    { day: 'Fri', revenue: totalThisMonth * 0.18 },
    { day: 'Sat', revenue: totalThisMonth * 0.25 },
    { day: 'Sun', revenue: totalThisMonth * 0.12 },
  ];

  const handleGenerateVoice = async () => {
      if (!ttsText) return;
      setLoading(true);
      try {
          const base64 = await generateVoiceover(ttsText, selectedVoice);
          setGeneratedAudio(base64);
      } catch (e) {
          alert("Voice generation failed. Please check your API key.");
      }
      setLoading(false);
  };

  const handleRequestPayout = () => {
    setIsPayoutProcessing(true);
    setTimeout(() => {
        setIsPayoutProcessing(false);
        setPayoutSuccess(true);
        setTimeout(() => {
            setPayoutSuccess(false);
            setShowPayoutModal(false);
        }, 2000);
    }, 1500);
  };

  const renderMonetization = () => (
    <div className="space-y-6 animate-fade-in pb-10">
        {/* Payout Modal */}
        {showPayoutModal && (
            <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-end justify-center animate-fade-in">
                <div className="bg-slate-950 w-full max-w-lg rounded-t-[48px] border-t border-white/10 p-8 pb-12 shadow-2xl animate-slide-up">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white">Withdraw Earnings</h3>
                        <button onClick={() => setShowPayoutModal(false)} className="p-2 bg-slate-900 rounded-full text-white">
                            <X size={24} />
                        </button>
                    </div>

                    {payoutSuccess ? (
                        <div className="py-20 flex flex-col items-center text-center animate-fade-in">
                            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 size={64} className="text-green-500" />
                            </div>
                            <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">Request Received</h4>
                            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-2">Payout usually takes 1-3 business days</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-2">Choose Payout Method</p>
                                <div className="space-y-3">
                                    <button 
                                        onClick={() => setPayoutMethod('PayPal')}
                                        className={`w-full flex items-center justify-between p-4 rounded-3xl border transition-all ${payoutMethod === 'PayPal' ? 'bg-white/5 border-white/20 shadow-lg' : 'bg-slate-900/50 border-transparent'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-slate-900 rounded-2xl text-blue-400">
                                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                                    <path d="M20.067 8.178c-.552 2.766-2.26 4.332-5.119 4.332H13.1c-.552 0-.916.353-1.018.9l-.916 5.8c-.05.3.1.55.4.55h3.067c.5 0 .866-.35.966-.85l.05-.25.5-3.15.05-.3c.1-.5.467-.85.967-.85h.616c2.7 0 4.817-1.1 5.417-4.233.25-1.2.1-2.2-.55-2.917-.45-.483-1.233-.766-2.25-.766h-.516c-.05 0-.15.016-.216.033z" />
                                                </svg>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-white">PayPal</p>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{user.paypalEmail || 'alex_creator@gmail.com'}</p>
                                            </div>
                                        </div>
                                        {payoutMethod === 'PayPal' && <CheckCircle2 size={18} className="text-blue-400" />}
                                    </button>

                                    <button 
                                        onClick={() => setPayoutMethod('Google Pay')}
                                        className={`w-full flex items-center justify-between p-4 rounded-3xl border transition-all ${payoutMethod === 'Google Pay' ? 'bg-white/5 border-white/20 shadow-lg' : 'bg-slate-900/50 border-transparent'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-slate-900 rounded-2xl flex items-center justify-center">
                                                <div className="flex gap-0.5">
                                                    <div className="w-1.5 h-4 bg-[#4285F4] rounded-full" />
                                                    <div className="w-1.5 h-4 bg-[#EA4335] rounded-full mt-1" />
                                                    <div className="w-1.5 h-4 bg-[#FBBC05] rounded-full" />
                                                    <div className="w-1.5 h-4 bg-[#34A853] rounded-full mt-1" />
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-white">Google Pay (Credit)</p>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Instant Platform Credit</p>
                                            </div>
                                        </div>
                                        {payoutMethod === 'Google Pay' && <CheckCircle2 size={18} className="text-green-500" />}
                                    </button>

                                    <button 
                                        onClick={() => setPayoutMethod('Bank')}
                                        className={`w-full flex items-center justify-between p-4 rounded-3xl border transition-all ${payoutMethod === 'Bank' ? 'bg-white/5 border-white/20 shadow-lg' : 'bg-slate-900/50 border-transparent'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-slate-900 rounded-2xl text-slate-400"><Landmark size={24}/></div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-white">Bank Transfer</p>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Direct to your local account</p>
                                            </div>
                                        </div>
                                        {payoutMethod === 'Bank' && <CheckCircle2 size={18} className="text-white" />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={handleRequestPayout}
                                disabled={isPayoutProcessing}
                                className="w-full bg-neon-purple text-white py-5 rounded-[28px] font-black uppercase text-sm tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {isPayoutProcessing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Withdraw ${user.pendingPayoutBalance?.toFixed(2)}</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Earnings Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-black p-8 rounded-[40px] border border-indigo-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><DollarSign size={80} /></div>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em] mb-2">Pending Payout</p>
                    <h3 className="text-5xl font-black text-white italic tracking-tighter">${user.pendingPayoutBalance?.toFixed(2)}</h3>
                </div>
                <button 
                    onClick={() => setShowPayoutModal(true)}
                    className="bg-white text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95"
                >
                    Request Payout
                </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Estimated This Month</p>
                    <p className="text-lg font-black text-white">${totalThisMonth.toFixed(2)}</p>
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Lifetime Earnings</p>
                    <p className="text-lg font-black text-white">${user.lifetimeEarnings?.toFixed(2)}</p>
                </div>
            </div>
            <p className="mt-6 text-[9px] text-gray-500 font-medium italic">"Earnings are based on ads shown on your content."</p>
        </div>

        {/* Tier Progress */}
        <div className="bg-gray-900/50 rounded-[32px] p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-500/20 text-yellow-500 rounded-2xl border border-yellow-500/20"><Award size={24} /></div>
                    <div>
                        <h4 className="text-white font-black uppercase text-xs tracking-widest">{currentTier.name} Status</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">CPM: ${currentTier.cpm} • Share: {currentTier.share * 100}%</p>
                    </div>
                </div>
                {nextTier && <span className="text-[9px] bg-white/5 text-gray-400 px-3 py-1 rounded-full font-black uppercase">Level Up at {nextTier.minFollowers / 1000}k</span>}
            </div>

            {nextTier && (
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                            <span className="text-gray-500">Follower Milestone</span>
                            <span className="text-white">{user.followers} / {nextTier.minFollowers}</span>
                        </div>
                        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-neon-purple transition-all duration-1000" style={{ width: `${Math.min(100, (user.followers / nextTier.minFollowers) * 100)}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                            <span className="text-gray-500">Watch Time (Min)</span>
                            <span className="text-white">{user.monthlyWatchTime} / {nextTier.minWatchTime}</span>
                        </div>
                        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-neon-pink transition-all duration-1000" style={{ width: `${Math.min(100, (user.monthlyWatchTime || 0 / nextTier.minWatchTime) * 100)}%` }} />
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Revenue Analytics Chart */}
        <div className="bg-gray-900/50 rounded-[32px] p-6 border border-white/5">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <TrendingUp size={14} className="text-neon-purple" /> Daily Ad Revenue
            </h4>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 10}} dy={10} />
                        <Tooltip 
                            contentStyle={{backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '16px', fontSize: '10px'}}
                            cursor={{fill: '#ffffff05'}}
                        />
                        <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 5 ? '#7C3AED' : '#374151'} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bonuses & Transparency */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} className="text-yellow-500" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Active Bonuses</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-gray-500">High Watch Time</span>
                            <span className="text-green-500">+5%</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-gray-500">Post Consistency</span>
                            <span className="text-green-500">+5%</span>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-900/50 p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                        <Info size={14} className="text-blue-500" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Policy Info</span>
                    </div>
                    <p className="text-[8px] text-gray-600 leading-tight">CPM fluctuates based on advertiser demand and audience region.</p>
                </div>
            </div>
        </div>
    );

  return (
    <div className="flex flex-col h-full bg-black text-white pb-20 pt-12 animate-fade-in">
      <div className="flex justify-between items-center px-4 mb-6">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                <ChevronLeft size={28} />
            </button>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-pink uppercase tracking-tighter">Studio</h2>
        </div>
        <button onClick={onClose} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"><X size={20} /></button>
      </div>

      <div className="px-4 mb-6">
        <div className="bg-gray-900 p-1 rounded-xl flex overflow-x-auto no-scrollbar gap-1">
            {['episode', 'series', 'ai-writer', 'voice-studio', 'monetization'].map((m) => (
                <button 
                    key={m}
                    onClick={() => setMode(m as any)} 
                    className={`flex-1 py-2 px-4 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${mode === m ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    {m.replace('-', ' ')}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 no-scrollbar">
        {mode === 'monetization' ? renderMonetization() : mode === 'voice-studio' ? (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-gradient-to-br from-indigo-900/40 to-black p-8 rounded-[40px] border border-indigo-500/30">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20"><Mic2 size={24} /></div>
                        <div>
                            <h3 className="text-xl font-black uppercase italic">AI Voice Studio</h3>
                            <p className="text-[10px] text-indigo-400 font-bold tracking-[0.2em] uppercase">Cinematic Narration</p>
                        </div>
                    </div>

                    <textarea 
                        value={ttsText}
                        onChange={e => setTtsText(e.target.value)}
                        className="w-full bg-black/40 border border-indigo-500/20 rounded-3xl p-6 text-sm text-white focus:border-indigo-500 outline-none resize-none mb-6 min-h-[120px]"
                        placeholder="Type the dialogue for your character..."
                    />

                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {['Zephyr', 'Puck', 'Kore', 'Charon'].map((v) => (
                            <button 
                                key={v}
                                onClick={() => setSelectedVoice(v as any)}
                                className={`py-3 rounded-2xl border text-xs font-bold transition-all ${selectedVoice === v ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg' : 'bg-black/20 border-white/5 text-gray-500'}`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={handleGenerateVoice}
                            disabled={loading || !ttsText}
                            className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-gray-200 transition-all disabled:opacity-50"
                        >
                            {loading ? "Generating..." : "Generate Audio"}
                        </button>
                    </div>
                </div>
            </div>
        ) : mode === 'episode' ? (
            <div className="space-y-6">
                 <div className="border-2 border-dashed border-gray-800 rounded-[32px] h-48 flex flex-col items-center justify-center bg-gray-900/30 mb-6 hover:border-neon-purple transition-colors relative">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFile(e.target.files?.[0] || null)} />
                    {file ? (
                        <div className="text-center">
                            <Check className="w-10 h-10 text-green-500 mx-auto mb-2" />
                            <p className="text-sm font-bold">{file.name}</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Upload className="w-10 h-10 text-gray-700 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Upload Episode</p>
                        </div>
                    )}
                 </div>

                 <div className="space-y-4">
                    <input 
                        type="text" 
                        value={episodeTitle}
                        onChange={e => setEpisodeTitle(e.target.value)}
                        placeholder="Episode Title"
                        className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-neon-purple outline-none"
                    />

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsLocked(!isLocked)}
                            className={`flex-1 py-4 rounded-2xl border font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isLocked ? 'bg-neon-pink/20 border-neon-pink text-neon-pink' : 'bg-gray-900 border-gray-800 text-gray-500'}`}
                        >
                            <Lock size={14} /> Premium
                        </button>
                        <button 
                            onClick={() => setIsPremiere(!isPremiere)}
                            className={`flex-1 py-4 rounded-2xl border font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isPremiere ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500 shadow-lg shadow-yellow-500/10' : 'bg-gray-900 border-gray-800 text-gray-500'}`}
                        >
                            <Calendar size={14} /> Premiere
                        </button>
                    </div>

                    <button 
                        onClick={() => {}} 
                        className="w-full bg-white text-black py-5 rounded-[24px] font-black uppercase text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-white/5"
                    >
                        Publish Now
                    </button>
                 </div>
            </div>
        ) : (
            <div className="flex items-center justify-center h-64 text-gray-700 font-bold uppercase text-xs tracking-widest">
                Interface Coming Soon
            </div>
        )}
      </div>
    </div>
  );
};
