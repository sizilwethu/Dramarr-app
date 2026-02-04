
import { supabase } from '../lib/supabaseClient';
import { User, Video, Series, Story, StorySegment, StoryReaction, SocialPost, Comment, Message, Conversation, MusicTrack, PayoutRequest, RideRequest, AICharacter } from '../types';
import { MOCK_VIDEOS, MOCK_POSTS, MOCK_CONVERSATIONS, MOCK_MUSIC } from './mockData';

// --- MAPPERS ---

const mapProfileToUser = (profile: any, email?: string): User => ({
  id: profile.id,
  username: profile.username || 'User',
  email: email || profile.email || '',
  avatarUrl: profile.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile.id,
  bio: profile.bio || '',
  isVerified: profile.is_verified || false,
  isCreator: profile.is_creator || false,
  isAdmin: profile.is_admin || false,
  coins: profile.coins || 0,
  credits: profile.credits || 0,
  following: profile.following || [],
  followers: profile.followers || 0,
  unlockedVideoIds: profile.unlocked_video_ids || [],
  joinDate: profile.created_at || new Date().toISOString(),
  subscriptionStatus: profile.subscription_status || 'free',
  dailyPremiumUnlockCount: profile.daily_premium_unlock_count || 0,
  lastPremiumUnlockDate: profile.last_premium_unlock_date || new Date().toDateString(),
  firstName: profile.first_name || '',
  lastName: profile.last_name || '',
  dob: profile.dob || '',
  gender: profile.gender || '',
  country: profile.country || '',
  state: profile.state || '',
  city: profile.city || '', // Added City
  address: profile.address || '',
  isDriver: profile.is_driver || false,
  driverStatus: profile.driver_status || 'none',
  onlineStatus: profile.online_status || 'offline',
  driverRating: profile.driver_rating || 5,
  walletBalance: profile.wallet_balance || 0,
  autoClearCache: profile.auto_clear_cache || false,
  accessibilityCaptions: profile.accessibility_captions || false,
  highContrastMode: profile.high_contrast_mode || false,
  hapticFeedbackStrength: profile.haptic_feedback_strength || 'low',
  highDefinitionPlayback: profile.high_definition_playback || true,
  dataSaverMode: profile.data_saver_mode || false,
  aiMemoryEnabled: profile.ai_memory_enabled || true,
  screenTimeLimit: profile.screen_time_limit || 60,
  monetizationEnabled: profile.monetization_enabled || false,
  creatorTier: profile.creator_tier || 'Starter',
  monthlyWatchTime: profile.monthly_watch_time || 0,
  pendingPayoutBalance: profile.pending_payout_balance || 0,
  lifetimeEarnings: profile.lifetime_earnings || 0
});

const mapDbVideoToVideo = (vid: any, creatorProfile: any): Video => ({
    id: vid.id,
    url: vid.url,
    thumbnailUrl: vid.thumbnail_url || '',
    creatorId: vid.creator_id,
    creatorName: creatorProfile?.username || 'Unknown',
    creatorAvatar: creatorProfile?.avatar_url || '',
    description: vid.description || '',
    tags: vid.tags || [],
    likes: vid.likes || 0,
    comments: vid.comments_count || 0,
    shares: vid.shares_count || 0,
    isLocked: vid.is_locked || false,
    unlockCost: vid.unlock_cost || 0,
    seriesId: vid.series_id,
    seriesTitle: vid.series_title || '',
    episodeNumber: vid.episode_number || 1,
    timestamp: new Date(vid.created_at).toLocaleDateString(),
    views: vid.views || 0,
    monetizedViews: vid.monetized_views || 0,
    isAd: vid.is_ad || false,
    adActionLabel: vid.ad_action_label,
    adDestinationUrl: vid.ad_destination_url
});

// --- API FUNCTIONS ---

