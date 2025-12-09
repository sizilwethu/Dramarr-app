
import React, { useState, useEffect, useRef } from 'react';
import { User, Video, Series, AdCampaign, CATEGORIES } from '../types';
import { api } from '../services/api';
import { Settings, Edit2, Grid, Folder, CreditCard, Shield, ChevronRight, DollarSign, Wallet, Play, FileText, HelpCircle, ArrowLeft, LogOut, User as UserIcon, Camera, Trash2, X, Megaphone, Target, Clock, BarChart3, ExternalLink, Activity, AlertCircle, Lock, Scale, Video as VideoIcon } from 'lucide-react';

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
  viewingUserId?: string; // New prop to view others
}

type ProfileSubView = 'main' | 'wallet' | 'settings' | 'support' | 'terms' | 'editProfile' | 'personalInfo' | 'createAd';

export const ProfileView: React.FC<ProfileViewProps> = ({ 
    user: currentUser, 
    videos, 
    series, 
    onLogout, 
    onOpenAdmin, 
    onUpdateUser, 
    onDeleteAccount,
    onDeleteVideo,
    onRemoveProfilePic,
    onOpenAnalytics,
    viewingUserId
}) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'series'>('grid');
  const [currentView, setCurrentView] = useState<ProfileSubView>('main');
  
  // Profile Data State (Can be current user or viewed user)
  const [profileUser, setProfileUser] = useState<User>(currentUser);
  const isOwnProfile = !viewingUserId || viewingUserId === currentUser.id;

  // Edit Profile States
  const [editUsername, setEditUsername] = useState(currentUser.username);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Personal Info State
  const [pInfo, setPInfo] = useState({
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      dob: currentUser.dob || '',
      country: currentUser.country || '',
      gender: currentUser.gender || '',
      address: currentUser.address || ''
  });

  // Wallet State
  const [paypalEmail, setPaypalEmail] = useState(currentUser.paypalEmail || '');

  // Ad State
  const [adForm, setAdForm] = useState({ title: '', imageUrl: '', link: '', budget: 25 });
  const [myCampaigns, setMyCampaigns] = useState<AdCampaign[]>([]);

  // Legal Tabs
  const [legalTab, setLegalTab] = useState<'tos' | 'privacy'>('tos');

  const userVideos = videos.filter(v => v.creatorId === profileUser.id);
  const userSeries = series.filter(s => s.creatorId === profileUser.id);

  // Load viewed user profile
  useEffect(() => {
      if (viewingUserId && viewingUserId !== currentUser.id) {
          api.getUserProfile(viewingUserId).then(u => {
              if(u) setProfileUser(u);
          });
      } else {
          setProfileUser(currentUser);
      }
  }, [viewingUserId, currentUser]);

  const handleSaveProfile = async () => {
      await api.updateProfile(currentUser.id, { username: editUsername, bio: editBio });
      onUpdateUser({ username: editUsername, bio: editBio });
      setCurrentView('main');
  };

  const handleSavePersonalInfo = async () => {
      // In a real app, update DB. For now mock update user state
      onUpdateUser(pInfo);
      alert("Personal Info Updated");
      setCurrentView('settings');
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          try {
              const url = await api.updateAvatar(currentUser.id, e.target.files[0]);
              onUpdateUser({ avatarUrl: url });
              alert("Profile photo updated!");
          } catch (err) {
              console.error(err);
              alert("Failed to upload photo");
          }
      }
  };

  const handleWithdraw = () => {
      if(currentUser.coins < 450000) {
          alert("Minimum withdrawal amount is 450,000 Coins ($10).");
          return;
      }
      if(!paypalEmail) {
          alert("Please enter a PayPal email.");
          return;
      }
      alert("Withdrawal request sent! Admin will review shortly.");
  };

  const handleCreateAd = () => {
      alert(`Campaign "${adForm.title}" created! $${adForm.budget} deducted.`);
      setMyCampaigns([...myCampaigns, {
          id: Date.now().toString(),
          userId: currentUser.id,
          title: adForm.title,
          imageUrl: adForm.imageUrl || 'https://via.placeholder.com/300',
          budget: adForm.budget,
          impressions: 0,
          clicks: 0,
          status: 'active'
      }]);
      setCurrentView('settings');
  };

  // --- SUB-VIEWS ---

  if (currentView === 'wallet' && isOwnProfile) {
      return (
        <div className="h-full bg-neon-dark pt-12 px-4 pb-20 overflow-y-auto animate-fade-in">
             <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setCurrentView('main')}>
                  <ArrowLeft size={24} /> <span className="font-bold text-lg">My Wallet</span>
             </div>

             <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 mb-6 shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={100} className="text-white"/></div>
                 <p className="text-gray-400 text-sm font-bold uppercase mb-1">Total Balance</p>
                 <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-2">
                     <span className="text-yellow-400">●</span> {currentUser.coins.toLocaleString()}
                 </h1>
                 <div className="bg-black/30 rounded-lg p-3 inline-block">
                     <p className="text-xs text-gray-300">Est. Value: <span className="text-green-400 font-bold">${(currentUser.coins / 45000).toFixed(2)}</span></p>
                 </div>
             </div>

             <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-6">
                 <h3 className="font-bold text-white mb-4 flex items-center gap-2"><CreditCard size={18}/> Withdrawal</h3>
                 <div className="space-y-3">
                     <div>
                         <label className="text-xs text-gray-500 font-bold ml-1">PayPal Email</label>
                         <input 
                            type="email" 
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            placeholder="user@example.com"
                            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-neon-purple outline-none"
                         />
                     </div>
                     <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-gradient-to-r from-neon-purple to-neon-pink transition-all duration-500" 
                            style={{ width: `${Math.min((currentUser.coins / 450000) * 100, 100)}%` }}
                         />
                     </div>
                     <p className="text-xs text-gray-500 text-right">{Math.floor((currentUser.coins / 450000) * 100)}% to payout threshold</p>
                     
                     <button 
                        onClick={handleWithdraw}
                        disabled={currentUser.coins < 450000}
                        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3 rounded-xl transition-colors"
                     >
                         Request Payout ($10 Min)
                     </button>
                 </div>
             </div>
        </div>
      );
  }

  if (currentView === 'settings' && isOwnProfile) {
      return (
        <div className="h-full bg-neon-dark pt-12 px-4 pb-20 overflow-y-auto animate-fade-in">
             <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setCurrentView('main')}>
                  <ArrowLeft size={24} /> <span className="font-bold text-lg">Settings</span>
             </div>

             <div className="space-y-3">
                 <button onClick={() => setCurrentView('personalInfo')} className="w-full bg-gray-900 p-4 rounded-xl flex justify-between items-center hover:bg-gray-800">
                     <div className="flex items-center gap-3">
                         <UserIcon size={20} className="text-neon-purple" />
                         <span className="font-bold text-sm">Personal Info</span>
                     </div>
                     <ChevronRight size={16} className="text-gray-500" />
                 </button>

                 <button onClick={() => setCurrentView('createAd')} className="w-full bg-gray-900 p-4 rounded-xl flex justify-between items-center hover:bg-gray-800">
                     <div className="flex items-center gap-3">
                         <Megaphone size={20} className="text-blue-400" />
                         <span className="font-bold text-sm">Ad Manager</span>
                     </div>
                     <ChevronRight size={16} className="text-gray-500" />
                 </button>

                 <button className="w-full bg-gray-900 p-4 rounded-xl flex justify-between items-center hover:bg-gray-800">
                     <div className="flex items-center gap-3">
                         <Shield size={20} className="text-green-400" />
                         <span className="font-bold text-sm">Get Verified ($25/mo)</span>
                     </div>
                     <ChevronRight size={16} className="text-gray-500" />
                 </button>

                 <button onClick={() => setCurrentView('support')} className="w-full bg-gray-900 p-4 rounded-xl flex justify-between items-center hover:bg-gray-800">
                     <div className="flex items-center gap-3">
                         <HelpCircle size={20} className="text-yellow-400" />
                         <span className="font-bold text-sm">Support & FAQ</span>
                     </div>
                     <ChevronRight size={16} className="text-gray-500" />
                 </button>

                 <button onClick={() => setCurrentView('terms')} className="w-full bg-gray-900 p-4 rounded-xl flex justify-between items-center hover:bg-gray-800">
                     <div className="flex items-center gap-3">
                         <FileText size={20} className="text-gray-400" />
                         <span className="font-bold text-sm">Terms & Privacy</span>
                     </div>
                     <ChevronRight size={16} className="text-gray-500" />
                 </button>

                 {currentUser.isAdmin && (
                    <button onClick={onOpenAdmin} className="w-full bg-red-900/20 border border-red-900/50 p-4 rounded-xl flex justify-between items-center hover:bg-red-900/30">
                        <div className="flex items-center gap-3">
                            <Shield size={20} className="text-red-500" />
                            <span className="font-bold text-sm text-red-500">Admin Dashboard</span>
                        </div>
                    </button>
                 )}

                 <div className="pt-6 space-y-3">
                     <button onClick={onLogout} className="w-full border border-gray-700 p-3 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:bg-gray-900 hover:text-white">
                         <LogOut size={18} /> Log Out
                     </button>
                     <button onClick={onDeleteAccount} className="w-full border border-red-900/30 p-3 rounded-xl flex items-center justify-center gap-2 text-red-500 hover:bg-red-900/10">
                         Delete Account
                     </button>
                 </div>
             </div>
        </div>
      );
  }

  if (currentView === 'personalInfo' && isOwnProfile) {
      return (
        <div className="h-full bg-neon-dark pt-12 px-4 pb-20 overflow-y-auto animate-fade-in">
             <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setCurrentView('settings')}>
                  <ArrowLeft size={24} /> <span className="font-bold text-lg">Personal Info</span>
             </div>
             <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="text-xs text-gray-500 font-bold ml-1">First Name</label>
                         <input type="text" value={pInfo.firstName} onChange={e => setPInfo({...pInfo, firstName: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:border-neon-purple outline-none" />
                     </div>
                     <div>
                         <label className="text-xs text-gray-500 font-bold ml-1">Last Name</label>
                         <input type="text" value={pInfo.lastName} onChange={e => setPInfo({...pInfo, lastName: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:border-neon-purple outline-none" />
                     </div>
                 </div>
                 <div>
                     <label className="text-xs text-gray-500 font-bold ml-1">Date of Birth</label>
                     <input type="date" value={pInfo.dob} onChange={e => setPInfo({...pInfo, dob: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:border-neon-purple outline-none" />
                 </div>
                 <div>
                     <label className="text-xs text-gray-500 font-bold ml-1">Address</label>
                     <textarea value={pInfo.address} onChange={e => setPInfo({...pInfo, address: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:border-neon-purple outline-none min-h-[80px]" />
                 </div>
                 <button onClick={handleSavePersonalInfo} className="w-full bg-white text-black font-bold py-3 rounded-xl mt-4">Save Information</button>
             </div>
        </div>
      );
  }

  if (currentView === 'createAd' && isOwnProfile) {
      return (
        <div className="h-full bg-neon-dark pt-12 px-4 pb-20 overflow-y-auto animate-fade-in">
             <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setCurrentView('settings')}>
                  <ArrowLeft size={24} /> <span className="font-bold text-lg">Create Advertisement</span>
             </div>
             
             {/* Ad Preview */}
             <div className="mb-6">
                 <p className="text-xs text-gray-500 font-bold mb-2 uppercase">Preview</p>
                 <div className="bg-black border border-gray-800 rounded-xl overflow-hidden max-w-[300px] mx-auto">
                     <div className="p-3 flex items-center gap-2">
                         <img src={currentUser.avatarUrl} className="w-6 h-6 rounded-full" />
                         <span className="text-xs font-bold text-white">{currentUser.username}</span>
                         <span className="bg-yellow-400 text-black text-[8px] font-bold px-1 rounded">Sponsored</span>
                     </div>
                     <div className="aspect-video bg-gray-800">
                         {adForm.imageUrl && <img src={adForm.imageUrl} className="w-full h-full object-cover" />}
                     </div>
                     <div className="p-3">
                         <p className="text-xs text-white mb-2">{adForm.title || "Your ad text here..."}</p>
                         <button className="w-full bg-blue-600 text-white text-xs font-bold py-1.5 rounded flex items-center justify-center gap-1">
                             Learn More <ExternalLink size={12}/>
                         </button>
                     </div>
                 </div>
             </div>

             <div className="space-y-4">
                 <div>
                     <label className="text-xs text-gray-500 font-bold ml-1">Ad Title / Content</label>
                     <input type="text" value={adForm.title} onChange={e => setAdForm({...adForm, title: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white outline-none" placeholder="Best product ever!" />
                 </div>
                 <div>
                     <label className="text-xs text-gray-500 font-bold ml-1">Image URL</label>
                     <input type="text" value={adForm.imageUrl} onChange={e => setAdForm({...adForm, imageUrl: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white outline-none" placeholder="https://..." />
                 </div>
                 <div>
                     <label className="text-xs text-gray-500 font-bold ml-1">Destination Link</label>
                     <input type="text" value={adForm.link} onChange={e => setAdForm({...adForm, link: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white outline-none" placeholder="https://yourwebsite.com" />
                 </div>
                 <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                     <p className="text-sm font-bold text-white mb-1">Budget: $25</p>
                     <p className="text-xs text-gray-500">Reaches approx 1,000 users. Runs for 7 days.</p>
                 </div>
                 <button onClick={handleCreateAd} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-2">Pay $25 & Launch</button>
             </div>

             {/* Campaigns List */}
             {myCampaigns.length > 0 && (
                 <div className="mt-8">
                     <h3 className="font-bold text-white mb-3">Your Campaigns</h3>
                     <div className="space-y-3">
                         {myCampaigns.map(camp => (
                             <div key={camp.id} className="bg-gray-900 p-3 rounded-xl border border-gray-800 flex justify-between items-center">
                                 <div>
                                     <p className="font-bold text-sm text-white">{camp.title}</p>
                                     <p className="text-xs text-gray-500">{camp.impressions} Views • {camp.clicks} Clicks</p>
                                 </div>
                                 <div className={`px-2 py-1 rounded text-[10px] font-bold ${camp.status === 'active' ? 'bg-green-900/30 text-green-500' : 'bg-gray-800 text-gray-500'}`}>
                                     {camp.status.toUpperCase()}
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
             )}
        </div>
      );
  }

  if (currentView === 'support') {
      return (
          <div className="h-full bg-neon-dark pt-12 px-4 pb-20 overflow-y-auto animate-fade-in">
             <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setCurrentView('settings')}>
                  <ArrowLeft size={24} /> <span className="font-bold text-lg">Support</span>
             </div>
             <div className="space-y-4">
                 <div className="bg-gray-900 p-4 rounded-xl">
                     <h3 className="font-bold text-white mb-2">How do I earn coins?</h3>
                     <p className="text-sm text-gray-400">Unlock videos or complete daily tasks to earn coins. Creators also earn when users unlock their content.</p>
                 </div>
                 <div className="bg-gray-900 p-4 rounded-xl">
                     <h3 className="font-bold text-white mb-2">How to withdraw?</h3>
                     <p className="text-sm text-gray-400">Go to Wallet. You need a minimum of 450,000 coins ($10) to request a PayPal payout.</p>
                 </div>
                 <div className="pt-4">
                     <h3 className="font-bold text-white mb-2">Contact Us</h3>
                     <textarea className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white h-32 mb-2" placeholder="Describe your issue..."></textarea>
                     <button onClick={() => alert("Message sent!")} className="w-full bg-white text-black font-bold py-3 rounded-xl">Send Message</button>
                 </div>
             </div>
          </div>
      );
  }

  if (currentView === 'terms') {
      return (
          <div className="h-full bg-neon-dark pt-12 px-4 pb-20 overflow-y-auto animate-fade-in flex flex-col">
             <div className="flex items-center gap-2 mb-4 cursor-pointer flex-shrink-0" onClick={() => setCurrentView('settings')}>
                  <ArrowLeft size={24} /> <span className="font-bold text-lg">Legal</span>
             </div>

             <div className="flex bg-gray-900 p-1 rounded-xl mb-6 flex-shrink-0">
                 <button 
                    onClick={() => setLegalTab('tos')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${legalTab === 'tos' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
                 >
                    Terms of Service
                 </button>
                 <button 
                    onClick={() => setLegalTab('privacy')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${legalTab === 'privacy' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
                 >
                    Privacy Policy
                 </button>
             </div>

             <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
                 {legalTab === 'tos' ? (
                     <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
                         <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                             <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2"><Scale size={18} className="text-neon-purple"/> 1. Acceptance of Terms</h3>
                             <p>By downloading, installing, or using the dramarr app ("Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform. You must be at least 13 years old to use the Platform. If you are under 18, you represent that you have your parent or guardian's permission to use the Service.</p>
                         </div>

                         <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                             <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2"><DollarSign size={18} className="text-yellow-400"/> 2. Virtual Currency & Monetization</h3>
                             <ul className="list-disc pl-4 space-y-2">
                                 <li><strong>Credits:</strong> Used to unlock premium content. Can be purchased or earned via ads. Credits have no real-world monetary value and cannot be exchanged for cash.</li>
                                 <li><strong>Coins:</strong> Earned by creators or via rewards. Coins can be redeemed for real currency subject to our withdrawal thresholds.</li>
                                 <li><strong>Withdrawals:</strong> Creators may request a payout once their wallet balance reaches 450,000 Coins (equivalent to $10 USD). Dramarr reserves the right to withhold payments for suspicious activity or policy violations.</li>
                             </ul>
                         </div>

                         <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                             <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2"><VideoIcon size={18} className="text-neon-pink"/> 3. User Generated Content (UGC)</h3>
                             <p>You retain ownership of the content you upload. However, by uploading content to dramarr, you grant us a non-exclusive, worldwide, royalty-free license to host, display, and distribute your content. You represent that you own all rights to your content and that it does not violate any third-party copyrights.</p>
                         </div>

                         <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                             <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2"><Shield size={18} className="text-red-500"/> 4. Prohibited Conduct</h3>
                             <p>You agree not to upload content that contains:</p>
                             <ul className="list-disc pl-4 mt-2 space-y-1">
                                 <li>Nudity, sexual content, or pornography.</li>
                                 <li>Hate speech, harassment, or threats.</li>
                                 <li>Illegal acts or promotion of illegal activities.</li>
                                 <li>Spam or automated bot activity.</li>
                             </ul>
                             <p className="mt-2">We reserve the right to ban any account violating these rules without prior notice.</p>
                         </div>

                         <p className="text-xs text-gray-500 text-center pt-4">Last Updated: October 25, 2023</p>
                     </div>
                 ) : (
                     <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
                         <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                             <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2"><Activity size={18} className="text-blue-400"/> 1. Information We Collect</h3>
                             <ul className="list-disc pl-4 space-y-2">
                                 <li><strong>Account Info:</strong> Username, email, date of birth, and profile picture provided during sign-up.</li>
                                 <li><strong>Usage Data:</strong> Videos watched, interactions (likes/comments), and time spent on the app.</li>
                                 <li><strong>Device Data:</strong> IP address, device type, and operating system version. This is used for security and to prevent view count fraud.</li>
                                 <li><strong>Payment Info:</strong> PayPal email addresses for payouts (we do not store credit card numbers directly; these are handled by third-party processors).</li>
                             </ul>
                         </div>

                         <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                             <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2"><Target size={18} className="text-green-400"/> 2. How We Use Your Data</h3>
                             <p>We use your information to:</p>
                             <ul className="list-disc pl-4 mt-2 space-y-1">
                                 <li>Provide and improve the dramarr service.</li>
                                 <li>Personalize your "For You" feed.</li>
                                 <li>Process transactions and creator payouts.</li>
                                 <li>Detect and prevent fraud or abuse.</li>
                                 <li>Serve relevant advertisements.</li>
                             </ul>
                         </div>

                         <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                             <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2"><Lock size={18} className="text-orange-400"/> 3. Data Sharing & Security</h3>
                             <p>We do not sell your personal data to third parties. We may share data with service providers (e.g., Google Cloud/Supabase for hosting, payment processors) strictly for operational purposes. We implement industry-standard security measures to protect your data, though no method of transmission is 100% secure.</p>
                         </div>

                         <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                             <h3 className="text-white font-bold text-lg mb-2">4. Contact Us</h3>
                             <p>If you have questions about this Privacy Policy, please contact us at <span className="text-neon-purple">privacy@dramarr.app</span>.</p>
                         </div>

                         <p className="text-xs text-gray-500 text-center pt-4">Effective Date: October 25, 2023</p>
                     </div>
                 )}
             </div>
          </div>
      );
  }

  if (currentView === 'editProfile' && isOwnProfile) {
      return (
          <div className="h-full bg-neon-dark pt-12 px-4 pb-20 overflow-y-auto animate-fade-in">
              <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setCurrentView('main')}>
                  <ArrowLeft size={24} /> <span className="font-bold text-lg">Edit Profile</span>
              </div>
              
              <div className="flex flex-col items-center mb-8">
                  <div className="relative w-24 h-24 mb-4">
                      <img src={currentUser.avatarUrl} className="w-full h-full rounded-full object-cover border-4 border-gray-800" />
                      <div 
                        className="absolute bottom-0 right-0 p-2 bg-neon-purple rounded-full border-2 border-black cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                          <Camera size={16} className="text-white" />
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleAvatarChange}
                      />
                  </div>
                  <div className="flex gap-4 text-xs font-bold">
                    <p className="text-neon-purple cursor-pointer" onClick={() => fileInputRef.current?.click()}>Change Photo</p>
                    <p onClick={onRemoveProfilePic} className="text-red-500 cursor-pointer">Remove Photo</p>
                  </div>
              </div>
              
               <div className="space-y-4">
                  <div>
                      <label className="text-xs text-gray-500 font-bold uppercase ml-1">Username</label>
                      <input 
                        type="text" 
                        value={editUsername} 
                        onChange={(e) => setEditUsername(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-neon-purple outline-none"
                      />
                  </div>
                  <div>
                      <label className="text-xs text-gray-500 font-bold uppercase ml-1">Bio</label>
                      <textarea 
                        value={editBio} 
                        onChange={(e) => setEditBio(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-neon-purple outline-none min-h-[100px]"
                      />
                  </div>
                  <button onClick={handleSaveProfile} className="w-full bg-white text-black font-bold py-4 rounded-xl mt-4">Save Changes</button>
              </div>
          </div>
      )
  }

  // MAIN PROFILE VIEW
  return (
    <div className="h-full bg-neon-dark pt-12 pb-20 flex flex-col animate-fade-in">
      <div className="px-6 mb-6">
        <div className="flex justify-between items-start mb-4">
            <div className="relative">
                <img src={profileUser.avatarUrl} className="w-20 h-20 rounded-full border-2 border-neon-purple object-cover" />
                {profileUser.isVerified && <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black text-[10px] font-bold">✓</div>}
            </div>
            {isOwnProfile && (
                <div className="flex gap-2">
                    <button onClick={() => setCurrentView('wallet')} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700"><Wallet size={20} className="text-white" /></button>
                    <button onClick={() => setCurrentView('settings')} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700"><Settings size={20} className="text-white" /></button>
                </div>
            )}
        </div>
        
        <h2 className="text-xl font-bold text-white mb-1">@{profileUser.username}</h2>
        <p className="text-sm text-gray-400 mb-4">{profileUser.bio}</p>

        <div className="flex justify-between items-center text-center mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
            <div>
                <div className="font-bold text-lg text-white">{profileUser.followers}</div>
                <div className="text-xs text-gray-500">Followers</div>
            </div>
            <div className="w-[1px] h-8 bg-gray-800"></div>
             <div>
                <div className="font-bold text-lg text-white">{profileUser.following.length}</div>
                <div className="text-xs text-gray-500">Following</div>
            </div>
            <div className="w-[1px] h-8 bg-gray-800"></div>
             <div>
                <div className="font-bold text-lg text-white">12.5k</div>
                <div className="text-xs text-gray-500">Likes</div>
            </div>
        </div>

        {isOwnProfile ? (
            <div className="flex gap-2">
                <button onClick={() => setCurrentView('editProfile')} className="flex-1 bg-gray-800 text-white font-bold py-2 rounded-lg text-sm border border-gray-700">Edit Profile</button>
                <button className="flex-1 bg-gray-800 text-white font-bold py-2 rounded-lg text-sm border border-gray-700">Share Profile</button>
            </div>
        ) : (
            <div className="flex gap-2">
                <button className="flex-1 bg-neon-pink text-white font-bold py-2 rounded-lg text-sm">Follow</button>
                <button className="flex-1 bg-gray-800 text-white font-bold py-2 rounded-lg text-sm border border-gray-700">Message</button>
            </div>
        )}
        
        {isOwnProfile && (
            <button 
                onClick={onOpenAnalytics}
                className="w-full mt-3 bg-purple-900/20 text-purple-400 font-bold py-2 rounded-lg text-sm border border-purple-900/50 flex items-center justify-center gap-2 hover:bg-purple-900/40 transition-colors"
            >
                <BarChart3 size={14} /> Creator Analytics
            </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button 
            className={`flex-1 py-3 flex items-center justify-center ${activeTab === 'grid' ? 'border-b-2 border-white text-white' : 'text-gray-500'}`}
            onClick={() => setActiveTab('grid')}
        >
            <Grid size={20} />
        </button>
        <button 
            className={`flex-1 py-3 flex items-center justify-center ${activeTab === 'series' ? 'border-b-2 border-white text-white' : 'text-gray-500'}`}
            onClick={() => setActiveTab('series')}
        >
            <Folder size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-black p-1">
        {activeTab === 'grid' ? (
            <div className="grid grid-cols-3 gap-0.5">
                {userVideos.map(v => (
                    <div key={v.id} className="relative aspect-[3/4] bg-gray-900 group">
                         <img src={v.thumbnailUrl} className="w-full h-full object-cover" />
                         <div className="absolute bottom-1 left-1 flex items-center gap-1 text-white shadow-black drop-shadow-md">
                             <Play size={10} fill="white" /> <span className="text-[10px] font-bold">{v.likes}</span>
                         </div>
                         {isOwnProfile && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(window.confirm("Delete this video?")) onDeleteVideo(v.id);
                                }}
                                className="absolute top-1 right-1 bg-red-900/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={12} className="text-white" />
                            </button>
                         )}
                    </div>
                ))}
                {userVideos.length === 0 && <div className="col-span-3 text-center text-gray-500 py-10">No videos yet</div>}
            </div>
        ) : (
             <div className="grid grid-cols-2 gap-2 p-2">
                 {userSeries.map(s => (
                     <div key={s.id} className="bg-gray-900 rounded-lg overflow-hidden">
                         <div className="aspect-[3/4] relative">
                             <img src={s.coverUrl} className="w-full h-full object-cover" />
                             <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white font-bold">{s.totalEpisodes} Eps</div>
                         </div>
                         <div className="p-2">
                             <h4 className="font-bold text-white text-sm truncate">{s.title}</h4>
                             <p className="text-[10px] text-gray-500">{s.category}</p>
                         </div>
                     </div>
                 ))}
                 {userSeries.length === 0 && <div className="col-span-2 text-center text-gray-500 py-10">No series created</div>}
             </div>
        )}
      </div>
    </div>
  );
};
