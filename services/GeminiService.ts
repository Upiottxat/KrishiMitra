/**
 * @service GeminiService
 * Unified AI service facade routing to Groq (openai/gpt-oss-20b), Groq (qwen/qwen3.8-27b), Gemini (gemini-3.5-flash-lite), and Offline Engine.
 */
import { AIService, AIProviderTier } from './AIService';

interface StreamCallback {
  onChunk: (chunk: string) => void;
  onComplete: (finalText: string, tier?: AIProviderTier) => void;
  onError: (error: Error) => void;
}

interface StreamRequestPayload {
  messageText: string;
  imageAsset?: {
    uri: string;
    base64?: string;
    mimeType?: string;
  };
  langInstruction?: string;
}

export const GeminiService = {
  /**
   * Initiates a chat request with multi-tiered fallback:
   * Tier 1: Groq (openai/gpt-oss-20b)
   * Tier 2: Groq (qwen/qwen3.8-27b)
   * Tier 3: Gemini (gemini-3.5-flash-lite)
   * Tier 4: Offline Engine
   */
  async streamChatResponse(
    { messageText, imageAsset, langInstruction = '' }: StreamRequestPayload,
    callbacks: StreamCallback
  ): Promise<void> {
    try {
      await AIService.streamChat(
        {
          messageText,
          imageAsset,
          langInstruction,
        },
        {
          onChunk: callbacks.onChunk,
          onComplete: (finalText, tier) => callbacks.onComplete(finalText, tier),
          onError: callbacks.onError,
        }
      );
    } catch (error: any) {
      console.error('[GeminiService Facade] Error:', error);
      callbacks.onError(error as Error);
    }
  },
};
