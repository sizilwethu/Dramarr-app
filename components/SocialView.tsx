
import React, { useState, useEffect, useRef } from 'react';
import { Story, SocialPost, User, Comment, Conversation, Message } from '../types';
import { api } from '../services/api';
import { Heart, MessageSquare, Send, Plus, MoreHorizontal, X, RotateCcw, Users, Camera, FileVideo, ShieldCheck, ChevronLeft, PenSquare, Flame, Laugh, Smile, Frown, Reply, Image as ImageIcon, Search, Share2, Flag, Link2, CornerDownRight, Timer, BellOff, Ban, CheckCheck, Mail, User as UserIcon, AlertCircle, Sparkles } from 'lucide-react';
import { StoryPlayer } from './StoryPlayer';
import { StoryCreator } from './StoryCreator';

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
  
  // Real Data State
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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

  // Feedback State
  const [postFeedback, setPostFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (initialPartner) {
        setActiveTab('inbox');
        setSelectedConversation(initialPartner);
        onChatStateChange?.(true);
    }
  }, [initialPartner]);

  useEffect(() => {
    loadPosts();
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

  const loadPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const data = await api.getSocialPosts();
      setPosts(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const loadStories = async () => {
    try {
      const data = await api.getStories();
      // Ensure we set data or empty array, no mock fallbacks
      setStories(data || []);
    } catch (e) {
      console.error(e);
      setStories([]);
    }
  };

  const handleStoryDelete = async (storyId: string) => {
      try {
          await api.deleteStory(storyId);
          setStories(prev => prev.filter(s => s.id !== storyId));
          onDeleteStory(storyId); // Propagate up if needed
          setSelectedStoryIndex(null); // Close player
      } catch (e) {
          console.error("Failed to delete story", e);
      }
  };

  const loadConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const data = await api.getConversations(currentUser.id);
      setConversations(data || []);
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
      setChatMessages(data || []);
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
      await api.postComment(currentUser.id, selectedPostForComments.id, newComment, 'post', replyTo?.id);
      setNewComment('');
      setReplyTo(null);
      await loadComments(selectedPostForComments.id);
      
      // Fetch authoritative stats
      const stats = await api.getPostStats(selectedPostForComments.id);
      
      setPosts(prev => prev.map(p => 
        p.id === selectedPostForComments.id ? { ...p, comments: stats.comments, likes: stats.likes } : p
      ));
      
      setSelectedPostForComments(prev => prev ? { ...prev, comments: stats.comments, likes: stats.likes } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await api.likePost(postId);
      const stats = await api.getPostStats(postId);
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, likes: stats.likes, comments: stats.comments } : p
      ));
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
        setPosts(latestPosts || []);
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
      setPosts(prev => [newPost, ...prev]);
      setIsCreatingPost(false);
      setPostContent('');
      setSelectedFile(null);
      setFilePreview(null);
      setPostFeedback({ type: 'success', message: 'Post published successfully!' });
      setTimeout(() => setPostFeedback(null), 3000);
    } catch (e) {
      console.error(e);
      setPostFeedback({ type: 'error', message: 'Failed to publish post. Please try again.' });
      setTimeout(() => setPostFeedback(null), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const StoriesTray = () => (
    <div className="px-4 mb-4 overflow-x-auto no-scrollbar flex items-center gap-3 min-h-[90px] py-2">
      <div className="flex flex-col items-center gap-1 group cursor-pointer shrink-0" onClick={() => setIsCreatingStory(true)}>
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

  const PostItem: React.FC<{ post: SocialPost; onPress: () => void }> = ({ post, onPress }) => {
    const [showReactions, setShowReactions] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [stats, setStats] = useState({ likes: post.likes, comments: post.comments });

    useEffect(() => {
        // Sync with props immediately for optimistic updates
        setStats({ likes: post.likes, comments: post.comments });
        
        // Fetch authoritative source to correct any staleness
        const fetchStats = async () => {
            const realStats = await api.getPostStats(post.id);
            setStats(realStats);
        };
        fetchStats();
    }, [post.id, post.likes, post.comments]);

    const handleShare = async () => {
        setShowMenu(false);
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Post by @${post.username}`,
                    text: post.content,
                    url: `https://dramarr.app/post/${post.id}`
                });
            } catch (e) {
                console.log('Share dismissed');
            }
        } else {
            handleCopyLink();
        }
    };

    const handleCopyLink = () => {
        setShowMenu(false);
        navigator.clipboard.writeText(`https://dramarr.app/post/${post.id}`);
        alert('Link copied to clipboard!');
    };

    const handleReport = () => {
        setShowMenu(false);
        alert('Thanks for reporting. We will review this post shortly.');
    };

    return (
      <div 
        onClick={onPress}
        className="bg-gray-900/40 border border-white/5 rounded-[28px] overflow-hidden mb-4 group relative active:bg-gray-800/60 transition-colors cursor-pointer"
      >
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
              
              <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    className="p-1.5 text-gray-600 hover:text-white transition-colors"
                  >
                    <MoreHorizontal size={16}/>
                  </button>
                  {showMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
                        <div className="absolute right-0 top-full mt-2 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-50 w-48 overflow-hidden animate-fade-in">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleShare(); }}
                                className="w-full text-left px-4 py-3.5 text-xs font-bold text-white hover:bg-white/5 flex items-center gap-3 transition-colors border-b border-white/5"
                            >
                                <Share2 size={14} className="text-blue-400" /> Share Post
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleCopyLink(); }}
                                className="w-full text-left px-4 py-3.5 text-xs font-bold text-white hover:bg-white/5 flex items-center gap-3 transition-colors border-b border-white/5"
                            >
                                <Link2 size={14} className="text-gray-400" /> Copy Link
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleReport(); }}
                                className="w-full text-left px-4 py-3.5 text-xs font-bold text-red-500 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                            >
                                <Flag size={14} /> Report
                            </button>
                        </div>
                      </>
                  )}
              </div>
          </div>
          <div className="px-4 pb-4">
              {(post.mediaUrl || post.imageUrl) && (
                  <div className="relative rounded-[16px] overflow-hidden mb-3 border border-white/5">
                      {post.mediaType === 'video' ? (
                        <video src={post.mediaUrl || ''} className="w-full max-h-[400px] object-cover" controls playsInline onClick={e => e.stopPropagation()} />
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
                    onClick={(e) => e.stopPropagation()}
                  >
                    {REACTION_TYPES.map(rt => (
                      <button 
                        key={rt.label}
                        onClick={(e) => { e.stopPropagation(); handleLikePost(post.id); setShowReactions(false); }}
                        className={`p-1 hover:scale-125 transition-transform ${rt.color}`}
                      >
                        <rt.icon size={18} fill="currentColor" className="opacity-80" />
                      </button>
                    ))}
                  </div>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleLikePost(post.id); }}
                  onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setShowReactions(true); }}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-neon-pink transition-colors active:scale-125"
                >
                  <Heart size={14} />
                  <span className="text-[9px] font-bold">{stats.likes}</span>
                </button>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); onPress(); }}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
              >
                <MessageSquare size={14} />
                <span className="text-[9px] font-bold">{stats.comments}</span>
              </button>
              <button 
                onClick={(e) => e.stopPropagation()} 
                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors ml-auto"
              >
                  <Send size={14} />
              </button>
          </div>
      </div>
    );
  };

  const ConversationItem: React.FC<{ conv: Conversation }> = ({ conv }) => {
    const [showMenu, setShowMenu] = useState(false);

    const handleAction = (action: string) => {
        setShowMenu(false);
        switch(action) {
            case 'unread': alert('Marked as unread'); break;
            case 'disappear': alert('Disappearing messages enabled (24h)'); break;
            case 'mute': alert(`Muted notifications for @${conv.username}`); break;
            case 'profile': alert(`Navigating to @${conv.username}'s profile...`); break;
            case 'block': alert(`Blocked @${conv.username}`); break;
            case 'receipts': alert('Read receipts disabled'); break;
            case 'report': alert('Conversation reported for review'); break;
        }
    };

    return (
        <div className="relative group mb-2">
            <div 
                onClick={() => { setSelectedConversation(conv); onChatStateChange?.(true); }}
                className="w-full bg-gray-900/40 hover:bg-gray-800 transition-colors p-4 rounded-3xl border border-white/5 flex items-center gap-4 cursor-pointer active:scale-[0.98]"
            >
                <div className="relative shrink-0">
                    <img src={conv.avatarUrl} className="w-12 h-12 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition-transform" />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black" />
                </div>
                <div className="flex-1 min-w-0 text-left pr-8">
                    <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-black text-white text-sm truncate uppercase tracking-tighter italic">@{conv.username}</h4>
                        <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">{new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-white font-bold' : 'text-gray-500 font-medium'}`}>{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                    <div className="bg-neon-pink w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-lg shadow-neon-pink/30 shrink-0">{conv.unreadCount}</div>
                )}
            </div>

            <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white rounded-full hover:bg-white/10 transition-all z-10"
            >
                <MoreHorizontal size={18} />
            </button>

            {showMenu && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-4 top-10 z-50 bg-gray-900 border border-white/10 rounded-xl shadow-2xl w-56 overflow-hidden animate-fade-in py-1">
                        {[
                            { id: 'unread', icon: Mail, label: 'Mark as unread' },
                            { id: 'disappear', icon: Timer, label: 'Disappearing messages' },
                            { id: 'mute', icon: BellOff, label: 'Mute notifications' },
                            { id: 'profile', icon: UserIcon, label: 'See profile' },
                            { id: 'block', icon: Ban, label: 'Block user', color: 'text-red-500' },
                            { id: 'receipts', icon: CheckCheck, label: 'Read receipts' },
                            { id: 'report', icon: Flag, label: 'Report conversation', color: 'text-red-500' },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={(e) => { e.stopPropagation(); handleAction(item.id); }}
                                className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 flex items-center gap-3 transition-colors ${item.color || 'text-white'}`}
                            >
                                <item.icon size={14} /> {item.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
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
          conversations.map(conv => <ConversationItem key={conv.partnerId} conv={conv} />)
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

  const ChatUI = () => {
    const [showChatMenu, setShowChatMenu] = useState(false);

    const handleChatAction = (action: string) => {
        setShowChatMenu(false);
        switch(action) {
            case 'unread': alert('Conversation marked as unread'); setSelectedConversation(null); onChatStateChange?.(false); break;
            case 'disappear': alert('Disappearing messages set to 24 hours'); break;
            case 'mute': alert('Notifications muted for this conversation'); break;
            case 'profile': alert(`Viewing profile of @${selectedConversation?.username}`); break;
            case 'block': alert(`Blocked @${selectedConversation?.username}`); setSelectedConversation(null); onChatStateChange?.(false); break;
            case 'receipts': alert('Read receipts turned off'); break;
            case 'report': alert('Conversation reported'); break;
        }
    };

    return (
    <div className="fixed inset-0 z-[120] bg-black flex flex-col animate-fade-in">
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-neon-purple/10 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-xl z-10 pt-12 relative">
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
        
        <div className="relative">
            <button 
                onClick={() => setShowChatMenu(!showChatMenu)}
                className="p-2 text-gray-500 hover:text-white transition-colors"
            >
                <MoreHorizontal size={20} />
            </button>
            {showChatMenu && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowChatMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50 bg-gray-900 border border-white/10 rounded-xl shadow-2xl w-56 overflow-hidden animate-fade-in py-1">
                        {[
                            { id: 'unread', icon: Mail, label: 'Mark as unread' },
                            { id: 'disappear', icon: Timer, label: 'Disappearing messages' },
                            { id: 'mute', icon: BellOff, label: 'Mute notifications' },
                            { id: 'profile', icon: UserIcon, label: 'See profile' },
                            { id: 'block', icon: Ban, label: 'Block user', color: 'text-red-500' },
                            { id: 'receipts', icon: CheckCheck, label: 'Read receipts' },
                            { id: 'report', icon: Flag, label: 'Report conversation', color: 'text-red-500' },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleChatAction(item.id)}
                                className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 flex items-center gap-3 transition-colors ${item.color || 'text-white'}`}
                            >
                                <item.icon size={14} /> {item.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-32">
        {chatMessages.map(m => {
          const isMe = m.senderId === currentUser.id || m.senderId === 'me';
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
  };

  const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => {
    return (
      <div className="animate-fade-in">
         <div className="flex gap-3">
            <img src={comment.avatarUrl} className="w-7 h-7 rounded-full border border-white/10 shrink-0" />
            <div className="flex-1">
              <div className="bg-gray-900/50 rounded-2xl p-3 border border-white/5">
                <span className="font-bold text-white text-[10px]">@{comment.username}</span>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{comment.text}</p>
              </div>
              <div className="flex items-center gap-4 mt-1 ml-2">
                 <button className="text-[9px] font-bold text-gray-500 hover:text-white">Like</button>
                 <button 
                    onClick={() => {
                        setReplyTo(comment);
                        commentInputRef.current?.focus();
                    }} 
                    className="text-[9px] font-bold text-gray-500 hover:text-white"
                 >
                    Reply
                 </button>
                 <span className="text-[9px] text-gray-600">{new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2 pl-2 space-y-2 border-l-2 border-white/5">
                    {comment.replies.map(reply => (
                        <div key={reply.id} className="flex gap-2">
                            <img src={reply.avatarUrl} className="w-5 h-5 rounded-full border border-white/10 shrink-0" />
                            <div className="flex-1">
                                <div className="bg-gray-900/30 rounded-xl p-2 border border-white/5">
                                    <span className="font-bold text-white text-[9px]">@{reply.username}</span>
                                    <p className="text-[10px] text-gray-400">{reply.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              )}
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-black md:pt-6 max-w-7xl mx-auto w-full relative min-h-0 overflow-hidden">
      
      {/* Feedback Notification */}
      {postFeedback && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[160] px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl animate-fade-in ${postFeedback.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {postFeedback.type === 'success' ? <CheckCheck size={18} /> : <AlertCircle size={18} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{postFeedback.message}</span>
        </div>
      )}

      {selectedStoryIndex !== null && (
        <StoryPlayer 
          stories={stories} 
          initialStoryIndex={selectedStoryIndex} 
          onClose={() => setSelectedStoryIndex(null)} 
          currentUser={currentUser}
          onDeleteStory={handleStoryDelete}
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
                <div className="flex-1">
                   <h3 className="font-bold text-white text-sm">@{selectedPostForComments.username}</h3>
                   <p className="text-xs text-gray-400 mt-1">{selectedPostForComments.content}</p>
                   {selectedPostForComments.mediaUrl && (
                       <div className="mt-3 rounded-xl overflow-hidden max-h-48 w-full border border-white/5">
                           {selectedPostForComments.mediaType === 'video' ? (
                               <video src={selectedPostForComments.mediaUrl} className="w-full h-full object-cover" controls />
                           ) : (
                               <img src={selectedPostForComments.mediaUrl || selectedPostForComments.imageUrl || ''} className="w-full h-full object-cover" />
                           )}
                       </div>
                   )}
                </div>
              </div>

              <div className="space-y-5">
                {isLoadingComments ? (
                  <div className="flex justify-center py-20"><RotateCcw size={24} className="text-neon-purple animate-spin" /></div>
                ) : (
                   comments.length > 0 ? comments.map(c => <CommentItem key={c.id} comment={c} />) : (
                     <div className="text-center py-20 text-gray-600 font-bold uppercase text-[9px] tracking-widest">Share your thoughts</div>
                   )
                )}
              </div>
          </div>

          <div className="p-4 bg-black border-t border-white/10 pb-10">
              {replyTo && (
                  <div className="flex justify-between items-center px-4 py-2 bg-gray-900/50 mb-2 rounded-xl border border-white/5 animate-slide-up">
                      <p className="text-[10px] text-gray-400 font-bold flex items-center gap-2">
                          <CornerDownRight size={12} className="text-neon-pink"/> 
                          Replying to <span className="text-white">@{replyTo.username}</span>
                      </p>
                      <button onClick={() => setReplyTo(null)}><X size={14} className="text-gray-500"/></button>
                  </div>
              )}
              <div className="flex gap-2 bg-gray-900 rounded-[20px] p-1.5 border border-white/10">
                <input 
                  ref={commentInputRef}
                  type="text" 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder={replyTo ? `Reply to @${replyTo.username}...` : "Share your thoughts..."}
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

                  <div className="px-4 pb-24">
                      <div className="flex items-center justify-between mb-4 px-1">
                          <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em]">Trending</h3>
                          <button onClick={handleManualRefresh} className="text-neon-purple active:rotate-180 transition-transform duration-500"><RotateCcw size={12}/></button>
                      </div>

                      <div className="space-y-4">
                          {isLoadingPosts ? (
                             <div className="flex flex-col items-center justify-center py-20 opacity-20">
                               <RotateCcw size={32} className="animate-spin-slow mb-4" />
                               <span className="text-[10px] font-black uppercase tracking-widest">Loading</span>
                             </div>
                          ) : posts.length > 0 ? (
                             posts.map(post => <PostItem key={post.id} post={post} onPress={() => setSelectedPostForComments(post)} />)
                          ) : (
                             <div className="flex flex-col items-center justify-center py-20 opacity-40">
                               <span className="text-[10px] font-black uppercase tracking-widest">No posts yet</span>
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
