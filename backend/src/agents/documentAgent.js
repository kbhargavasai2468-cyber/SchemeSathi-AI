import { dbService } from '../services/dbService.js';
import { generateGeminiResponse } from '../services/gemini.js';

/**
 * 4. Document Agent
 * Compiles required documentation from Supabase for eligible schemes,
 * produces a deduplicated checklist and actionable procurement guidance.
 */
export const runDocumentAgent = async (eligibleSchemes, userProfile = {}) => {
  try {
    if (!eligibleSchemes || eligibleSchemes.length === 0) {
      return {
        schemeDocuments: [],
        masterChecklist: [],
        procurementTips: []
      };
    }

    const schemeIds = eligibleSchemes.map(s => s.id);
    const dbDocs = await dbService.getDocuments(schemeIds);

    // 1. Group documents by scheme (using DB records or standard official requirements)
    const schemeDocuments = eligibleSchemes.map(scheme => {
      const schemeTitle = scheme.name || scheme.title || `Scheme #${scheme.id}`;
      const schemeCategory = (scheme.category || '').toLowerCase();
      let docs = dbDocs.filter(d => String(d.scheme_id) === String(scheme.id));

      // If Supabase documents table has no rows yet for this scheme, generate standard KYC requirements
      if (docs.length === 0) {
        if (schemeCategory.includes('housing') || schemeTitle.includes('PMAY')) {
          docs = [
            {
              id: `doc-${scheme.id}-1`,
              document_name: 'Aadhaar Card & Family KYC',
              document_type: 'Identity Proof',
              is_mandatory: true,
              issuing_authority: 'UIDAI',
              procurement_guidance: 'Aadhaar card of the applicant and all family members.'
            },
            {
              id: `doc-${scheme.id}-2`,
              document_name: 'Income Certificate / Self-Declaration',
              document_type: 'Income Proof',
              is_mandatory: true,
              issuing_authority: 'Revenue Department / Tehsildar',
              procurement_guidance: 'Valid income certificate certifying household income within EWS/LIG category.'
            },
            {
              id: `doc-${scheme.id}-3`,
              document_name: 'Affidavit of Non-Ownership of Pucca House',
              document_type: 'Housing Declaration',
              is_mandatory: true,
              issuing_authority: 'Notary / Executive Magistrate',
              procurement_guidance: 'Notarized self-affidavit declaring that the applicant does not own a pucca house in India.'
            }
          ];
        } else if (schemeCategory.includes('financial') || schemeTitle.includes('Jan-Dhan') || schemeTitle.includes('PMJDY')) {
          docs = [
            {
              id: `doc-${scheme.id}-1`,
              document_name: 'Aadhaar Card / Voter ID',
              document_type: 'Identity & Address Proof',
              is_mandatory: true,
              issuing_authority: 'UIDAI / Election Commission of India',
              procurement_guidance: 'Original and self-attested photocopy of Aadhaar or Voter ID card.'
            },
            {
              id: `doc-${scheme.id}-2`,
              document_name: 'Passport Size Photographs',
              document_type: 'Photo Proof',
              is_mandatory: true,
              issuing_authority: 'Applicant',
              procurement_guidance: 'Two recent passport-sized color photographs.'
            }
          ];
        } else {
          docs = [
            {
              id: `doc-${scheme.id}-1`,
              document_name: 'Aadhaar Card',
              document_type: 'Identity Proof',
              is_mandatory: true,
              issuing_authority: 'UIDAI',
              procurement_guidance: 'Aadhaar card linked with active mobile number.'
            },
            {
              id: `doc-${scheme.id}-2`,
              document_name: 'Aadhaar-Seeded Bank Passbook',
              document_type: 'Bank Proof',
              is_mandatory: true,
              issuing_authority: 'Bank Branch',
              procurement_guidance: 'Copy of bank passbook showing account number and IFSC code.'
            }
          ];
        }
      }

      return {
        schemeId: scheme.id,
        schemeTitle,
        requiredDocuments: docs.map(d => ({
          id: d.id,
          name: d.document_name,
          type: d.document_type,
          isMandatory: d.is_mandatory,
          issuingAuthority: d.issuing_authority,
          guidance: d.procurement_guidance
        }))
      };
    });

    // 2. Build deduplicated master checklist
    const docMap = new Map();
    for (const item of schemeDocuments) {
      for (const doc of item.requiredDocuments) {
        const normalizedKey = doc.name.toLowerCase().trim();
        if (!docMap.has(normalizedKey)) {
          docMap.set(normalizedKey, {
            name: doc.name,
            type: doc.type,
            isMandatory: doc.isMandatory,
            issuingAuthority: doc.issuingAuthority,
            guidance: doc.guidance,
            requiredForSchemes: [item.schemeTitle]
          });
        } else {
          const existing = docMap.get(normalizedKey);
          if (doc.isMandatory) existing.isMandatory = true;
          if (!existing.requiredForSchemes.includes(item.schemeTitle)) {
            existing.requiredForSchemes.push(item.schemeTitle);
          }
        }
      }
    }

    const masterChecklist = Array.from(docMap.values());

    // 3. Gemini procurement guidance
    let procurementTips = [];
    try {
      const prompt = `You are the Document Agent for SchemeSathi AI.
Based on the following required government documents:
${JSON.stringify(masterChecklist, null, 2)}

User State: ${userProfile.state || 'India'}

TASK:
Provide 2-3 concise, practical tips for the user on how to gather these documents smoothly without rejections.
DO NOT invent any document requirements not present in the checklist.

Return ONLY a JSON array of strings:
[
  "Tip 1...",
  "Tip 2..."
]`;

      const aiResponse = await generateGeminiResponse(prompt);
      const cleaned = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsedTips = JSON.parse(cleaned);
      if (Array.isArray(parsedTips)) {
        procurementTips = parsedTips;
      }
    } catch (aiErr) {
      console.warn('Gemini document tips fallback:', aiErr.message);
      procurementTips = [
        'Ensure your Aadhaar card is linked to your active mobile number for OTP verification.',
        'Keep self-attested photocopies along with original documents ready for verification.',
        'Verify that your name and date of birth match identically across your Aadhaar and bank passbook.'
      ];
    }

    return {
      schemeDocuments,
      masterChecklist,
      procurementTips
    };
  } catch (error) {
    console.error('Error in DocumentAgent:', error);
    throw new Error(`Document Agent failed: ${error.message}`);
  }
};

export default { runDocumentAgent };
