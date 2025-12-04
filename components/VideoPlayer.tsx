
import React, { useRef, useState, useEffect } from 'react';
import { Video, Series } from '../types';
import { Heart, MessageCircle, Share2, Lock, Play, List, Zap, Disc, Plus, Check, Trash2, Coins, ExternalLink, Copy, X } from 'lucide-react';

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
  onEnded
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes);
  const [showSeriesDrawer, setShowSeriesDrawer] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Animation States
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false); // For center heart pop
  const [isLikePulsing, setIsLikePulsing] = useState(false); // For thumbnail "thump"
  
  const prevUnlockedRef = useRef(isUnlocked);

  useEffect(() => {
    if (isActive) {
      // If it's an Ad, we treat it as unlocked always
      if (isUnlocked || video.isAd) {
        // Play if unlocked and active
        const timer = setTimeout(() => {
          videoRef.current?.play().catch(e => console.log('Autoplay prevented', e));
          setIsPlaying(true);
        }, 300);
        return () => clearTimeout(timer);
      }
    } else {
      // Pause if not active
      videoRef.current?.pause();
      setIsPlaying(false);
      setShowSeriesDrawer(false); // Close drawer when scrolling away
      setShowShareModal(false);
    }
  }, [isActive, isUnlocked, video.isAd]);

  // Detect unlock event for animation
  useEffect(() => {
    // If it is now unlocked, but was previously locked
    if (isUnlocked && !prevUnlockedRef.current && !video.isAd) {
        setShowUnlockAnimation(true);
        const timer = setTimeout(() => setShowUnlockAnimation(false), 2000); // Animation duration
        return () => clearTimeout(timer);
    }
    prevUnlockedRef.current = isUnlocked;
  }, [isUnlocked, video.isAd]);

  const togglePlay = () => {
    if (!videoRef.current || (!isUnlocked && !video.isAd)) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleLike = () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

    if (newLikedState) {
        // Trigger Animations
        setShowLikeAnimation(true);
        setIsLikePulsing(true);
        
        // Reset animations
        setTimeout(() => setShowLikeAnimation(false), 1000);
        setTimeout(() => setIsLikePulsing(false), 200);
    }
  };

  const handleCopyLink = () => {
      const link = `https://dramarr.app/watch/${video.id}`;
      navigator.clipboard.writeText(link).then(() => {
          alert("Link copied to clipboard!");
          setShowShareModal(false);
      }).catch(err => {
          console.error("Failed to copy", err);
      });
  };
  
  const handleAdClick = () => {
      if (video.adDestinationUrl) {
          window.open(video.adDestinationUrl, '_blank');
      } else {
          alert("Navigating to ad destination...");
      }
  };

  const formatCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div className="relative w-full h-full bg-black snap-start overflow-hidden border-b border-gray-900">
      
      {/* Background/Video - With Pulse Animation */}
      <div className={`absolute inset-0 bg-gray-900 transition-transform duration-200 ease-out ${isLikePulsing ? 'scale-95' : 'scale-100'}`}>
         {(!isUnlocked && video.isLocked && !video.isAd) ? (
            // Locked State Placeholder
             <div className="absolute inset-0 flex flex-col items-center justify-center z-0 bg-gray-900">
                <img 
                    src={video.thumbnailUrl} 
                    className="absolute inset-0 w-full h-full object-cover opacity-30 blur-md" 
                    alt="Locked"
                />
             </div>
         ) : (
             <video
                ref={videoRef}
                src={video.url}
                className="w-full h-full object-cover"
                loop={false} // Disable loop to allow onEnded to fire
                playsInline
                poster={video.thumbnailUrl}
                onClick={togglePlay}
                onEnded={onEnded}
            />
         )}
      </div>

      {/* Big Heart Animation Overlay (Center) */}
      {showLikeAnimation && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="animate-fade-in transform transition-all duration-500 scale-150 opacity-0 bg-gradient-to-tr from-neon-pink/40 to-transparent p-10 rounded-full blur-xl absolute"></div>
            <Heart 
                className="w-32 h-32 text-neon-pink fill-neon-pink animate-[ping_0.5s_ease-out_reverse]" 
                strokeWidth={0}
            />
        </div>
      )}

      {/* Success Unlock Animation Overlay */}
      {showUnlockAnimation && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-fade-in pointer-events-none">
             <div className="flex flex-col items-center justify-center text-center transform scale-110 transition-all">
                 <div className="relative mb-4">
                     <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                     <Coins className="text-yellow-400 w-24 h-24 relative z-10 animate-bounce" strokeWidth={1.5} />
                 </div>
                 <h2 className="text-4xl font-black text-white mb-2 tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 drop-shadow-sm">Unlocked!</h2>
                 <div className="bg-gradient-to-r from-yellow-600/40 to-yellow-400/40 border border-yellow-400/50 rounded-full px-6 py-2 backdrop-blur-md">
                     <p className="text-yellow-300 font-bold text-xl flex items-center gap-2">
                        <span className="text-2xl">+</span> 500 Coins
                     </p>
                 </div>
             </div>
         </div>
      )}

      {/* Locked Overlay (Only if NOT an ad) */}
      {!isUnlocked && video.isLocked && !video.isAd && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-fade-in">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 border border-gray-700 shadow-xl shadow-neon-pink/20">
            <Lock className="w-8 h-8 text-neon-pink" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-white">Premium Episode</h3>
          <p className="text-gray-300 mb-2 max-w-xs">
            Unlock to watch <span className="text-neon-purple font-semibold">{video.seriesTitle}</span>
          </p>
          <div className="bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full mb-8">
             <p className="text-yellow-400 text-xs font-bold">🎁 Reward: +500 Coins</p>
          </div>
          
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => onUnlock(video.unlockCost)}
              className="w-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-bold py-3.5 px-6 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <span>Unlock ({video.unlockCost} Credits)</span>
            </button>
            
            <button
                onClick={onWatchAd}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 border border-gray-700"
            >
                <Zap size={18} className="text-yellow-400 fill-yellow-400" />
                <span>Watch Ad (+1 Credit)</span>
            </button>
          </div>
        </div>
      )}

      {/* Play Icon Animation */}
      {!isPlaying && (isUnlocked || video.isAd) && !showUnlockAnimation && !showShareModal && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <Play className="w-16 h-16 text-white/50 fill-white/50 animate-pulse" />
        </div>
      )}

      {/* Series Drawer (Right Side) */}
      <div 
        className={`absolute top-0 right-0 bottom-16 w-64 bg-gray-900/95 backdrop-blur-md z-40 transform transition-transform duration-300 border-l border-gray-800 ${showSeriesDrawer ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="font-bold text-sm">Episodes</h3>
            <button onClick={() => setShowSeriesDrawer(false)} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <div className="p-2 overflow-y-auto h-full pb-20">
            {allSeriesVideos.map(ep => (
                <div key={ep.id} className={`flex items-center gap-3 p-2 rounded-lg mb-1 ${ep.id === video.id ? 'bg-neon-purple/20 border border-neon-purple/50' : 'hover:bg-gray-800'}`}>
                    <div className="relative w-16 h-10 rounded overflow-hidden bg-gray-800 flex-shrink-0">
                        <img src={ep.thumbnailUrl} className="w-full h-full object-cover" />
                        {ep.isLocked && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Lock size={12} className="text-white"/></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">Ep. {ep.episodeNumber}</p>
                        <p className="text-[10px] text-gray-400 truncate">{ep.timestamp}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div 
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end animate-fade-in"
            onClick={() => setShowShareModal(false)}
        >
            <div 
                className="w-full bg-gray-900 rounded-t-3xl p-6 border-t border-gray-800"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-bold text-lg">Share to</h3>
                    <button onClick={() => setShowShareModal(false)} className="p-2 bg-gray-800 rounded-full text-gray-400"><X size={20} /></button>
                </div>
                
                <div className="flex gap-6 overflow-x-auto pb-4">
                    <button onClick={handleCopyLink} className="flex flex-col items-center gap-2 min-w-[70px] group">
                         <div className="w-14 h-14 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                            <Copy className="text-white" size={24} />
                         </div>
                         <span className="text-xs text-gray-400 font-medium">Copy Link</span>
                    </button>
                    
                    {/* Mock Share Options */}
                    {['WhatsApp', 'Instagram', 'SMS', 'Twitter'].map(app => (
                        <button key={app} onClick={() => alert(`Sharing to ${app}...`)} className="flex flex-col items-center gap-2 min-w-[70px] group">
                            <div className="w-14 h-14 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                                <Share2 className="text-white" size={24} />
                            </div>
                            <span className="text-xs text-gray-400 font-medium">{app}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Right Sidebar Controls */}
      <div className="absolute right-2 bottom-24 flex flex-col items-center gap-5 z-30">
        <div className="relative group">
             <div className="w-11 h-11 rounded-full border-2 border-white overflow-hidden mb-1 cursor-pointer">
                <img src={video.creatorAvatar} alt={video.creatorName} className="w-full h-full object-cover" />
             </div>
             {!isFollowing && !isOwner && !video.isAd && (
                 <div 
                    onClick={(e) => { e.stopPropagation(); onToggleFollow(); }}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-neon-pink rounded-full p-0.5 cursor-pointer hover:scale-110 transition-transform"
                 >
                    <div className="w-4 h-4 bg-neon-pink rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                        <Plus size={10} strokeWidth={4} />
                    </div>
                 </div>
             )}
        </div>

        {!video.isAd && (
            <>
                <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
                <div className={`p-2 rounded-full bg-black/30 backdrop-blur-sm transition-all duration-200 active:scale-75 ${isLikePulsing ? 'scale-125' : 'scale-100'}`}>
                    <Heart className={`w-7 h-7 transition-colors duration-300 ${liked ? 'text-neon-pink fill-neon-pink' : 'text-white drop-shadow-lg'}`} />
                </div>
                <span className="text-xs font-semibold drop-shadow-md">{formatCount(likeCount)}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                <div className="p-2 rounded-full bg-black/30 backdrop-blur-sm transition-transform active:scale-75">
                    <MessageCircle className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <span className="text-xs font-semibold drop-shadow-md">{formatCount(video.comments)}</span>
                </button>
            </>
        )}

        {/* Series Button */}
        {video.seriesId && !video.isAd && (
            <button onClick={() => setShowSeriesDrawer(!showSeriesDrawer)} className="flex flex-col items-center gap-1 group">
                <div className="p-2 rounded-full bg-black/30 backdrop-blur-sm transition-transform active:scale-75">
                    <List className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <span className="text-xs font-semibold drop-shadow-md">Series</span>
            </button>
        )}

        {isOwner && !video.isAd && (
             <button 
                onClick={(e) => {
                    e.stopPropagation();
                    if(window.confirm("Delete this video?")) onDelete();
                }}
                className="flex flex-col items-center gap-1 group"
             >
                <div className="p-2 rounded-full bg-red-900/40 backdrop-blur-sm transition-transform active:scale-75">
                    <Trash2 className="w-7 h-7 text-red-500 drop-shadow-lg" />
                </div>
                <span className="text-xs font-semibold drop-shadow-md text-red-400">Delete</span>
            </button>
        )}

        <button onClick={() => setShowShareModal(true)} className="flex flex-col items-center gap-1 group">
          <div className="p-2 rounded-full bg-black/30 backdrop-blur-sm transition-transform active:scale-75">
            <Share2 className="w-7 h-7 text-white drop-shadow-lg" />
          </div>
          <span className="text-xs font-semibold drop-shadow-md">Share</span>
        </button>

        <div className="mt-2 animate-spin-slow">
             <div className="w-10 h-10 bg-black/50 rounded-full p-2 border-4 border-gray-800">
                <Disc className="w-full h-full text-white" />
             </div>
        </div>
      </div>

      {/* Bottom Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 pt-12 pb-5 px-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 pointer-events-none">
        <div className="w-[85%] pointer-events-auto">
          <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-bold text-lg shadow-black drop-shadow-md">@{video.creatorName}</h3>
              {video.isAd && (
                  <span className="bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">Sponsored</span>
              )}
          </div>
          
          {video.seriesTitle && !video.isAd && (
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs text-yellow-300 mb-2 backdrop-blur-md border border-yellow-500/30">
              <span className="font-bold">📺 {video.seriesTitle}</span>
              <span className="opacity-50">•</span>
              <span>Ep. {video.episodeNumber}</span>
            </div>
          )}

          <p className="text-white text-sm mb-2 drop-shadow-md leading-relaxed">{video.description}</p>
          
          <div className="flex gap-2 flex-wrap text-sm font-semibold text-white/80">
            {video.tags.map(tag => <span key={tag} className="hover:underline">#{tag}</span>)}
          </div>
          
          {video.isAd ? (
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    handleAdClick();
                }}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors"
              >
                  {video.adActionLabel || 'Learn More'} <ExternalLink size={16} />
              </button>
          ) : (
            <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
                <Disc size={12} className="animate-spin" /> 
                <span className="truncate w-40">Original Sound - {video.creatorName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
