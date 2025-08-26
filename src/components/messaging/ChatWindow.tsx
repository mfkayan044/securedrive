import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, MapPin, Image, MoreVertical, UserPlus } from 'lucide-react';
import { useMessaging } from '../../contexts/MessagingContext';
import { Conversation } from '../../types/messaging';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  conversation: Conversation;
  userType: 'user' | 'driver' | 'admin';
  currentUserId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, userType, currentUserId }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { 
    messages, 
    sendMessage, 
    markAsRead, 
    setTyping, 
    typingIndicators,
    joinConversationAsAdmin 
  } = useMessaging();

  const conversationMessages = messages[conversation.id] || [];

  useEffect(() => {
    scrollToBottom();
    markAsRead(conversation.id, userType);
  }, [conversationMessages, conversation.id, userType, markAsRead]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [conversation.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const success = await sendMessage(conversation.id, newMessage.trim());
    if (success) {
      setNewMessage('');
      setIsTyping(false);
      setTyping(conversation.id, false);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      setTyping(conversation.id, true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      setTyping(conversation.id, false);
    }
  };

  const handleJoinAsAdmin = async () => {
    await joinConversationAsAdmin(conversation.id);
    setShowActions(false);
  };

  const getParticipantName = () => {
    if (userType === 'user') {
      return conversation.participants.driver?.name || 'Sürücü';
    } else if (userType === 'driver') {
      return conversation.participants.user?.name || 'Müşteri';
    } else {
      const driver = conversation.participants.driver?.name || 'Sürücü';
      const user = conversation.participants.user?.name || 'Müşteri';
      return `${user} ↔ ${driver}`;
    }
  };

  const getCurrentTypingUsers = () => {
    return typingIndicators.filter(t => 
      t.conversationId === conversation.id && 
      t.userId !== currentUserId &&
      t.isTyping
    );
  };

  const typingUsers = getCurrentTypingUsers();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {getParticipantName()}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>#{conversation.reservationId}</span>
              {conversation.participants.driver?.vehiclePlate && (
                <span>🚗 {conversation.participants.driver.vehiclePlate}</span>
              )}
              <span className={`px-2 py-1 rounded-full text-xs ${
                conversation.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {conversation.status === 'active' ? 'Aktif' : 'Tamamlandı'}
              </span>
            </div>
          </div>
          
          {userType === 'admin' && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                  {!conversation.participants.admin && (
                    <button
                      onClick={handleJoinAsAdmin}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Sohbete Katıl</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowActions(false)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600"
                  >
                    Sohbeti Arşivle
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {conversationMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
            />
          ))}
          
          {/* Typing Indicators */}
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span>
                {typingUsers.map(u => u.userName).join(', ')} yazıyor...
              </span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex space-x-2">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title="Dosya ekle"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title="Konum paylaş"
            >
              <MapPin className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title="Resim ekle"
            >
              <Image className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Mesajınızı yazın..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              disabled={conversation.status !== 'active'}
            />
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || conversation.status !== 'active'}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;