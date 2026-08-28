import { generateGeminiResponse } from '../services/gemini.js';
import { runSchemeDiscoveryAgent } from './discoveryAgent.js';
import { runEligibilityAgent } from './eligibilityAgent.js';
import { runDocumentAgent } from './documentAgent.js';
import { runVerificationAgent } from './verificationAgent.js';
import { runActionPlannerAgent } from './actionPlannerAgent.js';

/**
 * 1. Orchestrator Agent
 * Parses & normalizes user input, manages agent execution pipeline,
 * and formats the final consolidated SchemeSathi assessment response.
 */
export const runOrchestratorWorkflow = async (requestPayload) => {
  const startTime = Date.now();

  try {
    let userProfile = requestPayload.userProfile || {};
    const rawQuery = requestPayload.query || userProfile.query || '';

    // 1. Natural Language Intent Parsing & Entity Normalization (if raw query provided)
    if (rawQuery && (!userProfile.occupation || !userProfile.state || userProfile.age === undefined)) {
      try {
        const nluPrompt = `You are the NLU parser for SchemeSathi AI Orchestrator.
Extract user demographic and socioeconomic profile details from this input:
"${rawQuery}"

Known Profile Fields:
${JSON.stringify(userProfile, null, 2)}

TASK:
Extract any missing profile parameters without contradicting known values.
Valid social categories: General, OBC, SC, ST, EWS.
Target categories: Agriculture, Healthcare, Entrepreneurship & MSME, Housing, Financial Inclusion, Social Welfare, LPG.

Return ONLY a JSON object:
{
  "extractedProfile": {
    "age": number or null,
    "gender": "Male" | "Female" | "All" | null,
    "state": string or null,
    "occupation": string or null,
    "annualIncome": number or null,
    "category": string or null
  },
  "searchIntent": {
    "targetCategory": string or null,
    "primaryGoal": string
  }
}`;

        const nluResponse = await generateGeminiResponse(nluPrompt);
        const cleaned = nluResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed.extractedProfile) {
          userProfile = {
            ...parsed.extractedProfile,
            ...userProfile, // explicit values take priority
            query: rawQuery
          };
        }
      } catch (nluErr) {
        console.warn('Gemini Orchestrator NLU fallback:', nluErr.message);
      }
    }

    const searchIntent = {
      targetCategory: requestPayload.category || null,
      goal: rawQuery || 'Comprehensive scheme assessment'
    };

    // Step 2: Discovery Agent
    const discoveryResult = await runSchemeDiscoveryAgent(userProfile, searchIntent);
    const candidateSchemes = discoveryResult.candidateSchemes || [];

    // Step 3: Eligibility Agent
    const eligibilityResult = await runEligibilityAgent(candidateSchemes, userProfile);
    const eligibleSchemes = eligibilityResult.eligibleSchemes || [];
    const evaluations = eligibilityResult.evaluations || [];

    // Step 4: Document Agent
    const documentResult = await runDocumentAgent(eligibleSchemes, userProfile);
    const schemeDocuments = documentResult.schemeDocuments || [];
    const masterChecklist = documentResult.masterChecklist || [];
    const procurementTips = documentResult.procurementTips || [];

    // Step 5: Verification Agent (Anti-Hallucination Guardrail)
    const verificationResult = await runVerificationAgent({
      candidateSchemes,
      eligibleSchemes,
      evaluations,
      schemeDocuments
    });
    const verifiedSchemes = verificationResult.verifiedSchemes || [];

    // Step 6: Action Planner Agent
    const actionPlan = await runActionPlannerAgent({
      verifiedSchemes,
      masterChecklist,
      userProfile,
      evaluations
    });

    const executionTimeMs = Date.now() - startTime;

    // Consolidated Output Response
    return {
      success: true,
      assessmentId: `ss-${Date.now()}`,
      metadata: {
        timestamp: new Date().toISOString(),
        executionTimeMs,
        agentsExecuted: [
          'OrchestratorAgent',
          'SchemeDiscoveryAgent',
          'EligibilityAgent',
          'DocumentAgent',
          'VerificationAgent',
          'ActionPlannerAgent'
        ],
        antiHallucinationVerified: verificationResult.isVerified
      },
      userProfile: {
        age: userProfile.age ?? null,
        gender: userProfile.gender ?? 'All',
        state: userProfile.state ?? 'All India',
        occupation: userProfile.occupation ?? 'General',
        annualIncome: userProfile.annualIncome ?? null,
        category: userProfile.category ?? 'General',
        education: userProfile.education ?? null,
        hasBankAccount: userProfile.hasBankAccount ?? null,
        hasLpg: userProfile.hasLpg ?? null,
        ownsPuccaHouse: userProfile.ownsPuccaHouse ?? null,
        isFarmer: userProfile.isFarmer ?? null
      },
      summary: {
        totalDiscovered: candidateSchemes.length,
        totalEligible: eligibleSchemes.length,
        totalVerified: verifiedSchemes.length,
        discoverySummary: discoveryResult.discoverySummary,
        overallRoadmapSummary: actionPlan.summary
      },
      verifiedEligibleSchemes: verifiedSchemes.map(scheme => {
        const evalItem = evaluations.find(e => String(e.schemeId) === String(scheme.id));
        const docs = schemeDocuments.find(d => String(d.schemeId) === String(scheme.id));
        return {
          id: scheme.id,
          title: scheme.name || scheme.title,
          category: scheme.category,
          benefitSummary: scheme.benefits || scheme.benefits_summary,
          officialPortalUrl: scheme.official_source_url || scheme.application_url || scheme.official_portal_url,
          eligibilityStatus: evalItem?.status || 'ELIGIBLE',
          eligibilityScore: evalItem?.score || 100,
          eligibilityExplanation: evalItem?.explanation || '',
          passedCriteria: evalItem?.passedCriteria || [],
          requiredDocuments: docs?.requiredDocuments || []
        };
      }),
      allEvaluations: evaluations,
      documentChecklist: {
        masterChecklist,
        procurementTips
      },
      verificationAudit: verificationResult.auditReport,
      roadmap: actionPlan
    };
  } catch (error) {
    console.error('Workflow Pipeline Error in OrchestratorAgent:', error);
    throw error;
  }
};

export default { runOrchestratorWorkflow };
