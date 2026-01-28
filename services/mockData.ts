
import { SocialPost, Story, Conversation, Message } from '../types';

export const MOCK_POSTS: SocialPost[] = [
    {
        id: 'p1',
        userId: 'u1',
        username: 'ceo_rebellion',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ceo',
        content: 'Just finished filming the season finale of "The Undercover Mogul". The twist in the boardroom is going to break the internet! 💼🔥 #CEO #Drama #SeasonFinale',
        mediaUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        mediaType: 'image',
        likes: 1240,
        comments: 85,
        timestamp: '2h ago'
    },
    {
        id: 'p2',
        userId: 'u2',
        username: 'mystery_queen',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mystery',
        content: 'Who do you think betrayed Elena in Episode 4? I’m reading all your theories! 🔍🕵️‍♀️',
        mediaUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&q=80',
        mediaType: 'image',
        likes: 890,
        comments: 342,
        timestamp: '5h ago'
    },
    {
        id: 'p3',
        userId: 'u3',
        username: 'urban_sketches',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=urban',
        content: 'Check out the new SwiftRide integration! Booking a ride to the set has never been easier. 🚗✨',
        mediaUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
        mediaType: 'image',
        likes: 450,
        comments: 12,
        timestamp: '1d ago'
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
