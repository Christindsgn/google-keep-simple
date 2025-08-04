import React from 'react';

const Toolbar = ({ onAddLine }) => {
  return (
    <div className="toolbar">
      <div className="toolbar-content">
        <button className="toolbar-button" onClick={onAddLine} title="Add">
          <span className="material-icons">add</span>
        </button>
        <button className="toolbar-button" title="More options">
          <span className="material-icons">more_vert</span>
        </button>
        <button className="toolbar-button" title="Text formatting">
          <span className="material-icons">format_bold</span>
        </button>
        <button className="toolbar-button" title="Undo">
          <span className="material-icons">undo</span>
        </button>
        <button className="toolbar-button" title="Redo">
          <span className="material-icons">redo</span>
        </button>
        <button className="toolbar-button" title="Note options">
          <span className="material-icons">more_horiz</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar; 