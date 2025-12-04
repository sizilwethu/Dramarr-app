
import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface InterstitialAdProps {
    onClose: () => void;
}

export const InterstitialAd: React.FC<InterstitialAdProps> = ({ onClose }) => {
    const [timeLeft, setTimeLeft] = useState(5);
    const [canClose, setCanClose] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setCanClose(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-fade-in">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-end z-20 bg-gradient-to-b from-black/80 to-transparent">
                {canClose ? (
                    <button 
                        onClick={onClose}
                        className="bg-gray-800/80 text-white px-4 py-2 rounded-full font-bold text-sm backdrop-blur-md hover:bg-gray-700 flex items-center gap-1"
                    >
                        <X size={16} /> Close Ad
                    </button>
                ) : (
                    <div className="bg-black/50 text-white px-4 py-2 rounded-full font-bold text-sm backdrop-blur-md">
                        Reward in {timeLeft}s
                    </div>
                )}
            </div>

            {/* Ad Content */}
            <div className="relative w-full h-full">
                <img 
                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=1200&fit=crop" 
                    className="w-full h-full object-cover opacity-80"
                    alt="Ad Background"
                />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/40">
                    <div className="bg-yellow-400 text-black font-black px-3 py-1 rounded mb-4 text-xs uppercase tracking-widest">Sponsored</div>
                    <h2 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">Level Up Your Game</h2>
                    <p className="text-gray-200 mb-8 max-w-xs">Join millions of players in the ultimate strategy RPG. Play for free today!</p>
                    
                    <button className="bg-white text-black font-bold text-xl py-4 px-10 rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-xl shadow-white/10">
                        Install Now <ExternalLink size={20} />
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-[10px] text-gray-500 bg-black/90">
                Advertisement • Game Co Ltd.
            </div>
        </div>
    );
};
