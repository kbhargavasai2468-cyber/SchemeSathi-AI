import React from 'react';

export const ResultsView = ({ result, userProfile, onReset }) => {
  if (!result) return null;

  const verifiedSchemes = result.verifiedEligibleSchemes || [];
  const masterChecklist = result.documentChecklist?.masterChecklist || [];
  const procurementTips = result.documentChecklist?.procurementTips || [];
  const roadmap = result.roadmap || {};

  // Metrics counts
  const eligibleCount = verifiedSchemes.filter(s => s.eligibilityStatus === 'ELIGIBLE').length;
  const partiallyEligibleCount = verifiedSchemes.filter(s => s.eligibilityStatus === 'PARTIALLY_ELIGIBLE').length;
  const totalFound = verifiedSchemes.length;

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Extract primary official portal URL from the first verified scheme if available
  const primaryOfficialUrl = verifiedSchemes.find(s => s.officialPortalUrl)?.officialPortalUrl || null;

  return (
    <div className="results-page">
      {/* Top Header & Metrics Bar */}
      <div className="results-header">
        <div className="results-top-row">
          <div>
            <h1 className="results-heading">Your Scheme Results</h1>
            <p className="results-summary-count">
              We checked your details against our verified government scheme database.
            </p>
          </div>

          <button className="btn-secondary" onClick={onReset} type="button">
            ↻ Check Another Profile
          </button>
        </div>

        {/* Status Metrics Cards */}
        <div className="metrics-summary-bar">
          <div className="metric-box">
            <span className="metric-number">{totalFound}</span>
            <span className="metric-label">Schemes Found</span>
          </div>
          <div className="metric-box eligible">
            <span className="metric-number">{eligibleCount}</span>
            <span className="metric-label">Eligible</span>
          </div>
          <div className="metric-box partial">
            <span className="metric-number">{partiallyEligibleCount}</span>
            <span className="metric-label">Partially Eligible</span>
          </div>
        </div>

        {/* Short Profile Summary */}
        <div className="profile-pill-card">
          <div className="profile-pill-item">
            Age: <strong>{userProfile.age} yrs</strong>
          </div>
          <div className="profile-pill-item">
            Gender: <strong>{userProfile.gender}</strong>
          </div>
          <div className="profile-pill-item">
            State: <strong>{userProfile.state}</strong>
          </div>
          <div className="profile-pill-item">
            Occupation: <strong>{userProfile.occupation}</strong>
          </div>
          <div className="profile-pill-item">
            Annual Income: <strong>₹{Number(userProfile.annualIncome).toLocaleString('en-IN')}</strong>
          </div>
          {userProfile.education && (
            <div className="profile-pill-item">
              Education: <strong>{userProfile.education}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Trust Notice */}
      <div className="trust-banner">
        🛡️ <strong>Verified Information:</strong> Recommendations are derived directly from official government scheme rules and verified portals.
      </div>

      {/* Scheme Cards List */}
      <div className="schemes-list">
        {verifiedSchemes.length === 0 ? (
          <div className="scheme-card status-ineligible">
            <h3 className="scheme-card-title">No Matching Schemes Found</h3>
            <p className="scheme-benefits-text" style={{ marginTop: '0.5rem' }}>
              Based on your details, no matching schemes were found in our verified database.
            </p>
          </div>
        ) : (
          verifiedSchemes.map((scheme, idx) => {
            const isEligible = scheme.eligibilityStatus === 'ELIGIBLE';
            const isPartial = scheme.eligibilityStatus === 'PARTIALLY_ELIGIBLE';
            const statusClass = isEligible ? 'status-eligible' : (isPartial ? 'status-partial' : 'status-ineligible');
            const badgeClass = isEligible ? 'badge-eligible' : (isPartial ? 'badge-partial' : 'badge-ineligible');
            const statusLabel = isEligible ? 'Eligible' : (isPartial ? 'Partially Eligible' : 'Not Eligible');

            return (
              <div key={scheme.id || idx} className={`scheme-card ${statusClass}`}>
                <div className="scheme-card-header">
                  <div>
                    <h2 className="scheme-card-title">{scheme.title}</h2>
                    {scheme.category && (
                      <span className="scheme-category-tag">{scheme.category}</span>
                    )}
                  </div>
                  <span className={`badge ${badgeClass}`}>
                    {isEligible ? '● ' : '◐ '}{statusLabel}
                  </span>
                </div>

                {/* Why this scheme may help you */}
                <div className="scheme-section-block">
                  <div className="scheme-section-label">Why this scheme may help you</div>
                  <p className="scheme-explanation-text">
                    {scheme.eligibilityExplanation || 'Information not available in our verified database.'}
                  </p>
                </div>

                {/* Benefits */}
                <div className="scheme-section-block">
                  <div className="scheme-section-label">Official Benefits</div>
                  <p className="scheme-benefits-text">
                    {scheme.benefitSummary || 'Information not available in our verified database.'}
                  </p>
                </div>

                {/* Required Documents */}
                <div className="scheme-section-block">
                  <div className="scheme-section-label">Required Documents</div>
                  {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 ? (
                    <div className="docs-tag-list">
                      {scheme.requiredDocuments.map((doc, dIdx) => (
                        <span key={dIdx} className={`doc-tag ${doc.isMandatory ? 'mandatory' : ''}`}>
                          {doc.isMandatory ? '📄 ' : '📋 '}{doc.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="scheme-empty-notice">Information not available in our verified database.</p>
                  )}
                </div>

                {/* Official Government Source & Action Buttons */}
                <div className="scheme-card-footer">
                  {scheme.officialPortalUrl ? (
                    <div className="scheme-source-info">
                      <span className="source-label">Official Source: </span>
                      <a 
                        href={scheme.officialPortalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="source-link"
                      >
                        {scheme.officialPortalUrl}
                      </a>
                    </div>
                  ) : (
                    <span className="source-label">Official Source: Information not available in our verified database.</span>
                  )}

                  <div className="scheme-card-buttons">
                    <button 
                      type="button" 
                      className="btn-action-jump"
                      onClick={() => scrollToSection('what-to-do-next')}
                    >
                      See What To Do ↓
                    </button>

                    {scheme.officialPortalUrl && (
                      <a
                        href={scheme.officialPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-portal-link"
                      >
                        View Official Source ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Deduplicated Required Documents Checklist */}
      {masterChecklist.length > 0 && (
        <section className="docs-checklist-card">
          <h2 className="section-title">Required Documents Checklist</h2>
          <p className="section-subtitle">
            Gather these documents before starting your application on the official government portals.
          </p>

          <div className="checklist-items-grid">
            {masterChecklist.map((doc, idx) => (
              <div key={idx} className="checklist-item">
                <div className="checklist-item-title">
                  <span>📄</span>
                  <span>{doc.name}</span>
                </div>
                {doc.issuingAuthority && (
                  <div className="checklist-item-desc">
                    Issued by: {doc.issuingAuthority}
                  </div>
                )}
                {doc.guidance && (
                  <div className="checklist-item-desc">
                    {doc.guidance}
                  </div>
                )}
              </div>
            ))}
          </div>

          {procurementTips.length > 0 && (
            <div className="tips-box">
              <div className="tips-box-title">💡 Important Preparation Tips</div>
              <ul className="tips-list">
                {procurementTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* FINAL WHAT TO DO NEXT / APPLICATION SUMMARY SECTION */}
      <section id="what-to-do-next" className="roadmap-section">
        <div className="roadmap-header">
          <h2 className="roadmap-title">What To Do Next</h2>
          <p className="roadmap-summary">
            A simple, clear summary to guide your application from start to finish.
          </p>
        </div>

        {/* 5-Step Action Summary */}
        <div className="action-plan-steps-list">
          {/* 1. Documents to prepare */}
          <div className="action-step-card">
            <div className="action-step-header">
              <span className="action-step-num">1</span>
              <h3 className="action-step-title">Documents to Prepare</h3>
            </div>
            <p className="action-step-desc">
              Arrange your mandatory documents (Aadhaar Card, income proof, and bank passbook). Ensure names and dates of birth match exactly across all identity proofs.
            </p>
            {masterChecklist.length > 0 && (
              <div className="action-step-docs-mini">
                <strong>Checklist:</strong> {masterChecklist.map(d => d.name).join(', ')}
              </div>
            )}
          </div>

          {/* 2. Where to apply */}
          <div className="action-step-card">
            <div className="action-step-header">
              <span className="action-step-num">2</span>
              <h3 className="action-step-title">Where to Apply</h3>
            </div>
            <p className="action-step-desc">
              Apply directly on the verified official government portal for each scheme, or visit your nearest Common Service Centre (CSC) or designated bank branch.
            </p>
            {verifiedSchemes.length > 0 && (
              <div className="action-step-links-list">
                {verifiedSchemes.map((s, idx) => s.officialPortalUrl ? (
                  <a
                    key={idx}
                    href={s.officialPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-portal-btn"
                  >
                    {s.title} Portal ({s.officialPortalUrl}) ↗
                  </a>
                ) : null)}
              </div>
            )}
          </div>

          {/* 3. How to apply */}
          <div className="action-step-card">
            <div className="action-step-header">
              <span className="action-step-num">3</span>
              <h3 className="action-step-title">How to Apply</h3>
            </div>
            <p className="action-step-desc">
              Open the official portal, click on "Citizen Registration" / "New Application", fill in your details accurately, and upload clear scanned copies of your prepared documents.
            </p>
          </div>

          {/* 4. Official application link */}
          <div className="action-step-card">
            <div className="action-step-header">
              <span className="action-step-num">4</span>
              <h3 className="action-step-title">Official Application Link</h3>
            </div>
            <p className="action-step-desc">
              Always use the official government portal links verified by SchemeSathi AI. Never pay fees on unofficial or third-party websites.
            </p>
          </div>

          {/* 5. What to do after applying */}
          <div className="action-step-card">
            <div className="action-step-header">
              <span className="action-step-num">5</span>
              <h3 className="action-step-title">What to Do After Applying</h3>
            </div>
            <p className="action-step-desc">
              Download and save your Application Acknowledgment Slip. Keep your Application Reference ID safe to track your status on the official portal.
            </p>
          </div>
        </div>

        {/* Prominent Official Portal CTA Button */}
        {primaryOfficialUrl ? (
          <div className="portal-cta-banner">
            <div>
              <h4 className="portal-cta-title">Ready to Apply?</h4>
              <p className="portal-cta-sub">
                Visit the official government portal directly to submit your application.
              </p>
            </div>
            <a
              href={primaryOfficialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-portal"
            >
              Open Official Government Portal →
            </a>
          </div>
        ) : (
          <p className="scheme-empty-notice" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            Official government link: Information not available in our verified database.
          </p>
        )}
      </section>
    </div>
  );
};

export default ResultsView;
