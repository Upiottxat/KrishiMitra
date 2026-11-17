import { GoogleGenerativeAI } from '@google/generative-ai';
import { KRISHIMITRA_PROMPT } from '../constants/prompts';
import { offlineKnowledgeService } from './detector/OfflineDetector';
import { offlineModelService } from './OfflineModelService';

export type AIProviderTier = 
  | 'groq/openai/gpt-oss-20b'
  | 'groq/qwen/qwen3.8-27b'
  | 'gemini/gemini-3.5-flash-lite'
  | 'offline/rule-engine';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onComplete: (finalText: string, tier: AIProviderTier) => void;
  onError: (error: Error) => void;
  onModelSelected?: (tier: AIProviderTier) => void;
}

export interface AIRequestPayload {
  messageText: string;
  imageAsset?: {
    uri: string;
    base64?: string;
    mimeType?: string;
  };
  langInstruction?: string;
  systemPrompt?: string;
  customGroqKey?: string;
  customGeminiKey?: string;
}

// Fallback intelligent offline knowledge responses when offline or network unavailable
const OFFLINE_ADVISORY_KNOWLEDGE: Record<string, string> = {
  wheat: `## 🌱 Wheat (गेहूं) Crop Advisory
- **Sowing Window:** October 25 to November 15 (optimal for timely sown varieties).
- **Fertilizer Plan (Per Acre):** Urea: 110 kg (split: 55kg basal, 55kg at 1st irrigation), DAP: 55 kg, Potash: 20 kg.
- **First Irrigation (CRI Stage):** Critical at 21 days after sowing. Avoid waterlogging.
- **Disease Prevention:** Watch for yellow rust; spray Propiconazole 25% EC (1ml/L) if orange/yellow streaks appear on leaves.
- **Organic Tip:** Apply Jeevamrit or fermented neem water for root strength.`,

  rice: `## 🌱 Rice / Paddy (धान) Advisory
- **Water Management:** Maintain 2-3 cm standing water until grain filling, then drain 10 days before harvest.
- **Nutrient Management (Per Acre):** Zinc Sulphate (21%) at 10 kg/acre prevents Khaira disease (leaf bronzing).
- **Brown Plant Hopper (BPH):** Spray Neem oil (5ml/L) or Pymetrozine 50% WG at stem base.
- **Blast Control:** Tricyclazole 75% WP (0.6g/L) on leaf spots or neck blast.`,

  cotton: `## 🌱 Cotton (कपास) Advisory
- **Pink Bollworm Alert:** Install 2 pheromone traps per acre. Spray Neem seed kernel extract (NSKE 5%) at flowering.
- **Whitefly Management:** Yellow sticky traps (10/acre). Avoid synthetic pyrethroids which flare up whiteflies.
- **Foliar Spray:** 1% Potassium Nitrate (13-0-45) spray at square formation increases boll weight.`,

  mustard: `## 🌱 Mustard (सरसों) Advisory
- **Aphid (चेपा) Alert:** High risk during cloudy/humid weather. Spray Neem oil (3ml/L) or Dimethoate 30% EC (1.5ml/L).
- **Alternaria Blight:** Spray Mancozeb 75% WP (2g/L) if dark brown concentric spots appear on leaves.
- **Irrigation:** First irrigation at flowering (30-35 days), second at pod formation (60-65 days).`,

  potato: `## 🌱 Potato (आलू) Advisory
- **Late Blight Alert:** If humidity is >80% and cool temperatures persist, spray Mancozeb 75% WP prophylactic. If disease seen, spray Cymoxanil + Mancozeb (2.5g/L).
- **Earthing Up:** Mandatory at 30-35 days to prevent greening of tubers.
- **Tuber Bulk:** Apply 0-0-50 (SOP) foliar spray at 50-60 days for uniform tuber size.`,

  tomato: `## 🌱 Tomato (टमाटर) Advisory
- **Early & Late Blight:** Remove infected lower leaves. Spray Copper Oxychloride (2.5g/L) or Mancozeb.
- **Fruit Borer:** Pheromone traps + Bacillus thuringiensis (Bt) spray @ 1g/L.
- **Calcium Deficiency (Blossom End Rot):** Ensure even soil moisture; foliar spray Calcium Nitrate 5g/L.`,

  fertilizer: `## 🧪 Balanced NPK & Organic Fertilizer Guide
- **Soil Health Rule:** Always perform soil testing before seasonal application.
- **General Ratio:** Cereal crops (4:2:1 N:P:K), Pulses (1:2:1), Oilseeds (3:2:1 + Sulphur).
- **Bio-fertilizers:** Seed treatment with Azotobacter/Rhizobium (for nitrogen) + PSB (for phosphorus) saves 25% chemical fertilizer.
- **Nano Urea:** 1 bottle (500ml) per acre mixed in 100L water sprayed at tillering stage replaces 1 bag of conventional urea.`,

  pest: `## 🐛 Integrated Pest Management (IPM)
- **Step 1 (Physical):** Install Yellow (whiteflies/aphids) and Blue (thrips) sticky traps (8-10 per acre).
- **Step 2 (Biological):** Release Trichogramma parasitoids; spray Beauveria bassiana or Metarhizium @ 5g/L.
- **Step 3 (Botanical):** 10,000 PPM Neem Oil @ 2-3ml/L water with a few drops of liquid soap.
- **Step 4 (Chemical - last resort):** Use targeted insecticides with exact recommended dose and harvest waiting period.`
};

