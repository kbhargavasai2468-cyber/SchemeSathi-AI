import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateGeminiResponse } from './services/gemini.js';
import { runOrchestratorWorkflow } from './agents/orchestratorAgent.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins for CORS
const allowedOrigins = [
  'https://scheme-sathi-ai-xi.vercel.app',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000'
];

// 1. CORS Middleware configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow explicitly defined origins, localhost, and any Vercel preview domains
    const isAllowed = 
      allowedOrigins.includes(origin) || 
      origin.endsWith('.vercel.app') || 
      origin.includes('localhost') || 
      origin.includes('127.0.0.1');

    if (isAllowed) {
      return callback(null, true);
    }

    // Permissive fallback so production requests never fail
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Explicit preflight and header guarantee middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

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
