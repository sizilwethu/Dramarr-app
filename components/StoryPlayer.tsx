
import React, { useState, useEffect, useRef } from 'react';
import { Story, StorySegment, StoryReaction, User } from '../types';
import { X, ChevronLeft, ChevronRight, Heart, Laugh, Flame, Sparkles, Send, MoreHorizontal, MessageCircle } from 'lucide-react';
import { api } from '../services/api';

interface StoryPlayerProps {
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
  currentUser: User;
}

export const StoryPlayer: React.FC<StoryPlayerProps> = ({ stories, initialStoryIndex, onClose, currentUser }) => {
  const [storyIndex, setStoryIndex] = useState(initialStoryIndex);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const currentStory = stories[storyIndex];
  const currentSegment = currentStory.segments[segmentIndex];
  
  const timerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    startSegment();
    return () => clearInterval(timerRef.current);
  }, [storyIndex, segmentIndex]);

  const startSegment = () => {
    clearInterval(timerRef.current);
    setProgress(0);
    
    const duration = currentSegment.type === 'video' ? 20000 : 5000;
    const step = 100 / (duration / 50);

    timerRef.current = setInterval(() => {
      if (!isPaused) {
        setProgress(prev => {
          if (prev >= 100) {
            nextSegment();
            return 100;
          }
          return prev + step;
        });
      }
    }, 50);
  };

  const nextSegment = () => {
    if (segmentIndex < currentStory.segments.length - 1) {
      setSegmentIndex(prev => prev + 1);
    } else if (storyIndex < stories.length - 1) {
      setStoryIndex(prev => prev + 1);
      setSegmentIndex(0);
    } else {
      onClose();
    }
  };

  const prevSegment = () => {
    if (segmentIndex > 0) {
      setSegmentIndex(prev => prev - 1);
    } else if (storyIndex > 0) {
      setStoryIndex(prev => prev - 1);
      setSegmentIndex(stories[storyIndex - 1].segments.length - 1);
    }
  };

  const handleReaction = async (type: StoryReaction['type']) => {
    await api.reactToStory(currentStory.id, { userId: currentUser.id, type });
    // Visual feedback
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    await api.sendMessage(currentUser.id, currentStory.userId, `Replied to your story: ${replyText}`);
    setReplyText('');
    setIsPaused(false);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center animate-fade-in touch-none">
      
      {/* Background Media */}
      <div className="absolute inset-0 z-0 bg-gray-900" onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)} onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}>
        {currentSegment.type === 'video' ? (
          <video 
            ref={videoRef}
            src={currentSegment.mediaUrl} 
            className="w-full h-full object-cover" 
            autoPlay 
            muted 
            playsInline
          />
        ) : (
          <img src={currentSegment.mediaUrl} className="w-full h-full object-cover" />
        )}
        
        {/* Navigation Areas */}
        <div className="absolute inset-0 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={prevSegment} />
          <div className="w-2/3 h-full cursor-pointer" onClick={nextSegment} />
        </div>
      </div>

      {/* Top Overlays */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-12 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        {/* Progress Bars */}
        <div className="flex gap-1.5 mb-4">
          {currentStory.segments.map((_, i) => (
            <div key={i} className="h-0.5 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-50" 
                style={{ width: i < segmentIndex ? '100%' : i === segmentIndex ? `${progress}%` : '0%' }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <img src={currentStory.avatarUrl} className="w-8 h-8 rounded-full border border-white/20" />
            <div>
              <h4 className="text-white text-xs font-bold">@{currentStory.username}</h4>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{new Date(currentStory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-white/60 hover:text-white transition-colors"><MoreHorizontal size={20} /></button>
            <button onClick={onClose} className="p-2 text-white/60 hover:text-white transition-colors"><X size={24} /></button>
          </div>
        </div>
      </div>

      {/* Bottom Overlays */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 pb-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-4 py-3 flex items-center gap-2 focus-within:bg-white/20 transition-all">
            <input 
              type="text" 
              placeholder="Send message..." 
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              className="bg-transparent border-none text-white text-xs outline-none flex-1"
            />
            {replyText && (
              <button onClick={handleReply} className="text-neon-pink"><Send size={18} /></button>
            )}
          </div>
          
          <div className="flex gap-2">
            {[
              { type: 'heart', icon: Heart, color: 'text-neon-pink' },
              { type: 'laugh', icon: Laugh, color: 'text-yellow-400' },
              { type: 'fire', icon: Flame, color: 'text-orange-500' }
            ].map(reaction => (
              <button 
                key={reaction.type} 
                onClick={() => handleReaction(reaction.type as any)}
                className={`w-10 h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center ${reaction.color} hover:scale-125 transition-all active:scale-90`}
              >
                <reaction.icon size={20} fill="currentColor" className="opacity-80" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
