
import { supabase } from '../lib/supabaseClient';
import { 
  User, Video, Series, Comment, SocialPost, Story, 
  Message, AICharacter, MusicTrack, RideRequest, 
  PayoutRequest, Conversation, RideStatus
} from '../types';

// Helper to map DB profile to User type
const mapProfileToUser = (profile: any, email?: string): User => ({
    id: profile.id,
    username: profile.username || 'user',
    email: email || '',
    avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
    isVerified: profile.is_verified || false,
    isAdmin: profile.is_admin || false,
    walletBalance: profile.wallet_balance || 0,
    isDriver: profile.is_driver || false,
    driverStatus: profile.driver_status || 'none',
    onlineStatus: profile.online_status || 'offline',
    driverRating: profile.driver_rating || 5.0,
    following: profile.following || [],
    followers: profile.followers || 0,
    unlockedVideoIds: profile.unlocked_video_ids || [],
    joinDate: profile.created_at,
    coins: profile.coins || 0,
    credits: profile.credits || 0,
    subscriptionStatus: profile.subscription_status || 'free',
    creatorTier: profile.creator_tier || 'Starter',
    monthlyWatchTime: profile.monthly_watch_time || 0,
    pendingPayoutBalance: profile.pending_payout_balance || 0,
    lifetimeEarnings: profile.lifetime_earnings || 0,
    bio: profile.bio,
    isCreator: profile.is_creator,
    firstName: profile.first_name,
    lastName: profile.last_name,
    paypalEmail: profile.paypal_email,
    country: profile.country,
    state: profile.state,
    city: profile.city,
    dob: profile.dob
});

const uploadFile = async (file: File, bucket: string, path: string) => {
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
};

