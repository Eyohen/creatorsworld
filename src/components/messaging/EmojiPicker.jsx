import { useState, useRef, useEffect } from 'react';

const EMOJI_LIST = [
  { emoji: '👍', label: 'thumbs up' },
  { emoji: '❤️', label: 'heart' },
  { emoji: '😂', label: 'laughing' },
  { emoji: '😮', label: 'surprised' },
  { emoji: '😢', label: 'sad' },
  { emoji: '😡', label: 'angry' },
  { emoji: '🎉', label: 'celebration' },
  { emoji: '🔥', label: 'fire' },
  { emoji: '👏', label: 'clapping' },
  { emoji: '💯', label: 'hundred' },
  { emoji: '✅', label: 'check' },
  { emoji: '🙏', label: 'pray' },
];

const EmojiPicker = ({ onSelect, onClose, position = 'top' }) => {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <div
      ref={pickerRef}
      className={`absolute ${positionClasses[position]} z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2`}
    >
      <div className="grid grid-cols-6 gap-1">
        {EMOJI_LIST.map(({ emoji, label }) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
            title={label}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
