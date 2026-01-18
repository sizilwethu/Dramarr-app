
import React, { useState, useEffect, useRef } from 'react';
import { Story, SocialPost, User, Comment, Conversation, Message } from '../types';
import { api } from '../services/api';
import { Heart, MessageSquare, Send, Plus, Search, MoreHorizontal, Video as VideoIcon, X, Play, Pause, Trash2, ExternalLink, Image as ImageIcon, Reply, Eye, ArrowLeft, PenSquare, Edit2, Save, Flag, AlertTriangle } from 'lucide-react';

const StoryViewer = ({ stories, startIndex, onClose, currentUserId, onDelete }: { stories: Story[], startIndex: number, onClose: () => void, currentUserId: string, onDelete: (id: string) => void }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const story = stories[currentIndex];
  const hasIncrementedView = useRef(false);

  useEffect(() => {
      if (story && !story.isAd && !hasIncrementedView.current) {
          api.incrementStoryView(story.id);
          setViewCount((story.views || 0) + 1);
          hasIncrementedView.current = true;
      }
  }, [story]);

  useEffect(() => {
    setProgress(0);
    hasIncrementedView.current = false;
    if(stories[currentIndex]) setViewCount(stories[currentIndex].views || 0);
  }, [currentIndex, stories]);

  useEffect(() => {
    if (isPaused || !story) return; 
    const interval = 50;
    const duration = 5000; 
    const step = (interval / duration) * 100;
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          if (currentIndex < stories.length - 1) { setCurrentIndex(i => i + 1); return 0; }
          else { onClose(); return 100; }
        }
        return p + step;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [currentIndex, isPaused, stories.length, onClose, story]);

  if(!story) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-fade-in">
      <div className="relative w-full max-w-md h-[90vh] flex flex-col bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          <div className="flex gap-1 p-2 pt-4 z-20 absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent">
            {stories.map((s, i) => (
              <div key={s.id} className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%' }} />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between px-4 py-2 mt-6 z-20">
            <div className="flex items-center gap-2">
                <img src={story.avatarUrl} className="w-9 h-9 rounded-full border border-white/20 object-cover" />
                <div>
                    <p className="text-white font-bold text-sm flex items-center gap-2">
                        {story.username} 
                        {story.isAd && <span className="bg-yellow-400 text-black text-[10px] px-1 rounded font-bold">Ad</span>}
                    </p>
                    <p className="text-gray-300 text-[10px] flex items-center gap-1">
                        {Math.floor((Date.now() - story.timestamp) / 3600000)}h ago • <Eye size={10}/> {viewCount}
                    </p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/80 hover:text-white"><X size={28} /></button>
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
             {story.type === 'video' ? <video src={story.mediaUrl} className="w-full h-full object-cover" autoPlay muted loop /> : <img src={story.mediaUrl} className="w-full h-full object-cover" />}
          </div>
      </div>
    </div>
  );
};

export const SocialView: React.FC<{ currentUser: User, stories: Story[], posts: SocialPost[], onDeletePost: (id: string) => void, onDeleteStory: (id: string) => void, onRefresh?: () => void }> = ({ currentUser, stories, posts: initialPosts, onDeletePost, onDeleteStory, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'inbox'>('feed');
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
  const [posts, setPosts] = useState<SocialPost[]>(initialPosts);
  const [activeChatPartner, setActiveChatPartner] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setPosts(initialPosts); }, [initialPosts]);
  useEffect(() => { if(activeTab === 'inbox') api.getConversations(currentUser.id).then(setConversations); }, [activeTab, currentUser.id]);
  useEffect(() => { if(activeChatPartner) api.getMessages(currentUser.id, activeChatPartner.id).then(setMessages); }, [activeChatPartner, currentUser.id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendMessage = async () => {
      if(!activeChatPartner || !chatInput.trim()) return;
      try {
          await api.sendMessage(currentUser.id, activeChatPartner.id, chatInput);
          setChatInput('');
          setMessages([...messages, { id: Date.now().toString(), senderId: currentUser.id, receiverId: activeChatPartner.id, content: chatInput, timestamp: Date.now(), isRead: false }]);
      } catch(e) { console.error(e); }
  };

  return (
    <div className="h-full flex flex-col bg-black md:pt-6 pb-20 max-w-7xl mx-auto w-full overflow-hidden">
      {viewingStoryIndex !== null && <StoryViewer stories={stories} startIndex={viewingStoryIndex} onClose={() => setViewingStoryIndex(null)} currentUserId={currentUser.id} onDelete={onDeleteStory} />}

      <div className="flex items-center justify-start gap-8 px-8 mb-8 z-10 relative shrink-0">
        <button onClick={() => setActiveTab('feed')} className={`text-2xl font-bold transition-all ${activeTab === 'feed' ? 'text-white border-b-4 border-neon-purple pb-1' : 'text-gray-600 hover:text-gray-400'}`}>Discover</button>
        <button onClick={() => setActiveTab('inbox')} className={`text-2xl font-bold transition-all ${activeTab === 'inbox' ? 'text-white border-b-4 border-neon-purple pb-1' : 'text-gray-600 hover:text-gray-400'}`}>Inbox</button>
      </div>

      {activeTab === 'feed' ? (
        <div className="flex-1 flex flex-col md:flex-row gap-8 px-8 overflow-hidden">
          <div className="flex-1 overflow-y-auto pb-10">
              <div className="flex gap-4 py-2 overflow-x-auto no-scrollbar mb-8">
                <div className="flex flex-col items-center gap-2 min-w-[80px]">
                    <div className="w-[72px] h-[72px] rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center bg-gray-900 cursor-pointer hover:border-neon-purple">
                        <Plus className="text-gray-500" />
                    </div>
                    <span className="text-xs text-gray-500">My Story</span>
                </div>
                {stories.map((story, index) => (
                    <div key={story.id} className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group" onClick={() => setViewingStoryIndex(index)}>
                        <div className={`w-[72px] h-[72px] rounded-full p-[2px] transition-transform group-hover:scale-110 ${story.isViewed ? 'bg-gray-800' : 'bg-gradient-to-tr from-neon-purple to-neon-pink'}`}>
                            <img src={story.avatarUrl} className="w-full h-full rounded-full border-2 border-black object-cover" />
                        </div>
                        <span className="text-xs text-white truncate w-20 text-center">{story.username}</span>
                    </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {posts.map(post => (
                    <div key={post.id} className="bg-gray-900/40 border border-gray-800 rounded-3xl overflow-hidden hover:border-gray-700 transition-all">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src={post.avatarUrl} className="w-10 h-10 rounded-full object-cover shadow-lg" />
                                <div>
                                    <h4 className="font-bold text-sm text-white">{post.username}</h4>
                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{post.timestamp}</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 pb-4">
                            {post.imageUrl && <img src={post.imageUrl} className="w-full h-64 object-cover rounded-2xl mb-4 shadow-xl" />}
                            <p className="text-sm text-gray-300 leading-relaxed">{post.content}</p>
                        </div>
                        <div className="p-4 pt-0 flex gap-6">
                             <button className="flex items-center gap-2 text-gray-400 hover:text-neon-pink transition-colors"><Heart size={20} /><span className="text-xs font-bold">{post.likes}</span></button>
                             <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"><MessageSquare size={20} /><span className="text-xs font-bold">{post.comments}</span></button>
                        </div>
                    </div>
                ))}
              </div>
          </div>
          
          <div className="hidden xl:block w-80 shrink-0">
             <div className="bg-gray-900/40 rounded-3xl border border-gray-800 p-6">
                 <h3 className="text-lg font-bold text-white mb-6">Trending Topics</h3>
                 <div className="space-y-4">
                     {['#CEOSecrets', '#MidnightRevenge', '#DramaLovers', '#NewEpisodes'].map(tag => (
                         <div key={tag} className="flex justify-between items-center group cursor-pointer">
                             <span className="text-gray-400 font-medium group-hover:text-neon-purple transition-colors">{tag}</span>
                             <span className="text-[10px] bg-gray-800 px-2 py-1 rounded-md text-gray-500 font-bold">12.4k</span>
                         </div>
                     ))}
                 </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden px-8 pb-10 gap-6">
            <div className={`flex-1 md:flex-none md:w-80 flex flex-col bg-gray-900/40 rounded-3xl border border-gray-800 overflow-hidden ${activeChatPartner ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-800 shrink-0">
                    <h3 className="font-bold text-white">Recent Messages</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {conversations.map(c => (
                        <div key={c.partnerId} onClick={() => setActiveChatPartner({ id: c.partnerId, username: c.username, avatarUrl: c.avatarUrl } as any)} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${activeChatPartner?.id === c.partnerId ? 'bg-neon-purple/20 ring-1 ring-neon-purple/50' : 'hover:bg-gray-800'}`}>
                            <div className="relative"><img src={c.avatarUrl} className="w-12 h-12 rounded-full object-cover shadow-md" />{c.unreadCount > 0 && <div className="absolute -top-1 -right-1 bg-neon-pink text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">{c.unreadCount}</div>}</div>
                            <div className="flex-1 min-w-0"><h4 className="font-bold text-white text-sm truncate">{c.username}</h4><p className="text-xs text-gray-500 truncate">{c.lastMessage}</p></div>
                        </div>
                    ))}
                </div>
            </div>

            {activeChatPartner ? (
                <div className="flex-1 flex flex-col bg-gray-900/40 rounded-3xl border border-gray-800 overflow-hidden animate-fade-in">
                    <div className="flex items-center gap-3 p-4 border-b border-gray-800 shrink-0">
                         <button onClick={() => setActiveChatPartner(null)} className="md:hidden text-gray-400"><ArrowLeft/></button>
                         <img src={activeChatPartner.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                         <span className="font-bold text-white text-lg">{activeChatPartner.username}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                         {messages.map(m => {
                             const isMe = m.senderId === currentUser.id;
                             return (<div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[70%] px-6 py-3 rounded-2xl text-sm shadow-xl ${isMe ? 'bg-neon-purple text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>{m.content}</div></div>);
                         })}
                         <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 bg-black/40 border-t border-gray-800 flex gap-3 shrink-0">
                         <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Write something..." className="flex-1 bg-gray-800/80 rounded-2xl px-6 text-sm text-white focus:outline-none" />
                         <button onClick={handleSendMessage} className="p-3 bg-neon-pink rounded-2xl text-white shadow-lg shadow-neon-pink/20 hover:scale-105 transition-transform"><Send size={20}/></button>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center bg-gray-900/20 rounded-3xl border border-gray-800/50">
                    <div className="text-center"><MessageSquare size={64} className="mx-auto text-gray-800 mb-4" /><h3 className="text-xl font-bold text-gray-600">Select a message to start chatting</h3></div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};
