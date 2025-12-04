import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateVideoMetadata = async (title: string, userNotes: string): Promise<{ description: string; tags: string[] }> => {
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
