
import React, { useState, useEffect, useRef } from 'react';
import { Story, SocialPost, User, Comment, CommunityMood, Conversation, Message } from '../types';
import { api } from '../services/api';
import { Heart, MessageSquare, Send, Plus, MoreHorizontal, X, RotateCcw, Sparkles, Radio, Vote, Users, Camera, FileVideo, ShieldCheck, ChevronLeft, PenSquare, Flame, Laugh, Smile, Frown, Reply, Image as ImageIcon, Search } from 'lucide-react';
import { StoryPlayer } from './StoryPlayer';
import { StoryCreator } from './StoryCreator';

const MOCK_MOODS: CommunityMood[] = [
    { label: 'Suspense', percentage: 72, color: 'bg-neon-purple' },
    { label: 'Romance', percentage: 18, color: 'bg-neon-pink' },
    { label: 'Shock', percentage: 10, color: 'bg-yellow-500' },
];

const REACTION_TYPES = [
  { icon: Heart, color: 'text-neon-pink', label: 'Like' },
  { icon: Flame, color: 'text-orange-500', label: 'Fire' },
  { icon: Laugh, color: 'text-yellow-400', label: 'Haha' },
  { icon: Sparkles, color: 'text-blue-400', label: 'Wow' },
  { icon: Frown, color: 'text-gray-400', label: 'Sad' },
];

