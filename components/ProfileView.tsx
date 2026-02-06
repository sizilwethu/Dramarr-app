import React, { useState, useEffect, useRef } from 'react';
import { User, Video, Series, CATEGORIES, Conversation, SocialPost, Comment } from '../types';
import { api } from '../services/api';
import { 
  Settings, Grid as GridIcon, Folder, Play, BarChart3, ChevronLeft, 
  LogOut, User as UserIcon, Camera, Trash2, X, Shield, Bell, 
  CreditCard, HelpCircle, ChevronRight, Globe, Lock, Mail, Save, CheckCircle,
  Calendar, MapPin, UserCheck, ShieldAlert, Megaphone, FileText, LockKeyhole, UserPlus, EyeOff,
  Sparkles, Smartphone, HeartPulse, HardDrive, Wallet, ShieldCheck, Zap,
  Instagram, Youtube, Accessibility, Database, Link2, Trash, Eye, Music, Navigation, Landmark,
  Smartphone as PhoneIcon, Key, History, Fingerprint, RefreshCcw, Download, UserMinus, AlertCircle, MessageCircle, MoreHorizontal, Send
} from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';

interface ProfileViewProps {
  user: User; // The user profile being viewed
  currentUser?: User; // The logged-in user
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
  onBack: () => void;
  onMessageUser?: (partner: Conversation) => void;
  isCurrentUser: boolean;
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
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">First Name</label>
                    <input 
                        type="text" 
                        value={formData.firstName}
                        readOnly={user.isVerified}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        className={`w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-neon-purple outline-none font-bold ${user.isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Last Name</label>
                    <input 
                        type="text" 
                        value={formData.lastName}
                        readOnly={user.isVerified}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        className={`w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-neon-purple outline-none font-bold ${user.isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Date of Birth</label>
                    <input 
                        type="date" 
                        value={formData.dob}
                        readOnly={user.isVerified}
                        onChange={e => setFormData({...formData, dob: e.target.value})}
                        className={`w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-neon-purple outline-none font-bold ${user.isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Country</label>
                    <input 
                        type="text" 
                        value={formData.country}
                        onChange={e => setFormData({...formData, country: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-neon-purple outline-none font-bold"
                        placeholder="Country"
                    />
                </div>
            </div>
            
            {user.isVerified && <p className="text-[9px] text-blue-400 -mt-4 font-black uppercase italic tracking-widest">Locked: Verified accounts cannot modify legal identity.</p>}

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Email Address</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-neon-purple outline-none font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">PayPal Email</label>
              <input 
                type="email" 
                value={formData.paypalEmail}
                onChange={e => setFormData({...formData, paypalEmail: e.target.value})}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-neon-purple outline-none font-bold"
                placeholder="For payouts"
              />
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

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  user, 
  currentUser,
  videos, 
  series,
  onLogout, 
  onOpenAdmin, 
  onUpdateUser,
  onDeleteAccount,
  onDeleteVideo,
  onRemoveProfilePic,
  onOpenAnalytics,
  onOpenAds,
  onOpenRides,
  onBack,
  onMessageUser,
  isCurrentUser
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'series' | 'posts' | 'likes'>('videos');
  
  // States for viewing content
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [userPosts, setUserPosts] = useState<SocialPost[]>([]);
  const [viewingPost, setViewingPost] = useState<SocialPost | null>(null);
  const [isFollowing, setIsFollowing] = useState(currentUser?.following.includes(user.id) || false);
  
  // Post comments state
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  // Developer Admin Secret State
  const [devClickCount, setDevClickCount] = useState(0);
  const [devAdminOverride, setDevAdminOverride] = useState(false);

  const userVideos = videos.filter(v => v.creatorId === user.id);
  const userSeries = series.filter(s => s.creatorId === user.id);
  
  useEffect(() => {
    // Check follow status whenever users change
    if (currentUser) {
        setIsFollowing(currentUser.following.includes(user.id));
    }
  }, [user.id, currentUser]);

  useEffect(() => {
    const fetchUserPosts = async () => {
        const posts = await api.getSocialPosts(); // In a real app, filter by user.id via API
        setUserPosts(posts.filter(p => p.userId === user.id));
    };
    if (activeTab === 'posts') {
        fetchUserPosts();
    }
  }, [activeTab, user.id]);

  useEffect(() => {
      if (viewingPost) {
          const loadComments = async () => {
              const comments = await api.getComments(viewingPost.id, 'post');
              setPostComments(comments);
          };
          loadComments();
      }
  }, [viewingPost]);

  const handleToggleFollow = async () => {
      if (!currentUser) return;
      try {
          const newStatus = await api.toggleFollow(currentUser.id, user.id);
          setIsFollowing(!!newStatus);
          // Notify parent app to update current user state
          const newFollowingList = newStatus 
             ? [...currentUser.following, user.id]
             : currentUser.following.filter(id => id !== user.id);
          // We call onUpdateUser but it needs to apply to CURRENT user, 
          // App.tsx handles this logic based on context
          api.updateProfile(currentUser.id, { following: newFollowingList });
      } catch (e) {
          console.error("Follow error", e);
      }
  };

  const handlePostComment = async () => {
      if (!newComment.trim() || !viewingPost || !currentUser) return;
      try {
          await api.postComment(currentUser.id, viewingPost.id, newComment, 'post');
          setNewComment('');
          const updatedComments = await api.getComments(viewingPost.id, 'post');
          setPostComments(updatedComments);
      } catch (e) {
          console.error(e);
      }
  };

  const handleDevSecret = () => {
      if (!isCurrentUser) return;
      if (devClickCount + 1 >= 5) {
          setDevAdminOverride(true);
          alert("Developer Mode: Admin Access Temporarily Enabled");
          setDevClickCount(0);
      } else {
          setDevClickCount(prev => prev + 1);
      }
  };

  return (
    <div className="h-full bg-black flex flex-col relative animate-fade-in overflow-hidden">
        {/* Header/Nav */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
            {/* If not current user, always show back button. If current user, back button goes to Feed if coming from elsewhere */}
            <button onClick={onBack} className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white"><ChevronLeft size={24}/></button>
            <div className="flex gap-2">
                {isCurrentUser && (user.isAdmin || devAdminOverride) && (
                     <button onClick={onOpenAdmin} className="p-2 bg-black/40 backdrop-blur-md rounded-full text-red-500"><ShieldAlert size={20}/></button>
                )}
                {isCurrentUser ? (
                    <button onClick={() => setShowSettings(true)} className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white"><Settings size={20}/></button>
                ) : (
                    <button className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white"><MoreHorizontal size={20}/></button>
                )}
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
            {/* Cover Photo Area (Mock) */}
            <div className="h-48 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 relative">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
            </div>

            {/* Profile Header Info */}
            <div className="px-4 -mt-16 relative mb-6">
                <div className="flex justify-between items-end mb-4">
                    <div className="relative">
                        <img src={user.avatarUrl} className="w-28 h-28 rounded-full border-4 border-black object-cover bg-gray-900" />
                        {user.isVerified && (
                             <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-black">
                                <ShieldCheck size={14} />
                             </div>
                        )}
                    </div>
                    <div className="flex gap-3 mb-2">
                         {!isCurrentUser ? (
                            <>
                                <button 
                                    onClick={handleToggleFollow}
                                    className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all ${isFollowing ? 'bg-gray-800 text-white border border-white/20' : 'bg-neon-pink text-white shadow-lg shadow-neon-pink/30'}`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                                <button onClick={() => onMessageUser?.({ partnerId: user.id, username: user.username, avatarUrl: user.avatarUrl, lastMessage: '', timestamp: Date.now(), unreadCount: 0 })} className="p-2.5 bg-gray-800 rounded-full text-white border border-white/10 active:scale-95 transition-transform">
                                    <MessageCircle size={20}/>
                                </button>
                            </>
                         ) : (
                            <>
                                <button onClick={onOpenAds} className="px-5 py-2 bg-gray-900 border border-white/10 rounded-full text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors">Ads Manager</button>
                                <button onClick={onOpenRides} className="px-5 py-2 bg-gray-900 border border-white/10 rounded-full text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors">Driver Mode</button>
                            </>
                         )}
                    </div>
                </div>

                <div>
                    <h2 onClick={handleDevSecret} className="text-2xl font-black text-white flex items-center gap-2 select-none cursor-pointer active:scale-95 transition-transform">
                        @{user.username}
                        {user.isCreator && <span className="px-2 py-0.5 bg-neon-purple text-white text-[8px] rounded uppercase tracking-widest">Creator</span>}
                    </h2>
                    <p className="text-sm text-gray-400 mt-2 font-medium leading-relaxed max-w-md">{user.bio || "No biography yet."}</p>
                    
                    {/* Stats */}
                    <div className="flex gap-6 mt-4">
                        <div className="flex items-center gap-1">
                            <span className="font-black text-white">{user.following.length}</span>
                            <span className="text-xs text-gray-500 uppercase font-bold">Following</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="font-black text-white">{user.followers}</span>
                            <span className="text-xs text-gray-500 uppercase font-bold">Followers</span>
                        </div>
                        {isCurrentUser && (
                            <div className="flex items-center gap-1">
                                <span className="font-black text-white">{user.coins}</span>
                                <span className="text-xs text-gray-500 uppercase font-bold">Coins</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10 flex sticky top-0 bg-black/80 backdrop-blur-xl z-20">
                <button 
                    onClick={() => setActiveTab('videos')}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'videos' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}
                >
                    <GridIcon size={16} className="mx-auto mb-1" /> Videos
                </button>
                <button 
                    onClick={() => setActiveTab('series')}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'series' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}
                >
                    <Folder size={16} className="mx-auto mb-1" /> Series
                </button>
                <button 
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'posts' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}
                >
                    <Globe size={16} className="mx-auto mb-1" /> Social
                </button>
                {isCurrentUser && (
                    <button 
                        onClick={() => setActiveTab('likes')}
                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'likes' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}
                    >
                        <HeartPulse size={16} className="mx-auto mb-1" /> Likes
                    </button>
                )}
            </div>

            {/* Grid Content */}
            <div className="p-1 min-h-[300px]">
                {activeTab === 'videos' && (
                    <div className="grid grid-cols-3 gap-1">
                        {userVideos.length > 0 ? userVideos.map(video => (
                            <div 
                                key={video.id} 
                                className="aspect-[3/4] bg-gray-900 relative group cursor-pointer"
                                onClick={() => setPlayingVideo(video)}
                            >
                                <img src={video.thumbnailUrl} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white pointer-events-none">
                                    <Play size={24} fill="white" />
                                    <span className="font-bold text-sm">{video.views}</span>
                                </div>
                                {isCurrentUser && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDeleteVideo(video.id); }}
                                        className="absolute top-1 right-1 p-1.5 bg-black/60 hover:bg-red-500/80 backdrop-blur-sm rounded-full text-white transition-colors z-10"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        )) : (
                            <div className="col-span-3 py-20 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                                No videos uploaded
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'series' && (
                    <div className="grid grid-cols-2 gap-4 p-4">
                         {userSeries.length > 0 ? userSeries.map(s => (
                             <div key={s.id} className="bg-gray-900 rounded-xl overflow-hidden border border-white/5">
                                 <div className="aspect-video relative">
                                     <img src={s.coverUrl} className="w-full h-full object-cover" />
                                     <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-[9px] font-black text-white uppercase">{s.totalEpisodes} Eps</div>
                                 </div>
                                 <div className="p-3">
                                     <h4 className="text-sm font-bold text-white truncate">{s.title}</h4>
                                     <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{s.category}</p>
                                 </div>
                             </div>
                         )) : (
                            <div className="col-span-2 py-20 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                                No series created
                            </div>
                         )}
                    </div>
                )}

                {activeTab === 'posts' && (
                    <div className="grid grid-cols-3 gap-1">
                        {userPosts.length > 0 ? userPosts.map(post => (
                            <div key={post.id} onClick={() => setViewingPost(post)} className="aspect-square bg-gray-900 relative group cursor-pointer overflow-hidden">
                                {post.mediaUrl ? (
                                    post.mediaType === 'video' ? (
                                        <video src={post.mediaUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={post.mediaUrl} className="w-full h-full object-cover" />
                                    )
                                ) : (
                                    <div className="w-full h-full p-2 flex items-center justify-center text-[10px] text-gray-400 text-center leading-tight">
                                        {post.content.slice(0, 50)}...
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white pointer-events-none">
                                    <MessageCircle size={20} fill="white" />
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-3 py-20 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                                No social posts
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'likes' && (
                    <div className="col-span-3 py-20 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                        Private Collection
                    </div>
                )}
            </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
            <SettingsModal 
                user={user} 
                onClose={() => setShowSettings(false)} 
                onLogout={onLogout}
                onUpdateUser={onUpdateUser}
            />
        )}

        {/* Video Player Overlay */}
        {playingVideo && currentUser && (
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
                        onUnlock={() => {}}
                        onWatchAd={() => {}}
                        isFollowing={isFollowing}
                        onToggleFollow={handleToggleFollow}
                        isOwner={isCurrentUser}
                        onDelete={() => {}} 
                        currentUser={currentUser}
                    />
                </div>
            </div>
        )}

        {/* Post View Modal */}
        {viewingPost && currentUser && (
            <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex flex-col animate-fade-in">
               <div className="p-4 flex justify-between items-center border-b border-white/10 shrink-0 pt-12">
                <button onClick={() => setViewingPost(null)} className="text-gray-400 hover:text-white flex items-center gap-1.5">
                  <ChevronLeft size={20} /> <span className="font-black uppercase text-[9px] tracking-widest">Back</span>
                </button>
                <h2 className="text-lg font-black italic tracking-tighter uppercase text-white">Post Details</h2>
                <div className="w-10"></div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-32">
                  <div className="flex gap-3 mb-6 pb-6 border-b border-white/5">
                    <img src={viewingPost.avatarUrl} className="w-10 h-10 rounded-full border border-white/10" />
                    <div className="flex-1">
                       <h3 className="font-bold text-white text-sm">@{viewingPost.username}</h3>
                       <p className="text-xs text-gray-400 mt-1">{viewingPost.content}</p>
                       {viewingPost.mediaUrl && (
                           <div className="mt-3 rounded-xl overflow-hidden max-h-48 w-full border border-white/5">
                               {viewingPost.mediaType === 'video' ? (
                                   <video src={viewingPost.mediaUrl} className="w-full h-full object-cover" controls />
                               ) : (
                                   <img src={viewingPost.mediaUrl || ''} className="w-full h-full object-cover" />
                               )}
                           </div>
                       )}
                    </div>
                  </div>

                  <div className="space-y-5">
                       {postComments.length > 0 ? postComments.map(c => (
                           <div key={c.id} className="flex gap-3 animate-fade-in">
                               <img src={c.avatarUrl} className="w-7 h-7 rounded-full border border-white/10 shrink-0" />
                               <div className="flex-1">
                                 <div className="bg-gray-900/50 rounded-2xl p-3 border border-white/5">
                                   <span className="font-bold text-white text-[10px]">@{c.username}</span>
                                   <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{c.text}</p>
                                 </div>
                               </div>
                           </div>
                       )) : (
                         <div className="text-center py-20 text-gray-600 font-bold uppercase text-[9px] tracking-widest">No comments yet</div>
                       )}
                  </div>
              </div>

              <div className="p-4 bg-black border-t border-white/10 pb-10">
                  <div className="flex gap-2 bg-gray-900 rounded-[20px] p-1.5 border border-white/10">
                    <input 
                      type="text" 
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Comment..."
                      className="flex-1 bg-transparent px-3 text-[11px] text-white focus:outline-none"
                    />
                    <button 
                      onClick={handlePostComment}
                      disabled={!newComment.trim()}
                      className="bg-neon-purple text-white p-2 rounded-full active:scale-95 disabled:opacity-50"
                    >
                      <Send size={14} />
                    </button>
                  </div>
              </div>
            </div>
        )}
    </div>
  );
};