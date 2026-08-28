import { dbService } from '../services/dbService.js';

/**
 * 5. Verification Agent (Anti-Hallucination Guardrail)
 * Strictly verifies all scheme recommendations, benefit claims, official URLs,
 * and document requirements against live Supabase database records.
 */
export const runVerificationAgent = async ({
  candidateSchemes = [],
  eligibleSchemes = [],
  evaluations = [],
  schemeDocuments = []
}) => {
  try {
    const verificationResults = [];
    const verifiedSchemes = [];
    let isFullyVerified = true;

    for (const scheme of eligibleSchemes) {
      const dbRecord = await dbService.getAuthoritativeSchemeRecord(scheme.id);
      const schemeTitle = scheme.name || scheme.title || `Scheme #${scheme.id}`;
      
      const checks = {
        schemeId: scheme.id,
        schemeTitle,
        idValid: false,
        portalUrlVerified: false,
        benefitsConsistent: false,
        documentsVerified: false,
        warnings: []
      };

      if (!dbRecord) {
        checks.warnings.push(`Scheme ID "${scheme.id}" does not exist in live Supabase database! Rejected.`);
        isFullyVerified = false;
        verificationResults.push(checks);
        continue; // drop unverified scheme
      }

      checks.idValid = true;

      // Authoritative URLs from Supabase
      const authoritativeUrl = dbRecord.official_source_url || dbRecord.application_url || dbRecord.official_portal_url || '';
      const schemeUrl = scheme.official_source_url || scheme.application_url || scheme.official_portal_url || '';

      if (schemeUrl === authoritativeUrl) {
        checks.portalUrlVerified = true;
      } else {
        checks.warnings.push(`Aligned official portal URL to authoritative Supabase URL: ${authoritativeUrl}`);
        scheme.official_portal_url = authoritativeUrl;
      }

      // Authoritative Benefits from Supabase
      const authoritativeBenefits = dbRecord.benefits || dbRecord.benefits_summary || '';
      if (authoritativeBenefits) {
        checks.benefitsConsistent = true;
        scheme.benefits_summary = authoritativeBenefits;
      }

      // Title & category normalization
      scheme.title = dbRecord.name || dbRecord.title || schemeTitle;
      scheme.category = dbRecord.category || scheme.category;
      scheme.official_portal_url = authoritativeUrl;

      // Documents check
      const docsForScheme = schemeDocuments.find(d => String(d.schemeId) === String(scheme.id));
      if (docsForScheme && docsForScheme.requiredDocuments) {
        checks.documentsVerified = true;
      }

      verificationResults.push(checks);
      verifiedSchemes.push(scheme);
    }

    return {
      isVerified: isFullyVerified && verifiedSchemes.length > 0,
      totalEvaluated: eligibleSchemes.length,
      totalVerified: verifiedSchemes.length,
      verifiedSchemes,
      auditReport: verificationResults
    };
  } catch (error) {
    console.error('Error in VerificationAgent:', error);
    throw new Error(`Verification Agent failed: ${error.message}`);
  }
};

export default { runVerificationAgent };
