import { GoogleGenAI, Type } from "@google/genai";

// Helper to safely get API Key
const getApiKey = () => {
    try {
        // @ts-ignore
        const meta = import.meta as any;
        return meta.env?.VITE_GOOGLE_API_KEY || (process.env as any).API_KEY || '';
    } catch {
        return '';
    }
}

const apiKey = getApiKey();

// Initialize AI with key or dummy to prevent init crash (calls will fail gracefully)
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy_key' });

export const generateVideoMetadata = async (title: string, userNotes: string): Promise<{ description: string; tags: string[] }> => {
  if (!apiKey) {
    console.warn("Gemini API Key missing (VITE_GOOGLE_API_KEY). Skipping AI generation.");
    return {
      description: "Check out this amazing drama! ✨",
      tags: ["drama", "viral", "new"]
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a catchy, viral-style social media description (max 150 chars) and 3-5 relevant hashtags for a short drama video.
      Video Title: ${title}
      User Notes: ${userNotes}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    throw new Error("No response from AI");

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      description: "Check out this amazing drama! ✨",
      tags: ["drama", "viral", "new"]
    };
  }
};

export const moderateContent = async (text: string): Promise<boolean> => {
    if (!apiKey) return true;
    
    // Returns true if content is safe, false if unsafe
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Is this text appropriate for a general audience social media platform? Return JSON. Text: "${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isSafe: { type: Type.BOOLEAN }
                    }
                }
            }
        });
        const result = JSON.parse(response.text || "{}");
        return result.isSafe ?? true;
    } catch (e) {
        console.error(e);
        return true; // Default to safe on error to avoid blocking valid user actions in demo
    }
}