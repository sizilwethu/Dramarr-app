
import React, { useState, useEffect } from 'react';
import { User, Video, Series, CATEGORIES } from '../types';
import { api } from '../services/api';
import { 
  Settings, Grid as GridIcon, Folder, Play, BarChart3, ChevronLeft, 
  LogOut, User as UserIcon, Camera, Trash2, X, Shield, Bell, 
  CreditCard, HelpCircle, ChevronRight, Globe, Lock, Mail, Save, CheckCircle,
  Calendar, MapPin, UserCheck, ShieldAlert, Megaphone
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
          <div className="animate-fade-in text-gray-400 text-sm leading-relaxed space-y-6 pb-20">
            <div className="bg-neon-purple/10 border border-neon-purple/30 p-6 rounded-3xl mb-8">
                <h3 className="text-white font-black text-2xl uppercase tracking-tighter mb-2">Dramarr Privacy Charter</h3>
                <p className="text-[10px] text-neon-purple font-black uppercase tracking-[0.3em]">Version 2.1 • Enhanced AI Protection</p>
            </div>

            <section className="space-y-3">
                <h4 className="text-white font-black uppercase text-xs tracking-widest flex items-center gap-2">
                    <Shield size={14} className="text-neon-purple" /> 1. Data Stewardship
                </h4>
                <p>At dramarr ("the Platform"), we operate on a principle of radical transparency. This policy governs how personal identifiers, content uploads, and generative AI interactions are processed across our ecosystem.</p>
            </section>

            <section className="space-y-3">
                <h4 className="text-white font-black uppercase text-xs tracking-widest">2. Information Collection</h4>
                <div className="pl-4 border-l border-gray-800 space-y-4">
                    <p><strong className="text-gray-300 italic">User-Provided Data:</strong> Registration requires an email address, legal birth date, and geographic region. For creators, additional tax identification and financial routing numbers (PayPal/Stripe) are collected for payout processing.</p>
                    <p><strong className="text-gray-300 italic">Generative AI Interactions:</strong> Inputs provided to our AI Character Chat or Voice Studio (Gemini-integrated) are processed in real-time. We do not use these specific inputs to train long-term model weights, though they are stored for moderation and safety compliance.</p>
                    <p><strong className="text-gray-300 italic">Biometric Data:</strong> For verified creator status, we may utilize third-party identity verification services that process biometric facial vectors. Dramarr does not store raw biometric data on its primary servers.</p>
                </div>
            </section>

            <section className="space-y-3">
                <h4 className="text-white font-black uppercase text-xs tracking-widest">3. Advanced Processing & AI Ethics</h4>
                <p>Our Platform utilizes automated algorithms to determine "Drama Scores," visibility metrics, and content recommendations. We are committed to preventing algorithmic bias and provide users with manual "Reset Feed" controls in the Feed settings.</p>
            </section>

            <section className="space-y-3">
                <h4 className="text-white font-black uppercase text-xs tracking-widest">4. Your Global Rights (GDPR/CCPA/LGPD)</h4>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong className="text-gray-300">Right to Portability:</strong> You may request a machine-readable export of all uploaded video metadata.</li>
                    <li><strong className="text-gray-300">Right to Erasure:</strong> Account deletion triggers a 14-day "Cool-Down" period, after which all PII is scrubbed from production databases. Content hosted on edge CDNs may persist for up to 30 days.</li>
                    <li><strong className="text-gray-300">Opt-Out of Profiling:</strong> You can disable personalized ad tracking in the Ad Center dashboard.</li>
                </ul>
            </section>

            <section className="space-y-3">
                <h4 className="text-white font-black uppercase text-xs tracking-widest">5. Data Retention & Security</h4>
                <p>All data is encrypted in transit via TLS 1.3 and at rest using AES-256 standards. Financial transactions are processed via PCI-DSS Level 1 compliant partners. We retain server logs for 90 days for forensic security purposes.</p>
            </section>

            <section className="space-y-3">
                <h4 className="text-white font-black uppercase text-xs tracking-widest">6. Contact & Legal Inquiry</h4>
                <p>For inquiries regarding data protection, please contact our Data Protection Officer (DPO) at:</p>
                <div className="bg-gray-900 p-4 rounded-xl border border-white/5 text-xs">
                    <p className="font-bold text-white mb-1 uppercase tracking-widest">Legal & Compliance Dept.</p>
                    <p>legal@dramarr.app</p>
                    <p>Attn: DPO / Privacy Compliance</p>
                </div>
            </section>

            <div className="p-10 border-t border-gray-900 text-center">
                <p className="text-[10px] text-gray-600 font-bold uppercase">End of Privacy Charter • (C) 2024 Dramarr Inc.</p>
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
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">Billing</h3>
              <SettingItem icon={CreditCard} label="Payment Methods" />
              <SettingItem icon={Shield} label="Subscription Plan" value={user.subscriptionStatus === 'premium' ? 'Premium' : 'Free Tier'} />
            </div>

            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">Support</h3>
              <SettingItem icon={HelpCircle} label="Help Center" />
              <SettingItem icon={Shield} label="Privacy Policy" onClick={() => setCurrentSubPage('privacy')} />
            </div>

            <div className="mt-12 space-y-3">
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-2xl transition-all border border-red-500/20"
              >
                <LogOut size={20} /> Log Out
              </button>
              <button 
                onClick={() => { if(confirm("Are you sure? This is permanent.")) alert("Account deleted"); }}
                className="w-full flex items-center justify-center gap-3 p-4 text-gray-600 hover:text-red-600 font-bold rounded-2xl transition-all text-xs"
              >
                <Trash2 size={14} /> Delete Account
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
          <h2 className="text-2xl font-black text-white">
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
            <p className="text-[10px] text-gray-700 font-bold tracking-widest uppercase">dramarr v2.1.0</p>
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
          
          {/* Universal Header */}
          <div className="px-6 md:px-12 mb-4 flex justify-between items-center">
              <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                  <ChevronLeft size={28} /> <span className="font-bold uppercase text-xs tracking-widest">Back</span>
              </button>
              
              <div className="flex items-center gap-3">
                  {isOwnProfile && (
                    <button 
                      onClick={onOpenAds}
                      className="p-2 bg-pink-900/20 border border-pink-500/30 rounded-full text-pink-400 hover:text-pink-300 transition-all shadow-lg active:scale-90"
                      title="Ad Center"
                    >
                      <Megaphone size={24} />
                    </button>
                  )}
                  {isOwnProfile && currentUser.isAdmin && (
                    <button 
                      onClick={onOpenAdmin}
                      className="p-2 bg-red-900/20 border border-red-500/30 rounded-full text-red-400 hover:text-red-300 transition-all shadow-lg shadow-red-500/10 active:scale-90"
                      title="Admin Panel"
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
                    <h2 className="text-3xl font-black text-white italic tracking-tighter">@{profileUser.username}</h2>
                    <div className="flex gap-3 justify-center">
                        {isOwnProfile ? (
                            <>
                                <button onClick={() => setIsSettingsOpen(true)} className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all">Edit Profile</button>
                                <button onClick={onOpenAnalytics} className="bg-purple-900/40 text-purple-400 font-bold px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest border border-purple-500/30 flex items-center gap-2 hover:bg-purple-900/60 transition-all"><BarChart3 size={16}/> Analytics</button>
                            </>
                        ) : (
                            <button className="bg-neon-pink text-white font-bold px-10 py-2 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-neon-pink/20 hover:scale-105 transition-transform">Follow</button>
                        )}
                    </div>
                </div>
                
                <div className="flex justify-center md:justify-start gap-8 mb-6">
                    <div className="flex gap-2 items-baseline"><span className="font-black text-xl text-white">{profileUser.followers}</span><span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">followers</span></div>
                    <div className="flex gap-2 items-baseline"><span className="font-black text-xl text-white">{profileUser.following.length}</span><span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">following</span></div>
                    <div className="flex gap-2 items-baseline"><span className="font-black text-xl text-white">12.5k</span><span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">likes</span></div>
                </div>
                
                <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mb-6">{profileUser.bio || "No bio yet."}</p>

                {/* Restored Personal Info Block */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-900/40 rounded-3xl border border-gray-800/50 max-w-2xl">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={14} className="text-neon-purple" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(profileUser.joinDate).toLocaleDateString()}</span>
                    </div>
                    {profileUser.country && (
                        <div className="flex items-center gap-2 text-gray-400">
                            <MapPin size={14} className="text-neon-pink" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{profileUser.country}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-400">
                        <UserCheck size={14} className="text-blue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{profileUser.subscriptionStatus === 'premium' ? 'Premium' : 'Standard'}</span>
                    </div>
                </div>
            </div>
          </div>

          <div className="flex border-t border-gray-900 sticky top-0 bg-black z-20">
            <button className={`flex-1 py-5 flex items-center justify-center gap-3 transition-all ${activeTab === 'grid' ? 'border-b-2 border-white text-white bg-white/5' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setActiveTab('grid')}><GridIcon size={20} /> <span className="font-black uppercase tracking-[0.2em] text-[10px]">Episodes</span></button>
            <button className={`flex-1 py-5 flex items-center justify-center gap-3 transition-all ${activeTab === 'series' ? 'border-b-2 border-white text-white bg-white/5' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setActiveTab('series')}><Folder size={20} /> <span className="font-black uppercase tracking-[0.2em] text-[10px]">Series</span></button>
          </div>

          <div className="p-4">
            {activeTab === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {userVideos.map(v => (
                        <div key={v.id} className="relative aspect-[3/4] bg-gray-900 rounded-3xl overflow-hidden group cursor-pointer border border-white/5 shadow-lg">
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
                         <div key={s.id} className="bg-gray-900/40 rounded-[40px] overflow-hidden border border-white/5 hover:bg-gray-800 transition-all cursor-pointer group flex">
                             <div className="w-32 aspect-[3/4] relative shrink-0">
                                 <img src={s.coverUrl} className="w-full h-full object-cover" />
                             </div>
                             <div className="p-6 flex flex-col justify-center min-w-0">
                                 <h4 className="font-bold text-white text-xl truncate mb-1 group-hover:text-neon-purple transition-colors">{s.title}</h4>
                                 <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">{s.category} • {s.totalEpisodes} Eps</p>
                                 <div className="bg-gray-800/50 w-fit px-3 py-1 rounded-full text-[10px] text-gray-400 font-bold uppercase tracking-widest">{s.year}</div>
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