export class AIServiceClass {
  private static instance: AIServiceClass;
  private defaultGroqKey: string = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
  private defaultGeminiKey: string = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

  // Get active Groq key (user override or env)
  public getGroqKey(customKey?: string): string {
    return customKey?.trim() || this.defaultGroqKey || '';
  }

  // Get active Gemini key (user override or env)
  public getGeminiKey(customKey?: string): string {
    return customKey?.trim() || this.defaultGeminiKey || '';
  }

  /**
   * Unified chat completion with 4-tier cascading fallback:
   * 1. Groq: openai/gpt-oss-20b
   * 2. Groq: qwen/qwen3.8-27b
   * 3. Google Gemini: gemini-3.5-flash-lite / gemini-2.0-flash-lite / gemini-1.5-flash
   * 4. Smart Local Agricultural Knowledge Engine
   */
  async streamChat(
    payload: AIRequestPayload,
    callbacks: StreamCallbacks
  ): Promise<{ text: string; tier: AIProviderTier }> {
    const {
      messageText,
      imageAsset,
      langInstruction = "Important: Respond in the farmer's language clearly and warmly.",
      systemPrompt = KRISHIMITRA_PROMPT,
      customGroqKey,
      customGeminiKey,
    } = payload;

    const groqKey = this.getGroqKey(customGroqKey);
    const geminiKey = this.getGeminiKey(customGeminiKey);

    const fullSystemPrompt = `${systemPrompt}\n\n${langInstruction}`;

    // -------------------------------------------------------------
    // TIER 1: Groq with openai/gpt-oss-20b
    // -------------------------------------------------------------
    if (groqKey) {
      try {
        console.log('[AIService] Attempting Tier 1: Groq openai/gpt-oss-20b...');
        callbacks.onModelSelected?.('groq/openai/gpt-oss-20b');
        const text = await this.callGroq(
          'openai/gpt-oss-20b',
          groqKey,
          fullSystemPrompt,
          messageText,
          imageAsset,
          callbacks.onChunk
        );
        callbacks.onComplete(text, 'groq/openai/gpt-oss-20b');
        return { text, tier: 'groq/openai/gpt-oss-20b' };
      } catch (errTier1: any) {
        console.warn('[AIService] Tier 1 (openai/gpt-oss-20b) failed:', errTier1?.message || errTier1);
      }

      // -------------------------------------------------------------
      // TIER 2: Groq Fallback with Qwen (qwen/qwen3.8-27b)
      // -------------------------------------------------------------
      try {
        console.log('[AIService] Falling back to Tier 2: Groq Qwen (qwen/qwen3.8-27b)...');
        callbacks.onModelSelected?.('groq/qwen/qwen3.8-27b');
        let text = '';
        try {
          text = await this.callGroq(
            'qwen/qwen3.8-27b',
            groqKey,
            fullSystemPrompt,
            messageText,
            imageAsset,
            callbacks.onChunk
          );
        } catch (subErr) {
          console.warn('[AIService] qwen/qwen3.8-27b failed, trying alias...', subErr);
          text = await this.callGroq(
            'qwen-2.5-32b',
            groqKey,
            fullSystemPrompt,
            messageText,
            imageAsset,
            callbacks.onChunk
          );
        }
        callbacks.onComplete(text, 'groq/qwen/qwen3.8-27b');
        return { text, tier: 'groq/qwen/qwen3.8-27b' };
      } catch (errTier2: any) {
        console.warn('[AIService] Tier 2 (qwen/qwen3.8-27b) failed:', errTier2?.message || errTier2);
      }
    }

    // -------------------------------------------------------------
    // TIER 3: Gemini Fallback (gemini-3.5-flash-lite)
    // -------------------------------------------------------------
    if (geminiKey) {
      try {
        console.log('[AIService] Falling back to Tier 3: Gemini gemini-3.5-flash-lite...');
        callbacks.onModelSelected?.('gemini/gemini-3.5-flash-lite');
        const text = await this.callGemini(
          geminiKey,
          fullSystemPrompt,
          messageText,
          imageAsset,
          callbacks.onChunk
        );
        callbacks.onComplete(text, 'gemini/gemini-3.5-flash-lite');
        return { text, tier: 'gemini/gemini-3.5-flash-lite' };
      } catch (errTier3: any) {
        console.warn('[AIService] Tier 3 (Gemini) failed:', errTier3?.message || errTier3);
      }
    }

    // -------------------------------------------------------------
    // TIER 4: Local Offline Agricultural Rule & Knowledge Engine
    // -------------------------------------------------------------
    console.log('[AIService] Engaging Tier 4: Local Offline Agricultural Intelligence...');
    callbacks.onModelSelected?.('offline/rule-engine');
    const offlineReply = this.generateOfflineResponse(messageText, imageAsset);
    callbacks.onChunk(offlineReply);
    callbacks.onComplete(offlineReply, 'offline/rule-engine');
    return { text: offlineReply, tier: 'offline/rule-engine' };
  }

