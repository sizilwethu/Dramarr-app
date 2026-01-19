
import React, { useState } from 'react';
import { Search, Flame, TrendingUp, Play, Grid, ChevronLeft } from 'lucide-react';
import { MOCK_SERIES, MOCK_VIDEOS } from '../services/mockData';
import { CATEGORIES } from '../types';

interface ExploreViewProps {
    onBack: () => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredSeries = MOCK_SERIES.filter(s => 
    (activeCategory === 'All' || s.category === activeCategory) &&
    (s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full bg-neon-dark pt-12 md:pt-6 pb-20 flex flex-col animate-fade-in max-w-7xl mx-auto w-full">
      
      {/* Search Bar */}
      <div className="px-4 md:px-8 mb-6 shrink-0">
        <div className="flex items-center gap-4 mb-4">
            <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                <ChevronLeft size={28} />
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Explore</h1>
        </div>
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 max-w-2xl">
            <Search className="absolute left-4 top-4 text-gray-500 w-5 h-5" />
            <input 
                type="text" 
                placeholder="Search series, genres, creators..." 
                className="w-full bg-transparent py-4 pl-12 pr-4 text-white focus:outline-none placeholder-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto md:px-4">
        
        {/* Categories Chips */}
        <div className="flex gap-2 px-4 md:px-4 mb-8 overflow-x-auto no-scrollbar shrink-0">
             <button 
                onClick={() => setActiveCategory('All')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeCategory === 'All' ? 'bg-white text-black border-white' : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-600'}`}
             >
                All Genres
             </button>
             {CATEGORIES.map(cat => (
                 <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-white text-black border-white' : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-600'}`}
                 >
                    {cat}
                 </button>
             ))}
        </div>

        {/* Trending Section */}
        {activeCategory === 'All' && !searchTerm && (
            <div className="mb-12">
                <div className="flex items-center gap-2 px-4 mb-4">
                    <Flame className="text-neon-pink w-6 h-6" />
                    <h2 className="text-xl font-bold text-white">Trending Now</h2>
                </div>
                <div className="flex gap-6 px-4 overflow-x-auto no-scrollbar snap-x">
                    {MOCK_SERIES.map(series => (
                        <div key={series.id} className="min-w-[160px] md:min-w-[200px] snap-start cursor-pointer group">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-3 relative">
                                <img src={series.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg text-[11px] font-bold text-white border border-white/10">
                                    {series.totalEpisodes} Eps
                                </div>
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                         <Play fill="white" className="text-white ml-1" size={24} />
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-bold text-base text-white truncate">{series.title}</h3>
                            <p className="text-sm text-gray-500">{series.category}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Results Grid - Responsive Columns */}
        <div className="px-4 pb-12">
             <div className="flex items-center gap-2 mb-6">
                <Grid className="text-neon-purple w-6 h-6" />
                <h2 className="text-xl font-bold text-white">
                    {searchTerm ? 'Search Results' : activeCategory === 'All' ? 'Must Watch Series' : `Best in ${activeCategory}`}
                </h2>
            </div>
            
            {filteredSeries.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredSeries.map(series => (
                        <div key={series.id} className="bg-gray-900/40 rounded-2xl p-3 border border-gray-800/50 hover:bg-gray-800 transition-all cursor-pointer group">
                             <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3 relative">
                                <img src={series.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                                    <span className="bg-black/70 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-md font-bold">{series.year}</span>
                                    <span className="bg-neon-purple/80 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase">{series.category}</span>
                                </div>
                            </div>
                            <h3 className="font-bold text-sm text-white truncate mb-1">{series.title}</h3>
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed opacity-70">{series.description}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-900/20 rounded-3xl border border-dashed border-gray-800">
                    <Search className="mx-auto w-12 h-12 text-gray-700 mb-4" />
                    <p className="text-gray-500 font-bold">No series matched your search.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};
