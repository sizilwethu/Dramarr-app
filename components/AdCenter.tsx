
import React, { useState } from 'react';
import { AdCampaign, User } from '../types';
import { Megaphone, TrendingUp, MousePointer2, Eye, Plus, ChevronLeft, X, DollarSign, Image as ImageIcon, CheckCircle, BarChart3, AlertCircle } from 'lucide-react';

interface AdCenterProps {
    user: User;
    onBack: () => void;
}

export const AdCenter: React.FC<AdCenterProps> = ({ user, onBack }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([
        { id: 'ad1', userId: user.id, title: 'Summer Collection', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop', budget: 50, impressions: 12400, clicks: 450, status: 'active' },
        { id: 'ad2', userId: user.id, title: 'Drama Night Promo', imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop', budget: 25, impressions: 8900, clicks: 120, status: 'expired' }
    ]);

    // Create Form State
    const [newTitle, setNewTitle] = useState('');
    const [newBudget, setNewBudget] = useState(25);
    const [newImage, setNewImage] = useState<string | null>(null);

    const handleCreateCampaign = () => {
        if (!newTitle || !newImage) return;
        const newAd: AdCampaign = {
            id: 'ad_' + Date.now(),
            userId: user.id,
            title: newTitle,
            imageUrl: newImage,
            budget: newBudget,
            impressions: 0,
            clicks: 0,
            status: 'active'
        };
        setCampaigns([newAd, ...campaigns]);
        setIsCreating(false);
        setNewTitle('');
        setNewImage(null);
    };

    return (
        <div className="h-full bg-black pt-12 md:pt-6 pb-20 flex flex-col animate-fade-in max-w-5xl mx-auto w-full overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="px-6 mb-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Megaphone className="text-neon-pink" /> Ad Center
                    </h1>
                </div>
                <button 
                    onClick={() => setIsCreating(true)}
                    className="bg-neon-purple text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-neon-purple/20"
                >
                    <Plus size={20} /> Launch Campaign
                </button>
            </div>

            <div className="px-6 space-y-8">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-900/50 p-6 rounded-3xl border border-white/5 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
                            <Eye size={14} /> Impressions
                        </div>
                        <p className="text-3xl font-black text-white">21.3k</p>
                        <div className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                            <TrendingUp size={10} /> +12% this week
                        </div>
                    </div>
                    <div className="bg-gray-900/50 p-6 rounded-3xl border border-white/5 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
                            <MousePointer2 size={14} /> Total Clicks
                        </div>
                        <p className="text-3xl font-black text-white">570</p>
                        <div className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                            <TrendingUp size={10} /> +5.2% average CTR
                        </div>
                    </div>
                    <div className="bg-gray-900/50 p-6 rounded-3xl border border-white/5 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
                            <DollarSign size={14} /> Ad Spend
                        </div>
                        <p className="text-3xl font-black text-white">$75.00</p>
                        <div className="text-[10px] text-gray-500 font-bold">Remaining: $125.00</div>
                    </div>
                </div>

                {/* Campaign List */}
                <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">Your Campaigns</h3>
                    <div className="space-y-4">
                        {campaigns.map(ad => (
                            <div key={ad.id} className="bg-gray-900/40 rounded-3xl p-4 border border-white/5 flex flex-col md:flex-row gap-6 items-center">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                                    <img src={ad.imageUrl} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                        <h4 className="font-bold text-white text-lg">{ad.title}</h4>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${ad.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                                            {ad.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">Daily Budget: <span className="text-white">${ad.budget}</span></p>
                                </div>
                                <div className="grid grid-cols-2 gap-8 text-center px-4">
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Impressions</p>
                                        <p className="text-white font-black">{ad.impressions.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Clicks</p>
                                        <p className="text-white font-black">{ad.clicks.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-3 bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors">
                                        <BarChart3 size={20} />
                                    </button>
                                    <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all">
                                        Manage
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-gray-900 w-full max-w-lg rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">New Campaign</h3>
                            <button onClick={() => setIsCreating(false)} className="p-2 bg-gray-800 rounded-full text-white"><X size={20}/></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Campaign Name</label>
                                <input 
                                    type="text" 
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    placeholder="e.g. Drama Series Promo"
                                    className="w-full bg-black/50 border border-gray-800 rounded-2xl p-4 text-white focus:border-neon-pink outline-none transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Daily Budget ($)</label>
                                    <input 
                                        type="number" 
                                        value={newBudget}
                                        onChange={e => setNewBudget(Number(e.target.value))}
                                        className="w-full bg-black/50 border border-gray-800 rounded-2xl p-4 text-white focus:border-neon-pink outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Creative Asset</label>
                                    <button 
                                        onClick={() => setNewImage('https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?w=400&h=600&fit=crop')}
                                        className={`w-full h-[58px] border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 transition-all ${newImage ? 'border-neon-purple text-neon-purple bg-neon-purple/5' : 'border-gray-800 text-gray-600 hover:border-gray-600'}`}
                                    >
                                        {newImage ? <CheckCircle size={20} /> : <ImageIcon size={20} />}
                                        <span className="text-xs font-bold">{newImage ? 'Asset Selected' : 'Add Image'}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-neon-purple/10 border border-neon-purple/20 p-4 rounded-2xl flex gap-3">
                                <AlertCircle size={20} className="text-neon-purple shrink-0" />
                                <p className="text-[11px] text-gray-400 leading-relaxed">
                                    Your campaign will reach approximately <span className="text-white font-bold">15,000 users</span> based on your $25 daily budget. Assets are reviewed within 24 hours.
                                </p>
                            </div>

                            <button 
                                onClick={handleCreateCampaign}
                                disabled={!newTitle || !newImage}
                                className="w-full bg-neon-pink text-white font-bold py-4 rounded-2xl shadow-lg shadow-neon-pink/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                Launch Ad Campaign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