  /**
   * Helper to execute chat completions on Groq (OpenAI Compatible)
   */
  private async callGroq(
    model: string,
    apiKey: string,
    systemPrompt: string,
    userText: string,
    imageAsset?: AIRequestPayload['imageAsset'],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    // If vision is requested and the model is purely text, we use Groq vision or multimodal payload
    const userMessageContent: any = imageAsset?.base64
      ? [
          { type: 'text', text: userText || 'Please analyze this plant image, identify any disease/pest symptoms, and provide remedy.' },
          {
            type: 'image_url',
            image_url: {
              url: `data:${imageAsset.mimeType || 'image/jpeg'};base64,${imageAsset.base64}`,
            },
          },
        ]
      : userText;

    // Use llama-3.2-11b-vision-preview or qwen/qwen3.8-27b on Groq if an image is attached
    const effectiveModel = (imageAsset?.base64 && model === 'openai/gpt-oss-20b')
      ? 'llama-3.2-11b-vision-preview'
      : model;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: effectiveModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessageContent },
        ],
        temperature: 0.3,
        max_tokens: 1800,
        stream: false, // In React Native fetch, non-stream with chunk simulation provides rock-solid reliability
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Groq API Error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    if (!content) {
      throw new Error('Groq returned empty response');
    }

    // Stream simulated chunks to UI for smooth typing effect
    if (onChunk) {
      this.simulateChunks(content, onChunk);
    }

    return content;
  }

  /**
   * Helper to execute Gemini requests (gemini-3.5-flash-lite / gemini-2.0-flash-lite / gemini-1.5-flash)
   */
  private async callGemini(
    apiKey: string,
    systemPrompt: string,
    userText: string,
    imageAsset?: AIRequestPayload['imageAsset'],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const parts: any[] = [];
    if (imageAsset?.base64) {
      parts.push({
        inlineData: {
          data: imageAsset.base64,
          mimeType: imageAsset.mimeType || 'image/jpeg',
        },
      });
    }
    parts.push(userText || 'Identify plant symptoms and recommend farming solutions.');

    // Primary: gemini-3.5-flash-lite, Fallback: gemini-2.0-flash-lite / gemini-1.5-flash
    const candidateModels = ['gemini-3.5-flash-lite', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];
    let content = '';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const modelInstance = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
        });
        const result = await modelInstance.generateContent(parts);
        content = result.response.text();
        if (content) {
          console.log(`[AIService] Gemini succeeded with model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[AIService] Gemini model ${modelName} failed, trying next fallback...`, err?.message || err);
      }
    }

    if (!content) {
      throw lastError || new Error('Gemini returned empty text');
    }

    if (onChunk) {
      this.simulateChunks(content, onChunk);
    }

    return content;
  }

  /**
   * Simulates progressive chunk rendering for beautiful UI typing effect
   */
  private simulateChunks(fullText: string, onChunk: (chunk: string) => void) {
    const chunkSize = 40;
    for (let i = 0; i < fullText.length; i += chunkSize) {
      const partial = fullText.slice(0, i + chunkSize);
      onChunk(partial);
    }
    onChunk(fullText);
  }

  /**
   * Generates intelligent offline response based on on-device model and agricultural database
   */
  private generateOfflineResponse(
    userText: string,
    imageAsset?: AIRequestPayload['imageAsset']
  ): string {
    return offlineModelService.generateOfflineResponse(userText, imageAsset);
  }

  /**
   * One-shot structured JSON generation with fallback
   */
  async generateStructuredJSON<T>(
    prompt: string,
    schemaHint: string,
    customGroqKey?: string,
    customGeminiKey?: string
  ): Promise<{ data: T; tier: AIProviderTier }> {
    const fullPrompt = `${prompt}\n\nYou MUST return ONLY valid JSON matching this schema:\n${schemaHint}\nDo not include any Markdown code blocks, backticks, or other text.`;
    
    let resultTier: AIProviderTier = 'offline/rule-engine';
    let rawText = '';

    await this.streamChat(
      {
        messageText: fullPrompt,
        systemPrompt: 'You are an agricultural data assistant. Output pure raw JSON only.',
        customGroqKey,
        customGeminiKey,
      },
      {
        onChunk: () => {},
        onComplete: (text, tier) => {
          rawText = text;
          resultTier = tier;
        },
        onError: () => {},
      }
    );

    try {
      // Clean up markdown formatting if the model enclosed JSON in ```json ... ```
      let cleaned = rawText.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
      if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '');
      if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
      const parsed = JSON.parse(cleaned.trim());
      return { data: parsed as T, tier: resultTier };
    } catch (e) {
      throw new Error(`Failed to parse AI JSON response: ${rawText}`);
    }
  }

  /**
   * Transcribes audio using Groq Whisper or Gemini Audio
   */
  async transcribeAudio(
    audioUri: string,
    audioBase64: string,
    langCode: string,
    customGroqKey?: string,
    customGeminiKey?: string
  ): Promise<string> {
    const groqKey = this.getGroqKey(customGroqKey);
    const geminiKey = this.getGeminiKey(customGeminiKey);

    // Tier 1: Groq Whisper API (whisper-large-v3) - fastest speech transcription
    if (groqKey) {
      try {
        console.log('[AIService] Transcribing with Groq whisper-large-v3...');
        const formData = new FormData();
        formData.append('file', {
          uri: audioUri,
          name: 'audio.m4a',
          type: 'audio/m4a',
        } as any);
        formData.append('model', 'whisper-large-v3');
        if (langCode && langCode !== 'auto') {
          formData.append('language', langCode.split('-')[0]);
        }

        const resp = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
          },
          body: formData,
        });

        if (resp.ok) {
          const json = await resp.json();
          if (json.text) return json.text;
        }
      } catch (err) {
        console.warn('[AIService] Groq whisper transcription error, falling back to Gemini:', err);
      }
    }

    // Tier 2: Gemini Audio
    if (geminiKey && audioBase64) {
      try {
        console.log('[AIService] Transcribing with Gemini Audio...');
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent([
          `Transcribe this spoken agriculture question into text faithfully in its original language (${langCode}). Output ONLY the transcribed words.`,
          {
            inlineData: {
              data: audioBase64,
              mimeType: 'audio/mp4',
            },
          },
        ]);
        const text = result.response.text();
        if (text?.trim()) return text.trim();
      } catch (err) {
        console.warn('[AIService] Gemini audio transcription error:', err);
      }
    }

    throw new Error('Speech transcription could not be completed. Please type your message.');
  }

  public static getInstance(): AIServiceClass {
    if (!AIServiceClass.instance) {
      AIServiceClass.instance = new AIServiceClass();
    }
    return AIServiceClass.instance;
  }
}

export const AIService = AIServiceClass.getInstance();
