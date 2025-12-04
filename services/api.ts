
import { supabase } from '../lib/supabaseClient';
import { User, Video, Series, Story, SocialPost, Comment } from '../types';

// --- MAPPERS ---

const mapProfileToUser = (profile: any, email?: string): User => ({
  id: profile.id,
  username: profile.username || 'User',
  email: email || '',
  avatarUrl: profile.avatar_url || 'https://via.placeholder.com/150',
  bio: profile.bio || '',
  isVerified: profile.is_verified || false,
  isCreator: profile.is_creator || false,
  isAdmin: false,
  coins: profile.coins || 0,
  credits: profile.credits || 0,
  following: profile.following || [],
  followers: profile.followers || 0,
  unlockedVideoIds: profile.unlocked_video_ids || [],
  joinDate: profile.created_at || new Date().toISOString(),
  subscriptionStatus: profile.subscription_status || 'free',
  dailyPremiumUnlockCount: profile.daily_premium_unlock_count || 0,
  lastPremiumUnlockDate: profile.last_premium_unlock_date || new Date().toDateString(),
  // Personal Info Mapping
  firstName: profile.first_name || '',
  lastName: profile.last_name || '',
  dob: profile.dob || '',
  gender: profile.gender || '',
  country: profile.country || '',
  address: profile.address || ''
});

