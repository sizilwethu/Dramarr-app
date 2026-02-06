
import React, { useState } from 'react';
import { User, WalletTransaction } from '../types';
import { api } from '../services/api';
import { ChevronLeft, Plus, TrendingUp, TrendingDown, CreditCard, Landmark, ArrowUpRight, X, CheckCircle2, Zap, DollarSign } from 'lucide-react';

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

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

export const WalletView: React.FC<WalletViewProps> = ({ user, onUpdateUser, onBack }) => {
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'paypal' | 'googlepay'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(MOCK_TRANS);

  const handleDeposit = async () => {
    setIsProcessing(true);
    try {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update user balance in database
        const newBalance = (user.walletBalance || 0) + selectedAmount;
        await api.updateProfile(user.id, { walletBalance: newBalance });
        
        // Update local state
        onUpdateUser({ walletBalance: newBalance });
        
        // Record mock transaction
        const newTrans: WalletTransaction = {
            id: 't_' + Date.now(),
            amount: selectedAmount,
            type: 'credit',
            description: `Funds Added via ${selectedMethod === 'card' ? 'Credit Card' : selectedMethod === 'paypal' ? 'PayPal' : 'Google Pay'}`,
            timestamp: Date.now()
        };
        setTransactions([newTrans, ...transactions]);
        setIsSuccess(true);

        setTimeout(() => {
            setIsSuccess(false);
            setShowAddFunds(false);
        }, 2000);
    } catch (e) {
        console.error(e);
        alert("Deposit failed. Please try again.");
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="h-full bg-slate-950 flex flex-col p-6 pt-12 animate-fade-in relative">
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
        <button 
          onClick={() => setShowAddFunds(true)}
          className="flex items-center gap-2 bg-white text-blue-900 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-xl"
        >
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
        {transactions.map(t => (
          <div key={t.id} className="bg-slate-900/30 p-5 rounded-3xl border border-white/5 flex justify-between items-center animate-fade-in">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${t.type === 'credit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {t.type === 'credit' ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
              </div>
              <div>
                <p className="text-sm font-bold text-white line-clamp-1">{t.description}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(t.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
            <p className={`font-black text-lg shrink-0 ${t.type === 'credit' ? 'text-green-500' : 'text-slate-100'}`}>
              {t.type === 'credit' ? '+' : '-'}${t.amount.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-end justify-center animate-fade-in">
          <div className="bg-slate-950 w-full max-w-lg rounded-t-[48px] border-t border-white/10 p-8 pb-12 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white">Deposit Funds</h3>
              <button onClick={() => setShowAddFunds(false)} className="p-2 bg-slate-900 rounded-full text-white">
                <X size={24} />
              </button>
            </div>

            {isSuccess ? (
              <div className="py-20 flex flex-col items-center text-center animate-fade-in">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={64} className="text-green-500" />
                </div>
                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">Transfer Complete</h4>
                <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-2">Your balance has been updated</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Amount Selection */}
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-2">Select Amount</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {PRESET_AMOUNTS.map(amt => (
                      <button
                        key={amt}
                        onClick={() => setSelectedAmount(amt)}
                        className={`px-6 py-3 rounded-2xl font-black text-sm transition-all shrink-0 ${selectedAmount === amt ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-900 text-slate-500 border border-white/5'}`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Method Selection */}
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-2">Payment Method</p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setSelectedMethod('card')}
                      className={`w-full flex items-center justify-between p-4 rounded-3xl border transition-all ${selectedMethod === 'card' ? 'bg-white/5 border-white/20' : 'bg-slate-900/50 border-transparent'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-900 rounded-2xl text-blue-500"><CreditCard size={24}/></div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white">Credit / Debit Card</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Fast & Secure</p>
                        </div>
                      </div>
                      {selectedMethod === 'card' && <CheckCircle2 size={18} className="text-blue-500" />}
                    </button>

                    <button 
                      onClick={() => setSelectedMethod('paypal')}
                      className={`w-full flex items-center justify-between p-4 rounded-3xl border transition-all ${selectedMethod === 'paypal' ? 'bg-white/5 border-white/20' : 'bg-slate-900/50 border-transparent'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-900 rounded-2xl text-blue-400">
                          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M20.067 8.178c-.552 2.766-2.26 4.332-5.119 4.332H13.1c-.552 0-.916.353-1.018.9l-.916 5.8c-.05.3.1.55.4.55h3.067c.5 0 .866-.35.966-.85l.05-.25.5-3.15.05-.3c.1-.5.467-.85.967-.85h.616c2.7 0 4.817-1.1 5.417-4.233.25-1.2.1-2.2-.55-2.917-.45-.483-1.233-.766-2.25-.766h-.516c-.05 0-.15.016-.216.033zM15.467 4.145c-.533 0-1.133.05-1.8.167-.483.083-.75.466-.85.933l-.117.65c-.05.3.1.55.4.55.517-.1 1-.167 1.433-.167 1.95 0 3.167.967 2.8 2.8-.217 1.15-1.1 1.75-2.583 1.75H11.6c-.4 0-.667.25-.75.6l-.883 5.583c-.05.3.1.55.4.55h3.134c.45 0 .8-.35.9-.85l.1-.633.567-3.567c.05-.333.366-.583.7-.583h1.016c3.1 0 5.534-1.267 6.217-4.833.35-1.783-.15-3.233-1.483-4.133-1.217-.817-2.9-1.2-5.05-1.2zM7.6 15.362L8.516 9.55c.083-.517.55-.9 1.067-.9h3.767c2.117 0 3.717 1.167 3.3 3.25-.417 2.083-2.067 3.25-4.183 3.25H9.617c-.55 0-.917.35-.984.85l-.75 4.75c-.05.3.1.55.4.55H11c.4 0 .733-.35.8-.817l.067-.4.016-.1.25-1.583c.05-.333.333-.583.667-.583h.5c2.317 0 4.15-.967 4.65-3.517.15-.75.1-1.4-.133-1.95-.317-.7-.95-1.2-1.9-1.467-1-.283-2.4-.283-3.667-.283H7.817c-.55 0-1.017.383-1.1.9l-1.017 6.45c-.05.3.1.55.4.55h2.15c.417 0 .733-.35.8-.817l.017-.1.017-.1z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white">PayPal</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Connect your account</p>
                        </div>
                      </div>
                      {selectedMethod === 'paypal' && <CheckCircle2 size={18} className="text-blue-400" />}
                    </button>

                    <button 
                      onClick={() => setSelectedMethod('googlepay')}
                      className={`w-full flex items-center justify-between p-4 rounded-3xl border transition-all ${selectedMethod === 'googlepay' ? 'bg-white/5 border-white/20' : 'bg-slate-900/50 border-transparent'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-900 rounded-2xl flex items-center justify-center">
                          <div className="flex gap-0.5">
                             <div className="w-1.5 h-4 bg-[#4285F4] rounded-full" />
                             <div className="w-1.5 h-4 bg-[#EA4335] rounded-full mt-1" />
                             <div className="w-1.5 h-4 bg-[#FBBC05] rounded-full" />
                             <div className="w-1.5 h-4 bg-[#34A853] rounded-full mt-1" />
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white">Google Pay</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Instant checkout</p>
                        </div>
                      </div>
                      {selectedMethod === 'googlepay' && <CheckCircle2 size={18} className="text-green-500" />}
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleDeposit}
                  disabled={isProcessing}
                  className={`w-full py-5 rounded-[28px] font-black uppercase text-sm tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 ${
                      selectedMethod === 'googlepay' 
                      ? 'bg-white text-black hover:bg-gray-100' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                  }`}
                >
                  {isProcessing ? (
                    <div className={`w-5 h-5 border-2 rounded-full animate-spin ${selectedMethod === 'googlepay' ? 'border-gray-300 border-t-black' : 'border-white/30 border-t-white'}`} />
                  ) : (
                    <>
                        {selectedMethod === 'googlepay' && <span className="mr-1">Pay with</span>}
                        {selectedMethod === 'googlepay' ? (
                             <span className="font-bold flex items-center gap-0.5">
                                <span className="text-blue-500">G</span>
                                <span className="text-red-500">o</span>
                                <span className="text-yellow-500">o</span>
                                <span className="text-blue-500">g</span>
                                <span className="text-green-500">l</span>
                                <span className="text-red-500">e</span>
                                <span className="text-gray-500 ml-0.5">Pay</span>
                            </span>
                        ) : (
                            `Deposit $${selectedAmount.toFixed(2)}`
                        )}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};