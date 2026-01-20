
import React, { useState, useEffect, useRef } from 'react';
import { Home, Globe, PlusCircle, Compass, User as UserIcon, Navigation, Wallet, Settings, RotateCcw, Plus } from 'lucide-react';
import { TabView, User, Video, SocialPost, Story, Series, MusicTrack, AICharacter } from './types';
import { MOCK_SERIES, MOCK_VIDEOS, MOCK_SOCIAL_POSTS, MOCK_STORIES, MOCK_MUSIC_TRACKS } from './services/mockData';

// Components
import { AuthScreen } from './components/AuthScreen';
import { VideoPlayer } from './components/VideoPlayer';
import { SocialView } from './components/SocialView';
import { ProfileView } from './components/ProfileView';
import { CreatorStudio } from './components/CreatorStudio';
import { ExploreView } from './components/ExploreView';
import { MusicView } from './components/MusicView';
import { CharacterChat } from './components/CharacterChat';
import { SwiftRideHome } from './components/SwiftRideHome';
import { WalletView } from './components/WalletView';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabView>(TabView.AUTH);
  const [isLoading, setIsLoading] = useState(true);
  
  // Drama App State
  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS);
  const [activeCharacter, setActiveCharacter] = useState<AICharacter | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulated load
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (email?: string, password?: string) => {
    const mockUser: User = {
      id: 'u_1',
      username: 'Alex_Drama',
      email: email || 'alex@swiftride.com',
      avatarUrl: 'https://i.pravatar.cc/150?u=alex',
      isVerified: true,
      isAdmin: true,
      walletBalance: 250.00,
      coins: 1250,
      following: ['u2'],
      followers: 450,
      unlockedVideoIds: ['v1'],
      isDriver: false,
      driverStatus: 'none',
      onlineStatus: 'offline',
      driverRating: 4.9,
      joinDate: new Date().toISOString(),
      subscriptionStatus: 'premium'
    };
    setUser(mockUser);
    setActiveTab(TabView.FEED);
  };

  const handleScroll = () => {
    if (feedContainerRef.current) {
      const { scrollTop, clientHeight } = feedContainerRef.current;
      const index = Math.round(scrollTop / clientHeight);
      if (index !== currentVideoIndex) setCurrentVideoIndex(index);
    }
  };

  const renderContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case TabView.FEED:
        return (
          <div className="h-full w-full bg-black overflow-hidden flex flex-col">
            <div ref={feedContainerRef} onScroll={handleScroll} className="h-full w-full overflow-y-scroll snap-y snap-mandatory bg-black no-scrollbar">
              {videos.map((video, index) => (
                <div key={video.id} className="h-full w-full snap-start flex justify-center bg-black">
                  <VideoPlayer 
                    video={video}
                    isActive={index === currentVideoIndex && activeTab === TabView.FEED}
                    isUnlocked={!video.isLocked || user.unlockedVideoIds?.includes(video.id) || false}
                    onUnlock={() => {}}
                    onWatchAd={() => {}}
                    isFollowing={false}
                    onToggleFollow={() => {}}
                    isOwner={user.id === video.creatorId}
                    onDelete={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      case TabView.RIDES: return <SwiftRideHome user={user} onUpdateUser={(d) => setUser({...user, ...d})} />;
      case TabView.SOCIAL: return <SocialView currentUser={user} stories={MOCK_STORIES} posts={MOCK_SOCIAL_POSTS} onDeletePost={() => {}} onDeleteStory={() => {}} onBack={() => setActiveTab(TabView.FEED)} />;
      case TabView.EXPLORE: return <ExploreView onBack={() => setActiveTab(TabView.FEED)} onOpenCharacterChat={(char) => { setActiveCharacter(char); setActiveTab(TabView.CHARACTER_CHAT); }} />;
      case TabView.CHARACTER_CHAT: return activeCharacter ? <CharacterChat character={activeCharacter} currentUser={user} onBack={() => setActiveTab(TabView.EXPLORE)} /> : null;
      case TabView.MUSIC: return <MusicView currentTrack={null} isPlaying={false} onPlayTrack={() => {}} onPauseTrack={() => {}} currentUser={user} onBack={() => setActiveTab(TabView.FEED)} />;
      case TabView.WALLET: return <WalletView user={user} onUpdateUser={(d) => setUser({...user, ...d})} onBack={() => setActiveTab(TabView.PROFILE)} />;
      case TabView.PROFILE: return <ProfileView user={user} videos={videos} series={MOCK_SERIES} onLogout={() => setUser(null)} onOpenAdmin={() => setActiveTab(TabView.ADMIN)} onUpdateUser={(d) => setUser({...user, ...d})} onDeleteAccount={() => {}} onDeleteVideo={() => {}} onRemoveProfilePic={() => {}} onOpenAnalytics={() => {}} onOpenAds={() => {}} onBack={() => setActiveTab(TabView.FEED)} />;
      case TabView.UPLOAD: return <CreatorStudio onClose={() => setActiveTab(TabView.FEED)} user={user} videos={videos} onBack={() => setActiveTab(TabView.FEED)} />;
      case TabView.ADMIN: return <AdminPanel user={user} onBack={() => setActiveTab(TabView.PROFILE)} />;
      default: return null;
    }
  };

  if (isLoading) return <div className="h-screen w-full bg-black flex items-center justify-center text-white font-black italic animate-pulse">dramarr</div>;
  if (!user || activeTab === TabView.AUTH) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="h-[100dvh] w-full bg-black text-white flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <nav className="hidden md:flex flex-col w-20 lg:w-64 border-r border-white/10 p-4 gap-6 bg-black shrink-0">
        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-pink italic px-3 py-4">dramarr</h1>
        <div className="flex-1 flex flex-col gap-2">
            {[
                { tab: TabView.FEED, icon: Home, label: 'Feed' },
                { tab: TabView.EXPLORE, icon: Compass, label: 'Explore' },
                { tab: TabView.RIDES, icon: Navigation, label: 'SwiftRide' },
                { tab: TabView.SOCIAL, icon: Globe, label: 'Social' },
                { tab: TabView.MUSIC, icon: MusicView, label: 'Music' },
                { tab: TabView.PROFILE, icon: UserIcon, label: 'Profile' },
            ].map(item => (
                <button 
                  key={item.tab} 
                  onClick={() => setActiveTab(item.tab)} 
                  className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${activeTab === item.tab ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                >
                    {/* Hack to handle MusicView as an icon */}
                    {item.tab === TabView.MUSIC ? <Home size={24}/> : <item.icon size={24} />}
                    <span className="hidden lg:inline text-sm font-bold uppercase tracking-widest">{item.label}</span>
                </button>
            ))}
        </div>
        <button 
          onClick={() => setActiveTab(TabView.UPLOAD)}
          className="bg-gradient-to-tr from-neon-purple to-neon-pink p-4 rounded-2xl font-black uppercase text-xs tracking-tighter flex items-center justify-center gap-2"
        >
          <PlusCircle size={20} /> Post Drama
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 relative min-h-0">
          {renderContent()}
        </div>

        {/* Bottom Nav - Mobile */}
        <div className="md:hidden h-20 bg-black/80 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center px-2 pb-safe z-[60] shrink-0">
          <button onClick={() => setActiveTab(TabView.FEED)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === TabView.FEED ? 'text-neon-pink scale-110' : 'text-gray-500'}`}>
            <Home size={22} fill={activeTab === TabView.FEED ? 'currentColor' : 'none'} />
            <span className="text-[8px] font-black uppercase">Home</span>
          </button>
          <button onClick={() => setActiveTab(TabView.RIDES)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === TabView.RIDES ? 'text-blue-500 scale-110' : 'text-gray-500'}`}>
            <Navigation size={22} fill={activeTab === TabView.RIDES ? 'currentColor' : 'none'} />
            <span className="text-[8px] font-black uppercase">Rides</span>
          </button>
          <button onClick={() => setActiveTab(TabView.UPLOAD)} className="flex items-center justify-center -mt-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-neon-purple to-neon-pink rounded-2xl flex items-center justify-center shadow-lg shadow-neon-purple/20 border-4 border-black">
              <Plus size={28} className="text-white" />
            </div>
          </button>
          <button onClick={() => setActiveTab(TabView.SOCIAL)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === TabView.SOCIAL ? 'text-neon-purple scale-110' : 'text-gray-500'}`}>
            <Globe size={22} />
            <span className="text-[8px] font-black uppercase">Social</span>
          </button>
          <button onClick={() => setActiveTab(TabView.PROFILE)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === TabView.PROFILE ? 'text-white scale-110' : 'text-gray-500'}`}>
            <UserIcon size={22} fill={activeTab === TabView.PROFILE ? 'currentColor' : 'none'} />
            <span className="text-[8px] font-black uppercase">Me</span>
          </button>
        </div>
      </main>
    </div>
  );
}
