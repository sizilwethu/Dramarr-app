
import React, { useState, useEffect } from 'react';
import { User, RideRequest, RideStatus } from '../types';
import { 
  MapPin, Navigation, Car, ShieldCheck, Clock, Search, 
  ChevronRight, X, Star, CreditCard, ChevronLeft, Send, 
  CheckCircle2, AlertCircle, Sparkles, User as UserIcon,
  Smartphone, Map as MapIcon, MoreHorizontal, Briefcase, Home, Plane
} from 'lucide-react';

interface DriveViewProps {
  user: User;
  onUpdateUser: (data: Partial<User>) => void;
  onBack: () => void;
}

// Declared Users component before it's used in VEHICLE_CLASSES to avoid TDZ error
const Users = ({ size, className }: any) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);

const VEHICLE_CLASSES = [
  { type: 'Standard', name: 'Economy', price: 1.0, icon: Car, color: 'text-gray-400' },
  { type: 'Elite', name: 'Comfort', price: 1.8, icon: ShieldCheck, color: 'text-blue-500' },
  { type: 'Van', name: 'Van', price: 2.5, icon: Users, color: 'text-green-500' }
];

const QUICK_LOCATIONS = [
  { name: 'Home', icon: Home, address: '221B Baker Street' },
  { name: 'Work', icon: Briefcase, address: 'Tech Plaza, Building 4' },
  { name: 'Airport', icon: Plane, address: 'International Terminal' }
];

