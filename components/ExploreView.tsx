
import React, { useState } from 'react';
import { Search, Flame, TrendingUp, Play, Grid, ChevronLeft, ChevronRight, Trophy, Crown, Star, Medal, Sparkles, MessageSquare } from 'lucide-react';
import { MOCK_SERIES, MOCK_VIDEOS } from '../services/mockData';
import { CATEGORIES, User, AICharacter } from '../types';

interface ExploreViewProps {
    onBack: () => void;
    onOpenCharacterChat: (char: AICharacter) => void;
}

const TOP_CHARACTERS: AICharacter[] = [
    { 
        id: 'c1', 
        name: 'President Kang', 
        seriesId: 's1', 
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', 
        description: 'The cold-hearted CEO from "The CEO\'s Secret Wife".',
        personality: 'Cold, calculated, secretive, but deeply protective. Speaks with authority.'
    },
    { 
        id: 'c2', 
        name: 'Elena Vance', 
        seriesId: 's2', 
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop', 
        description: 'The vengeful heiress from "Midnight Revenge".',
        personality: 'Sharp-tongued, brilliant, and always two steps ahead. A little bit mysterious.'
    }
];

export const ExploreView: React.FC<ExploreViewProps> = ({ onBack, onOpenCharacterChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredSeries = MOCK_SERIES.filter(s => 
    (activeCategory === 'All' || s.category === activeCategory) &&
    (s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full bg-black pt-12 md:pt-6 pb-20 flex flex-col animate-fade-in max-w-7xl mx-auto w-full overflow-hidden">
      
      <div className="px-4 md:px-8 mb-6 shrink-0">
        <div className="flex items-center gap-4 mb-4">
            <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                <ChevronLeft size={28} />
            </button>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Explore</h1>
        </div>
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 max-w-2xl">
            <Search className="absolute left-4 top-4 text-gray-500 w-5 h-5" />
            <input type="text" placeholder="Search dramas, characters, creators..." className="w-full bg-transparent py-4 pl-12 pr-4 text-white focus:outline-none placeholder-gray-600" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto md:px-4 no-scrollbar">
        
        {/* Advanced: AI Protagonists Section */}
        {activeCategory === 'All' && !searchTerm && (
            <div className="mb-12">
                <div className="flex items-center justify-between px-4 mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-neon-purple w-5 h-5" />
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Chat with Protagonists</h2>
                    </div>
                    <span className="text-[10px] bg-neon-purple/20 text-neon-purple px-2 py-0.5 rounded-full font-bold">BETA</span>
                </div>
                <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar">
                    {TOP_CHARACTERS.map(char => (
                        <div 
                            key={char.id} 
                            onClick={() => onOpenCharacterChat(char)}
                            className="min-w-[280px] bg-gradient-to-br from-gray-900 to-black p-4 rounded-3xl border border-white/5 relative group cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <img src={char.avatarUrl} className="w-16 h-16 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition-transform" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white text-base truncate">{char.name}</h3>
                                    <p className="text-[10px] text-gray-500 line-clamp-2">{char.description}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between bg-neon-purple/10 p-3 rounded-2xl border border-neon-purple/20">
                                <span className="text-[10px] text-neon-purple font-black flex items-center gap-1 uppercase tracking-widest">
                                    <MessageSquare size={12} /> Talk to Character
                                </span>
                                <ChevronRight size={14} className="text-neon-purple" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="flex gap-2 px-4 mb-8 overflow-x-auto no-scrollbar shrink-0">
             <button onClick={() => setActiveCategory('All')} className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeCategory === 'All' ? 'bg-white text-black border-white shadow-xl' : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-600'}`}>All Genres</button>
             {CATEGORIES.map(cat => (
                 <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-white text-black border-white shadow-xl' : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-600'}`}>{cat}</button>
             ))}
        </div>

        <div className="px-4 pb-12">
             <div className="flex items-center gap-2 mb-6">
                <Grid className="text-neon-purple w-6 h-6" />
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">{searchTerm ? 'Search Results' : 'Must Watch Dramas'}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredSeries.map(series => (
                    <div key={series.id} className="bg-gray-900/40 rounded-[24px] p-3 border border-white/5 hover:bg-gray-800 transition-all cursor-pointer group">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-3 relative">
                            <img src={series.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                                <span className="bg-white/20 backdrop-blur-md text-white text-[9px] px-2 py-1 rounded-lg font-bold uppercase">{series.category}</span>
                            </div>
                        </div>
                        <h3 className="font-bold text-sm text-white truncate mb-1">{series.title}</h3>
                        <p className="text-[10px] text-gray-500 line-clamp-1">{series.totalEpisodes} Episodes • {series.year}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
