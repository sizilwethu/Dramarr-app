
import React from 'react';
import { User } from '../types';
import { Check, X, DollarSign, ShieldAlert, ChevronLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const AdminDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const data = [
    { name: 'Mon', revenue: 400 },
    { name: 'Tue', revenue: 300 },
    { name: 'Wed', revenue: 550 },
    { name: 'Thu', revenue: 800 },
    { name: 'Fri', revenue: 1200 },
    { name: 'Sat', revenue: 2000 },
    { name: 'Sun', revenue: 1500 },
  ];

  return (
    <div className="h-full bg-black flex flex-col pt-12 pb-20 overflow-y-auto">
        <div className="px-4 mb-6 flex justify-between items-center">
            <button onClick={onClose} className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                <ChevronLeft size={24} /> <span className="font-bold">Back to Profile</span>
            </button>
            <h2 className="text-2xl font-bold text-red-500">Admin Panel</h2>
        </div>

        <div className="px-4 mb-8">
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-4">
                <h3 className="text-gray-400 text-sm mb-2 font-bold uppercase">Weekly Revenue</h3>
                <div className="h-[200px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none' }} />
                            <Bar dataKey="revenue" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Pending Payouts</p>
                    <p className="text-3xl font-black text-white">12</p>
                </div>
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Verification Reqs</p>
                    <p className="text-3xl font-black text-white">45</p>
                </div>
            </div>
        </div>

        <div className="px-4">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-gray-900 pb-2"><DollarSign size={18} className="text-green-500"/> Payout Requests</h3>
            <div className="space-y-3 mb-8">
                {[1, 2].map(i => (
                    <div key={i} className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
                        <div>
                            <p className="text-white font-bold text-sm">user_creator_{i}</p>
                            <p className="text-xs text-gray-500">PayPal: creator{i}@gmail.com</p>
                            <p className="text-sm text-green-500 font-bold mt-1">$125.50</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 bg-green-900/30 text-green-500 rounded-xl hover:bg-green-900/50 transition-colors"><Check size={18}/></button>
                            <button className="p-2 bg-red-900/30 text-red-500 rounded-xl hover:bg-red-900/50 transition-colors"><X size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>

            <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-gray-900 pb-2"><ShieldAlert size={18} className="text-blue-500"/> Verification Requests</h3>
            <div className="space-y-3">
                 {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                                <img src={`https://picsum.photos/seed/${i + 50}/100`} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">wannabe_famous_{i}</p>
                                <p className="text-xs text-blue-400 underline cursor-pointer hover:text-blue-300">View ID Document</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-blue-900/30 text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-900/50 transition-colors">Approve</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
