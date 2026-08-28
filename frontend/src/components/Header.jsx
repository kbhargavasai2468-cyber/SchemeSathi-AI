import React from 'react';

export const Header = ({ onNavigate, currentStep }) => {
  return (
    <>
      <div className="gov-top-bar">
        <span>Official Government Schemes Eligibility & Action Guide</span>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <button className="brand-logo" onClick={() => onNavigate('home')} type="button">
            <span className="brand-badge">SchemeSathi</span>
            <div>
              <span className="brand-title">SchemeSathi AI</span>
              <span className="brand-subtitle">Citizen Scheme Advisory Portal</span>
            </div>
          </button>

          <nav className="header-nav">
            <button 
              className={`nav-link-btn ${currentStep === 'home' ? 'active' : ''}`} 
              onClick={() => onNavigate('home')}
              type="button"
            >
              Home
            </button>
            <button 
              className="nav-link-btn" 
              onClick={() => onNavigate('how-it-works')}
              type="button"
            >
              How It Works
            </button>
            <button 
              className="nav-link-btn" 
              onClick={() => onNavigate('about')}
              type="button"
            >
              About
            </button>
            <button 
              className="nav-cta-btn" 
              onClick={() => onNavigate('profile')}
              type="button"
            >
              Start Assessment →
            </button>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
