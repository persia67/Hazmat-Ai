import { GoogleGenAI, Type, LiveServerMessage, Modality } from "@google/genai";
import { ChemicalAnalysis, NewsResult, Language, InteractionResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Existing Analysis ---
export const analyzeChemical = async (chemicalName: string, lang: Language): Promise<ChemicalAnalysis> => {
  const languageName = lang === 'fa' ? 'Persian (Farsi)' : 'English';
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze the following chemical or formula: "${chemicalName}". 
    Provide a comprehensive safety analysis in ${languageName}.`,
    config: {
      systemInstruction: `You are an elite expert in occupational health, safety (HSE), and industrial chemistry. Your task is to provide accurate, professional, and detailed chemical safety data. Respond strictly in valid JSON format using the provided schema. Ensure all string values are in ${languageName}.
      
      IMPORTANT: You must cite the specific standards or databases used for this analysis (e.g., "GHS Rev. 9", "OSHA 1910.1200", "NIOSH Pocket Guide", "PubChem CID xxxx") in the 'references' field.`,
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
          },
          references: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of standards and sources used (e.g., GHS, OSHA, NIOSH)"
          }
        },
        required: [
          "identification", "hazards", "exposureLimits", "reactions", 
          "safetyMeasures", "firstAid", "emergency", "transport", "references"
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
    throw new Error(lang === 'fa' ? "خطا در پردازش اطلاعات دریافتی" : "Error processing AI response");
  }
};

// --- Interaction Analysis (New) ---
export const analyzeInteraction = async (chemA: string, chemB: string, conditions: { heat: boolean, pressure: boolean }, lang: Language): Promise<InteractionResult> => {
  const languageName = lang === 'fa' ? 'Persian (Farsi)' : 'English';
  const conditionText = `Conditions included: ${conditions.heat ? 'High Heat/Thermal Decomposition' : 'Ambient Temp'} AND ${conditions.pressure ? 'High Pressure' : 'Atmospheric Pressure'}.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze the chemical interaction/reaction between "${chemA}" and "${chemB}". 
    ${conditionText}
    Focus heavily on safety consequences, incompatibility, produced gases, and explosion risks.
    Provide the response in ${languageName}.`,
    config: {
      systemInstruction: `You are a Senior Chemical Process Safety Engineer. Predict the outcome of mixing two chemicals under specific conditions.
      Output strictly JSON.
      Fields:
      - reactionType: (e.g., Exothermic, Neutralization, Oxidation, No Reaction)
      - equation: Balanced chemical equation (if applicable, or description)
      - products: List of chemical names produced
      - severity: ONE OF ['HIGH', 'MEDIUM', 'LOW', 'NONE'] based on safety risk.
      - hazards: Detailed safety description (e.g., "Generates toxic chlorine gas", "Violent explosion risk").
      - conditionEffects: How heat/pressure modifies the risk.
      - safetyMeasures: Immediate actions to prevent or mitigate.
      `,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reactionType: { type: Type.STRING },
          equation: { type: Type.STRING },
          products: { type: Type.ARRAY, items: { type: Type.STRING } },
          severity: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW', 'NONE'] },
          hazards: { type: Type.STRING },
          conditionEffects: { type: Type.STRING },
          safetyMeasures: { type: Type.STRING }
        },
        required: ["reactionType", "equation", "products", "severity", "hazards", "conditionEffects", "safetyMeasures"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as InteractionResult;
  } catch (error) {
    console.error("Failed to parse Interaction response:", error);
    throw new Error(lang === 'fa' ? "خطا در تحلیل واکنش" : "Error analyzing interaction");
  }
};

// --- News Search (Grounding) ---
export const searchSafetyNews = async (query: string, lang: Language): Promise<NewsResult> => {
  const prompt = lang === 'fa' 
    ? `Find the latest safety incidents, regulatory updates, or important news regarding "${query}". Provide a brief summary in Persian.`
    : `Find the latest safety incidents, regulatory updates, or important news regarding "${query}". Provide a brief summary in English.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  const summary = response.text || (lang === 'fa' ? "خبر جدیدی یافت نشد." : "No recent news found.");
  // @ts-ignore
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = chunks
    .map((chunk: any) => chunk.web)
    .filter((web: any) => web)
    .map((web: any) => ({ title: web.title, uri: web.uri }));

  return { summary, sources };
};

// --- Chat Bot ---
export const createChatSession = (lang: Language) => {
  const instruction = lang === 'fa'
    ? "You are a helpful and knowledgeable chemical safety assistant. Answer questions clearly in Persian."
    : "You are a helpful and knowledgeable chemical safety assistant. Answer questions clearly in English.";

  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: instruction,
    }
  });
};

