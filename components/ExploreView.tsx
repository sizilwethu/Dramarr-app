
import React, { useState } from 'react';
import { Search, Flame, TrendingUp, Play, Grid } from 'lucide-react';
import { MOCK_SERIES, MOCK_VIDEOS } from '../services/mockData';
import { CATEGORIES } from '../types';

export const ExploreView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredSeries = MOCK_SERIES.filter(s => 
    (activeCategory === 'All' || s.category === activeCategory) &&
    (s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full bg-neon-dark pt-12 pb-20 flex flex-col animate-fade-in">
      
      {/* Search Bar */}
      <div className="px-4 mb-6">
        <h1 className="text-3xl font-bold text-white mb-4">Explore</h1>
        <div className="relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
            <Search className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
            <input 
                type="text" 
                placeholder="Search series, genres, creators..." 
                className="w-full bg-transparent py-3 pl-10 pr-4 text-white focus:outline-none placeholder-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        
        {/* Categories Chips */}
        <div className="flex gap-2 px-4 mb-8 overflow-x-auto no-scrollbar">
             <button 
                onClick={() => setActiveCategory('All')}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeCategory === 'All' ? 'bg-white text-black' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}
             >
                All
             </button>
             {CATEGORIES.map(cat => (
                 <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-white text-black' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}
                 >
                    {cat}
                 </button>
             ))}
        </div>

        {/* Trending Section */}
        {activeCategory === 'All' && !searchTerm && (
            <div className="mb-8">
                <div className="flex items-center gap-2 px-4 mb-3">
                    <Flame className="text-neon-pink w-5 h-5" />
                    <h2 className="text-lg font-bold text-white">Trending Now</h2>
                </div>
                <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar snap-x">
                    {MOCK_SERIES.map(series => (
                        <div key={series.id} className="min-w-[140px] snap-start">
                            <div className="aspect-[3/4] rounded-xl overflow-hidden mb-2 relative group">
                                <img src={series.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-bold text-white border border-white/10">
                                    {series.totalEpisodes} Eps
                                </div>
                            </div>
                            <h3 className="font-bold text-sm text-white truncate">{series.title}</h3>
                            <p className="text-xs text-gray-500">{series.category}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Results Grid */}
        <div className="px-4">
             <div className="flex items-center gap-2 mb-3">
                <Grid className="text-neon-purple w-5 h-5" />
                <h2 className="text-lg font-bold text-white">{searchTerm ? 'Search Results' : activeCategory === 'All' ? 'Browse Series' : `${activeCategory} Series`}</h2>
            </div>
            
            {filteredSeries.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                    {filteredSeries.map(series => (
                        <div key={series.id} className="bg-gray-900/30 rounded-xl p-2 border border-gray-800/50">
                             <div className="aspect-[3/4] rounded-lg overflow-hidden mb-2 relative">
                                <img src={series.coverUrl} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                     <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                         <Play fill="white" className="text-white ml-1" size={20} />
                                     </div>
                                </div>
                            </div>
                            <h3 className="font-bold text-sm text-white truncate">{series.title}</h3>
                            <p className="text-xs text-gray-500 mb-1">{series.category} • {series.year}</p>
                            <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{series.description}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    <p>No series found.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};
