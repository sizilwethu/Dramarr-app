
import React, { useRef, useState, useEffect } from 'react';
import { Video, Series, Gift, VIRTUAL_GIFTS, User, Comment } from '../types';
import { Heart, MessageCircle, Share2, Lock, Play, List, Zap, Disc, Plus, Check, Trash2, Coins, ExternalLink, Copy, X, MoreHorizontal, Flag, AlertTriangle, ChevronRight, Split, Maximize2, Gift as GiftIcon, Sparkles, Volume2, VolumeX, Send, RotateCcw, RotateCw, Gauge } from 'lucide-react';
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
  currentUser: User;
  onOpenProfile?: (userId: string) => void;
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
  onChoiceSelected,
  currentUser,
  onOpenProfile
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCommentDrawer, setShowCommentDrawer] = useState(false);
  const [showGiftDrawer, setShowGiftDrawer] = useState(false);
  const [activeGift, setActiveGift] = useState<Gift | null>(null);
  const [showChoices, setShowChoices] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [isLikePulsing, setIsLikePulsing] = useState(false);
  
  // Playback State
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  
  // Comment State
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [commentCount, setCommentCount] = useState(video.comments);

  const prevUnlockedRef = useRef(isUnlocked);
  const viewCountedRef = useRef(false);

  useEffect(() => {
    viewCountedRef.current = false;
    setShowChoices(false);
    setPlaybackSpeed(1.0);
    
    // Initial optimistic update from props
    setLikeCount(video.likes);
    setCommentCount(video.comments);

    // Fetch authoritative stats from DB to ensure "Always True" count
    const loadRealStats = async () => {
        const stats = await api.getVideoStats(video.id);
        setLikeCount(stats.likes);
        setCommentCount(stats.comments);
    };
    loadRealStats();
  }, [video.id]);

  useEffect(() => {
    if (showCommentDrawer) {
        fetchComments();
    }
  }, [showCommentDrawer]);

  useEffect(() => {
    let viewTimer: any;
    if (isActive) {
      if (isUnlocked || video.isAd) {
        const timer = setTimeout(() => {
          // Attempt play with mute handling
          if (videoRef.current) {
              videoRef.current.muted = isMuted; // Ensure state matches
              videoRef.current.playbackRate = playbackSpeed; // Restore speed
              videoRef.current.play().then(() => {
                  setIsPlaying(true);
              }).catch(e => {
                  console.log('Autoplay prevented', e);
                  setIsPlaying(false);
              });
          }
        }, 300);
        viewTimer = setTimeout(() => {
            // Only increment view if:
            // 1. Hasn't been counted in this session yet
            // 2. Is not an Ad (ads tracked differently usually)
            // 3. User is NOT the owner
            if (!viewCountedRef.current && !video.isAd && !isOwner) {
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
      setShowMenu(false);
      clearTimeout(viewTimer);
    }
  }, [isActive, isUnlocked, video.isAd, video.id, isOwner]);

  const handleTimeUpdate = () => {
      if (videoRef.current) {
          const t = videoRef.current.currentTime;
          const duration = videoRef.current.duration;

          // Choices logic
          if (video.choices && video.choices.length > 0) {
              const timeLeft = duration - t;
              if (timeLeft < 3 && !showChoices) setShowChoices(true);
          }
      }
  };

  const handleSeek = (seconds: number) => {
      if (videoRef.current) {
          videoRef.current.currentTime += seconds;
      }
  };

  const changePlaybackSpeed = (e: React.MouseEvent) => {
      e.stopPropagation();
      const speeds = [0.5, 1.0, 1.25, 1.5, 2.0];
      const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
      const newSpeed = speeds[nextIndex];
      setPlaybackSpeed(newSpeed);
      if (videoRef.current) videoRef.current.playbackRate = newSpeed;
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

  const toggleMute = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      if (videoRef.current) videoRef.current.muted = newMuted;
  };

  const handleLike = () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    if (newLikedState) {
        api.likeVideo(video.id);
        setShowLikeAnimation(true);
        setIsLikePulsing(true);
        setTimeout(() => setShowLikeAnimation(false), 1000);
        setTimeout(() => setIsLikePulsing(false), 200);
    }
  };

  const fetchComments = async () => {
      setIsLoadingComments(true);
      const data = await api.getComments(video.id, 'video');
      setComments(data);
      // Ensure the displayed count matches the actual fetched list
      setCommentCount(data.length);
      setIsLoadingComments(false);
  };

  const handlePostComment = async () => {
      if (!commentText.trim()) return;
      setIsPostingComment(true);
      try {
          await api.postComment(currentUser.id, video.id, commentText, 'video');
          setCommentText('');
          // Optimistic update for immediate feedback
          setCommentCount(prev => prev + 1);
          // Fetch authoritative list to sync
          await fetchComments();
      } catch (e) {
          console.error("Failed to post comment", e);
      } finally {
          setIsPostingComment(false);
      }
  };

  const formatCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenProfile) onOpenProfile(video.creatorId);
  };

  return (
    <div className="relative w-full h-full bg-black snap-start overflow-hidden border-b border-gray-900 group">
      
      <div className={`absolute inset-0 bg-gray-900 transition-all duration-500 ease-out ${isLikePulsing ? 'scale-95' : 'scale-100'} ${isTheaterMode ? 'z-50' : ''}`} onClick={togglePlay}>
         {(!isUnlocked && video.isLocked && !video.isAd) ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center z-0 bg-gray-900">
                <img src={video.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-md" alt="Locked" />
             </div>
         ) : (
             <video
                ref={videoRef}
                src={video.url}
                className="w-full h-full object-cover"
                loop
                playsInline
                muted={isMuted}
                poster={video.thumbnailUrl}
                onEnded={onEnded}
                onTimeUpdate={handleTimeUpdate}
            />
         )}
         {isTheaterMode && (
             <button 
                onClick={(e) => { e.stopPropagation(); setIsTheaterMode(false); }}
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

      {/* Central Playback Controls Overlay (Visible when paused) */}
      {!isPlaying && isUnlocked && !showMenu && !showCommentDrawer && !showGiftDrawer && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px] animate-fade-in pointer-events-none">
              <div className="pointer-events-auto flex flex-col items-center gap-6">
                  {/* Speed Toggle */}
                  <button 
                      onClick={changePlaybackSpeed}
                      className="px-4 py-1.5 bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2"
                  >
                      <Gauge size={12} /> {playbackSpeed}x Speed
                  </button>

                  {/* Main Controls Row */}
                  <div className="flex items-center gap-8">
                      <button 
                          onClick={(e) => { e.stopPropagation(); handleSeek(-10); }}
                          className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/5 transition-all group"
                      >
                          <RotateCcw size={28} />
                          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">-10s</span>
                      </button>

                      <button 
                          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                          className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-black shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform active:scale-95"
                      >
                          <Play size={40} fill="currentColor" className="ml-2" />
                      </button>

                      <button 
                          onClick={(e) => { e.stopPropagation(); handleSeek(10); }}
                          className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/5 transition-all group"
                      >
                          <RotateCw size={28} />
                          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">+10s</span>
                      </button>
                  </div>
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
            <div className="relative mb-2 cursor-pointer" onClick={handleAvatarClick}>
                <div className={`w-12 h-12 rounded-full border-2 ${video.isAd ? 'border-yellow-400' : 'border-white'} p-0.5 overflow-hidden`}><img src={video.creatorAvatar} className="w-full h-full object-cover rounded-full" /></div>
                {!isFollowing && !isOwner && !video.isAd && (
                    <button onClick={(e) => { e.stopPropagation(); onToggleFollow(); }} className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-neon-pink text-white rounded-full p-0.5 shadow-md hover:scale-110 transition-transform"><Plus size={14} strokeWidth={3} /></button>
                )}
            </div>
            
            <button onClick={handleLike} className="flex flex-col items-center gap-1 group"><div className={`p-2 rounded-full transition-all ${liked ? 'text-neon-pink' : 'text-white bg-black/20 backdrop-blur-sm'}`}><Heart size={32} fill={liked ? "currentColor" : "transparent"} strokeWidth={liked ? 0 : 2} /></div><span className="text-white text-xs font-bold">{formatCount(likeCount)}</span></button>
            
            <button onClick={() => setShowCommentDrawer(true)} className="flex flex-col items-center gap-1 group"><div className="p-2 rounded-full text-white bg-black/20 backdrop-blur-sm transition-all group-hover:bg-black/40"><MessageCircle size={32} strokeWidth={2} /></div><span className="text-white text-xs font-bold">{formatCount(commentCount)}</span></button>
            
            <button onClick={() => setShowMenu(true)} className="flex flex-col items-center gap-1 group">
                <div className="p-2 rounded-full text-white bg-black/20 backdrop-blur-sm transition-all group-hover:bg-black/40">
                    <MoreHorizontal size={32} />
                </div>
                <span className="text-white text-xs font-bold">More</span>
            </button>

            <button onClick={() => setIsTheaterMode(true)} className="flex flex-col items-center gap-1 group"><div className="p-2 rounded-full text-white bg-black/20 backdrop-blur-sm transition-all group-hover:bg-black/40"><Maximize2 size={32} /></div><span className="text-white text-xs font-bold uppercase text-[8px]">Theater</span></button>
        </div>

        {/* Bottom Metadata */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 pb-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
            <div className="pointer-events-auto max-w-[75%]">
                <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2 cursor-pointer" onClick={handleAvatarClick}>@{video.creatorName}{video.isAd && <span className="bg-yellow-400 text-black text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Sponsored</span>}</h3>
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

      {/* More Options Menu */}
      {showMenu && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in" onClick={() => setShowMenu(false)}>
            <div className="bg-gray-900 border border-white/10 w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-gray-800/50">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">More Options</span>
                    <button onClick={() => setShowMenu(false)} className="p-1 text-gray-400 hover:text-white"><X size={18} /></button>
                </div>
                
                <button onClick={(e) => { toggleMute(e); setShowMenu(false); }} className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors border-b border-white/5">
                    <div className="p-3 bg-gray-800 rounded-full text-white">
                        {isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-white">{isMuted ? 'Unmute Video' : 'Mute Video'}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-black">Audio Control</p>
                    </div>
                </button>

                <button onClick={() => { setShowGiftDrawer(true); setShowMenu(false); }} className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors border-b border-white/5">
                    <div className="p-3 bg-gray-800 rounded-full text-yellow-400">
                        <GiftIcon size={20}/>
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-white">Send Gift</p>
                        <p className="text-[10px] text-gray-500 uppercase font-black">Support Creator</p>
                    </div>
                </button>

                {isOwner ? (
                    <button onClick={(e) => { onDelete(); setShowMenu(false); }} className="w-full p-4 flex items-center gap-4 hover:bg-red-500/10 transition-colors group">
                        <div className="p-3 bg-gray-800 rounded-full text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                            <Trash2 size={20}/>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-red-500">Delete Video</p>
                            <p className="text-[10px] text-red-500/50 uppercase font-black">Permanent Action</p>
                        </div>
                    </button>
                ) : (
                    <button onClick={() => { alert('Reported'); setShowMenu(false); }} className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                        <div className="p-3 bg-gray-800 rounded-full text-gray-400">
                            <Flag size={20}/>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-white">Report Content</p>
                            <p className="text-[10px] text-gray-500 uppercase font-black">Safety Center</p>
                        </div>
                    </button>
                )}
            </div>
        </div>
      )}

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

      {/* Comment Drawer */}
      {showCommentDrawer && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-fade-in" onClick={() => setShowCommentDrawer(false)}>
              <div className="bg-gray-950 rounded-t-[32px] h-[70%] border-t border-white/10 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="p-4 border-b border-white/10 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                          <h3 className="font-black text-white text-sm uppercase tracking-widest">Comments</h3>
                          <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{comments.length}</span>
                      </div>
                      <button onClick={() => setShowCommentDrawer(false)} className="p-1 text-gray-400 hover:text-white"><X size={20}/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                      {isLoadingComments ? (
                          <div className="flex justify-center py-10"><RotateCcw size={24} className="text-neon-purple animate-spin" /></div>
                      ) : comments.length > 0 ? (
                          comments.map(comment => (
                              <div key={comment.id} className="flex gap-3">
                                  <img 
                                    src={comment.avatarUrl} 
                                    className="w-8 h-8 rounded-full border border-white/10 shrink-0 object-cover cursor-pointer" 
                                    onClick={() => onOpenProfile && onOpenProfile(comment.userId)}
                                  />
                                  <div className="flex-1">
                                      <div className="bg-gray-900 rounded-2xl p-3 border border-white/5">
                                          <p className="text-[10px] text-gray-400 font-bold mb-0.5" onClick={() => onOpenProfile && onOpenProfile(comment.userId)}>@{comment.username}</p>
                                          <p className="text-xs text-gray-200">{comment.text}</p>
                                      </div>
                                      <div className="flex gap-4 mt-1 ml-2">
                                          <span className="text-[9px] text-gray-600 font-bold">{new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                          <button className="text-[9px] text-gray-500 font-bold hover:text-white">Reply</button>
                                      </div>
                                  </div>
                              </div>
                          ))
                      ) : (
                          <div className="text-center py-10 opacity-30">
                              <MessageCircle size={32} className="mx-auto mb-2 text-gray-500" />
                              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">No comments yet</p>
                          </div>
                      )}
                  </div>

                  <div className="p-4 border-t border-white/10 bg-black/40">
                      <div className="flex gap-2 bg-gray-900 rounded-full p-1.5 border border-white/10">
                          <input 
                              type="text" 
                              value={commentText}
                              onChange={e => setCommentText(e.target.value)}
                              placeholder="Add a comment..."
                              className="flex-1 bg-transparent px-4 text-xs text-white focus:outline-none"
                              onKeyDown={e => e.key === 'Enter' && handlePostComment()}
                          />
                          <button 
                              onClick={handlePostComment}
                              disabled={!commentText.trim() || isPostingComment}
                              className="p-2 bg-neon-purple rounded-full text-white disabled:opacity-50 active:scale-95 transition-all"
                          >
                              {isPostingComment ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                          </button>
                      </div>
                  </div>
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
