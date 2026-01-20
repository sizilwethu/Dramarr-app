
import React, { useState, useEffect, useRef } from 'react';
import { User, RideRequest, RideStatus } from '../types';
import { 
  MapPin, Navigation, Car, ShieldCheck, Clock, Search, 
  ChevronRight, X, Star, CreditCard, ChevronLeft, Send, 
  CheckCircle2, AlertCircle, Sparkles, User as UserIcon,
  Smartphone, Map as MapIcon, MoreHorizontal
} from 'lucide-react';

interface DriveViewProps {
  user: User;
  onUpdateUser: (data: Partial<User>) => void;
  onBack: () => void;
}

const VEHICLE_CLASSES = [
  { type: 'Standard', name: 'Standard Script', price: 1.2, icon: Car, color: 'text-blue-400' },
  { type: 'Director', name: 'Director Class', price: 2.5, icon: ShieldCheck, color: 'text-neon-purple' },
  { type: 'Superstar', name: 'Superstar SUV', price: 5.0, icon: Sparkles, color: 'text-yellow-400' }
];

const POPULAR_LOCATIONS = [
  'Grand Studio A', 'Sunset Boulevard Set', 'Production Office 4', 
  'Downtown Premiere Hall', 'Casting House', 'Airport Private Wing'
];

