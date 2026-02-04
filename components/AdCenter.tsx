
import React, { useState } from 'react';
import { AdCampaign, User, CATEGORIES } from '../types';
import { Megaphone, TrendingUp, MousePointer2, Eye, Plus, ChevronLeft, X, DollarSign, Image as ImageIcon, CheckCircle, BarChart3, AlertCircle, Globe, Users, Target, Calendar, CreditCard, ChevronRight } from 'lucide-react';

interface AdCenterProps {
    user: User;
    onBack: () => void;
}

const COUNTRIES = ["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "Brazil", "India", "Global"];

export const AdCenter: React.FC<AdCenterProps> = ({ user, onBack }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([
        { id: 'ad1', userId: user.id, title: 'Summer Collection', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop', budget: 50, impressions: 12400, clicks: 450, status: 'active', targetCountry: 'Global' },
        { id: 'ad2', userId: user.id, title: 'Drama Night Promo', imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop', budget: 25, impressions: 8900, clicks: 120, status: 'expired', targetCountry: 'United States' }
    ]);

    // Wizard State
    const [step, setStep] = useState(1);
    
    // Campaign Data State
    const [newTitle, setNewTitle] = useState('');
    const [newImage, setNewImage] = useState<string | null>(null);
    
    // Step 1: Audience
    const [targetCountry, setTargetCountry] = useState('Global');
    const [ageMin, setAgeMin] = useState(18);
    const [ageMax, setAgeMax] = useState(65);
    const [targetGender, setTargetGender] = useState('All');
    const [targetInterests, setTargetInterests] = useState<string[]>([]);

    // Step 2: Budget
    const [dailyBudget, setDailyBudget] = useState(25);
    const [durationDays, setDurationDays] = useState(7);

    // Step 3: Payment (Mock)
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVC, setCardCVC] = useState('');

    const resetForm = () => {
        setIsCreating(false);
        setStep(1);
        setNewTitle('');
        setNewImage(null);
        setTargetCountry('Global');
        setAgeMin(18);
        setAgeMax(65);
        setTargetGender('All');
        setTargetInterests([]);
        setDailyBudget(25);
        setDurationDays(7);
        setCardNumber('');
        setCardExpiry('');
        setCardCVC('');
    };

    const handleCreateCampaign = () => {
        if (!newTitle || !newImage) return;
        const newAd: AdCampaign = {
            id: 'ad_' + Date.now(),
            userId: user.id,
            title: newTitle,
            imageUrl: newImage,
            budget: dailyBudget,
            impressions: 0,
            clicks: 0,
            status: 'active',
            targetCountry,
            targetAgeMin: ageMin,
            targetAgeMax: ageMax,
            targetGender,
            targetInterests,
            durationDays
        };
        setCampaigns([newAd, ...campaigns]);
        resetForm();
    };

    const toggleInterest = (interest: string) => {
        if (targetInterests.includes(interest)) {
            setTargetInterests(targetInterests.filter(i => i !== interest));
        } else {
            setTargetInterests([...targetInterests, interest]);
        }
    };

    const renderStepContent = () => {
        switch(step) {
            case 1:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Campaign Basics</label>
                            <div className="space-y-3">
                                <input 
                                    type="text" 
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    placeholder="Campaign Name"
                                    className="w-full bg-black/50 border border-gray-800 rounded-2xl p-4 text-white focus:border-neon-pink outline-none transition-colors text-sm"
                                />
                                <button 
                                    onClick={() => setNewImage('https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?w=400&h=600&fit=crop')}
                                    className={`w-full h-14 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 transition-all ${newImage ? 'border-neon-purple text-neon-purple bg-neon-purple/5' : 'border-gray-800 text-gray-600 hover:border-gray-600'}`}
                                >
                                    {newImage ? <CheckCircle size={20} /> : <ImageIcon size={20} />}
                                    <span className="text-xs font-bold">{newImage ? 'Asset Selected' : 'Select Creative Asset'}</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Globe size={14}/> Target Location</label>
                            <select 
                                value={targetCountry}
                                onChange={e => setTargetCountry(e.target.value)}
                                className="w-full bg-black/50 border border-gray-800 rounded-2xl p-4 text-white focus:border-neon-pink outline-none text-sm appearance-none"
                            >
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Users size={14}/> Demographics</label>
                            <div className="flex gap-4 mb-4">
                                <div className="flex-1">
                                    <span className="text-[10px] text-gray-400 font-bold block mb-1">Gender</span>
                                    <div className="flex bg-black/50 rounded-xl p-1 border border-gray-800">
                                        {['All', 'Male', 'Female'].map(g => (
                                            <button 
                                                key={g}
                                                onClick={() => setTargetGender(g)}
                                                className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${targetGender === g ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 font-bold block mb-2">Age Range: {ageMin} - {ageMax}</span>
                                <div className="flex gap-4">
                                    <input type="range" min="13" max="65" value={ageMin} onChange={e => setAgeMin(Number(e.target.value))} className="flex-1 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-purple"/>
                                    <input type="range" min="13" max="65" value={ageMax} onChange={e => setAgeMax(Number(e.target.value))} className="flex-1 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-purple"/>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Target size={14}/> Interests</label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                    <button 
                                        key={cat}
                                        onClick={() => toggleInterest(cat)}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${targetInterests.includes(cat) ? 'bg-neon-purple border-neon-purple text-white' : 'bg-transparent border-gray-800 text-gray-500'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-gradient-to-br from-indigo-900/40 to-black p-6 rounded-3xl border border-indigo-500/20 text-center">
                            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1">Estimated Reach</p>
                            <h3 className="text-4xl font-black text-white italic tracking-tighter">{(dailyBudget * durationDays * 200).toLocaleString()} <span className="text-sm not-italic font-medium text-gray-400">people</span></h3>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2"><DollarSign size={14}/> Daily Budget</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="number" 
                                    value={dailyBudget} 
                                    onChange={e => setDailyBudget(Number(e.target.value))}
                                    className="w-full bg-black/50 border border-gray-800 rounded-2xl p-4 text-white font-black text-lg focus:border-neon-pink outline-none"
                                />
                                <span className="text-sm font-bold text-gray-400">USD/day</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar size={14}/> Duration</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="number" 
                                    value={durationDays} 
                                    onChange={e => setDurationDays(Number(e.target.value))}
                                    className="w-full bg-black/50 border border-gray-800 rounded-2xl p-4 text-white font-black text-lg focus:border-neon-pink outline-none"
                                />
                                <span className="text-sm font-bold text-gray-400">Days</span>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-400">Total Spend</span>
                            <span className="text-2xl font-black text-white">${(dailyBudget * durationDays).toFixed(2)}</span>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-gray-900/50 p-6 rounded-3xl border border-white/5 mb-6">
                            <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-widest">Order Summary</h4>
                            <div className="space-y-2 text-sm text-gray-400">
                                <div className="flex justify-between"><span>Campaign</span> <span className="text-white font-bold">{newTitle}</span></div>
                                <div className="flex justify-between"><span>Target</span> <span className="text-white font-bold">{targetCountry}, {ageMin}-{ageMax}</span></div>
                                <div className="flex justify-between"><span>Duration</span> <span className="text-white font-bold">{durationDays} Days</span></div>
                                <div className="border-t border-white/10 my-2 pt-2 flex justify-between text-white font-black">
                                    <span>Total Due</span> 
                                    <span className="text-neon-pink">${(dailyBudget * durationDays).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><CreditCard size={14}/> Add Payment Method</label>
                            <div className="space-y-3">
                                <input 
                                    type="text" 
                                    placeholder="Card Number"
                                    value={cardNumber}
                                    onChange={e => setCardNumber(e.target.value)}
                                    className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 text-white focus:border-neon-purple outline-none font-medium"
                                />
                                <div className="flex gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="MM/YY"
                                        value={cardExpiry}
                                        onChange={e => setCardExpiry(e.target.value)}
                                        className="flex-1 bg-black/50 border border-gray-800 rounded-xl p-4 text-white focus:border-neon-purple outline-none font-medium"
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="CVC"
                                        value={cardCVC}
                                        onChange={e => setCardCVC(e.target.value)}
                                        className="flex-1 bg-black/50 border border-gray-800 rounded-xl p-4 text-white focus:border-neon-purple outline-none font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
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
                {!isCreating && (
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="bg-neon-purple text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-neon-purple/20"
                    >
                        <Plus size={20} /> Launch Campaign
                    </button>
                )}
            </div>

            {/* Main Content or Campaign List */}
            {!isCreating ? (
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
                                        <p className="text-xs text-gray-500 font-medium">Daily Budget: <span className="text-white">${ad.budget}</span> • {ad.targetCountry || 'Global'}</p>
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
            ) : null}

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-gray-900 w-full max-w-lg rounded-[32px] border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-white">Create Campaign</h3>
                                <div className="flex gap-2 mt-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`h-1 w-8 rounded-full transition-all ${step >= i ? 'bg-neon-purple' : 'bg-gray-800'}`} />
                                    ))}
                                </div>
                            </div>
                            <button onClick={resetForm} className="p-2 bg-gray-800 rounded-full text-white"><X size={20}/></button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6">
                                {step === 1 ? 'Audience & Creative' : step === 2 ? 'Budget & Duration' : 'Payment'}
                            </h4>
                            {renderStepContent()}
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-between items-center bg-gray-900 shrink-0">
                            {step > 1 ? (
                                <button onClick={() => setStep(step - 1)} className="text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-white px-4">Back</button>
                            ) : (
                                <div></div>
                            )}
                            
                            {step < 3 ? (
                                <button 
                                    onClick={() => {
                                        if (step === 1 && (!newTitle || !newImage)) return alert("Please select a title and image");
                                        setStep(step + 1);
                                    }}
                                    className="bg-white text-black px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
                                >
                                    Next Step <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button 
                                    onClick={handleCreateCampaign}
                                    disabled={!cardNumber || !cardExpiry || !cardCVC}
                                    className="bg-neon-pink text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-neon-pink/20 disabled:opacity-50 disabled:grayscale"
                                >
                                    Pay & Launch <DollarSign size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
