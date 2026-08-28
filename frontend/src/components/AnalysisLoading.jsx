import React, { useState, useEffect } from 'react';

const ANALYSIS_STEPS = [
  'Understanding your information',
  'Finding relevant schemes',
  'Checking eligibility',
  'Checking documents',
  'Verifying information',
  'Preparing your action plan'
];

export const AnalysisLoading = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="analysis-container">
      <div className="spinner-icon"></div>
      <h2 className="analysis-title">Analyzing Your Eligibility</h2>
      <p className="analysis-subtitle">
        We are checking your details against verified government schemes. This takes just a few moments.
      </p>

      <div className="progress-steps-list">
        {ANALYSIS_STEPS.map((stepText, idx) => {
          const isDone = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <div
              key={stepText}
              className={`progress-step-item ${isDone ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              <span className="step-icon-check">
                {isDone ? '✓' : (isActive ? '●' : '○')}
              </span>
              <span>{stepText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisLoading;