export const SocialView: React.FC<{ 
  currentUser: User, 
  stories: Story[], 
  posts: SocialPost[], 
  onDeletePost: (id: string) => void, 
  onDeleteStory: (id: string) => void, 
  onRefresh?: () => void, 
  onBack: () => void,
  onChatStateChange?: (isActive: boolean) => void,
  initialPartner?: Conversation | null,
  onClearTarget?: () => void
}> = ({ currentUser, stories: initialStories, posts: initialPosts, onDeletePost, onDeleteStory, onRefresh, onBack, onChatStateChange, initialPartner, onClearTarget }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'inbox'>(initialPartner ? 'inbox' : 'feed');
  const [posts, setPosts] = useState<SocialPost[]>(initialPosts);
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeMood, setActiveMood] = useState<CommunityMood>(MOCK_MOODS[0]);
  
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedPostForComments, setSelectedPostForComments] = useState<SocialPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Inbox State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(initialPartner || null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPartner) {
        setActiveTab('inbox');
        setSelectedConversation(initialPartner);
        onChatStateChange?.(true);
    }
  }, [initialPartner]);

  useEffect(() => {
    loadStories();
    if (selectedPostForComments) {
      loadComments(selectedPostForComments.id);
    }
    if (activeTab === 'inbox' && !selectedConversation) {
      loadConversations();
    }
  }, [selectedPostForComments, activeTab, selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadStories = async () => {
    try {
      const data = await api.getStories();
      if (data.length > 0) setStories(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const data = await api.getConversations(currentUser.id);
      setConversations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedConversation) return;
    try {
      const data = await api.getMessages(currentUser.id, selectedConversation.partnerId);
      setChatMessages(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedConversation || isSendingMessage) return;
    setIsSendingMessage(true);
    try {
      await api.sendMessage(currentUser.id, selectedConversation.partnerId, chatInput);
      setChatInput('');
      await loadMessages();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const loadComments = async (postId: string) => {
    setIsLoadingComments(true);
    try {
      const data = await api.getComments(postId);
      setComments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !selectedPostForComments) return;
    setIsSubmittingComment(true);
    try {
      await api.postComment(currentUser.id, selectedPostForComments.id, newComment, replyTo?.id);
      setNewComment('');
      setReplyTo(null);
      await loadComments(selectedPostForComments.id);
      setPosts(prev => prev.map(p => 
        p.id === selectedPostForComments.id ? { ...p, comments: p.comments + 1 } : p
      ));
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ));
      await api.likePost(postId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualRefresh = async () => {
      if (isRefreshing) return;
      setIsRefreshing(true);
      if (onRefresh) await onRefresh();
      try {
        const latestPosts = await api.getSocialPosts();
        if (latestPosts.length > 0) setPosts(latestPosts);
        await loadStories();
        if (activeTab === 'inbox') await loadConversations();
      } catch (e) {
        console.error(e);
      }
      setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostSubmit = async () => {
    if (!postContent.trim() && !selectedFile) return;
    setIsUploading(true);
    try {
      const newPost = await api.createSocialPost(currentUser.id, postContent, selectedFile || undefined);
      setPosts([newPost, ...posts]);
      setIsCreatingPost(false);
      setPostContent('');
      setSelectedFile(null);
      setFilePreview(null);
    } catch (e) {
      console.error(e);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const StoriesTray = () => (
    <div className="px-4 mb-4 overflow-x-auto no-scrollbar flex items-center gap-3">
      <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => setIsCreatingStory(true)}>
        <div className="w-14 h-14 rounded-full bg-gray-900 border-2 border-dashed border-gray-700 flex items-center justify-center relative hover:border-neon-purple transition-all">
          <img src={currentUser.avatarUrl} className="w-12 h-12 rounded-full object-cover opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Plus size={20} className="text-white" />
          </div>
        </div>
        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Post</span>
      </div>
      
      {stories.map((story, i) => (
        <div 
          key={story.id} 
          className="flex flex-col items-center gap-1 cursor-pointer shrink-0" 
          onClick={() => setSelectedStoryIndex(i)}
        >
          <div className={`w-14 h-14 rounded-full p-0.5 border-2 ${story.isViewed ? 'border-gray-800' : 'border-neon-purple'} active:scale-95 transition-all`}>
            <img src={story.avatarUrl} className="w-full h-full rounded-full object-cover border border-black" />
          </div>
          <span className="text-[8px] font-black text-white uppercase tracking-widest truncate w-14 text-center">{story.username}</span>
        </div>
      ))}
    </div>
  );

  const MoodAnalyzer = () => (
      <div className="px-4 mb-4">
          <div className="bg-gray-900/40 border border-white/5 rounded-[24px] p-4 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
                  <Sparkles size={36} className="text-neon-purple" />
              </div>
              <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                      <Radio size={12} className="text-neon-pink animate-pulse" />
                      <h3 className="text-[8px] font-black text-white uppercase tracking-[0.4em]">Global Vibe</h3>
                  </div>
                  <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Live</span>
              </div>
              <div className="flex items-end gap-1.5 mb-2">
                  <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">{activeMood.label}</h2>
                  <span className="text-[10px] font-bold text-neon-purple mb-0.5">{activeMood.percentage}%</span>
              </div>
              <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden flex">
                  {MOCK_MOODS.map((mood, i) => (
                      <div key={i} className={`h-full ${mood.color}`} style={{ width: `${mood.percentage}%` }} />
                  ))}
              </div>
          </div>
      </div>
  );

  const PostItem: React.FC<{ post: SocialPost }> = ({ post }) => {
    const [showReactions, setShowReactions] = useState(false);
    return (
      <div className="bg-gray-900/40 border border-white/5 rounded-[28px] overflow-hidden mb-4 group relative">
          <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                  <div className="relative">
                      <img src={post.avatarUrl} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-black" />
                  </div>
                  <div>
                      <h4 className="font-bold text-white text-xs">@{post.username}</h4>
                      <p className="text-[7px] text-gray-500 uppercase font-black tracking-widest">{post.timestamp}</p>
                  </div>
              </div>
              <button className="p-1.5 text-gray-600 hover:text-white transition-colors"><MoreHorizontal size={16}/></button>
          </div>
          <div className="px-4 pb-4">
              {(post.mediaUrl || post.imageUrl) && (
                  <div className="relative rounded-[16px] overflow-hidden mb-3 border border-white/5">
                      {post.mediaType === 'video' ? (
                        <video src={post.mediaUrl || ''} className="w-full max-h-[400px] object-cover" controls playsInline />
                      ) : (
                        <img src={post.mediaUrl || post.imageUrl || ''} className="w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      )}
                  </div>
              )}
              <p className="text-xs text-gray-300 leading-relaxed font-medium">{post.content}</p>
          </div>
          <div className="px-4 pb-4 flex items-center gap-6 border-t border-white/5 pt-2.5 relative">
              <div className="relative">
                {showReactions && (
                  <div 
                    className="absolute bottom-full left-0 mb-2 bg-gray-800/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-full flex gap-2 shadow-2xl animate-fade-in z-50"
                    onMouseLeave={() => setShowReactions(false)}
                  >
                    {REACTION_TYPES.map(rt => (
                      <button 
                        key={rt.label}
                        onClick={() => { handleLikePost(post.id); setShowReactions(false); }}
                        className={`p-1 hover:scale-125 transition-transform ${rt.color}`}
                      >
                        <rt.icon size={18} fill="currentColor" className="opacity-80" />
                      </button>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => handleLikePost(post.id)}
                  onContextMenu={(e) => { e.preventDefault(); setShowReactions(true); }}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-neon-pink transition-colors active:scale-125"
                >
                  <Heart size={14} />
                  <span className="text-[9px] font-bold">{post.likes}</span>
                </button>
              </div>

              <button 
                onClick={() => setSelectedPostForComments(post)}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
              >
                <MessageSquare size={14} />
                <span className="text-[9px] font-bold">{post.comments}</span>
              </button>
              <button className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors ml-auto"><Send size={14} /></button>
          </div>
      </div>
    );
  };

  const InboxView = () => (
    <div className="flex-1 flex flex-col animate-fade-in overflow-hidden">
      <div className="px-4 mb-6 shrink-0">
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-white/5">
          <Search className="absolute left-4 top-3 text-gray-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            className="w-full bg-transparent py-2.5 pl-11 pr-4 text-xs text-white focus:outline-none placeholder-gray-600 font-bold"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-2 pb-24">
        {isLoadingConversations ? (
          <div className="flex justify-center py-20"><RotateCcw size={24} className="text-neon-purple animate-spin" /></div>
        ) : conversations.length > 0 ? (
          conversations.map(conv => (
            <button 
              key={conv.partnerId} 
              onClick={() => { setSelectedConversation(conv); onChatStateChange?.(true); }}
              className="w-full bg-gray-900/40 hover:bg-gray-800 transition-colors p-4 rounded-3xl border border-white/5 flex items-center gap-4 group active:scale-[0.98]"
            >
              <div className="relative shrink-0">
                <img src={conv.avatarUrl} className="w-12 h-12 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition-transform" />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-black text-white text-sm truncate uppercase tracking-tighter italic">@{conv.username}</h4>
                  <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">{new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-white font-bold' : 'text-gray-500 font-medium'}`}>{conv.lastMessage}</p>
              </div>
              {conv.unreadCount > 0 && (
                <div className="bg-neon-pink w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-lg shadow-neon-pink/30">{conv.unreadCount}</div>
              )}
            </button>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center opacity-30 text-center">
            <MessageSquare size={48} className="mb-4 text-gray-600" />
            <p className="text-[10px] font-black uppercase tracking-widest">No messages yet</p>
            <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">Start a conversation with creators</p>
          </div>
        )}
      </div>
    </div>
  );

  const ChatUI = () => (
    <div className="fixed inset-0 z-[120] bg-black flex flex-col animate-fade-in">
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-neon-purple/10 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-xl z-10 pt-12">
        <div className="flex items-center gap-3">
          <button onClick={() => { setSelectedConversation(null); onChatStateChange?.(false); onClearTarget?.(); }} className="text-gray-400 hover:text-white p-2">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <img src={selectedConversation?.avatarUrl} className="w-10 h-10 rounded-2xl border border-white/10 object-cover" />
            <div>
              <h3 className="font-black text-white text-sm uppercase tracking-tighter italic">@{selectedConversation?.username}</h3>
              <p className="text-[9px] text-green-500 font-black uppercase tracking-widest mt-1 animate-pulse">Online</p>
            </div>
          </div>
        </div>
        <button className="p-2 text-gray-500"><MoreHorizontal size={20} /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-32">
        {chatMessages.map(m => {
          const isMe = m.senderId === currentUser.id;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[80%] px-5 py-3 rounded-[24px] text-xs font-medium shadow-2xl relative ${isMe ? 'bg-gradient-to-r from-neon-purple to-neon-pink text-white rounded-br-none' : 'bg-gray-900 text-gray-300 rounded-bl-none border border-white/5'}`}>
                {m.content}
                <p className="text-[7px] opacity-40 mt-1 font-black uppercase text-right">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-black/80 backdrop-blur-xl border-t border-white/5 z-10 pb-12">
        <div className="flex gap-2 bg-gray-900 rounded-2xl p-1.5 border border-white/5">
          <button className="p-3 text-gray-500"><Plus size={18}/></button>
          <input 
            type="text" 
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your reply..."
            className="flex-1 bg-transparent px-2 text-xs text-white focus:outline-none font-bold"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!chatInput.trim() || isSendingMessage}
            className="bg-neon-purple text-white p-2.5 rounded-xl active:scale-95 disabled:opacity-20 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-black md:pt-6 max-w-7xl mx-auto w-full relative min-h-0 overflow-hidden">
      
      {selectedStoryIndex !== null && (
        <StoryPlayer 
          stories={stories} 
          initialStoryIndex={selectedStoryIndex} 
          onClose={() => setSelectedStoryIndex(null)} 
          currentUser={currentUser}
        />
      )}
      
      {isCreatingStory && (
        <StoryCreator 
          currentUser={currentUser} 
          onClose={() => setIsCreatingStory(false)} 
          onStoryPublished={loadStories}
        />
      )}

      {selectedConversation && <ChatUI />}

      {selectedPostForComments && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex flex-col animate-fade-in">
           <div className="p-4 flex justify-between items-center border-b border-white/10 shrink-0 pt-12">
            <button onClick={() => { setSelectedPostForComments(null); setReplyTo(null); }} className="text-gray-400 hover:text-white flex items-center gap-1.5">
              <ChevronLeft size={20} /> <span className="font-black uppercase text-[9px] tracking-widest">Back</span>
            </button>
            <h2 className="text-lg font-black italic tracking-tighter uppercase text-white">Discussion</h2>
            <div className="w-10"></div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-32">
              <div className="flex gap-3 mb-6 pb-6 border-b border-white/5">
                <img src={selectedPostForComments.avatarUrl} className="w-10 h-10 rounded-full border border-white/10" />
                <div>
                   <h3 className="font-bold text-white text-sm">@{selectedPostForComments.username}</h3>
                   <p className="text-xs text-gray-400 mt-1">{selectedPostForComments.content}</p>
                </div>
              </div>

              <div className="space-y-5">
                {isLoadingComments ? (
                  <div className="flex justify-center py-20"><RotateCcw size={24} className="text-neon-purple animate-spin" /></div>
                ) : (
                   comments.length > 0 ? comments.map(c => (
                     <div key={c.id} className="flex gap-3 animate-fade-in">
                        <img src={c.avatarUrl} className="w-7 h-7 rounded-full border border-white/10 shrink-0" />
                        <div className="flex-1">
                          <div className="bg-gray-900/50 rounded-2xl p-3 border border-white/5">
                            <span className="font-bold text-white text-[10px]">@{c.username}</span>
                            <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{c.text}</p>
                          </div>
                        </div>
                     </div>
                   )) : (
                     <div className="text-center py-20 text-gray-600 font-bold uppercase text-[9px] tracking-widest">Share your thoughts</div>
                   )
                )}
              </div>
          </div>

          <div className="p-4 bg-black border-t border-white/10 pb-10">
              <div className="flex gap-2 bg-gray-900 rounded-[20px] p-1.5 border border-white/10">
                <input 
                  ref={commentInputRef}
                  type="text" 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="flex-1 bg-transparent px-3 text-[11px] text-white focus:outline-none"
                />
                <button 
                  onClick={handlePostComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="bg-neon-purple text-white p-2 rounded-full active:scale-95 disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </div>
          </div>
        </div>
      )}

      {/* Main Social Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/5 bg-black/80 backdrop-blur-md z-50 sticky top-0 shrink-0">
        <div className="flex items-center gap-2">
            <button onClick={onBack} className="md:hidden text-gray-400 hover:text-white transition-colors">
              <ChevronLeft size={20}/>
            </button>
            <h1 className="text-lg font-black italic tracking-tighter text-white uppercase">Community</h1>
        </div>
        <div className="flex bg-gray-900/80 p-0.5 rounded-full border border-white/5">
            {['feed', 'inbox'].map(t => (
                <button 
                    key={t}
                    onClick={() => setActiveTab(t as any)}
                    className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-white text-black' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    {t}
                </button>
            ))}
        </div>
        <button 
          onClick={() => setIsCreatingPost(true)}
          className="p-1.5 bg-neon-purple rounded-full text-white shadow-lg active:scale-90 transition-all"
        >
          <PenSquare size={16} />
        </button>
      </div>

      <div 
        className="flex-1 overflow-y-auto no-scrollbar scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
          {/* Refresh Animation */}
          <div className={`flex justify-center transition-all duration-300 overflow-hidden ${isRefreshing ? 'h-14' : 'h-0'}`}>
              <div className="flex items-center gap-2 text-neon-purple">
                  <RotateCcw size={14} className="animate-spin" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Syncing</span>
              </div>
          </div>

          <div className="py-4 h-full flex flex-col">
              {activeTab === 'feed' ? (
                <>
                  <StoriesTray />
                  <MoodAnalyzer />

                  <div className="px-4 pb-24">
                      <div className="flex items-center justify-between mb-4 px-1">
                          <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em]">Trending</h3>
                          <button onClick={handleManualRefresh} className="text-neon-purple active:rotate-180 transition-transform duration-500"><RotateCcw size={12}/></button>
                      </div>

                      <div className="space-y-4">
                          {posts.length > 0 ? posts.map(post => <PostItem key={post.id} post={post} />) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-20">
                              <RotateCcw size={32} className="animate-spin-slow mb-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Loading</span>
                            </div>
                          )}
                      </div>
                  </div>
                </>
              ) : (
                <InboxView />
              )}
          </div>
      </div>

      {/* Create Post Modal */}
      {isCreatingPost && (
        <div className="fixed inset-0 z-[130] bg-black/95 backdrop-blur-2xl flex flex-col p-6 animate-fade-in">
           <div className="flex justify-between items-center mb-10 pt-12">
              <button onClick={() => { setIsCreatingPost(false); setFilePreview(null); setSelectedFile(null); }} className="text-gray-400 hover:text-white flex items-center gap-2">
                <X size={28} /> <span className="font-black uppercase text-[10px] tracking-widest">Cancel</span>
              </button>
              <button 
                onClick={handlePostSubmit}
                disabled={(!postContent.trim() && !selectedFile) || isUploading}
                className="bg-neon-purple text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl disabled:opacity-20 active:scale-95 transition-all"
              >
                {isUploading ? '...' : 'Post'}
              </button>
           </div>

           <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="flex gap-4 mb-8">
                <img src={currentUser.avatarUrl} className="w-10 h-10 rounded-full border border-white/10" />
                <textarea 
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  placeholder="Tell the community..."
                  className="flex-1 bg-transparent border-none text-lg text-white focus:outline-none resize-none placeholder-gray-700 min-h-[120px]"
                  autoFocus
                />
              </div>

              {filePreview && (
                <div className="relative rounded-[24px] overflow-hidden border border-white/10 mb-8 max-h-[300px]">
                   {selectedFile?.type.startsWith('video/') ? (
                     <video src={filePreview} className="w-full object-cover" controls />
                   ) : (
                     <img src={filePreview} className="w-full object-cover" />
                   )}
                   <button 
                    onClick={() => { setFilePreview(null); setSelectedFile(null); }}
                    className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-white"
                   >
                     <X size={14}/>
                   </button>
                </div>
              )}
           </div>

           <div className="flex gap-3 p-4 border-t border-white/5 pb-10">
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-gray-900 border border-white/5 py-3 rounded-xl flex items-center justify-center gap-2 text-gray-400">
                <ImageIcon size={16} className="text-neon-pink" /> 
                <span className="text-[9px] font-black uppercase tracking-widest">Media</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,video/*" />
           </div>
        </div>
      )}
    </div>
  );
};
