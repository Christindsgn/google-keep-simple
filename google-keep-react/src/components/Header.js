import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <button className="back-button">
            <span className="material-icons">arrow_back</span>
          </button>
          <h1 className="app-title">Keep</h1>
        </div>
        
        <div className="header-right">
          <button className="header-icon" title="Desktop view">
            <span className="material-icons">desktop_windows</span>
          </button>
          <button className="header-icon" title="Upload">
            <span className="material-icons">cloud_upload</span>
          </button>
          <button className="header-icon" title="Download">
            <span className="material-icons">cloud_download</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 