export const api = {
    // AUTH
    signUp: async (email: string, password: string, username: string, additionalData?: any) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { username } }
            });
            if (error) throw error;
            
            if (data.user) {
                const { error: profileError } = await supabase.from('profiles').insert({
                    id: data.user.id,
                    username: username,
                    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                    credits: 5,
                    coins: 100,
                    following: [],
                    ...additionalData
                });
                if(profileError) throw profileError;
            }
            return data;
        } catch (e) {
            console.error("SignUp error", e);
            throw e;
        }
    },

    signIn: async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return data;
        } catch (e) {
            console.error("SignIn error", e);
            throw e;
        }
    },

    signOut: async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (e) {
            console.error("SignOut error", e);
        }
    },

    resetPassword: async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin, // Redirect back to app after password reset
            });
            if (error) throw error;
        } catch (e) {
            console.error("ResetPassword error", e);
            throw e;
        }
    },

    getCurrentUser: async (): Promise<User | null> => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return null;

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error || !profile) return null;
            return mapProfileToUser(profile, session.user.email);
        } catch (e) {
            console.error("GetCurrentUser error", e);
            return null;
        }
    },

    // --- MONETIZATION & FINANCES ---
    getMonetizationStats: async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('monetization_enabled, creator_tier, monthly_watch_time, pending_payout_balance, lifetime_earnings')
                .eq('id', userId)
                .single();
            if (error) throw error;
            return data;
        } catch (e) {
            console.error("getMonetizationStats error", e);
            return {
                monetization_enabled: false,
                creator_tier: 'Starter',
                monthly_watch_time: 0,
                pending_payout_balance: 0,
                lifetime_earnings: 0
            };
        }
    },

    requestPayout: async (userId: string, amount: number, method: string): Promise<PayoutRequest> => {
        try {
            const { data, error } = await supabase
                .from('payout_requests')
                .insert({ user_id: userId, amount, method, status: 'pending' })
                .select(`*, profiles (username)`)
                .single();
            if (error) throw error;
            return {
                id: data.id,
                userId: data.user_id,
                username: data.profiles?.username || 'User',
                amount: data.amount,
                method: data.method as any,
                status: data.status as any,
                timestamp: new Date(data.created_at).getTime()
            };
        } catch (e) {
            console.error("requestPayout error", e);
            throw e;
        }
    },

    getPendingPayouts: async (): Promise<PayoutRequest[]> => {
        try {
            const { data, error } = await supabase
                .from('payout_requests')
                .select(`*, profiles (username)`)
                .eq('status', 'pending');
            if (error) throw error;
            return data.map(d => ({
                id: d.id,
                userId: d.user_id,
                username: d.profiles?.username || 'User',
                amount: d.amount,
                method: d.method as any,
                status: d.status as any,
                timestamp: new Date(d.created_at).getTime()
            }));
        } catch (e) {
            console.error("getPendingPayouts error", e);
            return [];
        }
    },

    // --- RIDE HAILING (REAL LOGIC) ---
    requestRide: async (request: Partial<RideRequest>): Promise<RideRequest> => {
        try {
            const { data, error } = await supabase
                .from('rides')
                .insert({
                    passenger_id: request.passengerId,
                    pickup_address: request.pickupAddress,
                    destination_address: request.destinationAddress,
                    fare: request.fare,
                    status: 'SEARCHING',
                    vehicle_type: request.vehicleInfo?.type
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (e) {
            console.error("requestRide error", e);
            throw e;
        }
    },

    getRideStatus: async (rideId: string): Promise<RideRequest> => {
        try {
            const { data, error } = await supabase
                .from('rides')
                .select(`*, driver:driver_id(username, avatar_url, driver_rating)`)
                .eq('id', rideId)
                .single();
            if (error) throw error;
            return data;
        } catch (e) {
            console.error("getRideStatus error", e);
            throw e;
        }
    },

    // --- VIDEOS & SERIES ---
    uploadVideo: async (
        file: File, 
        thumbnailFile: File | null, 
        userId: string, 
        title: string, 
        isLocked: boolean, 
        genre: string,
        seriesData?: { id: string, title: string, episodeNumber: number }
    ) => {
        try {
            // 1. Upload Video
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/${Date.now()}_video.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('videos')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl: videoUrl } } = supabase.storage
                .from('videos')
                .getPublicUrl(fileName);

            // 2. Upload Thumbnail (if provided) or use default
            let thumbnailUrl = 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&q=80';
            
            if (thumbnailFile) {
                const thumbExt = thumbnailFile.name.split('.').pop();
                const thumbName = `${userId}/${Date.now()}_thumb.${thumbExt}`;
                
                const { error: thumbError } = await supabase.storage
                    .from('videos')
                    .upload(thumbName, thumbnailFile);
                
                if (!thumbError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('videos')
                        .getPublicUrl(thumbName);
                    thumbnailUrl = publicUrl;
                }
            }

            // 3. Insert Record
            const { data, error } = await supabase
                .from('videos')
                .insert({
                    url: videoUrl,
                    thumbnail_url: thumbnailUrl,
                    creator_id: userId,
                    description: title,
                    is_locked: isLocked,
                    unlock_cost: isLocked ? 5 : 0,
                    likes: 0,
                    views: 0,
                    comments_count: 0,
                    shares_count: 0,
                    tags: ['New', genre],
                    series_title: seriesData ? seriesData.title : 'Originals',
                    series_id: seriesData ? seriesData.id : null,
                    episode_number: seriesData ? seriesData.episodeNumber : 1,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            // 4. Update Series Total Episodes if part of a series
            if (seriesData) {
                await supabase.rpc('increment_total_episodes', { series_id_input: seriesData.id });
                // Fallback direct update if RPC doesn't exist (can create RPC or just use update)
                // Using simple update here assuming race conditions are rare for single creator
                const { data: s } = await supabase.from('series').select('total_episodes').eq('id', seriesData.id).single();
                if (s) {
                    await supabase.from('series').update({ total_episodes: s.total_episodes + 1 }).eq('id', seriesData.id);
                }
            }

            return data;
        } catch (e) {
            console.error("uploadVideo error", e);
            throw e;
        }
    },

    createSeries: async (coverFile: File | null, userId: string, title: string, description: string, category: string) => {
        try {
            // 1. Upload Cover
            let coverUrl = 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&q=80'; // Default
            
            if (coverFile) {
                const fileExt = coverFile.name.split('.').pop();
                const fileName = `${userId}/series_${Date.now()}.${fileExt}`;
                
                // Fallback to 'videos' bucket if 'images' doesn't exist, as buckets are often shared in basic setup
                const { error: uploadError } = await supabase.storage
                    .from('videos') 
                    .upload(fileName, coverFile);
                
                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('videos')
                        .getPublicUrl(fileName);
                    coverUrl = publicUrl;
                }
            }

            // 2. Insert Record
            const { data, error } = await supabase
                .from('series')
                .insert({
                    creator_id: userId,
                    title: title,
                    description: description,
                    cover_url: coverUrl,
                    category: category,
                    year: new Date().getFullYear(),
                    total_episodes: 0,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (e) {
            console.error("createSeries error", e);
            throw e;
        }
    },

    deleteVideo: async (videoId: string) => {
        try {
            const { error } = await supabase
                .from('videos')
                .delete()
                .eq('id', videoId);
            if (error) throw error;
        } catch (e) {
            console.error("deleteVideo error", e);
        }
    },

    getVideos: async (): Promise<Video[]> => {
        try {
            const { data, error } = await supabase
                .from('videos')
                .select(`*, profiles:creator_id (username, avatar_url)`)
                .order('created_at', { ascending: false });
            if (error) throw error;
            
            if (!data || data.length === 0) return MOCK_VIDEOS;
            
            return data.map((v: any) => mapDbVideoToVideo(v, v.profiles));
        } catch (e) {
            console.error("getVideos error", e);
            return MOCK_VIDEOS;
        }
    },

    // NEW: Get Real-time Video Stats
    getVideoStats: async (videoId: string) => {
        try {
            const { data: videoData } = await supabase
                .from('videos')
                .select('likes')
                .eq('id', videoId)
                .single();
                
            const { count } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('video_id', videoId);
                
            return {
                likes: videoData?.likes || 0,
                comments: count || 0
            };
        } catch (e) {
            console.error("getVideoStats error", e);
            return { likes: 0, comments: 0 };
        }
    },

    // NEW: Get Real-time Social Post Stats
    getPostStats: async (postId: string) => {
        try {
            const { data: postData } = await supabase
                .from('posts')
                .select('likes')
                .eq('id', postId)
                .single();
                
            const { count } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', postId);
                
            return {
                likes: postData?.likes || 0,
                comments: count || 0
            };
        } catch (e) {
            console.error("getPostStats error", e);
            return { likes: 0, comments: 0 };
        }
    },

    getSeries: async (category?: string): Promise<Series[]> => {
        try {
            // Join with profiles to get creator username for search
            let query = supabase.from('series').select('*, profiles:creator_id(username)');
            if (category && category !== 'All') query = query.eq('category', category);
            
            const { data, error } = await query;
            if (error) throw error;
            
            if (!data) return [];

            return data.map((s: any) => ({
                id: s.id,
                title: s.title,
                description: s.description,
                coverUrl: s.cover_url,
                creatorId: s.creator_id,
                creatorName: s.profiles?.username || 'Unknown',
                category: s.category,
                year: s.year,
                totalEpisodes: s.total_episodes
            }));
        } catch (e) {
            console.error("getSeries error", e);
            return [];
        }
    },

    getUserSeries: async (userId: string): Promise<Series[]> => {
        try {
            const { data, error } = await supabase
                .from('series')
                .select('*')
                .eq('creator_id', userId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            if (!data) return [];

            return data.map((s: any) => ({
                id: s.id,
                title: s.title,
                description: s.description,
                coverUrl: s.cover_url,
                creatorId: s.creator_id,
                category: s.category,
                year: s.year,
                totalEpisodes: s.total_episodes
            }));
        } catch (e) {
            console.error("getUserSeries error", e);
            return [];
        }
    },

    getAICharacters: async (): Promise<AICharacter[]> => {
        try {
            const { data, error } = await supabase.from('characters').select('*');
            if (error) throw error;
            if (!data) return [];
            
            return data.map((c: any) => ({
                id: c.id,
                name: c.name,
                seriesId: c.series_id,
                avatarUrl: c.avatar_url,
                description: c.description,
                personality: c.personality
            }));
        } catch (e) {
            console.error("getAICharacters error", e);
            return [];
        }
    },

    // --- SOCIAL ---
    getSocialPosts: async (): Promise<SocialPost[]> => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`*, profiles (username, avatar_url)`)
                .order('created_at', { ascending: false });
            if (error) throw error;
            
            // Fallback if no real posts exist to keep UI populated
            if (!data || data.length === 0) return MOCK_POSTS;

            return data.map((p: any) => ({
                id: p.id,
                userId: p.user_id,
                username: p.profiles?.username || 'User',
                avatarUrl: p.profiles?.avatar_url,
                content: p.content,
                mediaUrl: p.media_url,
                // Fallback for media type if column missing or null
                mediaType: p.media_type || (p.media_url ? (p.media_url.includes('blob:http') && !p.media_url.match(/\.(jpeg|jpg|gif|png)$/) ? 'video' : 'image') : 'text'), 
                likes: p.likes || 0,
                comments: p.comments_count || 0,
                views: p.views || 0,
                timestamp: new Date(p.created_at).toLocaleDateString()
            }));
        } catch (e) {
            console.error("getSocialPosts error", e);
            return MOCK_POSTS;
        }
    },

    getStories: async (): Promise<Story[]> => {
        try {
            // Calculate time 24 hours ago
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            const { data, error } = await supabase
                .from('stories')
                .select(`*, profiles (username, avatar_url)`)
                .gt('created_at', oneDayAgo) // Filter for only last 24h
                .order('created_at', { ascending: false });
            if (error) throw error;
            
            // Return empty array if no data, NO MOCK DATA FALLBACK
            if (!data || data.length === 0) return [];

            return data.map((s: any) => ({
                id: s.id,
                userId: s.user_id,
                username: s.profiles?.username || 'Unknown',
                avatarUrl: s.profiles?.avatar_url,
                segments: s.segments_json ? JSON.parse(s.segments_json) : [],
                isViewed: false, 
                timestamp: new Date(s.created_at).getTime(),
                views: s.views || 0,
                privacy: s.privacy || 'public'
            }));
        } catch (e) {
            console.error("getStories error", e);
            return []; // Return empty array on error
        }
    },

    deleteStory: async (storyId: string) => {
        try {
            const { error } = await supabase.from('stories').delete().eq('id', storyId);
            if (error) throw error;
        } catch (e) {
            console.error("deleteStory error", e);
            throw e;
        }
    },

    getMusicTracks: async (): Promise<MusicTrack[]> => {
        try {
            const { data, error } = await supabase.from('music_tracks').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            
            if (!data || data.length === 0) return MOCK_MUSIC;

            return data;
        } catch (e) {
            console.error("getMusicTracks error", e);
            return MOCK_MUSIC;
        }
    },

    // --- MUTATIONS ---
    incrementVideoView: async (videoId: string) => {
        try {
            await supabase.rpc('increment_view_count', { target_id: videoId, table_name: 'videos' });
        } catch (e) {
            console.warn("View increment failed", e);
        }
    },

    likePost: async (postId: string) => {
        try {
            await supabase.rpc('increment_like_count', { target_id: postId, table_name: 'posts' });
        } catch (e) {
            console.warn("Like failed", e);
        }
    },

    likeVideo: async (videoId: string) => {
        try {
            await supabase.rpc('increment_like_count', { target_id: videoId, table_name: 'videos' });
        } catch (e) {
            console.warn("Like video failed", e);
        }
    },

    updateProfile: async (userId: string, updates: any) => {
        try {
            const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
            if (error) throw error;
        } catch (e) {
            console.error("UpdateProfile error", e);
            throw e;
        }
    },

    toggleFollow: async (followerId: string, followingId: string) => {
        try {
            const { data: profile } = await supabase.from('profiles').select('following').eq('id', followerId).single();
            if (!profile) return;
            
            let newFollowing = [...(profile.following || [])];
            const isFollowing = newFollowing.includes(followingId);
            
            if (isFollowing) {
                newFollowing = newFollowing.filter(id => id !== followingId);
                await supabase.rpc('decrement_follower_count', { profile_id: followingId });
            } else {
                newFollowing.push(followingId);
                await supabase.rpc('increment_follower_count', { profile_id: followingId });
            }
            
            await supabase.from('profiles').update({ following: newFollowing }).eq('id', followerId);
            return !isFollowing;
        } catch (e) {
            console.error("ToggleFollow error", e);
            return false;
        }
    },

    getComments: async (contentId: string, type: 'post' | 'video' = 'post'): Promise<Comment[]> => {
        try {
            let query = supabase
                .from('comments')
                .select(`*, profiles (username, avatar_url)`)
                .order('created_at', { ascending: true });
            
            if (type === 'post') {
                query = query.eq('post_id', contentId);
            } else {
                query = query.eq('video_id', contentId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data.map((c: any) => ({
                id: c.id,
                userId: c.user_id,
                username: c.profiles?.username || 'User',
                avatarUrl: c.profiles?.avatar_url || '',
                text: c.text,
                timestamp: new Date(c.created_at).getTime(),
                parentId: c.parent_id
            }));
        } catch (e) {
            console.error("getComments error", e);
            return [];
        }
    },

    postComment: async (userId: string, contentId: string, text: string, type: 'post' | 'video' = 'post', parentId?: string) => {
        try {
            const payload: any = { user_id: userId, text, parent_id: parentId };
            if (type === 'post') payload.post_id = contentId;
            else payload.video_id = contentId;

            const { error } = await supabase
                .from('comments')
                .insert(payload);
            if (error) throw error;
        } catch (e) {
            console.error("postComment error", e);
            throw e;
        }
    },

    createSocialPost: async (userId: string, content: string, file?: File): Promise<SocialPost> => {
        try {
            // Check if userId is a valid UUID (simple regex check)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const isMockUser = !uuidRegex.test(userId);

            if (isMockUser) {
                await new Promise(resolve => setTimeout(resolve, 500));
                return {
                    id: 'mock_post_' + Date.now(),
                    userId: userId,
                    username: 'Me',
                    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
                    content: content,
                    mediaUrl: file ? URL.createObjectURL(file) : null,
                    mediaType: file?.type.startsWith('video') ? 'video' : (file ? 'image' : 'text'),
                    likes: 0,
                    comments: 0,
                    views: 0,
                    timestamp: 'Just now'
                };
            }

            const payload: any = { 
                user_id: userId, 
                content
            };

            let localMediaType: 'image' | 'video' | 'text' = 'text';
            let localMediaUrl = null;

            if (file) {
                localMediaUrl = URL.createObjectURL(file);
                localMediaType = file.type.startsWith('video') ? 'video' : 'image';
                
                payload.media_url = localMediaUrl;
                payload.media_type = localMediaType;
            } else {
                payload.media_url = null;
                payload.media_type = 'text';
            }

            // 1. Insert Post
            const { data: postData, error: insertError } = await supabase
                .from('posts')
                .insert(payload)
                .select()
                .single();
                
            if (insertError) {
                console.error("Supabase Post Insert Error:", insertError);
                throw insertError;
            }

            // 2. Fetch User Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', userId)
                .single();

            return {
                id: postData.id,
                userId: postData.user_id,
                username: profileData?.username || 'User',
                avatarUrl: profileData?.avatar_url || '',
                content: postData.content,
                mediaUrl: postData.media_url || localMediaUrl,
                mediaType: postData.media_type || localMediaType,
                likes: 0,
                comments: 0,
                views: 0,
                timestamp: 'Just now'
            };
        } catch (e) {
            console.error("createSocialPost error", e);
            throw e;
        }
    },

    getUserProfile: async (userId: string): Promise<User | null> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (error || !data) return null;
            return mapProfileToUser(data);
        } catch (e) {
            console.error("getUserProfile error", e);
            return null;
        }
    },

    uploadMusicTrack: async (audioFile: File, coverFile: File | null, title: string, artist: string, duration: string, userId: string) => {
        try {
            const { error } = await supabase
                .from('music_tracks')
                .insert({
                    title,
                    artist,
                    audio_url: URL.createObjectURL(audioFile),
                    cover_url: coverFile ? URL.createObjectURL(coverFile) : null,
                    duration,
                    uploader_id: userId
                });
            if (error) throw error;
        } catch (e) {
            console.error("uploadMusicTrack error", e);
            throw e;
        }
    },

    reactToStory: async (storyId: string, reaction: { userId: string, type: string, icon: string }, storyOwnerId: string) => {
        // Sends a message to the inbox instead of just a DB counter
        try {
            await api.sendMessage(reaction.userId, storyOwnerId, `Reacted ${reaction.icon} to your story.`);
        } catch (e) {
            console.error("Reaction failed", e);
        }
    },

    sendMessage: async (senderId: string, receiverId: string, content: string) => {
        try {
            const { error } = await supabase
                .from('messages')
                .insert({ sender_id: senderId, receiver_id: receiverId, content, is_read: false });
            if (error) throw error;
        } catch (e) {
            console.error("sendMessage error", e);
            throw e;
        }
    },

    getConversations: async (userId: string): Promise<Conversation[]> => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select(`*, sender:sender_id(username, avatar_url), receiver:receiver_id(username, avatar_url)`)
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            const partners = new Map<string, Conversation>();
            data.forEach((msg: any) => {
                const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
                const partner = msg.sender_id === userId ? msg.receiver : msg.sender;
                
                if (!partners.has(partnerId)) {
                    partners.set(partnerId, {
                        partnerId,
                        username: partner?.username || 'User',
                        avatarUrl: partner?.avatar_url || '',
                        lastMessage: msg.content,
                        timestamp: new Date(msg.created_at).getTime(),
                        unreadCount: msg.receiver_id === userId && !msg.is_read ? 1 : 0
                    });
                } else if (msg.receiver_id === userId && !msg.is_read) {
                    const existing = partners.get(partnerId)!;
                    existing.unreadCount++;
                }
            });
            
            return Array.from(partners.values());
        } catch (e) {
            console.error("getConversations error", e);
            return [];
        }
    },

    getMessages: async (userId: string, partnerId: string): Promise<Message[]> => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            return data.map((m: any) => ({
                id: m.id,
                senderId: m.sender_id,
                receiverId: m.receiver_id,
                content: m.content,
                timestamp: new Date(m.created_at).getTime(),
                isRead: m.is_read
            }));
        } catch (e) {
            console.error("getMessages error", e);
            return [];
        }
    },

    uploadStory: async (file: File, userId: string, type: string, segments: any[]) => {
        try {
            const { error } = await supabase
                .from('stories')
                .insert({
                    user_id: userId,
                    segments_json: JSON.stringify(segments)
                });
            if (error) throw error;
        } catch (e) {
            console.error("uploadStory error", e);
            throw e;
        }
    }
};
