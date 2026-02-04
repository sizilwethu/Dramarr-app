
import React, { useState, useEffect } from 'react';
import { Search, Grid, ChevronLeft, ChevronRight, Sparkles, MessageSquare, Play, User as UserIcon } from 'lucide-react';
import { api } from '../services/api';
import { CATEGORIES, Series, AICharacter, Video, User } from '../types';
import { VideoPlayer } from './VideoPlayer';

interface ExploreViewProps {
    onBack: () => void;
    onOpenCharacterChat: (char: AICharacter) => void;
    currentUser: User;
    onUpdateUser: (data: Partial<User>) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ onBack, onOpenCharacterChat, currentUser, onUpdateUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [characters, setCharacters] = useState<AICharacter[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  useEffect(() => {
    loadExploreData();
  }, [activeCategory]);

  const loadExploreData = async () => {
    setIsLoading(true);
    try {
      const [chars, sers, vids] = await Promise.all([
        api.getAICharacters(),
        api.getSeries(activeCategory),
        api.getVideos() // Fetch videos to include in explore results
      ]);
      setCharacters(chars);
      setSeries(sers);
      setVideos(vids);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFollow = async (followingId: string) => {
    try {
      const isNowFollowing = await api.toggleFollow(currentUser.id, followingId);
      const newFollowing = isNowFollowing 
        ? [...currentUser.following, followingId]
        : currentUser.following.filter(id => id !== followingId);
      onUpdateUser({ following: newFollowing });
    } catch (e) {
      console.error(e);
    }
  };

  const getFilteredContent = () => {
    const term = searchTerm.toLowerCase();
    
    // Filter Series
    const matchedSeries = series.filter(s => 
        s.title.toLowerCase().includes(term) || 
        s.category.toLowerCase().includes(term) ||
        (s.creatorName && s.creatorName.toLowerCase().includes(term))
    ).map(s => ({ ...s, type: 'series' as const }));

    // Filter Videos (User Uploads)
    const matchedVideos = videos.filter(v => {
        // Filter by category if not All
        if (activeCategory !== 'All' && !v.tags.includes(activeCategory)) return false;
        
        // Filter by search term
        if (!term) return true;
        return (
            v.description.toLowerCase().includes(term) || 
            v.tags.some(t => t.toLowerCase().includes(term)) ||
            (v.creatorName && v.creatorName.toLowerCase().includes(term))
        );
    }).map(v => ({ ...v, type: 'video' as const }));

    return { matchedSeries, matchedVideos };
  };

  const { matchedSeries, matchedVideos } = getFilteredContent();
  const hasResults = matchedSeries.length > 0 || matchedVideos.length > 0;

  return (
    <div className="flex-1 h-full flex flex-col bg-black md:pt-6 animate-fade-in max-w-7xl mx-auto w-full min-h-0 overflow-hidden relative">
      <div className="px-4 md:px-8 mb-4 shrink-0">
        <div className="flex items-center gap-3 mb-4">
            <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Explore</h1>
        </div>
        <div className="relative bg-gray-900/80 rounded-2xl overflow-hidden border border-white/5 max-w-2xl">
            <Search className="absolute left-4 top-3.5 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search creators, dramas, or tags..." 
              className="w-full bg-transparent py-3 pl-11 pr-4 text-sm text-white focus:outline-none placeholder-gray-600 font-medium" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Character Carousel (Only show when not searching or if relevant) */}
        {activeCategory === 'All' && !searchTerm && characters.length > 0 && (
            <div className="mb-8">
                <div className="flex items-center justify-between px-4 mb-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-neon-purple w-4 h-4" />
                        <h2 className="text-[9px] font-black text-white uppercase tracking-[0.4em]">Cast Connections</h2>
                    </div>
                </div>
                <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar pb-2">
                    {characters.map(char => (
                        <div 
                            key={char.id} 
                            onClick={() => onOpenCharacterChat(char)}
                            className="min-w-[240px] bg-gray-900/40 p-4 rounded-[28px] border border-white/5 relative group cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <img src={char.avatarUrl} className="w-12 h-12 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition-transform" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white text-xs truncate">{char.name}</h3>
                                    <p className="text-[9px] text-gray-500 line-clamp-1">{char.description}</p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between bg-neon-purple/10 p-2.5 rounded-xl border border-neon-purple/20">
                                <span className="text-[9px] text-neon-purple font-black flex items-center gap-1.5 uppercase tracking-widest">
                                    <MessageSquare size={12} /> Talk
                                </span>
                                <ChevronRight size={12} className="text-neon-purple" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 px-4 mb-6 overflow-x-auto no-scrollbar shrink-0">
             <button onClick={() => setActiveCategory('All')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${activeCategory === 'All' ? 'bg-white text-black border-white shadow-xl' : 'bg-gray-900 text-gray-400 border-gray-800'}`}>All</button>
             {CATEGORIES.map(cat => (
                 <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${activeCategory === cat ? 'bg-white text-black border-white shadow-xl' : 'bg-gray-900 text-gray-400 border-gray-800'}`}>{cat}</button>
             ))}
        </div>

        {/* Main Content Grid */}
        <div className="px-4 pb-24 min-h-full">
            <div className="flex items-center gap-2 mb-4 px-1">
                <Grid className="text-neon-purple w-4 h-4" />
                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">{searchTerm ? 'Search Results' : 'Trending Now'}</h2>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center py-20"><Sparkles className="animate-spin text-neon-purple" /></div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {/* Render Series */}
                    {matchedSeries.map(s => (
                        <div key={s.id} className="bg-gray-900/40 rounded-[24px] p-2 border border-white/5 hover:bg-gray-800 transition-all cursor-pointer group">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-2 relative">
                                <img src={s.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-white uppercase">Series</div>
                                <div className="absolute bottom-2 left-2 right-2">
                                    <span className="text-[8px] text-white/80 font-bold uppercase tracking-wider block mb-0.5">{s.category}</span>
                                    {s.creatorName && <span className="text-[9px] text-white font-black truncate block">@{s.creatorName}</span>}
                                </div>
                            </div>
                            <h3 className="font-bold text-[11px] text-white truncate px-1">{s.title}</h3>
                            <p className="text-[9px] text-gray-500 px-1">{s.totalEpisodes} Episodes</p>
                        </div>
                    ))}

                    {/* Render User Videos */}
                    {matchedVideos.map(v => (
                        <div key={v.id} onClick={() => setPlayingVideo(v)} className="bg-gray-900/40 rounded-[24px] p-2 border border-white/5 hover:bg-gray-800 transition-all cursor-pointer group">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-2 relative">
                                <img src={v.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute top-2 right-2 bg-neon-purple/80 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-white uppercase">Video</div>
                                <div className="absolute bottom-2 left-2 right-2">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <div className="w-4 h-4 rounded-full bg-gray-800 overflow-hidden border border-white/20">
                                            {v.creatorAvatar ? <img src={v.creatorAvatar} className="w-full h-full object-cover" /> : <UserIcon size={10} className="text-white m-auto" />}
                                        </div>
                                        <span className="text-[9px] text-white font-black truncate">@{v.creatorName}</span>
                                    </div>
                                    <div className="flex gap-1 flex-wrap">
                                        {v.tags.slice(0, 2).map((t, i) => (
                                            <span key={i} className="text-[7px] bg-white/10 px-1.5 rounded text-white/80 font-bold">#{t}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                        <Play size={12} fill="white" className="text-white ml-0.5" />
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-bold text-[11px] text-white truncate px-1">{v.description}</h3>
                            <p className="text-[9px] text-gray-500 px-1 flex items-center gap-1"><Play size={8} /> {v.views} views</p>
                        </div>
                    ))}
                </div>
            )}
            
            {!isLoading && !hasResults && (
                <div className="py-20 text-center opacity-30">
                    <p className="text-sm font-bold uppercase tracking-widest">No matching content found</p>
                    {searchTerm && <p className="text-[9px] text-gray-500 mt-2 font-medium">Try searching for a different title, category, or creator.</p>}
                </div>
            )}
        </div>
      </div>

      {/* Full Screen Video Player Overlay */}
      {playingVideo && (
        <div className="fixed inset-0 z-[100] bg-black animate-fade-in flex flex-col">
            <button 
                onClick={() => setPlayingVideo(null)} 
                className="absolute top-4 left-4 z-[110] p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
            >
                <ChevronLeft size={28} />
            </button>
            <div className="flex-1 w-full relative">
                <VideoPlayer 
                    video={playingVideo}
                    isActive={true}
                    isUnlocked={!playingVideo.isLocked || currentUser.unlockedVideoIds.includes(playingVideo.id)}
                    onUnlock={() => {}} // Placeholder logic matching App.tsx
                    onWatchAd={() => {}} // Placeholder logic
                    isFollowing={currentUser.following.includes(playingVideo.creatorId)}
                    onToggleFollow={() => handleToggleFollow(playingVideo.creatorId)}
                    isOwner={currentUser.id === playingVideo.creatorId}
                    onDelete={() => {}} // No delete from explore
                    currentUser={currentUser}
                />
            </div>
        </div>
      )}
    </div>
  );
};
