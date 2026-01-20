
import React, { useRef, useState, useEffect } from 'react';
import { Video, Series, Gift, VIRTUAL_GIFTS } from '../types';
import { Heart, MessageCircle, Share2, Lock, Play, List, Zap, Disc, Plus, Check, Trash2, Coins, ExternalLink, Copy, X, MoreHorizontal, Flag, AlertTriangle, ChevronRight, Split, Maximize2, Gift as GiftIcon, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface VideoPlayerProps {
  video: Video;
  series?: Series;
  isActive: boolean;
  isUnlocked: boolean;
  onUnlock: (cost: number) => void;
  onWatchAd: () => void;
  allSeriesVideos?: Video[];
  isFollowing: boolean;
  onToggleFollow: () => void;
  isOwner: boolean;
  onDelete: () => void;
  onEnded?: () => void;
  onChoiceSelected?: (targetId: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  series,
  isActive, 
  isUnlocked, 
  onUnlock, 
  onWatchAd,
  allSeriesVideos = [],
  isFollowing,
  onToggleFollow,
  isOwner,
  onDelete,
  onEnded,
  onChoiceSelected
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCommentDrawer, setShowCommentDrawer] = useState(false);
  const [showGiftDrawer, setShowGiftDrawer] = useState(false);
  const [activeGift, setActiveGift] = useState<Gift | null>(null);
  const [showChoices, setShowChoices] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [isLikePulsing, setIsLikePulsing] = useState(false);
  
  const prevUnlockedRef = useRef(isUnlocked);
  const viewCountedRef = useRef(false);

  useEffect(() => {
    viewCountedRef.current = false;
    setShowChoices(false);
  }, [video.id]);

  useEffect(() => {
    let viewTimer: any;
    if (isActive) {
      if (isUnlocked || video.isAd) {
        const timer = setTimeout(() => {
          videoRef.current?.play().catch(e => console.log('Autoplay prevented', e));
          setIsPlaying(true);
        }, 300);
        viewTimer = setTimeout(() => {
            if (!viewCountedRef.current && !video.isAd) {
                api.incrementVideoView(video.id);
                viewCountedRef.current = true;
            }
        }, 5000);
        return () => { clearTimeout(timer); clearTimeout(viewTimer); };
      }
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
      setShowShareModal(false);
      setShowCommentDrawer(false);
      setShowGiftDrawer(false);
      setIsTheaterMode(false);
      clearTimeout(viewTimer);
    }
  }, [isActive, isUnlocked, video.isAd, video.id]);

  const handleTimeUpdate = () => {
      if (video.choices && video.choices.length > 0 && videoRef.current) {
          const timeLeft = videoRef.current.duration - videoRef.current.currentTime;
          if (timeLeft < 3 && !showChoices) setShowChoices(true);
      }
  };

  const handleSendGift = (gift: Gift) => {
      setActiveGift(gift);
      setShowGiftDrawer(false);
      setTimeout(() => setActiveGift(null), 3000);
  };

  const togglePlay = () => {
    if (!videoRef.current || (!isUnlocked && !video.isAd)) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleLike = () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    if (newLikedState) {
        setShowLikeAnimation(true);
        setIsLikePulsing(true);
        setTimeout(() => setShowLikeAnimation(false), 1000);
        setTimeout(() => setIsLikePulsing(false), 200);
    }
  };

  const formatCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div className="relative w-full h-full bg-black snap-start overflow-hidden border-b border-gray-900 group">
      
      <div className={`absolute inset-0 bg-gray-900 transition-all duration-500 ease-out ${isLikePulsing ? 'scale-95' : 'scale-100'} ${isTheaterMode ? 'z-50' : ''}`}>
         {(!isUnlocked && video.isLocked && !video.isAd) ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center z-0 bg-gray-900">
                <img src={video.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-md" alt="Locked" />
             </div>
         ) : (
             <video
                ref={videoRef}
                src={video.url}
                className="w-full h-full object-cover"
                loop={false}
                playsInline
                poster={video.thumbnailUrl}
                onClick={togglePlay}
                onEnded={onEnded}
                onTimeUpdate={handleTimeUpdate}
            />
         )}
         {isTheaterMode && (
             <button 
                onClick={() => setIsTheaterMode(false)}
                className="absolute top-12 left-4 p-3 bg-black/40 backdrop-blur-xl rounded-full text-white z-[60] animate-fade-in"
             >
                 <X size={24} />
             </button>
         )}
      </div>

      {activeGift && (
          <div className="absolute inset-0 z-[55] flex flex-col items-center justify-center pointer-events-none animate-fade-in">
              <div className="text-8xl animate-bounce mb-4">{activeGift.icon}</div>
              <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-yellow-400/30">
                  <p className="text-yellow-400 font-bold uppercase tracking-widest text-xs">Sent {activeGift.name}!</p>
              </div>
          </div>
      )}

      {/* Main Overlay UI (Fades in Theater Mode) */}
      <div className={`transition-opacity duration-300 ${isTheaterMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        {showLikeAnimation && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <Heart className="w-32 h-32 text-neon-pink fill-neon-pink animate-[ping_0.5s_ease-out_reverse]" strokeWidth={0} />
            </div>
        )}

        {/* Action Sidebar */}
        <div className="absolute right-2 bottom-20 flex flex-col gap-4 items-center z-40 pb-4">
            <div className="relative mb-2">
                <div className={`w-12 h-12 rounded-full border-2 ${video.isAd ? 'border-yellow-400' : 'border-white'} p-0.5 overflow-hidden`}><img src={video.creatorAvatar} className="w-full h-full object-cover rounded-full" /></div>
                {!isFollowing && !isOwner && !video.isAd && (
                    <button onClick={onToggleFollow} className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-neon-pink text-white rounded-full p-0.5 shadow-md hover:scale-110 transition-transform"><Plus size={14} strokeWidth={3} /></button>
                )}
            </div>
            <button onClick={handleLike} className="flex flex-col items-center gap-1 group"><div className={`p-2 rounded-full transition-all ${liked ? 'text-neon-pink' : 'text-white bg-black/20 backdrop-blur-sm'}`}><Heart size={32} fill={liked ? "currentColor" : "transparent"} strokeWidth={liked ? 0 : 2} /></div><span className="text-white text-xs font-bold">{formatCount(likeCount)}</span></button>
            <button onClick={() => setShowCommentDrawer(true)} className="flex flex-col items-center gap-1 group"><div className="p-2 rounded-full text-white bg-black/20 backdrop-blur-sm transition-all group-hover:bg-black/40"><MessageCircle size={32} strokeWidth={2} /></div><span className="text-white text-xs font-bold">{formatCount(video.comments)}</span></button>
            <button onClick={() => setShowGiftDrawer(true)} className="flex flex-col items-center gap-1 group"><div className="p-2 rounded-full text-yellow-400 bg-yellow-400/10 backdrop-blur-sm transition-all border border-yellow-400/20"><GiftIcon size={32} /></div><span className="text-yellow-400 text-xs font-bold">Gift</span></button>
            <button onClick={() => setIsTheaterMode(true)} className="flex flex-col items-center gap-1 group"><div className="p-2 rounded-full text-white bg-black/20 backdrop-blur-sm transition-all group-hover:bg-black/40"><Maximize2 size={32} /></div><span className="text-white text-xs font-bold uppercase text-[8px]">Theater</span></button>
        </div>

        {/* Bottom Metadata */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 pb-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
            <div className="pointer-events-auto max-w-[75%]">
                <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">@{video.creatorName}{video.isAd && <span className="bg-yellow-400 text-black text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Sponsored</span>}</h3>
                <div className="text-white text-sm mb-2 line-clamp-2 leading-relaxed">{video.description}</div>
                {video.tags && video.tags.length > 0 && (<div className="flex flex-wrap gap-2 mb-2">{video.tags.map((tag, i) => (<span key={i} className="text-neon-purple font-bold text-xs">#{tag}</span>))}</div>)}
            </div>
        </div>

        {/* Unlock Screen */}
        {!isUnlocked && video.isLocked && !video.isAd && (
            <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 border border-gray-700"><Lock className="w-8 h-8 text-neon-pink" /></div>
                <h3 className="text-2xl font-bold mb-2 text-white">Premium Episode</h3>
                <p className="text-gray-300 mb-8 max-w-xs">Unlock this drama to see the twist everyone is talking about!</p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button onClick={() => onUnlock(video.unlockCost)} className="w-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-neon-purple/20 active:scale-95 transition-transform flex items-center justify-center gap-2"><Zap fill="currentColor" size={18} />Unlock ({video.unlockCost} Credits)</button>
                    <button onClick={onWatchAd} className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"><Play size={18} fill="currentColor" />Watch Ad (+1 Credit)</button>
                </div>
            </div>
        )}
      </div>

      {/* Gift Drawer */}
      {showGiftDrawer && (
          <div className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end animate-fade-in" onClick={() => setShowGiftDrawer(false)}>
              <div className="bg-gray-900 rounded-t-[32px] p-8 border-t border-white/10" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2"><GiftIcon className="text-yellow-400" /> Send a Gift</h3>
                      <div className="bg-gray-800 px-4 py-1.5 rounded-full flex items-center gap-2">
                          <Coins size={14} className="text-yellow-400" />
                          <span className="text-sm font-bold text-white">1,250</span>
                      </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-8">
                      {VIRTUAL_GIFTS.map(gift => (
                          <button 
                            key={gift.id}
                            onClick={() => handleSendGift(gift)}
                            className="flex flex-col items-center gap-2 group"
                          >
                              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform border border-white/5 group-hover:border-yellow-400/50">
                                  {gift.icon}
                              </div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">{gift.name}</span>
                              <span className="text-[10px] text-yellow-400 font-black">{gift.cost}</span>
                          </button>
                      ))}
                  </div>
                  <button onClick={() => setShowGiftDrawer(false)} className="w-full py-4 text-gray-500 font-bold">Cancel</button>
              </div>
          </div>
      )}

      {/* Decision Points */}
      {showChoices && video.choices && !isTheaterMode && (
          <div className="absolute inset-0 z-[45] bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 animate-fade-in">
              <div className="flex items-center gap-2 text-white/80 font-black text-[10px] uppercase tracking-[0.4em] mb-8 animate-pulse">
                  <Split size={14} className="text-neon-purple" /> Choice Required
              </div>
              <div className="flex flex-col gap-4 w-full max-w-[280px]">
                  {video.choices.map((choice, i) => (
                      <button 
                        key={i}
                        onClick={() => onChoiceSelected?.(choice.targetVideoId)}
                        className="group relative w-full overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl p-5 transition-all active:scale-95 flex items-center justify-between"
                      >
                          <span className="text-white font-black text-sm relative z-10 uppercase tracking-wider">{choice.label}</span>
                          <ChevronRight size={18} className="text-neon-purple relative z-10 group-hover:translate-x-1 transition-transform" />
                      </button>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};
