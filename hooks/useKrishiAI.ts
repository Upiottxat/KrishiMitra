import NetInfo from "@react-native-community/netinfo";
import { useContext, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { LANGUAGES } from '../constants/languages';
import { StorageContext } from '../Context/StorageContext';
import { AIService, AIProviderTier } from '../services/AIService';
import { NarratorService } from '../services/NarratorService';

export interface Message {
  id: number;
  type: 'user' | 'bot';
  message: string;
  timestamp: string;
  imageUri?: string;
  hasAudio?: boolean;
  tier?: AIProviderTier;
}

export const useKrishiAI = () => {
  const { t, i18n } = useTranslation();
  const storageContext = useContext(StorageContext);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      message: "🙏 नमस्ते किसान भाई! मैं आपकी डिजिटल कृषि मित्र (KrishiMitra) हूँ।\n\nआप मुझसे किसी भी फसल की बीमारी, मौसम, खाद की सही मात्रा, या मंडी के भाव के बारे में पूछ सकते हैं। आप पौधे की फोटो भी भेज सकते हैं!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hasAudio: true,
      tier: 'groq/openai/gpt-oss-20b',
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTier, setActiveTier] = useState<AIProviderTier>('groq/openai/gpt-oss-20b');
  const [langCode, setLangCode] = useState<string>('hi');
  const [speakingMessageId, setSpeakingMessageId] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);

  const getLangObj = (code: string) => LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];

  const speakMessage = (messageId: number, text: string) => {
    if (speakingMessageId === messageId) {
      NarratorService.stop();
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(messageId);
    NarratorService.speak(text, {
      language: langCode !== 'auto' ? langCode : 'hi-IN',
      onDone: () => setSpeakingMessageId(null),
      onStopped: () => setSpeakingMessageId(null),
      onError: () => setSpeakingMessageId(null),
    });
  };

  const stopSpeaking = () => {
    NarratorService.stop();
    setSpeakingMessageId(null);
  };

  const handleSendMessage = async (text?: string, imageAsset?: any) => {
    const messageText = text !== undefined ? text : currentMessage;
    if (!messageText.trim() && !imageAsset) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      message: imageAsset ? (messageText.trim() || t("imagePrompt") || "पौधे की तस्वीर की जाँच करें") : messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUri: imageAsset?.uri,
    };

    const botMessageId = Date.now() + 1;
    const botPlaceholderMessage: Message = {
      id: botMessageId,
      type: 'bot',
      message: '...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hasAudio: true,
      tier: activeTier,
    };

    setMessages((prev) => [...prev, userMessage, botPlaceholderMessage]);
    if (text === undefined) setCurrentMessage('');
    setLoading(true);

    try {
      const isOnline = await NetInfo.fetch().then((state) => state.isConnected);

      const langInstruction =
        langCode !== 'auto'
          ? `Important: Your entire response must be in the ${getLangObj(langCode).name} language.`
          : "Important: Detect user's language and respond entirely in that language.";

      let base64 = imageAsset?.base64;
      if (!base64 && imageAsset?.uri) {
        try {
          const FileSystem = require('expo-file-system');
          base64 = await FileSystem.readAsStringAsync(imageAsset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (e) {
          console.warn('[useKrishiAI] Could not convert image to base64:', e);
        }
      }

      await AIService.streamChat(
        {
          messageText: userMessage.message,
          imageAsset: imageAsset ? {
            uri: imageAsset.uri,
            base64,
            mimeType: imageAsset.mimeType || 'image/jpeg',
          } : undefined,
          langInstruction,
          customGroqKey: storageContext?.customGroqKey,
          customGeminiKey: storageContext?.customGeminiKey,
        },
        {
          onModelSelected: (tier) => {
            setActiveTier(tier);
          },
          onChunk: (streamingText) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId ? { ...msg, message: streamingText } : msg
              )
            );
          },
          onComplete: (finalText, tier) => {
            setLoading(false);
            setActiveTier(tier);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId ? { ...msg, message: finalText, tier } : msg
              )
            );
            // Auto narrate response for farmer accessibility
            speakMessage(botMessageId, finalText);
          },
          onError: (err) => {
            console.error('[useKrishiAI] Stream error:', err);
            const fallbackMsg = t('alerts.fallbackError') || 'कृपया पुनः प्रयास करें। सर्वर व्यस्त हो सकता है।';
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId
                  ? { ...msg, message: fallbackMsg, tier: 'offline/rule-engine' }
                  : msg
              )
            );
            setLoading(false);
          },
        }
      );
    } catch (err: any) {
      console.error('[useKrishiAI] Error:', err);
      setLoading(false);
    }
  };

  return {
    messages,
    currentMessage,
    setCurrentMessage,
    loading,
    langCode,
    setLangCode,
    activeTier,
    scrollViewRef,
    handleSendMessage,
    getLangObj,
    i18n,
    speakMessage,
    stopSpeaking,
    speakingMessageId,
  };
};
