import React from 'react';

export const HomePage = ({ onStart }) => {
  return (
    <div className="home-page">
      {/* 1. Main Hero Section */}
      <section className="home-hero">
        <span className="home-badge">Citizen Service Portal</span>
        <h1 className="home-heading">Find Government Schemes You May Qualify For</h1>
        <p className="home-subheading">
          Enter your basic details and get relevant government schemes, clear eligibility information, 
          required documents, and next steps to apply.
        </p>

        <button className="btn-primary" onClick={onStart} type="button">
          Find My Schemes →
        </button>

        <div className="trust-points-bar">
          <div className="trust-item">
            <span className="trust-check">✓</span> Verified Scheme Information
          </div>
          <div className="trust-item">
            <span className="trust-check">✓</span> Personalised Results
          </div>
          <div className="trust-item">
            <span className="trust-check">✓</span> Official Sources
          </div>
        </div>
      </section>

      {/* 2. Why SchemeSathi? Section */}
      <section className="info-section">
        <h2 className="section-title">Why SchemeSathi?</h2>
        <p className="section-subtitle">
          A trustworthy, simple way to discover government welfare benefits without confusion.
        </p>

        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon">🛡️</div>
            <h3 className="why-title">Verified Information</h3>
            <p className="why-desc">
              All scheme guidelines, eligibility rules, and official links come directly from our verified government scheme database.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">👤</div>
            <h3 className="why-title">Personalised Results</h3>
            <p className="why-desc">
              We check your specific age, occupation, state, and income to show you only the schemes you may actually qualify for.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">🗺️</div>
            <h3 className="why-title">Clear Next Steps</h3>
            <p className="why-desc">
              Get an easy-to-follow action plan with required documents and direct links to official government portals to apply.
            </p>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works" className="info-section">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Find your schemes in four simple steps.</p>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3 className="step-title">Tell Us About You</h3>
            <p className="step-desc">
              Enter basic details like your age, state, occupation, and family background.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3 className="step-title">Check Your Eligibility</h3>
            <p className="step-desc">
              Our system checks your information against verified scheme rules.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3 className="step-title">Find Matching Schemes</h3>
            <p className="step-desc">
              See your matching schemes, exact benefits, and required documents list.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <h3 className="step-title">Follow the Next Steps</h3>
            <p className="step-desc">
              Follow your simple action plan and open the official government portal to apply.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Who Can Use SchemeSathi? Section */}
      <section className="info-section">
        <h2 className="section-title">Who Can Use SchemeSathi?</h2>
        <p className="section-subtitle">
          Any Indian citizen can enter their basic details to find schemes that match their situation.
        </p>

        <div className="audience-grid">
          <div className="audience-card">
            <h4 className="audience-title">Students & Youth</h4>
            <p className="audience-desc">Find financial support, banking services, and educational welfare programs.</p>
          </div>

          <div className="audience-card">
            <h4 className="audience-title">Farmers & Rural Families</h4>
            <p className="audience-desc">Check income assistance, agricultural benefits, and rural housing schemes.</p>
          </div>

          <div className="audience-card">
            <h4 className="audience-title">Women & Households</h4>
            <p className="audience-desc">Explore clean cooking fuel subsidies (LPG), healthcare, and welfare support.</p>
          </div>

          <div className="audience-card">
            <h4 className="audience-title">Urban & Working Families</h4>
            <p className="audience-desc">Discover urban housing assistance (PMAY) and basic financial inclusion facilities.</p>
          </div>
        </div>
      </section>

      {/* 5. About SchemeSathi AI Section */}
      <section id="about" className="about-section">
        <div className="about-card">
          <h2 className="section-title">About SchemeSathi AI</h2>
          <p className="about-text">
            SchemeSathi AI helps citizens find government schemes that may match their situation. 
            It checks their information against a verified scheme database and provides eligibility, 
            document requirements, and next steps.
          </p>

          <div style={{ marginTop: '1.5rem' }}>
            <button className="btn-primary" onClick={onStart} type="button">
              Check Your Eligibility Now →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
