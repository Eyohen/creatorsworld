import { useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { CheckIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import MessageReactions from './MessageReactions';
import MessageActions from './MessageActions';

const formatMessageTime = (dateString) => {
  const date = new Date(dateString);
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return `Yesterday ${format(date, 'h:mm a')}`;
  }
  return format(date, 'MMM d, h:mm a');
};

const MessageBubble = ({
  message,
  isOwn,
  currentUserId,
  onEdit,
  onDelete,
  onAddReaction,
  onRemoveReaction,
  showReadReceipt = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editContent.trim() && editContent !== message.content) {
      onEdit(editContent.trim());
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  // Deleted message placeholder
  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
        <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-400 italic text-sm">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 group`}>
      <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
        {/* Message content */}
        <div>
          {/* Sender name (for non-own messages) */}
          {!isOwn && message.senderName && (
            <div className="text-xs text-gray-500 mb-1 ml-1">
              {message.senderName}
            </div>
          )}

          <div
            className={`relative px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-green-600 text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
            }`}
          >
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="min-w-[200px]">
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-inherit"
                  autoFocus
                />
                <div className="flex gap-2 mt-2 text-xs">
                  <button
                    type="submit"
                    className={`${isOwn ? 'text-green-200 hover:text-white' : 'text-green-600 hover:text-green-700'}`}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className={`${isOwn ? 'text-green-200 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Message text */}
                <p className="whitespace-pre-wrap break-words">{message.content}</p>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block text-sm underline ${isOwn ? 'text-green-200' : 'text-green-600'}`}
                      >
                        {attachment.name || 'Attachment'}
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Message info row */}
          <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-400">
              {formatMessageTime(message.createdAt)}
            </span>

            {message.isEdited && (
              <span className="text-xs text-gray-400 italic">(edited)</span>
            )}

            {/* Read receipt for own messages */}
            {isOwn && showReadReceipt && (
              <span className="text-xs">
                {message.readBy && message.readBy.length > 0 ? (
                  <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" title="Read" />
                ) : (
                  <CheckIcon className="w-3.5 h-3.5 text-gray-400" title="Sent" />
                )}
              </span>
            )}
          </div>

          {/* Reactions */}
          <MessageReactions
            reactions={message.reactions || {}}
            currentUserId={currentUserId}
            onAddReaction={(emoji) => onAddReaction(message.id, emoji)}
            onRemoveReaction={(emoji) => onRemoveReaction(message.id, emoji)}
          />
        </div>

        {/* Actions */}
        <MessageActions
          isOwn={isOwn}
          onEdit={() => setIsEditing(true)}
          onDelete={() => onDelete(message.id)}
          onAddReaction={(emoji) => onAddReaction(message.id, emoji)}
          canEdit={isOwn && !message.isDeleted}
          canDelete={isOwn && !message.isDeleted}
        />
      </div>
    </div>
  );
};

export default MessageBubble;
