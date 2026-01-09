import { useRef, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const DateDivider = ({ date }) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let label;
  if (isSameDay(date, today)) {
    label = 'Today';
  } else if (isSameDay(date, yesterday)) {
    label = 'Yesterday';
  } else {
    label = format(date, 'MMMM d, yyyy');
  }

  return (
    <div className="flex items-center justify-center my-4">
      <div className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
        {label}
      </div>
    </div>
  );
};

const MessageThread = ({
  messages,
  currentUserId,
  typingText,
  loading = false,
  onLoadMore,
  hasMore = false,
  onEditMessage,
  onDeleteMessage,
  onAddReaction,
  onRemoveReaction,
}) => {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  // Handle scroll for infinite loading
  const handleScroll = () => {
    if (!containerRef.current || !hasMore || loading) return;

    // Load more when scrolled near top (messages are reversed)
    if (containerRef.current.scrollTop < 100) {
      onLoadMore?.();
    }
  };

  // Group messages by date
  const messagesWithDates = messages.reduce((acc, message, index) => {
    const messageDate = new Date(message.createdAt);
    const prevMessage = messages[index + 1]; // +1 because array is newest first
    const prevDate = prevMessage ? new Date(prevMessage.createdAt) : null;

    // If this is first message or different day from previous, add date divider
    if (!prevDate || !isSameDay(messageDate, prevDate)) {
      acc.push({ type: 'date', date: messageDate, id: `date-${message.id}` });
    }

    acc.push({ type: 'message', message, id: message.id });
    return acc;
  }, []);

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 flex flex-col-reverse"
    >
      <div ref={bottomRef} />

      {/* Typing indicator */}
      {typingText && <TypingIndicator text={typingText} />}

      {/* Messages (reversed order - newest at bottom) */}
      {messagesWithDates.map((item) => {
        if (item.type === 'date') {
          return <DateDivider key={item.id} date={item.date} />;
        }

        const message = item.message;
        const isOwn = message.senderId === currentUserId;

        return (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={isOwn}
            currentUserId={currentUserId}
            onEdit={(content) => onEditMessage(message.id, content)}
            onDelete={() => onDeleteMessage(message.id)}
            onAddReaction={(messageId, emoji) => onAddReaction(messageId, emoji)}
            onRemoveReaction={(messageId, emoji) => onRemoveReaction(messageId, emoji)}
            showReadReceipt
          />
        );
      })}

      {/* Load more indicator */}
      {loading && messages.length > 0 && (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600" />
        </div>
      )}

      {/* Empty state */}
      {messages.length === 0 && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <p className="text-lg mb-2">No messages yet</p>
          <p className="text-sm">Start the conversation by sending a message</p>
        </div>
      )}
    </div>
  );
};

export default MessageThread;
