
import React from 'react';
import { User, WalletTransaction } from '../types';
import { ChevronLeft, Plus, TrendingUp, TrendingDown, CreditCard, Landmark, ArrowUpRight } from 'lucide-react';

interface WalletViewProps {
  user: User;
  onUpdateUser: (data: Partial<User>) => void;
  onBack: () => void;
}

const MOCK_TRANS: WalletTransaction[] = [
  { id: 't1', amount: 24.50, type: 'debit', description: 'SwiftEconomy Journey', timestamp: Date.now() - 3600000 },
  { id: 't2', amount: 50.00, type: 'credit', description: 'Funds Added via Card', timestamp: Date.now() - 86400000 },
  { id: 't3', amount: 18.00, type: 'debit', description: 'SwiftElite Journey', timestamp: Date.now() - 172800000 },
];

export const WalletView: React.FC<WalletViewProps> = ({ user, onUpdateUser, onBack }) => {
  return (
    <div className="h-full bg-slate-950 flex flex-col p-6 pt-12 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-slate-900 rounded-full text-white active:scale-90 transition-transform">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-black italic tracking-tighter uppercase">Wallet Hub</h2>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-8 rounded-[40px] shadow-2xl mb-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <CreditCard size={120} />
        </div>
        <p className="text-blue-100/70 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Available Balance</p>
        <h3 className="text-5xl font-black text-white italic tracking-tighter mb-8">${user.walletBalance.toFixed(2)}</h3>
        <button className="flex items-center gap-2 bg-white text-blue-900 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all">
          <Plus size={18} /> Add Funds
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <button className="bg-slate-900/50 p-5 rounded-3xl border border-white/5 flex flex-col gap-3 group active:bg-slate-800">
          <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 w-fit group-hover:bg-blue-500 group-hover:text-white transition-all"><ArrowUpRight size={24}/></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Withdraw</span>
        </button>
        <button className="bg-slate-900/50 p-5 rounded-3xl border border-white/5 flex flex-col gap-3 group active:bg-slate-800">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500 w-fit group-hover:bg-indigo-500 group-hover:text-white transition-all"><Landmark size={24}/></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Settings</span>
        </button>
      </div>

      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2">Recent Logistics</h4>
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-10">
        {MOCK_TRANS.map(t => (
          <div key={t.id} className="bg-slate-900/30 p-5 rounded-3xl border border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${t.type === 'credit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {t.type === 'credit' ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{t.description}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(t.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
            <p className={`font-black text-lg ${t.type === 'credit' ? 'text-green-500' : 'text-slate-100'}`}>
              {t.type === 'credit' ? '+' : '-'}${t.amount.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
