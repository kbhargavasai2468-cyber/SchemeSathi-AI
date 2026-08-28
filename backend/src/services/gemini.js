import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Initializes and returns the Google Gen AI client.
 * @returns {GoogleGenAI}
 */
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables.');
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Sends a prompt to Gemini and returns the generated text response.
 * @param {string} prompt - Prompt to send to Gemini.
 * @param {string} [modelName='gemini-2.5-flash'] - Gemini model name.
 * @returns {Promise<string>}
 */
export const generateGeminiResponse = async (prompt, modelName = 'gemini-2.5-flash') => {
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    throw new Error('A valid prompt string is required.');
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    if (!response || !response.text) {
      throw new Error('No response text received from Gemini API.');
    }

    return response.text;
  } catch (error) {
    console.error('Gemini Service Error:', error.message || error);
    throw error;
  }
};

export default {
  generateGeminiResponse,
};
