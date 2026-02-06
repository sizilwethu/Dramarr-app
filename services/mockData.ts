
import { SocialPost, Story, Conversation, Message, Video, Series, AICharacter, MusicTrack } from '../types';

export const MOCK_VIDEOS: Video[] = [
    {
        id: 'v1',
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=700&fit=crop',
        creatorId: 'u1',
        creatorName: 'ceo_rebellion',
        creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ceo',
        description: 'The moment he realized his secretary was the billionaire heiress... 💎 #CEO #Drama #SecretIdentity',
        tags: ['CEO', 'Romance', 'Billionaire'],
        likes: 15400,
        comments: 892,
        shares: 2300,
        isLocked: false,
        unlockCost: 0,
        seriesTitle: 'The Undercover Mogul',
        episodeNumber: 1,
        timestamp: '2023-12-01',
        views: 45000
    },
    {
        id: 'v2',
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400&h=700&fit=crop',
        creatorId: 'u2',
        creatorName: 'mystery_queen',
        creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mystery',
        description: 'She came back for revenge, but found a secret she never expected. 🕵️‍♀️💥',
        tags: ['Revenge', 'Mystery', 'Thriller'],
        likes: 22100,
        comments: 1205,
        shares: 4500,
        isLocked: true,
        unlockCost: 5,
        seriesTitle: 'Shadow of Betrayal',
        episodeNumber: 5,
        timestamp: '2023-12-05',
        views: 89000
    }
];

export const MOCK_SERIES: Series[] = [
    {
        id: 'ser1',
        title: 'The Undercover Mogul',
        description: 'A billionaire lives as a delivery driver to find true love.',
        coverUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=600&fit=crop',
        creatorId: 'u1',
        category: 'CEO',
        year: 2023,
        totalEpisodes: 24
    },
    {
        id: 'ser2',
        title: 'Shadow of Betrayal',
        description: 'An elite spy is framed by her own agency.',
        coverUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
        creatorId: 'u2',
        category: 'Action',
        year: 2024,
        totalEpisodes: 12
    }
];

export const MOCK_CHARACTERS: AICharacter[] = [
    {
        id: 'char1',
        name: 'Elena Vance',
        seriesId: 'ser2',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena',
        description: 'A cold, calculated former operative seeking justice.',
        personality: 'Stoic, brilliant, and occasionally witty.'
    },
    {
        id: 'char2',
        name: 'Marcus Thorne',
        seriesId: 'ser1',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
        description: 'The billionaire hiding in plain sight.',
        personality: 'Charming, humble, but commandingly intelligent.'
    }
];

