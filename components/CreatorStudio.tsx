
import React, { useState } from 'react';
import { Upload, Sparkles, X, Check, Film, FolderPlus, Lock, BarChart3, Eye, Heart, TrendingUp, ChevronLeft, BookOpen, Send, Quote } from 'lucide-react';
import { generateVideoMetadata, generateScriptPrompt } from '../services/geminiService';
import { MOCK_SERIES } from '../services/mockData';
import { api } from '../services/api';
import { CATEGORIES, User, Video } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface CreatorStudioProps {
  onClose: () => void;
  user: User;
  videos: Video[];
  initialMode?: 'episode' | 'series' | 'analytics' | 'ai-writer';
  onBack: () => void;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({ onClose, user, videos, initialMode = 'episode', onBack }) => {
  const [mode, setMode] = useState<'episode' | 'series' | 'analytics' | 'ai-writer'>(initialMode);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // AI Writer State
  const [aiConcept, setAiConcept] = useState('');
  const [aiResult, setAiResult] = useState<{ script: string, scenes: string[] } | null>(null);

  // Episode State
  const [selectedSeries, setSelectedSeries] = useState('');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [episodeDesc, setEpisodeDesc] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Series State
  const [seriesTitle, setSeriesTitle] = useState('');
  const [seriesCategory, setSeriesCategory] = useState(CATEGORIES[0]);
  const [seriesYear, setSeriesYear] = useState(new Date().getFullYear().toString());

  const myVideos = videos.filter(v => v.creatorId === user.id);
  const totalViews = myVideos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalLikes = myVideos.reduce((acc, v) => acc + v.likes, 0);
  
  const chartData = myVideos.slice(0, 7).map(v => ({
      name: v.seriesTitle ? `Ep.${v.episodeNumber}` : v.description.substring(0, 10),
      views: v.views || 0
  }));

  const handleMagic = async () => {
    if (!episodeTitle && !seriesTitle) return;
    setLoading(true);
    try {
        const res = await generateVideoMetadata(episodeTitle || seriesTitle, "Dramatic short film style, viral hook");
        setEpisodeDesc(res.description);
        setTags(res.tags);
    } catch (e) {
        console.error(e);
    }
    setLoading(false);
  };

  const handleGenerateScript = async () => {
      if (!aiConcept) return;
      setLoading(true);
      try {
          const res = await generateScriptPrompt(aiConcept);
          setAiResult(res);
      } catch (e) {
          console.error(e);
      }
      setLoading(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setUploadProgress(10);
    try {
        const publicUrl = await api.uploadVideoFile(file, user.id);
        setUploadProgress(50);
        await api.createVideoRecord({
            url: publicUrl,
            thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=800&fit=crop',
            creatorId: user.id,
            description: episodeDesc || episodeTitle,
            seriesTitle: selectedSeries ? MOCK_SERIES.find(s => s.id === selectedSeries)?.title : undefined,
            episodeNumber: 1,
            isLocked: isLocked,
            unlockCost: isLocked ? 1 : 0
        });
        setUploadProgress(100);
        setTimeout(() => onClose(), 1000);
    } catch (error: any) {
        setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-black text-white pb-20 pt-12 animate-fade-in">
      <div className="flex justify-between items-center px-4 mb-6">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                <ChevronLeft size={28} />
            </button>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-pink">Studio</h2>
        </div>
        <button onClick={onClose} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"><X size={20} /></button>
      </div>

      <div className="px-4 mb-6">
        <div className="bg-gray-900 p-1 rounded-xl flex overflow-x-auto no-scrollbar">
            <button onClick={() => setMode('episode')} className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${mode === 'episode' ? 'bg-gray-800 text-white shadow ring-1 ring-gray-700' : 'text-gray-500 hover:text-gray-300'}`}>New Episode</button>
            <button onClick={() => setMode('series')} className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${mode === 'series' ? 'bg-gray-800 text-white shadow ring-1 ring-gray-700' : 'text-gray-500 hover:text-gray-300'}`}>New Series</button>
            <button onClick={() => setMode('ai-writer')} className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 ${mode === 'ai-writer' ? 'bg-indigo-900 text-white shadow ring-1 ring-indigo-700' : 'text-gray-500 hover:text-indigo-400'}`}><Sparkles size={12}/> AI Writer</button>
            <button onClick={() => setMode('analytics')} className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${mode === 'analytics' ? 'bg-gray-800 text-white shadow ring-1 ring-gray-700' : 'text-gray-500 hover:text-gray-300'}`}>Analytics</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10">
        {mode === 'ai-writer' ? (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-gray-900/50 p-6 rounded-3xl border border-indigo-500/20">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <BookOpen size={20} className="text-indigo-400" /> Story Concept
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">Describe the theme, a plot twist, or a character trope. Gemini will draft your script.</p>
                    <textarea 
                        value={aiConcept}
                        onChange={e => setAiConcept(e.target.value)}
                        className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-sm text-white focus:border-indigo-500 outline-none resize-none mb-4"
                        placeholder="e.g. A CEO falls in love with his assistant, but she's actually a rival billionaire in disguise..."
                        rows={4}
                    />
                    <button 
                        onClick={handleGenerateScript}
                        disabled={loading || !aiConcept}
                        className="w-full bg-indigo-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all disabled:opacity-50"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Sparkles size={18}/>}
                        Draft Script with Gemini
                    </button>
                </div>

                {aiResult && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-gray-900/40 p-6 rounded-3xl border border-white/5">
                            <h4 className="font-bold text-indigo-400 text-sm mb-4 uppercase tracking-widest flex items-center gap-2"><Quote size={16}/> Dialogue & Screenplay</h4>
                            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-mono bg-black/50 p-4 rounded-xl">
                                {aiResult.script}
                            </div>
                        </div>

                        <div className="bg-gray-900/40 p-6 rounded-3xl border border-white/5">
                            <h4 className="font-bold text-indigo-400 text-sm mb-4 uppercase tracking-widest flex items-center gap-2"><Film size={16}/> Scene Breakdown</h4>
                            <div className="space-y-4">
                                {aiResult.scenes.map((scene, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-indigo-900/50 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">{i+1}</div>
                                        <p className="text-sm text-gray-400">{scene}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        ) : mode === 'analytics' ? (
            <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-900/40 to-gray-900 p-4 rounded-2xl border border-purple-500/20">
                        <div className="flex items-center gap-2 text-purple-400 mb-2">
                            <Eye size={18} /><span className="text-xs font-bold uppercase">Total Views</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-900/40 to-gray-900 p-4 rounded-2xl border border-pink-500/20">
                        <div className="flex items-center gap-2 text-pink-400 mb-2">
                            <Heart size={18} /><span className="text-xs font-bold uppercase">Total Likes</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{totalLikes.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={16} className="text-neon-purple" />
                        <h3 className="font-bold text-sm">Performance</h3>
                    </div>
                    <div className="h-40 w-full">
                        {myVideos.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <Bar dataKey="views" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <div className="h-full flex items-center justify-center text-gray-600 text-xs">No data available</div>}
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-sm mb-3">Your Content</h3>
                    <div className="space-y-3">
                        {myVideos.map(v => (
                            <div key={v.id} className="flex gap-3 items-center bg-gray-900/50 p-2 rounded-xl border border-gray-800">
                                <img src={v.thumbnailUrl} className="w-12 h-16 object-cover rounded-lg bg-gray-800" />
                                <div className="flex-1 min-w-0"><p className="font-bold text-sm truncate">{v.description}</p><p className="text-xs text-gray-500">{v.seriesTitle ? `Ep. ${v.episodeNumber}` : 'Standalone'}</p></div>
                                <div className="text-right"><p className="text-xs font-bold text-white">{v.views?.toLocaleString()}</p><p className="text-[10px] text-gray-500">Views</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ) : (
            <>
                <div className="border-2 border-dashed border-gray-800 rounded-2xl h-48 flex flex-col items-center justify-center bg-gray-900/30 mb-6 relative hover:border-gray-600 transition-colors">
                    {file ? (
                        <div className="text-center">
                            <Film className="w-10 h-10 text-neon-pink mb-2 mx-auto" />
                            <p className="text-sm font-bold text-white">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            <button onClick={() => setFile(null)} className="text-xs text-red-400 mt-2 hover:underline z-10 relative">Remove</button>
                        </div>
                    ) : (
                        <>
                            <Upload className="w-10 h-10 text-gray-500 mb-2" />
                            <p className="text-sm text-gray-400 font-bold">Tap to upload video</p>
                            <p className="text-xs text-gray-600 mt-1">MP4, MOV (Max 500MB)</p>
                            <input type="file" accept="video/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => setFile(e.target.files?.[0] || null)} />
                        </>
                    )}
                </div>

                <div className="space-y-5">
                    {mode === 'episode' ? (
                        <>
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase mb-2 block ml-1">Select Series</label>
                                <select className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm focus:border-neon-purple outline-none text-white transition-colors" value={selectedSeries} onChange={e => setSelectedSeries(e.target.value)}>
                                    <option value="">-- Standalone Video --</option>
                                    {MOCK_SERIES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase mb-2 block ml-1">Episode Title</label>
                                <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-neon-purple outline-none transition-colors" placeholder="e.g., The Secret Revealed" value={episodeTitle} onChange={e => setEpisodeTitle(e.target.value)} />
                            </div>
                            <div className="flex items-center justify-between bg-gray-900 p-4 rounded-xl border border-gray-800">
                                <div className="flex items-center gap-3"><div className={`p-2 rounded-full ${isLocked ? 'bg-neon-pink/20 text-neon-pink' : 'bg-gray-800 text-gray-500'}`}><Lock size={20} /></div><div><p className="text-sm font-bold text-white">Premium Episode</p><p className="text-xs text-gray-500">Require credits to unlock</p></div></div>
                                <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${isLocked ? 'bg-neon-pink' : 'bg-gray-700'}`} onClick={() => setIsLocked(!isLocked)}><div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isLocked ? 'translate-x-6' : 'translate-x-0'}`} /></div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase mb-2 block ml-1">Series Title</label>
                                <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-neon-purple outline-none transition-colors" placeholder="e.g., Love in Paris" value={seriesTitle} onChange={e => setSeriesTitle(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase mb-2 block ml-1">Release Year</label>
                                <input type="number" className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-neon-purple outline-none transition-colors" placeholder="YYYY" value={seriesYear} onChange={e => setSeriesYear(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase mb-2 block ml-1">Category</label>
                                <select className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-neon-purple outline-none transition-colors appearance-none" value={seriesCategory} onChange={e => setSeriesCategory(e.target.value)}>
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="bg-gray-900 rounded-xl p-4 flex items-center justify-center border border-gray-800 text-gray-400 gap-2 cursor-pointer hover:bg-gray-800"><FolderPlus size={20} /><span className="text-sm font-bold">Upload Cover Image</span></div>
                        </>
                    )}

                    <div className="pt-2">
                        <div className="flex justify-between items-center mb-2"><label className="text-xs text-gray-500 font-bold uppercase ml-1">Description & Tags</label><button onClick={handleMagic} disabled={loading} className="flex items-center gap-1 text-[10px] bg-gradient-to-r from-blue-500 to-purple-600 px-2 py-1 rounded-full font-bold text-white hover:opacity-90 disabled:opacity-50"><Sparkles size={10} /> {loading ? 'Thinking...' : 'Generate with AI'}</button></div>
                        <textarea className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-neon-purple outline-none transition-colors min-h-[80px]" placeholder="Describe your video..." value={episodeDesc} onChange={e => setEpisodeDesc(e.target.value)} />
                        {tags.length > 0 && <div className="flex flex-wrap gap-2 mt-2">{tags.map((t, i) => <span key={i} className="text-xs text-neon-purple bg-neon-purple/10 px-2 py-1 rounded">#{t}</span>)}</div>}
                    </div>

                    {loading ? (
                        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-4 animate-fade-in"><div className="flex justify-between items-center mb-2"><div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span className="text-sm font-bold text-white">Uploading...</span></div><span className="text-sm font-bold text-neon-pink">{uploadProgress}%</span></div><div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden shadow-inner"><div className="h-full bg-gradient-to-r from-neon-purple to-neon-pink transition-all duration-300 ease-out relative" style={{ width: `${uploadProgress}%` }}><div className="absolute inset-0 bg-white/20 animate-pulse"></div></div></div><p className="text-xs text-gray-500 text-center mt-2">Please wait while we process your video.</p></div>
                    ) : (
                        <button onClick={handleUpload} disabled={loading || !file} className="w-full bg-white text-black font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Check size={20} /> {mode === 'series' ? 'Create Series' : 'Publish Episode'}</button>
                    )}
                </div>
            </>
        )}
      </div>
    </div>
  );
};
