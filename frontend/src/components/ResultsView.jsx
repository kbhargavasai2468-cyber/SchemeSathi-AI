import React from 'react';

export const ResultsView = ({ result, userProfile, onReset }) => {
  if (!result) return null;

  const verifiedSchemes = result.verifiedEligibleSchemes || [];
  const masterChecklist = result.documentChecklist?.masterChecklist || [];
  const procurementTips = result.documentChecklist?.procurementTips || [];
  const roadmap = result.roadmap || {};
  const roadmapPhases = roadmap.phases || [];

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
        🛡️ <strong>Verified Information:</strong> Information is based on our verified government scheme database. Always verify details on the official portal before applying.
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
                  <div className="scheme-section-label">Benefits</div>
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
                      onClick={() => scrollToSection('your-action-plan')}
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
            Gather these documents before applying for your matching schemes.
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

      {/* FINAL ACTION PLAN SECTION */}
      <section id="your-action-plan" className="roadmap-section">
        <div className="roadmap-header">
          <h2 className="roadmap-title">Your Action Plan</h2>
          <p className="roadmap-summary">
            Follow this simple step-by-step guide to complete your application on the official government portal.
          </p>
        </div>

        {/* 5-Step Clear Action Guide */}
        <div className="action-plan-steps-list">
          {/* Step 1 */}
          <div className="action-step-card">
            <div className="action-step-header">
              <span className="action-step-num">1</span>
              <h3 className="action-step-title">Get Your Documents</h3>
            </div>
            <p className="action-step-desc">
              Collect all required documents listed above (such as your Aadhaar card, income certificate, and bank details) and make sure your details match identically.
            </p>
            {masterChecklist.length > 0 && (
              <div className="action-step-docs-mini">
                <strong>Documents to arrange:</strong> {masterChecklist.map(d => d.name).join(', ')}
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div className="action-step-card">
            <div className="action-step-header">
              <span className="action-step-num">2</span>
              <h3 className="action-step-title">Apply for the Scheme</h3>
            </div>
            <p className="action-step-desc">
              Visit the verified official government portal. Look for the "New Registration" or "Citizen Assessment" section and fill in your details accurately.
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
                    Open {s.title} Portal ({s.officialPortalUrl}) ↗
                  </a>
                ) : null)}
              </div>
            )}
          </div>

          {/* Step 3 */}
          <div className="action-step-card">
            <div className="action-step-header">
              <span className="action-step-num">3</span>
              <h3 className="action-step-title">Submit Your Documents</h3>
            </div>
            <p className="action-step-desc">
              Upload clear, readable copies of your documents on the official portal, or submit self-attested photocopies if applying through your local bank or Common Service Centre (CSC).
            </p>
          </div>

          {/* Step 4 */}
          <div className="action-step-card">
            <div className="action-step-header">
              <span className="action-step-num">4</span>
              <h3 className="action-step-title">Save Your Application Details</h3>
            </div>
            <p className="action-step-desc">
              Once you submit, save your Application Number / Acknowledgment Slip. Take a screenshot or print the receipt for future reference.
            </p>
          </div>

          {/* Step 5 */}
          <div className="action-step-card">
            <div className="action-step-header">
              <span className="action-step-num">5</span>
              <h3 className="action-step-title">Track Your Application</h3>
            </div>
            <p className="action-step-desc">
              Check your application status periodically on the official government portal using your Application Number.
            </p>
          </div>
        </div>

        {/* Prominent Official Portal Button */}
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
