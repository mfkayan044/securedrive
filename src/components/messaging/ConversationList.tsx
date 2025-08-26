import React from 'react';
import { Conversation } from '../../types/messaging';
import { User, Car, Shield, Clock, MessageCircle } from 'lucide-react';
import { useMessaging } from '../../contexts/MessagingContext';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  userType: 'user' | 'driver' | 'admin';
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  userType
}) => {
  const { messages } = useMessaging();

  const getParticipantInfo = (conversation: Conversation) => {
    if (userType === 'user') {
      return conversation.participants.driver || { name: 'Sürücü', vehiclePlate: '' };
    } else if (userType === 'driver') {
      return conversation.participants.user || { name: 'Müşteri' };
    } else {
      // Admin sees both
      const driver = conversation.participants.driver;
      const user = conversation.participants.user;
      return {
        name: `${user?.name || 'Müşteri'} ↔ ${driver?.name || 'Sürücü'}`,
        vehiclePlate: driver?.vehiclePlate
      };
    }
  };

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.unreadCount[userType] || 0;
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    const conversationMessages = messages[conversation.id] || [];
    const lastMessage = conversationMessages[conversationMessages.length - 1];
    
    if (!lastMessage) return 'Henüz mesaj yok';
    
    if (lastMessage.messageType === 'system') {
      return '📋 Sistem mesajı';
    }
    
    if (lastMessage.messageType === 'location') {
      return '📍 Konum paylaşıldı';
    }
    
    if (lastMessage.messageType === 'image') {
      return '🖼️ Resim paylaşıldı';
    }
    
    return lastMessage.content.length > 50 
      ? lastMessage.content.substring(0, 50) + '...'
      : lastMessage.content;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">Henüz mesaj yok</p>
        <p className="text-sm">Rezervasyon yapıldığında mesajlaşma başlayacak</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const participant = getParticipantInfo(conversation);
        const unreadCount = getUnreadCount(conversation);
        const isSelected = conversation.id === selectedConversationId;
        
        return (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
              isSelected
                ? 'bg-blue-100 border-2 border-blue-500'
                : 'bg-white hover:bg-gray-50 border-2 border-transparent'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white">
                    {userType === 'admin' ? (
                      <MessageCircle className="w-5 h-5" />
                    ) : userType === 'user' ? (
                      <Car className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {participant.name}
                  </h3>
                  {participant.vehiclePlate && (
                    <p className="text-sm text-gray-500">
                      🚗 {participant.vehiclePlate}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">
                  {formatTime(conversation.updatedAt)}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  conversation.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {conversation.status === 'active' ? 'Aktif' : 'Tamamlandı'}
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 truncate">
              {getLastMessagePreview(conversation)}
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>#{conversation.reservationId}</span>
              {conversation.participants.admin && (
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Admin dahil</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;