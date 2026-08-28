import { dbService } from '../services/dbService.js';
import { generateGeminiResponse } from '../services/gemini.js';

/**
 * 3. Eligibility Agent
 * Evaluates candidate schemes against Supabase eligibility rules and domain criteria deterministically,
 * and uses Gemini to synthesize clear, plain-language explanations.
 */
export const runEligibilityAgent = async (candidateSchemes, userProfile) => {
  try {
    if (!candidateSchemes || candidateSchemes.length === 0) {
      return {
        evaluations: [],
        eligibleSchemes: []
      };
    }

    const schemeIds = candidateSchemes.map(s => s.id);
    const rules = await dbService.getEligibilityRules(schemeIds);

    const evaluations = [];

    for (const scheme of candidateSchemes) {
      const schemeTitle = scheme.name || scheme.title || `Scheme #${scheme.id}`;
      const schemeCategory = (scheme.category || '').toLowerCase();
      const schemeNameLower = schemeTitle.toLowerCase();

      const schemeRule = rules.find(r => String(r.scheme_id) === String(scheme.id));
      
      const passedCriteria = [];
      const failedCriteria = [];
      const unclearCriteria = [];

      let isEligible = true;
      let score = 100;

      // 1. Evaluate database rules if present
      if (schemeRule) {
        if (schemeRule.min_age !== null && schemeRule.min_age !== undefined) {
          if (userProfile.age !== undefined && userProfile.age !== null) {
            if (userProfile.age >= schemeRule.min_age) {
              passedCriteria.push(`Age (${userProfile.age}) meets minimum requirement of ${schemeRule.min_age} years`);
            } else {
              isEligible = false;
              score -= 30;
              failedCriteria.push(`Age (${userProfile.age}) is below minimum requirement of ${schemeRule.min_age} years`);
            }
          }
        }

        if (schemeRule.max_annual_income !== null && schemeRule.max_annual_income !== undefined) {
          if (userProfile.annualIncome !== undefined && userProfile.annualIncome !== null) {
            if (userProfile.annualIncome <= schemeRule.max_annual_income) {
              passedCriteria.push(`Annual income (Rs. ${userProfile.annualIncome}) is within threshold of Rs. ${schemeRule.max_annual_income}`);
            } else {
              isEligible = false;
              score -= 40;
              failedCriteria.push(`Annual income exceeds ceiling of Rs. ${schemeRule.max_annual_income}`);
            }
          }
        }
      }

      // 2. Evaluate domain criteria based on scheme category and user profile
      if (schemeCategory.includes('agri') || schemeNameLower.includes('pm-kisan') || schemeNameLower.includes('kisan')) {
        if (userProfile.isFarmer === false) {
          isEligible = false;
          score = 0;
          failedCriteria.push('Applicant is not a landholding farmer (isFarmer: false)');
        } else if (userProfile.isFarmer === true) {
          passedCriteria.push('Applicant is a landholding farmer');
        }
      }

      if (schemeCategory.includes('lpg') || schemeNameLower.includes('ujjwala') || schemeNameLower.includes('pmuy')) {
        if (userProfile.hasLpg === true) {
          isEligible = false;
          score = 0;
          failedCriteria.push('Applicant household already has an active LPG connection (hasLpg: true)');
        }
        if (userProfile.gender && userProfile.gender.toLowerCase() === 'male') {
          isEligible = false;
          score = 0;
          failedCriteria.push('PMUY LPG connections are issued exclusively in the name of adult women');
        }
      }

      if (schemeCategory.includes('housing') || schemeNameLower.includes('pmay') || schemeNameLower.includes('awas')) {
        if (userProfile.ownsPuccaHouse === true) {
          isEligible = false;
          score -= 50;
          failedCriteria.push('Applicant already owns a pucca house');
        } else if (userProfile.ownsPuccaHouse === false) {
          passedCriteria.push('Applicant does not own a pucca house (ownsPuccaHouse: false)');
        }

        if (userProfile.annualIncome && userProfile.annualIncome <= 300000) {
          passedCriteria.push(`Annual income (Rs. ${userProfile.annualIncome}) meets EWS housing subsidy threshold`);
        }
      }

      if (schemeCategory.includes('financial') || schemeNameLower.includes('jan-dhan') || schemeNameLower.includes('pmjdy')) {
        if (userProfile.age && userProfile.age >= 10) {
          passedCriteria.push(`Age (${userProfile.age}) meets minimum requirement of 10 years for basic savings account`);
        }
        if (userProfile.hasBankAccount === true) {
          unclearCriteria.push('Applicant already has a bank account; can still access RuPay card, accidental insurance, and overdraft benefits under PMJDY');
        }
      }

      if (passedCriteria.length === 0 && failedCriteria.length === 0) {
        passedCriteria.push('General eligibility criteria met');
      }

      const status = isEligible && failedCriteria.length === 0
        ? (unclearCriteria.length > 0 ? 'PARTIALLY_ELIGIBLE' : 'ELIGIBLE')
        : 'INELIGIBLE';

      evaluations.push({
        schemeId: scheme.id,
        schemeTitle,
        status,
        score: Math.max(score, 0),
        passedCriteria,
        failedCriteria,
        unclearCriteria,
        specificCriteria: scheme.description || ''
      });
    }

    // Use Gemini to generate plain-language personalized explanations for each scheme
    try {
      const explanationPrompt = `You are the Eligibility Agent for SchemeSathi AI.
Generate clear, empathetic, and factual plain-language eligibility explanations for the user based strictly on these deterministic evaluation results:

User Profile:
${JSON.stringify(userProfile, null, 2)}

Deterministic Evaluations:
${JSON.stringify(evaluations, null, 2)}

TASK:
For each scheme evaluated above, provide a 1-2 sentence human-friendly explanation explaining WHY they qualify or why they are ineligible.
CRITICAL: Do NOT change the eligibility status or invent new rules.

Return ONLY a JSON array of objects:
[
  {
    "schemeId": 1,
    "explanation": "Clear plain language explanation..."
  }
]`;

      const aiResponse = await generateGeminiResponse(explanationPrompt);
      const cleanedJson = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      const explanationList = JSON.parse(cleanedJson);

      if (Array.isArray(explanationList)) {
        for (const exp of explanationList) {
          const targetEval = evaluations.find(e => String(e.schemeId) === String(exp.schemeId));
          if (targetEval && exp.explanation) {
            targetEval.explanation = exp.explanation;
          }
        }
      }
    } catch (aiErr) {
      console.warn('Gemini eligibility explanation fallback:', aiErr.message);
      for (const ev of evaluations) {
        if (!ev.explanation) {
          ev.explanation = ev.status === 'ELIGIBLE'
            ? `You meet the eligibility requirements for ${ev.schemeTitle}.`
            : (ev.status === 'PARTIALLY_ELIGIBLE'
              ? `You appear partially eligible for ${ev.schemeTitle}, subject to verification.`
              : `You are not eligible for ${ev.schemeTitle} based on the evaluation criteria.`);
        }
      }
    }

    // Filter schemes that are ELIGIBLE or PARTIALLY_ELIGIBLE
    const eligibleSchemeIds = evaluations
      .filter(e => e.status === 'ELIGIBLE' || e.status === 'PARTIALLY_ELIGIBLE')
      .map(e => String(e.schemeId));

    const eligibleSchemes = candidateSchemes.filter(s => eligibleSchemeIds.includes(String(s.id)));

    return {
      evaluations,
      eligibleSchemes
    };
  } catch (error) {
    console.error('Error in EligibilityAgent:', error);
    throw new Error(`Eligibility Agent failed: ${error.message}`);
  }
};

export default { runEligibilityAgent };
