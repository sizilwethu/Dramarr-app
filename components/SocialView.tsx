
import React, { useState, useEffect, useRef } from 'react';
import { Story, SocialPost, User, Comment, Conversation, Message, CommunityMood } from '../types';
import { api } from '../services/api';
import { Heart, MessageSquare, Send, Plus, Search, MoreHorizontal, Video as VideoIcon, X, Play, Pause, Trash2, ExternalLink, Image as ImageIcon, Reply, Eye, ArrowLeft, PenSquare, Edit2, Save, Flag, AlertTriangle, ChevronLeft, RotateCcw, Sparkles, Split, Radio, Vote, Users } from 'lucide-react';

const MOCK_MOODS: CommunityMood[] = [
    { label: 'Suspense', percentage: 72, color: 'bg-neon-purple' },
    { label: 'Romance', percentage: 18, color: 'bg-neon-pink' },
    { label: 'Shock', percentage: 10, color: 'bg-yellow-500' },
];

export const SocialView: React.FC<{ 
  currentUser: User, 
  stories: Story[], 
  posts: SocialPost[], 
  onDeletePost: (id: string) => void, 
  onDeleteStory: (id: string) => void, 
  onRefresh?: () => void, 
  onBack: () => void,
  onChatStateChange?: (isActive: boolean) => void 
}> = ({ currentUser, stories, posts: initialPosts, onDeletePost, onDeleteStory, onRefresh, onBack, onChatStateChange }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'theories' | 'inbox'>('feed');
  const [posts, setPosts] = useState<SocialPost[]>(initialPosts);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeMood, setActiveMood] = useState<CommunityMood>(MOCK_MOODS[0]);

  const handleManualRefresh = async () => {
      if (isRefreshing || !onRefresh) return;
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 800);
  };

  const MoodAnalyzer = () => (
      <div className="px-4 mb-8">
          <div className="bg-gray-900/40 border border-white/5 rounded-[32px] p-6 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                  <Sparkles size={64} className="text-neon-purple" />
              </div>
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                      <Radio size={16} className="text-neon-pink animate-pulse" />
                      <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">AI Global Sentiment</h3>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Calculated Real-time</span>
              </div>
              <div className="flex items-end gap-3 mb-2">
                  <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{activeMood.label}</h2>
                  <span className="text-sm font-bold text-neon-purple mb-1.5">{activeMood.percentage}%</span>
              </div>
              <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden flex">
                  {MOCK_MOODS.map((mood, i) => (
                      <div key={i} className={`h-full ${mood.color}`} style={{ width: `${mood.percentage}%` }} />
                  ))}
              </div>
              <p className="text-[9px] text-gray-500 font-bold uppercase mt-3 leading-relaxed tracking-wider">Fans are currently reeling from the cliffhanger in "Midnight Revenge". Engagement is spiking in Thriller categories.</p>
          </div>
      </div>
  );

  const WatchPartyList = () => (
      <div className="mb-10 px-4">
          <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Users size={14} className="text-neon-purple" /> Live Watch Parties
              </h3>
              <button className="text-[9px] font-black text-neon-purple uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {[1, 2, 3].map(i => (
                  <div key={i} className="min-w-[140px] relative group cursor-pointer">
                      <div className="aspect-square rounded-[32px] overflow-hidden border border-white/10 relative">
                          <img src={`https://picsum.photos/seed/${i + 20}/300/300`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                          <div className="absolute top-2 left-2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-tighter">
                              <span className="w-1 h-1 bg-white rounded-full animate-ping" /> Live
                          </div>
                          <div className="absolute bottom-2 left-2 right-2 flex justify-center">
                              <div className="flex -space-x-2">
                                  {[1,2,3].map(j => <div key={j} className="w-5 h-5 rounded-full border-2 border-black bg-gray-700" />)}
                              </div>
                          </div>
                      </div>
                      <h4 className="text-[10px] font-bold text-white mt-2 text-center uppercase tracking-widest truncate px-2">Series Premiere {i}</h4>
                  </div>
              ))}
          </div>
      </div>
  );

  // Fixed: Explicitly typed as React.FC to handle key prop correctly in map
  const PostWithPoll: React.FC<{ post: SocialPost }> = ({ post }) => (
      <div className="bg-gray-900/40 border border-white/5 rounded-[40px] overflow-hidden mb-6 group">
          <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="relative">
                      <img src={post.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                  </div>
                  <div>
                      <h4 className="font-bold text-white text-sm">@{post.username}</h4>
                      <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{post.timestamp}</p>
                  </div>
              </div>
              <button className="p-2 text-gray-600 hover:text-white transition-colors"><MoreHorizontal size={20}/></button>
          </div>
          <div className="px-6 pb-6">
              {post.imageUrl && (
                  <div className="relative rounded-[24px] overflow-hidden mb-5">
                      <img src={post.imageUrl} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
              )}
              <p className="text-sm text-gray-300 leading-relaxed mb-6 font-medium">{post.content}</p>
              
              {/* Plot Poll UI */}
              <div className="bg-white/5 rounded-[32px] p-6 border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                      <Vote size={16} className="text-neon-purple" />
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Influence the Story</h4>
                  </div>
                  <p className="text-xs text-gray-400 mb-4 font-bold">What should happen in Episode 4?</p>
                  {['Accept the Ransom', 'Secretly Call the Police'].map((opt, i) => (
                      <button key={i} className="w-full relative py-4 px-6 rounded-2xl border border-white/10 text-left text-xs font-bold text-white group/opt hover:bg-white/5 transition-all active:scale-95">
                          <div className="absolute left-0 top-0 bottom-0 bg-neon-purple/20 w-[45%] rounded-l-2xl" />
                          <div className="relative z-10 flex justify-between">
                              <span className="uppercase tracking-widest">{opt}</span>
                              <span className="text-neon-purple font-black">{i === 0 ? '45%' : '55%'}</span>
                          </div>
                      </button>
                  ))}
                  <p className="text-[9px] text-gray-600 text-center font-bold uppercase tracking-widest mt-2">1.2k Fans Voted • 2h Remaining</p>
              </div>
          </div>
          <div className="px-6 pb-6 flex items-center gap-6 border-t border-white/5 pt-4">
              <button className="flex items-center gap-2 text-gray-400 hover:text-neon-pink transition-colors"><Heart size={18} /><span className="text-xs font-bold">1.4k</span></button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"><MessageSquare size={18} /><span className="text-xs font-bold">230</span></button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors ml-auto"><Send size={18} /></button>
          </div>
      </div>
  );

  return (
    <div className="h-full flex flex-col bg-black md:pt-6 pb-20 max-w-7xl mx-auto w-full overflow-hidden">
      
      <div className="flex items-center justify-between gap-8 px-4 md:px-8 mb-8 shrink-0">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                <ChevronLeft size={28} />
            </button>
            <div className="flex items-center gap-8">
                <button onClick={() => setActiveTab('feed')} className={`text-2xl font-black transition-all ${activeTab === 'feed' ? 'text-white border-b-4 border-neon-purple pb-1' : 'text-gray-600 hover:text-gray-400'}`}>Discover</button>
                <button onClick={() => setActiveTab('theories')} className={`text-2xl font-black transition-all ${activeTab === 'theories' ? 'text-white border-b-4 border-indigo-500 pb-1' : 'text-gray-600 hover:text-gray-400'}`}>Theories</button>
                <button onClick={() => setActiveTab('inbox')} className={`text-2xl font-black transition-all ${activeTab === 'inbox' ? 'text-white border-b-4 border-neon-purple pb-1' : 'text-gray-600 hover:text-gray-400'}`}>Inbox</button>
            </div>
        </div>
        <button onClick={handleManualRefresh} className={`text-gray-400 hover:text-white transition-all p-2 bg-gray-900 rounded-full border border-gray-800 ${isRefreshing ? 'animate-spin' : ''}`}>
            <RotateCcw size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
          {activeTab === 'feed' && (
              <>
                  <MoodAnalyzer />
                  <WatchPartyList />
                  <div className="px-4 md:px-8 pb-10">
                      {posts.map(post => <PostWithPoll key={post.id} post={post} />)}
                  </div>
              </>
          )}
          
          {activeTab === 'theories' && (
               <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-10 space-y-6 no-scrollbar animate-fade-in">
                   <div className="bg-indigo-600/10 p-8 rounded-[40px] border border-indigo-500/20 mb-10 flex items-center justify-between relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tighter">Theory Hub</h2>
                            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">Connect the dots. Unmask the truth.</p>
                        </div>
                        <button className="p-5 bg-indigo-500 text-white rounded-[24px] shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-transform active:scale-95 relative z-10"><PenSquare size={28} /></button>
                    </div>
                    {/* Theory content would go here */}
               </div>
          )}

          {activeTab === 'inbox' && (
               <div className="flex-1 flex flex-col items-center justify-center p-10 h-full">
                   <div className="w-20 h-20 bg-gray-900 rounded-[24px] flex items-center justify-center mb-6 border border-white/5">
                        <MessageSquare size={32} className="text-gray-700" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">No Active Chats</h3>
                   <p className="text-sm text-gray-500 text-center max-w-xs uppercase font-bold tracking-widest text-[10px]">Your conversations with creators and AI characters will appear here.</p>
               </div>
          )}
      </div>
    </div>
  );
};