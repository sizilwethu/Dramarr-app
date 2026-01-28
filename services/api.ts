
import { supabase } from '../lib/supabaseClient';
import { User, Video, Series, Story, StorySegment, StoryReaction, SocialPost, Comment, Message, Conversation, MusicTrack, PayoutRequest, RideRequest, AICharacter } from '../types';

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
                ...additionalData
            });
            if(profileError) throw profileError;
        }
        return data;
    },

    signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    getCurrentUser: async (): Promise<User | null> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return null;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (error || !profile) return null;
        return mapProfileToUser(profile, session.user.email);
    },

    // --- MONETIZATION & FINANCES ---
    getMonetizationStats: async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('monetization_enabled, creator_tier, monthly_watch_time, pending_payout_balance, lifetime_earnings')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return data;
    },

    requestPayout: async (userId: string, amount: number, method: string): Promise<PayoutRequest> => {
        const { data, error } = await supabase
            .from('payout_requests')
            .insert({ user_id: userId, amount, method, status: 'pending' })
            .select(`*, profiles(username)`)
            .single();
        if (error) throw error;
        return {
            id: data.id,
            userId: data.user_id,
            username: data.profiles?.username || 'User',
            amount: data.amount,
            method: data.method,
            status: data.status,
            timestamp: new Date(data.created_at).getTime()
        };
    },

    getPendingPayouts: async (): Promise<PayoutRequest[]> => {
        const { data, error } = await supabase
            .from('payout_requests')
            .select(`*, profiles(username)`)
            .eq('status', 'pending');
        if (error) throw error;
        return data.map(d => ({
            id: d.id,
            userId: d.user_id,
            username: d.profiles?.username || 'User',
            amount: d.amount,
            method: d.method,
            status: d.status,
            timestamp: new Date(d.created_at).getTime()
        }));
    },

    // --- RIDE HAILING (REAL LOGIC) ---
    requestRide: async (request: Partial<RideRequest>): Promise<RideRequest> => {
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
    },

    getRideStatus: async (rideId: string): Promise<RideRequest> => {
        const { data, error } = await supabase
            .from('rides')
            .select(`*, driver:driver_id(username, avatar_url, driver_rating)`)
            .eq('id', rideId)
            .single();
        if (error) throw error;
        return data;
    },

    // --- VIDEOS ---
    getVideos: async (): Promise<Video[]> => {
        const { data, error } = await supabase
            .from('videos')
            .select(`*, profiles:creator_id (username, avatar_url)`)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data.map((v: any) => mapDbVideoToVideo(v, v.profiles));
    },

    getSeries: async (category?: string): Promise<Series[]> => {
        let query = supabase.from('series').select('*');
        if (category && category !== 'All') query = query.eq('category', category);
        const { data, error } = await query;
        if (error) throw error;
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
    },

    getAICharacters: async (): Promise<AICharacter[]> => {
        const { data, error } = await supabase.from('characters').select('*');
        if (error) throw error;
        return data;
    },

    // --- SOCIAL ---
    getSocialPosts: async (): Promise<SocialPost[]> => {
        const { data, error } = await supabase
            .from('posts')
            .select(`*, profiles:user_id (username, avatar_url)`)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data.map((p: any) => ({
            id: p.id,
            userId: p.user_id,
            username: p.profiles?.username || 'User',
            avatarUrl: p.profiles?.avatar_url,
            content: p.content,
            mediaUrl: p.media_url,
            mediaType: p.media_type,
            likes: p.likes || 0,
            comments: p.comments_count || 0,
            views: p.views || 0,
            timestamp: new Date(p.created_at).toLocaleDateString()
        }));
    },

    getStories: async (): Promise<Story[]> => {
        const { data, error } = await supabase
            .from('stories')
            .select(`*, profiles:user_id (username, avatar_url)`)
            .order('created_at', { ascending: false });
        if (error) throw error;
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
    },

    getMusicTracks: async (): Promise<MusicTrack[]> => {
        const { data, error } = await supabase.from('music_tracks').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    // --- MUTATIONS ---
    incrementVideoView: async (videoId: string) => {
        await supabase.rpc('increment_view_count', { target_id: videoId, table_name: 'videos' });
    },

    likePost: async (postId: string) => {
        await supabase.rpc('increment_like_count', { target_id: postId, table_name: 'posts' });
    },

    updateProfile: async (userId: string, updates: any) => {
        const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
        if (error) throw error;
    },

    // --- ADDING MISSING METHODS TO FIX ERRORS ---
    getComments: async (postId: string): Promise<Comment[]> => {
        const { data, error } = await supabase
            .from('comments')
            .select(`*, profiles:user_id (username, avatar_url)`)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });
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
    },

    postComment: async (userId: string, postId: string, text: string, parentId?: string) => {
        const { error } = await supabase
            .from('comments')
            .insert({ user_id: userId, post_id: postId, text, parent_id: parentId });
        if (error) throw error;
    },

    createSocialPost: async (userId: string, content: string, file?: File): Promise<SocialPost> => {
        const { data, error } = await supabase
            .from('posts')
            .insert({ 
                user_id: userId, 
                content, 
                media_url: file ? URL.createObjectURL(file) : null,
                media_type: file?.type.startsWith('video') ? 'video' : 'image'
            })
            .select(`*, profiles:user_id (username, avatar_url)`)
            .single();
        if (error) throw error;
        return {
            id: data.id,
            userId: data.user_id,
            username: data.profiles?.username || 'User',
            avatarUrl: data.profiles?.avatar_url || '',
            content: data.content,
            mediaUrl: data.media_url,
            mediaType: data.media_type,
            likes: 0,
            comments: 0,
            timestamp: 'Just now'
        };
    },

    getUserProfile: async (userId: string): Promise<User | null> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error || !data) return null;
        return mapProfileToUser(data);
    },

    uploadMusicTrack: async (audioFile: File, coverFile: File | null, title: string, artist: string, duration: string, userId: string) => {
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
    },

    reactToStory: async (storyId: string, reaction: any) => {
        // Implementation for story reactions
        return Promise.resolve();
    },

    sendMessage: async (senderId: string, receiverId: string, content: string) => {
        const { error } = await supabase
            .from('messages')
            .insert({ sender_id: senderId, receiver_id: receiverId, content, is_read: false });
        if (error) throw error;
    },

    getConversations: async (userId: string): Promise<Conversation[]> => {
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
    },

    getMessages: async (userId: string, partnerId: string): Promise<Message[]> => {
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
    },

    uploadStory: async (file: File, userId: string, type: string, segments: any[]) => {
        const { error } = await supabase
            .from('stories')
            .insert({
                user_id: userId,
                segments_json: JSON.stringify(segments)
            });
        if (error) throw error;
    }
};
