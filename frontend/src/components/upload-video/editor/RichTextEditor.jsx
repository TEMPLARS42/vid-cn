import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, List, Smile } from 'lucide-react';
import EmojiPicker from './emoji-picker/EmojiPicker';

const RichTextEditor = ({ onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    const handleInput = () => {
      if (onChange) {
        onChange(editorRef.current.innerHTML);
      }
    };

    const editor = editorRef.current;
    editor.addEventListener('input', handleInput);

    return () => {
      editor.removeEventListener('input', handleInput);
    };
  }, [onChange]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker') && !event.target.closest('.emoji-trigger')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showEmojiPicker]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertLineBreak');
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const handleEmojiSelect = (emoji) => {
    formatText('insertText', emoji);
  };

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar border-bottom border-secondary pb-2 mb-2">
        <button
          type="button"
          className="btn btn-dark btn-sm me-1"
          onClick={() => formatText('bold')}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          className="btn btn-dark btn-sm me-1"
          onClick={() => formatText('italic')}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          className="btn btn-dark btn-sm me-1"
          onClick={() => formatText('insertUnorderedList')}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <div className="position-relative d-inline-block">
          <button
            type="button"
            className="btn btn-dark btn-sm emoji-trigger"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Insert Emoji"
          >
            <Smile size={16} />
          </button>
          {showEmojiPicker && (
            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>
      </div>
      <div
        ref={editorRef}
        className="editor-content form-control bg-dark text-light border-secondary"
        contentEditable
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        role="textbox"
        aria-multiline="true"
      />
    </div>
  );
};

export default RichTextEditor;