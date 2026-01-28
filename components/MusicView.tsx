
import React, { useState, useEffect, useRef } from 'react';
import { MusicTrack, User } from '../types';
import { api } from '../services/api';
import { Play, Pause, Music, Disc, Heart, MoreHorizontal, Search, Upload, CheckCircle, FileAudio, Image as ImageIcon, ChevronLeft } from 'lucide-react';

interface MusicViewProps {
    currentTrack: MusicTrack | null;
    isPlaying: boolean;
    onPlayTrack: (track: MusicTrack) => void;
    onPauseTrack: () => void;
    currentUser?: User;
    onBack: () => void;
}

export const MusicView: React.FC<MusicViewProps> = ({ currentTrack, isPlaying, onPlayTrack, onPauseTrack, currentUser, onBack }) => {
    const [activeTab, setActiveTab] = useState<'browse' | 'upload'>('browse');
    const [searchTerm, setSearchTerm] = useState('');
    const [tracks, setTracks] = useState<MusicTrack[]>([]);

    // Upload Form State
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState(currentUser?.username || '');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [duration, setDuration] = useState('');
    const [licenseChecked, setLicenseChecked] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadTracks();
    }, []);

    const loadTracks = async () => {
        const dbTracks = await api.getMusicTracks();
        setTracks(dbTracks);
    };

    const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudioFile(file);
            // Calculate duration
            const audio = new Audio(URL.createObjectURL(file));
            audio.onloadedmetadata = () => {
                const mins = Math.floor(audio.duration / 60);
                const secs = Math.floor(audio.duration % 60);
                setDuration(`${mins}:${secs.toString().padStart(2, '0')}`);
            };
        }
    };

    const handleUpload = async () => {
        if (!audioFile || !title || !artist || !licenseChecked || !currentUser) return;
        setIsUploading(true);
        try {
            await api.uploadMusicTrack(audioFile, coverFile, title, artist, duration, currentUser.id);
            alert("Track uploaded successfully!");
            setActiveTab('browse');
            loadTracks(); // Refresh list
            
            // Reset form
            setTitle('');
            setAudioFile(null);
            setCoverFile(null);
            setLicenseChecked(false);
        } catch (e) {
            console.error(e);
            alert("Failed to upload track.");
        }
        setIsUploading(false);
    };

    const filteredTracks = tracks.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full bg-neon-dark pt-12 pb-24 flex flex-col animate-fade-in">
            {/* Header */}
            <div className="px-4 mb-4">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Music className="text-neon-pink" /> Music
                    </h1>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-900 p-1 rounded-xl mb-4">
                    <button 
                        onClick={() => setActiveTab('browse')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'browse' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
                    >
                        Browse
                    </button>
                    <button 
                        onClick={() => setActiveTab('upload')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'upload' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
                    >
                        Upload
                    </button>
                </div>
            </div>

            {activeTab === 'browse' ? (
                <div className="flex-1 overflow-y-auto no-scrollbar px-4">
                    {/* Search */}
                    <div className="relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 mb-6">
                        <Search className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Search songs, artists..." 
                            className="w-full bg-transparent py-3 pl-10 pr-4 text-white focus:outline-none placeholder-gray-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {/* Featured / Trending */}
                    {!searchTerm && tracks.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-white mb-4">Trending Now</h2>
                            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x">
                                {tracks.slice(0, 5).map(track => (
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

                    {/* All Tracks List */}
                    <h2 className="text-lg font-bold text-white mb-4">{searchTerm ? 'Results' : 'All Tracks'}</h2>
                    <div className="space-y-2">
                        {filteredTracks.map((track, index) => {
                            const isActive = currentTrack?.id === track.id;
                            const isUserUpload = track.uploaderId;
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
                                        <h4 className={`font-bold text-sm truncate ${isActive ? 'text-neon-pink' : 'text-white'}`}>
                                            {track.title}
                                            {isUserUpload && <span className="ml-2 text-[8px] bg-gray-700 text-gray-300 px-1 rounded uppercase">UGC</span>}
                                        </h4>
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
            ) : (
                <div className="flex-1 overflow-y-auto px-4 pb-10">
                    <div className="flex items-center gap-2 mb-6">
                        <button onClick={() => setActiveTab('browse')} className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                            <ChevronLeft size={20} /> <span className="text-sm font-bold">Back to Browse</span>
                        </button>
                    </div>

                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Upload className="text-neon-purple w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Upload Music</h2>
                            <p className="text-xs text-gray-400 mt-1">Share your original tracks with the dramarr community.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 font-bold ml-1 uppercase">Track Title</label>
                                <input 
                                    type="text" 
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-neon-pink outline-none"
                                    placeholder="e.g. Summer Vibes"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-bold ml-1 uppercase">Artist Name</label>
                                <input 
                                    type="text" 
                                    value={artist}
                                    onChange={e => setArtist(e.target.value)}
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-neon-pink outline-none"
                                    placeholder="Your Artist Name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 font-bold ml-1 uppercase mb-2 block">Audio File</label>
                                    <label className="flex flex-col items-center justify-center h-24 bg-black border border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-gray-500">
                                        {audioFile ? (
                                            <div className="text-center">
                                                <FileAudio className="w-6 h-6 text-green-500 mx-auto mb-1" />
                                                <p className="text-[10px] text-gray-300 truncate max-w-[100px]">{audioFile.name}</p>
                                                <p className="text-[10px] text-gray-500">{duration}</p>
                                            </div>
                                        ) : (
                                            <>
                                                <FileAudio className="w-6 h-6 text-gray-500 mb-1" />
                                                <span className="text-[10px] text-gray-500">MP3 / WAV</span>
                                            </>
                                        )}
                                        <input type="file" accept="audio/*" className="hidden" onChange={handleAudioSelect} />
                                    </label>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 font-bold ml-1 uppercase mb-2 block">Cover Art</label>
                                    <label className="flex flex-col items-center justify-center h-24 bg-black border border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-gray-500">
                                        {coverFile ? (
                                            <img src={URL.createObjectURL(coverFile)} className="h-full object-cover rounded" />
                                        ) : (
                                            <>
                                                <ImageIcon className="w-6 h-6 text-gray-500 mb-1" />
                                                <span className="text-[10px] text-gray-500">JPG / PNG</span>
                                            </>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={e => setCoverFile(e.target.files?.[0] || null)} />
                                    </label>
                                </div>
                            </div>
                            
                            <div className="bg-gray-800/50 p-3 rounded-lg flex gap-3 items-start border border-gray-700">
                                <div 
                                    className={`w-5 h-5 rounded border border-gray-500 flex items-center justify-center cursor-pointer mt-0.5 ${licenseChecked ? 'bg-neon-pink border-neon-pink' : 'bg-transparent'}`}
                                    onClick={() => setLicenseChecked(!licenseChecked)}
                                >
                                    {licenseChecked && <CheckCircle size={14} className="text-white" />}
                                </div>
                                <p className="text-[10px] text-gray-400 leading-tight cursor-pointer" onClick={() => setLicenseChecked(!licenseChecked)}>
                                    I certify that I own the rights to this music or have a license to distribute it. I understand that unauthorized uploads will be removed.
                                </p>
                            </div>

                            <button 
                                onClick={handleUpload}
                                disabled={isUploading || !audioFile || !title || !licenseChecked}
                                className="w-full bg-neon-purple text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                            >
                                {isUploading ? 'Uploading...' : 'Publish Track'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
