
import React, { useState, useEffect, useRef } from 'react';
import { Story, SocialPost, User, Comment, Conversation, Message } from '../types';
import { api } from '../services/api';
import { Heart, MessageSquare, Send, Plus, Search, MoreHorizontal, Video as VideoIcon, X, Play, Pause, Trash2, ExternalLink, Image as ImageIcon, Reply, Eye, ArrowLeft, PenSquare, Edit2, Save, Flag, AlertTriangle, ChevronLeft, RotateCcw, Sparkles, Split } from 'lucide-react';

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
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
  const [posts, setPosts] = useState<SocialPost[]>(initialPosts);
  const [activeChatPartner, setActiveChatPartner] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setPosts(initialPosts); }, [initialPosts]);
  useEffect(() => { if(activeTab === 'inbox') api.getConversations(currentUser.id).then(setConversations); }, [activeTab, currentUser.id]);
  useEffect(() => { if(activeChatPartner) api.getMessages(currentUser.id, activeChatPartner.id).then(setMessages); }, [activeChatPartner, currentUser.id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleManualRefresh = async () => {
      if (isRefreshing || !onRefresh) return;
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 800);
  };

  // Fixed typing for internal TheoryCard component
  const TheoryCard: React.FC<{ post: SocialPost }> = ({ post }) => (
      <div className="bg-gradient-to-br from-indigo-900/20 to-black border border-indigo-500/30 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
              <Split className="text-indigo-400" size={48} />
          </div>
          <div className="flex items-center gap-3 mb-4">
              <img src={post.avatarUrl} className="w-8 h-8 rounded-full border border-indigo-500/50" />
              <div>
                  <h4 className="font-bold text-sm text-white">@{post.username}</h4>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Theory Master</p>
              </div>
          </div>
          <h3 className="text-lg font-black text-white mb-2 leading-tight">"Is the CEO actually a cyborg?"</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">{post.content}</p>
          <div className="flex items-center gap-6 border-t border-indigo-500/20 pt-4">
              <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                      {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-gray-800" />)}
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">+12 joined the hunt</span>
              </div>
              <button className="ml-auto bg-indigo-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest hover:scale-105 transition-transform">Investigate</button>
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

      {activeTab === 'feed' ? (
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-10 no-scrollbar">
            <div className="flex gap-4 py-2 overflow-x-auto no-scrollbar mb-8">
                <div className="flex flex-col items-center gap-2 min-w-[80px]">
                    <div className="w-[72px] h-[72px] rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center bg-gray-900 cursor-pointer">
                        <Plus className="text-gray-500" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">My Story</span>
                </div>
                {stories.map((story, index) => (
                    <div key={story.id} className="flex flex-col items-center gap-2 min-w-[80px]">
                        <div className={`w-[72px] h-[72px] rounded-full p-[2px] ${story.isViewed ? 'bg-gray-800' : 'bg-gradient-to-tr from-neon-purple to-neon-pink'}`}>
                            <img src={story.avatarUrl} className="w-full h-full rounded-full border-2 border-black object-cover" />
                        </div>
                        <span className="text-[10px] text-white font-bold uppercase truncate w-16 text-center">{story.username}</span>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {posts.map(post => (
                    <div key={post.id} className="bg-gray-900/40 border border-white/5 rounded-[32px] overflow-hidden">
                        <div className="p-4 flex items-center gap-3">
                            <img src={post.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <h4 className="font-bold text-white text-sm">@{post.username}</h4>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">{post.timestamp}</p>
                            </div>
                        </div>
                        <div className="px-4 pb-4">
                            {post.imageUrl && <img src={post.imageUrl} className="w-full h-64 object-cover rounded-2xl mb-4" />}
                            <p className="text-sm text-gray-300 leading-relaxed">{post.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      ) : activeTab === 'theories' ? (
          <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-10 space-y-6 no-scrollbar">
              <div className="bg-indigo-600/10 p-6 rounded-3xl border border-indigo-500/20 mb-8 flex items-center justify-between">
                  <div>
                      <h2 className="text-xl font-black text-white mb-1 uppercase tracking-tighter">Theory Hub</h2>
                      <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Connect the dots. Unmask the truth.</p>
                  </div>
                  <button className="p-4 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform"><PenSquare size={24} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.slice(0, 4).map(post => <TheoryCard key={post.id} post={post} />)}
              </div>
          </div>
      ) : (
          <div className="flex-1 flex overflow-hidden px-4 md:px-8 pb-10 gap-6">
              {/* Inbox logic remains same as before */}
              <div className="flex-1 flex items-center justify-center bg-gray-900/20 rounded-3xl border border-white/5">
                  <div className="text-center"><MessageSquare size={64} className="mx-auto text-gray-800 mb-4" /><h3 className="text-xl font-bold text-gray-600">Select a message to start chatting</h3></div>
              </div>
          </div>
      )}
    </div>
  );
};
