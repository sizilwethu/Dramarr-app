
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Standard Gemini initialization following guidelines
export const generateVideoMetadata = async (title: string, userNotes: string): Promise<{ description: string; tags: string[] }> => {
  try {
    if (!process.env.API_KEY) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    console.error("Gemini API Error (Video Metadata):", error);
    return { description: "Check out this amazing drama! ✨", tags: ["drama", "viral", "new"] };
  }
};

export const generateVoiceover = async (text: string, voiceName: 'Zephyr' | 'Puck' | 'Kore' | 'Charon'): Promise<string> => {
  try {
    if (!process.env.API_KEY) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say with dramatic intensity: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Audio generation failed");
    return base64Audio;
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};

export const generateScriptPrompt = async (concept: string): Promise<{ script: string, scenes: string[] }> => {
    try {
        if (!process.env.API_KEY) throw new Error("API Key missing");
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
        console.error("Gemini API Error (Script):", e);
        return { script: "Failed to generate script.", scenes: [] };
    }
};

export const moderateContent = async (text: string): Promise<boolean> => {
    try {
        if (!process.env.API_KEY) throw new Error("API Key missing");
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
        console.error("Gemini API Error (Moderation):", e);
        return true;
    }
}
