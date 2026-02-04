
import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, X, Check, Film, FolderPlus, Lock, BarChart3, Eye, Heart, TrendingUp, ChevronLeft, BookOpen, Send, Quote, Mic2, Play, Calendar, Zap, DollarSign, MousePointer2, Award, ChevronRight, ShieldAlert, AlertCircle, Info, CreditCard, Landmark, CheckCircle2, Search, Image as ImageIcon, Plus, Video as VideoIcon } from 'lucide-react';
import { api } from '../services/api';
import { CATEGORIES, User, Video, CREATOR_TIERS, Series } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CreatorStudioProps {
  onClose: () => void;
  user: User;
  videos: Video[];
  initialMode?: 'video' | 'series' | 'monetization';
  onBack: () => void;
  onVideoUploaded?: () => void;
}

const VIDEO_GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy", 
  "History", "Horror", "Music", "Mystery", "Romance", "Sci-Fi", "Sport", "Thriller", "War", "Western",
  "Biography", "Musical", "Noir", "Short", "Reality-TV", "News", "Talk-Show", "Game-Show", "Vlog",
  "Tech", "Cooking", "Travel", "Fitness", "Education", "Gaming", "DIY", "ASMR", "Lifestyle", "Fashion"
];

export const CreatorStudio: React.FC<CreatorStudioProps> = ({ onClose, user, videos, initialMode = 'video', onBack, onVideoUploaded }) => {
  const [mode, setMode] = useState<'video' | 'series' | 'monetization'>(initialMode);
  const [seriesMode, setSeriesMode] = useState<'create' | 'add_episode'>('create');
  
  // Upload State
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  // Payout Modal State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'PayPal' | 'Bank' | 'Google Pay'>('PayPal');
  const [targetPaypal, setTargetPaypal] = useState(user.paypalEmail || '');
  const [isPayoutProcessing, setIsPayoutProcessing] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  // Episode/Video State
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [isPremiere, setIsPremiere] = useState(false);
  
  // Series Creation State
  const [seriesTitle, setSeriesTitle] = useState('');
  const [seriesDescription, setSeriesDescription] = useState('');
  const [seriesCover, setSeriesCover] = useState<File | null>(null);
  const [seriesCategory, setSeriesCategory] = useState('');
  
  // Add Episode State
  const [userSeries, setUserSeries] = useState<Series[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [seriesEpisodeNumber, setSeriesEpisodeNumber] = useState(1);
  
  // Genre State
  const [genreSearch, setGenreSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  
  // Publishing State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Monetization Dashboard State
  const currentTier = CREATOR_TIERS[user.creatorTier || 'Starter'];
  const nextTierName = user.creatorTier === 'Starter' ? 'Growing' : user.creatorTier === 'Growing' ? 'Pro' : null;
  const nextTier = nextTierName ? CREATOR_TIERS[nextTierName] : null;

  const monetizedViews = videos.reduce((sum, v) => sum + (v.monetizedViews || 0), 0);
  const rawAdRevenue = (monetizedViews / 1000) * currentTier.cpm;
  const creatorEarnings = rawAdRevenue * currentTier.share;
  
  const bonus = user.monthlyWatchTime && user.monthlyWatchTime > 100000 ? creatorEarnings * 0.05 : 0;
  const totalThisMonth = creatorEarnings + bonus;

  // Real data for chart: Top earning/viewed videos
  const performanceData = videos
    .filter(v => v.creatorId === user.id)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 7)
    .map(v => ({
      title: v.description.length > 12 ? v.description.substring(0, 10) + '...' : v.description,
      views: v.views
    }));

  useEffect(() => {
      if (mode === 'series' && seriesMode === 'add_episode') {
          const fetchSeries = async () => {
              const data = await api.getUserSeries(user.id);
              setUserSeries(data);
          };
          fetchSeries();
      }
  }, [mode, seriesMode, user.id]);

  useEffect(() => {
      if (selectedSeriesId && userSeries.length > 0) {
          const s = userSeries.find(ser => ser.id === selectedSeriesId);
          if (s) {
              setSeriesEpisodeNumber(s.totalEpisodes + 1);
          }
      }
  }, [selectedSeriesId, userSeries]);

  const handlePublishVideo = async () => {
      if (!file || !episodeTitle.trim() || !selectedGenre) {
          setPublishFeedback({ type: 'error', message: 'Please select a video, enter title, and choose a genre.' });
          setTimeout(() => setPublishFeedback(null), 3000);
          return;
      }

      setIsPublishing(true);
      try {
          await api.uploadVideo(file, thumbnailFile, user.id, episodeTitle, isLocked, selectedGenre);
          setPublishFeedback({ type: 'success', message: 'Published successfully! Your video is now live.' });
          
          // Clear form
          setFile(null);
          setThumbnailFile(null);
          setEpisodeTitle('');
          setIsLocked(false);
          setIsPremiere(false);
          setSelectedGenre('');
          setGenreSearch('');

          // Notify parent app to refresh feed immediately
          if (onVideoUploaded) {
              setTimeout(() => {
                  onVideoUploaded();
                  onClose();
              }, 1500);
          }
      } catch (e) {
          console.error("Publish error", e);
          setPublishFeedback({ type: 'error', message: 'Upload failed. Ensure you have network connection.' });
      } finally {
          setIsPublishing(false);
      }
  };

  const handleAddEpisode = async () => {
      if (!selectedSeriesId || !file || !episodeTitle.trim()) {
          setPublishFeedback({ type: 'error', message: 'Please select series, file, and title.' });
          setTimeout(() => setPublishFeedback(null), 3000);
          return;
      }

      const series = userSeries.find(s => s.id === selectedSeriesId);
      if (!series) return;

      setIsPublishing(true);
      try {
          await api.uploadVideo(
              file, 
              thumbnailFile, 
              user.id, 
              episodeTitle, 
              isLocked, 
              series.category,
              { id: series.id, title: series.title, episodeNumber: seriesEpisodeNumber }
          );
          setPublishFeedback({ type: 'success', message: 'Episode added successfully!' });
          
          // Clear form
          setFile(null);
          setThumbnailFile(null);
          setEpisodeTitle('');
          setIsLocked(false);
          setSelectedSeriesId('');
          
          if (onVideoUploaded) {
              setTimeout(() => {
                  onVideoUploaded();
              }, 1500);
          }
      } catch (e) {
          console.error("Add Episode error", e);
          setPublishFeedback({ type: 'error', message: 'Failed to add episode.' });
      } finally {
          setIsPublishing(false);
      }
  };

  const handleCreateSeries = async () => {
      if (!seriesTitle.trim() || !seriesDescription.trim() || !seriesCategory) {
          setPublishFeedback({ type: 'error', message: 'Please fill all required fields.' });
          setTimeout(() => setPublishFeedback(null), 3000);
          return;
      }

      setIsPublishing(true);
      try {
          await api.createSeries(seriesCover, user.id, seriesTitle, seriesDescription, seriesCategory);
          setPublishFeedback({ type: 'success', message: 'Series created successfully!' });
          
          // Clear form
          setSeriesTitle('');
          setSeriesDescription('');
          setSeriesCover(null);
          setSeriesCategory('');
          setGenreSearch('');

          if (onVideoUploaded) {
              setTimeout(() => {
                  onVideoUploaded();
              }, 1500);
          }
      } catch (e) {
          console.error("Create Series error", e);
          setPublishFeedback({ type: 'error', message: 'Failed to create series.' });
      } finally {
          setIsPublishing(false);
      }
  };

  const handleRequestPayout = async () => {
    if (payoutMethod === 'PayPal' && !targetPaypal.includes('@')) {
        alert("Please enter a valid PayPal email address.");
        return;
    }
    if (!user.pendingPayoutBalance || user.pendingPayoutBalance <= 0) {
        alert("No funds available for withdrawal.");
        return;
    }

    setIsPayoutProcessing(true);
    try {
        await api.requestPayout(user.id, user.pendingPayoutBalance, payoutMethod);
        setPayoutSuccess(true);
        setTimeout(() => {
            setPayoutSuccess(false);
            setShowPayoutModal(false);
        }, 2500);
    } catch (e) {
        console.error("Payout failed", e);
        alert("Failed to process payout request. Please try again.");
    } finally {
        setIsPayoutProcessing(false);
    }
  };

  const filteredGenres = VIDEO_GENRES.filter(g => g.toLowerCase().includes(genreSearch.toLowerCase()));

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
                            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-2">Funds will be sent to {payoutMethod === 'PayPal' ? targetPaypal : 'your account'} in 1-3 days.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-2">Choose Payout Method</p>
                                <div className="space-y-3">
                                    <div className={`rounded-3xl border transition-all overflow-hidden ${payoutMethod === 'PayPal' ? 'bg-white/5 border-white/20 shadow-lg' : 'bg-slate-900/50 border-transparent'}`}>
                                        <button 
                                            onClick={() => setPayoutMethod('PayPal')}
                                            className="w-full flex items-center justify-between p-4"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-slate-900 rounded-2xl text-blue-400">
                                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                                        <path d="M20.067 8.178c-.552 2.766-2.26 4.332-5.119 4.332H13.1c-.552 0-.916.353-1.018.9l-.916 5.8c-.05.3.1.55.4.55h3.067c.5 0 .866-.35.966-.85l.05-.25.5-3.15.05-.3c.1-.5.467-.85.967-.85h.616c2.7 0 4.817-1.1 5.417-4.233.25-1.2.1-2.2-.55-2.917-.45-.483-1.233-.766-2.25-.766h-.516c-.05 0-.15.016-.216.033z" />
                                                    </svg>
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold text-white">PayPal</p>
                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Global Transfer</p>
                                                </div>
                                            </div>
                                            {payoutMethod === 'PayPal' && <CheckCircle2 size={18} className="text-blue-400" />}
                                        </button>
                                        {payoutMethod === 'PayPal' && (
                                            <div className="px-4 pb-4 animate-fade-in">
                                                <input 
                                                    type="email" 
                                                    value={targetPaypal} 
                                                    onChange={(e) => setTargetPaypal(e.target.value)}
                                                    placeholder="Enter PayPal Email"
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-bold placeholder-gray-600"
                                                />
                                            </div>
                                        )}
                                    </div>

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
                            <div className="h-full bg-neon-pink transition-all duration-1000" style={{ width: `${Math.min(100, ((user.monthlyWatchTime || 0) / nextTier.minWatchTime) * 100)}%` }} />
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Revenue Analytics Chart */}
        <div className="bg-gray-900/50 rounded-[32px] p-6 border border-white/5">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <TrendingUp size={14} className="text-neon-purple" /> Top Performing Content
            </h4>
            <div className="h-48 w-full min-w-0">
                {performanceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData}>
                            <XAxis dataKey="title" axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 9}} dy={10} interval={0} />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#111', border: '1px solid #1F2937', borderRadius: '16px', fontSize: '10px'}}
                                cursor={{fill: '#ffffff05'}}
                            />
                            <Bar dataKey="views" radius={[6, 6, 0, 0]}>
                                {performanceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#7C3AED' : '#374151'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-600 font-bold uppercase text-[9px]">
                        No performance data available
                    </div>
                )}
            </div>

            {/* Bonuses & Transparency */}
            <div className="grid grid-cols-2 gap-4 mt-6">
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
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-black text-white pb-20 pt-12 animate-fade-in relative">
      
      {/* Upload Feedback */}
      {publishFeedback && (
        <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[160] px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl animate-fade-in ${publishFeedback.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {publishFeedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{publishFeedback.message}</span>
        </div>
      )}

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
            {['video', 'series', 'monetization'].map((m) => (
                <button 
                    key={m}
                    onClick={() => setMode(m as any)} 
                    className={`flex-1 py-2 px-4 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${mode === m ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    {m}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 no-scrollbar">
        {mode === 'monetization' ? renderMonetization() : mode === 'video' ? (
            <div className="space-y-6">
                 {/* Video Input */}
                 <div className="border-2 border-dashed border-gray-800 rounded-[32px] h-48 flex flex-col items-center justify-center bg-gray-900/30 mb-2 hover:border-neon-purple transition-colors relative group">
                    <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setFile(e.target.files?.[0] || null)} />
                    {file ? (
                        <div className="text-center">
                            <Check className="w-10 h-10 text-green-500 mx-auto mb-2" />
                            <p className="text-sm font-bold">{file.name}</p>
                        </div>
                    ) : (
                        <div className="text-center group-hover:scale-105 transition-transform">
                            <Upload className="w-10 h-10 text-gray-700 mx-auto mb-2 group-hover:text-neon-purple transition-colors" />
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Upload Video</p>
                        </div>
                    )}
                 </div>

                 {/* Thumbnail Input */}
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-full h-14 border border-gray-800 rounded-2xl bg-gray-900/30 flex items-center px-4 relative overflow-hidden">
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setThumbnailFile(e.target.files?.[0] || null)} />
                        {thumbnailFile ? (
                            <div className="flex items-center gap-2 text-green-500">
                                <Check size={16} />
                                <span className="text-xs font-bold truncate max-w-[200px]">{thumbnailFile.name}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-500">
                                <ImageIcon size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Custom Thumbnail (Optional)</span>
                            </div>
                        )}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <input 
                        type="text" 
                        value={episodeTitle}
                        onChange={e => setEpisodeTitle(e.target.value)}
                        placeholder="Video Title"
                        className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-neon-purple outline-none"
                    />

                    {/* Genre Selection */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3 text-gray-500">
                            <Search size={14} />
                            <input 
                                type="text"
                                value={genreSearch}
                                onChange={e => setGenreSearch(e.target.value)}
                                placeholder="Search Genre..."
                                className="bg-transparent text-sm font-bold text-white focus:outline-none w-full placeholder-gray-600"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto no-scrollbar">
                            {filteredGenres.map(g => (
                                <button 
                                    key={g}
                                    onClick={() => setSelectedGenre(g)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${selectedGenre === g ? 'bg-neon-purple border-neon-purple text-white' : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20'}`}
                                >
                                    {g}
                                </button>
                            ))}
                            {filteredGenres.length === 0 && (
                                <p className="text-[10px] text-gray-600 font-bold uppercase w-full text-center py-2">No genres found</p>
                            )}
                        </div>
                    </div>

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
                        onClick={handlePublishVideo} 
                        disabled={isPublishing || !file || !episodeTitle.trim() || !selectedGenre}
                        className="w-full bg-white text-black py-5 rounded-[24px] font-black uppercase text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-white/5 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPublishing ? <div className="w-5 h-5 border-2 border-gray-400 border-t-black rounded-full animate-spin"/> : 'Publish Now'}
                    </button>
                 </div>
            </div>
        ) : (
            <div className="space-y-6">
                <div className="flex bg-gray-900 p-1 rounded-xl mb-6">
                    <button 
                        onClick={() => setSeriesMode('create')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${seriesMode === 'create' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
                    >
                        New Series
                    </button>
                    <button 
                        onClick={() => setSeriesMode('add_episode')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${seriesMode === 'add_episode' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
                    >
                        Add Episode
                    </button>
                </div>

                {seriesMode === 'create' ? (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-gray-900/50 p-6 rounded-[32px] border border-white/5 text-center">
                            <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center border border-white/5">
                                <FolderPlus size={32} className="text-neon-purple" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Create a New Series</h3>
                            <p className="text-xs text-gray-500 font-medium">Group your videos into seasons and episodes for better discovery.</p>
                        </div>

                        <div className="space-y-4">
                            {/* Cover Upload */}
                            <div className="border-2 border-dashed border-gray-800 rounded-[24px] h-32 flex flex-col items-center justify-center bg-gray-900/30 hover:border-neon-purple transition-colors relative">
                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setSeriesCover(e.target.files?.[0] || null)} />
                                {seriesCover ? (
                                    <div className="flex items-center gap-3">
                                        <img src={URL.createObjectURL(seriesCover)} className="w-12 h-12 object-cover rounded-lg border border-white/20" />
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-white truncate max-w-[150px]">{seriesCover.name}</p>
                                            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Cover Selected</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <Upload size={24} className="mx-auto mb-2" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Upload Cover Art</p>
                                    </div>
                                )}
                            </div>

                            <input 
                                type="text" 
                                value={seriesTitle}
                                onChange={e => setSeriesTitle(e.target.value)}
                                placeholder="Series Title"
                                className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-neon-purple outline-none"
                            />

                            <textarea 
                                value={seriesDescription}
                                onChange={e => setSeriesDescription(e.target.value)}
                                placeholder="Series Synopsis..."
                                rows={3}
                                className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-sm font-medium text-white focus:border-neon-purple outline-none resize-none"
                            />

                            {/* Category Selection */}
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Select Genre</p>
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto no-scrollbar">
                                    {VIDEO_GENRES.map(g => (
                                        <button 
                                            key={g}
                                            onClick={() => setSeriesCategory(g)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${seriesCategory === g ? 'bg-neon-purple border-neon-purple text-white' : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20'}`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleCreateSeries}
                                disabled={isPublishing || !seriesTitle || !seriesDescription || !seriesCategory}
                                className="w-full bg-white text-black py-5 rounded-[24px] font-black uppercase text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-white/5 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isPublishing ? <div className="w-5 h-5 border-2 border-gray-400 border-t-black rounded-full animate-spin"/> : 'Create Series'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-gray-900/50 p-6 rounded-[32px] border border-white/5 text-center">
                            <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center border border-white/5">
                                <VideoIcon size={32} className="text-neon-pink" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Add New Episode</h3>
                            <p className="text-xs text-gray-500 font-medium">Continue your story by adding the next chapter.</p>
                        </div>

                        <div className="space-y-4">
                            {/* Series Selection */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Select Series</label>
                                <select 
                                    value={selectedSeriesId}
                                    onChange={e => setSelectedSeriesId(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-neon-purple outline-none appearance-none"
                                >
                                    <option value="" disabled>Choose a series...</option>
                                    {userSeries.map(s => (
                                        <option key={s.id} value={s.id}>{s.title}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Episode Video Upload */}
                            <div className="border-2 border-dashed border-gray-800 rounded-[24px] h-32 flex flex-col items-center justify-center bg-gray-900/30 hover:border-neon-purple transition-colors relative">
                                <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setFile(e.target.files?.[0] || null)} />
                                {file ? (
                                    <div className="flex items-center gap-3">
                                        <Film size={24} className="text-neon-purple" />
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-white truncate max-w-[150px]">{file.name}</p>
                                            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Video Selected</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <Upload size={24} className="mx-auto mb-2" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Upload Episode Video</p>
                                    </div>
                                )}
                            </div>

                            <input 
                                type="text" 
                                value={episodeTitle}
                                onChange={e => setEpisodeTitle(e.target.value)}
                                placeholder="Episode Title"
                                className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-neon-purple outline-none"
                            />

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Episode #</label>
                                    <input 
                                        type="number" 
                                        value={seriesEpisodeNumber}
                                        onChange={e => setSeriesEpisodeNumber(Number(e.target.value))}
                                        className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-neon-purple outline-none"
                                    />
                                </div>
                                <div className="flex-1 flex items-end">
                                    <button 
                                        onClick={() => setIsLocked(!isLocked)}
                                        className={`w-full py-4 rounded-2xl border font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isLocked ? 'bg-neon-pink/20 border-neon-pink text-neon-pink' : 'bg-gray-900 border-gray-800 text-gray-500'}`}
                                    >
                                        <Lock size={14} /> {isLocked ? 'Premium' : 'Free'}
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={handleAddEpisode}
                                disabled={isPublishing || !file || !episodeTitle || !selectedSeriesId}
                                className="w-full bg-white text-black py-5 rounded-[24px] font-black uppercase text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-white/5 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isPublishing ? <div className="w-5 h-5 border-2 border-gray-400 border-t-black rounded-full animate-spin"/> : 'Publish Episode'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
