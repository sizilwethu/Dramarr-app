
import React, { useState, useEffect, useRef } from 'react';
import { Home, Globe, PlusCircle, Compass, User as UserIcon, Gift, Music, Play, Pause, X, LayoutGrid, Settings, LogOut, Search, RotateCcw, Car } from 'lucide-react';
import { App as CapApp } from '@capacitor/app';
import { supabase } from './lib/supabaseClient';
import { api } from './services/api';

// Types and Data
import { User, Video, TabView, SocialPost, Story, Series, MusicTrack, AICharacter } from './types';
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
import { AdCenter } from './components/AdCenter';
import { CharacterChat } from './components/CharacterChat';
import { DriveView } from './components/DriveView';

const PERSISTENCE_KEY_TAB = 'dramarr_active_tab';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabView>(() => {
    const saved = localStorage.getItem(PERSISTENCE_KEY_TAB);
    return (saved as TabView) || TabView.AUTH;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCharacter, setActiveCharacter] = useState<AICharacter | null>(null);
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [series, setSeries] = useState<Series[]>(MOCK_SERIES);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  
  const [feedTab, setFeedTab] = useState<'foryou' | 'following'>('foryou');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  const [studioMode, setStudioMode] = useState<'episode' | 'series' | 'analytics' | 'ai-writer'>('episode');
  const [showInterstitial, setShowInterstitial] = useState(false);

  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  useEffect(() => {
    if (activeTab !== TabView.AUTH) {
      localStorage.setItem(PERSISTENCE_KEY_TAB, activeTab);
    }
  }, [activeTab]);

  const nestedStateRef = useRef({
    hasActiveChat: false,
    setHasActiveChat: (val: boolean) => { nestedStateRef.current.hasActiveChat = val; }
  });

  useEffect(() => {
    const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (activeTab === TabView.CHARACTER_CHAT) {
        setActiveTab(TabView.EXPLORE);
      } else if (activeTab !== TabView.FEED && activeTab !== TabView.AUTH) {
        setActiveTab(TabView.FEED);
      }
    });
    return () => { backListener.then(l => l.remove()); };
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
            } else { setActiveTab(TabView.AUTH); }
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };
    checkSession();
  }, []);

  const loadContent = async () => {
      try {
          const realVideos = await api.getVideos();
          const demoVideos = realVideos.length > 0 ? [...realVideos] : [...MOCK_SOCIAL_POSTS.map((p,i) => ({ ...MOCK_VIDEO_ADS[0], id: `v_${i}`, description: p.content } as any))];
          if (demoVideos[0]) {
              demoVideos[0].choices = [
                  { label: "Forgive Him", targetVideoId: demoVideos[1]?.id || demoVideos[0].id },
                  { label: "Walk Away", targetVideoId: demoVideos[2]?.id || demoVideos[0].id }
              ];
          }
          setVideos(demoVideos);
          const realSeries = await api.getSeries();
          if (realSeries.length > 0) setSeries(realSeries);
          await refreshSocialContent();
      } catch (e) { console.error(e); }
  };

  const handleManualRefresh = async () => {
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
          if (isMusicPlaying) audio.play().catch(e => console.log(e));
          else audio.pause();
      } else audio.pause();
  }, [currentTrack, isMusicPlaying]);

  const handleLogin = async (email?: string, password?: string, isSignUp?: boolean, username?: string, additionalData?: any) => {
    try {
        if (!email || !password) return;
        setIsLoading(true);
        if (isSignUp && username) {
            await api.signUp(email, password, username, additionalData);
            alert("Account created!");
        } else {
            await api.signIn(email, password);
            const currentUser = await api.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                await loadContent();
                setActiveTab(TabView.FEED);
            }
        }
    } catch (error: any) { alert(error.message); } finally { setIsLoading(false); }
  };

  const handleScroll = () => {
    if (feedContainerRef.current) {
      const { scrollTop, clientHeight } = feedContainerRef.current;
      const index = Math.round(scrollTop / clientHeight);
      if (index !== currentVideoIndex) setCurrentVideoIndex(index);
    }
  };

  const scrollToVideo = (index: number) => {
      if (feedContainerRef.current) {
          const clientHeight = feedContainerRef.current.clientHeight;
          feedContainerRef.current.scrollTo({ top: index * clientHeight, behavior: 'smooth' });
          setCurrentVideoIndex(index);
      }
  };

  if (isLoading) return <div className="h-[100dvh] w-full bg-black flex items-center justify-center text-white font-black uppercase tracking-widest animate-pulse">dramarr</div>;
  if (!user || activeTab === TabView.AUTH) return <AuthScreen onLogin={handleLogin} />;

  const NavItem = ({ tab, icon: Icon, label }: { tab: TabView, icon: any, label: string }) => (
    <button onClick={() => setActiveTab(tab)} className={`flex items-center gap-4 p-3 rounded-xl transition-all w-full ${activeTab === tab ? 'bg-neon-purple/10 text-white font-bold' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'}`}><Icon size={24} strokeWidth={activeTab === tab ? 3 : 2} /><span className="hidden lg:inline text-base font-black uppercase tracking-tight">{label}</span></button>
  );

  const goHome = () => setActiveTab(TabView.FEED);

  const renderContent = () => {
    switch (activeTab) {
      case TabView.FEED:
        return (
          <div className="relative h-full w-full bg-black overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 right-0 z-50 pt-12 md:pt-6 flex justify-center items-center px-4 text-white pointer-events-none">
                  <div className="flex gap-4 pointer-events-auto items-center bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                      <button onClick={() => setFeedTab('following')} className={`font-black uppercase tracking-widest text-[11px] transition-opacity ${feedTab === 'following' ? 'text-white' : 'text-gray-500'}`}>Following</button>
                      <button onClick={() => setFeedTab('foryou')} className={`font-black uppercase tracking-widest text-[11px] transition-opacity ${feedTab === 'foryou' ? 'text-white' : 'text-gray-500'}`}>For You</button>
                      <div className="w-px h-4 bg-white/20"></div>
                      <button onClick={handleManualRefresh} className={`text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`}><RotateCcw size={16} /></button>
                  </div>
              </div>
              <div ref={feedContainerRef} onScroll={handleScroll} className="h-full w-full overflow-y-scroll snap-y snap-mandatory bg-black no-scrollbar">
                {videos.map((video, index) => (
                    <div key={video.id} className="h-full w-full snap-start flex justify-center bg-black">
                        <div className="h-full w-full md:max-w-md border-x border-white/5 relative">
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
                                onChoiceSelected={(targetId) => {
                                    const nextIdx = videos.findIndex(v => v.id === targetId);
                                    if (nextIdx !== -1) scrollToVideo(nextIdx);
                                }}
                            />
                        </div>
                    </div>
                ))}
              </div>
          </div>
        );
      case TabView.SOCIAL: return <SocialView currentUser={user} stories={stories} posts={posts} onDeletePost={() => {}} onDeleteStory={() => {}} onRefresh={handleManualRefresh} onBack={goHome} onChatStateChange={nestedStateRef.current.setHasActiveChat} />;
      case TabView.EXPLORE: return <ExploreView onBack={goHome} onOpenCharacterChat={(char) => { setActiveCharacter(char); setActiveTab(TabView.CHARACTER_CHAT); }} />;
      case TabView.CHARACTER_CHAT: return activeCharacter ? <CharacterChat character={activeCharacter} currentUser={user} onBack={() => setActiveTab(TabView.EXPLORE)} /> : null;
      case TabView.MUSIC: return <MusicView currentTrack={currentTrack} isPlaying={isMusicPlaying} onPlayTrack={(t) => { setCurrentTrack(t); setIsMusicPlaying(true); }} onPauseTrack={() => setIsMusicPlaying(false)} currentUser={user} onBack={goHome} />;
      case TabView.UPLOAD: return <CreatorStudio onClose={() => { loadContent(); setActiveTab(TabView.FEED); }} user={user} videos={videos} initialMode={studioMode} onBack={goHome} />;
      case TabView.PROFILE: return <ProfileView user={user} videos={videos} series={series} onLogout={() => setUser(null)} onOpenAdmin={() => setActiveTab(TabView.ADMIN)} onUpdateUser={(d) => setUser({...user, ...d})} onDeleteAccount={() => {}} onDeleteVideo={() => {}} onRemoveProfilePic={() => {}} onOpenAnalytics={() => handleOpenCreatorStudio('analytics')} onOpenAds={() => setActiveTab(TabView.AD_CENTER)} onBack={goHome} />;
      case TabView.AD_CENTER: return <AdCenter user={user} onBack={() => setActiveTab(TabView.PROFILE)} />;
      case TabView.DRIVE: return <DriveView user={user} onUpdateUser={(d) => setUser({...user, ...d})} onBack={goHome} />;
      default: return null;
    }
  };

  const handleOpenCreatorStudio = (mode: 'episode' | 'series' | 'analytics' | 'ai-writer' = 'episode') => {
      setStudioMode(mode);
      setActiveTab(TabView.UPLOAD);
  };

  return (
    <div className="h-[100dvh] w-full bg-[#050505] text-white flex overflow-hidden">
      <nav className="hidden md:flex flex-col w-20 lg:w-64 border-r border-white/5 p-4 gap-8 bg-black shrink-0">
        <div className="px-3 py-4"><h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-pink hidden lg:block italic">dramarr</h1></div>
        <div className="flex-1 flex flex-col gap-2">
            <NavItem tab={TabView.FEED} icon={Home} label="Feed" />
            <NavItem tab={TabView.EXPLORE} icon={Compass} label="Explore" />
            <NavItem tab={TabView.DRIVE} icon={Car} label="Drive" />
            <NavItem tab={TabView.SOCIAL} icon={Globe} label="Social" />
            <NavItem tab={TabView.MUSIC} icon={Music} label="Music" />
            <NavItem tab={TabView.PROFILE} icon={UserIcon} label="Me" />
        </div>
        <button onClick={() => handleOpenCreatorStudio()} className="bg-gradient-to-r from-neon-purple to-neon-pink text-white font-black p-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-neon-purple/20 hover:scale-105 transition-transform uppercase text-xs tracking-widest"><PlusCircle size={20} /> Post Drama</button>
      </nav>
      <main className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 relative min-h-0">{renderContent()}</div>
        <div className="md:hidden h-[70px] bg-black/90 backdrop-blur-xl border-t border-white/5 flex justify-around items-center px-2 pb-safe z-50 shrink-0">
          <button onClick={() => setActiveTab(TabView.FEED)} className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeTab === TabView.FEED ? 'text-white' : 'text-gray-500'}`}><Home size={22} /><span className="text-[8px] font-black uppercase">Home</span></button>
          <button onClick={() => setActiveTab(TabView.DRIVE)} className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeTab === TabView.DRIVE ? 'text-white' : 'text-gray-500'}`}><Car size={22} /><span className="text-[8px] font-black uppercase">Drive</span></button>
          <button onClick={() => handleOpenCreatorStudio()} className="flex flex-col items-center justify-center -mt-6"><div className="w-14 h-14 bg-gradient-to-tr from-neon-purple to-neon-pink rounded-full flex items-center justify-center shadow-lg border-4 border-black"><PlusCircle size={28} className="text-white" /></div></button>
          <button onClick={() => setActiveTab(TabView.SOCIAL)} className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeTab === TabView.SOCIAL ? 'text-white' : 'text-gray-500'}`}><Globe size={22} /><span className="text-[8px] font-black uppercase">Social</span></button>
          <button onClick={() => setActiveTab(TabView.PROFILE)} className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeTab === TabView.PROFILE ? 'text-white' : 'text-gray-500'}`}><UserIcon size={22} /><span className="text-[8px] font-black uppercase">Me</span></button>
        </div>
      </main>
    </div>
  );
}
