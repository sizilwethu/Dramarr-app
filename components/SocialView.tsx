
import React, { useState, useEffect, useRef } from 'react';
import { Story, SocialPost, User, Comment } from '../types';
import { api } from '../services/api'; // Import real API
import { Heart, MessageSquare, Send, Plus, Search, MoreHorizontal, Video as VideoIcon, X, Play, Pause, Trash2, ExternalLink, Image as ImageIcon, Reply, Eye } from 'lucide-react';

// --- Story Viewer Overlay Component ---
const StoryViewer = ({ 
  stories, 
  startIndex, 
  onClose,
  currentUserId,
  onDelete
}: { 
  stories: Story[], 
  startIndex: number, 
  onClose: () => void,
  currentUserId: string,
  onDelete: (id: string) => void
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  
  const story = stories[currentIndex];
  
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const hasIncrementedView = useRef(false);

  // Increment view on load
  useEffect(() => {
      if (story && !story.isAd && !hasIncrementedView.current) {
          api.incrementStoryView(story.id);
          setViewCount((story.views || 0) + 1);
          hasIncrementedView.current = true;
      }
  }, [story]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
    hasIncrementedView.current = false;
    if(stories[currentIndex]) {
        setViewCount(stories[currentIndex].views || 0);
    }
  }, [currentIndex, stories]);

  // Timer Logic
  useEffect(() => {
    if (isPaused) return;
    if (!story) return; 

    const interval = 50;
    const duration = 5000; 
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(i => i + 1);
            return 0;
          } else {
            onClose(); 
            return 100;
          }
        }
        return p + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, stories.length, onClose, story]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false); 
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const timeDiff = Date.now() - touchStartTime.current;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    if (diffY < -50 && Math.abs(diffX) < 50) {
        onClose();
        return;
    }
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        if (currentIndex < stories.length - 1) setCurrentIndex(i => i + 1);
        else onClose();
      } else {
        if (currentIndex > 0) setCurrentIndex(i => i - 1);
      }
      return;
    }
    if (timeDiff < 250 && Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
      const width = window.innerWidth;
      if (touchEndX < width * 0.3) {
        if (currentIndex > 0) setCurrentIndex(i => i - 1);
        else setProgress(0);
      } else {
        if (currentIndex < stories.length - 1) setCurrentIndex(i => i + 1);
        else onClose();
      }
    }
  };

  if(!story) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
    >
      <div className="flex gap-1 p-2 pt-4 z-20 absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent">
        {stories.map((s, i) => (
          <div key={s.id} className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%' }} 
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-2 mt-6 z-20">
        <div className="flex items-center gap-2">
            <img src={story.avatarUrl} className="w-9 h-9 rounded-full border border-white/20 object-cover" />
            <div>
                <p className="text-white font-bold text-sm shadow-black drop-shadow-md flex items-center gap-2">
                    {story.username} 
                    {story.isAd && <span className="bg-yellow-400 text-black text-[10px] px-1 rounded font-bold">Ad</span>}
                </p>
                <p className="text-gray-300 text-[10px] shadow-black drop-shadow-md flex items-center gap-1">
                    {Math.floor((Date.now() - story.timestamp) / 3600000)}h ago • <Eye size={10}/> {viewCount}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-4">
             <button onClick={(e) => { e.stopPropagation(); setIsPaused(!isPaused); }} className="p-2 text-white/80 hover:text-white">
                 {isPaused ? <Play size={20} fill="white" /> : <Pause size={20} fill="white" />}
             </button>
             {story.userId === currentUserId && (
                 <button onClick={(e) => { e.stopPropagation(); onDelete(story.id); onClose(); }} className="p-2 text-red-400 hover:text-red-500">
                    <Trash2 size={24} />
                 </button>
             )}
             <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 text-white/80 hover:text-white">
                <X size={28} />
             </button>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10 pointer-events-none">
         {story.type === 'video' ? (
             <video src={story.mediaUrl} className="w-full h-full object-cover" autoPlay muted loop />
         ) : (
             <img src={story.mediaUrl} className="w-full h-full object-cover" />
         )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
        {story.isAd ? (
            <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-full flex items-center justify-center gap-2">
                Learn More <ExternalLink size={16} />
            </button>
        ) : (
            <div className="flex items-center gap-3">
                <div className="flex-1 border border-white/40 rounded-full px-4 py-3 text-white/70 text-sm backdrop-blur-sm bg-white/5">
                    Send a message...
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

interface SocialViewProps {
    currentUser: User;
    stories: Story[];
    posts: SocialPost[];
    onDeletePost: (id: string) => void;
    onDeleteStory: (id: string) => void;
}

export const SocialView: React.FC<SocialViewProps> = ({ 
    currentUser, 
    stories, 
    posts: initialPosts, 
    onDeletePost, 
    onDeleteStory 
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'inbox'>('feed');
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
  
  // Real State for Feed
  const [posts, setPosts] = useState<SocialPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  
  // Create Post State
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // Comments State
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);

  // Story Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Real Posts
  useEffect(() => {
      const fetchPosts = async () => {
          const data = await api.getSocialPosts();
          if(data.length > 0) setPosts(data);
      };
      fetchPosts();
  }, []);

  // Fetch Comments when viewing a post
  useEffect(() => {
      if(activePostId) {
          api.getComments(activePostId).then(setComments);
      }
  }, [activePostId]);

  const handleCreatePost = async () => {
      if (!newPostText && !newPostImage) return;
      setLoading(true);
      try {
          await api.createSocialPost(currentUser.id, newPostText, newPostImage || undefined);
          setNewPostText('');
          setNewPostImage(null);
          setIsCreatingPost(false);
          // Refresh
          const data = await api.getSocialPosts();
          setPosts(data);
      } catch (e) {
          console.error(e);
          alert("Failed to post");
      }
      setLoading(false);
  };

  const handlePostComment = async () => {
      if(!activePostId || !newComment) return;
      try {
          await api.postComment(currentUser.id, activePostId, newComment, replyToId || undefined);
          setNewComment('');
          setReplyToId(null);
          api.getComments(activePostId).then(setComments);
      } catch (e) { console.error(e); }
  };

  const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(!file) return;
      try {
          const type = file.type.startsWith('video') ? 'video' : 'image';
          await api.uploadStory(file, currentUser.id, type);
          alert("Story uploaded!");
          // Trigger refresh logic via parent or reload
      } catch (e) { console.error(e); alert("Failed to upload story"); }
  };

  const incrementView = (postId: string) => {
      api.incrementPostView(postId);
  };

  return (
    <div className="h-full flex flex-col bg-neon-dark pt-12 pb-20">
      
      {viewingStoryIndex !== null && (
        <StoryViewer 
            stories={stories} 
            startIndex={viewingStoryIndex} 
            onClose={() => setViewingStoryIndex(null)} 
            currentUserId={currentUser.id}
            onDelete={onDeleteStory}
        />
      )}

      {/* Comment Modal */}
      {activePostId && (
          <div className="fixed inset-0 z-50 bg-black/80 flex flex-col justify-end animate-fade-in" onClick={() => setActivePostId(null)}>
              <div className="bg-gray-900 rounded-t-2xl p-4 h-3/4 flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                      <h3 className="font-bold text-white">Comments</h3>
                      <button onClick={() => setActivePostId(null)}><X className="text-gray-400"/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4">
                      {comments.length === 0 && <p className="text-gray-500 text-center mt-4">No comments yet. Be the first!</p>}
                      {comments.map(c => (
                          <div key={c.id}>
                            <div className="flex gap-3">
                                <img src={c.avatarUrl} className="w-8 h-8 rounded-full object-cover" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-300"><span className="font-bold text-white mr-2">{c.username}</span>{c.text}</p>
                                    <div className="flex gap-4 mt-1">
                                        <button onClick={() => setReplyToId(c.id)} className="text-xs text-gray-500 hover:text-white">Reply</button>
                                        <span className="text-xs text-gray-600">1h</span>
                                    </div>
                                </div>
                            </div>
                            {/* Replies */}
                            {c.replies?.map(r => (
                                <div key={r.id} className="flex gap-3 mt-3 ml-10">
                                    <img src={r.avatarUrl} className="w-6 h-6 rounded-full object-cover" />
                                    <div>
                                        <p className="text-xs text-gray-300"><span className="font-bold text-white mr-2">{r.username}</span>{r.text}</p>
                                    </div>
                                </div>
                            ))}
                          </div>
                      ))}
                  </div>
                  <div className="mt-2 border-t border-gray-800 pt-2 flex gap-2 items-center">
                      {replyToId && <span className="text-xs text-neon-purple whitespace-nowrap">Replying... <X size={10} className="inline cursor-pointer" onClick={() => setReplyToId(null)}/></span>}
                      <input 
                        type="text" 
                        value={newComment} 
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Add a comment..." 
                        className="flex-1 bg-gray-800 rounded-full px-4 py-2 text-sm text-white focus:outline-none"
                      />
                      <button onClick={handlePostComment} className="text-neon-pink font-bold text-sm">Post</button>
                  </div>
              </div>
          </div>
      )}

      {/* Header Tabs */}
      <div className="flex items-center justify-center gap-6 px-4 mb-4 z-10 relative">
        <button 
            onClick={() => setActiveTab('feed')}
            className={`text-lg font-bold transition-colors ${activeTab === 'feed' ? 'text-white' : 'text-gray-600'}`}
        >
            Discover
        </button>
        <div className="w-[1px] h-4 bg-gray-700"></div>
        <button 
            onClick={() => setActiveTab('inbox')}
            className={`text-lg font-bold transition-colors ${activeTab === 'inbox' ? 'text-white relative' : 'text-gray-600'}`}
        >
            Inbox
            <span className="absolute -top-1 -right-2 w-2 h-2 bg-neon-pink rounded-full"></span>
        </button>
      </div>

      {activeTab === 'feed' ? (
        <div className="flex-1 overflow-y-auto no-scrollbar">
          
          {/* Stories Rail */}
          <div className="flex gap-4 px-4 py-2 overflow-x-auto no-scrollbar mb-4 border-b border-gray-800/50 pb-4">
            <div className="flex flex-col items-center gap-1 min-w-[70px]">
                <input 
                    type="file" 
                    accept="image/*,video/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleStoryUpload}
                />
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-[68px] h-[68px] rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-900 relative cursor-pointer hover:border-neon-purple transition-colors"
                >
                    <Plus className="text-gray-400" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-neon-purple rounded-full flex items-center justify-center border-2 border-black text-white text-xs font-bold">+</div>
                </div>
                <span className="text-xs text-gray-400">My Story</span>
            </div>
            {stories.map((story, index) => (
                <div 
                    key={story.id} 
                    className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer transition-transform active:scale-95"
                    onClick={() => setViewingStoryIndex(index)}
                >
                    <div className={`w-[72px] h-[72px] rounded-full p-[2px] ${story.isAd ? 'bg-yellow-500' : story.isViewed ? 'bg-gray-700' : 'bg-gradient-to-tr from-neon-purple to-neon-pink'}`}>
                        <img src={story.avatarUrl} className="w-full h-full rounded-full border-2 border-black object-cover" />
                    </div>
                    <span className="text-xs text-white truncate w-16 text-center">{story.username}</span>
                </div>
            ))}
          </div>

          {/* Social Feed */}
          <div className="px-4 space-y-6">
            
            {/* Create Post Input */}
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                {isCreatingPost ? (
                    <div className="space-y-3">
                         <textarea 
                            value={newPostText}
                            onChange={(e) => setNewPostText(e.target.value)}
                            placeholder="What's happening?"
                            className="w-full bg-transparent text-white focus:outline-none min-h-[80px] text-sm"
                         />
                         {newPostImage && (
                             <div className="relative w-20 h-20">
                                 <img src={URL.createObjectURL(newPostImage)} className="w-full h-full object-cover rounded-lg" />
                                 <button onClick={() => setNewPostImage(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"><X size={12} text-white/></button>
                             </div>
                         )}
                         <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                             <div className="relative">
                                <input type="file" accept="image/*" className="hidden" id="post-img" onChange={e => setNewPostImage(e.target.files?.[0] || null)} />
                                <label htmlFor="post-img" className="text-neon-purple flex items-center gap-1 text-xs cursor-pointer"><ImageIcon size={16}/> Photo</label>
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => setIsCreatingPost(false)} className="text-gray-500 text-xs">Cancel</button>
                                <button onClick={handleCreatePost} disabled={loading} className="bg-neon-pink px-4 py-1 rounded-full text-xs font-bold text-white disabled:opacity-50">Post</button>
                             </div>
                         </div>
                    </div>
                ) : (
                    <div className="flex gap-3 mb-1" onClick={() => setIsCreatingPost(true)}>
                         <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden">
                             <img src={currentUser.avatarUrl} className="w-full h-full object-cover" />
                         </div>
                         <input type="text" placeholder="What's on your mind?" className="flex-1 bg-transparent text-white focus:outline-none text-sm cursor-pointer" readOnly />
                    </div>
                )}
            </div>

            {posts.map(post => (
                <div key={post.id} className="bg-black border border-gray-900 rounded-xl overflow-hidden relative group">
                    <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={post.avatarUrl} className="w-8 h-8 rounded-full object-cover" />
                            <div>
                                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                                    {post.username}
                                    {post.isAd && <span className="bg-yellow-400 text-black text-[10px] px-1 rounded font-bold">Sponsored</span>}
                                </h4>
                                <p className="text-[10px] text-gray-500">{post.timestamp}</p>
                            </div>
                        </div>
                        <MoreHorizontal size={16} className="text-gray-500" />
                    </div>
                    {post.imageUrl && (
                        <img src={post.imageUrl} className="w-full h-64 object-cover" onLoad={() => incrementView(post.id)} />
                    )}
                    <div className="p-3">
                         {post.isAd && (
                            <button className="w-full mb-3 bg-blue-900/30 text-blue-400 border border-blue-900 font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-blue-900/50">
                                {post.adActionLabel || 'Learn More'} <ExternalLink size={14}/>
                            </button>
                         )}
                         <div className="flex gap-4 mb-2">
                             <button onClick={() => api.likePost(post.id)} className="flex items-center gap-1 group">
                                <Heart className="w-6 h-6 text-white group-hover:text-neon-pink transition-colors" />
                                <span className="text-xs text-gray-400">{post.likes}</span>
                             </button>
                             <button onClick={() => setActivePostId(post.id)} className="flex items-center gap-1">
                                <MessageSquare className="w-6 h-6 text-white" />
                                <span className="text-xs text-gray-400">{post.comments}</span>
                             </button>
                             <div className="flex items-center gap-1 ml-auto text-gray-500">
                                 <Eye size={16} />
                                 <span className="text-xs">{post.views || 0}</span>
                             </div>
                         </div>
                         <p className="text-sm text-gray-300"><span className="font-bold text-white mr-2">{post.username}</span>{post.content}</p>
                    </div>
                </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
            Inbox (Mock)
        </div>
      )}
    </div>
  );
};
