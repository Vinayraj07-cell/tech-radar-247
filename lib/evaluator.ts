import { GoogleGenAI, Type, Schema } from '@google/genai';
import { EvaluationResult, RawFeedItem } from './types';

const EVALUATION_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    opportunityScore: {
      type: Type.INTEGER,
      description: 'Overall YouTube Shorts viral potential score from 0 to 100 based on: Novelty, Mass Interest, Wow Factor, Visual Potential, and Urgency.',
    },
    category: {
      type: Type.STRING,
      enum: ['MAKE_NOW', 'WATCH', 'IGNORE'],
      description: 'MAKE_NOW if score >= 75 (instant viral opportunity), WATCH if score >= 50 (developing trend or niche), IGNORE if score < 50 (incremental or low visual interest).',
    },
    reasoning: {
      type: Type.STRING,
      description: 'Concise 2-sentence breakdown of the reasoning behind the score.',
    },
    hookAngles: {
      type: Type.ARRAY,
      description: '3 Short script angles (Angle A: News/Curiosity, Angle B: Technical Deep Dive, Angle C: Contrarian/Speculative).',
      items: { type: Type.STRING }
    },
  },
  required: [
    'opportunityScore',
    'category',
    'reasoning',
    'hookAngles',
  ],
};

export async function evaluateTechItem(item: RawFeedItem): Promise<EvaluationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Evaluate the headline and snippet for YouTube Shorts viral potential.

Feed Source: ${item.feedTitle}
Item Title: ${item.title}
Item Content / Snippet:
${item.contentSnippet || item.content || 'No additional snippet provided.'}

Output strict JSON matching the schema.`;

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  let responseText = '';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: EVALUATION_SCHEMA,
        temperature: 0.3,
      },
    });
    responseText = response.text || '';
  } catch (error: any) {
    if (error?.status === 429 || error?.status === 404 || error?.message?.includes('429') || error?.message?.includes('404')) {
      console.warn('Gemini Primary Model Error (429/404). Falling back to Gemini 3.6 Flash...');
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: EVALUATION_SCHEMA,
            temperature: 0.3,
          },
        });
        responseText = fallbackResponse.text || '';
      } catch (fallbackError: any) {
        if (fallbackError?.status === 429 || fallbackError?.message?.includes('429')) {
          const customErr = new Error("Daily evaluation quota reached. Please try again later.");
          (customErr as any).status = 429;
          throw customErr;
        } else {
          throw fallbackError;
        }
      }
    } else {
      throw error;
    }
  }

  if (!responseText) {
    throw new Error('Received empty response from Gemini Models');
  }

  let parsed: EvaluationResult;
  try {
    parsed = JSON.parse(responseText) as EvaluationResult;
  } catch (err) {
    console.error('Failed to parse Gemini JSON output:', responseText);
    throw new Error(`Invalid JSON returned from Gemini: ${String(err)}`);
  }

  // Ensure score is integer 0-100
  const normalizedScore = Math.max(0, Math.min(100, Math.round(Number(parsed.opportunityScore) || 0)));
  parsed.opportunityScore = normalizedScore;

  // Enforce status logic strictly based on score
  if (normalizedScore >= 75) {
    parsed.category = 'MAKE_NOW';
  } else if (normalizedScore >= 50) {
    parsed.category = 'WATCH';
  } else {
    parsed.category = 'IGNORE';
  }

  // Ensure 3 hooks
  if (!parsed.hookAngles || !Array.isArray(parsed.hookAngles)) {
    parsed.hookAngles = ['Default Angle A', 'Default Angle B', 'Default Angle C'];
  }
  while (parsed.hookAngles.length < 3) {
    parsed.hookAngles.push('Default Angle');
  }

  return parsed;
}
