
import { GoogleGenAI, Type } from "@google/genai";
import { ChemicalAnalysis } from "../types";

export const analyzeChemical = async (chemicalName: string): Promise<ChemicalAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze the following chemical or formula: "${chemicalName}". 
    Provide a comprehensive safety analysis in Persian (Farsi).`,
    config: {
      systemInstruction: "You are an elite expert in occupational health, safety (HSE), and industrial chemistry. Your task is to provide accurate, professional, and detailed chemical safety data. Respond strictly in valid JSON format using the provided schema.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          identification: {
            type: Type.OBJECT,
            properties: {
              chemicalName: { type: Type.STRING },
              formula: { type: Type.STRING },
              casNumber: { type: Type.STRING },
              synonyms: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["chemicalName", "formula", "casNumber", "synonyms"]
          },
          hazards: {
            type: Type.OBJECT,
            properties: {
              ghsClass: { type: Type.STRING },
              pictograms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List relevant GHS pictograms by name, e.g., Flammable, Toxic, Corrosive" },
              physicalHazards: { type: Type.STRING },
              healthHazards: { type: Type.STRING },
              environmentalHazards: { type: Type.STRING }
            },
            required: ["ghsClass", "pictograms", "physicalHazards", "healthHazards", "environmentalHazards"]
          },
          exposureLimits: {
            type: Type.OBJECT,
            properties: {
              tlv: { type: Type.STRING },
              pel: { type: Type.STRING },
              stel: { type: Type.STRING }
            },
            required: ["tlv", "pel", "stel"]
          },
          reactions: {
            type: Type.OBJECT,
            properties: {
              incompatibleMaterials: { type: Type.ARRAY, items: { type: Type.STRING } },
              dangerousReactions: { type: Type.STRING },
              decompositionProducts: { type: Type.STRING }
            },
            required: ["incompatibleMaterials", "dangerousReactions", "decompositionProducts"]
          },
          safetyMeasures: {
            type: Type.OBJECT,
            properties: {
              ppe: { type: Type.ARRAY, items: { type: Type.STRING } },
              engineeringControls: { type: Type.STRING },
              storage: { type: Type.STRING },
              segregation: { type: Type.STRING }
            },
            required: ["ppe", "engineeringControls", "storage", "segregation"]
          },
          firstAid: {
            type: Type.OBJECT,
            properties: {
              skin: { type: Type.STRING },
              eyes: { type: Type.STRING },
              inhalation: { type: Type.STRING },
              ingestion: { type: Type.STRING }
            },
            required: ["skin", "eyes", "inhalation", "ingestion"]
          },
          emergency: {
            type: Type.OBJECT,
            properties: {
              spill: { type: Type.STRING },
              fire: { type: Type.STRING },
              disposal: { type: Type.STRING }
            },
            required: ["spill", "fire", "disposal"]
          },
          transport: {
            type: Type.OBJECT,
            properties: {
              unNumber: { type: Type.STRING },
              class: { type: Type.STRING },
              packingGroup: { type: Type.STRING }
            },
            required: ["unNumber", "class", "packingGroup"]
          }
        },
        required: [
          "identification", "hazards", "exposureLimits", "reactions", 
          "safetyMeasures", "firstAid", "emergency", "transport"
        ]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as ChemicalAnalysis;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("خطا در پردازش اطلاعات دریافتی از هوش مصنوعی");
  }
};
