import express from 'express';
import dotenv from 'dotenv';
import { generateGeminiResponse } from './services/gemini.js';
import { runOrchestratorWorkflow } from './agents/orchestratorAgent.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// 1. Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SchemeSathi AI backend is running'
  });
});

// 2. Temporary Gemini test endpoint
app.get('/api/test-gemini', async (req, res) => {
  try {
    const prompt = req.query.prompt || 'Hello Gemini! Briefly introduce yourself in one sentence.';
    const responseText = await generateGeminiResponse(prompt);

    return res.json({
      success: true,
      prompt,
      response: responseText
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to communicate with Gemini API',
      error: error.message
    });
  }
});

// 3. Core SchemeSathi AI Assessment Endpoint
// Executes: Orchestrator -> Discovery -> Eligibility -> Documents -> Verification -> Action Planner
app.post('/api/assessment', async (req, res) => {
  try {
    const payload = req.body || {};

    if (!payload.userProfile && !payload.query) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: "userProfile" object or "query" string is required.'
      });
    }

    const assessmentResult = await runOrchestratorWorkflow(payload);

    return res.status(200).json(assessmentResult);
  } catch (error) {
    console.error('Assessment API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete SchemeSathi assessment',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`SchemeSathi AI Server running on port ${PORT}`);
});