export const DriveView: React.FC<DriveViewProps> = ({ user, onUpdateUser, onBack }) => {
  const [viewMode, setViewMode] = useState<'passenger' | 'driver'>(user.isDriver ? 'driver' : 'passenger');
  const [rideStatus, setRideStatus] = useState<RideStatus>('REQUESTING');
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  
  // Passenger Form
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_CLASSES[0]);

  // Driver Mode
  const [availableRequests, setAvailableRequests] = useState<RideRequest[]>([]);

  // Simulation Effects
  useEffect(() => {
    if (rideStatus === 'SEARCHING') {
      const timer = setTimeout(() => {
        const mockDriver = {
          id: 'ride_123',
          passengerId: user.id,
          passengerName: user.username,
          passengerAvatar: user.avatarUrl,
          driverId: 'd_99',
          driverName: 'Marco P.',
          driverAvatar: 'https://i.pravatar.cc/150?u=marco',
          pickupLocation: pickup || 'Current Location',
          destination: destination || 'Studio A',
          fare: Math.round(selectedVehicle.price * 20),
          status: 'ACCEPTED',
          timestamp: Date.now(),
          vehicleType: selectedVehicle.type as any
        };
        setActiveRide(mockDriver as any);
        setRideStatus('ACCEPTED');
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (rideStatus === 'ACCEPTED') {
        const timer = setTimeout(() => setRideStatus('EN_ROUTE'), 4000);
        return () => clearTimeout(timer);
    }
    
    if (rideStatus === 'EN_ROUTE') {
        const timer = setTimeout(() => setRideStatus('ARRIVED'), 6000);
        return () => clearTimeout(timer);
    }
  }, [rideStatus]);

  const handleRequestRide = () => {
    if (!destination) return;
    setRideStatus('SEARCHING');
  };

  const handleCompleteRide = () => {
    if (!activeRide) return;
    onUpdateUser({ coins: user.coins - activeRide.fare });
    setRideStatus('COMPLETED');
    setTimeout(() => {
        setRideStatus('REQUESTING');
        setActiveRide(null);
    }, 3000);
  };

  const renderPassengerView = () => (
    <div className="flex flex-col h-full animate-fade-in relative">
        {/* Top Location Picker (only visible when requesting) */}
        {rideStatus === 'REQUESTING' && (
            <div className="px-6 py-4 space-y-3 z-20">
                <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-[32px] p-6 shadow-2xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-2 h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50" />
                        <input 
                            value={pickup}
                            onChange={e => setPickup(e.target.value)}
                            placeholder="Current Location"
                            className="bg-transparent border-none text-sm font-bold text-white focus:outline-none w-full"
                        />
                    </div>
                    <div className="h-px bg-white/5 w-full my-3" />
                    <div className="flex items-center gap-4">
                        <MapPin className="text-neon-pink" size={18} />
                        <input 
                            value={destination}
                            onChange={e => setDestination(e.target.value)}
                            placeholder="Where to film today?"
                            className="bg-transparent border-none text-sm font-bold text-white focus:outline-none w-full"
                        />
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {POPULAR_LOCATIONS.map(loc => (
                        <button 
                            key={loc}
                            onClick={() => setDestination(loc)}
                            className="px-4 py-2 bg-gray-900 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap hover:bg-white/5"
                        >
                            {loc}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* The Map Placeholder */}
        <div className="absolute inset-0 z-0 bg-neutral-900 flex items-center justify-center overflow-hidden">
             {/* Styled Grid representing a map */}
             <div className="w-[200%] h-[200%] absolute opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
             
             {/* Pulsing Location indicator */}
             <div className="relative">
                <div className="w-12 h-12 bg-neon-purple/20 rounded-full animate-ping absolute -inset-0" />
                <div className="w-4 h-4 bg-neon-purple rounded-full border-2 border-white shadow-xl relative z-10" />
             </div>

             {/* Driver Marker (Simulated) */}
             {['ACCEPTED', 'EN_ROUTE'].includes(rideStatus) && (
                 <div className="absolute top-1/3 left-1/4 animate-pulse">
                     <Car className="text-neon-pink" size={32} />
                     <div className="bg-neon-pink text-[8px] font-black text-white px-1 py-0.5 rounded-full mt-1">DRIVER</div>
                 </div>
             )}
        </div>

        {/* Bottom Booking Panel */}
        <div className="mt-auto bg-black/80 backdrop-blur-2xl border-t border-white/5 p-6 z-20 rounded-t-[40px] shadow-2xl">
            {rideStatus === 'REQUESTING' ? (
                <>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {VEHICLE_CLASSES.map(cls => (
                            <button 
                                key={cls.type}
                                onClick={() => setSelectedVehicle(cls)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-3xl border transition-all ${selectedVehicle.type === cls.type ? 'bg-white/5 border-white/20 scale-105' : 'border-transparent text-gray-500'}`}
                            >
                                <cls.icon className={selectedVehicle.type === cls.type ? cls.color : ''} size={28} />
                                <span className="text-[9px] font-black uppercase tracking-tighter">{cls.name}</span>
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={handleRequestRide}
                        disabled={!destination}
                        className="w-full bg-white text-black py-5 rounded-[24px] font-black uppercase text-sm tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-30"
                    >
                        Book {selectedVehicle.type} <ChevronRight size={18} />
                    </button>
                </>
            ) : rideStatus === 'SEARCHING' ? (
                <div className="py-12 flex flex-col items-center text-center animate-pulse">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 relative">
                        <Car size={32} className="text-neon-purple animate-bounce" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-1">Locating Driver</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Searching for high-rated stars nearby...</p>
                </div>
            ) : rideStatus === 'ACCEPTED' || rideStatus === 'EN_ROUTE' || rideStatus === 'ARRIVED' ? (
                <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <img src={activeRide?.driverAvatar} className="w-14 h-14 rounded-2xl border-2 border-neon-purple" />
                            <div>
                                <h4 className="text-lg font-black text-white">{activeRide?.driverName}</h4>
                                <div className="flex items-center gap-1 text-yellow-400">
                                    <Star size={10} fill="currentColor" />
                                    <span className="text-[10px] font-black uppercase">4.9 Creator Rating</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Status</p>
                            <span className="bg-neon-pink/20 text-neon-pink px-3 py-1 rounded-full text-[10px] font-black uppercase animate-pulse">
                                {rideStatus.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button className="py-4 bg-gray-900 rounded-2xl border border-white/5 font-bold text-xs flex items-center justify-center gap-2">
                            <Send size={14} /> Message
                        </button>
                        <button className="py-4 bg-gray-900 rounded-2xl border border-white/5 font-bold text-xs flex items-center justify-center gap-2">
                            <Smartphone size={14} /> Emergency
                        </button>
                    </div>

                    {rideStatus === 'ARRIVED' && (
                        <button 
                            onClick={handleCompleteRide}
                            className="w-full bg-green-500 text-white py-5 rounded-[24px] font-black uppercase text-sm tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                        >
                            Complete Trip & Pay {activeRide?.fare} Coins
                        </button>
                    )}
                </div>
            ) : rideStatus === 'COMPLETED' ? (
                <div className="py-12 flex flex-col items-center text-center animate-fade-in">
                    <CheckCircle2 size={64} className="text-green-500 mb-6" />
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-1">Arrived at Set!</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-8">Transaction Successful. Good luck with the shoot!</p>
                </div>
            ) : null}
        </div>
    </div>
  );

  const renderDriverView = () => (
      <div className="flex flex-col h-full bg-black p-6 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[40px] border border-white/5 mb-8 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-4 border-neon-purple p-1 mb-4">
                  <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" />
              </div>
              <h3 className="text-xl font-black text-white uppercase italic">Driver Active</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">Earnings Today: 0 Coins</p>
              
              <div className="flex gap-3 mt-8 w-full">
                  <div className="flex-1 bg-white/5 p-4 rounded-3xl border border-white/5 text-center">
                      <p className="text-gray-500 text-[8px] font-black uppercase mb-1">Rating</p>
                      <p className="text-white font-black">5.0</p>
                  </div>
                  <div className="flex-1 bg-white/5 p-4 rounded-3xl border border-white/5 text-center">
                      <p className="text-gray-500 text-[8px] font-black uppercase mb-1">Trips</p>
                      <p className="text-white font-black">0</p>
                  </div>
              </div>
          </div>

          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Navigation size={14} className="text-neon-purple" /> Live Request Radar
          </h3>

          <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
              <div className="bg-gray-900/40 p-6 rounded-[32px] border border-white/5 flex flex-col gap-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                      <Car size={64} className="text-neon-purple" />
                  </div>
                  <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                          <img src="https://i.pravatar.cc/150?u=a" className="w-10 h-10 rounded-xl" />
                          <div>
                              <h4 className="font-bold text-white text-sm">Jenna Prod.</h4>
                              <p className="text-[9px] text-gray-500 uppercase font-black">2.4 Miles Away</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className="text-neon-purple font-black text-xl italic">+85 Coins</p>
                          <p className="text-[8px] text-gray-500 uppercase font-black">Est. 12 mins</p>
                      </div>
                  </div>
                  <div className="space-y-2">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                          <span className="truncate">Production Office 4</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                          <MapPin size={12} className="text-neon-pink" />
                          <span className="truncate">Grand Studio A</span>
                      </div>
                  </div>
                  <button className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] transition-all">Accept Trip</button>
              </div>

              <div className="p-10 text-center">
                  <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">Searching for more requests...</p>
              </div>
          </div>
      </div>
  );

  return (
    <div className="h-full bg-black flex flex-col">
      {/* Header Overlay */}
      <div className="absolute top-12 left-0 right-0 z-50 px-6 flex justify-between items-center pointer-events-none">
          <button onClick={onBack} className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white pointer-events-auto active:scale-90 transition-transform">
              <ChevronLeft size={24} />
          </button>
          
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-1 rounded-full flex pointer-events-auto">
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

          <div className="w-12 h-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-yellow-400 pointer-events-auto">
              <CreditCard size={20} />
          </div>
      </div>

      <div className="flex-1 overflow-hidden pt-12">
        {viewMode === 'passenger' ? renderPassengerView() : renderDriverView()}
      </div>
    </div>
  );
};
