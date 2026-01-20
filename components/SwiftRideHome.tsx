
import React, { useState, useEffect } from 'react';
import { User, RideStatus, RideRequest, VehicleInfo } from '../types';
import { 
  MapPin, Search, ChevronRight, X, Star, CreditCard, 
  Car, ShieldCheck, Clock, Navigation, Phone, 
  CheckCircle2, AlertTriangle, Users, Map as MapIcon, MoreHorizontal
} from 'lucide-react';

interface SwiftRideHomeProps {
  user: User;
  onUpdateUser: (data: Partial<User>) => void;
}

const FLEET = [
  { type: 'Economy', name: 'SwiftEconomy', price: 1.0, icon: Car, time: '3 min', color: 'text-slate-400' },
  { type: 'Elite', name: 'SwiftElite', price: 1.8, icon: ShieldCheck, time: '5 min', color: 'text-blue-500' },
  { type: 'Van', name: 'SwiftVan', price: 2.5, icon: Users, time: '8 min', color: 'text-green-500' }
];

export const SwiftRideHome: React.FC<SwiftRideHomeProps> = ({ user, onUpdateUser }) => {
  const [rideStatus, setRideStatus] = useState<RideStatus>('IDLE');
  const [pickup, setPickup] = useState('Current Location');
  const [destination, setDestination] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(FLEET[0]);
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);

  useEffect(() => {
    if (rideStatus === 'SEARCHING') {
      const timer = setTimeout(() => {
        const mockDriver: RideRequest = {
          id: 'ride_' + Date.now(),
          passengerId: user.id,
          passengerName: user.username,
          passengerAvatar: user.avatarUrl,
          pickupAddress: pickup,
          destinationAddress: destination,
          fare: Math.round(selectedVehicle.price * 12),
          distance: '4.2 km',
          status: 'ACCEPTED',
          driverId: 'd_1',
          driverName: 'Marcus T.',
          driverAvatar: 'https://i.pravatar.cc/150?u=marcus',
          driverPhone: '+1 (555) 123-4567',
          vehicleInfo: {
            model: 'Tesla Model 3',
            plate: 'EV-7788',
            color: 'Midnight Black',
            type: selectedVehicle.type as any
          },
          timestamp: Date.now()
        };
        setActiveRide(mockDriver);
        setRideStatus('ACCEPTED');
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (rideStatus === 'ACCEPTED') {
      const timer = setTimeout(() => setRideStatus('EN_ROUTE'), 5000);
      return () => clearTimeout(timer);
    }

    if (rideStatus === 'EN_ROUTE') {
      const timer = setTimeout(() => setRideStatus('ARRIVED'), 8000);
      return () => clearTimeout(timer);
    }
  }, [rideStatus]);

  const handleRequest = () => {
    if (!destination) return;
    setRideStatus('SEARCHING');
  };

  const handleComplete = () => {
    if (activeRide) {
      onUpdateUser({ walletBalance: user.walletBalance - activeRide.fare });
      setRideStatus('COMPLETED');
      setTimeout(() => {
        setRideStatus('IDLE');
        setActiveRide(null);
        setDestination('');
      }, 3000);
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-slate-950">
      {/* Interactive Map Overlay */}
      <div className="absolute inset-0 z-0 bg-slate-900">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* Pulsing Pin for User */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full animate-ping absolute -inset-0" />
          <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-2xl relative z-10" />
        </div>

        {/* Driver Marker (Simulated Movement) */}
        {['ACCEPTED', 'EN_ROUTE'].includes(rideStatus) && (
          <div className="absolute top-1/3 left-1/4 transition-all duration-1000">
            <Car className="text-white drop-shadow-lg" size={32} />
          </div>
        )}
      </div>

      {/* Header Controls */}
      <div className="absolute top-12 left-0 right-0 z-20 px-6 pointer-events-none">
        <div className="flex justify-between items-center pointer-events-auto">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-3 rounded-full shadow-2xl">
            <MoreHorizontal className="text-slate-400" />
          </div>
          <div className="bg-blue-600 px-6 py-2.5 rounded-full shadow-xl flex items-center gap-2">
            <span className="text-white text-xs font-black uppercase tracking-widest">${user.walletBalance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Interface Sheet */}
      <div className="mt-auto z-20 bg-slate-950/90 backdrop-blur-3xl border-t border-slate-800 rounded-t-[48px] shadow-2xl px-6 pt-8 pb-6 max-h-[70%] overflow-y-auto no-scrollbar">
        {rideStatus === 'IDLE' ? (
          <>
            <div className="bg-slate-900/50 rounded-3xl p-5 mb-8 border border-white/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-3 h-3 rounded-full border-2 border-blue-500" />
                <input 
                  value={pickup}
                  onChange={e => setPickup(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-white outline-none w-full"
                  placeholder="Where from?"
                />
              </div>
              <div className="h-px bg-slate-800 w-full my-3 ml-7" />
              <div className="flex items-center gap-4">
                <MapPin className="text-red-500" size={18} />
                <input 
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-white outline-none w-full"
                  placeholder="Where to?"
                />
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Available Fleet</h3>
              <div className="space-y-3">
                {FLEET.map(v => (
                  <button 
                    key={v.type}
                    onClick={() => setSelectedVehicle(v)}
                    className={`w-full flex items-center justify-between p-4 rounded-3xl border transition-all ${selectedVehicle.type === v.type ? 'bg-blue-600/10 border-blue-500' : 'border-transparent text-slate-500'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 bg-slate-900 rounded-2xl ${selectedVehicle.type === v.type ? v.color : ''}`}>
                        <v.icon size={24} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-white">{v.name}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider">{v.time} arrival</p>
                      </div>
                    </div>
                    <span className="text-lg font-black text-white italic">${Math.round(v.price * 12)}</span>
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleRequest}
              disabled={!destination}
              className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black uppercase text-sm tracking-widest shadow-2xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-20"
            >
              Confirm {selectedVehicle.name}
            </button>
          </>
        ) : rideStatus === 'SEARCHING' ? (
          <div className="py-12 flex flex-col items-center text-center animate-pulse">
            <div className="w-20 h-20 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-8" />
            <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2 uppercase">Matching with Fleet</h3>
            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Securing nearest high-rated driver...</p>
          </div>
        ) : ['ACCEPTED', 'EN_ROUTE', 'ARRIVED'].includes(rideStatus) ? (
          <div className="animate-fade-in">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={activeRide?.driverAvatar} className="w-16 h-16 rounded-3xl object-cover bg-slate-800" />
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 p-1.5 rounded-xl border-4 border-slate-950">
                    <Star size={10} fill="white" className="text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">{activeRide?.driverName}</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{activeRide?.vehicleInfo?.color} {activeRide?.vehicleInfo?.model}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="bg-blue-600/20 text-blue-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                  {rideStatus.replace('_', ' ')}
                </span>
                <p className="text-lg font-black text-white mt-1">{activeRide?.vehicleInfo?.plate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button className="py-4 bg-slate-900 rounded-3xl text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-white/5 active:bg-slate-800">
                <Phone size={16} /> Call Marcus
              </button>
              <button className="py-4 bg-slate-900 rounded-3xl text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-white/5 active:bg-slate-800">
                <Navigation size={16} /> In-App Chat
              </button>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-[32px] border border-white/5 mb-8">
              <div className="flex justify-between mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Destination</p>
                <p className="text-xs font-black text-blue-500 uppercase">{activeRide?.distance}</p>
              </div>
              <p className="text-sm font-bold text-white truncate">{activeRide?.destinationAddress}</p>
            </div>

            {rideStatus === 'ARRIVED' && (
              <button 
                onClick={handleComplete}
                className="w-full bg-green-500 text-white py-5 rounded-3xl font-black uppercase text-sm tracking-widest shadow-2xl shadow-green-500/20 active:scale-95 transition-all"
              >
                End Trip & Pay ${activeRide?.fare}
              </button>
            )}
          </div>
        ) : rideStatus === 'COMPLETED' ? (
          <div className="py-12 flex flex-col items-center text-center animate-fade-in">
            <CheckCircle2 size={72} className="text-green-500 mb-6" />
            <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2 uppercase">Journey Completed</h3>
            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mb-10">You've arrived at your destination safely.</p>
            <div className="flex gap-2 mb-8">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={32} fill={i <= 5 ? '#EAB308' : 'none'} className="text-yellow-500" />)}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
