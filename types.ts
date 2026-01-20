

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  isVerified: boolean;
  isCreator: boolean;
  isAdmin: boolean;
  coins: number;
  credits: number;
  following: string[];
  followers: number;
  unlockedVideoIds: string[];
  paypalEmail?: string;
  joinDate: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  gender?: string;
  country?: string;
  address?: string;
  subscriptionStatus?: 'free' | 'premium';
  subscriptionRenewsAt?: number;
  dailyPremiumUnlockCount: number;
  lastPremiumUnlockDate: string;
  rank?: number;
  points?: number;
}

export interface VideoChoice {
    label: string;
    targetVideoId: string;
}

export interface Gift {
    id: string;
    name: string;
    icon: string;
    cost: number;
}

export interface Video {
  id: string;
  url: string;
  thumbnailUrl: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  description: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  isLocked: boolean;
  unlockCost: number;
  seriesId?: string;
  seriesTitle?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  timestamp: string;
  views?: number;
  isAd?: boolean;
  adActionLabel?: string;
  adDestinationUrl?: string;
  choices?: VideoChoice[];
  isPremiere?: boolean;
  premiereTime?: number;
  dramaScore?: number;
}

export interface AICharacter {
    id: string;
    name: string;
    seriesId: string;
    avatarUrl: string;
    description: string;
    personality: string;
}

export interface TheoryPost extends SocialPost {
    isTheory: true;
    truthScore: number;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  creatorId: string;
  category: string;
  year: number;
  totalEpisodes: number;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  mediaUrl: string;
  type: 'image' | 'video';
  isViewed: boolean;
  timestamp: number;
  views?: number;
  isAd?: boolean;
}

export interface PlotPoll {
    id: string;
    question: string;
    options: { label: string; votes: number }[];
    totalVotes: number;
}

export interface SocialPost {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  views?: number;
  timestamp: string;
  isAd?: boolean;
  adActionLabel?: string;
  isTheory?: boolean;
  poll?: PlotPoll;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  isAI?: boolean;
}

export interface Conversation {
    partnerId: string;
    username: string;
    avatarUrl: string;
    lastMessage: string;
    timestamp: number;
    unreadCount: number;
    isAI?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  text: string;
  timestamp: number;
  parentId?: string;
  replies?: Comment[];
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  timestamp: number;
  relatedUserId?: string;
}

export interface CommunityMood {
    label: string;
    percentage: number;
    color: string;
}

// Fixed: TabView changed to enum for value usage and added missing interfaces
export enum TabView {
  AUTH = 'AUTH',
  FEED = 'FEED',
  SOCIAL = 'SOCIAL',
  EXPLORE = 'EXPLORE',
  MUSIC = 'MUSIC',
  UPLOAD = 'UPLOAD',
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN',
  DAILY_REWARD = 'DAILY_REWARD',
  AD_CENTER = 'AD_CENTER',
  CHARACTER_CHAT = 'CHARACTER_CHAT'
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  duration: string;
  uploaderId?: string;
}

export interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  revenue: number;
  videoPerformance: { title: string; views: number }[];
}

export interface AdCampaign {
  id: string;
  userId: string;
  title: string;
  imageUrl: string;
  budget: number;
  impressions: number;
  clicks: number;
  status: 'active' | 'expired' | 'pending';
}

export const CATEGORIES = ['Romance', 'Thriller', 'CEO', 'Fantasy', 'Comedy', 'Revenge'];

export const VIRTUAL_GIFTS: Gift[] = [
    { id: 'g1', name: 'Golden Rose', icon: '🌹', cost: 10 },
    { id: 'g2', name: 'Script Award', icon: '📜', cost: 50 },
    { id: 'g3', name: 'Director Chair', icon: '💺', cost: 100 },
    { id: 'g4', name: 'Hollywood Star', icon: '⭐', cost: 500 },
];