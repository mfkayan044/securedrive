import React, { useState } from 'react';
import { MessageCircle, Users, Search, Filter, Eye, Archive, UserPlus } from 'lucide-react';
import { useMessaging } from '../../contexts/MessagingContext';
import MessagingPanel from '../messaging/MessagingPanel';
import { useAdmin } from '../../contexts/AdminContext';

const MessagingManagement: React.FC = () => {
  const [showMessagingPanel, setShowMessagingPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const { conversations, messages, joinConversationAsAdmin, archiveConversation } = useMessaging();
  const { currentAdmin } = useAdmin();

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      conv.participants.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.participants.driver?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.reservationId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getLastMessagePreview = (conversationId: string) => {
    const conversationMessages = messages[conversationId] || [];
    const lastMessage = conversationMessages[conversationMessages.length - 1];
    
    if (!lastMessage) return 'Henüz mesaj yok';
    
    if (lastMessage.messageType === 'system') {
      return '📋 Sistem mesajı';
    }
    
    return lastMessage.content.length > 50 
      ? lastMessage.content.substring(0, 50) + '...'
      : lastMessage.content;
  };

  const getTotalUnreadCount = (conversation: any) => {
    return conversation.unreadCount.admin || 0;
  };

  const handleJoinConversation = async (conversationId: string) => {
    await joinConversationAsAdmin(conversationId);
  };

  const handleArchiveConversation = async (conversationId: string) => {
    if (confirm('Bu sohbeti arşivlemek istediğinizden emin misiniz?')) {
      await archiveConversation(conversationId);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Mesajlaşma Yönetimi</h1>
        <button
          onClick={() => setShowMessagingPanel(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center space-x-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Mesajlaşma Paneli</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Sohbet</p>
              <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktif Sohbet</p>
              <p className="text-2xl font-bold text-gray-900">
                {conversations.filter(c => c.status === 'active').length}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Okunmamış</p>
              <p className="text-2xl font-bold text-gray-900">
                {conversations.reduce((total, conv) => total + (conv.unreadCount.admin || 0), 0)}
              </p>
            </div>
            <MessageCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Admin Dahil</p>
              <p className="text-2xl font-bold text-gray-900">
                {conversations.filter(c => c.participants.admin).length}
              </p>
            </div>
            <UserPlus className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Sohbet ara (müşteri, sürücü, rezervasyon ID)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="completed">Tamamlandı</option>
            <option value="archived">Arşivlendi</option>
          </select>
        </div>
      </div>

      {/* Conversations Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sohbet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Katılımcılar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Son Mesaj
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConversations.map((conversation) => {
                const unreadCount = getTotalUnreadCount(conversation);
                
                return (
                  <tr key={conversation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <MessageCircle className="w-8 h-8 text-blue-600" />
                          {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{conversation.reservationId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {conversation.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          👤 {conversation.participants.user?.name || 'Müşteri'}
                        </div>
                        <div className="text-sm text-gray-600">
                          🚗 {conversation.participants.driver?.name || 'Sürücü'}
                          {conversation.participants.driver?.vehiclePlate && (
                            <span className="ml-2">({conversation.participants.driver.vehiclePlate})</span>
                          )}
                        </div>
                        {conversation.participants.admin && (
                          <div className="text-sm text-purple-600">
                            👨‍💼 {conversation.participants.admin.name}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {getLastMessagePreview(conversation.id)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        conversation.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : conversation.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {conversation.status === 'active' ? 'Aktif' : 
                         conversation.status === 'completed' ? 'Tamamlandı' : 'Arşivlendi'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(conversation.updatedAt)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setShowMessagingPanel(true)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Mesajları Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {!conversation.participants.admin && (
                          <button
                            onClick={() => handleJoinConversation(conversation.id)}
                            className="text-purple-600 hover:text-purple-900 p-1"
                            title="Sohbete Katıl"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                        
                        {conversation.status === 'active' && (
                          <button
                            onClick={() => handleArchiveConversation(conversation.id)}
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="Arşivle"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Messaging Panel */}
      {showMessagingPanel && currentAdmin && (
        <MessagingPanel
          userType="admin"
          currentUserId={currentAdmin.id}
          isOpen={showMessagingPanel}
          onClose={() => setShowMessagingPanel(false)}
        />
      )}
    </div>
  );
};

export default MessagingManagement;