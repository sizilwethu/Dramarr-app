import React, { useState, useEffect } from 'react';
import { User, Story, SocialPost, Conversation, Message } from '../types';
import { api } from '../services/api';
import { RotateCcw, Search, Plus, MessageCircle, Heart, Share2, MoreHorizontal, ChevronRight, Inbox, Send, ArrowLeft } from 'lucide-react';
import { StoryPlayer } from './StoryPlayer';
import { StoryCreator } from './StoryCreator';

interface SocialViewProps {
    currentUser: User;
    stories: Story[];
    posts: SocialPost[];
    onDeletePost: (id: string) => void;
    onDeleteStory: (id: string) => void;
    onBack: () => void;
    initialPartner?: any;
    onClearTarget: () => void;
    onOpenProfile: (id: string) => void;
    onToggleFollow: (id: string) => void;
}

const PostItem: React.FC<{ post: SocialPost, onPress: () => void, onDelete: () => void }> = ({ post, onPress, onDelete }) => (
    <div className="bg-gray-900 rounded-[24px] overflow-hidden border border-white/5 mb-4">
        <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <img src={post.avatarUrl} className="w-8 h-8 rounded-full border border-white/10 object-cover" />
                <div>
                    <h4 className="font-bold text-white text-xs">@{post.username}</h4>
                    <p className="text-[10px] text-gray-500">{post.timestamp}</p>
                </div>
            </div>
            <button onClick={onDelete} className="text-gray-500 hover:text-white"><MoreHorizontal size={16} /></button>
        </div>
        {post.mediaUrl && (
            <div className="w-full aspect-[4/5] bg-black">
                {post.mediaType === 'video' ? (
                    <video src={post.mediaUrl} className="w-full h-full object-cover" controls />
                ) : (
                    <img src={post.mediaUrl} className="w-full h-full object-cover" onClick={onPress} />
                )}
            </div>
        )}
        <div className="p-4">
            <div className="flex items-center gap-4 mb-3">
                <button className="text-white hover:text-neon-pink transition-colors"><Heart size={20} /></button>
                <button className="text-white hover:text-blue-400 transition-colors" onClick={onPress}><MessageCircle size={20} /></button>
                <button className="text-white hover:text-green-400 transition-colors"><Share2 size={20} /></button>
            </div>
            <p className="text-xs text-white"><span className="font-bold mr-2">@{post.username}</span>{post.content}</p>
        </div>
    </div>
);

const ChatView: React.FC<{ user: User, partner: Conversation, onBack: () => void }> = ({ user, partner, onBack }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');

    useEffect(() => {
        const loadMessages = async () => {
            const msgs = await api.getMessages(user.id, partner.partnerId);
            setMessages(msgs);
        };
        loadMessages();
    }, [partner]);

    const handleSend = async () => {
        if (!text.trim()) return;
        const newMsg: Message = {
            id: Date.now().toString(),
            senderId: user.id,
            receiverId: partner.partnerId,
            content: text,
            timestamp: Date.now(),
            isRead: true
        };
        setMessages([...messages, newMsg]);
        setText('');
        await api.sendMessage(user.id, partner.partnerId, text);
    };

    return (
        <div className="flex flex-col h-full bg-black">
            <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-gray-900">
                <button onClick={onBack}><ArrowLeft size={24} className="text-gray-400" /></button>
                <div className="flex items-center gap-3">
                    <img src={partner.avatarUrl} className="w-8 h-8 rounded-full" />
                    <h3 className="font-bold text-white text-sm">{partner.username}</h3>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(m => (
                    <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`px-4 py-2 rounded-2xl max-w-[70%] text-xs ${m.senderId === user.id ? 'bg-neon-purple text-white' : 'bg-gray-800 text-gray-200'}`}>
                            {m.content}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-white/10 bg-gray-900">
                <div className="flex gap-2 bg-black rounded-full p-2 border border-white/10">
                    <input 
                        className="flex-1 bg-transparent px-4 text-xs text-white focus:outline-none"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Message..."
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={handleSend} className="p-2 bg-neon-purple rounded-full text-white"><Send size={14} /></button>
                </div>
            </div>
        </div>
    );
};

export const SocialView: React.FC<SocialViewProps> = ({ 
    currentUser, stories: initialStories, posts: initialPosts, 
    onDeletePost, onDeleteStory, onBack, initialPartner, onClearTarget,
    onOpenProfile
}) => {
    const [view, setView] = useState<'feed' | 'inbox'>(initialPartner ? 'inbox' : 'feed');
    const [stories, setStories] = useState<Story[]>(initialStories);
    const [posts, setPosts] = useState<SocialPost[]>(initialPosts);
    const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
    const [showStoryCreator, setShowStoryCreator] = useState(false);
    const [selectedPostForComments, setSelectedPostForComments] = useState<SocialPost | null>(null);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(initialPartner || null);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoadingPosts(true);
        const [fetchedStories, fetchedPosts, fetchedConvos] = await Promise.all([
            api.getStories(),
            api.getSocialPosts(),
            api.getConversations(currentUser.id)
        ]);
        setStories(fetchedStories);
        setPosts(fetchedPosts);
        setConversations(fetchedConvos);
        setIsLoadingPosts(false);
    };

    if (activeConversation) {
        return <ChatView user={currentUser} partner={activeConversation} onBack={() => { setActiveConversation(null); onClearTarget(); setView('inbox'); }} />;
    }

    return (
        <div className="h-full bg-black flex flex-col pt-12 animate-fade-in relative">
            <div className="px-4 mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Social</h2>
                <div className="flex bg-gray-900 p-1 rounded-full border border-white/10">
                    <button 
                        onClick={() => setView('feed')}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${view === 'feed' ? 'bg-white text-black' : 'text-gray-500'}`}
                    >
                        Feed
                    </button>
                    <button 
                        onClick={() => setView('inbox')}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${view === 'inbox' ? 'bg-white text-black' : 'text-gray-500'}`}
                    >
                        Inbox
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {view === 'feed' ? (
                    <div className="pb-24">
                        {/* Stories Rail */}
                        <div className="flex gap-4 px-4 mb-8 overflow-x-auto no-scrollbar pt-2">
                            <button 
                                onClick={() => setShowStoryCreator(true)}
                                className="flex flex-col items-center gap-2 shrink-0 group"
                            >
                                <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-900 group-hover:border-neon-purple transition-colors">
                                    <Plus className="text-gray-500 group-hover:text-neon-purple" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-500">Add Story</span>
                            </button>
                            {stories.map((story, i) => (
                                <button 
                                    key={story.id} 
                                    onClick={() => setActiveStoryIndex(i)}
                                    className="flex flex-col items-center gap-2 shrink-0"
                                >
                                    <div className={`w-16 h-16 rounded-full p-0.5 ${story.isViewed ? 'bg-gray-700' : 'bg-gradient-to-tr from-neon-purple to-neon-pink'}`}>
                                        <img src={story.avatarUrl} className="w-full h-full rounded-full border-2 border-black object-cover" />
                                    </div>
                                    <span className="text-[10px] font-bold text-white w-16 truncate text-center">{story.username}</span>
                                </button>
                            ))}
                        </div>

                        {/* Posts Feed */}
                        <div className="px-4 space-y-4">
                            {isLoadingPosts ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                    <RotateCcw size={32} className="animate-spin mb-4 text-white" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Loading Updates</span>
                                </div>
                            ) : posts.length > 0 ? (
                                posts.map(post => (
                                    <PostItem 
                                        key={post.id} 
                                        post={post} 
                                        onPress={() => setSelectedPostForComments(post)} 
                                        onDelete={() => onDeletePost(post.id)} 
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                    <Inbox size={48} className="text-gray-500 mb-4" />
                                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">No posts yet</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="px-4 pb-24">
                         <div className="relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 mb-6">
                            <Search className="absolute left-3 top-3.5 text-gray-500 w-4 h-4" />
                            <input 
                                type="text" 
                                placeholder="Search messages..." 
                                className="w-full bg-transparent py-3 pl-10 pr-4 text-sm text-white focus:outline-none placeholder-gray-600 font-medium" 
                            />
                        </div>
                        <div className="space-y-2">
                            {conversations.map(conv => (
                                <button 
                                    key={conv.partnerId} 
                                    onClick={() => setActiveConversation(conv)}
                                    className="w-full bg-gray-900/40 p-4 rounded-2xl flex items-center gap-4 hover:bg-gray-800 transition-colors border border-white/5"
                                >
                                    <div className="relative">
                                        <img src={conv.avatarUrl} className="w-12 h-12 rounded-full object-cover" />
                                        {conv.unreadCount > 0 && <div className="absolute -top-1 -right-1 bg-neon-pink w-4 h-4 rounded-full border-2 border-black" />}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-bold text-white text-sm">{conv.username}</h4>
                                            <span className="text-[10px] text-gray-500">{new Date(conv.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-white font-bold' : 'text-gray-500'}`}>{conv.lastMessage}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-600" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Overlays */}
            {activeStoryIndex !== null && (
                <StoryPlayer 
                    stories={stories}
                    initialStoryIndex={activeStoryIndex}
                    onClose={() => setActiveStoryIndex(null)}
                    currentUser={currentUser}
                    onDeleteStory={onDeleteStory}
                />
            )}
            
            {showStoryCreator && (
                <StoryCreator 
                    currentUser={currentUser}
                    onClose={() => setShowStoryCreator(false)}
                    onStoryPublished={loadData}
                />
            )}
        </div>
    );
};
