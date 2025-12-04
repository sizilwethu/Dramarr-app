import React from 'react';
import { Video, User } from '../types';
import { Gift, Lock, Play, Zap, Check } from 'lucide-react';

interface DailyRewardViewProps {
  user: User;
  videos: Video[];
  onClose: () => void;
  onPlayVideo: (index: number) => void;
  onWatchAd: () => void;
}

export const DailyRewardView: React.FC<DailyRewardViewProps> = ({ 
  user, 
  videos, 
  onClose, 
  onPlayVideo,
  onWatchAd
}) => {
  // Filter for locked videos only
  const lockedVideos = videos.filter(v => v.isLocked);

  return (
    <div className="h-full bg-neon-dark pt-12 pb-20 flex flex-col animate-fade-in relative">
      
      {/* Header */}
      <div className="px-4 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Gift className="text-yellow-400 w-6 h-6 animate-bounce" />
            <h1 className="text-2xl font-bold text-white">Daily Rewards</h1>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">Close</button>
      </div>

      <div className="px-4 flex-1 overflow-y-auto">
        
        {/* Credit Balance Card */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-6 border border-purple-500/30 shadow-lg shadow-purple-900/20 mb-8">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-purple-200 text-sm font-bold uppercase">Your Credits</p>
                    <h2 className="text-4xl font-bold text-white flex items-center gap-2">
                        {user.credits} <Zap className="text-yellow-400 fill-yellow-400 w-6 h-6" />
                    </h2>
                </div>
                <button 
                    onClick={onWatchAd}
                    className="bg-white text-purple-900 px-4 py-2 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform flex items-center gap-1"
                >
                    <Play size={14} fill="currentColor" /> Watch Ad (+1)
                </button>
            </div>
            <p className="text-xs text-purple-200/70">
                Unlock episodes to earn <span className="text-yellow-400 font-bold">500 Coins</span> per video!
            </p>
        </div>

        {/* Task List (Locked Videos) */}
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Lock size={18} className="text-neon-pink" /> 
            Premium Episodes (Tasks)
        </h3>
        
        {lockedVideos.length > 0 ? (
            <div className="space-y-4">
                {lockedVideos.map((video) => {
                    const isUnlocked = user.unlockedVideoIds.includes(video.id);
                    // Find actual index in main video list for playback
                    const actualIndex = videos.findIndex(v => v.id === video.id);

                    return (
                        <div key={video.id} className="bg-gray-900 rounded-xl p-3 flex gap-3 border border-gray-800 relative overflow-hidden group">
                            <div className="relative w-24 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0">
                                <img src={video.thumbnailUrl} className="w-full h-full object-cover" />
                                {isUnlocked ? (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Check className="text-green-500 w-8 h-8" />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Lock className="text-white w-6 h-6" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-center min-w-0">
                                <h4 className="font-bold text-white truncate text-sm mb-1">{video.description}</h4>
                                <p className="text-xs text-gray-500 mb-2">{video.seriesTitle} • Ep.{video.episodeNumber}</p>
                                
                                {isUnlocked ? (
                                     <div className="inline-block bg-green-900/30 text-green-500 text-xs px-2 py-1 rounded border border-green-900/50">
                                        Completed (+500 Coins)
                                     </div>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-xs text-yellow-400 font-bold">
                                            <span>Reward: 500 Coins</span>
                                        </div>
                                        <button 
                                            onClick={() => onPlayVideo(actualIndex)}
                                            className="bg-neon-pink text-white text-xs font-bold py-2 px-4 rounded-lg mt-1 w-fit"
                                        >
                                            Go to Unlock
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="text-center text-gray-500 py-10">
                <p>No premium tasks available right now.</p>
            </div>
        )}

      </div>
    </div>
  );
};
