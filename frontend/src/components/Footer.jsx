import React from 'react';

export const Footer = ({ onNavigate }) => {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-nav">
          <button className="footer-link" onClick={() => onNavigate('home')} type="button">
            Home
          </button>
          <span className="footer-dot">•</span>
          <button className="footer-link" onClick={() => onNavigate('how-it-works')} type="button">
            How It Works
          </button>
          <span className="footer-dot">•</span>
          <button className="footer-link" onClick={() => onNavigate('about')} type="button">
            About
          </button>
          <span className="footer-dot">•</span>
          <button className="footer-link" onClick={() => onNavigate('profile')} type="button">
            Check Eligibility
          </button>
        </div>

        <div className="footer-disclaimer-box">
          <p className="footer-disclaimer-text">
            <strong>Disclaimer:</strong> SchemeSathi AI provides guidance based on its verified scheme database. Please confirm the latest details on the official government portal before applying.
          </p>
        </div>

        <p className="footer-copy">
          SchemeSathi AI is a citizen guidance portal. All scheme benefits and official links are sourced from government departments.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
