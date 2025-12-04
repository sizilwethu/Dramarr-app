
import { User, Video, Series, Story, SocialPost, Message, Notification, Comment, AnalyticsData } from '../types';

export const CURRENT_USER: User = {
  id: 'u1',
  username: 'drama_fan_99',
  email: 'user@dramarr.app',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
  bio: 'Addicted to plot twists 🌀',
  isVerified: false,
  isCreator: true,
  isAdmin: false,
  coins: 120,
  credits: 5,
  following: ['u2', 'u3'],
  followers: 450,
  unlockedVideoIds: ['v1', 'v3'],
  paypalEmail: 'user@example.com',
  joinDate: '2023-10-15',
  // New Fields
  firstName: 'Sarah',
  lastName: 'Jenkins',
  dob: '1998-05-12',
  gender: 'female',
  country: 'USA',
  address: '123 Drama Lane, Hollywood, CA',
  subscriptionStatus: 'free',
  // Daily Limits
  dailyPremiumUnlockCount: 0,
  lastPremiumUnlockDate: new Date().toDateString()
};

export const MOCK_SERIES: Series[] = [
  {
    id: 's1',
    title: 'The CEO\'s Secret Wife',
    description: 'She was just a janitor, until he realized who she really was...',
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    creatorId: 'u2',
    category: 'CEO',
    year: 2024,
    totalEpisodes: 50
  },
  {
    id: 's2',
    title: 'Midnight Revenge',
    description: 'They took everything from him. Now he is back.',
    coverUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop',
    creatorId: 'u3',
    category: 'Revenge',
    year: 2023,
    totalEpisodes: 24
  },
  {
    id: 's3',
    title: 'Love in the Bakery',
    description: 'Sweet treats and even sweeter romance.',
    coverUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=600&fit=crop',
    creatorId: 'u5',
    category: 'Romance',
    year: 2024,
    totalEpisodes: 12
  },
  {
    id: 's4',
    title: 'Dragon\'s Heir',
    description: 'In a world of magic, one boy discovers his destiny.',
    coverUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84965d?w=400&h=600&fit=crop',
    creatorId: 'u6',
    category: 'Fantasy',
    year: 2023,
    totalEpisodes: 60
  }
];

export const MOCK_VIDEOS: Video[] = [
  {
    id: 'v1',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=800&fit=crop',
    creatorId: 'u2',
    creatorName: 'DramaBox Official',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    description: "EP1: The meeting that changed everything 😱 #romance #ceo",
    tags: ['drama', 'romance'],
    likes: 45200,
    comments: 1204,
    shares: 5030,
    isLocked: false,
    unlockCost: 0,
    seriesId: 's1',
    seriesTitle: "The CEO's Secret Wife",
    episodeNumber: 1,
    timestamp: '2h ago',
    views: 150000
  },
  {
    id: 'v2',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&h=800&fit=crop',
    creatorId: 'u2',
    creatorName: 'DramaBox Official',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    description: "EP2: She didn't know he was the owner! 💍",
    tags: ['romance', 'wedding'],
    likes: 32000,
    comments: 890,
    shares: 2100,
    isLocked: true,
    unlockCost: 2,
    seriesId: 's1',
    seriesTitle: "The CEO's Secret Wife",
    episodeNumber: 2,
    timestamp: '2h ago',
    views: 89000
  },
  {
    id: 'v3',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=800&fit=crop',
    creatorId: 'u3',
    creatorName: 'ThrillerShorts',
    creatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    description: "Don't look behind you... 👻 #horror",
    tags: ['horror', 'thriller'],
    likes: 15000,
    comments: 330,
    shares: 120,
    isLocked: false,
    unlockCost: 0,
    seriesId: 's2',
    seriesTitle: 'Midnight Revenge',
    episodeNumber: 1,
    timestamp: '5h ago',
    views: 45000
  },
   {
    id: 'v4',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=800&fit=crop',
    creatorId: 'u3',
    creatorName: 'ThrillerShorts',
    creatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    description: "EP2: The plan begins. 🗡️",
    tags: ['revenge', 'action'],
    likes: 12000,
    comments: 200,
    shares: 100,
    isLocked: true,
    unlockCost: 5,
    seriesId: 's2',
    seriesTitle: 'Midnight Revenge',
    episodeNumber: 2,
    timestamp: '5h ago',
    views: 32000
  }
];

// --- MOCK VIDEO ADS ---
export const MOCK_VIDEO_ADS: Video[] = [
    {
        id: 'ad_v1',
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=800&fit=crop',
        creatorId: 'ad_sponsor',
        creatorName: 'Brand Sponsor',
        creatorAvatar: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&h=100&fit=crop',
        description: "Experience the speed. Drive the future. 🚗💨 #fast #cars",
        tags: ['sponsored', 'ad'],
        likes: 500,
        comments: 0,
        shares: 0,
        isLocked: false,
        unlockCost: 0,
        timestamp: 'Sponsored',
        isAd: true,
        adActionLabel: 'Test Drive',
        adDestinationUrl: 'https://example.com'
    }
];

export const MOCK_STORIES: Story[] = [
  {
    id: 'st1',
    userId: 'u2',
    username: 'DramaBox',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    mediaUrl: 'https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?w=400&h=800&fit=crop',
    type: 'image',
    isViewed: false,
    timestamp: Date.now() - 3600000
  },
  {
    id: 'st2',
    userId: 'u3',
    username: 'ThrillerShorts',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    mediaUrl: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=400&h=800&fit=crop',
    type: 'image',
    isViewed: true,
    timestamp: Date.now() - 7200000
  },
  {
    id: 'st_ad1',
    userId: 'sponsor_1',
    username: 'Fashion Nova',
    avatarUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=100&h=100&fit=crop',
    mediaUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=800&fit=crop',
    type: 'image',
    isViewed: false,
    timestamp: Date.now(),
    isAd: true
  }
];

export const MOCK_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'sp1',
    userId: 'u2',
    username: 'DramaBox Official',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    content: 'Behind the scenes of our new hit series "The CEO\'s Secret Wife"! Casting was intense. 🎬✨',
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=500&fit=crop',
    likes: 1240,
    comments: 89,
    timestamp: '30m ago'
  },
  {
    id: 'sp2',
    userId: 'u4',
    username: 'Jenna_Producer',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    content: 'Just finished editing the season finale. You guys are NOT ready for this cliffhanger. 🤯',
    likes: 560,
    comments: 120,
    timestamp: '2h ago'
  },
  {
      id: 'sp_ad1',
      userId: 'sponsor_coke',
      username: 'Refreshing Drink Co.',
      avatarUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=100&h=100&fit=crop',
      content: 'Thirsty while watching drama? Grab a cold one. 🥤 #refresh #ad',
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&h=500&fit=crop',
      likes: 200,
      comments: 5,
      timestamp: 'Sponsored',
      isAd: true,
      adActionLabel: 'Buy Now'
  }
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    senderId: 'u2',
    receiverId: 'u1',
    content: 'Hey! Thanks for watching our new series!',
    timestamp: Date.now() - 100000,
    isRead: false
  },
  {
    id: 'm2',
    senderId: 'u3',
    receiverId: 'u1',
    content: 'New horror episode drops tonight at 8PM.',
    timestamp: Date.now() - 500000,
    isRead: true
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'system', message: 'Welcome to dramarr! Here are 5 free credits.', read: false, timestamp: Date.now() },
  { id: 'n2', type: 'like', message: 'DramaBox liked your comment', relatedUserId: 'u2', read: true, timestamp: Date.now() - 10000 }
];

export const MOCK_COMMENTS: Comment[] = [
    { id: 'c1', userId: 'u3', username: 'ThrillerShorts', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', text: 'This looks amazing! 🔥', timestamp: Date.now() - 10000 },
    { id: 'c2', userId: 'u4', username: 'Jenna_Producer', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', text: 'Can\'t wait for the next ep!', timestamp: Date.now() - 50000 }
];

export const MOCK_ANALYTICS: AnalyticsData = {
    totalViews: 450000,
    totalLikes: 35000,
    revenue: 1450.50,
    videoPerformance: [
        { title: "The CEO's Wife Ep1", views: 150000 },
        { title: "The CEO's Wife Ep2", views: 89000 },
        { title: "Midnight Revenge Ep1", views: 45000 },
    ]
};