export const MOCK_POSTS: SocialPost[] = [
    {
        id: 'p_pinned',
        userId: 'admin',
        username: 'dramarr_official',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        content: '🎉 Welcome to the new social feed! You can now share Scenes, Photos, and more. Check the pinned guidelines.',
        mediaType: 'text',
        isPinned: true,
        likes: 5400,
        comments: 230,
        timestamp: '1h ago'
    },
    {
        id: 'p1',
        userId: 'u1',
        username: 'ceo_rebellion',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ceo',
        content: 'Behind the scenes: The boardroom set construction! 🏗️ We built this in 3 days.',
        mediaUrls: [
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
            'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80',
            'https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=800&q=80'
        ],
        mediaType: 'carousel',
        likes: 1240,
        comments: 85,
        timestamp: '2h ago'
    },
    {
        id: 'p_scene_1',
        userId: 'u2',
        username: 'mystery_queen',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mystery',
        content: 'Exclusive sneak peek at Episode 5! The betrayal runs deep... 🗡️ #Scene #Drama',
        mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        mediaType: 'scene',
        likes: 3400,
        comments: 420,
        timestamp: '3h ago',
        views: 15000
    },
    {
        id: 'p_link_1',
        userId: 'u3',
        username: 'tech_props_inc',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech',
        content: 'Need futuristic props for your next sci-fi drama? Check out our new catalog.',
        mediaType: 'link',
        linkData: {
            url: 'https://example.com/props',
            title: '2025 Prop Catalog - Cyberpunk Edition',
            description: 'High quality resin prints and LED integrated props for film.',
            imageUrl: 'https://images.unsplash.com/photo-1535378437323-9555f3e7f5bb?w=800&q=80',
            domain: 'prop-shop.com'
        },
        likes: 45,
        comments: 2,
        timestamp: '5h ago'
    },
    {
        id: 'p_ad_1',
        userId: 'brand_x',
        username: 'Lumina Skin',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
        content: 'Get camera-ready skin with our new Glow Serum. Used by top drama stars.',
        mediaUrl: 'https://images.unsplash.com/photo-1556228720-1957be83f740?w=800&q=80',
        mediaType: 'image',
        isAd: true,
        adActionLabel: 'Shop Now',
        adTargetUrl: 'https://lumina.com',
        likes: 200,
        comments: 10,
        timestamp: 'Sponsored'
    },
    {
        id: 'p_text_1',
        userId: 'u4',
        username: 'screenwriter_joe',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joe',
        content: 'Unpopular opinion: The "amnesia" trope is actually great if the character remembers the WRONG life instead of nothing at all. Thoughts? 🤔',
        mediaType: 'text',
        likes: 890,
        comments: 342,
        timestamp: '6h ago'
    }
];

export const MOCK_STORIES: Story[] = [
    {
        id: 's1',
        userId: 'u1',
        username: 'alex_prod',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
        isViewed: false,
        timestamp: Date.now() - 3600000,
        privacy: 'public',
        segments: [
            { id: 'seg1', mediaUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=700&fit=crop', type: 'image', duration: 5 }
        ]
    },
    {
        id: 's2',
        userId: 'u4',
        username: 'sarah_films',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        isViewed: false,
        timestamp: Date.now() - 7200000,
        privacy: 'public',
        segments: [
            { id: 'seg2', mediaUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=700&fit=crop', type: 'image', duration: 5 }
        ]
    },
    {
        id: 's3',
        userId: 'u5',
        username: 'dramatic_leo',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leo',
        isViewed: true,
        timestamp: Date.now() - 14400000,
        privacy: 'public',
        segments: [
            { id: 'seg3', mediaUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=700&fit=crop', type: 'image', duration: 5 }
        ]
    }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        partnerId: 'u1',
        username: 'ceo_rebellion',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ceo',
        lastMessage: 'The script for the next episode is ready!',
        timestamp: Date.now() - 120000,
        unreadCount: 2
    },
    {
        partnerId: 'u2',
        username: 'mystery_queen',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mystery',
        lastMessage: 'Did you see the latest numbers?',
        timestamp: Date.now() - 3600000,
        unreadCount: 0
    },
    {
        partnerId: 'u3',
        username: 'urban_sketches',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=urban',
        lastMessage: 'Thanks for the ride!',
        timestamp: Date.now() - 86400000,
        unreadCount: 0
    }
];

export const MOCK_CHAT_MESSAGES: Message[] = [
    { id: 'm1', senderId: 'u1', receiverId: 'me', content: 'Hey, I saw your latest drama post!', timestamp: Date.now() - 600000, isRead: true },
    { id: 'm2', senderId: 'me', receiverId: 'u1', content: 'Thanks! We worked hard on that scene.', timestamp: Date.now() - 300000, isRead: true },
    { id: 'm3', senderId: 'u1', receiverId: 'me', content: 'The script for the next episode is ready!', timestamp: Date.now() - 120000, isRead: false }
];

export const MOCK_MUSIC: MusicTrack[] = [
    {
        id: 'm1',
        title: 'Neon Nights',
        artist: 'SynthWave Collective',
        coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: '3:45'
    },
    {
        id: 'm2',
        title: 'Dramatic Entrance',
        artist: 'Cinematic Scores',
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        duration: '2:15'
    }
];