const mapDbVideoToVideo = (vid: any, creatorProfile: any): Video => ({
    id: vid.id,
    url: vid.url,
    thumbnailUrl: vid.thumbnail_url || 'https://via.placeholder.com/400x600',
    creatorId: vid.creator_id,
    creatorName: creatorProfile?.username || 'Unknown',
    creatorAvatar: creatorProfile?.avatar_url || 'https://via.placeholder.com/150',
    description: vid.description || '',
    tags: [],
    likes: vid.likes || 0,
    comments: 0,
    shares: 0,
    isLocked: vid.is_locked || false,
    unlockCost: vid.unlock_cost || 0,
    seriesTitle: vid.series_title,
    episodeNumber: vid.episode_number,
    timestamp: new Date(vid.created_at).toLocaleDateString(),
    views: vid.views || 0,
    isAd: false
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
                // Add Personal Info
                first_name: additionalData?.firstName || '',
                last_name: additionalData?.lastName || '',
                dob: additionalData?.dob || '',
                gender: additionalData?.gender || '',
                country: additionalData?.country || ''
            });
            if(profileError) console.error("Profile creation error:", JSON.stringify(profileError, null, 2));
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

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (profile) return mapProfileToUser(profile, session.user.email);

        // Fallback/Lazy Create
        const newProfile = {
            id: session.user.id,
            username: session.user.user_metadata?.username || 'User',
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
            credits: 5,
            coins: 100
        };
        await supabase.from('profiles').insert(newProfile);
        return mapProfileToUser(newProfile, session.user.email);
    },

    // --- PROFILE ---
    updateAvatar: async (userId: string, file: File) => {
        const filePath = `${userId}/avatar_${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: urlData.publicUrl })
            .eq('id', userId);
            
        if (updateError) throw updateError;
        return urlData.publicUrl;
    },

    updateProfile: async (userId: string, updates: any) => {
        // Map camelCase to snake_case for DB
        const dbUpdates: any = {};
        if (updates.username) dbUpdates.username = updates.username;
        if (updates.bio) dbUpdates.bio = updates.bio;
        if (updates.firstName) dbUpdates.first_name = updates.firstName;
        if (updates.lastName) dbUpdates.last_name = updates.lastName;
        if (updates.dob) dbUpdates.dob = updates.dob;
        if (updates.gender) dbUpdates.gender = updates.gender;
        if (updates.country) dbUpdates.country = updates.country;
        if (updates.address) dbUpdates.address = updates.address;
        
        const { error } = await supabase
            .from('profiles')
            .update(dbUpdates)
            .eq('id', userId);
        if (error) throw error;
    },

    getUserProfile: async (userId: string): Promise<User | null> => {
         const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
         if(profile) return mapProfileToUser(profile);
         return null;
    },

    // --- VIDEOS ---
    getVideos: async (): Promise<Video[]> => {
        const { data, error } = await supabase
            .from('videos')
            .select(`*, profiles:creator_id (username, avatar_url)`)
            .order('created_at', { ascending: false });

        if (error || !data) return [];
        return data.map((v: any) => mapDbVideoToVideo(v, v.profiles));
    },

    getSeries: async (): Promise<Series[]> => {
        const { data } = await supabase.from('series').select('*');
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
    },

    uploadVideoFile: async (file: File, userId: string) => {
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from('videos').upload(filePath, file);
        if (error) throw error;
        const { data } = supabase.storage.from('videos').getPublicUrl(filePath);
        return data.publicUrl;
    },

    createVideoRecord: async (videoData: Partial<Video>) => {
        const { error } = await supabase.from('videos').insert({
            url: videoData.url,
            thumbnail_url: videoData.thumbnailUrl,
            creator_id: videoData.creatorId,
            description: videoData.description,
            series_title: videoData.seriesTitle,
            episode_number: videoData.episodeNumber,
            is_locked: videoData.isLocked,
            unlock_cost: videoData.unlockCost
        });
        if (error) throw error;
    },

    updateUserWallet: async (userId: string, coins: number, credits: number, unlockedIds: string[]) => {
        const { error } = await supabase.from('profiles')
            .update({ coins, credits, unlocked_video_ids: unlockedIds })
            .eq('id', userId);
        if (error) throw error;
    },

    // --- STORIES ---
    uploadStory: async (file: File, userId: string, type: 'image' | 'video') => {
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/stories/${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from('videos').upload(filePath, file); // Reusing videos bucket for convenience
        if (error) throw error;
        
        const { data } = supabase.storage.from('videos').getPublicUrl(filePath);
        
        const { error: dbError } = await supabase.from('stories').insert({
            user_id: userId,
            media_url: data.publicUrl,
            type: type,
            views: 0
        });
        if (dbError) throw dbError;
    },

    getStories: async (): Promise<Story[]> => {
        // Fetch stories from last 24h
        const yesterday = new Date(Date.now() - 86400000).toISOString();
        const { data, error } = await supabase
            .from('stories')
            .select(`*, profiles:user_id (username, avatar_url)`)
            .gt('created_at', yesterday)
            .order('created_at', { ascending: false });

        if (error || !data) return [];
        
        return data.map((s: any) => ({
            id: s.id,
            userId: s.user_id,
            username: s.profiles?.username || 'Unknown',
            avatarUrl: s.profiles?.avatar_url,
            mediaUrl: s.media_url,
            type: s.type,
            isViewed: false, // In real app, check a 'story_views' table
            timestamp: new Date(s.created_at).getTime(),
            views: s.views || 0
        }));
    },

    incrementStoryView: async (storyId: string) => {
        // Use RPC or simple update. Simple update for prototype:
        // Note: Real apps use a separate table to track *unique* views per user
        const { data } = await supabase.rpc('increment_story_view', { story_id: storyId });
        // Fallback if RPC not exists:
        if (!data) {
             // Fetch current, then update (race condition risk but ok for proto)
             const { data: s } = await supabase.from('stories').select('views').eq('id', storyId).single();
             if(s) {
                 await supabase.from('stories').update({ views: s.views + 1 }).eq('id', storyId);
             }
        }
    },

    // --- SOCIAL POSTS ---
    createSocialPost: async (userId: string, content: string, imageFile?: File) => {
        let imageUrl = null;
        if (imageFile) {
            const filePath = `${userId}/posts/${Date.now()}_${imageFile.name}`;
            const { error: upErr } = await supabase.storage.from('videos').upload(filePath, imageFile);
            if (!upErr) {
                const { data } = supabase.storage.from('videos').getPublicUrl(filePath);
                imageUrl = data.publicUrl;
            }
        }

        const { error } = await supabase.from('posts').insert({
            user_id: userId,
            content,
            image_url: imageUrl,
            views: 0,
            likes: 0
        });
        if (error) throw error;
    },

    getSocialPosts: async (): Promise<SocialPost[]> => {
        const { data, error } = await supabase
            .from('posts')
            .select(`*, profiles:user_id (username, avatar_url)`)
            .order('created_at', { ascending: false });

        if (error || !data) return [];

        return data.map((p: any) => ({
            id: p.id,
            userId: p.user_id,
            username: p.profiles?.username || 'User',
            avatarUrl: p.profiles?.avatar_url,
            content: p.content,
            imageUrl: p.image_url,
            likes: p.likes || 0,
            comments: 0, // Need separate query or count
            views: p.views || 0,
            timestamp: new Date(p.created_at).toLocaleDateString() + ' ' + new Date(p.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }));
    },

    likePost: async (postId: string) => {
         // Simplified like increment
         const { data: p } = await supabase.from('posts').select('likes').eq('id', postId).single();
         if(p) {
             await supabase.from('posts').update({ likes: p.likes + 1 }).eq('id', postId);
         }
    },
    
    // Increment Post View (Call when post appears in feed)
    incrementPostView: async (postId: string) => {
         const { data: p } = await supabase.from('posts').select('views').eq('id', postId).single();
         if(p) {
             await supabase.from('posts').update({ views: p.views + 1 }).eq('id', postId);
         }
    },

    // --- COMMENTS ---
    getComments: async (postId: string): Promise<Comment[]> => {
        const { data, error } = await supabase
            .from('comments')
            .select(`*, profiles:user_id (username, avatar_url)`)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });
        
        if (error || !data) return [];

        const allComments = data.map((c: any) => ({
            id: c.id,
            userId: c.user_id,
            username: c.profiles?.username,
            avatarUrl: c.profiles?.avatar_url,
            text: c.text,
            timestamp: new Date(c.created_at).getTime(),
            parentId: c.parent_id,
            replies: []
        }));

        // Nest replies
        const rootComments: Comment[] = [];
        const commentMap = new Map();
        
        allComments.forEach((c: any) => commentMap.set(c.id, c));

        allComments.forEach((c: any) => {
            if (c.parentId) {
                const parent = commentMap.get(c.parentId);
                if (parent) parent.replies.push(c);
            } else {
                rootComments.push(c);
            }
        });

        return rootComments;
    },

    postComment: async (userId: string, postId: string, text: string, parentId?: string) => {
        const { error } = await supabase.from('comments').insert({
            user_id: userId,
            post_id: postId,
            text,
            parent_id: parentId
        });
        if (error) throw error;
    }
};
