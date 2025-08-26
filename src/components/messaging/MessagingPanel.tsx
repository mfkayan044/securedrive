import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useMessaging } from '../../contexts/MessagingContext';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';

interface MessagingPanelProps {
  userType: 'user' | 'driver' | 'admin';
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
}

const MessagingPanel: React.FC<MessagingPanelProps> = ({
  userType,
  currentUserId,
  isOpen,
  onClose
}) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { conversations, getConversation } = useMessaging();

  // Filter conversations based on user type
  const filteredConversations = conversations.filter(conv => {
    if (userType === 'user') {
      return conv.userId === currentUserId;
    } else if (userType === 'driver') {
      return conv.driverId === currentUserId;
    } else {
      // Admin sees all conversations
      return true;
    }
  });

  const selectedConversation = selectedConversationId 
    ? getConversation(selectedConversationId)
    : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl h-[80vh] flex overflow-hidden">
        {/* Sidebar - Conversation List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Mesajlar
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {userType === 'admin' 
                ? 'Tüm sohbetler'
                : userType === 'driver'
                ? 'Müşteri sohbetleri'
                : 'Sürücü sohbetleri'
              }
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <ConversationList
              conversations={filteredConversations}
              selectedConversationId={selectedConversationId || undefined}
              onSelectConversation={setSelectedConversationId}
              userType={userType}
            />
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              userType={userType}
              currentUserId={currentUserId}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Bir sohbet seçin
                </h3>
                <p className="text-gray-600">
                  Mesajlaşmaya başlamak için sol taraftan bir sohbet seçin
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingPanel;