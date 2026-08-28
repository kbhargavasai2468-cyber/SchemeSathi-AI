import { dbService } from '../services/dbService.js';
import { generateGeminiResponse } from '../services/gemini.js';

/**
 * 2. Scheme Discovery Agent
 * Identifies relevant schemes from the live Supabase database based on user profile.
 * STRICT RULE: Only schemes existing in Supabase are returned.
 */
export const runSchemeDiscoveryAgent = async (userProfile, searchIntent = {}) => {
  try {
    // 1. Fetch real schemes strictly from Supabase database
    const allSchemes = await dbService.getSchemes({
      state: userProfile.state || 'All',
      category: searchIntent.targetCategory || null
    });

    if (!allSchemes || allSchemes.length === 0) {
      return {
        candidateSchemes: [],
        discoverySummary: 'No schemes found in the live Supabase database.'
      };
    }

    // 2. Format Supabase schemes catalog for Gemini to score and rank relevance
    const catalogSummary = allSchemes.map(s => ({
      id: s.id,
      title: s.name || s.title,
      category: s.category,
      description: s.description,
      benefits: s.benefits || s.benefits_summary,
      official_url: s.official_source_url || s.application_url || s.official_portal_url
    }));

    let rankedSchemeIds = [];
    let reasoning = '';

    try {
      const prompt = `You are the Scheme Discovery Agent for SchemeSathi AI.
You have access to the following OFFICIAL Supabase database catalog of ${allSchemes.length} Indian government schemes:
${JSON.stringify(catalogSummary, null, 2)}

User Profile:
- Age: ${userProfile.age ?? 'Not specified'}
- Gender: ${userProfile.gender ?? 'Not specified'}
- Occupation: ${userProfile.occupation ?? 'Not specified'}
- State: ${userProfile.state ?? 'All India'}
- Annual Income: ${userProfile.annualIncome ? `Rs. ${userProfile.annualIncome}` : 'Not specified'}
- Education: ${userProfile.education ?? 'Not specified'}
- Owns Pucca House: ${userProfile.ownsPuccaHouse ?? 'Not specified'}
- Has LPG Connection: ${userProfile.hasLpg ?? 'Not specified'}
- Is Farmer: ${userProfile.isFarmer ?? 'Not specified'}
- Has Bank Account: ${userProfile.hasBankAccount ?? 'Not specified'}

TASK:
Identify and rank which schemes from the PROVIDED Supabase catalog match or should be evaluated for this user.
CRITICAL CONSTRAINT: You MUST ONLY select IDs from the provided catalog. DO NOT invent or mention any scheme not in the catalog.

Return ONLY a valid JSON object matching this schema:
{
  "relevantSchemeIds": [1, 2, 3, 4],
  "discoverySummary": "Concise summary of why these schemes match the user's situation"
}`;

      const aiResponseText = await generateGeminiResponse(prompt);
      const cleanedJson = aiResponseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      if (Array.isArray(parsed.relevantSchemeIds)) {
        rankedSchemeIds = parsed.relevantSchemeIds.map(id => String(id));
        reasoning = parsed.discoverySummary || '';
      }
    } catch (aiErr) {
      console.warn('Gemini discovery ranking fallback:', aiErr.message);
      rankedSchemeIds = allSchemes.map(s => String(s.id));
      reasoning = `Discovered ${allSchemes.length} schemes from live Supabase database.`;
    }

    // Filter candidate schemes strictly to valid Supabase records
    let candidateSchemes = allSchemes.filter(s => rankedSchemeIds.includes(String(s.id)));
    if (candidateSchemes.length === 0) {
      candidateSchemes = allSchemes;
    }

    return {
      candidateSchemes,
      discoverySummary: reasoning || `Retrieved ${candidateSchemes.length} schemes from Supabase.`
    };
  } catch (error) {
    console.error('Error in SchemeDiscoveryAgent:', error);
    throw new Error(`Scheme Discovery Agent failed: ${error.message}`);
  }
};

export default { runSchemeDiscoveryAgent };
