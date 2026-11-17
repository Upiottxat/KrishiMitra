import * as Speech from 'expo-speech';

export interface NarratorOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: Error) => void;
}

class NarratorServiceClass {
  private static instance: NarratorServiceClass;
  private isSpeakingInternal: boolean = false;
  private listeners: Set<(isSpeaking: boolean) => void> = new Set();
  private currentSpokenText: string = '';

  public subscribe(listener: (isSpeaking: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.isSpeakingInternal);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.isSpeakingInternal));
  }

  public get isSpeaking(): boolean {
    return this.isSpeakingInternal;
  }

  /**
   * Cleans markdown formatting, links, and code blocks to make text sound natural when spoken
   */
  public cleanTextForSpeech(rawText: string): string {
    if (!rawText) return '';
    return rawText
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove image and links markdown
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      // Remove headers #, ##, ###
      .replace(/#{1,6}\s+/g, '')
      // Remove bold and italics **text** or *text* or _text_
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Replace bullet points with brief pauses
      .replace(/^\s*[-*+]\s+/gm, ', ')
      // Remove blockquotes >
      .replace(/^\s*>\s+/gm, '')
      // Replace multiple consecutive newlines and spaces
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Speak given text using expo-speech with voice options
   */
  public async speak(text: string, options: NarratorOptions = {}): Promise<void> {
    const cleaned = this.cleanTextForSpeech(text);
    if (!cleaned) return;

    try {
      // If currently speaking, stop first
      await this.stop();

      const langCode = options.language || 'hi-IN';
      const voiceLang = this.resolveVoiceLanguage(langCode);

      this.isSpeakingInternal = true;
      this.currentSpokenText = cleaned;
      this.notify();
      options.onStart?.();

      Speech.speak(cleaned, {
        language: voiceLang,
        pitch: options.pitch ?? 1.0,
        rate: options.rate ?? 0.9, // slightly slower for clear comprehension by farmers
        onDone: () => {
          this.isSpeakingInternal = false;
          this.currentSpokenText = '';
          this.notify();
          options.onDone?.();
        },
        onStopped: () => {
          this.isSpeakingInternal = false;
          this.currentSpokenText = '';
          this.notify();
          options.onStopped?.();
        },
        onError: (err) => {
          console.warn('[NarratorService] Speech error:', err);
          this.isSpeakingInternal = false;
          this.currentSpokenText = '';
          this.notify();
          options.onError?.(new Error(String(err)));
        },
      });
    } catch (e: any) {
      console.warn('[NarratorService] Failed to speak:', e);
      this.isSpeakingInternal = false;
      this.notify();
    }
  }

  /**
   * Stop current speech immediately
   */
  public async stop(): Promise<void> {
    try {
      await Speech.stop();
    } catch (e) {
      console.warn('[NarratorService] Error stopping speech:', e);
    } finally {
      this.isSpeakingInternal = false;
      this.currentSpokenText = '';
      this.notify();
    }
  }

  /**
   * Toggle narration of given text: if currently speaking, stop; otherwise start speaking
   */
  public toggle(text: string, options: NarratorOptions = {}): void {
    if (this.isSpeakingInternal) {
      this.stop();
    } else {
      this.speak(text, options);
    }
  }

  /**
   * Resolve to correct regional BCP-47 language tag
   */
  private resolveVoiceLanguage(code: string): string {
    const base = code.toLowerCase().split(/[-_]/)[0];
    switch (base) {
      case 'hi': return 'hi-IN';
      case 'te': return 'te-IN';
      case 'ta': return 'ta-IN';
      case 'kn': return 'kn-IN';
      case 'mr': return 'mr-IN';
      case 'pa': return 'pa-IN';
      case 'gu': return 'gu-IN';
      case 'bn': return 'bn-IN';
      case 'en': return 'en-IN';
      default: return 'hi-IN';
    }
  }

  public static getInstance(): NarratorServiceClass {
    if (!NarratorServiceClass.instance) {
      NarratorServiceClass.instance = new NarratorServiceClass();
    }
    return NarratorServiceClass.instance;
  }
}

export const NarratorService = NarratorServiceClass.getInstance();
