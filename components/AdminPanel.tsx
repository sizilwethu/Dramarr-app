
import React from 'react';
import { User } from '../types';
import { ChevronLeft, CheckCircle, XCircle, FileText, TrendingUp, Users, MapPin } from 'lucide-react';

interface AdminPanelProps {
  user: User;
  onBack: () => void;
}

const PENDING_DRIVERS = [
  { id: 'd_101', name: 'John Doe', vehicle: 'Toyota Camry 2022', docs: 'License, ID Ready' },
  { id: 'd_102', name: 'Sarah Smith', vehicle: 'Tesla Model S', docs: 'Insurance, License' },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onBack }) => {
  if (!user.isAdmin) return null;

  return (
    <div className="h-full bg-slate-950 flex flex-col p-6 pt-12 animate-fade-in overflow-y-auto no-scrollbar">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="p-2 bg-slate-900 rounded-full text-white"><ChevronLeft size={24}/></button>
        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-blue-500">Fleet Control</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-slate-900 p-6 rounded-[32px] border border-white/5">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Global Active</p>
          <p className="text-3xl font-black text-white">1,245</p>
          <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold mt-2">
            <TrendingUp size={12}/> +12%
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-[32px] border border-white/5">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Fleet</p>
          <p className="text-3xl font-black text-white">4,890</p>
          <div className="flex items-center gap-1 text-blue-500 text-[10px] font-bold mt-2">
            <Users size={12}/> Online
          </div>
        </div>
      </div>

      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 ml-2">Verification Queue</h4>
      <div className="space-y-4">
        {PENDING_DRIVERS.map(d => (
          <div key={d.id} className="bg-slate-900/50 p-6 rounded-[32px] border border-white/5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h5 className="text-lg font-black text-white italic tracking-tighter">{d.name}</h5>
                <p className="text-xs text-blue-400 font-bold">{d.vehicle}</p>
              </div>
              <div className="p-3 bg-slate-800 rounded-2xl text-slate-500"><FileText size={20}/></div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">{d.docs}</p>
            <div className="grid grid-cols-2 gap-3">
              <button className="py-3 bg-green-500/10 text-green-500 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-green-500/20 active:bg-green-500 active:text-white transition-all">
                Approve
              </button>
              <button className="py-3 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-red-500/20 active:bg-red-500 active:text-white transition-all">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
