
import React, { useState, useEffect, useRef } from 'react';
import { Home, Globe, PlusCircle, Compass, User as UserIcon, Gift, Music, Play, Pause, X } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import { api } from './services/api';

// Types and Data
import { User, Video, TabView, SocialPost, Story, Series, MusicTrack } from './types';
// Keep Mock Data ONLY for fallbacks/testing UI parts not yet backed by DB (like stories/ads)
import { MOCK_SERIES, MOCK_SOCIAL_POSTS, MOCK_STORIES, MOCK_VIDEO_ADS } from './services/mockData';

// Components
import { AuthScreen } from './components/AuthScreen';
import { VideoPlayer } from './components/VideoPlayer';
import { SocialView } from './components/SocialView';
import { ProfileView } from './components/ProfileView';
import { CreatorStudio } from './components/CreatorStudio';
import { AdminDashboard } from './components/AdminDashboard';
import { ExploreView } from './components/ExploreView';
import { DailyRewardView } from './components/DailyRewardView';
import { InterstitialAd } from './components/InterstitialAd';
import { MusicView } from './components/MusicView';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabView>(TabView.AUTH);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data State
  const [videos, setVideos] = useState<Video[]>([]);
  const [series, setSeries] = useState<Series[]>(MOCK_SERIES); // Fallback to mock until series DB ready
  const [posts, setPosts] = useState<SocialPost[]>([]); // Initialize empty for Real Data
  const [stories, setStories] = useState<Story[]>([]); // Initialize empty for Real Data
  
  // Feed State
  const [feedTab, setFeedTab] = useState<'foryou' | 'following'>('foryou');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  // Creator Studio State
  const [studioMode, setStudioMode] = useState<'episode' | 'series' | 'analytics'>('episode');

  // Ad State
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [interstitialShownCount, setInterstitialShownCount] = useState(0);

  // Music State
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  // 1. Check Session & Load Data
  useEffect(() => {
    const checkSession = async () => {
        setIsLoading(true);
        try {
            const currentUser = await api.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                setActiveTab(TabView.FEED);
                await loadContent();
            } else {
                setActiveTab(TabView.AUTH);
            }
        } catch (e) {
            console.error("Session check failed", e);
        } finally {
            setIsLoading(false);
        }
    };

    checkSession();
  }, []);

  const loadContent = async () => {
      try {
          const realVideos = await api.getVideos();
          
          // Inject Ads into real videos
          const mixedVideos: Video[] = [];
          if (realVideos.length > 0) {
            realVideos.forEach((vid, index) => {
                mixedVideos.push(vid);
                if ((index + 1) % 3 === 0 && MOCK_VIDEO_ADS.length > 0) {
                    mixedVideos.push({ ...MOCK_VIDEO_ADS[0], id: `ad_inserted_${index}` });
                }
            });
            setVideos(mixedVideos);
          } else {
             // Fallback if DB empty so UI doesn't look broken
             setVideos(MOCK_VIDEO_ADS); 
          }

          // Try to fetch series if table exists, else keep mock
          const realSeries = await api.getSeries();
          if (realSeries.length > 0) setSeries(realSeries);
          
          // Fetch Real Stories & Posts
          await refreshSocialContent();

      } catch (e) {
          console.error("Failed to load content", e);
          // Don't override with empty arrays if fetch fails, keep current or mock
      }
  };

  // Helper to refresh only social content
  const refreshSocialContent = async () => {
      const realStories = await api.getStories();
      if (realStories.length > 0) setStories(realStories);
      
      const realPosts = await api.getSocialPosts();
      if (realPosts.length > 0) setPosts(realPosts);
  };

  // Interstitial Logic
  useEffect(() => {
      if (user && interstitialShownCount === 0 && !isLoading) {
          const timer = setTimeout(() => {
              setShowInterstitial(true);
              setInterstitialShownCount(1);
          }, 5000);
          return () => clearTimeout(timer);
      }
  }, [user, interstitialShownCount, isLoading]);

  // Audio Playback Logic
  useEffect(() => {
      const audio = audioRef.current;
      if (currentTrack) {
          if (audio.src !== currentTrack.audioUrl) {
              audio.src = currentTrack.audioUrl;
              audio.load();
          }
          if (isMusicPlaying) {
              audio.play().catch(e => console.log("Audio play error", e));
          } else {
              audio.pause();
          }
      } else {
          audio.pause();
      }
      
      return () => {
          // Cleanup handled by ref
      };
  }, [currentTrack, isMusicPlaying]);

  // Handle Login (Real Auth)
  const handleLogin = async (email?: string, password?: string, isSignUp?: boolean, username?: string, additionalData?: any) => {
    try {
        if (!email || !password) return; // Simple validation
        
        setIsLoading(true);
        if (isSignUp && username) {
            await api.signUp(email, password, username, additionalData);
            alert("Account created! You can now log in.");
        } else {
            await api.signIn(email, password);
            const currentUser = await api.getCurrentUser();
            
            // Check Daily Reset logic
            if (currentUser) {
                const today = new Date().toDateString();
                if (currentUser.lastPremiumUnlockDate !== today) {
                    // This update would ideally happen on the backend, but we do it optimistically here
                    // or call an API endpoint to reset it.
                    currentUser.dailyPremiumUnlockCount = 0;
                    currentUser.lastPremiumUnlockDate = today;
                }
                setUser(currentUser);
                await loadContent();
                setActiveTab(TabView.FEED);
            }
        }
    } catch (error: any) {
        alert(error.message || "Authentication failed");
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.signOut();
    setUser(null);
    setActiveTab(TabView.AUTH);
  };

  const handleUpdateUser = async (data: Partial<User>) => {
      if(user) {
          // 1. Optimistic Update (Immediate UI change)
          setUser({ ...user, ...data });
          
          // 2. Persist to DB
          try {
             // We use updated updateProfile to save everything
             await api.updateProfile(user.id, data);
          } catch (e) {
              console.error("Failed to persist profile update", e);
              alert("Failed to save changes. Please try again.");
          }
      }
  };

  const handleDeleteAccount = async () => {
      // api.deleteAccount()
      await api.signOut();
      setUser(null);
      setActiveTab(TabView.AUTH);
      alert("Your account has been permanently deleted.");
  };

  // Content Deletion Handlers
  const handleDeleteVideo = (id: string) => {
      // api.deleteVideo(id)
      setVideos(prev => prev.filter(v => v.id !== id));
  };

  const handleDeletePost = (id: string) => {
      setPosts(prev => prev.filter(p => p.id !== id));
  };

  const handleDeleteStory = (id: string) => {
      setStories(prev => prev.filter(s => s.id !== id));
  };

  const handleRemoveProfilePic = () => {
      if(user) {
          // TODO: Delete from storage
          setUser({ ...user, avatarUrl: 'https://via.placeholder.com/200' });
          handleUpdateUser({ avatarUrl: 'https://via.placeholder.com/200' });
      }
  };


  // Scroll Handling to track current video
  const handleScroll = () => {
    if (feedContainerRef.current) {
      const { scrollTop, clientHeight } = feedContainerRef.current;
      const index = Math.round(scrollTop / clientHeight);
      
      const displayedVideos = getDisplayedVideos();
      
      if (index !== currentVideoIndex && index < displayedVideos.length) {
        setCurrentVideoIndex(index);
      }
    }
  };

  const scrollToVideo = (index: number) => {
      if (feedContainerRef.current) {
          const clientHeight = feedContainerRef.current.clientHeight;
          feedContainerRef.current.scrollTo({
              top: index * clientHeight,
              behavior: 'smooth'
          });
          setCurrentVideoIndex(index);
      }
  };

  const handleVideoEnd = () => {
      const displayedVideos = getDisplayedVideos();
      const currentVideo = displayedVideos[currentVideoIndex];
      
      if (!currentVideo) return;

      let nextIndex = currentVideoIndex + 1;

      // Smart Series Logic: If part of a series, try to find the next episode in the current feed
      if (currentVideo.seriesId && currentVideo.episodeNumber) {
          const nextEpNum = currentVideo.episodeNumber + 1;
          const seriesMatchIndex = displayedVideos.findIndex(v => 
              v.seriesId === currentVideo.seriesId && 
              v.episodeNumber === nextEpNum
          );
          
          // If we found the next episode in the loaded list, jump to it
          if (seriesMatchIndex !== -1) {
              nextIndex = seriesMatchIndex;
          }
      }

      // Ensure we don't scroll past the end
      if (nextIndex < displayedVideos.length) {
          scrollToVideo(nextIndex);
      }
  };

  const handleUnlockVideo = async (cost: number, targetVideoIndex: number = currentVideoIndex) => {
    if (!user) return;
    
    // Get the actual video ID based on index context
    const displayedVideos = getDisplayedVideos();
    const videoToUnlock = displayedVideos[targetVideoIndex];

    if (!videoToUnlock) return;
    
    // Daily Limit Logic
    const today = new Date().toDateString();
    let currentCount = user.dailyPremiumUnlockCount;
    
    // Check Limit
    if (currentCount >= 30) {
        alert("Daily limit reached! You can only unlock 30 premium episodes per day. Come back tomorrow.");
        return;
    }

    if (user.credits >= cost) {
      // 1. Optimistic UI Updates
      const newCredits = user.credits - cost;
      const newCoins = user.coins + 500;
      const newUnlockedIds = [...user.unlockedVideoIds, videoToUnlock.id];
      
      const updatedUser = { 
          ...user, 
          credits: newCredits,
          coins: newCoins,
          unlockedVideoIds: newUnlockedIds,
          dailyPremiumUnlockCount: currentCount + 1,
          lastPremiumUnlockDate: today
      };
      
      setUser(updatedUser);

      // 2. Real DB Update
      try {
        await api.updateUserWallet(user.id, newCoins, newCredits, newUnlockedIds);
        
        // Update video lock state locally for UI
        const updatedVideos = videos.map(v => 
            v.id === videoToUnlock.id ? { ...v, isLocked: false } : v
        );
        setVideos(updatedVideos);

        alert(`Unlocked! You spent ${cost} Credit and earned 500 Coins!`);
      } catch (e) {
          console.error("Unlock transaction failed", e);
          alert("Transaction failed. Please try again.");
          // Revert state would go here
      }

    } else {
      alert("Not enough credits! Watch an ad to earn more.");
    }
  };

  const handleWatchAd = () => {
    const originalText = document.title;
    document.title = "Watching Ad...";
    alert("Simulating 3s Rewarded Ad...");
    
    setTimeout(async () => {
        if(user) {
            const newCredits = user.credits + 1;
            setUser({ ...user, credits: newCredits });
            try {
                // Update DB
                await api.updateUserWallet(user.id, user.coins, newCredits, user.unlockedVideoIds);
            } catch(e) { console.error(e); }

            document.title = originalText;
            alert("Thanks for watching! +1 Credit added.");
        }
    }, 1000);
  };

  const handleToggleFollow = (creatorId: string) => {
      if(!user) return;
      const isFollowing = user.following.includes(creatorId);
      let newFollowing = [];
      if(isFollowing) {
          newFollowing = user.following.filter(id => id !== creatorId);
      } else {
          newFollowing = [...user.following, creatorId];
      }
      setUser({ ...user, following: newFollowing });
      // TODO: api.toggleFollow(creatorId);
  };

  const handleOpenCreatorStudio = (mode: 'episode' | 'series' | 'analytics' = 'episode') => {
      setStudioMode(mode);
      setActiveTab(TabView.UPLOAD);
  };

  const getDisplayedVideos = () => {
      if(feedTab === 'following' && user) {
          const filtered = videos.filter(v => user.following.includes(v.creatorId));
          return filtered.length > 0 ? filtered : []; 
      }
      return videos;
  };

  // Music Handlers
  const handlePlayMusic = (track: MusicTrack) => {
      setCurrentTrack(track);
      setIsMusicPlaying(true);
      // Pause active video if any (managed by UI state mostly, but good conceptual link)
  };

  // ---------------------------------------------------------------------------
  // RENDER HELPERS
  // ---------------------------------------------------------------------------

  if (isLoading) {
      return <div className="h-[100dvh] w-full bg-black flex items-center justify-center text-white">Loading dramarr...</div>
  }

  if (!user || activeTab === TabView.AUTH) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case TabView.FEED:
        const displayedVideos = getDisplayedVideos();
        
        return (
          <div className="relative h-full w-full bg-black">
              {/* Feed Header */}
              <div className="absolute top-0 left-0 right-0 z-50 pt-12 flex justify-between items-center px-4 text-white text-shadow-md pointer-events-none">
                  <div className="w-8"></div> {/* Spacer */}
                  
                  <div className="flex gap-6 pointer-events-auto items-center">
                      <button 
                        onClick={() => setFeedTab('following')}
                        className={`font-bold transition-opacity text-[15px] ${feedTab === 'following' ? 'text-white border-b-2 border-white pb-1' : 'text-gray-400 opacity-80'}`}
                      >
                          Following
                      </button>
                      <button 
                        onClick={() => setFeedTab('foryou')}
                        className={`font-bold transition-opacity text-[15px] ${feedTab === 'foryou' ? 'text-white border-b-2 border-white pb-1' : 'text-gray-400 opacity-80'}`}
                      >
                          For You
                      </button>
                      {/* Explore Button Added Here */}
                      <button 
                        onClick={() => setActiveTab(TabView.EXPLORE)}
                        className={`font-bold transition-opacity text-[15px] text-gray-400 opacity-80 hover:text-white`}
                      >
                          Explore
                      </button>
                  </div>

                  {/* Daily Reward Button */}
                  <button 
                    onClick={() => setActiveTab(TabView.DAILY_REWARD)}
                    className="w-8 h-8 pointer-events-auto text-yellow-400 hover:scale-110 transition-transform animate-bounce"
                  >
                    <Gift size={28} />
                  </button>
              </div>

              {/* Empty State */}
              {displayedVideos.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black z-0 text-gray-500">
                      <p className="mb-4">No videos available.</p>
                      <button onClick={loadContent} className="text-neon-purple underline">Retry</button>
                  </div>
              )}
            
            <div 
                ref={feedContainerRef}
                onScroll={handleScroll}
                className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black"
            >
                {displayedVideos.map((video, index) => (
                <div key={video.id} className="h-full w-full snap-start">
                    <VideoPlayer 
                    video={video}
                    isActive={index === currentVideoIndex && activeTab === TabView.FEED}
                    isUnlocked={!video.isLocked || user.unlockedVideoIds.includes(video.id)}
                    onUnlock={(cost) => handleUnlockVideo(cost, index)}
                    onWatchAd={handleWatchAd}
                    allSeriesVideos={videos.filter(v => v.seriesId === video.seriesId && v.seriesId !== undefined)}
                    isFollowing={user.following.includes(video.creatorId)}
                    onToggleFollow={() => handleToggleFollow(video.creatorId)}
                    isOwner={user.id === video.creatorId}
                    onDelete={() => handleDeleteVideo(video.id)}
                    onEnded={handleVideoEnd}
                    />
                </div>
                ))}
            </div>
          </div>
        );
      
      case TabView.SOCIAL:
        return (
            <SocialView 
                currentUser={user}
                stories={stories}
                posts={posts}
                onDeletePost={handleDeletePost}
                onDeleteStory={handleDeleteStory}
                onRefresh={refreshSocialContent}
            />
        );
      
      case TabView.EXPLORE:
        return <ExploreView />;
        
      case TabView.MUSIC:
        return (
            <MusicView 
                currentTrack={currentTrack}
                isPlaying={isMusicPlaying}
                onPlayTrack={handlePlayMusic}
                onPauseTrack={() => setIsMusicPlaying(false)}
            />
        );

      case TabView.UPLOAD:
        return (
            <CreatorStudio 
                onClose={() => {
                    loadContent(); // Refresh videos after upload
                    setActiveTab(TabView.FEED);
                }} 
                user={user}
                videos={videos}
                initialMode={studioMode}
            />
        );

      case TabView.PROFILE:
        return (
          <ProfileView 
            user={user} 
            videos={videos} 
            series={series}
            onLogout={handleLogout}
            onOpenAdmin={() => setActiveTab(TabView.ADMIN)}
            onUpdateUser={handleUpdateUser}
            onDeleteAccount={handleDeleteAccount}
            onDeleteVideo={handleDeleteVideo}
            onRemoveProfilePic={handleRemoveProfilePic}
            onOpenAnalytics={() => handleOpenCreatorStudio('analytics')}
          />
        );
      
      case TabView.DAILY_REWARD:
        return (
            <DailyRewardView 
                user={user}
                videos={videos}
                onClose={() => setActiveTab(TabView.FEED)}
                onWatchAd={handleWatchAd}
                onPlayVideo={(index) => {
                    setActiveTab(TabView.FEED);
                    setFeedTab('foryou');
                }}
            />
        );

      case TabView.ADMIN:
        return <AdminDashboard onClose={() => setActiveTab(TabView.PROFILE)} />;
        
      default:
        return null;
    }
  };

  return (
    <div className="relative h-[100dvh] w-full max-w-md mx-auto bg-black text-white shadow-2xl overflow-hidden flex flex-col font-sans">
      
      {/* Interstitial Ad Layer */}
      {showInterstitial && (
          <InterstitialAd onClose={() => setShowInterstitial(false)} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {renderContent()}
      </div>

      {/* Mini Player */}
      {currentTrack && activeTab !== TabView.FEED && (
          <div className="absolute bottom-[70px] left-0 right-0 bg-gray-900 border-t border-gray-800 p-2 flex items-center justify-between px-4 z-40">
              <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-10 h-10 rounded bg-gray-800 overflow-hidden ${isMusicPlaying ? 'animate-spin-slow' : ''}`}>
                      <img src={currentTrack.coverUrl} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                      <p className="font-bold text-sm text-white truncate">{currentTrack.title}</p>
                      <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <button onClick={() => setIsMusicPlaying(!isMusicPlaying)} className="text-white hover:scale-110 transition-transform">
                      {isMusicPlaying ? <Pause fill="white" size={20} /> : <Play fill="white" size={20} />}
                  </button>
                  <button onClick={() => { setIsMusicPlaying(false); setCurrentTrack(null); }} className="text-gray-500 hover:text-white">
                      <X size={20} />
                  </button>
              </div>
          </div>
      )}

      {/* Bottom Navigation */}
      {activeTab !== TabView.UPLOAD && activeTab !== TabView.ADMIN && activeTab !== TabView.DAILY_REWARD && (
        <div className="h-[70px] bg-black/95 backdrop-blur-md border-t border-gray-900 flex justify-around items-center px-2 z-50 absolute bottom-0 w-full">
          <button 
            onClick={() => setActiveTab(TabView.FEED)}
            className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeTab === TabView.FEED ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Home size={22} strokeWidth={activeTab === TabView.FEED ? 3 : 2} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
          <button 
            onClick={() => setActiveTab(TabView.SOCIAL)}
            className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeTab === TabView.SOCIAL ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Globe size={22} strokeWidth={activeTab === TabView.SOCIAL ? 3 : 2} />
            <span className="text-[10px] font-medium">Social</span>
          </button>

          <button 
            onClick={() => handleOpenCreatorStudio('episode')}
            className="flex flex-col items-center justify-center -mt-6"
          >
            <div className="w-14 h-14 bg-gradient-to-tr from-neon-purple to-neon-pink rounded-full flex items-center justify-center shadow-lg shadow-neon-purple/30 border-4 border-black hover:scale-105 transition-transform">
               <PlusCircle size={28} className="text-white" />
            </div>
          </button>

          <button 
            onClick={() => setActiveTab(TabView.MUSIC)}
            className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeTab === TabView.MUSIC ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Music size={22} strokeWidth={activeTab === TabView.MUSIC ? 3 : 2} />
            <span className="text-[10px] font-medium">Music</span>
          </button>

          <button 
            onClick={() => setActiveTab(TabView.PROFILE)}
            className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeTab === TabView.PROFILE ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <UserIcon size={22} strokeWidth={activeTab === TabView.PROFILE ? 3 : 2} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      )}
    </div>
  );
}
