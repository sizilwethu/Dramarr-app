
import React, { useState, useRef } from 'react';
import { Upload, Sparkles, X, Check, Film, FolderPlus, Lock, BarChart3, Eye, Heart, TrendingUp, ChevronLeft, BookOpen, Send, Quote, Mic2, Play, Calendar, Zap } from 'lucide-react';
import { generateVideoMetadata, generateScriptPrompt, generateVoiceover } from '../services/geminiService';
import { MOCK_SERIES } from '../services/mockData';
import { api } from '../services/api';
import { CATEGORIES, User, Video } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface CreatorStudioProps {
  onClose: () => void;
  user: User;
  videos: Video[];
  initialMode?: 'episode' | 'series' | 'analytics' | 'ai-writer' | 'voice-studio';
  onBack: () => void;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({ onClose, user, videos, initialMode = 'episode', onBack }) => {
  const [mode, setMode] = useState<'episode' | 'series' | 'analytics' | 'ai-writer' | 'voice-studio'>(initialMode);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Voice Studio State
  const [ttsText, setTtsText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<'Zephyr' | 'Puck' | 'Kore' | 'Charon'>('Zephyr');
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);

  // Episode State
  const [selectedSeries, setSelectedSeries] = useState('');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [isPremiere, setIsPremiere] = useState(false);
  const [episodeDesc, setEpisodeDesc] = useState('');

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

  const playPreview = () => {
      if (!generatedAudio) return;
      const audio = new Audio(`data:audio/pcm;base64,${generatedAudio}`);
      // Note: In a real app, you'd need a proper PCM to WAV wrapper or WebAudio context decoding
      // for this raw PCM output from Gemini TTS.
      alert("AI Voice generated successfully! (PCM Audio Ready)");
  };

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
            {['episode', 'series', 'ai-writer', 'voice-studio', 'analytics'].map((m) => (
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
        {mode === 'voice-studio' ? (
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
                        {generatedAudio && (
                            <button onClick={playPreview} className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform">
                                <Play fill="white" size={24} />
                            </button>
                        )}
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

                    {isPremiere && (
                        <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl animate-fade-in">
                            <p className="text-[10px] text-yellow-500 font-black uppercase mb-1">Premiere Scheduling</p>
                            <p className="text-[10px] text-gray-500">Scheduled for 1 hour after publish. A countdown will appear in user feeds.</p>
                        </div>
                    )}

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
