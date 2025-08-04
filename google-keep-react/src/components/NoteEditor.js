import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const NoteEditor = ({ line, index, onUpdate, onDelete, onAddLine, isLast }) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: line.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (isFocused && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isFocused]);

  const handleInputChange = (e) => {
    onUpdate({ content: e.target.value });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddLine();
    } else if (e.key === 'Backspace' && line.content === '') {
      e.preventDefault();
      onDelete();
    }
  };

  const handleDoubleClick = () => {
    if (line.type === 'text') {
      onUpdate({ type: 'checkbox' });
    }
  };

  const handleCheckboxToggle = () => {
    onUpdate({ checked: !line.checked });
  };

  const handleBulletToggle = () => {
    if (line.type === 'checkbox') {
      onUpdate({ type: 'bullet' });
    } else if (line.type === 'bullet') {
      onUpdate({ type: 'text' });
    }
  };

  const renderContent = () => {
    switch (line.type) {
      case 'checkbox':
        return (
          <div className="checkbox-item" style={style} ref={setNodeRef}>
            <div 
              className={`checkbox ${line.checked ? 'completed' : ''}`}
              onClick={handleCheckboxToggle}
            >
              <span className="material-icons">
                {line.checked ? 'check_box' : 'check_box_outline_blank'}
              </span>
            </div>
            <textarea
              ref={textareaRef}
              className="checkbox-item-text"
              placeholder="Type or Double tap for paragraph"
              value={line.content}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onDoubleClick={handleBulletToggle}
            />
            <button 
              className="item-delete"
              onClick={() => onDelete()}
            >
              <span className="material-icons">close</span>
            </button>
            <div 
              className="item-drag-handle"
              {...attributes}
              {...listeners}
            >
              <span className="material-icons">drag_indicator</span>
            </div>
          </div>
        );

      case 'bullet':
        return (
          <div className="bullet-item" style={style} ref={setNodeRef}>
            <div className="bullet-point">•</div>
            <textarea
              ref={textareaRef}
              className="bullet-item-text"
              placeholder="Type or Double tap for paragraph"
              value={line.content}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onDoubleClick={handleBulletToggle}
            />
            <button 
              className="item-delete"
              onClick={() => onDelete()}
            >
              <span className="material-icons">close</span>
            </button>
            <div 
              className="item-drag-handle"
              {...attributes}
              {...listeners}
            >
              <span className="material-icons">drag_indicator</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="line-wrapper" style={style} ref={setNodeRef}>
            <div className="content-area">
              <textarea
                ref={textareaRef}
                className="line-text-input"
                placeholder="Type or Double tap for checkbox or list"
                value={line.content}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onDoubleClick={handleDoubleClick}
              />
            </div>
          </div>
        );
    }
  };

  return renderContent();
};

export default NoteEditor; 