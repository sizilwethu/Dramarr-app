
import React, { useState, useRef } from 'react';
import { User, StorySegment } from '../types';
import { X, Camera, Image as ImageIcon, Check, Type, Music, Smile, PenTool, Globe, Users, Lock, ChevronRight, Upload, Sparkles, Plus } from 'lucide-react';
import { api } from '../services/api';

interface StoryCreatorProps {
  onClose: () => void;
  currentUser: User;
  onStoryPublished: () => void;
}

export const StoryCreator: React.FC<StoryCreatorProps> = ({ onClose, currentUser, onStoryPublished }) => {
  const [segments, setSegments] = useState<Partial<StorySegment>[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'close_friends'>('public');
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Fix: Cast Array.from(files) to File[] to ensure the map callback recognizes the type.
      const newSegments = (Array.from(files) as File[]).map(file => ({
        id: Math.random().toString(),
        mediaUrl: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' as const : 'image' as const,
        duration: file.type.startsWith('video/') ? 20 : 5
      }));
      setSegments([...segments, ...newSegments]);
    }
  };

  const handlePublish = async () => {
    if (segments.length === 0) return;
    setIsUploading(true);
    try {
      // In a real app, you'd upload each file to storage
      // For mock, we'll just simulate a successful batch upload
      await api.uploadStory(new File([], 'dummy'), currentUser.id, 'image', segments);
      onStoryPublished();
      onClose();
    } catch (e) {
      alert("Failed to publish story.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-fade-in">
      
      {/* Top Header */}
      <div className="p-6 flex justify-between items-center z-20">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white"><X size={24} /></button>
        <div className="flex gap-2">
          {['public', 'friends', 'close_friends'].map(p => (
            <button 
              key={p}
              onClick={() => setPrivacy(p as any)}
              className={`p-2 rounded-full border transition-all ${privacy === p ? 'bg-white text-black border-white' : 'bg-black/20 text-gray-500 border-white/10'}`}
            >
              {p === 'public' ? <Globe size={18} /> : p === 'friends' ? <Users size={18} /> : <Lock size={18} />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-6">
        {segments.length > 0 ? (
          <div className="w-full aspect-[9/16] max-w-sm bg-gray-900 rounded-[40px] overflow-hidden relative shadow-2xl border border-white/10 group">
             {segments[currentSegmentIndex].type === 'video' ? (
               <video src={segments[currentSegmentIndex].mediaUrl} className="w-full h-full object-cover" controls />
             ) : (
               <img src={segments[currentSegmentIndex].mediaUrl} className="w-full h-full object-cover" />
             )}
             
             {/* Tool Overlay */}
             <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                {[Type, Music, Smile, PenTool, Sparkles].map((Icon, i) => (
                  <button key={i} className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:scale-110 transition-all">
                    <Icon size={20} />
                  </button>
                ))}
             </div>

             {/* Segment Thumbnails */}
             <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto no-scrollbar">
                {segments.map((s, i) => (
                  <button 
                    key={s.id}
                    onClick={() => setCurrentSegmentIndex(i)}
                    className={`w-12 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${currentSegmentIndex === i ? 'border-neon-pink scale-105' : 'border-transparent opacity-50'}`}
                  >
                    <img src={s.mediaUrl} className="w-full h-full object-cover" />
                  </button>
                ))}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-12 h-20 rounded-xl bg-white/10 border-2 border-dashed border-white/20 flex items-center justify-center text-white shrink-0"
                >
                  <Plus size={20} />
                </button>
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 text-center">
            <div className="w-32 h-32 bg-neon-purple/20 rounded-full flex items-center justify-center border border-neon-purple/30 animate-pulse">
                <Camera size={48} className="text-neon-purple" />
            </div>
            <div>
              <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase mb-2">Share Your Story</h2>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Select clips to build your narrative</p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 hover:scale-105 transition-all"
              >
                <Upload size={20} /> Select Media
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" accept="image/*,video/*" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="p-6 pb-12 flex items-center justify-between bg-gradient-to-t from-black to-transparent">
        <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
          <Globe size={14} className="text-neon-purple" /> Stories are public for 24h
        </div>
        <button 
          onClick={handlePublish}
          disabled={segments.length === 0 || isUploading}
          className="bg-neon-purple text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-2xl shadow-neon-purple/40 disabled:opacity-20 transition-all active:scale-95"
        >
          {isUploading ? 'Publishing...' : 'Add to Story'} <Check size={18} />
        </button>
      </div>
    </div>
  );
};
