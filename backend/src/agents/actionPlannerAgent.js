import { generateGeminiResponse } from '../services/gemini.js';

/**
 * 6. Action Planner Agent
 * Creates a chronological, step-by-step personalized application roadmap
 * structured across 3 sequential phases with verified Supabase portal URLs.
 */
export const runActionPlannerAgent = async ({
  verifiedSchemes = [],
  masterChecklist = [],
  userProfile = {},
  evaluations = []
}) => {
  try {
    if (!verifiedSchemes || verifiedSchemes.length === 0) {
      return {
        summary: 'No eligible schemes identified to generate an action plan.',
        phases: [],
        timelineEstimate: 'N/A'
      };
    }

    const schemeContext = verifiedSchemes.map(s => ({
      id: s.id,
      title: s.name || s.title,
      category: s.category,
      officialPortal: s.official_portal_url || s.official_source_url || s.application_url,
      benefits: s.benefits || s.benefits_summary
    }));

    let roadmapData = null;

    try {
      const plannerPrompt = `You are the Action Planner Agent for SchemeSathi AI.
Generate a structured, chronological step-by-step application roadmap for the user for the following verified schemes:
${JSON.stringify(schemeContext, null, 2)}

Required Documents Checklist:
${JSON.stringify(masterChecklist, null, 2)}

User Profile:
- Name/Occupation: ${userProfile.occupation || 'Applicant'}
- State: ${userProfile.state || 'India'}
- Education: ${userProfile.education || 'N/A'}

TASK:
Generate a concrete 3-phase application roadmap:
- Phase 1: "Document Preparation & Readiness" (Collecting mandatory docs, Aadhaar linkage, bank seeding)
- Phase 2: "Application Submission" (Step-by-step portal filing with official links strictly from context)
- Phase 3: "Tracking & Benefit Disbursement" (Reference receipt, status tracking, verification timeline)

CRITICAL: ONLY use the official URLs provided in the scheme context. Do not fabricate URLs.

Return ONLY a valid JSON object matching this schema:
{
  "summary": "High level guidance summary...",
  "timelineEstimate": "e.g. 2 - 4 Weeks",
  "phases": [
    {
      "phaseNumber": 1,
      "phaseName": "Document Preparation & Readiness",
      "estimatedDays": "1-3 Days",
      "steps": [
        {
          "stepNumber": 1,
          "title": "Step title",
          "description": "Clear actionable instruction",
          "mandatoryDocuments": ["Doc name"],
          "actionLink": null
        }
      ]
    },
    {
      "phaseNumber": 2,
      "phaseName": "Application Submission",
      "estimatedDays": "2-5 Days",
      "steps": [
        {
          "stepNumber": 1,
          "title": "Submit Application for [Scheme]",
          "description": "Specific submission instructions",
          "mandatoryDocuments": [],
          "actionLink": "https://official-portal-from-context"
        }
      ]
    },
    {
      "phaseNumber": 3,
      "phaseName": "Tracking & Verification",
      "estimatedDays": "1-2 Weeks",
      "steps": [
        {
          "stepNumber": 1,
          "title": "Track Application Status",
          "description": "How to verify status and what to expect next",
          "mandatoryDocuments": [],
          "actionLink": "https://official-portal-from-context"
        }
      ]
    }
  ]
}`;

      const aiResponse = await generateGeminiResponse(plannerPrompt);
      const cleaned = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      roadmapData = JSON.parse(cleaned);
    } catch (aiErr) {
      console.warn('Gemini action planner fallback:', aiErr.message);
      roadmapData = {
        summary: `Personalized action plan for ${verifiedSchemes.length} verified government scheme(s) from Supabase.`,
        timelineEstimate: '2 - 4 Weeks',
        phases: [
          {
            phaseNumber: 1,
            phaseName: 'Document Preparation & Readiness',
            estimatedDays: '1-3 Days',
            steps: [
              {
                stepNumber: 1,
                title: 'Collect Identity & Category Documents',
                description: 'Assemble original and self-attested copies of your Aadhaar card and required certificates.',
                mandatoryDocuments: masterChecklist.filter(d => d.isMandatory).map(d => d.name),
                actionLink: null
              }
            ]
          },
          {
            phaseNumber: 2,
            phaseName: 'Application Submission',
            estimatedDays: '2-5 Days',
            steps: verifiedSchemes.map((scheme, idx) => ({
              stepNumber: idx + 1,
              title: `Apply for ${scheme.name || scheme.title}`,
              description: `Access the official portal (${scheme.official_portal_url || scheme.application_url}) to submit the online form.`,
              mandatoryDocuments: [],
              actionLink: scheme.official_portal_url || scheme.application_url
            }))
          },
          {
            phaseNumber: 3,
            phaseName: 'Tracking & Benefit Disbursement',
            estimatedDays: '1-2 Weeks',
            steps: [
              {
                stepNumber: 1,
                title: 'Save Application Reference Number',
                description: 'Record the acknowledgment / reference number received upon submission to track verification status.',
                mandatoryDocuments: [],
                actionLink: null
              }
            ]
          }
        ]
      };
    }

    return roadmapData;
  } catch (error) {
    console.error('Error in ActionPlannerAgent:', error);
    throw new Error(`Action Planner Agent failed: ${error.message}`);
  }
};

export default { runActionPlannerAgent };
