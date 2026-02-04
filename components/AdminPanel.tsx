
import React, { useState } from 'react';
import { User, PayoutRequest, CREATOR_TIERS } from '../types';
import { ChevronLeft, CheckCircle, XCircle, FileText, TrendingUp, Users, MapPin, DollarSign, ShieldCheck, MoreHorizontal, Settings, BarChart3, Lock, Eye, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface AdminPanelProps {
  user: User;
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<'fleet' | 'monetization' | 'verification'>('fleet');
  
  if (!user.isAdmin) return null;

  const revenueData = [
    { name: 'Mon', revenue: 4200 },
    { name: 'Tue', revenue: 3800 },
    { name: 'Wed', revenue: 5100 },
    { name: 'Thu', revenue: 7200 },
    { name: 'Fri', revenue: 8400 },
    { name: 'Sat', revenue: 12000 },
    { name: 'Sun', revenue: 9500 },
  ];

  const pendingPayouts: PayoutRequest[] = [
    { id: 'pay1', userId: 'u2', username: 'DramaBox', amount: 850.20, method: 'PayPal', status: 'pending', timestamp: Date.now() },
    { id: 'pay2', userId: 'u3', username: 'ThrillerShorts', amount: 420.50, method: 'Bank', status: 'pending', timestamp: Date.now() - 3600000 },
  ];

  const renderMonetization = () => (
    <div className="space-y-8 animate-fade-in">
        {/* Platform Revenue Stats */}
        <div className="bg-gray-900 rounded-[32px] p-8 border border-white/5">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-1">Global Ad Revenue</h3>
                    <p className="text-4xl font-black text-white italic tracking-tighter">$50,240.50</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Profit (45%)</p>
                    <p className="text-xl font-black text-neon-purple tracking-tighter">$22,608.22</p>
                </div>
            </div>
            
            <div className="h-48 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 10}} />
                        <Tooltip contentStyle={{backgroundColor: '#111', border: 'none', borderRadius: '12px'}} />
                        <Bar dataKey="revenue" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Payout Management */}
        <div>
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                <DollarSign size={14} className="text-green-500" /> Pending Payouts
            </h4>
            <div className="space-y-3">
                {pendingPayouts.map(pay => (
                    <div key={pay.id} className="bg-gray-900/50 p-6 rounded-[24px] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center font-black text-neon-purple">{pay.username[0]}</div>
                            <div>
                                <h5 className="font-bold text-white text-sm">@{pay.username}</h5>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{pay.method} • {new Date(pay.timestamp).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <p className="text-xl font-black text-white">${pay.amount.toFixed(2)}</p>
                            <div className="flex gap-2">
                                <button className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500/20 transition-all border border-green-500/20"><CheckCircle size={18}/></button>
                                <button className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20"><XCircle size={18}/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Tier / CPM Controls */}
        <div className="bg-gray-900/50 rounded-[32px] p-8 border border-white/5">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6">Global Monetization Logic</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.values(CREATOR_TIERS).map(tier => (
                    <div key={tier.name} className="bg-black/40 p-5 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">{tier.name}</p>
                            <Settings size={14} className="text-gray-600 hover:text-white cursor-pointer transition-colors" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-baseline">
                                <span className="text-[9px] text-gray-500 font-bold uppercase">CPM Range</span>
                                <span className="text-sm font-black text-white">${tier.cpm}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-[9px] text-gray-500 font-bold uppercase">Split</span>
                                <span className="text-sm font-black text-neon-purple">{tier.share * 100}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 flex gap-3">
                <button className="flex-1 bg-white text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Apply Global Updates</button>
                <button className="p-4 bg-gray-800 rounded-xl text-red-500 hover:bg-red-500/10 transition-all"><AlertTriangle size={20} /></button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="h-full bg-black flex flex-col pt-12 pb-20 overflow-y-auto no-scrollbar">
      <div className="px-6 mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 bg-gray-900 rounded-full text-white"><ChevronLeft size={24}/></button>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-neon-purple">Admin Core</h2>
        </div>
      </div>

      <div className="px-6 mb-8">
          <div className="bg-gray-900 p-1 rounded-2xl flex gap-1 border border-white/5">
              {[
                { id: 'fleet', label: 'Fleet Control', icon: MapPin },
                { id: 'monetization', label: 'Monetization', icon: DollarSign },
                { id: 'verification', label: 'ID Verification', icon: ShieldCheck }
              ].map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}
                  >
                      <t.icon size={16} /> <span className="hidden md:inline">{t.label}</span>
                  </button>
              ))}
          </div>
      </div>

      <div className="flex-1 px-6 pb-20">
        {activeTab === 'monetization' ? renderMonetization() : (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900 p-6 rounded-[32px] border border-white/5">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Global Active</p>
                    <p className="text-3xl font-black text-white">1,245</p>
                    <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold mt-2">
                        <TrendingUp size={12}/> +12%
                    </div>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-[32px] border border-white/5">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Fleet</p>
                    <p className="text-3xl font-black text-white">4,890</p>
                    <div className="flex items-center gap-1 text-blue-500 text-[10px] font-bold mt-2">
                        <Users size={12}/> Online
                    </div>
                    </div>
                </div>

                <div className="bg-gray-900/50 p-10 rounded-[48px] border border-white/5 text-center opacity-30">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Section Under Construction</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
