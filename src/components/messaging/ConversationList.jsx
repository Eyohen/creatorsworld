import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import OnlineStatus from './OnlineStatus';

const formatConversationTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);

  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  if (isThisWeek(date)) {
    return format(date, 'EEEE');
  }
  return format(date, 'MMM d');
};

const ConversationItem = ({
  conversation,
  isActive,
  onClick,
  currentUserType,
}) => {
  // Determine the other party based on current user type
  const otherParty = currentUserType === 'creator'
    ? conversation.brand
    : conversation.creator;

  const displayName = otherParty?.displayName ||
    (currentUserType === 'creator' ? conversation.brand?.companyName : conversation.creator?.displayName) ||
    'Unknown';

  const avatar = otherParty?.avatar ||
    (currentUserType === 'creator' ? conversation.brand?.logo : conversation.creator?.profileImage);

  const unreadCount = currentUserType === 'creator'
    ? conversation.creatorUnreadCount
    : conversation.brandUnreadCount;

  const otherUserId = otherParty?.userId;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
        isActive ? 'bg-green-50 border-l-4 border-green-500' : ''
      }`}
    >
      {/* Avatar with online status */}
      <div className="relative flex-shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 font-medium">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {otherUserId && (
          <div className="absolute bottom-0 right-0">
            <OnlineStatus userId={otherUserId} size="sm" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900 truncate">
            {displayName}
          </span>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {formatConversationTime(conversation.lastMessageAt)}
          </span>
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <p className="text-sm text-gray-500 truncate">
            {conversation.lastMessagePreview || 'No messages yet'}
          </p>
          {unreadCount > 0 && (
            <span className="ml-2 flex-shrink-0 w-5 h-5 bg-green-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>

        {/* Request info if available */}
        {conversation.request && (
          <p className="text-xs text-gray-400 truncate mt-0.5">
            Re: {conversation.request.title || conversation.request.projectTitle}
          </p>
        )}
      </div>
    </button>
  );
};

const ConversationList = ({
  conversations,
  activeConversationId,
  onSelect,
  currentUserType,
  loading = false,
  emptyMessage = 'No conversations yet',
}) => {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-gray-500 text-center">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === activeConversationId}
          onClick={() => onSelect(conversation.id)}
          currentUserType={currentUserType}
        />
      ))}
    </div>
  );
};

export default ConversationList;
