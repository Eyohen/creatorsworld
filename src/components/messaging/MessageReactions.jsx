import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import EmojiPicker from './EmojiPicker';

const MessageReactions = ({
  reactions = {},
  currentUserId,
  onAddReaction,
  onRemoveReaction,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const reactionEntries = Object.entries(reactions).filter(
    ([_, users]) => users && users.length > 0
  );

  if (reactionEntries.length === 0 && !onAddReaction) {
    return null;
  }

  const handleReactionClick = (emoji) => {
    const users = reactions[emoji] || [];
    const hasReacted = users.includes(currentUserId);

    if (hasReacted) {
      onRemoveReaction?.(emoji);
    } else {
      onAddReaction?.(emoji);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1">
      {reactionEntries.map(([emoji, users]) => {
        const hasReacted = users.includes(currentUserId);
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => handleReactionClick(emoji)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full transition-colors ${
              hasReacted
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
            }`}
          >
            <span>{emoji}</span>
            <span>{users.length}</span>
          </button>
        );
      })}

      {onAddReaction && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPicker((prev) => !prev)}
            className="inline-flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Add reaction"
          >
            <PlusIcon className="w-4 h-4" />
          </button>

          {showPicker && (
            <EmojiPicker
              onSelect={onAddReaction}
              onClose={() => setShowPicker(false)}
              position="top"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MessageReactions;
