
import React, { useState, useEffect, useRef } from 'react';
import { User, Video, Series, CATEGORIES } from '../types';
import { api } from '../services/api';
import { 
  Settings, Grid as GridIcon, Folder, Play, BarChart3, ChevronLeft, 
  LogOut, User as UserIcon, Camera, Trash2, X, Shield, Bell, 
  CreditCard, HelpCircle, ChevronRight, Globe, Lock, Mail, Save, CheckCircle,
  Calendar, MapPin, UserCheck, ShieldAlert, Megaphone, FileText, LockKeyhole, UserPlus, EyeOff,
  Sparkles, Smartphone, HeartPulse, HardDrive, Wallet, ShieldCheck, Zap,
  Instagram, Youtube, Accessibility, Database, Link2, Trash, Eye, Music, Navigation, Landmark,
  Smartphone as PhoneIcon, Key, History, Fingerprint, RefreshCcw, Download, UserMinus, AlertCircle
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
  onOpenRides: () => void;
  viewingUserId?: string;
  onBack: () => void;
}

const SettingsModal = ({ user, onClose, onLogout, onUpdateUser }: { user: User, onClose: () => void, onLogout: () => void, onUpdateUser: (d: any) => void }) => {
  const [currentSubPage, setCurrentSubPage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    username: user.username,
    bio: user.bio || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    dob: user.dob || '',
    country: user.country || '',
    email: user.email || '',
    phone: '', // Mock field
    paypalEmail: user.paypalEmail || '',
    bankAccount: '', // Mock field
  });

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const calculateAge = (dobString: string) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleSave = async () => {
    if (calculateAge(formData.dob) < 13) {
      showFeedback('error', 'You must be at least 13 years old.');
      return;
    }

    setIsSaving(true);
    try {
      await api.updateProfile(user.id, formData);
      onUpdateUser(formData);
      showFeedback('success', 'Profile core updated successfully.');
      setCurrentSubPage(null);
    } catch (e) {
      showFeedback('error', 'Critical system error during sync.');
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
          {value && <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{value}</p>}
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-600" />
    </button>
  );

  const ToggleItem = ({ label, description, active, onToggle }: any) => (
      <div className="flex items-center justify-between p-5 bg-gray-900/50 rounded-3xl border border-white/5 mb-4">
          <div className="flex-1 pr-4">
              <p className="text-sm font-bold text-white mb-1">{label}</p>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{description}</p>
          </div>
          <button 
            onClick={onToggle}
            className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${active ? 'bg-neon-purple' : 'bg-gray-800'}`}
          >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-transform duration-300 ${active ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
      </div>
  );

  const renderSubPage = () => {
    switch (currentSubPage) {
      case 'profile':
        return (
          <div className="animate-fade-in space-y-6">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Username</label>
              <input 
                type="text" 
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-neon-purple outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Biography</label>
              <textarea 
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                rows={4}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-neon-purple outline-none resize-none font-medium"
                placeholder="Share your story..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Legal First Name</label>
                    <input 
                        type="text" 
                        value={formData.firstName}
                        readOnly={user.isVerified}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        className={`w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-neon-purple outline-none font-bold ${user.isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Legal Last Name</label>
                    <input 
                        type="text" 
                        value={formData.lastName}
                        readOnly={user.isVerified}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        className={`w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-neon-purple outline-none font-bold ${user.isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                </div>
            </div>
            <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Date of Birth</label>
                <input 
                    type="date" 
                    value={formData.dob}
                    readOnly={user.isVerified}
                    onChange={e => setFormData({...formData, dob: e.target.value})}
                    className={`w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-neon-purple outline-none font-bold ${user.isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {user.isVerified && <p className="text-[9px] text-blue-400 mt-2 font-black uppercase italic tracking-widest">Locked: Verified accounts cannot modify legal identity.</p>}
            </div>
            
            <div className="pt-4 flex gap-3">
                <button onClick={() => setCurrentSubPage(null)} className="flex-1 py-4 text-gray-500 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
                <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-[2] bg-neon-purple py-4 rounded-xl font-black text-white uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-2xl active:scale-95 disabled:opacity-50"
                >
                {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={16} />}
                Update Profile Core
                </button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="animate-fade-in space-y-4">
             <div className="bg-gray-900/40 p-6 rounded-[32px] border border-white/5 mb-4">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Contact Channels</h4>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Mail size={18} className="text-gray-500" />
                            <div>
                                <p className="text-xs text-white font-bold">{user.email}</p>
                                <p className="text-[8px] text-green-500 font-black uppercase">Verified Primary</p>
                            </div>
                        </div>
                        <button className="text-[9px] font-black text-neon-purple uppercase border border-neon-purple/20 px-3 py-1 rounded-full">Change</button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <PhoneIcon size={18} className="text-gray-500" />
                            <div>
                                <p className="text-xs text-white font-bold">+1 (•••) •••-4242</p>
                                <p className="text-[8px] text-gray-500 font-black uppercase">Click to Verify</p>
                            </div>
                        </div>
                        <button onClick={() => showFeedback('success', 'OTP sent to mobile.')} className="text-[9px] font-black text-neon-purple uppercase border border-neon-purple/20 px-3 py-1 rounded-full">Verify</button>
                    </div>
                </div>
             </div>

             <div className="space-y-2">
                <SettingItem icon={Key} label="Change Password" color="text-yellow-500" />
                <SettingItem icon={Fingerprint} label="Two-Factor Authentication" value="Enabled (App Authenticator)" color="text-green-500" />
                <SettingItem icon={History} label="Active Sessions" value="3 Logged-in devices" />
             </div>
          </div>
        );
      case 'verification':
          return (
              <div className="animate-fade-in">
                  <div className="bg-gradient-to-br from-blue-900/40 to-black p-8 rounded-[40px] border border-blue-500/20 mb-8 flex flex-col items-center text-center">
                      <ShieldCheck size={48} className="text-blue-400 mb-4" />
                      <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">Identity Sovereign</h3>
                      <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Verification Status: {user.isVerified ? 'ENFORCED' : 'NOT STARTED'}</p>
                  </div>
                  
                  {!user.isVerified ? (
                    <div className="space-y-6">
                        <div className="bg-gray-900/50 p-6 rounded-3xl border border-white/5">
                            <h4 className="text-xs font-bold text-white mb-4">Required Documents</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-800 rounded-2xl hover:border-blue-500 transition-colors group">
                                    <Camera size={24} className="text-gray-600 mb-2 group-hover:text-blue-500" />
                                    <span className="text-[9px] font-black uppercase text-gray-500">Government ID</span>
                                </button>
                                <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-800 rounded-2xl hover:border-blue-500 transition-colors group">
                                    <UserPlus size={24} className="text-gray-600 mb-2 group-hover:text-blue-500" />
                                    <span className="text-[9px] font-black uppercase text-gray-500">Selfie Match</span>
                                </button>
                            </div>
                        </div>
                        <button className="w-full bg-white text-black py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-2xl">Submit Verification</button>
                    </div>
                  ) : (
                    <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-3xl flex gap-4 items-start">
                        <CheckCircle size={20} className="text-green-500 shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-white">Verification Complete</p>
                            <p className="text-[10px] text-gray-500 leading-relaxed mt-1 italic">Your identity is cryptographically bound to your profile. You are now eligible for monetized creator tiers.</p>
                        </div>
                    </div>
                  )}
              </div>
          );
      case 'notifications':
          return (
              <div className="animate-fade-in">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-1">Channel Configuration</h3>
                  <ToggleItem label="Push Notifications" description="Immediate alerts for likes, comments, and series updates." active={true} />
                  <ToggleItem label="Email Digests" description="Weekly summary of top trending dramas." active={false} />
                  <ToggleItem label="SMS Emergency" description="Urgent alerts regarding account security." active={true} />
                  
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-8 mb-4 ml-1">Activity Triggers</h3>
                  <ToggleItem label="New Follower Alerts" active={true} />
                  <ToggleItem label="Series Releases" active={true} />
                  <ToggleItem label="Character Chat Replies" active={true} />
              </div>
          );
      case 'finance':
          return (
              <div className="animate-fade-in space-y-6">
                  <div className="bg-gray-900/50 p-6 rounded-3xl border border-white/5">
                      <div className="flex justify-between items-end mb-8">
                        <div>
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Active Wallet</p>
                            <p className="text-4xl font-black text-white italic tracking-tighter">${user.pendingPayoutBalance?.toFixed(2)}</p>
                        </div>
                        <button onClick={() => showFeedback('success', 'Payout request processed.')} className="bg-neon-purple text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">Withdraw</button>
                      </div>

                      <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                              <div className="flex items-center gap-3">
                                  <Landmark size={18} className="text-blue-400" />
                                  <div>
                                      <p className="text-[10px] font-bold text-white">Bank Account</p>
                                      <p className="text-[8px] text-gray-500 uppercase font-black">CHASE •••• 1234</p>
                                  </div>
                              </div>
                              <button className="text-[8px] font-black uppercase text-neon-purple">Edit</button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                              <div className="flex items-center gap-3">
                                  <CreditCard size={18} className="text-gray-500" />
                                  <div>
                                      <p className="text-[10px] font-bold text-white">Payout Schedule</p>
                                      <p className="text-[8px] text-gray-500 uppercase font-black">Monthly (Every 1st)</p>
                                  </div>
                              </div>
                              <button className="text-[8px] font-black uppercase text-neon-purple">Change</button>
                          </div>
                      </div>
                  </div>

                  <div className="bg-gray-900/50 p-6 rounded-3xl border border-white/5">
                      <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4">Payout Eligibility</h4>
                      <div className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-gray-400">ID Verified</span>
                              <CheckCircle size={14} className="text-green-500" />
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-gray-400">Min. Balance ($50)</span>
                              <CheckCircle size={14} className="text-green-500" />
                          </div>
                      </div>
                  </div>
              </div>
          );
      case 'preferences':
          return (
              <div className="animate-fade-in">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-1">App Architecture</h3>
                  <div className="p-4 bg-gray-900/50 rounded-2xl border border-white/5 mb-4">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Primary Interface Language</label>
                    <select className="w-full bg-black/40 border-none text-white text-xs font-bold focus:outline-none">
                        <option>English (US)</option>
                        <option>Spanish (ES)</option>
                        <option>Korean (KR)</option>
                        <option>Chinese (CN)</option>
                    </select>
                  </div>
                  <ToggleItem label="Autoplay Feed" description="Continuously play the next drama in the queue." active={true} />
                  <ToggleItem label="HD Playback Priority" description="Always use 1080p when Wi-Fi is detected." active={true} />
                  
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-8 mb-4 ml-1">Content Safety</h3>
                  <ToggleItem label="Maturity Filter" description="Hide extreme suspense or action content." active={false} />
                  <div className="p-4 bg-gray-900/50 rounded-2xl border border-white/5">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Interested Categories</label>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(c => (
                            <span key={c} className="bg-neon-purple/20 text-neon-purple text-[8px] font-black px-2 py-1 rounded-full border border-neon-purple/30">{c}</span>
                        ))}
                    </div>
                  </div>
              </div>
          );
      case 'privacy':
          return (
              <div className="animate-fade-in space-y-4">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-1">Data Sovereignty</h3>
                  <ToggleItem label="Public Discovery" description="Allow users to find you via search." active={true} />
                  <ToggleItem label="Message Whitelist" description="Only followers can initiate character chat." active={false} />
                  <ToggleItem label="Ad Tracking" description="Use watch history for improved drama recommendations." active={true} />
                  
                  <div className="pt-8 space-y-3">
                    <button onClick={() => showFeedback('success', 'Data download initiated. Check email in 24h.')} className="w-full flex items-center justify-between p-5 bg-gray-900/50 rounded-3xl border border-white/5 group">
                        <div className="flex items-center gap-4">
                            <Download size={20} className="text-blue-400" />
                            <span className="text-xs font-bold text-white">Download My Data</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-600" />
                    </button>
                    <button className="w-full flex items-center justify-between p-5 bg-red-500/5 rounded-3xl border border-red-500/10 group">
                        <div className="flex items-center gap-4">
                            <UserMinus size={20} className="text-red-500" />
                            <span className="text-xs font-bold text-red-500">Deactivate Identity</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-600" />
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 p-5 bg-red-900/20 rounded-3xl border border-red-500/30 text-red-500 font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">
                        <Trash2 size={16} /> Delete Account Permanently
                    </button>
                  </div>
              </div>
          );
      default:
        return (
          <>
            {/* Category Listing */}
            <div className="mb-8">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-1">Identity & Security</h3>
              <SettingItem icon={UserIcon} label="Edit Profile Core" value={`@${user.username}`} onClick={() => setCurrentSubPage('profile')} />
              <SettingItem icon={ShieldCheck} label="Identity Verification" value={user.isVerified ? "ENFORCED" : "NOT VERIFIED"} color="text-blue-500" onClick={() => setCurrentSubPage('verification')} />
              <SettingItem icon={LockKeyhole} label="Security & Logins" value="Password, 2FA, Active Devices" color="text-yellow-500" onClick={() => setCurrentSubPage('security')} />
            </div>

            <div className="mb-8">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-1">Monetization & Flow</h3>
                <SettingItem icon={Wallet} label="Financial Hub" value={`Wallet: $${user.pendingPayoutBalance?.toFixed(2)}`} color="text-green-500" onClick={() => setCurrentSubPage('finance')} />
                <SettingItem icon={Megaphone} label="Subscription Plan" value={user.subscriptionStatus?.toUpperCase()} color="text-neon-pink" />
            </div>

            <div className="mb-8">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-1">Ecosystem Configuration</h3>
                <SettingItem icon={Zap} label="App Preferences" value="Theme, Language, Playback" onClick={() => setCurrentSubPage('preferences')} />
                <SettingItem icon={Bell} label="Notification Engine" onClick={() => setCurrentSubPage('notifications')} />
                <SettingItem icon={Shield} label="Privacy & Sovereignty" onClick={() => setCurrentSubPage('privacy')} />
            </div>

            <div className="mb-8">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-1">Legal & Support</h3>
              <SettingItem icon={FileText} label="Terms of Story" />
              <SettingItem icon={HelpCircle} label="Support Nexus" />
            </div>

            <div className="mt-12 space-y-3 pb-20">
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-3 p-5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black rounded-3xl transition-all border border-red-500/20 uppercase text-[10px] tracking-widest"
              >
                <LogOut size={20} /> Terminate Session
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-3xl animate-fade-in flex flex-col">
      {/* Feedback Overlay */}
      {feedback && (
        <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[150] px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl animate-slide-down ${feedback.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{feedback.message}</span>
        </div>
      )}

      <div className="p-6 pt-12 flex justify-between items-center border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          {currentSubPage && (
            <button onClick={() => setCurrentSubPage(null)} className="text-gray-400 hover:text-white p-2">
              <ChevronLeft size={28} />
            </button>
          )}
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">
            {currentSubPage === 'profile' ? 'Profile Core' : 
             currentSubPage === 'privacy' ? 'Privacy Hub' :
             currentSubPage === 'security' ? 'Security Console' :
             currentSubPage === 'verification' ? 'ID Identity' :
             currentSubPage === 'finance' ? 'Financial Hub' :
             currentSubPage === 'preferences' ? 'App Config' :
             currentSubPage === 'notifications' ? 'Alert Matrix' : 'Sovereign Hub'}
          </h2>
        </div>
        <button onClick={onClose} className="p-3 bg-gray-900 rounded-full text-white active:scale-90 transition-transform">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-32">
        {renderSubPage()}
        
        {!currentSubPage && (
          <div className="text-center mt-10 pb-10">
            <p className="text-[10px] text-gray-800 font-bold tracking-[0.4em] uppercase italic">dramarr ecosystem • ver 5.0.0-PRO</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const ProfileView: React.FC<ProfileViewProps> = ({ user: currentUser, videos, series, onLogout, onOpenAdmin, onUpdateUser, onDeleteAccount, onDeleteVideo, onRemoveProfilePic, onOpenAnalytics, onOpenAds, onOpenRides, viewingUserId, onBack }) => {
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
              <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors p-2">
                  <ChevronLeft size={28} /> <span className="font-bold uppercase text-[10px] tracking-[0.3em] hidden sm:inline">Return</span>
              </button>
              
              <div className="flex items-center gap-3">
                  {isOwnProfile && (
                    <button 
                      onClick={onOpenRides}
                      className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-full text-blue-400 hover:text-blue-300 transition-all shadow-lg active:scale-90"
                    >
                      <Navigation size={24} />
                    </button>
                  )}
                  {isOwnProfile && (
                    <button 
                      onClick={onOpenAds}
                      className="p-3 bg-pink-900/20 border border-pink-500/30 rounded-full text-pink-400 hover:text-pink-300 transition-all shadow-lg active:scale-90"
                    >
                      <Megaphone size={24} />
                    </button>
                  )}
                  {isOwnProfile && currentUser.isAdmin && (
                    <button 
                      onClick={onOpenAdmin}
                      className="p-3 bg-red-900/20 border border-red-500/30 rounded-full text-red-400 hover:text-red-300 transition-all shadow-lg shadow-red-500/10 active:scale-90"
                    >
                      <ShieldAlert size={24} />
                    </button>
                  )}
                  {isOwnProfile && (
                    <button 
                      onClick={() => setIsSettingsOpen(true)}
                      className="p-3 bg-gray-900 border border-gray-800 rounded-full text-gray-400 hover:text-white transition-all shadow-lg active:scale-90"
                    >
                      <Settings size={24} />
                    </button>
                  )}
              </div>
          </div>

          <div className="px-6 md:px-12 mb-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative shrink-0">
                <img src={profileUser.avatarUrl} className="w-32 h-32 md:w-40 md:h-40 rounded-[48px] border-4 border-neon-purple object-cover shadow-2xl" />
                {profileUser.isVerified && <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center border-4 border-black text-white"><ShieldCheck size={20} /></div>}
            </div>
            
            <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">@{profileUser.username}</h2>
                    <div className="flex gap-3 justify-center">
                        {isOwnProfile ? (
                            <>
                                <button onClick={() => setIsSettingsOpen(true)} className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all">Profile Hub</button>
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
