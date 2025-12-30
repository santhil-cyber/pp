import { GoogleGenAI } from "@google/genai";

// Note: In a real production app, never expose keys in client-side code.
// The prompt instructions say strict use of process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDashboardInsight = async (dataContext: string): Promise<string> => {
  try {
    const prompt = `
      You are an operations assistant for 'Protein Pantry'.
      Analyze the following data context:
      ${dataContext}

      Provide a 1-sentence action-oriented summary.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not generate insights at this time.";
  }
};
