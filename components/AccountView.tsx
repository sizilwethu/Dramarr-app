
import React from 'react';
import { User } from '../types';
import { ChevronLeft, LogOut, ShieldCheck, Car, Star, Settings, ChevronRight, Upload } from 'lucide-react';

interface AccountViewProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (data: Partial<User>) => void;
  onBack: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({ user, onLogout, onUpdateUser, onBack }) => {
  return (
    <div className="h-full bg-slate-950 flex flex-col p-6 pt-12 animate-fade-in overflow-y-auto no-scrollbar">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="p-2 bg-slate-900 rounded-full text-white active:scale-90 transition-transform">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-black italic tracking-tighter uppercase">My Profile</h2>
      </div>

      <div className="flex items-center gap-6 mb-12">
        <div className="relative">
          <img src={user.avatarUrl} className="w-24 h-24 rounded-[40px] object-cover border-4 border-slate-900 shadow-2xl" />
          {user.isVerified && (
            <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-2xl border-4 border-slate-950">
              <ShieldCheck size={16} className="text-white" />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-3xl font-black text-white italic tracking-tighter">{user.username}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Star size={14} className="text-yellow-500" fill="currentColor" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{user.driverRating} Gold Member</span>
          </div>
        </div>
      </div>

      {!user.isDriver ? (
        <div className="bg-gradient-to-br from-slate-900 to-black p-8 rounded-[48px] border border-blue-500/20 mb-10 text-center">
          <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Car size={40} className="text-blue-500" />
          </div>
          <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Earn as a Driver</h4>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-8 leading-relaxed">Join the SwiftRide professional fleet and earn on your schedule.</p>
          <button 
            onClick={() => onUpdateUser({ isDriver: true, driverStatus: 'pending' })}
            className="w-full bg-white text-slate-950 py-4 rounded-3xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            Apply to Drive
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/50 p-8 rounded-[48px] border border-green-500/20 mb-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Car className="text-green-500" />
              <span className="text-sm font-black text-white uppercase tracking-widest">Driver Mode</span>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${user.onlineStatus === 'online' ? 'bg-green-500' : 'bg-slate-700'}`} onClick={() => onUpdateUser({ onlineStatus: user.onlineStatus === 'online' ? 'offline' : 'online' })}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user.onlineStatus === 'online' ? 'left-7' : 'left-1'}`} />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] text-center">Status: {user.driverStatus === 'verified' ? 'Active Pro' : 'Verification Pending'}</p>
        </div>
      )}

      <div className="space-y-3">
        {[
          { icon: Settings, label: 'Account Settings', value: 'Security & Privacy' },
          { icon: ShieldCheck, label: 'Safety Hub', value: 'SOS & Trusted Contacts' },
          { icon: Upload, label: 'Documents', value: 'Managed IDs' },
        ].map((item, i) => (
          <button key={i} className="w-full flex items-center justify-between p-6 bg-slate-900/30 rounded-3xl border border-white/5 active:bg-slate-800 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800 rounded-2xl text-slate-400"><item.icon size={20}/></div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">{item.label}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.value}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-600" />
          </button>
        ))}
      </div>

      <button 
        onClick={onLogout}
        className="mt-12 w-full flex items-center justify-center gap-3 py-5 bg-red-500/10 text-red-500 rounded-3xl font-black uppercase text-xs tracking-[0.2em] border border-red-500/20 active:bg-red-500 active:text-white transition-all mb-10"
      >
        <LogOut size={20} /> Terminate Session
      </button>
    </div>
  );
};
