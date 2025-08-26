import React, { createContext, useContext, useState, useEffect } from 'react';
import { Message, Conversation, MessageNotification, TypingIndicator } from '../types/messaging';
import { useUser } from './UserContext';
import { useDriver } from './DriverContext';
import { useAdmin } from './AdminContext';

interface MessagingContextType {
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  notifications: MessageNotification[];
  typingIndicators: TypingIndicator[];
  sendMessage: (conversationId: string, content: string, messageType?: Message['messageType'], metadata?: Message['metadata']) => Promise<boolean>;
  markAsRead: (conversationId: string, userType: 'user' | 'driver' | 'admin') => void;
  createConversation: (reservationId: string, userId?: string, driverId?: string) => Promise<string>;
  getConversation: (conversationId: string) => Conversation | undefined;
  getMessages: (conversationId: string) => Message[];
  setTyping: (conversationId: string, isTyping: boolean) => void;
  joinConversationAsAdmin: (conversationId: string) => Promise<boolean>;
  archiveConversation: (conversationId: string) => Promise<boolean>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

// Mock data
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    reservationId: 'R001',
    userId: 'user-1',
    driverId: 'driver-1',
    participants: {
      user: {
        id: 'user-1',
        name: 'Ahmet Yılmaz'
      },
      driver: {
        id: 'driver-1',
        name: 'Mehmet Şoför',
        vehiclePlate: '34 ABC 123'
      }
    },
    unreadCount: {
      user: 0,
      driver: 1,
      admin: 2
    },
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  }
];

const mockMessages: { [key: string]: Message[] } = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'system',
      senderType: 'admin',
      senderName: 'Sistem',
      content: 'Transfer rezervasyonunuz onaylandı. Sürücünüz Mehmet Şoför ile iletişime geçebilirsiniz.',
      timestamp: '2024-01-15T10:00:00Z',
      isRead: true,
      messageType: 'system'
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'driver-1',
      senderType: 'driver',
      senderName: 'Mehmet Şoför',
      content: 'Merhaba Ahmet Bey, transferiniz için hazırım. Havalimanında T3 çıkışında olacağım.',
      timestamp: '2024-01-15T12:00:00Z',
      isRead: true,
      messageType: 'text'
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'user-1',
      senderType: 'user',
      senderName: 'Ahmet Yılmaz',
      content: 'Teşekkürler, uçağım 14:30\'da iniyor. Size haber veririm.',
      timestamp: '2024-01-15T12:05:00Z',
      isRead: true,
      messageType: 'text'
    },
    {
      id: 'msg-4',
      conversationId: 'conv-1',
      senderId: 'driver-1',
      senderType: 'driver',
      senderName: 'Mehmet Şoför',
      content: 'Tamam, bekliyorum. Araç plakam 34 ABC 123.',
      timestamp: '2024-01-15T14:25:00Z',
      isRead: false,
      messageType: 'text'
    }
  ]
};

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>(mockMessages);
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);

  const { currentUser } = useUser();
  const { currentDriver } = useDriver();
  const { currentAdmin } = useAdmin();

  const getCurrentUser = () => {
    if (currentUser) return { id: currentUser.id, type: 'user' as const, name: currentUser.name };
    if (currentDriver) return { id: currentDriver.id, type: 'driver' as const, name: currentDriver.name };
    if (currentAdmin) return { id: currentAdmin.id, type: 'admin' as const, name: currentAdmin.name };
    return null;
  };

  const sendMessage = async (
    conversationId: string, 
    content: string, 
    messageType: Message['messageType'] = 'text',
    metadata?: Message['metadata']
  ): Promise<boolean> => {
    const user = getCurrentUser();
    if (!user) return false;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: user.id,
      senderType: user.type,
      senderName: user.name,
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
      messageType,
      metadata
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }));

    // Update conversation last message and unread counts
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const newUnreadCount = { ...conv.unreadCount };
        if (user.type !== 'user') newUnreadCount.user++;
        if (user.type !== 'driver') newUnreadCount.driver++;
        if (user.type !== 'admin') newUnreadCount.admin++;

        return {
          ...conv,
          lastMessage: newMessage,
          unreadCount: newUnreadCount,
          updatedAt: new Date().toISOString()
        };
      }
      return conv;
    }));

    return true;
  };

  const markAsRead = (conversationId: string, userType: 'user' | 'driver' | 'admin') => {
    // Mark messages as read
    setMessages(prev => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map(msg => 
        msg.senderType !== userType ? { ...msg, isRead: true } : msg
      )
    }));

    // Reset unread count
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          unreadCount: {
            ...conv.unreadCount,
            [userType]: 0
          }
        };
      }
      return conv;
    }));
  };

  const createConversation = async (reservationId: string, userId?: string, driverId?: string): Promise<string> => {
    const conversationId = `conv-${Date.now()}`;
    
    const newConversation: Conversation = {
      id: conversationId,
      reservationId,
      userId,
      driverId,
      participants: {},
      unreadCount: {
        user: 0,
        driver: 0,
        admin: 0
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setConversations(prev => [...prev, newConversation]);
    setMessages(prev => ({ ...prev, [conversationId]: [] }));

    return conversationId;
  };

  const getConversation = (conversationId: string): Conversation | undefined => {
    return conversations.find(conv => conv.id === conversationId);
  };

  const getMessages = (conversationId: string): Message[] => {
    return messages[conversationId] || [];
  };

  const setTyping = (conversationId: string, isTyping: boolean) => {
    const user = getCurrentUser();
    if (!user) return;

    setTypingIndicators(prev => {
      const filtered = prev.filter(t => 
        !(t.conversationId === conversationId && t.userId === user.id)
      );

      if (isTyping) {
        return [...filtered, {
          conversationId,
          userId: user.id,
          userType: user.type,
          userName: user.name,
          isTyping: true,
          timestamp: new Date().toISOString()
        }];
      }

      return filtered;
    });

    // Auto-remove typing indicator after 3 seconds
    if (isTyping) {
      setTimeout(() => {
        setTypingIndicators(prev => 
          prev.filter(t => 
            !(t.conversationId === conversationId && t.userId === user.id)
          )
        );
      }, 3000);
    }
  };

  const joinConversationAsAdmin = async (conversationId: string): Promise<boolean> => {
    if (!currentAdmin) return false;

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          participants: {
            ...conv.participants,
            admin: {
              id: currentAdmin.id,
              name: currentAdmin.name
            }
          }
        };
      }
      return conv;
    }));

    // Send system message
    await sendMessage(
      conversationId,
      `${currentAdmin.name} sohbete katıldı.`,
      'system'
    );

    return true;
  };

  const archiveConversation = async (conversationId: string): Promise<boolean> => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, status: 'archived' };
      }
      return conv;
    }));

    return true;
  };

  return (
    <MessagingContext.Provider value={{
      conversations,
      messages,
      notifications,
      typingIndicators,
      sendMessage,
      markAsRead,
      createConversation,
      getConversation,
      getMessages,
      setTyping,
      joinConversationAsAdmin,
      archiveConversation
    }}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};