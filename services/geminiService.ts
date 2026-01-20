
import { GoogleGenAI, Type } from "@google/genai";

/* Standard Gemini initialization following guidelines. Always initializing inside the function. */
export const generateVideoMetadata = async (title: string, userNotes: string): Promise<{ description: string; tags: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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

    if (response.text) return JSON.parse(response.text);
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { description: "Check out this amazing drama! ✨", tags: ["drama", "viral", "new"] };
  }
};

/* Using gemini-3-pro-preview for script generation which involves creative reasoning. */
export const generateScriptPrompt = async (concept: string): Promise<{ script: string, scenes: string[] }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Write a cinematic script outline for a short vertical drama (Tiktok/Reels style) based on this concept: "${concept}". 
            Include dramatic dialogue and 3 specific scene breakdowns.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        script: { type: Type.STRING, description: "The full dialogue and script." },
                        scenes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Scene descriptions." }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error(e);
        return { script: "Failed to generate script.", scenes: [] };
    }
};

/* Content moderation using Flash for fast throughput. */
export const moderateContent = async (text: string): Promise<boolean> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Is this text appropriate for a general audience social media platform? Return JSON. Text: "${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { isSafe: { type: Type.BOOLEAN } }
                }
            }
        });
        const result = JSON.parse(response.text || "{}");
        return result.isSafe ?? true;
    } catch (e) {
        return true;
    }
}
