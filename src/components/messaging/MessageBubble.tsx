import React from 'react';
import { Message } from '../../types/messaging';
import { User, Car, Shield, Clock, MapPin, Image } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, showAvatar = true }) => {
  const getSenderIcon = () => {
    switch (message.senderType) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'driver':
        return <Car className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getSenderColor = () => {
    switch (message.senderType) {
      case 'user':
        return 'bg-blue-500';
      case 'driver':
        return 'bg-green-500';
      case 'admin':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getMessageStyle = () => {
    if (message.messageType === 'system') {
      return 'bg-gray-100 text-gray-700 text-center mx-auto max-w-xs';
    }
    
    if (isOwn) {
      return `${getSenderColor()} text-white ml-auto`;
    }
    
    return 'bg-gray-200 text-gray-900';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (message.messageType === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className={`px-4 py-2 rounded-full text-sm ${getMessageStyle()}`}>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>{message.content}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-end space-x-2 mb-4 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {showAvatar && !isOwn && (
        <div className={`w-8 h-8 rounded-full ${getSenderColor()} flex items-center justify-center text-white flex-shrink-0`}>
          {getSenderIcon()}
        </div>
      )}
      
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'ml-auto' : ''}`}>
        {!isOwn && (
          <div className="text-xs text-gray-500 mb-1 px-1">
            {message.senderName}
          </div>
        )}
        
        <div className={`px-4 py-2 rounded-2xl ${getMessageStyle()}`}>
          {message.messageType === 'location' && message.metadata?.location && (
            <div className="mb-2">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Konum</span>
              </div>
              <div className="text-sm opacity-90">
                {message.metadata.location.address}
              </div>
            </div>
          )}
          
          {message.messageType === 'image' && message.metadata?.imageUrl && (
            <div className="mb-2">
              <img 
                src={message.metadata.imageUrl} 
                alt="Paylaşılan resim"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}
          
          <div className="text-sm">
            {message.content}
          </div>
        </div>
        
        <div className={`text-xs text-gray-500 mt-1 px-1 ${isOwn ? 'text-right' : ''}`}>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatTime(message.timestamp)}</span>
            {!message.isRead && isOwn && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;