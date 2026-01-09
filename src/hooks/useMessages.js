import { useState, useEffect, useCallback, useRef } from 'react';
import { messageApi } from '../api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const useMessages = (conversationId = null) => {
  const { user } = useAuth();
  const {
    joinConversation,
    leaveConversation,
    sendTypingStart,
    sendTypingStop,
    markConversationRead,
    onNewMessage,
    onTyping,
    onStoppedTyping,
    onReactionAdded,
    onReactionRemoved,
    onMessageEdited,
    onMessageDeleted,
    onMessagesRead,
    isUserOnline,
  } = useSocket();

  // State
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const typingTimeoutRef = useRef({});
  const lastTypingSentRef = useRef(0);

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await messageApi.getConversations();
      setConversations(data.data || []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setError(err.response?.data?.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single conversation
  const fetchConversation = useCallback(async (id) => {
    try {
      const { data } = await messageApi.getConversation(id);
      setActiveConversation(data.data);
      return data.data;
    } catch (err) {
      console.error('Failed to fetch conversation:', err);
      setError(err.response?.data?.message || 'Failed to load conversation');
      return null;
    }
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (convId, pageNum = 1, append = false) => {
    if (!convId) return;

    try {
      setLoadingMessages(true);
      const { data } = await messageApi.getMessages(convId, { page: pageNum, limit: 50 });

      const msgs = data.data?.messages || data.data || [];

      if (append) {
        setMessages((prev) => [...prev, ...msgs]);
      } else {
        setMessages(msgs);
      }

      // Check if there are more messages
      const pagination = data.data?.pagination;
      if (pagination) {
        setHasMore(pagination.page < pagination.totalPages);
      } else {
        setHasMore(msgs.length === 50);
      }

      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!conversationId || !hasMore || loadingMessages) return;
    await fetchMessages(conversationId, page + 1, true);
  }, [conversationId, hasMore, loadingMessages, page, fetchMessages]);

  // Send a message
  const sendMessage = useCallback(async (content, messageType = 'text', attachments = null) => {
    if (!conversationId) return null;

    try {
      const { data } = await messageApi.sendMessage(conversationId, content, messageType, attachments);

      // Optimistically add to messages (will be updated by socket event)
      const newMessage = data.data;
      setMessages((prev) => [newMessage, ...prev]);

      // Update conversation list with new message preview
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? { ...conv, lastMessagePreview: content, lastMessageAt: new Date().toISOString() }
            : conv
        )
      );

      return newMessage;
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
      return null;
    }
  }, [conversationId]);

  // Edit a message
  const editMessage = useCallback(async (messageId, content) => {
    if (!conversationId) return false;

    try {
      await messageApi.editMessage(conversationId, messageId, content);

      // Update locally
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, content, isEdited: true, editedAt: new Date().toISOString() } : msg
        )
      );

      return true;
    } catch (err) {
      console.error('Failed to edit message:', err);
      setError(err.response?.data?.message || 'Failed to edit message');
      return false;
    }
  }, [conversationId]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId) => {
    if (!conversationId) return false;

    try {
      await messageApi.deleteMessage(conversationId, messageId);

      // Update locally (mark as deleted)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isDeleted: true, deletedAt: new Date().toISOString() } : msg
        )
      );

      return true;
    } catch (err) {
      console.error('Failed to delete message:', err);
      setError(err.response?.data?.message || 'Failed to delete message');
      return false;
    }
  }, [conversationId]);

  // Add reaction to a message
  const addReaction = useCallback(async (messageId, emoji) => {
    if (!conversationId) return false;

    try {
      await messageApi.addReaction(conversationId, messageId, emoji);

      // Update locally
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;
          const reactions = { ...msg.reactions };
          if (!reactions[emoji]) {
            reactions[emoji] = [];
          }
          if (!reactions[emoji].includes(user?.id)) {
            reactions[emoji].push(user?.id);
          }
          return { ...msg, reactions };
        })
      );

      return true;
    } catch (err) {
      console.error('Failed to add reaction:', err);
      setError(err.response?.data?.message || 'Failed to add reaction');
      return false;
    }
  }, [conversationId, user?.id]);

  // Remove reaction from a message
  const removeReaction = useCallback(async (messageId, emoji) => {
    if (!conversationId) return false;

    try {
      await messageApi.removeReaction(conversationId, messageId, emoji);

      // Update locally
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;
          const reactions = { ...msg.reactions };
          if (reactions[emoji]) {
            reactions[emoji] = reactions[emoji].filter((id) => id !== user?.id);
            if (reactions[emoji].length === 0) {
              delete reactions[emoji];
            }
          }
          return { ...msg, reactions };
        })
      );

      return true;
    } catch (err) {
      console.error('Failed to remove reaction:', err);
      setError(err.response?.data?.message || 'Failed to remove reaction');
      return false;
    }
  }, [conversationId, user?.id]);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!conversationId) return;

    try {
      await messageApi.markAsRead(conversationId);
      markConversationRead(conversationId);

      // Update local unread count
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, [conversationId, markConversationRead]);

  // Typing indicator
  const handleTyping = useCallback(() => {
    if (!conversationId) return;

    const now = Date.now();
    // Throttle typing events to once per second
    if (now - lastTypingSentRef.current < 1000) return;

    lastTypingSentRef.current = now;
    sendTypingStart(conversationId);

    // Clear previous timeout
    if (typingTimeoutRef.current[conversationId]) {
      clearTimeout(typingTimeoutRef.current[conversationId]);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current[conversationId] = setTimeout(() => {
      sendTypingStop(conversationId);
    }, 3000);
  }, [conversationId, sendTypingStart, sendTypingStop]);

  // Socket event handlers
  useEffect(() => {
    if (!conversationId) return;

    const handleNewMessage = (data) => {
      if (data.conversationId === conversationId) {
        // Skip if this is our own message (already added optimistically)
        if (data.senderId === user?.id) return;

        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === data.id)) return prev;
          return [data, ...prev];
        });
      }

      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === data.conversationId
            ? {
                ...conv,
                lastMessagePreview: data.content,
                lastMessageAt: data.createdAt,
                unreadCount: conv.id === conversationId ? 0 : (conv.unreadCount || 0) + 1,
              }
            : conv
        )
      );
    };

    const handleTypingEvent = (data) => {
      if (data.conversationId === conversationId && data.userId !== user?.id) {
        setTypingUsers((prev) => ({
          ...prev,
          [data.userId]: { userName: data.userName, timestamp: Date.now() },
        }));

        // Clear typing after 4 seconds
        setTimeout(() => {
          setTypingUsers((prev) => {
            const next = { ...prev };
            if (next[data.userId]?.timestamp <= Date.now() - 3500) {
              delete next[data.userId];
            }
            return next;
          });
        }, 4000);
      }
    };

    const handleStoppedTyping = (data) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[data.userId];
          return next;
        });
      }
    };

    const handleReactionAdded = (data) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id !== data.messageId) return msg;
            const reactions = { ...msg.reactions };
            if (!reactions[data.emoji]) {
              reactions[data.emoji] = [];
            }
            if (!reactions[data.emoji].includes(data.userId)) {
              reactions[data.emoji].push(data.userId);
            }
            return { ...msg, reactions };
          })
        );
      }
    };

    const handleReactionRemoved = (data) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id !== data.messageId) return msg;
            const reactions = { ...msg.reactions };
            if (reactions[data.emoji]) {
              reactions[data.emoji] = reactions[data.emoji].filter((id) => id !== data.userId);
              if (reactions[data.emoji].length === 0) {
                delete reactions[data.emoji];
              }
            }
            return { ...msg, reactions };
          })
        );
      }
    };

    const handleMessageEdited = (data) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId
              ? { ...msg, content: data.content, isEdited: true, editedAt: data.editedAt }
              : msg
          )
        );
      }
    };

    const handleMessageDeleted = (data) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId ? { ...msg, isDeleted: true, deletedAt: data.deletedAt } : msg
          )
        );
      }
    };

    const handleMessagesRead = (data) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) => ({
            ...msg,
            readBy: [...new Set([...(msg.readBy || []), data.userId])],
          }))
        );
      }
    };

    // Subscribe to events
    const unsubNew = onNewMessage(handleNewMessage);
    const unsubTyping = onTyping(handleTypingEvent);
    const unsubStoppedTyping = onStoppedTyping(handleStoppedTyping);
    const unsubReactionAdded = onReactionAdded(handleReactionAdded);
    const unsubReactionRemoved = onReactionRemoved(handleReactionRemoved);
    const unsubEdited = onMessageEdited(handleMessageEdited);
    const unsubDeleted = onMessageDeleted(handleMessageDeleted);
    const unsubRead = onMessagesRead(handleMessagesRead);

    return () => {
      unsubNew();
      unsubTyping();
      unsubStoppedTyping();
      unsubReactionAdded();
      unsubReactionRemoved();
      unsubEdited();
      unsubDeleted();
      unsubRead();
    };
  }, [
    conversationId,
    user?.id,
    onNewMessage,
    onTyping,
    onStoppedTyping,
    onReactionAdded,
    onReactionRemoved,
    onMessageEdited,
    onMessageDeleted,
    onMessagesRead,
  ]);

  // Join/leave conversation room
  useEffect(() => {
    if (conversationId) {
      joinConversation(conversationId);
      fetchMessages(conversationId);

      return () => {
        leaveConversation(conversationId);
        setMessages([]);
        setTypingUsers({});
        setPage(1);
        setHasMore(true);
      };
    }
  }, [conversationId, joinConversation, leaveConversation, fetchMessages]);

  // Get typing indicator text
  const getTypingText = useCallback(() => {
    const typingList = Object.values(typingUsers);
    if (typingList.length === 0) return null;
    if (typingList.length === 1) return `${typingList[0].userName} is typing...`;
    if (typingList.length === 2) {
      return `${typingList[0].userName} and ${typingList[1].userName} are typing...`;
    }
    return 'Several people are typing...';
  }, [typingUsers]);

  return {
    // Data
    conversations,
    activeConversation,
    messages,
    typingUsers,
    // Loading states
    loading,
    loadingMessages,
    error,
    // Pagination
    hasMore,
    loadMoreMessages,
    // Actions
    fetchConversations,
    fetchConversation,
    fetchMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    markAsRead,
    // Typing
    handleTyping,
    getTypingText,
    // Helpers
    isUserOnline,
    clearError: () => setError(null),
  };
};

export default useMessages;
