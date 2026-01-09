import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const listenersRef = useRef({
    newMessage: [],
    typing: [],
    stoppedTyping: [],
    reactionAdded: [],
    reactionRemoved: [],
    messageEdited: [],
    messageDeleted: [],
    messagesRead: [],
    presenceChange: [],
    notification: [],
  });

  // Connect socket when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    // User online/offline events
    newSocket.on('user_online', ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    newSocket.on('user_offline', ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    // Message events
    newSocket.on('new_message', (data) => {
      listenersRef.current.newMessage.forEach((cb) => cb(data));
    });

    newSocket.on('user_typing', (data) => {
      listenersRef.current.typing.forEach((cb) => cb(data));
    });

    newSocket.on('user_stopped_typing', (data) => {
      listenersRef.current.stoppedTyping.forEach((cb) => cb(data));
    });

    newSocket.on('reaction_added', (data) => {
      listenersRef.current.reactionAdded.forEach((cb) => cb(data));
    });

    newSocket.on('reaction_removed', (data) => {
      listenersRef.current.reactionRemoved.forEach((cb) => cb(data));
    });

    newSocket.on('message_edited', (data) => {
      listenersRef.current.messageEdited.forEach((cb) => cb(data));
    });

    newSocket.on('message_deleted', (data) => {
      listenersRef.current.messageDeleted.forEach((cb) => cb(data));
    });

    newSocket.on('messages_read', (data) => {
      listenersRef.current.messagesRead.forEach((cb) => cb(data));
    });

    newSocket.on('presence_change', (data) => {
      listenersRef.current.presenceChange.forEach((cb) => cb(data));
      if (data.status === 'online') {
        setOnlineUsers((prev) => new Set([...prev, data.userId]));
      } else {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(data.userId);
          return next;
        });
      }
    });

    // Notification event
    newSocket.on('notification', (data) => {
      listenersRef.current.notification.forEach((cb) => cb(data));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, user]);

  // Join a conversation room
  const joinConversation = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('join_conversation', conversationId);
    }
  }, [socket, isConnected]);

  // Leave a conversation room
  const leaveConversation = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('leave_conversation', conversationId);
    }
  }, [socket, isConnected]);

  // Send typing indicator
  const sendTypingStart = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { conversationId });
    }
  }, [socket, isConnected]);

  const sendTypingStop = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { conversationId });
    }
  }, [socket, isConnected]);

  // Mark messages as read via socket
  const markConversationRead = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('mark_read', { conversationId });
    }
  }, [socket, isConnected]);

  // Event listener management
  const addEventListener = useCallback((event, callback) => {
    if (listenersRef.current[event]) {
      listenersRef.current[event].push(callback);
    }
  }, []);

  const removeEventListener = useCallback((event, callback) => {
    if (listenersRef.current[event]) {
      listenersRef.current[event] = listenersRef.current[event].filter((cb) => cb !== callback);
    }
  }, []);

  // Helper hooks for specific events
  const onNewMessage = useCallback((callback) => {
    addEventListener('newMessage', callback);
    return () => removeEventListener('newMessage', callback);
  }, [addEventListener, removeEventListener]);

  const onTyping = useCallback((callback) => {
    addEventListener('typing', callback);
    return () => removeEventListener('typing', callback);
  }, [addEventListener, removeEventListener]);

  const onStoppedTyping = useCallback((callback) => {
    addEventListener('stoppedTyping', callback);
    return () => removeEventListener('stoppedTyping', callback);
  }, [addEventListener, removeEventListener]);

  const onReactionAdded = useCallback((callback) => {
    addEventListener('reactionAdded', callback);
    return () => removeEventListener('reactionAdded', callback);
  }, [addEventListener, removeEventListener]);

  const onReactionRemoved = useCallback((callback) => {
    addEventListener('reactionRemoved', callback);
    return () => removeEventListener('reactionRemoved', callback);
  }, [addEventListener, removeEventListener]);

  const onMessageEdited = useCallback((callback) => {
    addEventListener('messageEdited', callback);
    return () => removeEventListener('messageEdited', callback);
  }, [addEventListener, removeEventListener]);

  const onMessageDeleted = useCallback((callback) => {
    addEventListener('messageDeleted', callback);
    return () => removeEventListener('messageDeleted', callback);
  }, [addEventListener, removeEventListener]);

  const onMessagesRead = useCallback((callback) => {
    addEventListener('messagesRead', callback);
    return () => removeEventListener('messagesRead', callback);
  }, [addEventListener, removeEventListener]);

  const onPresenceChange = useCallback((callback) => {
    addEventListener('presenceChange', callback);
    return () => removeEventListener('presenceChange', callback);
  }, [addEventListener, removeEventListener]);

  const onNotification = useCallback((callback) => {
    addEventListener('notification', callback);
    return () => removeEventListener('notification', callback);
  }, [addEventListener, removeEventListener]);

  // Check if user is online
  const isUserOnline = useCallback((userId) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  const value = {
    socket,
    isConnected,
    onlineUsers,
    // Room management
    joinConversation,
    leaveConversation,
    // Typing
    sendTypingStart,
    sendTypingStop,
    // Read receipts
    markConversationRead,
    // Event listeners
    onNewMessage,
    onTyping,
    onStoppedTyping,
    onReactionAdded,
    onReactionRemoved,
    onMessageEdited,
    onMessageDeleted,
    onMessagesRead,
    onPresenceChange,
    onNotification,
    // Helpers
    isUserOnline,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
