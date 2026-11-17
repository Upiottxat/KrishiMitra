import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { StorageContext } from '../../Context/StorageContext';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { AIService, AIProviderTier } from '../../services/AIService';
import { NarratorService } from '../../services/NarratorService';

interface KisanVaniModalProps {
  visible: boolean;
  onClose: () => void;
  langCode?: string;
}

export const KisanVaniModal: React.FC<KisanVaniModalProps> = ({
  visible,
  onClose,
  langCode = 'hi',
}) => {
  const storageContext = useContext(StorageContext);
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcribedText, setTranscribedText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [usedTier, setUsedTier] = useState<AIProviderTier>('groq/openai/gpt-oss-20b');

  // Animation values for glowing pulse ring
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (status === 'listening' || status === 'speaking') {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.35,
              duration: 850,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 850,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.2,
              duration: 850,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.7,
              duration: 850,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      opacityAnim.setValue(0.6);
    }
  }, [status]);

  const handleTranscribeResult = async (text: string) => {
    setTranscribedText(text);
    setStatus('thinking');
    setAiResponse('');

    try {
      const result = await AIService.streamChat(
        {
          messageText: text,
          langInstruction: 'Important: Respond concisely in conversational Hindi (or regional language). The answer should be practical, farmer-friendly, and under 120 words.',
          customGroqKey: storageContext?.customGroqKey,
          customGeminiKey: storageContext?.customGeminiKey,
        },
        {
          onModelSelected: (tier) => setUsedTier(tier),
          onChunk: (chunk) => setAiResponse(chunk),
          onComplete: (finalText, tier) => {
            setAiResponse(finalText);
            setUsedTier(tier);
            setStatus('speaking');
            NarratorService.speak(finalText, {
              language: langCode || 'hi-IN',
              onDone: () => setStatus('idle'),
              onStopped: () => setStatus('idle'),
              onError: () => setStatus('idle'),
            });
          },
          onError: () => {
            setAiResponse('माफ़ कीजिए, उत्तर प्राप्त करने में समस्या हुई। कृपया पुनः बोलें।');
            setStatus('idle');
          },
        }
      );
    } catch (e) {
      setStatus('idle');
    }
  };

  const { isListening, isTranscribing, handleMicPress } = useAudioRecorder({
    langCode,
    onTranscriptionComplete: handleTranscribeResult,
    customGroqKey: storageContext?.customGroqKey,
    customGeminiKey: storageContext?.customGeminiKey,
  });

  useEffect(() => {
    if (isListening) {
      setStatus('listening');
    } else if (isTranscribing) {
      setStatus('thinking');
    }
  }, [isListening, isTranscribing]);

  const handleStopSpeaking = () => {
    NarratorService.stop();
    setStatus('idle');
  };

  const handleQuickQuestion = (question: string) => {
    handleTranscribeResult(question);
  };

  const getTierBadge = () => {
    if (usedTier === 'offline/rule-engine') {
      return { label: '📶 ऑफ़लाइन AI', bg: '#f3f4f6', color: '#374151' };
    }
    return { label: '🌾 कृषि वाणी AI', bg: '#dcfce7', color: '#15803d' };
  };

  const badge = getTierBadge();

  const QUICK_QUESTIONS = [
    '🌾 आज मौसम और बारिश का पूर्वानुमान क्या है?',
    '🐛 धान/गेहूं में कीड़े लगे हैं, कौन सा जैविक स्प्रे करें?',
    '🧪 1 एकड़ में यूरिया और डीएपी की कितनी मात्रा डालें?',
    '💰 आज की मंडी में गेहूं और धान का भाव क्या है?',
    '🏛️ पीएम किसान सम्मान निधि की किस्त की जाँच कैसे करें?',
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.aiOrbIcon}>
                <Ionicons name="mic" size={20} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.title}>किसान वाणी (Kisan Vani)</Text>
                <Text style={styles.subtitle}>AI Voice Agricultural Assistant</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                NarratorService.stop();
                onClose();
              }}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Model Badge */}
          <View style={styles.badgeRow}>
            <View style={[styles.modelBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.modelBadgeText, { color: badge.color }]}>
                {badge.label}
              </Text>
            </View>
            {status === 'speaking' && (
              <TouchableOpacity onPress={handleStopSpeaking} style={styles.stopAudioBtn}>
                <Ionicons name="volume-mute" size={16} color="#ef4444" />
                <Text style={styles.stopAudioText}>बोलना रोकें</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Center Microphone Animation Orb */}
            <View style={styles.micCenterContainer}>
              <Animated.View
                style={[
                  styles.pulsingRing,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: opacityAnim,
                    backgroundColor:
                      status === 'listening'
                        ? 'rgba(34, 197, 94, 0.35)'
                        : status === 'speaking'
                        ? 'rgba(59, 130, 246, 0.35)'
                        : 'rgba(34, 197, 94, 0.15)',
                  },
                ]}
              />

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.mainMicButton,
                  status === 'listening' && styles.micListening,
                  status === 'speaking' && styles.micSpeaking,
                ]}
                onPress={status === 'speaking' ? handleStopSpeaking : handleMicPress}
              >
                {status === 'thinking' ? (
                  <ActivityIndicator size="large" color="#ffffff" />
                ) : (
                  <Ionicons
                    name={status === 'speaking' ? 'volume-high' : 'mic'}
                    size={42}
                    color="#ffffff"
                  />
                )}
              </TouchableOpacity>

              <Text style={styles.statusLabel}>
                {status === 'idle' && 'माइक दबाकर अपना सवाल बोलें...'}
                {status === 'listening' && 'सुन रहे हैं... कृपया बोलिए'}
                {status === 'thinking' && 'AI उत्तर तैयार कर रहा है...'}
                {status === 'speaking' && 'उत्तर सुनाया जा रहा है (सुनिए)...'}
              </Text>
            </View>

            {/* Transcribed User Question */}
            {transcribedText ? (
              <View style={styles.questionBox}>
                <Text style={styles.questionLabel}>आपका सवाल:</Text>
                <Text style={styles.questionText}>"{transcribedText}"</Text>
              </View>
            ) : null}

            {/* AI Answer Box */}
            {aiResponse ? (
              <View style={styles.answerBox}>
                <View style={styles.answerHeader}>
                  <Text style={styles.answerHeaderTitle}>🌱 कृषि मित्र का उत्तर</Text>
                  <TouchableOpacity
                    onPress={() =>
                      NarratorService.speak(aiResponse, { language: langCode || 'hi-IN' })
                    }
                    style={styles.replayBtn}
                  >
                    <Ionicons name="volume-high" size={16} color="#15803d" />
                    <Text style={styles.replayText}>दोबारा सुनें</Text>
                  </TouchableOpacity>
                </View>
                <Markdown
                  style={{
                    body: { fontSize: 15, color: '#1f2937', lineHeight: 22 },
                    heading2: { fontSize: 16, fontWeight: 'bold', color: '#15803d', marginTop: 4 },
                  }}
                >
                  {aiResponse}
                </Markdown>
              </View>
            ) : null}

            {/* Quick Questions Suggestions */}
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>💡 या इन प्रश्नों पर टैप करें:</Text>
              <View style={styles.chipsContainer}>
                {QUICK_QUESTIONS.map((q, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.suggestionChip}
                    onPress={() => handleQuickQuestion(q)}
                  >
                    <Text style={styles.chipText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    minHeight: '75%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiOrbIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 6,
  },
  modelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  modelBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stopAudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
  },
  stopAudioText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  content: {
    flex: 1,
  },
  micCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 26,
    position: 'relative',
  },
  pulsingRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  mainMicButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  micListening: {
    backgroundColor: '#16a34a',
    shadowColor: '#16a34a',
  },
  micSpeaking: {
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
  },
  statusLabel: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  questionBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  questionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 2,
  },
  questionText: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  answerBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 16,
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  answerHeaderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#15803d',
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  replayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  suggestionsContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 10,
  },
  chipsContainer: {
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
});
