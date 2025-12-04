import React from 'react';
import { User } from '../types';
import { Check, X, DollarSign, ShieldAlert } from 'lucide-react';
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
        <div className="px-4 mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-red-500">Admin Panel</h2>
            <button onClick={onClose} className="text-gray-400">Close</button>
        </div>

        <div className="px-4 mb-8">
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-4">
                <h3 className="text-gray-400 text-sm mb-2">Total Revenue (Weekly)</h3>
                <div className="h-[200px]">
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
                    <p className="text-gray-400 text-xs">Pending Payouts</p>
                    <p className="text-2xl font-bold text-white">12</p>
                </div>
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                    <p className="text-gray-400 text-xs">Verification Reqs</p>
                    <p className="text-2xl font-bold text-white">45</p>
                </div>
            </div>
        </div>

        <div className="px-4">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2"><DollarSign size={16} className="text-green-500"/> Payout Requests</h3>
            <div className="space-y-3 mb-8">
                {[1, 2].map(i => (
                    <div key={i} className="bg-gray-900 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
                        <div>
                            <p className="text-white font-bold text-sm">user_creator_{i}</p>
                            <p className="text-xs text-gray-500">PayPal: creator{i}@gmail.com</p>
                            <p className="text-xs text-yellow-500 font-bold">$125.50</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 bg-green-900/30 text-green-500 rounded hover:bg-green-900/50"><Check size={16}/></button>
                            <button className="p-2 bg-red-900/30 text-red-500 rounded hover:bg-red-900/50"><X size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>

            <h3 className="text-white font-bold mb-3 flex items-center gap-2"><ShieldAlert size={16} className="text-blue-500"/> Verification Requests</h3>
            <div className="space-y-3">
                 {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-900 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-800 rounded-full overflow-hidden">
                                <img src={`https://picsum.photos/seed/${i + 50}/100`} />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">wannabe_famous_{i}</p>
                                <p className="text-xs text-blue-400 underline cursor-pointer">View ID Document</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 bg-blue-900/30 text-blue-500 rounded hover:bg-blue-900/50">Approve</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