export const api = {
    // Auth
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
    signIn: async (e: string, p: string) => { 
        return supabase.auth.signInWithPassword({ email: e, password: p });
    },
    signUp: async (e: string, p: string, u: string, d?: any) => { 
        const { data, error } = await supabase.auth.signUp({ 
            email: e, 
            password: p, 
            options: { 
                data: { 
                    username: u, 
                    first_name: d?.firstName,
                    last_name: d?.lastName,
                    ...d 
                } 
            } 
        });
        return { data, error };
    },
    signOut: async () => {
        await supabase.auth.signOut();
    },
    resetPassword: async (email: string) => {
        await supabase.auth.resetPasswordForEmail(email);
    },

    // Content
    getVideos: async (): Promise<Video[]> => {
        const { data, error } = await supabase
            .from('videos')
            .select('*, profiles:creator_id(username, avatar_url)')
            .order('created_at', { ascending: false });
        
        if (error) { console.error("Error fetching videos:", error); return []; }

        return data.map((v: any) => ({
            id: v.id,
            url: v.url,
            thumbnailUrl: v.thumbnail_url || '',
            creatorId: v.creator_id,
            creatorName: v.profiles?.username || 'Unknown',
            creatorAvatar: v.profiles?.avatar_url || '',
            description: v.description || '',
            tags: v.tags || [],
            likes: v.likes || 0,
            comments: v.comments_count || 0,
            shares: v.shares_count || 0,
            isLocked: v.is_locked || false,
            unlockCost: v.unlock_cost || 0,
            seriesId: v.series_id,
            seriesTitle: v.series_title || '',
            episodeNumber: v.episode_number || 1,
            timestamp: v.created_at,
            views: v.views || 0,
            isAd: v.is_ad || false,
            adActionLabel: v.ad_action_label,
            adDestinationUrl: v.ad_destination_url
        }));
    },
    getSeries: async (cat?: string): Promise<Series[]> => {
        let query = supabase.from('series').select('*');
        if (cat && cat !== 'All') query = query.eq('category', cat);
        
        const { data, error } = await query;
        if (error) return [];

        return data.map((s: any) => ({
            id: s.id,
            title: s.title,
            description: s.description,
            coverUrl: s.cover_url,
            creatorId: s.creator_id,
            category: s.category,
            year: s.year || new Date().getFullYear(),
            totalEpisodes: s.total_episodes || 0
        }));
    },
    getVideoStats: async (id: string) => {
        const { data, error } = await supabase.from('videos').select('likes, comments_count').eq('id', id).single();
        if (error) return { likes: 0, comments: 0 };
        return { likes: data.likes, comments: data.comments_count };
    },
    incrementVideoView: async (id: string) => {
        try {
            await supabase.rpc('increment_view_count', { target_id: id, table_name: 'videos' });
        } catch (e) { console.error("View increment failed", e); }
    },
    likeVideo: async (id: string) => {
        try {
            await supabase.rpc('increment_like_count', { target_id: id, table_name: 'videos' });
        } catch (e) { console.error("Like failed", e); }
    },
    
    // Comments
    getComments: async (id: string, type: 'video' | 'post'): Promise<Comment[]> => {
        const column = type === 'video' ? 'video_id' : 'post_id';
        const { data, error } = await supabase
            .from('comments')
            .select('*, profiles:user_id(username, avatar_url)')
            .eq(column, id)
            .order('created_at', { ascending: true });

        if (error) return [];
        return data.map((c: any) => ({
            id: c.id,
            userId: c.user_id,
            username: c.profiles?.username || 'User',
            avatarUrl: c.profiles?.avatar_url || '',
            text: c.text,
            timestamp: new Date(c.created_at).getTime()
        }));
    },
    postComment: async (userId: string, contentId: string, text: string, type: 'video' | 'post') => {
        const column = type === 'video' ? 'video_id' : 'post_id';
        const { error } = await supabase.from('comments').insert({
            user_id: userId,
            [column]: contentId,
            text
        });
        if (error) throw error;
    },

    // Social
    toggleFollow: async (followerId: string, followingId: string) => {
        const { data: user } = await supabase.from('profiles').select('following').eq('id', followerId).single();
        if (!user) return false;
        
        let following = user.following || [];
        const exists = following.includes(followingId);
        
        if (exists) {
            following = following.filter((id: string) => id !== followingId);
            await supabase.rpc('decrement_follower_count', { profile_id: followingId });
        } else {
            following.push(followingId);
            await supabase.rpc('increment_follower_count', { profile_id: followingId });
        }

        await supabase.from('profiles').update({ following }).eq('id', followerId);
        return !exists;
    },
    getSocialPosts: async (): Promise<SocialPost[]> => {
        const { data, error } = await supabase
            .from('posts')
            .select('*, profiles:user_id(username, avatar_url)')
            .order('created_at', { ascending: false });

        if (error) return [];
        
        return data.map((p: any) => ({
            id: p.id,
            userId: p.user_id,
            username: p.profiles?.username || 'Unknown',
            avatarUrl: p.profiles?.avatar_url || '',
            content: p.content,
            mediaUrl: p.media_url,
            mediaType: p.media_type || 'text',
            likes: p.likes || 0,
            comments: p.comments_count || 0,
            views: p.views || 0,
            timestamp: new Date(p.created_at).toLocaleDateString()
        }));
    },
    deleteSocialPost: async (id: string) => {
        await supabase.from('posts').delete().eq('id', id);
    },
    getStories: async (): Promise<Story[]> => {
        const { data, error } = await supabase
            .from('stories')
            .select('*, profiles:user_id(username, avatar_url)')
            .order('created_at', { ascending: false });

        if (error) return [];

        return data.map((s: any) => ({
            id: s.id,
            userId: s.user_id,
            username: s.profiles?.username || 'Unknown',
            avatarUrl: s.profiles?.avatar_url || '',
            isViewed: false,
            timestamp: new Date(s.created_at).getTime(),
            privacy: s.privacy || 'public',
            segments: s.segments_json ? JSON.parse(s.segments_json) : [],
            views: s.views || 0
        }));
    },
    uploadStory: async (file: File, userId: string, type: string, segments: any[]) => {
        if (file.size > 0) {
             const url = await uploadFile(file, 'stories', `${userId}/${Date.now()}_${file.name}`);
             segments = [{ id: Date.now().toString(), mediaUrl: url, type: type as any, duration: 5 }];
        }

        const { error } = await supabase.from('stories').insert({
            user_id: userId,
            segments_json: JSON.stringify(segments),
            privacy: 'public'
        });
        if (error) throw error;
    },
    reactToStory: async (storyId: string, reaction: any, ownerId: string) => {
        // Mock logic (No reactions table in schema)
        console.log("Reacted to story", reaction);
    },

    // Creator
    uploadVideo: async (file: File, thumb: File | null, userId: string, title: string, isLocked: boolean, genre: string, seriesInfo?: any) => {
        const videoUrl = await uploadFile(file, 'videos', `${userId}/${Date.now()}_${file.name}`);
        let thumbUrl = '';
        if (thumb) {
            thumbUrl = await uploadFile(thumb, 'images', `${userId}/${Date.now()}_thumb_${thumb.name}`);
        }

        const { error } = await supabase.from('videos').insert({
            url: videoUrl,
            thumbnail_url: thumbUrl,
            creator_id: userId,
            description: title,
            is_locked: isLocked,
            tags: [genre],
            series_id: seriesInfo?.id,
            series_title: seriesInfo?.title,
            episode_number: seriesInfo?.episodeNumber
        });
        if (error) throw error;
    },
    createSeries: async (cover: File | null, userId: string, title: string, desc: string, category: string) => {
        let coverUrl = '';
        if (cover) {
            coverUrl = await uploadFile(cover, 'images', `${userId}/series_${Date.now()}_${cover.name}`);
        }
        const { error } = await supabase.from('series').insert({
            title,
            description: desc,
            cover_url: coverUrl,
            creator_id: userId,
            category
        });
        if (error) throw error;
    },
    getUserSeries: async (userId: string): Promise<Series[]> => {
        const { data, error } = await supabase.from('series').select('*').eq('creator_id', userId);
        if (error) return [];
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
    deleteVideo: async (id: string) => {
        await supabase.from('videos').delete().eq('id', id);
    },
    updateProfile: async (userId: string, data: Partial<User>) => {
        const dbData: any = { ...data };
        
        // Map camelCase to snake_case for DB
        if (data.walletBalance !== undefined) dbData.wallet_balance = data.walletBalance;
        if (data.unlockedVideoIds !== undefined) dbData.unlocked_video_ids = data.unlockedVideoIds;
        if (data.firstName !== undefined) dbData.first_name = data.firstName;
        if (data.lastName !== undefined) dbData.last_name = data.lastName;
        if (data.paypalEmail !== undefined) dbData.paypal_email = data.paypalEmail;
        if (data.isDriver !== undefined) dbData.is_driver = data.isDriver;
        if (data.driverStatus !== undefined) dbData.driver_status = data.driverStatus;
        if (data.onlineStatus !== undefined) dbData.online_status = data.onlineStatus;
        if (data.avatarUrl !== undefined) dbData.avatar_url = data.avatarUrl;

        await supabase.from('profiles').update(dbData).eq('id', userId);
    },

    // Placeholders for features without Schema support
    getConversations: async (userId: string): Promise<Conversation[]> => [],
    getMessages: async (userId: string, partnerId: string): Promise<Message[]> => [],
    sendMessage: async (senderId: string, receiverId: string, content: string) => {},
    requestPayout: async (userId: string, amount: number, method: string) => {
        const { data } = await supabase.from('profiles').select('pending_payout_balance').eq('id', userId).single();
        const current = data?.pending_payout_balance || 0;
        await supabase.from('profiles').update({ pending_payout_balance: Math.max(0, current - amount) }).eq('id', userId);
    },
    getAICharacters: async (): Promise<AICharacter[]> => [],
    getMusicTracks: async (): Promise<MusicTrack[]> => [],
    uploadMusicTrack: async (audioFile: File, coverFile: File | null, title: string, artist: string, duration: string, userId: string) => {
        // Mock implementation to satisfy type checking and demonstrate usage
    },
    getRideStatus: async (rideId: string): Promise<RideRequest> => ({ 
        id: rideId, passengerId: 'u1', passengerName: 'Me', passengerAvatar: '', 
        pickupAddress: 'A', destinationAddress: 'B', fare: 10, distance: '1km', 
        status: 'ARRIVED', timestamp: Date.now() 
    }),
    requestRide: async (req: Partial<RideRequest>) => ({ 
        ...req, id: 'ride_1', status: 'SEARCHING' as RideStatus, timestamp: Date.now() 
    } as RideRequest),
};