// --- Live Audio Helpers ---

function b64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Audio Resampling/Conversion
function floatTo16BitPCM(input: Float32Array) {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output.buffer;
}

// --- Live Voice Assistant Class ---
export class VoiceAssistant {
  private inputContext: AudioContext | null = null;
  private outputContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private nextStartTime = 0;
  private isActive = false;
  private sessionResolve: ((value: any) => void) | null = null;
  private sessionPromise: Promise<any>;

  constructor(private onStatusChange: (active: boolean) => void, private lang: Language) {
    this.sessionPromise = new Promise((resolve) => {
      this.sessionResolve = resolve;
    });
  }

  async start() {
    if (this.isActive) return;
    this.isActive = true;
    this.onStatusChange(true);

    try {
      this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const aiClient = new GoogleGenAI({ apiKey });
      const instruction = this.lang === 'fa' 
        ? "You are a professional chemical safety consultant speaking in Persian. Keep responses concise."
        : "You are a professional chemical safety consultant speaking in English. Keep responses concise.";

      // Connect to Gemini Live
      aiClient.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: instruction,
        },
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Connected");
            this.setupAudioInput();
          },
          onmessage: async (message: LiveServerMessage) => {
            this.handleServerMessage(message);
          },
          onclose: () => {
            console.log("Gemini Live Closed");
            this.stop();
          },
          onerror: (err) => {
            console.error("Gemini Live Error", err);
            this.stop();
          }
        }
      }).then(session => {
        if (this.sessionResolve) this.sessionResolve(session);
      });

    } catch (error) {
      console.error("Failed to start voice assistant:", error);
      this.stop();
    }
  }

  private setupAudioInput() {
    if (!this.inputContext || !this.stream) return;

    this.source = this.inputContext.createMediaStreamSource(this.stream);
    this.processor = this.inputContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      if (!this.isActive) return;
      const inputData = e.inputBuffer.getChannelData(0);
      const pcm16 = floatTo16BitPCM(inputData);
      const base64 = arrayBufferToBase64(pcm16);

      this.sessionPromise.then(session => {
        session.sendRealtimeInput({
          media: {
            mimeType: 'audio/pcm;rate=16000',
            data: base64
          }
        });
      });
    };

    this.source.connect(this.processor);
    this.processor.connect(this.inputContext.destination);
  }

  private async handleServerMessage(message: LiveServerMessage) {
    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData && this.outputContext) {
      const audioBytes = b64ToUint8Array(audioData as string);
      const audioBuffer = await this.decodeAudio(audioBytes);
      this.playAudio(audioBuffer);
    }
    
    // Handle interruption
    if (message.serverContent?.interrupted) {
      this.nextStartTime = 0; // Reset
      // In a real app, we would cancel current playing nodes
    }
  }

  private async decodeAudio(bytes: Uint8Array): Promise<AudioBuffer> {
    if (!this.outputContext) throw new Error("No output context");
    
    // Manually decode PCM 16-bit 24kHz
    const sampleRate = 24000;
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }

    const buffer = this.outputContext.createBuffer(1, float32.length, sampleRate);
    buffer.copyToChannel(float32, 0);
    return buffer;
  }

  private playAudio(buffer: AudioBuffer) {
    if (!this.outputContext) return;

    const source = this.outputContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputContext.destination);

    const currentTime = this.outputContext.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime;
    }
    
    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
  }

  stop() {
    this.isActive = false;
    this.onStatusChange(false);

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.inputContext) {
      this.inputContext.close();
      this.inputContext = null;
    }
    if (this.outputContext) {
      this.outputContext.close();
      this.outputContext = null;
    }
  }
}