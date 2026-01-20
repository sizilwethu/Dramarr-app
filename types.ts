
export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  isVerified: boolean;
  isAdmin: boolean;
  walletBalance: number;
  // Driver Fields
  isDriver: boolean;
  driverStatus: 'pending' | 'verified' | 'rejected' | 'none';
  onlineStatus: 'online' | 'offline';
  driverRating: number;
  vehicle?: VehicleInfo;
  documents?: DriverDocuments;
  // Drama App Fields
  bio?: string;
  isCreator?: boolean;
  coins?: number;
  credits?: number;
  following: string[];
  followers: number;
  unlockedVideoIds: string[];
  paypalEmail?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  gender?: string;
  address?: string;
  subscriptionStatus?: string;
  joinDate: string;
  country?: string;
  // New fields for settings and rewards
  dailyPremiumUnlockCount?: number;
  lastPremiumUnlockDate?: string;
  autoClearCache?: boolean;
  accessibilityCaptions?: boolean;
  highContrastMode?: boolean;
  hapticFeedbackStrength?: string;
  highDefinitionPlayback?: boolean;
  dataSaverMode?: boolean;
  aiMemoryEnabled?: boolean;
  screenTimeLimit?: number;
}

export interface VehicleInfo {
  model: string;
  plate: string;
  color: string;
  type: 'Economy' | 'Elite' | 'Van';
}

export interface DriverDocuments {
  licenseUrl: string;
  idCardUrl: string;
  vehicleRegUrl: string;
}

// Added 'REQUESTING' to RideStatus
export type RideStatus = 'IDLE' | 'SEARCHING' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED' | 'REQUESTING';

export interface RideRequest {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerAvatar: string;
  pickupAddress: string;
  destinationAddress: string;
  fare: number;
  distance: string;
  status: RideStatus;
  driverId?: string;
  driverName?: string;
  driverAvatar?: string;
  driverPhone?: string;
  vehicleInfo?: VehicleInfo;
  timestamp: number;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  timestamp: number;
}

export enum TabView {
  AUTH = 'AUTH',
  FEED = 'FEED',
  SOCIAL = 'SOCIAL',
  EXPLORE = 'EXPLORE',
  MUSIC = 'MUSIC',
  UPLOAD = 'UPLOAD',
  PROFILE = 'PROFILE',
  RIDES = 'RIDES',
  WALLET = 'WALLET',
  ADMIN = 'ADMIN',
  CHARACTER_CHAT = 'CHARACTER_CHAT'
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
  seriesTitle: string;
  episodeNumber: number;
  timestamp: string;
  views: number;
  isAd?: boolean;
  adActionLabel?: string;
  adDestinationUrl?: string;
  choices?: { label: string; targetVideoId: string }[];
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
  isAd?: boolean;
  views?: number; // Added views field
}

export interface SocialPost {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  content: string;
  imageUrl?: string | null;
  likes: number;
  comments: number;
  timestamp: string;
  isAd?: boolean;
  views?: number;
  adActionLabel?: string; // Added adActionLabel to SocialPost
}

export interface AICharacter {
  id: string;
  name: string;
  seriesId: string;
  avatarUrl: string;
  description: string;
  personality: string;
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

export interface CommunityMood {
  label: string;
  percentage: number;
  color: string;
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
}

export interface Gift {
  id: string;
  name: string;
  icon: string;
  cost: number;
}

// Added missing interfaces
export interface Notification {
  id: string;
  type: 'system' | 'like' | 'comment' | 'follow';
  message: string;
  read: boolean;
  timestamp: number;
  relatedUserId?: string;
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
  status: 'active' | 'expired';
}

export const VIRTUAL_GIFTS: Gift[] = [
  { id: 'g1', name: 'Rose', icon: '🌹', cost: 1 },
  { id: 'g2', name: 'Coffee', icon: '☕', cost: 5 },
  { id: 'g3', name: 'Diamond', icon: '💎', cost: 50 },
];

// Added CATEGORIES constant
export const CATEGORIES = ['CEO', 'Revenge', 'Romance', 'Fantasy', 'Horror', 'Action'];
