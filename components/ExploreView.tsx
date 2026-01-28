
import React, { useState, useEffect } from 'react';
import { Search, Grid, ChevronLeft, ChevronRight, Sparkles, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { CATEGORIES, Series, AICharacter } from '../types';

interface ExploreViewProps {
    onBack: () => void;
    onOpenCharacterChat: (char: AICharacter) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ onBack, onOpenCharacterChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [characters, setCharacters] = useState<AICharacter[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExploreData();
  }, [activeCategory]);

  const loadExploreData = async () => {
    setIsLoading(true);
    try {
      const [chars, sers] = await Promise.all([
        api.getAICharacters(),
        api.getSeries(activeCategory)
      ]);
      setCharacters(chars);
      setSeries(sers);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSeries = series.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 h-full flex flex-col bg-black md:pt-6 animate-fade-in max-w-7xl mx-auto w-full min-h-0 overflow-hidden">
      <div className="px-4 md:px-8 mb-4 shrink-0">
        <div className="flex items-center gap-3 mb-4">
            <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Explore</h1>
        </div>
        <div className="relative bg-gray-900/80 rounded-2xl overflow-hidden border border-white/5 max-w-2xl">
            <Search className="absolute left-4 top-3.5 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search dramas, characters..." 
              className="w-full bg-transparent py-3 pl-11 pr-4 text-sm text-white focus:outline-none placeholder-gray-600 font-medium" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
        {activeCategory === 'All' && !searchTerm && characters.length > 0 && (
            <div className="mb-8">
                <div className="flex items-center justify-between px-4 mb-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-neon-purple w-4 h-4" />
                        <h2 className="text-[9px] font-black text-white uppercase tracking-[0.4em]">Cast Connections</h2>
                    </div>
                </div>
                <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar">
                    {characters.map(char => (
                        <div 
                            key={char.id} 
                            onClick={() => onOpenCharacterChat(char)}
                            className="min-w-[240px] bg-gray-900/40 p-4 rounded-[28px] border border-white/5 relative group cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <img src={char.avatarUrl} className="w-12 h-12 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition-transform" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white text-xs truncate">{char.name}</h3>
                                    <p className="text-[9px] text-gray-500 line-clamp-1">{char.description}</p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between bg-neon-purple/10 p-2.5 rounded-xl border border-neon-purple/20">
                                <span className="text-[9px] text-neon-purple font-black flex items-center gap-1.5 uppercase tracking-widest">
                                    <MessageSquare size={12} /> Talk
                                </span>
                                <ChevronRight size={12} className="text-neon-purple" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="flex gap-2 px-4 mb-6 overflow-x-auto no-scrollbar shrink-0">
             <button onClick={() => setActiveCategory('All')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${activeCategory === 'All' ? 'bg-white text-black border-white shadow-xl' : 'bg-gray-900 text-gray-400 border-gray-800'}`}>All</button>
             {CATEGORIES.map(cat => (
                 <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${activeCategory === cat ? 'bg-white text-black border-white shadow-xl' : 'bg-gray-900 text-gray-400 border-gray-800'}`}>{cat}</button>
             ))}
        </div>

        <div className="px-4 pb-24 min-h-full">
            <div className="flex items-center gap-2 mb-4 px-1">
                <Grid className="text-neon-purple w-4 h-4" />
                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">{searchTerm ? 'Results' : 'Recommended'}</h2>
            </div>
            {isLoading ? (
                <div className="flex justify-center py-20"><Sparkles className="animate-spin text-neon-purple" /></div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredSeries.map(s => (
                        <div key={s.id} className="bg-gray-900/40 rounded-[24px] p-2 border border-white/5 hover:bg-gray-800 transition-all cursor-pointer group">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-2 relative">
                                <img src={s.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                <div className="absolute bottom-1.5 left-1.5">
                                    <span className="bg-white/20 backdrop-blur-md text-white text-[7px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">{s.category}</span>
                                </div>
                            </div>
                            <h3 className="font-bold text-[11px] text-white truncate px-1">{s.title}</h3>
                            <p className="text-[9px] text-gray-500 px-1">{s.totalEpisodes} Episodes</p>
                        </div>
                    ))}
                </div>
            )}
            
            {!isLoading && filteredSeries.length === 0 && (
                <div className="py-20 text-center opacity-30">
                    <p className="text-sm font-bold uppercase tracking-widest">No matching dramas found</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
