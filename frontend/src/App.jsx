import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import ProfileForm from './components/ProfileForm';
import AnalysisLoading from './components/AnalysisLoading';
import ResultsView from './components/ResultsView';
import ErrorView from './components/ErrorView';
import { API_BASE_URL } from './config/api';
import './App.css';

export function App() {
  const [currentStep, setCurrentStep] = useState('home'); // 'home' | 'profile' | 'loading' | 'results' | 'error'
  const [userProfile, setUserProfile] = useState(null);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleNavigate = (target) => {
    if (target === 'home') {
      setCurrentStep('home');
      setErrorMessage('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'how-it-works') {
      if (currentStep !== 'home') {
        setCurrentStep('home');
        setTimeout(() => {
          const el = document.getElementById('how-it-works');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById('how-it-works');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (target === 'about') {
      if (currentStep !== 'home') {
        setCurrentStep('home');
        setTimeout(() => {
          const el = document.getElementById('about');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById('about');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (target === 'profile') {
      setCurrentStep('profile');
      setErrorMessage('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStart = () => {
    setCurrentStep('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const runAssessment = async (profileData) => {
    setUserProfile(profileData);
    setCurrentStep('loading');
    setErrorMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const response = await fetch(`${API_BASE_URL}/api/assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userProfile: profileData
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || `Server responded with status ${response.status}`);
      }

      setAssessmentResult(data);
      setCurrentStep('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Assessment API Error:', err);
      setErrorMessage(err.message || 'Failed to complete scheme assessment. Please ensure the backend server is running.');
      setCurrentStep('error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRetry = () => {
    if (userProfile) {
      runAssessment(userProfile);
    } else {
      setCurrentStep('profile');
    }
  };

  return (
    <div className="app-container">
      <Header onNavigate={handleNavigate} currentStep={currentStep} />

      <main className="main-content">
        {currentStep === 'home' && (
          <HomePage onStart={handleStart} />
        )}

        {currentStep === 'profile' && (
          <ProfileForm
            onSubmit={runAssessment}
            onBack={() => handleNavigate('home')}
          />
        )}

        {currentStep === 'loading' && (
          <AnalysisLoading />
        )}

        {currentStep === 'results' && (
          <ResultsView
            result={assessmentResult}
            userProfile={userProfile}
            onReset={() => handleNavigate('profile')}
          />
        )}

        {currentStep === 'error' && (
          <ErrorView
            message={errorMessage}
            onRetry={handleRetry}
            onGoHome={() => handleNavigate('home')}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
