
import React, { useState, useEffect } from 'react';
import { User, Video, Series, CATEGORIES } from '../types';
import { api } from '../services/api';
import { 
  Settings, Grid as GridIcon, Folder, Play, BarChart3, ChevronLeft, 
  LogOut, User as UserIcon, Camera, Trash2, X, Shield, Bell, 
  CreditCard, HelpCircle, ChevronRight, Globe, Lock, Mail, Save, CheckCircle,
  Calendar, MapPin, UserCheck, ShieldAlert, Megaphone, FileText, LockKeyhole, UserPlus, EyeOff,
  Sparkles
} from 'lucide-react';

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
  onOpenAds: () => void;
  viewingUserId?: string;
  onBack: () => void;
}

const SettingsModal = ({ user, onClose, onLogout, onUpdateUser }: { user: User, onClose: () => void, onLogout: () => void, onUpdateUser: (d: any) => void }) => {
  const [currentSubPage, setCurrentSubPage] = useState<string | null>(null);
  
  // Edit Profile States
  const [editUsername, setEditUsername] = useState(user.username);
  const [editBio, setEditBio] = useState(user.bio);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await api.updateProfile(user.id, { username: editUsername, bio: editBio });
      onUpdateUser({ username: editUsername, bio: editBio });
      setCurrentSubPage(null);
    } catch (e) {
      alert("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const SettingItem = ({ icon: Icon, label, value, onClick, color = "text-gray-400" }: any) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-gray-900/50 hover:bg-gray-800 transition-colors rounded-2xl mb-2 border border-white/5"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl bg-gray-800 ${color}`}>
          <Icon size={20} />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-white">{label}</p>
          {value && <p className="text-xs text-gray-500">{value}</p>}
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-600" />
    </button>
  );

  const renderSubPage = () => {
    switch (currentSubPage) {
      case 'profile':
        return (
          <div className="animate-fade-in">
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Username</label>
              <input 
                type="text" 
                value={editUsername}
                onChange={e => setEditUsername(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-neon-purple outline-none"
              />
            </div>
            <div className="mb-8">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Bio</label>
              <textarea 
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                rows={4}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-neon-purple outline-none resize-none"
              />
            </div>
            <button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full bg-neon-purple py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-neon-purple/80 transition-all disabled:opacity-50"
            >
              {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={20} />}
              Save Changes
            </button>
          </div>
        );
      case 'privacy':
        return (
          <div className="animate-fade-in text-gray-400 text-sm leading-relaxed space-y-8 pb-20">
            <div className="bg-gradient-to-br from-neon-purple/20 to-black border border-neon-purple/30 p-8 rounded-[40px] mb-8 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-neon-purple/10 rounded-full blur-3xl" />
                <h3 className="text-white font-black text-3xl uppercase tracking-tighter mb-2 italic">Privacy Sovereign</h3>
                <p className="text-[10px] text-neon-purple font-black uppercase tracking-[0.4em]">Charter v3.0 • Industrial Compliance</p>
                <div className="mt-6 flex gap-4">
                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[8px] font-black uppercase tracking-widest">GDPR Ready</div>
                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[8px] font-black uppercase tracking-widest">CCPA Shield</div>
                </div>
            </div>

            <section className="space-y-4">
                <h4 className="text-white font-black uppercase text-xs tracking-widest flex items-center gap-2 border-b border-gray-800 pb-2">
                    <Shield size={14} className="text-neon-purple" /> 1. Data Sovereignty & Identity
                </h4>
                <p>At **dramarr** (the "Platform"), we believe your data is an extension of your digital self. We operate on a **Zero-Knowledge-Adjacent** principle where data is only processed for the explicit purpose of cinematic delivery and social interaction.</p>
                <div className="bg-gray-900/50 p-4 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex items-start gap-2">
                        <LockKeyhole size={14} className="mt-1 text-gray-600" />
                        <p className="text-xs">All PII (Personally Identifiable Information) is encrypted using AES-256 at rest.</p>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h4 className="text-white font-black uppercase text-xs tracking-widest border-b border-gray-800 pb-2 flex items-center gap-2">
                    <Sparkles size={14} className="text-neon-pink" /> 2. AI & Generative Data Ethics
                </h4>
                <p>Our platform utilizes **Gemini 3 Pro** and **Flash** models. Your interactions with AI Characters and Voiceovers are handled as follows:</p>
                <ul className="list-disc pl-5 space-y-3">
                    <li><strong className="text-gray-300">Transient Processing:</strong> Prompt data is sent via secure TLS 1.3 tunnels to Google Cloud TPU clusters.</li>
                    <li><strong className="text-gray-300">Non-Training Policy:</strong> We explicitly opt-out of using your private chat data to train global foundational model weights.</li>
                    <li><strong className="text-gray-300">Mood Analytics:</strong> Public sentiment (comments/public posts) is aggregated and anonymized to calculate the "Global Community Mood" displayed in the Social Feed.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h4 className="text-white font-black uppercase text-xs tracking-widest border-b border-gray-800 pb-2 flex items-center gap-2">
                    <Camera size={14} className="text-blue-500" /> 3. Biometrics & Video Data
                </h4>
                <p>For Creator Verification and automated content moderation, we process visual signatures:</p>
                <div className="grid grid-cols-1 gap-3">
                    <div className="p-4 bg-gray-900/40 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black uppercase text-gray-300 mb-1">Facial Analysis</p>
                        <p className="text-[11px] leading-relaxed">Verification processes utilize facial vector mapping. Raw images are deleted within 24 hours after a successful identity match.</p>
                    </div>
                    <div className="p-4 bg-gray-900/40 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black uppercase text-gray-300 mb-1">Edge Cache</p>
                        <p className="text-[11px] leading-relaxed">Uploaded videos are distributed via edge nodes globally. Deleting a video triggers a global purge command across 45 countries.</p>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h4 className="text-white font-black uppercase text-xs tracking-widest border-b border-gray-800 pb-2 flex items-center gap-2">
                    <Globe size={14} className="text-green-500" /> 4. International Rights Hub
                </h4>
                <div className="space-y-4">
                    <div className="group border border-white/5 p-4 rounded-2xl hover:bg-white/5 transition-all">
                        <p className="font-bold text-white text-xs mb-1">GDPR (Europe)</p>
                        <p className="text-xs">You have the Right to Object, Right to Portability, and Right to be Forgotten. Request a full JSON export via the Help Center.</p>
                    </div>
                    <div className="group border border-white/5 p-4 rounded-2xl hover:bg-white/5 transition-all">
                        <p className="font-bold text-white text-xs mb-1">CCPA/CPRA (California)</p>
                        <p className="text-xs text-neon-pink font-bold">"Do Not Sell My Personal Information"</p>
                        <p className="text-xs mt-1">Dramarr does not sell data to third-party brokers. We only share with direct service processors (Cloud Infrastructure, Payments).</p>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h4 className="text-white font-black uppercase text-xs tracking-widest border-b border-gray-800 pb-2 flex items-center gap-2">
                    <EyeOff size={14} className="text-gray-500" /> 5. Third-Party Disclosures
                </h4>
                <p>We only transmit data to the following verified subcontractors:</p>
                <div className="text-[10px] font-bold text-gray-600 space-y-1 bg-black p-4 rounded-xl">
                    <p>• Google Cloud Platform (AI & Hosting)</p>
                    <p>• Supabase (Database Management)</p>
                    <p>• Stripe/PayPal (Financial Settlement)</p>
                    <p>• Vercel (Edge Distribution)</p>
                </div>
            </section>

            <div className="py-12 border-t border-gray-900 text-center">
                <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest mb-2">Authenticated Integrity Seal</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/30">
                    <CheckCircle size={12} className="text-green-500" />
                    <span className="text-[10px] text-green-500 font-black uppercase">Active Security Layer v11.4</span>
                </div>
            </div>
          </div>
        );
      case 'region':
        return (
          <div className="animate-fade-in space-y-2">
            {['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan'].map(c => (
              <button 
                key={c}
                onClick={() => { onUpdateUser({ country: c }); setCurrentSubPage(null); }}
                className={`w-full flex justify-between items-center p-4 rounded-xl transition-all ${user.country === c ? 'bg-neon-purple/20 border border-neon-purple/50 text-white' : 'bg-gray-900/50 text-gray-400 border border-transparent hover:bg-gray-800'}`}
              >
                <span className="font-bold">{c}</span>
                {user.country === c && <CheckCircle size={18} className="text-neon-purple" />}
              </button>
            ))}
          </div>
        );
      default:
        return (
          <>
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">Account</h3>
              <SettingItem icon={UserIcon} label="Edit Profile" value={`@${user.username}`} onClick={() => setCurrentSubPage('profile')} />
              <SettingItem icon={Mail} label="Email Address" value={user.email} />
              <SettingItem icon={Lock} label="Password & Security" />
              <SettingItem icon={Globe} label="Region & Language" value={user.country || "Not set"} onClick={() => setCurrentSubPage('region')} />
            </div>

            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">Notifications</h3>
              <SettingItem icon={Bell} label="Push Notifications" value="Enabled" />
            </div>

            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">Legal & Compliance</h3>
              <SettingItem icon={Shield} label="Privacy Charter" onClick={() => setCurrentSubPage('privacy')} />
              <SettingItem icon={FileText} label="Terms of Service" />
              <SettingItem icon={UserPlus} label="Data Request (GDPR)" />
            </div>

            <div className="mt-12 space-y-3">
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-2xl transition-all border border-red-500/20"
              >
                <LogOut size={20} /> Log Out
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl animate-fade-in flex flex-col">
      <div className="p-6 flex justify-between items-center border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          {currentSubPage && (
            <button onClick={() => setCurrentSubPage(null)} className="text-gray-400 hover:text-white">
              <ChevronLeft size={28} />
            </button>
          )}
          <h2 className="text-2xl font-black text-white italic">
            {currentSubPage === 'profile' ? 'Edit Profile' : 
             currentSubPage === 'privacy' ? 'Privacy Charter' :
             currentSubPage === 'region' ? 'Region & Language' : 'Settings'}
          </h2>
        </div>
        <button onClick={onClose} className="p-2 bg-gray-800 rounded-full text-white">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        {renderSubPage()}
        
        {!currentSubPage && (
          <div className="text-center mt-10 pb-10">
            <p className="text-[10px] text-gray-700 font-bold tracking-[0.4em] uppercase italic">dramarr industrial • v3.0.4</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const ProfileView: React.FC<ProfileViewProps> = ({ user: currentUser, videos, series, onLogout, onOpenAdmin, onUpdateUser, onDeleteAccount, onDeleteVideo, onRemoveProfilePic, onOpenAnalytics, onOpenAds, viewingUserId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'series'>('grid');
  const [profileUser, setProfileUser] = useState<User>(currentUser);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isOwnProfile = !viewingUserId || viewingUserId === currentUser.id;

  const userVideos = videos.filter(v => v.creatorId === profileUser.id);
  const userSeries = series.filter(s => s.creatorId === profileUser.id);

  useEffect(() => {
      if (viewingUserId && viewingUserId !== currentUser.id) api.getUserProfile(viewingUserId).then(u => { if(u) setProfileUser(u); });
      else setProfileUser(currentUser);
  }, [viewingUserId, currentUser]);

  return (
    <div className="h-full bg-black overflow-y-auto animate-fade-in no-scrollbar">
      {isSettingsOpen && (
        <SettingsModal 
          user={currentUser} 
          onClose={() => setIsSettingsOpen(false)} 
          onLogout={onLogout} 
          onUpdateUser={onUpdateUser}
        />
      )}
      
      <div className="max-w-6xl mx-auto w-full pt-12 md:pt-10 pb-20">
          
          <div className="px-6 md:px-12 mb-4 flex justify-between items-center">
              <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                  <ChevronLeft size={28} /> <span className="font-bold uppercase text-[10px] tracking-[0.3em]">Return</span>
              </button>
              
              <div className="flex items-center gap-3">
                  {isOwnProfile && (
                    <button 
                      onClick={onOpenAds}
                      className="p-2 bg-pink-900/20 border border-pink-500/30 rounded-full text-pink-400 hover:text-pink-300 transition-all shadow-lg active:scale-90"
                    >
                      <Megaphone size={24} />
                    </button>
                  )}
                  {isOwnProfile && currentUser.isAdmin && (
                    <button 
                      onClick={onOpenAdmin}
                      className="p-2 bg-red-900/20 border border-red-500/30 rounded-full text-red-400 hover:text-red-300 transition-all shadow-lg shadow-red-500/10 active:scale-90"
                    >
                      <ShieldAlert size={24} />
                    </button>
                  )}
                  {isOwnProfile && (
                    <button 
                      onClick={() => setIsSettingsOpen(true)}
                      className="p-2 bg-gray-900 border border-gray-800 rounded-full text-gray-400 hover:text-white transition-all shadow-lg active:scale-90"
                    >
                      <Settings size={24} />
                    </button>
                  )}
              </div>
          </div>

          <div className="px-6 md:px-12 mb-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative shrink-0">
                <img src={profileUser.avatarUrl} className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-neon-purple object-cover shadow-2xl" />
                {profileUser.isVerified && <div className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-black text-xs font-bold">✓</div>}
            </div>
            
            <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                    <h2 className="text-4xl font-black text-white italic tracking-tighter italic">@{profileUser.username}</h2>
                    <div className="flex gap-3 justify-center">
                        {isOwnProfile ? (
                            <>
                                <button onClick={() => setIsSettingsOpen(true)} className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all">Profile Core</button>
                                <button onClick={onOpenAnalytics} className="bg-purple-900/40 text-purple-400 font-bold px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest border border-purple-500/30 flex items-center gap-2 hover:bg-purple-900/60 transition-all"><BarChart3 size={16}/> Stats</button>
                            </>
                        ) : (
                            <button className="bg-neon-pink text-white font-bold px-10 py-2 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-neon-pink/20 hover:scale-105 transition-transform">Follow</button>
                        )}
                    </div>
                </div>
                
                <div className="flex justify-center md:justify-start gap-8 mb-6">
                    <div className="flex gap-2 items-baseline"><span className="font-black text-xl text-white">{profileUser.followers}</span><span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">fans</span></div>
                    <div className="flex gap-2 items-baseline"><span className="font-black text-xl text-white">{profileUser.following.length}</span><span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">following</span></div>
                    <div className="flex gap-2 items-baseline"><span className="font-black text-xl text-white">12.5k</span><span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">likes</span></div>
                </div>
                
                <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mb-6">{profileUser.bio || "A blank script awaits your story."}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-900/40 rounded-[32px] border border-gray-800/50 max-w-2xl">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={14} className="text-neon-purple" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{new Date(profileUser.joinDate).toLocaleDateString()}</span>
                    </div>
                    {profileUser.country && (
                        <div className="flex items-center gap-2 text-gray-400">
                            <MapPin size={14} className="text-neon-pink" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{profileUser.country}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-400">
                        <UserCheck size={14} className="text-blue-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{profileUser.subscriptionStatus} Account</span>
                    </div>
                </div>
            </div>
          </div>

          <div className="flex border-t border-gray-900 sticky top-0 bg-black z-20">
            <button className={`flex-1 py-5 flex items-center justify-center gap-3 transition-all ${activeTab === 'grid' ? 'border-b-2 border-white text-white bg-white/5' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setActiveTab('grid')}><GridIcon size={20} /> <span className="font-black uppercase tracking-[0.3em] text-[10px]">Library</span></button>
            <button className={`flex-1 py-5 flex items-center justify-center gap-3 transition-all ${activeTab === 'series' ? 'border-b-2 border-white text-white bg-white/5' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setActiveTab('series')}><Folder size={20} /> <span className="font-black uppercase tracking-[0.3em] text-[10px]">Series</span></button>
          </div>

          <div className="p-4">
            {activeTab === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {userVideos.map(v => (
                        <div key={v.id} className="relative aspect-[3/4] bg-gray-900 rounded-[32px] overflow-hidden group cursor-pointer border border-white/5 shadow-2xl">
                             <img src={v.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                                 <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest"><Play size={12} fill="white" /> {v.likes}</div>
                             </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                     {userSeries.map(s => (
                         <div key={s.id} className="bg-gray-900/40 rounded-[48px] overflow-hidden border border-white/5 hover:bg-gray-800 transition-all cursor-pointer group flex shadow-xl">
                             <div className="w-32 aspect-[3/4] relative shrink-0">
                                 <img src={s.coverUrl} className="w-full h-full object-cover" />
                             </div>
                             <div className="p-8 flex flex-col justify-center min-w-0">
                                 <h4 className="font-black text-white text-xl truncate mb-1 group-hover:text-neon-purple transition-colors uppercase italic tracking-tighter">{s.title}</h4>
                                 <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] mb-3">{s.category} • {s.totalEpisodes} Eps</p>
                                 <div className="bg-white/5 w-fit px-4 py-1.5 rounded-full text-[9px] text-gray-400 font-black uppercase tracking-widest border border-white/5">{s.year}</div>
                             </div>
                         </div>
                     ))}
                 </div>
            )}
          </div>
      </div>
    </div>
  );
};