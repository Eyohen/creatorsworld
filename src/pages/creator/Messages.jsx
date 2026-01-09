import { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import useMessages from '../../hooks/useMessages';
import {
  ConversationList,
  MessageThread,
  MessageInput,
  OnlineStatus,
  StartConversation,
} from '../../components/messaging';

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [showStartConversation, setShowStartConversation] = useState(false);

  const {
    conversations,
    activeConversation,
    messages,
    loading,
    loadingMessages,
    error,
    hasMore,
    fetchConversations,
    fetchConversation,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    markAsRead,
    handleTyping,
    getTypingText,
    loadMoreMessages,
    clearError,
  } = useMessages(conversationId);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load active conversation details
  useEffect(() => {
    if (conversationId) {
      fetchConversation(conversationId);
      markAsRead();
      setShowStartConversation(false);
    }
  }, [conversationId, fetchConversation, markAsRead]);

  const handleSelectConversation = useCallback((convId) => {
    navigate(`/creator/messages/${convId}`);
  }, [navigate]);

  const handleStartConversation = useCallback((convId) => {
    setShowStartConversation(false);
    navigate(`/creator/messages/${convId}`);
    fetchConversations(); // Refresh conversation list
  }, [navigate, fetchConversations]);

  const handleSendMessage = useCallback(async (content, attachments) => {
    await sendMessage(content, 'text', attachments);
  }, [sendMessage]);

  const handleEditMessage = useCallback(async (messageId, content) => {
    await editMessage(messageId, content);
  }, [editMessage]);

  const handleDeleteMessage = useCallback(async (messageId) => {
    await deleteMessage(messageId);
  }, [deleteMessage]);

  const handleAddReaction = useCallback(async (messageId, emoji) => {
    await addReaction(messageId, emoji);
  }, [addReaction]);

  const handleRemoveReaction = useCallback(async (messageId, emoji) => {
    await removeReaction(messageId, emoji);
  }, [removeReaction]);

  // Determine other party info for header
  const otherParty = activeConversation?.brand;
  const otherDisplayName = otherParty?.companyName || 'Brand';
  const otherAvatar = otherParty?.logo;
  const otherUserId = otherParty?.userId;

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
      <div className="flex h-full">
        {/* Conversation List */}
        <div className="w-80 border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-xl text-gray-900">Messages</h2>
            <div className="flex items-center gap-2">
              {isConnected && (
                <span className="flex items-center gap-1.5 text-xs text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </span>
              )}
              <button
                onClick={() => setShowStartConversation(true)}
                className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="New conversation"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <ConversationList
            conversations={conversations}
            activeConversationId={conversationId}
            onSelect={handleSelectConversation}
            currentUserType="creator"
            loading={loading}
            emptyMessage="No conversations yet"
          />
        </div>

        {/* Message Area */}
        <div className="flex-1 flex flex-col">
          {showStartConversation ? (
            <StartConversation
              onStartConversation={handleStartConversation}
              currentUserType="creator"
            />
          ) : !conversationId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
              <svg
                className="w-16 h-16 mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm text-gray-400 mt-1 text-center">
                Choose from your existing conversations or start a new one
              </p>
              <button
                onClick={() => setShowStartConversation(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Start a conversation</span>
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="relative">
                  {otherAvatar ? (
                    <img
                      src={otherAvatar}
                      alt={otherDisplayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 font-medium">
                        {otherDisplayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {otherUserId && (
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <OnlineStatus userId={otherUserId} size="sm" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{otherDisplayName}</p>
                    {otherUserId && (
                      <OnlineStatus userId={otherUserId} showText size="xs" />
                    )}
                  </div>
                  {activeConversation?.request && (
                    <p className="text-sm text-gray-500">
                      Re: {activeConversation.request.title || activeConversation.request.projectTitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Error banner */}
              {error && (
                <div className="bg-red-50 border-b border-red-100 px-4 py-2 flex items-center justify-between">
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={clearError}
                    className="text-red-600 hover:text-red-800"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Messages */}
              <MessageThread
                messages={messages}
                currentUserId={user?.id}
                typingText={getTypingText()}
                loading={loadingMessages}
                hasMore={hasMore}
                onLoadMore={loadMoreMessages}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onAddReaction={handleAddReaction}
                onRemoveReaction={handleRemoveReaction}
              />

              {/* Input */}
              <MessageInput
                onSend={handleSendMessage}
                onTyping={handleTyping}
                disabled={loadingMessages}
                placeholder="Type a message..."
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
