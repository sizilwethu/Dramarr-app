
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
  // New Personal Info Fields
  firstName?: string;
  lastName?: string;
  dob?: string;
  gender?: string;
  country?: string;
  address?: string;
  // Subscription
  subscriptionStatus?: 'free' | 'premium';
  subscriptionRenewsAt?: number;
  // Daily Limits
  dailyPremiumUnlockCount: number;
  lastPremiumUnlockDate: string; // Format: "Mon Jan 01 2024"
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
  // Ad Props
  isAd?: boolean;
  adActionLabel?: string;
  adDestinationUrl?: string;
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
  views?: number; // Added View Count
  // Ad Props
  isAd?: boolean;
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
  views?: number; // Added View Count
  timestamp: string;
  // Ad Props
  isAd?: boolean;
  adActionLabel?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  isRead: boolean;
}

export interface Notification {
  id: string;
  type: 'like' | 'follow' | 'comment' | 'system' | 'payout';
  message: string;
  relatedUserId?: string;
  read: boolean;
  timestamp: number;
}

export interface Comment {
    id: string;
    userId: string;
    username: string;
    avatarUrl: string;
    text: string;
    timestamp: number;
    replies?: Comment[]; // Nested replies
}

export interface AdCampaign {
    id: string;
    userId: string;
    imageUrl: string;
    title: string;
    budget: number; // $25
    impressions: number;
    clicks: number;
    status: 'active' | 'expired';
}

export interface AnalyticsData {
    totalViews: number;
    totalLikes: number;
    revenue: number;
    videoPerformance: { title: string, views: number }[];
}

export enum TabView {
  AUTH = 'AUTH',
  FEED = 'FEED',
  SOCIAL = 'SOCIAL',
  EXPLORE = 'EXPLORE',
  UPLOAD = 'UPLOAD',
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN',
  DAILY_REWARD = 'DAILY_REWARD'
}

export const CATEGORIES = ['Romance', 'Thriller', 'CEO', 'Fantasy', 'Comedy', 'Revenge'];
