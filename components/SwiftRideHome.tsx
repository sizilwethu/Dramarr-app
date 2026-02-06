
import React, { useState, useEffect, useRef } from 'react';
import { User, RideStatus, RideRequest } from '../types';
import { api } from '../services/api';
import { MapPin, Star, Car, ShieldCheck, Navigation, Phone, CheckCircle2, Users, MoreHorizontal, ChevronLeft, X, LocateFixed, Navigation2 } from 'lucide-react';

interface SwiftRideHomeProps {
  user: User;
  onUpdateUser: (data: Partial<User>) => void;
}

const FLEET = [
  { type: 'Economy', name: 'SwiftEconomy', price: 1.0, icon: Car, time: '3 min', color: 'text-slate-400' },
  { type: 'Elite', name: 'SwiftElite', price: 1.8, icon: ShieldCheck, time: '5 min', color: 'text-blue-500' },
  { type: 'Van', name: 'SwiftVan', price: 2.5, icon: Users, time: '8 min', color: 'text-green-500' }
];

type MapPoint = { x: number; y: number; label?: string };

export const SwiftRideHome: React.FC<SwiftRideHomeProps> = ({ user, onUpdateUser }) => {
  const [rideStatus, setRideStatus] = useState<RideStatus>('IDLE');
  const [pickup, setPickup] = useState('Current Location');
  const [destination, setDestination] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(FLEET[0]);
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  
  // Map Selection States
  const [pickupPoint, setPickupPoint] = useState<MapPoint | null>({ x: 50, y: 50, label: 'Current Location' });
  const [destPoint, setDestPoint] = useState<MapPoint | null>(null);
  const [selectionMode, setSelectionMode] = useState<'pickup' | 'destination'>('destination');
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: any;
    if (activeRide && !['IDLE', 'COMPLETED', 'CANCELLED'].includes(rideStatus)) {
        interval = setInterval(async () => {
            try {
                const update = await api.getRideStatus(activeRide.id);
                if (update.status !== rideStatus) {
                    setRideStatus(update.status);
                    setActiveRide(update);
                }
            } catch (e) {
                console.error("Status check failed", e);
            }
        }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeRide, rideStatus]);

  const handleMapClick = (e: React.MouseEvent) => {
    if (rideStatus !== 'IDLE' && rideStatus !== 'REQUESTING') return;
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const sectorLabel = `Sector ${String.fromCharCode(65 + Math.floor(y / 10))}-${Math.floor(x / 10)}`;

    if (selectionMode === 'pickup') {
      setPickupPoint({ x, y, label: sectorLabel });
      setPickup(sectorLabel);
      if (!destPoint) setSelectionMode('destination');
    } else {
      setDestPoint({ x, y, label: sectorLabel });
      setDestination(sectorLabel);
    }
  };

  const handleRequest = async () => {
    if (!destination) return;
    setRideStatus('SEARCHING');
    try {
        const fare = Math.round(selectedVehicle.price * 12);
        const ride = await api.requestRide({
            passengerId: user.id,
            pickupAddress: pickup,
            destinationAddress: destination,
            fare,
            vehicleInfo: { type: selectedVehicle.type as any, model: '', plate: '', color: '' }
        });
        setActiveRide(ride);
    } catch (e) {
        alert("Failed to request ride. Please check balance.");
        setRideStatus('IDLE');
    }
  };

  const handleComplete = async () => {
    if (activeRide) {
      try {
        await api.updateProfile(user.id, { walletBalance: user.walletBalance - activeRide.fare });
        onUpdateUser({ walletBalance: user.walletBalance - activeRide.fare });
        setRideStatus('COMPLETED');
        setTimeout(() => {
          setRideStatus('IDLE');
          setActiveRide(null);
          setDestination('');
          setDestPoint(null);
          setPickupPoint({ x: 50, y: 50, label: 'Current Location' });
          setPickup('Current Location');
        }, 3000);
      } catch (e) {
          console.error(e);
      }
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-slate-950 overflow-hidden">
      {/* Interactive Map Area */}
      <div 
        ref={mapRef}
        onClick={handleMapClick}
        className={`absolute inset-0 z-0 bg-slate-900 cursor-crosshair transition-opacity duration-1000 ${rideStatus === 'SEARCHING' ? 'opacity-40' : 'opacity-100'}`}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* Render Route SVG */}
        {pickupPoint && destPoint && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path 
              d={`M ${pickupPoint.x} ${pickupPoint.y} L ${destPoint.x} ${destPoint.y}`} 
              vectorEffect="non-scaling-stroke"
              className="stroke-blue-500/30"
              strokeWidth="4"
              fill="none"
              strokeDasharray="8 8"
            />
            <path 
              d={`M ${pickupPoint.x}% ${pickupPoint.y}% L ${destPoint.x}% ${destPoint.y}%`} 
              stroke="url(#routeGradient)"
              strokeWidth="4"
              fill="none"
              className="animate-[dash_2s_linear_infinite]"
              style={{ strokeDasharray: '10, 10' }}
            />
          </svg>
        )}

        {/* Pickup Marker */}
        {pickupPoint && (
          <div 
            style={{ left: `${pickupPoint.x}%`, top: `${pickupPoint.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full animate-ping absolute -inset-4" />
              <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-2xl flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[8px] font-black text-white border border-white/10 uppercase tracking-widest">
                Pickup
              </div>
            </div>
          </div>
        )}

        {/* Destination Marker */}
        {destPoint && (
          <div 
            style={{ left: `${destPoint.x}%`, top: `${destPoint.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-red-500/20 rounded-full animate-ping absolute -inset-4" />
              <MapPin className="text-red-500 drop-shadow-xl" size={32} />
              <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[8px] font-black text-white border border-white/10 uppercase tracking-widest">
                {destPoint.label}
              </div>
            </div>
          </div>
        )}

        {/* Driver Simulation during trip */}
        {['ACCEPTED', 'EN_ROUTE'].includes(rideStatus) && pickupPoint && (
            <div 
                className="absolute transition-all duration-[5000ms] ease-linear z-30"
                style={{ 
                    left: rideStatus === 'ACCEPTED' ? `${pickupPoint.x - 10}%` : `${pickupPoint.x}%`,
                    top: rideStatus === 'ACCEPTED' ? `${pickupPoint.y - 10}%` : `${pickupPoint.y}%`
                }}
            >
                <div className="bg-white p-2 rounded-full shadow-2xl animate-bounce">
                    <Car className="text-blue-600" size={20} />
                </div>
            </div>
        )}
      </div>

      {/* Top Floating UI */}
      <div className="absolute top-12 left-0 right-0 z-40 px-6 pointer-events-none">
        <div className="flex justify-between items-center pointer-events-auto">
          <div className="flex gap-2">
            <button className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-3 rounded-full shadow-2xl">
                <MoreHorizontal className="text-slate-400" />
            </button>
            {rideStatus === 'IDLE' && (
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-1 rounded-full shadow-2xl flex">
                    <button 
                        onClick={() => setSelectionMode('pickup')}
                        className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${selectionMode === 'pickup' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                    >
                        Set Pickup
                    </button>
                    <button 
                        onClick={() => setSelectionMode('destination')}
                        className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${selectionMode === 'destination' ? 'bg-red-600 text-white' : 'text-slate-500'}`}
                    >
                        Set Dest
                    </button>
                </div>
            )}
          </div>
          <div className="bg-blue-600 px-6 py-2.5 rounded-full shadow-xl flex items-center gap-2">
            <span className="text-white text-xs font-black uppercase tracking-widest">${user.walletBalance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Selection Tooltip */}
      {rideStatus === 'IDLE' && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 z-40 animate-bounce">
              <div className="bg-white text-black px-4 py-2 rounded-full shadow-2xl border border-blue-500/20 flex items-center gap-2">
                  <Navigation2 size={14} className={selectionMode === 'pickup' ? 'text-blue-600' : 'text-red-600'} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                      Tap map to set {selectionMode}
                  </span>
              </div>
          </div>
      )}

      <div className="mt-auto z-40 bg-slate-950/90 backdrop-blur-3xl border-t border-slate-800 rounded-t-[48px] shadow-2xl px-6 pt-8 pb-6 max-h-[75%] overflow-y-auto no-scrollbar">
        {rideStatus === 'IDLE' ? (
          <>
            <div className="bg-slate-900/50 rounded-3xl p-5 mb-8 border border-white/5 relative">
              <div 
                className={`flex items-center gap-4 mb-4 p-2 rounded-2xl transition-colors cursor-pointer ${selectionMode === 'pickup' ? 'bg-blue-500/10' : ''}`}
                onClick={() => setSelectionMode('pickup')}
              >
                <div className="w-3 h-3 rounded-full border-2 border-blue-500" />
                <div className="flex-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pickup Location</p>
                    <p className="text-sm font-black text-white truncate">{pickup || 'Tap to select...'}</p>
                </div>
                {pickupPoint && <button onClick={(e) => { e.stopPropagation(); setPickupPoint(null); setPickup(''); }} className="p-1 text-slate-500"><X size={14}/></button>}
              </div>
              <div className="h-px bg-slate-800 w-full my-1 ml-7" />
              <div 
                className={`flex items-center gap-4 p-2 rounded-2xl transition-colors cursor-pointer ${selectionMode === 'destination' ? 'bg-red-500/10' : ''}`}
                onClick={() => setSelectionMode('destination')}
              >
                <MapPin className="text-red-500" size={18} />
                <div className="flex-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Destination</p>
                    <p className="text-sm font-black text-white truncate">{destination || 'Tap to select...'}</p>
                </div>
                {destPoint && <button onClick={(e) => { e.stopPropagation(); setDestPoint(null); setDestination(''); }} className="p-1 text-slate-500"><X size={14}/></button>}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center justify-between">
                Available Fleet 
                {destPoint && <span className="text-blue-500 text-[8px] animate-pulse">ROUTE DETECTED</span>}
              </h3>
              <div className="space-y-3">
                {FLEET.map(v => (
                  <button key={v.type} onClick={() => setSelectedVehicle(v)} className={`w-full flex items-center justify-between p-4 rounded-3xl border transition-all ${selectedVehicle.type === v.type ? 'bg-blue-600/10 border-blue-500' : 'border-transparent text-slate-500'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 bg-slate-900 rounded-2xl ${selectedVehicle.type === v.type ? v.color : ''}`}><v.icon size={24} /></div>
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
                disabled={!destination || !pickup} 
                className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black uppercase text-sm tracking-widest shadow-2xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-3"
            >
              <Navigation size={20} />
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
                  <img src={activeRide?.driverAvatar || 'https://via.placeholder.com/150'} className="w-16 h-16 rounded-3xl object-cover bg-slate-800" />
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 p-1.5 rounded-xl border-4 border-slate-950">
                    <Star size={10} fill="white" className="text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">{activeRide?.driverName || 'Finding Driver...'}</h4>
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

            {rideStatus === 'ARRIVED' && (
              <button onClick={handleComplete} className="w-full bg-green-500 text-white py-5 rounded-3xl font-black uppercase text-sm tracking-widest shadow-2xl shadow-green-500/20 active:scale-95 transition-all">
                End Trip & Pay ${activeRide?.fare}
              </button>
            )}
          </div>
        ) : rideStatus === 'COMPLETED' ? (
          <div className="py-12 flex flex-col items-center text-center animate-fade-in">
            <CheckCircle2 size={72} className="text-green-500 mb-6" />
            <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2 uppercase">Journey Completed</h3>
            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mb-10">You've arrived at your destination safely.</p>
          </div>
        ) : null}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
      `}} />
    </div>
  );
};