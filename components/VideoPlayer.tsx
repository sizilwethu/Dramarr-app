
import React, { useRef, useState, useEffect } from 'react';
import { Video, Series } from '../types';
import { Heart, MessageCircle, Share2, Lock, Play, List, Zap, Disc, Plus, Check, Trash2, Coins, ExternalLink, Copy, X, MoreHorizontal, Flag, AlertTriangle, ChevronRight, Split } from 'lucide-react';
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
  const [showChoices, setShowChoices] = useState(false);
  
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
      clearTimeout(viewTimer);
    }
  }, [isActive, isUnlocked, video.isAd, video.id]);

  useEffect(() => {
    if (isUnlocked && !prevUnlockedRef.current && !video.isAd) {
        setShowUnlockAnimation(true);
        setTimeout(() => setShowUnlockAnimation(false), 2000);
    }
    prevUnlockedRef.current = isUnlocked;
  }, [isUnlocked, video.isAd]);

  const handleTimeUpdate = () => {
      if (video.choices && video.choices.length > 0 && videoRef.current) {
          const timeLeft = videoRef.current.duration - videoRef.current.currentTime;
          if (timeLeft < 3 && !showChoices) setShowChoices(true);
      }
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

  const handleCopyLink = () => {
      const link = `https://dramarr.app/watch/${video.id}`;
      navigator.clipboard.writeText(link).then(() => {
          alert("Link copied to clipboard!");
          setShowShareModal(false);
      });
  };
  
  const handleAdClick = () => {
      if (video.adDestinationUrl) window.open(video.adDestinationUrl, '_blank');
  };

  const formatCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div className="relative w-full h-full bg-black snap-start overflow-hidden border-b border-gray-900">
      
      <div className={`absolute inset-0 bg-gray-900 transition-transform duration-200 ease-out ${isLikePulsing ? 'scale-95' : 'scale-100'}`}>
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
      </div>

      {showLikeAnimation && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="animate-fade-in transform transition-all duration-500 scale-150 opacity-0 bg-gradient-to-tr from-neon-pink/40 to-transparent p-10 rounded-full blur-xl absolute"></div>
            <Heart className="w-32 h-32 text-neon-pink fill-neon-pink animate-[ping_0.5s_ease-out_reverse]" strokeWidth={0} />
        </div>
      )}

      {showUnlockAnimation && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-fade-in pointer-events-none">
             <div className="flex flex-col items-center justify-center text-center transform scale-110 transition-all">
                 <div className="relative mb-4">
                     <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                     <Coins className="text-yellow-400 w-24 h-24 relative z-10 animate-bounce" strokeWidth={1.5} />
                 </div>
                 <h2 className="text-4xl font-black text-white mb-2 tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 drop-shadow-sm">Unlocked!</h2>
                 <div className="bg-gradient-to-r from-yellow-600/40 to-yellow-400/40 border border-yellow-400/50 rounded-full px-6 py-2 backdrop-blur-md">
                     <p className="text-yellow-300 font-bold text-xl flex items-center gap-2"><span className="text-2xl">+</span> 500 Coins</p>
                 </div>
             </div>
         </div>
      )}

      {/* Interactive Plot Choices Overlay */}
      {showChoices && video.choices && (
          <div className="absolute inset-0 z-[45] bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 animate-fade-in pointer-events-auto">
              <div className="flex items-center gap-2 text-white/80 font-black text-xs uppercase tracking-[0.3em] mb-8 animate-pulse">
                  <Split size={16} className="text-neon-purple" /> Decide the Plot
              </div>
              <div className="flex flex-col gap-4 w-full max-w-[280px]">
                  {video.choices.map((choice, i) => (
                      <button 
                        key={i}
                        onClick={() => onChoiceSelected?.(choice.targetVideoId)}
                        className="group relative w-full overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl p-5 transition-all active:scale-95 flex items-center justify-between"
                      >
                          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <span className="text-white font-black text-sm relative z-10 uppercase tracking-wider">{choice.label}</span>
                          <ChevronRight size={18} className="text-neon-purple relative z-10 group-hover:translate-x-1 transition-transform" />
                      </button>
                  ))}
              </div>
          </div>
      )}

      {!isUnlocked && video.isLocked && !video.isAd && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-fade-in">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 border border-gray-700 shadow-xl shadow-neon-pink/20"><Lock className="w-8 h-8 text-neon-pink" /></div>
          <h3 className="text-2xl font-bold mb-2 text-white">Premium Episode</h3>
          <p className="text-gray-300 mb-2 max-w-xs">Unlock to watch <span className="text-neon-purple font-semibold">{video.seriesTitle}</span></p>
          <div className="bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full mb-8"><p className="text-yellow-400 text-xs font-bold">🎁 Reward: +500 Coins</p></div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button onClick={() => onUnlock(video.unlockCost)} className="w-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-neon-purple/20 active:scale-95 transition-transform flex items-center justify-center gap-2"><Zap fill="currentColor" size={18} />Unlock ({video.unlockCost} Credits)</button>
            <button onClick={onWatchAd} className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"><Play size={18} fill="currentColor" />Watch Ad (+1 Credit)</button>
          </div>
        </div>
      )}

      <div className="absolute right-2 bottom-20 flex flex-col gap-4 items-center z-40 pb-4">
        <div className="relative mb-2">
            <div className={`w-12 h-12 rounded-full border-2 ${video.isAd ? 'border-yellow-400' : 'border-white'} p-0.5 overflow-hidden`}><img src={video.creatorAvatar} className="w-full h-full object-cover rounded-full" /></div>
            {!isFollowing && !isOwner && !video.isAd && (
                <button onClick={onToggleFollow} className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-neon-pink text-white rounded-full p-0.5 shadow-md hover:scale-110 transition-transform"><Plus size={14} strokeWidth={3} /></button>
            )}
            {isFollowing && !isOwner && !video.isAd && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-neon-purple rounded-full p-0.5 shadow-md animate-fade-in"><Check size={14} strokeWidth={3} /></div>
            )}
        </div>
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group"><div className={`p-2 rounded-full transition-all ${liked ? 'text-neon-pink' : 'text-white bg-black/20 backdrop-blur-sm'}`}><Heart size={32} fill={liked ? "currentColor" : "transparent"} strokeWidth={liked ? 0 : 2} className={`transition-transform duration-200 ${liked ? 'scale-110' : 'scale-100 group-hover:scale-110'}`} /></div><span className="text-white text-xs font-bold shadow-black drop-shadow-md">{formatCount(likeCount)}</span></button>
        <button onClick={() => setShowCommentDrawer(true)} className="flex flex-col items-center gap-1 group"><div className="p-2 rounded-full text-white bg-black/20 backdrop-blur-sm transition-all group-hover:bg-black/40"><MessageCircle size={32} strokeWidth={2} /></div><span className="text-white text-xs font-bold shadow-black drop-shadow-md">{formatCount(video.comments)}</span></button>
        <button onClick={() => setShowShareModal(true)} className="flex flex-col items-center gap-1 group"><div className="p-2 rounded-full text-white bg-black/20 backdrop-blur-sm transition-all group-hover:bg-black/40"><Share2 size={32} strokeWidth={2} /></div><span className="text-white text-xs font-bold shadow-black drop-shadow-md">{formatCount(video.shares)}</span></button>
        {isOwner && (<button onClick={onDelete} className="flex flex-col items-center gap-1 group mt-2"><div className="p-2 rounded-full text-white bg-red-500/80 backdrop-blur-sm transition-all group-hover:bg-red-600"><Trash2 size={24} /></div></button>)}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-30 p-4 pb-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
          <div className="pointer-events-auto max-w-[75%]">
              <h3 className="text-white font-bold text-lg mb-1 shadow-black drop-shadow-md flex items-center gap-2">@{video.creatorName}{video.isAd && <span className="bg-yellow-400 text-black text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Sponsored</span>}</h3>
              <div className="text-white text-sm mb-2 shadow-black drop-shadow-md line-clamp-2 leading-relaxed">{video.description}</div>
              {video.tags && video.tags.length > 0 && (<div className="flex flex-wrap gap-2 mb-2">{video.tags.map((tag, i) => (<span key={i} className="text-white font-bold text-xs shadow-black drop-shadow-md">#{tag}</span>))}</div>)}
              {video.isAd && (<button onClick={handleAdClick} className="mt-2 bg-blue-600 text-white font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 pointer-events-auto">{video.adActionLabel || 'Learn More'} <ExternalLink size={14}/></button>)}
          </div>
      </div>

      {showShareModal && (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-end animate-fade-in" onClick={() => setShowShareModal(false)}>
              <div className="bg-gray-900 w-full rounded-t-2xl p-4 border-t border-gray-800" onClick={e => e.stopPropagation()}>
                  <h3 className="text-white font-bold mb-4 text-center">Share to</h3>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                      <button className="flex flex-col items-center gap-2"><div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">WA</div><span className="text-xs text-gray-400">WhatsApp</span></button>
                      <button className="flex flex-col items-center gap-2"><div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">FB</div><span className="text-xs text-gray-400">Facebook</span></button>
                      <button className="flex flex-col items-center gap-2"><div className="w-12 h-12 bg-sky-400 rounded-full flex items-center justify-center text-white font-bold">TW</div><span className="text-xs text-gray-400">Twitter</span></button>
                      <button className="flex flex-col items-center gap-2" onClick={handleCopyLink}><div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white"><Copy size={20}/></div><span className="text-xs text-gray-400">Copy Link</span></button>
                  </div>
                  <button onClick={() => setShowShareModal(false)} className="w-full bg-gray-800 py-3 rounded-xl font-bold text-white">Cancel</button>
              </div>
          </div>
      )}

      {showCommentDrawer && (
        <div className="absolute inset-0 bg-black/50 z-50 flex flex-col justify-end animate-fade-in" onClick={() => setShowCommentDrawer(false)}>
             <div className="bg-gray-900 rounded-t-2xl h-[70%] p-4 flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2"><h3 className="font-bold text-white">Comments ({formatCount(video.comments)})</h3><button onClick={() => setShowCommentDrawer(false)}><X className="text-gray-400"/></button></div>
                  <div className="flex-1 flex items-center justify-center text-gray-500"><p>Comments are disabled for this preview.</p></div>
             </div>
        </div>
      )}
    </div>
  );
};
