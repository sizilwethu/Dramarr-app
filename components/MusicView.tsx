
import React, { useState } from 'react';
import { MusicTrack } from '../types';
import { MOCK_MUSIC_TRACKS } from '../services/mockData';
import { Play, Pause, Music, Disc, Heart, MoreHorizontal, Search } from 'lucide-react';

interface MusicViewProps {
    currentTrack: MusicTrack | null;
    isPlaying: boolean;
    onPlayTrack: (track: MusicTrack) => void;
    onPauseTrack: () => void;
}

export const MusicView: React.FC<MusicViewProps> = ({ currentTrack, isPlaying, onPlayTrack, onPauseTrack }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTracks = MOCK_MUSIC_TRACKS.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full bg-neon-dark pt-12 pb-24 flex flex-col animate-fade-in">
            {/* Header */}
            <div className="px-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Music className="text-neon-pink" /> Music
                    </h1>
                </div>
                
                {/* Search */}
                <div className="relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                    <Search className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search songs, artists..." 
                        className="w-full bg-transparent py-3 pl-10 pr-4 text-white focus:outline-none placeholder-gray-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-4">
                
                {/* Featured / Trending */}
                {!searchTerm && (
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-white mb-4">Trending Now</h2>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x">
                            {MOCK_MUSIC_TRACKS.map(track => (
                                <div 
                                    key={track.id} 
                                    className="min-w-[140px] snap-start cursor-pointer group"
                                    onClick={() => onPlayTrack(track)}
                                >
                                    <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                                        <img src={track.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                                {currentTrack?.id === track.id && isPlaying ? (
                                                    <Pause fill="white" className="text-white ml-0.5" size={20} />
                                                ) : (
                                                    <Play fill="white" className="text-white ml-1" size={20} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-sm text-white truncate">{track.title}</h3>
                                    <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Categories */}
                {!searchTerm && (
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {['Pop Hits', 'Dramatic Scores', 'Lo-Fi Chill', 'Workout'].map((genre, i) => (
                            <div key={i} className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex items-center justify-between cursor-pointer hover:bg-gray-800">
                                <span className="font-bold text-sm text-white">{genre}</span>
                                <Disc className={`w-5 h-5 ${i % 2 === 0 ? 'text-neon-purple' : 'text-neon-pink'}`} />
                            </div>
                        ))}
                    </div>
                )}

                {/* All Tracks List */}
                <h2 className="text-lg font-bold text-white mb-4">{searchTerm ? 'Results' : 'Top Charts'}</h2>
                <div className="space-y-2">
                    {filteredTracks.map((track, index) => {
                        const isActive = currentTrack?.id === track.id;
                        return (
                            <div 
                                key={track.id} 
                                className={`flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer ${isActive ? 'bg-gray-800 border border-gray-700' : 'hover:bg-gray-900/50'}`}
                                onClick={() => isActive && isPlaying ? onPauseTrack() : onPlayTrack(track)}
                            >
                                <span className="text-gray-500 text-xs font-bold w-4 text-center">{index + 1}</span>
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={track.coverUrl} className="w-full h-full object-cover" />
                                    {isActive && isPlaying && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <div className="flex gap-0.5 items-end h-3">
                                                <div className="w-1 bg-neon-pink animate-[bounce_0.6s_infinite] h-full"></div>
                                                <div className="w-1 bg-neon-pink animate-[bounce_0.8s_infinite] h-2/3"></div>
                                                <div className="w-1 bg-neon-pink animate-[bounce_0.5s_infinite] h-full"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold text-sm truncate ${isActive ? 'text-neon-pink' : 'text-white'}`}>{track.title}</h4>
                                    <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-600">{track.duration}</span>
                                    <button className="text-gray-500 hover:text-white"><MoreHorizontal size={16}/></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
