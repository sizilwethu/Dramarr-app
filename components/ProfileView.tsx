
import React, { useState, useEffect, useRef } from 'react';
import { User, Video, Series, AdCampaign, CATEGORIES } from '../types';
import { api } from '../services/api';
import { Settings, Edit2, Grid as GridIcon, Folder, CreditCard, Shield, ChevronRight, DollarSign, Wallet, Play, FileText, HelpCircle, ArrowLeft, LogOut, User as UserIcon, Camera, Trash2, X, Megaphone, Target, Clock, BarChart3, ExternalLink, Activity, AlertCircle, Lock, Scale, Video as VideoIcon, ChevronLeft } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  videos: Video[];
  series: Series[];
  onLogout: () => void;
  onOpenAdmin: () => void;
  onUpdateUser: (data: Partial<User>) => void;
  onDeleteAccount: () => void;
  onDeleteVideo: (id: string) => void;
  onRemoveProfilePic: () => void;
  onOpenAnalytics: () => void;
  viewingUserId?: string;
  onBack?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user: currentUser, videos, series, onLogout, onOpenAdmin, onUpdateUser, onDeleteAccount, onDeleteVideo, onRemoveProfilePic, onOpenAnalytics, viewingUserId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'series'>('grid');
  const [profileUser, setProfileUser] = useState<User>(currentUser);
  const isOwnProfile = !viewingUserId || viewingUserId === currentUser.id;

  const userVideos = videos.filter(v => v.creatorId === profileUser.id);
  const userSeries = series.filter(s => s.creatorId === profileUser.id);

  useEffect(() => {
      if (viewingUserId && viewingUserId !== currentUser.id) api.getUserProfile(viewingUserId).then(u => { if(u) setProfileUser(u); });
      else setProfileUser(currentUser);
  }, [viewingUserId, currentUser]);

  return (
    <div className="h-full bg-black md:pt-10 pb-20 flex flex-col animate-fade-in max-w-6xl mx-auto w-full overflow-y-auto">
      
      {/* Back Button for non-root profile views */}
      {!isOwnProfile && (
          <div className="px-6 md:px-12 mb-4">
              <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                  <ChevronLeft size={24} /> <span className="font-bold">Back</span>
              </button>
          </div>
      )}

      <div className="px-6 md:px-12 mb-10 flex flex-col md:flex-row items-center md:items-start gap-8 shrink-0">
        <div className="relative shrink-0">
            <img src={profileUser.avatarUrl} className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-neon-purple object-cover shadow-2xl" />
            {profileUser.isVerified && <div className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-black text-xs font-bold">✓</div>}
        </div>
        
        <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h2 className="text-3xl font-black text-white">@{profileUser.username}</h2>
                <div className="flex gap-3 justify-center">
                    {isOwnProfile ? (
                        <>
                            <button className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 py-2 rounded-xl text-sm transition-all">Edit Profile</button>
                            <button onClick={onOpenAnalytics} className="bg-purple-900/40 text-purple-400 font-bold px-6 py-2 rounded-xl text-sm border border-purple-500/30 flex items-center gap-2 hover:bg-purple-900/60 transition-all"><BarChart3 size={16}/> Analytics</button>
                        </>
                    ) : (
                        <button className="bg-neon-pink text-white font-bold px-10 py-2 rounded-xl text-sm shadow-lg shadow-neon-pink/20 hover:scale-105 transition-transform">Follow</button>
                    )}
                </div>
            </div>
            
            <div className="flex justify-center md:justify-start gap-8 mb-6">
                <div className="flex gap-2 items-baseline"><span className="font-black text-xl text-white">{profileUser.followers}</span><span className="text-gray-500 text-sm">followers</span></div>
                <div className="flex gap-2 items-baseline"><span className="font-black text-xl text-white">{profileUser.following.length}</span><span className="text-gray-500 text-sm">following</span></div>
                <div className="flex gap-2 items-baseline"><span className="font-black text-xl text-white">12.5k</span><span className="text-gray-500 text-sm">likes</span></div>
            </div>
            
            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">{profileUser.bio || "No bio yet."}</p>
        </div>
      </div>

      <div className="flex border-t border-gray-900 shrink-0 sticky top-0 bg-black z-20">
        <button className={`flex-1 py-5 flex items-center justify-center gap-3 transition-all ${activeTab === 'grid' ? 'border-b-2 border-white text-white bg-white/5' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setActiveTab('grid')}><GridIcon size={20} /> <span className="font-bold uppercase tracking-widest text-xs">Episodes</span></button>
        <button className={`flex-1 py-5 flex items-center justify-center gap-3 transition-all ${activeTab === 'series' ? 'border-b-2 border-white text-white bg-white/5' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setActiveTab('series')}><Folder size={20} /> <span className="font-bold uppercase tracking-widest text-xs">Series</span></button>
      </div>

      <div className="flex-1 bg-black p-4">
        {activeTab === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {userVideos.map(v => (
                    <div key={v.id} className="relative aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden group cursor-pointer border border-gray-800 shadow-lg">
                         <img src={v.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                             <div className="flex items-center gap-2 text-white font-bold text-xs"><Play size={12} fill="white" /> {v.likes} likes</div>
                         </div>
                    </div>
                ))}
            </div>
        ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {userSeries.map(s => (
                     <div key={s.id} className="bg-gray-900/40 rounded-3xl overflow-hidden border border-gray-800 hover:bg-gray-800 transition-all cursor-pointer group flex">
                         <div className="w-32 aspect-[3/4] relative shrink-0">
                             <img src={s.coverUrl} className="w-full h-full object-cover" />
                         </div>
                         <div className="p-6 flex flex-col justify-center min-w-0">
                             <h4 className="font-bold text-white text-xl truncate mb-1 group-hover:text-neon-purple transition-colors">{s.title}</h4>
                             <p className="text-gray-500 text-sm mb-2">{s.category} • {s.totalEpisodes} Episodes</p>
                             <div className="bg-gray-800/50 w-fit px-3 py-1 rounded-full text-[10px] text-gray-400 font-bold uppercase tracking-widest">{s.year}</div>
                         </div>
                     </div>
                 ))}
             </div>
        )}
      </div>
    </div>
  );
};
