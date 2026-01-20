
import React, { useState, useEffect, useRef } from 'react';
import { Home, Globe, PlusCircle, Compass, User as UserIcon, Gift, Music, Play, Pause, X, LayoutGrid, Settings, LogOut, Search, RotateCcw } from 'lucide-react';
import { App as CapApp } from '@capacitor/app';
import { supabase } from './lib/supabaseClient';
import { api } from './services/api';

// Types and Data
import { User, Video, TabView, SocialPost, Story, Series, MusicTrack } from './types';
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

const PERSISTENCE_KEY_TAB = 'dramarr_active_tab';
const PERSISTENCE_KEY_FEED = 'dramarr_feed_tab';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabView>(() => {
    const saved = localStorage.getItem(PERSISTENCE_KEY_TAB);
    return (saved as TabView) || TabView.AUTH;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [series, setSeries] = useState<Series[]>(MOCK_SERIES);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  
  const [feedTab, setFeedTab] = useState<'foryou' | 'following'>(() => {
    return (localStorage.getItem(PERSISTENCE_KEY_FEED) as 'foryou' | 'following') || 'foryou';
  });
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  const [studioMode, setStudioMode] = useState<'episode' | 'series' | 'analytics'>('episode');
  const [showInterstitial, setShowInterstitial] = useState(false);

  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  // Persistence Effects
  useEffect(() => {
    if (activeTab !== TabView.AUTH) {
      localStorage.setItem(PERSISTENCE_KEY_TAB, activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(PERSISTENCE_KEY_FEED, feedTab);
  }, [feedTab]);

  // Ref to track nested state for hardware back button logic
  const nestedStateRef = useRef({
    hasActiveChat: false,
    setHasActiveChat: (val: boolean) => { nestedStateRef.current.hasActiveChat = val; }
  });

  // Hardware Back Button Listener
  useEffect(() => {
    const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (activeTab === TabView.ADMIN) {
        setActiveTab(TabView.PROFILE);
      } else if (activeTab === TabView.SOCIAL && nestedStateRef.current.hasActiveChat) {
        setActiveTab(TabView.SOCIAL);
      } else if (activeTab !== TabView.FEED && activeTab !== TabView.AUTH) {
        setActiveTab(TabView.FEED);
      }
    });

    return () => {
      backListener.then(l => l.remove());
    };
  }, [activeTab]);

  useEffect(() => {
    const checkSession = async () => {
        setIsLoading(true);
        try {
            const currentUser = await api.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                if (activeTab === TabView.AUTH) setActiveTab(TabView.FEED);
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
             setVideos(MOCK_VIDEO_ADS); 
          }
          const realSeries = await api.getSeries();
          if (realSeries.length > 0) setSeries(realSeries);
          await refreshSocialContent();
      } catch (e) {
          console.error("Failed to load content", e);
      }
  };

  const handleManualRefresh = async () => {
      if (isRefreshing) return;
      setIsRefreshing(true);
      await loadContent();
      setTimeout(() => setIsRefreshing(false), 800);
  };

  const refreshSocialContent = async () => {
      const realStories = await api.getStories();
      if (realStories.length > 0) setStories(realStories);
      const realPosts = await api.getSocialPosts();
      if (realPosts.length > 0) setPosts(realPosts);
  };

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
  }, [currentTrack, isMusicPlaying]);

  const handleLogin = async (email?: string, password?: string, isSignUp?: boolean, username?: string, additionalData?: any) => {
    try {
        if (!email || !password) return;
        setIsLoading(true);
        if (isSignUp && username) {
            await api.signUp(email, password, username, additionalData);
            alert("Account created! You can now log in.");
        } else {
            await api.signIn(email, password);
            const currentUser = await api.getCurrentUser();
            if (currentUser) {
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
    localStorage.removeItem(PERSISTENCE_KEY_TAB);
    localStorage.removeItem(PERSISTENCE_KEY_FEED);
  };

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
      if (nextIndex < displayedVideos.length) {
          scrollToVideo(nextIndex);
      }
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

  if (isLoading) {
      return <div className="h-[100dvh] w-full bg-black flex items-center justify-center text-white font-bold">dramarr</div>
  }

  if (!user || activeTab === TabView.AUTH) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const NavItem = ({ tab, icon: Icon, label }: { tab: TabView, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-4 p-3 rounded-xl transition-all w-full ${activeTab === tab ? 'bg-neon-purple/10 text-white font-bold' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'}`}
    >
      <Icon size={24} strokeWidth={activeTab === tab ? 3 : 2} />
      <span className="hidden lg:inline text-base">{label}</span>
    </button>
  );

  const goHome = () => setActiveTab(TabView.FEED);

  const renderContent = () => {
    switch (activeTab) {
      case TabView.FEED:
        const displayedVideos = getDisplayedVideos();
        return (
          <div className="relative h-full w-full bg-black overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 right-0 z-50 pt-12 md:pt-6 flex justify-center items-center px-4 text-white pointer-events-none">
                  <div className="flex gap-4 pointer-events-auto items-center bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-2xl">
                      <button onClick={() => setFeedTab('following')} className={`font-bold transition-opacity text-[15px] ${feedTab === 'following' ? 'text-white' : 'text-gray-400 opacity-80'}`}>Following</button>
                      <button onClick={() => setFeedTab('foryou')} className={`font-bold transition-opacity text-[15px] ${feedTab === 'foryou' ? 'text-white' : 'text-gray-400 opacity-80'}`}>For You</button>
                      <div className="w-px h-4 bg-white/20"></div>
                      <button onClick={handleManualRefresh} className={`text-gray-400 hover:text-white transition-all ${isRefreshing ? 'animate-spin' : ''}`}>
                          <RotateCcw size={16} />
                      </button>
                      <button onClick={() => setActiveTab(TabView.DAILY_REWARD)} className="text-yellow-400 animate-bounce"><Gift size={20} /></button>
                  </div>
              </div>
              
              <div ref={feedContainerRef} onScroll={handleScroll} className="h-full w-full overflow-y-scroll snap-y snap-mandatory bg-black no-scrollbar">
                {displayedVideos.map((video, index) => (
                    <div key={video.id} className="h-full w-full snap-start flex justify-center bg-[#050505]">
                        <div className="h-full w-full md:max-w-md border-x border-gray-900 shadow-2xl relative">
                            <VideoPlayer 
                                video={video}
                                isActive={index === currentVideoIndex && activeTab === TabView.FEED}
                                isUnlocked={!video.isLocked || user.unlockedVideoIds.includes(video.id)}
                                onUnlock={(cost) => {}} 
                                onWatchAd={() => {}}
                                isFollowing={user.following.includes(video.creatorId)}
                                onToggleFollow={() => {}}
                                isOwner={user.id === video.creatorId}
                                onDelete={() => {}}
                                onEnded={handleVideoEnd}
                            />
                        </div>
                    </div>
                ))}
              </div>
          </div>
        );
      case TabView.SOCIAL: return <SocialView currentUser={user} stories={stories} posts={posts} onDeletePost={() => {}} onDeleteStory={() => {}} onRefresh={handleManualRefresh} onBack={goHome} onChatStateChange={nestedStateRef.current.setHasActiveChat} />;
      case TabView.EXPLORE: return <ExploreView onBack={goHome} />;
      case TabView.MUSIC: return <MusicView currentTrack={currentTrack} isPlaying={isMusicPlaying} onPlayTrack={(t) => { setCurrentTrack(t); setIsMusicPlaying(true); }} onPauseTrack={() => setIsMusicPlaying(false)} currentUser={user} onBack={goHome} />;
      case TabView.UPLOAD: return <CreatorStudio onClose={() => { loadContent(); setActiveTab(TabView.FEED); }} user={user} videos={videos} initialMode={studioMode} onBack={goHome} />;
      case TabView.PROFILE: return <ProfileView user={user} videos={videos} series={series} onLogout={handleLogout} onOpenAdmin={() => setActiveTab(TabView.ADMIN)} onUpdateUser={(d) => setUser({...user, ...d})} onDeleteAccount={() => {}} onDeleteVideo={() => {}} onRemoveProfilePic={() => {}} onOpenAnalytics={() => handleOpenCreatorStudio('analytics')} onBack={goHome} />;
      case TabView.DAILY_REWARD: return <DailyRewardView user={user} videos={videos} onClose={goHome} onWatchAd={() => {}} onPlayVideo={() => setActiveTab(TabView.FEED)} />;
      case TabView.ADMIN: return <AdminDashboard onClose={() => setActiveTab(TabView.PROFILE)} />;
      default: return null;
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-[#050505] text-white flex overflow-hidden">
      {/* DESKTOP SIDEBAR */}
      <nav className="hidden md:flex flex-col w-20 lg:w-64 border-r border-gray-900 p-4 gap-8 bg-black shrink-0">
        <div className="px-3 py-4">
           <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-pink hidden lg:block">dramarr</h1>
           <div className="w-10 h-10 bg-gradient-to-r from-neon-purple to-neon-pink rounded-xl flex items-center justify-center lg:hidden">
              <span className="text-white font-black text-xl">d</span>
           </div>
        </div>
        
        <div className="flex-1 flex flex-col gap-2">
            <NavItem tab={TabView.FEED} icon={Home} label="For You" />
            <NavItem tab={TabView.EXPLORE} icon={Compass} label="Explore" />
            <NavItem tab={TabView.SOCIAL} icon={Globe} label="Community" />
            <NavItem tab={TabView.MUSIC} icon={Music} label="Music" />
            <NavItem tab={TabView.PROFILE} icon={UserIcon} label="Profile" />
        </div>

        <button 
           onClick={() => handleOpenCreatorStudio()}
           className="bg-gradient-to-r from-neon-purple to-neon-pink text-white font-bold p-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-neon-purple/20 hover:scale-105 transition-transform"
        >
            <PlusCircle size={24} />
            <span className="hidden lg:inline">Post Drama</span>
        </button>

        <div className="pt-4 border-t border-gray-900 mt-auto flex flex-col gap-2">
            <button className="flex items-center gap-4 p-3 text-gray-500 hover:text-white transition-colors">
                <Settings size={22} />
                <span className="hidden lg:inline text-sm">Settings</span>
            </button>
            <button onClick={handleLogout} className="flex items-center gap-4 p-3 text-red-500/70 hover:text-red-500 transition-colors">
                <LogOut size={22} />
                <span className="hidden lg:inline text-sm">Log Out</span>
            </button>
        </div>
      </nav>

      {/* MAIN VIEW AREA */}
      <main className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
        {showInterstitial && <InterstitialAd onClose={() => setShowInterstitial(false)} />}
        
        {/* Content Container - Flex 1 handles taking up space between optional player and navbar */}
        <div className="flex-1 relative min-h-0">
            {renderContent()}
        </div>

        {/* MINI PLAYER (ABSOLUTE BOTTOM-FLOATING) */}
        {currentTrack && activeTab !== TabView.FEED && (
          <div className="absolute bottom-[80px] md:bottom-6 left-4 right-4 bg-gray-900/95 backdrop-blur-xl border border-gray-800 p-3 rounded-2xl flex items-center justify-between px-6 z-[60] shadow-2xl">
              <div className="flex items-center gap-4 overflow-hidden">
                  <div className={`w-12 h-12 rounded-lg bg-gray-800 overflow-hidden shadow-lg ${isMusicPlaying ? 'animate-spin-slow' : ''}`}>
                      <img src={currentTrack.coverUrl} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                      <p className="font-bold text-sm text-white truncate">{currentTrack.title}</p>
                      <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                  <button onClick={() => setIsMusicPlaying(!isMusicPlaying)} className="text-white hover:scale-110 transition-transform bg-white/10 p-2 rounded-full">
                      {isMusicPlaying ? <Pause fill="white" size={24} /> : <Play fill="white" size={24} />}
                  </button>
                  <button onClick={() => { setIsMusicPlaying(false); setCurrentTrack(null); }} className="text-gray-500 hover:text-white">
                      <X size={24} />
                  </button>
              </div>
          </div>
        )}

        {/* MOBILE BOTTOM NAV - Fixed Height, Shrink 0 ensures it's never compressed */}
        <div className="md:hidden h-[70px] bg-black/95 backdrop-blur-md border-t border-gray-900 flex justify-around items-center px-2 pb-safe z-50 shrink-0">
          <button onClick={() => setActiveTab(TabView.FEED)} className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeTab === TabView.FEED ? 'text-white' : 'text-gray-500'}`}><Home size={22} /><span className="text-[10px]">Home</span></button>
          <button onClick={() => setActiveTab(TabView.SOCIAL)} className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeTab === TabView.SOCIAL ? 'text-white' : 'text-gray-500'}`}><Globe size={22} /><span className="text-[10px]">Social</span></button>
          <button onClick={() => handleOpenCreatorStudio()} className="flex flex-col items-center justify-center -mt-6"><div className="w-14 h-14 bg-gradient-to-tr from-neon-purple to-neon-pink rounded-full flex items-center justify-center shadow-lg border-4 border-black"><PlusCircle size={28} className="text-white" /></div></button>
          <button onClick={() => setActiveTab(TabView.MUSIC)} className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeTab === TabView.MUSIC ? 'text-white' : 'text-gray-500'}`}><Music size={22} /><span className="text-[10px]">Music</span></button>
          <button onClick={() => setActiveTab(TabView.PROFILE)} className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeTab === TabView.PROFILE ? 'text-white' : 'text-gray-500'}`}><UserIcon size={22} /><span className="text-[10px]">Profile</span></button>
        </div>
      </main>
    </div>
  );
}