export const DriveView: React.FC<DriveViewProps> = ({ user, onUpdateUser, onBack }) => {
  const [viewMode, setViewMode] = useState<'passenger' | 'driver'>(user.isDriver ? 'driver' : 'passenger');
  const [rideStatus, setRideStatus] = useState<RideStatus>('REQUESTING');
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_CLASSES[0]);

  useEffect(() => {
    if (rideStatus === 'SEARCHING') {
      const timer = setTimeout(() => {
        const mockDriver = {
          id: 'ride_' + Date.now(),
          passengerId: user.id,
          passengerName: user.username,
          passengerAvatar: user.avatarUrl,
          driverId: 'd_77',
          driverName: 'Robert K.',
          driverAvatar: 'https://i.pravatar.cc/150?u=robert',
          pickupLocation: pickup || 'Current Location',
          destination: destination || 'Downtown',
          fare: Math.round(selectedVehicle.price * 15),
          status: 'ACCEPTED',
          timestamp: Date.now(),
          vehicleType: selectedVehicle.type as any
        };
        setActiveRide(mockDriver as any);
        setRideStatus('ACCEPTED');
      }, 2500);
      return () => clearTimeout(timer);
    }

    if (rideStatus === 'ACCEPTED') {
        const timer = setTimeout(() => setRideStatus('EN_ROUTE'), 3500);
        return () => clearTimeout(timer);
    }
    
    if (rideStatus === 'EN_ROUTE') {
        const timer = setTimeout(() => setRideStatus('ARRIVED'), 5000);
        return () => clearTimeout(timer);
    }
  }, [rideStatus, pickup, destination, selectedVehicle, user.id, user.username, user.avatarUrl]);

  const handleRequestRide = () => {
    if (!destination) return;
    setRideStatus('SEARCHING');
  };

  const handleCompleteRide = () => {
    if (!activeRide) return;
    onUpdateUser({ coins: (user.coins || 0) - activeRide.fare });
    setRideStatus('COMPLETED');
    setTimeout(() => {
        setRideStatus('REQUESTING');
        setActiveRide(null);
    }, 3000);
  };

  const renderPassengerView = () => (
    <div className="flex flex-col h-full animate-fade-in relative bg-neutral-950">
        {rideStatus === 'REQUESTING' && (
            <div className="px-6 py-4 space-y-4 z-20 mt-20">
                <div className="bg-gray-900 border border-white/5 rounded-3xl p-6 shadow-2xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-500" />
                        <input 
                            value={pickup}
                            onChange={e => setPickup(e.target.value)}
                            placeholder="Current Location"
                            className="bg-transparent border-none text-sm font-semibold text-white focus:outline-none w-full"
                        />
                    </div>
                    <div className="h-px bg-white/5 w-full my-3" />
                    <div className="flex items-center gap-4">
                        <MapPin className="text-red-500" size={18} />
                        <input 
                            value={destination}
                            onChange={e => setDestination(e.target.value)}
                            placeholder="Where to?"
                            className="bg-transparent border-none text-sm font-semibold text-white focus:outline-none w-full"
                        />
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto no-scrollbar">
                    {QUICK_LOCATIONS.map(loc => (
                        <button 
                            key={loc.name}
                            onClick={() => setDestination(loc.address)}
                            className="flex items-center gap-2 px-5 py-3 bg-gray-900 border border-white/5 rounded-2xl text-xs font-bold text-gray-300 whitespace-nowrap hover:bg-white/5 transition-colors"
                        >
                            <loc.icon size={14} className="text-blue-500" />
                            {loc.name}
                        </button>
                    ))}
                </div>
            </div>
        )}

        <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
             <div className="w-[300%] h-[300%] absolute opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
             
             <div className="relative">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full animate-ping absolute -inset-0" />
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-xl relative z-10" />
             </div>

             {['ACCEPTED', 'EN_ROUTE'].includes(rideStatus) && (
                 <div className="absolute top-1/2 right-1/4 animate-pulse transition-all duration-1000">
                     <Car className="text-white" size={28} />
                 </div>
             )}
        </div>

        <div className="mt-auto bg-gray-950 border-t border-white/5 p-6 z-20 rounded-t-[40px] shadow-2xl">
            {rideStatus === 'REQUESTING' ? (
                <>
                    <div className="space-y-2 mb-6">
                        {VEHICLE_CLASSES.map(cls => (
                            <button 
                                key={cls.type}
                                onClick={() => setSelectedVehicle(cls)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedVehicle.type === cls.type ? 'bg-white/5 border-white/10' : 'border-transparent text-gray-500'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <cls.icon className={selectedVehicle.type === cls.type ? cls.color : ''} size={24} />
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-white">{cls.name}</p>
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Fast Arrival</p>
                                    </div>
                                </div>
                                <span className="text-sm font-black text-white">${Math.round(cls.price * 15)}</span>
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={handleRequestRide}
                        disabled={!destination}
                        className="w-full bg-blue-600 text-white py-4.5 rounded-2xl font-bold text-sm tracking-tight shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-20"
                    >
                        Confirm Ride Request
                    </button>
                </>
            ) : rideStatus === 'SEARCHING' ? (
                <div className="py-12 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-6" />
                    <h3 className="text-lg font-bold text-white mb-1">Finding your driver</h3>
                    <p className="text-xs text-gray-500 font-medium">Connecting with nearby professionals...</p>
                </div>
            ) : ['ACCEPTED', 'EN_ROUTE', 'ARRIVED'].includes(rideStatus) ? (
                <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <img src={activeRide?.driverAvatar} className="w-14 h-14 rounded-2xl bg-gray-800" />
                            <div>
                                <h4 className="text-base font-bold text-white">{activeRide?.driverName}</h4>
                                <div className="flex items-center gap-1 text-gray-500 text-xs">
                                    <Star size={12} className="text-yellow-500" fill="currentColor" />
                                    <span>4.9 • {activeRide?.vehicleInfo?.type}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                             <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {rideStatus}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button className="py-4 bg-gray-900 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/5">
                            <Send size={14} /> Contact
                        </button>
                        <button className="py-4 bg-gray-900 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/5">
                            <X size={14} /> Cancel
                        </button>
                    </div>

                    {rideStatus === 'ARRIVED' && (
                        <button 
                            onClick={handleCompleteRide}
                            className="w-full bg-white text-black py-4.5 rounded-2xl font-black text-xs tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            End Trip & Pay ${activeRide?.fare}
                        </button>
                    )}
                </div>
            ) : rideStatus === 'COMPLETED' ? (
                <div className="py-12 flex flex-col items-center text-center animate-fade-in">
                    <CheckCircle2 size={56} className="text-green-500 mb-6" />
                    <h3 className="text-xl font-bold text-white mb-1">You have arrived</h3>
                    <p className="text-xs text-gray-500 font-medium mb-8">Payment processed. Rate your experience?</p>
                </div>
            ) : null}
        </div>
    </div>
  );

  const renderDriverView = () => (
      <div className="flex flex-col h-full bg-neutral-950 p-6 animate-fade-in">
          <div className="bg-gray-900 p-8 rounded-[40px] border border-white/5 mb-8 mt-20">
              <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-full border-2 border-blue-500 p-0.5">
                      <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div>
                      <h3 className="text-lg font-bold text-white">Active Session</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Online: 4h 12m</p>
                  </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/20 p-5 rounded-3xl border border-white/5">
                      <p className="text-gray-500 text-[9px] font-black uppercase mb-1">Today's Pay</p>
                      <p className="text-white font-black text-xl">$142.50</p>
                  </div>
                  <div className="bg-black/20 p-5 rounded-3xl border border-white/5">
                      <p className="text-gray-500 text-[9px] font-black uppercase mb-1">Accept Rate</p>
                      <p className="text-white font-black text-xl">98%</p>
                  </div>
              </div>
          </div>

          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Navigation size={14} className="text-blue-500" /> New Ride Requests
          </h3>

          <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
              <div className="bg-gray-900 p-6 rounded-[32px] border border-white/5 flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                          <img src="https://i.pravatar.cc/150?u=passenger" className="w-10 h-10 rounded-xl" />
                          <div>
                              <h4 className="font-bold text-white text-sm">Sarah W.</h4>
                              <p className="text-[9px] text-gray-500 uppercase font-bold">1.2 mi • Standard</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className="text-blue-500 font-black text-lg">$14.20</p>
                          <p className="text-[8px] text-gray-500 uppercase font-black">Incl. Tip</p>
                      </div>
                  </div>
                  <div className="space-y-3">
                      <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full border border-blue-500 mt-1" />
                          <p className="text-xs text-gray-400 truncate">455 West 23rd St</p>
                      </div>
                      <div className="flex items-start gap-3">
                          <MapPin size={14} className="text-red-500" />
                          <p className="text-xs text-gray-400 truncate">Grand Central Station</p>
                      </div>
                  </div>
                  <button className="w-full bg-white text-black py-4 rounded-2xl font-bold text-xs tracking-tight hover:bg-gray-200 transition-colors">Accept Ride</button>
              </div>

              <div className="p-10 text-center opacity-30">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Searching for nearby pings...</p>
              </div>
          </div>
      </div>
  );

  return (
    <div className="h-full bg-black flex flex-col">
      <div className="absolute top-12 left-0 right-0 z-50 px-6 flex justify-between items-center pointer-events-none">
          <button onClick={onBack} className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white pointer-events-auto active:scale-95 transition-transform">
              <ChevronLeft size={24} />
          </button>
          
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-1.5 rounded-full flex pointer-events-auto shadow-2xl">
              <button 
                onClick={() => setViewMode('passenger')}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'passenger' ? 'bg-white text-black' : 'text-gray-500'}`}
              >
                  Passenger
              </button>
              <button 
                onClick={() => setViewMode('driver')}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'driver' ? 'bg-white text-black' : 'text-gray-500'}`}
              >
                  Driver
              </button>
          </div>

          <div className="w-12 h-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-blue-500 pointer-events-auto">
              <Navigation size={22} fill="currentColor" className="opacity-80" />
          </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {viewMode === 'passenger' ? renderPassengerView() : renderDriverView()}
      </div>
    </div>
  );
};
