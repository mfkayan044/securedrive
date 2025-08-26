export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'driver' | 'admin';
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  messageType: 'text' | 'system' | 'location' | 'image';
  metadata?: {
    location?: {
      lat: number;
      lng: number;
      address: string;
    };
    imageUrl?: string;
    systemAction?: string;
  };
}

export interface Conversation {
  id: string;
  reservationId: string;
  userId?: string;
  driverId?: string;
  participants: {
    user?: {
      id: string;
      name: string;
      avatar?: string;
    };
    driver?: {
      id: string;
      name: string;
      avatar?: string;
      vehiclePlate: string;
    };
    admin?: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
  lastMessage?: Message;
  unreadCount: {
    user: number;
    driver: number;
    admin: number;
  };
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface MessageNotification {
  id: string;
  conversationId: string;
  recipientId: string;
  recipientType: 'user' | 'driver' | 'admin';
  message: Message;
  isRead: boolean;
  createdAt: string;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userType: 'user' | 'driver' | 'admin';
  userName: string;
  isTyping: boolean;
  timestamp: string;
}