
import React, { useState, useEffect, useRef } from 'react';
import { User, TabView, Video, Series, AICharacter } from '../types';
import { api } from '../services/api';
import { AuthScreen } from '../components/AuthScreen';
import { SocialView } from '../components/SocialView';
import { ProfileView } from '../components/ProfileView';
import { ExploreView } from '../components/ExploreView';
import { CreatorStudio } from '../components/CreatorStudio';
import { VideoPlayer } from '../components/VideoPlayer';
import { DriveView } from '../components/DriveView';
import { WalletView } from '../components/WalletView';
import { AdCenter } from '../components/AdCenter';
import { AdminPanel } from '../components/AdminPanel';
import { CharacterChat } from '../components/CharacterChat';
import { MusicView } from '../components/MusicView';
import { DailyRewardView } from '../components/DailyRewardView';
import { InterstitialAd } from '../components/InterstitialAd';
import { Home, Compass, PlusSquare, MessageCircle, User as UserIcon, Loader2 } from 'lucide-react';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabView>(TabView.AUTH);
  const [videos, setVideos] = useState<Video[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Feed State
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  // Navigation State
  const [targetCharacter, setTargetCharacter] = useState<AICharacter | null>(null);
  const [targetPartner, setTargetPartner] = useState<any>(null); // For direct messaging
  
  // Modals & Overlays
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (user) {
      loadContent();
      // Show daily reward occasionally (mock logic)
      if (Math.random() > 0.8) setShowDailyReward(true);
    }
  }, [user]);

  const checkSession = async () => {
    setIsLoading(true);
    const currentUser = await api.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setActiveTab(TabView.FEED);
    } else {
      setActiveTab(TabView.AUTH);
    }
    setIsLoading(false);
  };

  const loadContent = async () => {
    const [vids, sers] = await Promise.all([
      api.getVideos(),
      api.getSeries()
    ]);
    setVideos(vids);
    setSeries(sers);
    if (vids.length > 0) setActiveVideoId(vids[0].id);
  };

  const handleLogin = async (email?: string, password?: string, isSignUp?: boolean, username?: string, additionalData?: any) => {
    setIsLoading(true);
    try {
      if (isSignUp && email && password && username) {
        await api.signUp(email, password, username, additionalData);
      } else if (email && password) {
        await api.signIn(email, password);
      }
      await checkSession();
    } catch (e) {
      console.error("Auth error", e);
      alert("Authentication failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.signOut();
    setUser(null);
    setActiveTab(TabView.AUTH);
  };

  const handleScroll = () => {
    if (!feedContainerRef.current) return;
    
    // Simple logic to find center video
    const container = feedContainerRef.current;
    const center = container.scrollTop + container.clientHeight / 2;
    
    const videoElements = container.querySelectorAll('[data-video-id]');
    let closestId = activeVideoId;
    let minDiff = Infinity;

    videoElements.forEach((el: any) => {
      const rect = el.getBoundingClientRect();
      // Adjust for container offset if necessary, but since it's snap-scroll, checking offsetTop usually works
      const elCenter = el.offsetTop + el.offsetHeight / 2;
      const diff = Math.abs(center - elCenter);
      
      if (diff < minDiff) {
        minDiff = diff;
        closestId = el.getAttribute('data-video-id');
      }
    });

    if (closestId !== activeVideoId) {
      setActiveVideoId(closestId);
    }
  };

  const handleToggleFollow = async (followingId: string) => {
    if (!user) return;
    const isNowFollowing = await api.toggleFollow(user.id, followingId);
    if (isNowFollowing !== undefined) {
        const newFollowing = isNowFollowing 
            ? [...user.following, followingId] 
            : user.following.filter(id => id !== followingId);
        setUser({ ...user, following: newFollowing });
    }
  };

  const handleOpenProfile = (userId: string) => {
      // In a real app, this would change view to a Public Profile View
      console.log("Navigate to profile:", userId);
  };

  const renderFeed = () => (
    <div 
      ref={feedContainerRef} 
      className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black"
      onScroll={handleScroll}
    >
      {videos.map((video) => (
        <div key={video.id} data-video-id={video.id} className="h-full w-full snap-start relative">
          <VideoPlayer 
            video={video}
            isActive={activeVideoId === video.id}
            isUnlocked={!video.isLocked || (user?.unlockedVideoIds?.includes(video.id) ?? false)}
            onUnlock={async (cost) => {
              if (user && user.credits >= cost) {
                // Mock unlock logic
                const newCredits = user.credits - cost;
                const newUnlocked = [...(user.unlockedVideoIds || []), video.id];
                await api.updateProfile(user.id, { credits: newCredits, unlockedVideoIds: newUnlocked });
                setUser({ ...user, credits: newCredits, unlockedVideoIds: newUnlocked });
              } else {
                alert("Not enough credits!");
              }
            }}
            onWatchAd={() => setShowInterstitial(true)}
            isFollowing={user?.following?.includes(video.creatorId) ?? false}
            onToggleFollow={() => handleToggleFollow(video.creatorId)}
            isOwner={user?.id === video.creatorId}
            onDelete={() => api.deleteVideo(video.id)}
            allSeriesVideos={video.seriesId ? videos.filter(v => v.seriesId === video.seriesId) : []}
            currentUser={user!}
            onOpenProfile={handleOpenProfile}
          />
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-full w-full bg-black flex items-center justify-center">
        <Loader2 className="text-neon-purple animate-spin" size={48} />
      </div>
    );
  }

  if (activeTab === TabView.AUTH || !user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // Interstitial Ad Overlay
  if (showInterstitial) {
    return <InterstitialAd onClose={() => {
      setShowInterstitial(false);
      // Give reward
      const newCredits = (user.credits || 0) + 1;
      api.updateProfile(user.id, { credits: newCredits });
      setUser({ ...user, credits: newCredits });
    }} />;
  }

  return (
    <div className="h-full w-full bg-black flex flex-col relative overflow-hidden">
      
      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {activeTab === TabView.FEED && renderFeed()}
        
        {activeTab === TabView.EXPLORE && (
          <ExploreView 
            currentUser={user}
            onBack={() => setActiveTab(TabView.FEED)}
            onOpenCharacterChat={(char) => {
              setTargetCharacter(char);
              setActiveTab(TabView.CHARACTER_CHAT);
            }}
            onUpdateUser={(data) => setUser({ ...user, ...data })}
          />
        )}
        
        {activeTab === TabView.SOCIAL && (
          <SocialView 
            currentUser={user} 
            stories={[]} 
            posts={[]} 
            onDeletePost={() => {}} 
            onDeleteStory={() => {}} 
            onBack={() => setActiveTab(TabView.FEED)} 
            initialPartner={targetPartner}
            onClearTarget={() => setTargetPartner(null)}
            onOpenProfile={handleOpenProfile}
            onToggleFollow={handleToggleFollow}
          />
        )}

        {activeTab === TabView.UPLOAD && (
          <CreatorStudio 
            user={user} 
            videos={videos} 
            onClose={() => setActiveTab(TabView.FEED)} 
            onBack={() => setActiveTab(TabView.FEED)}
            onVideoUploaded={loadContent}
          />
        )}

        {activeTab === TabView.PROFILE && (
          <ProfileView 
            user={user} 
            currentUser={user}
            isCurrentUser={true}
            videos={videos}
            series={series}
            onBack={() => setActiveTab(TabView.FEED)}
            onLogout={handleLogout}
            onUpdateUser={(data) => setUser({ ...user, ...data })}
            onDeleteAccount={() => alert("Account deletion not implemented in demo")}
            onDeleteVideo={(id) => api.deleteVideo(id)}
            onRemoveProfilePic={() => {}}
            onOpenAdmin={() => setActiveTab(TabView.ADMIN)}
            onOpenAds={() => setActiveTab(TabView.ADS)}
            onOpenRides={() => setActiveTab(TabView.RIDES)}
            onOpenAnalytics={() => {}}
          />
        )}

        {/* Sub-Views / Full Screen Modules */}
        {activeTab === TabView.RIDES && (
          <DriveView 
            user={user} 
            onUpdateUser={(data) => setUser({ ...user, ...data })} 
            onBack={() => setActiveTab(TabView.FEED)} 
          />
        )}

        {activeTab === TabView.WALLET && (
          <WalletView 
            user={user} 
            onUpdateUser={(data) => setUser({ ...user, ...data })} 
            onBack={() => setActiveTab(TabView.PROFILE)} 
          />
        )}

        {activeTab === TabView.ADS && (
          <AdCenter 
            user={user} 
            onBack={() => setActiveTab(TabView.PROFILE)} 
          />
        )}

        {activeTab === TabView.ADMIN && (
          <AdminPanel 
            user={user} 
            onBack={() => setActiveTab(TabView.PROFILE)} 
          />
        )}

        {activeTab === TabView.MUSIC && (
          <MusicView 
            currentTrack={null}
            isPlaying={false}
            onPlayTrack={() => {}}
            onPauseTrack={() => {}}
            currentUser={user}
            onBack={() => setActiveTab(TabView.FEED)}
          />
        )}
        
        {activeTab === TabView.CHARACTER_CHAT && targetCharacter && (
          <CharacterChat 
            character={targetCharacter} 
            currentUser={user} 
            onBack={() => setActiveTab(TabView.EXPLORE)} 
          />
        )}
      </div>

      {/* Daily Reward Overlay */}
      {showDailyReward && (
        <div className="absolute inset-0 z-[150]">
          <DailyRewardView 
            user={user} 
            videos={videos} 
            onClose={() => setShowDailyReward(false)} 
            onPlayVideo={() => setShowDailyReward(false)} 
            onWatchAd={() => setShowInterstitial(true)}
          />
        </div>
      )}

      {/* Bottom Navigation */}
      {[TabView.FEED, TabView.EXPLORE, TabView.SOCIAL, TabView.PROFILE, TabView.MUSIC].includes(activeTab) && (
        <div className="absolute bottom-0 left-0 right-0 h-[80px] bg-black border-t border-white/10 flex justify-around items-center pb-4 z-50">
          <button onClick={() => setActiveTab(TabView.FEED)} className={`flex flex-col items-center gap-1 ${activeTab === TabView.FEED ? 'text-white' : 'text-gray-500'}`}>
            <Home size={24} strokeWidth={activeTab === TabView.FEED ? 3 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Feed</span>
          </button>
          
          <button onClick={() => setActiveTab(TabView.EXPLORE)} className={`flex flex-col items-center gap-1 ${activeTab === TabView.EXPLORE ? 'text-white' : 'text-gray-500'}`}>
            <Compass size={24} strokeWidth={activeTab === TabView.EXPLORE ? 3 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Explore</span>
          </button>

          <button onClick={() => setActiveTab(TabView.UPLOAD)} className="mb-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-neon-purple to-neon-pink rounded-2xl flex items-center justify-center shadow-lg shadow-neon-purple/30 hover:scale-105 transition-transform">
              <PlusSquare size={28} className="text-white" fill="white" />
            </div>
          </button>

          <button onClick={() => setActiveTab(TabView.SOCIAL)} className={`flex flex-col items-center gap-1 ${activeTab === TabView.SOCIAL ? 'text-white' : 'text-gray-500'}`}>
            <MessageCircle size={24} strokeWidth={activeTab === TabView.SOCIAL ? 3 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Social</span>
          </button>

          <button onClick={() => setActiveTab(TabView.PROFILE)} className={`flex flex-col items-center gap-1 ${activeTab === TabView.PROFILE ? 'text-white' : 'text-gray-500'}`}>
            <UserIcon size={24} strokeWidth={activeTab === TabView.PROFILE ? 3 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Profile</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;