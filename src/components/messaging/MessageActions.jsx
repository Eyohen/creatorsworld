import { useState, useRef, useEffect } from 'react';
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/outline';
import EmojiPicker from './EmojiPicker';

const MessageActions = ({
  isOwn,
  onEdit,
  onDelete,
  onAddReaction,
  canEdit = true,
  canDelete = true,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {/* Reaction button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Add reaction"
        >
          <FaceSmileIcon className="w-4 h-4" />
        </button>

        {showEmojiPicker && (
          <EmojiPicker
            onSelect={(emoji) => {
              onAddReaction(emoji);
              setShowEmojiPicker(false);
            }}
            onClose={() => setShowEmojiPicker(false)}
            position={isOwn ? 'left' : 'right'}
          />
        )}
      </div>

      {/* Menu button (only for own messages) */}
      {isOwn && (canEdit || canDelete) && (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <EllipsisVerticalIcon className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className={`absolute z-50 ${isOwn ? 'right-0' : 'left-0'} top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]`}>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageActions;
