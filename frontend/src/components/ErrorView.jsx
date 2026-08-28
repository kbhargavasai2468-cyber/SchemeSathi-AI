import React from 'react';

export const ErrorView = ({ message, onRetry, onGoHome }) => {
  return (
    <div className="analysis-container" style={{ borderColor: 'var(--danger-border)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
      <h2 className="analysis-title" style={{ color: 'var(--danger)' }}>
        Assessment Could Not Be Completed
      </h2>
      <p className="analysis-subtitle">
        {message || 'An error occurred while connecting to the assessment service. Please check your backend connection and try again.'}
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
        {onRetry && (
          <button className="btn-primary" onClick={onRetry} type="button">
            Try Again
          </button>
        )}
        <button className="btn-secondary" onClick={onGoHome} type="button">
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ErrorView;
