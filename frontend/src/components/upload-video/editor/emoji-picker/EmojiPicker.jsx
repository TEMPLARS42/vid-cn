import React, { useState } from 'react';
import { emojiCategories } from './emojiData';

const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
    onClose();
  };

  const filteredEmojis = searchTerm
    ? emojiCategories.flatMap(category => 
        category.emojis.filter(emoji => 
          emoji.includes(searchTerm)
        )
      )
    : emojiCategories[activeCategory].emojis;

  return (
    <div className="emoji-picker">
      <div className="emoji-picker-header">
        <input
          type="text"
          className="emoji-search form-control form-control-sm bg-dark text-light border-secondary"
          placeholder="Search emojis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {!searchTerm && (
        <div className="emoji-categories">
          {emojiCategories.map((category, index) => (
            <button
              key={category.name}
              className={`btn btn-dark btn-sm ${activeCategory === index ? 'active' : ''}`}
              onClick={() => setActiveCategory(index)}
              title={category.name}
            >
              {category.icon}
            </button>
          ))}
        </div>
      )}
      
      <div className="emoji-grid">
        {filteredEmojis.map((emoji, index) => (
          <button
            key={index}
            className="emoji-button"
            onClick={() => handleEmojiClick(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;