import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Message } from '../../hooks/useKrishiAI';
import { AIProviderTier } from '../../services/AIService';
import { NarratorService } from '../../services/NarratorService';
import TText from '../TText';

interface MessageListProps {
  messages: Message[];
  scrollViewRef: React.RefObject<ScrollView | null>;
  loading: boolean;
  onImagePress: (uri: string) => void;
  speakingMessageId?: number | null;
  onSpeakPress?: (id: number, text: string) => void;
}

const getTierLabel = (tier?: AIProviderTier) => {
  if (tier === 'offline/rule-engine') {
    return { text: '📶 ऑफ़लाइन AI', bg: '#f3f4f6', color: '#4b5563' };
  }
  return { text: '🌾 कृषि मित्र AI', bg: '#dcfce7', color: '#15803d' };
};

const MessageList: React.FC<MessageListProps> = ({
  messages,
  scrollViewRef,
  loading,
  onImagePress,
  speakingMessageId,
  onSpeakPress,
}) => {
  const { t } = useTranslation();

  const handleToggleSpeak = (msg: Message) => {
    if (onSpeakPress) {
      onSpeakPress(msg.id, msg.message);
    } else {
      NarratorService.toggle(msg.message);
    }
  };

  const renderMessage = (msg: Message) => {
    const isBot = msg.type === 'bot';
    const isSpeaking = speakingMessageId === msg.id;
    const tierBadge = isBot ? getTierLabel(msg.tier) : null;

    return (
      <View
        key={msg.id}
        style={[
          msgStyles.messageRow,
          isBot ? msgStyles.messageRowBot : msgStyles.messageRowUser,
        ]}
      >
        {isBot && (
          <View style={msgStyles.botAvatar}>
            <Text style={{ fontSize: 18 }}>🌱</Text>
          </View>
        )}

        <View
          style={[
            msgStyles.bubble,
            isBot ? msgStyles.bubbleBot : msgStyles.bubbleUser,
          ]}
        >
          {msg.imageUri && (
            <TouchableOpacity onPress={() => onImagePress(msg.imageUri!)} activeOpacity={0.85}>
              <Image source={{ uri: msg.imageUri }} style={msgStyles.messageImage} />
            </TouchableOpacity>
          )}

          {isBot ? (
            <Markdown
              style={{
                body: { fontSize: 15, lineHeight: 23, color: '#1f2937' },
                heading2: { fontSize: 16, fontWeight: 'bold', color: '#15803d', marginTop: 8, marginBottom: 4 },
                heading3: { fontSize: 15, fontWeight: '600', color: '#166534', marginTop: 6 },
                bullet_list: { marginVertical: 4 },
                list_item: { marginVertical: 2 },
              }}
            >
              {msg.message || ''}
            </Markdown>
          ) : (
            <Text style={msgStyles.userText}>{msg.message}</Text>
          )}

          {/* Footer with Timestamp, Tier badge, and Voice Narrator Button */}
          <View style={msgStyles.messageFooter}>
            <Text style={isBot ? msgStyles.timestampBot : msgStyles.timestampUser}>
              {msg.timestamp}
            </Text>

            {isBot && (
              <View style={msgStyles.botControls}>
                {tierBadge && (
                  <View style={[msgStyles.tierBadge, { backgroundColor: tierBadge.bg }]}>
                    <Text style={[msgStyles.tierText, { color: tierBadge.color }]}>
                      {tierBadge.text}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[msgStyles.speakerBtn, isSpeaking && msgStyles.speakerBtnActive]}
                  onPress={() => handleToggleSpeak(msg)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isSpeaking ? 'volume-mute' : 'volume-high'}
                    size={16}
                    color={isSpeaking ? '#ef4444' : '#15803d'}
                  />
                  <Text style={[msgStyles.speakerText, isSpeaking && { color: '#ef4444' }]}>
                    {isSpeaking ? 'रुकें' : 'सुनें'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      ref={scrollViewRef as any}
      style={msgStyles.messagesArea}
      contentContainerStyle={msgStyles.messagesContent}
      onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      showsVerticalScrollIndicator={false}
    >
      {messages.map(renderMessage)}
      {loading && (
        <View style={msgStyles.typingIndicator}>
          <ActivityIndicator color="#15803d" size="small" />
          <TText style={msgStyles.typingText}>
            {t('typingIndicator') || 'कृषि मित्र उत्तर तैयार कर रही हैं...'}
          </TText>
        </View>
      )}
    </ScrollView>
  );
};

const msgStyles = StyleSheet.create({
  messagesArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageRowBot: {
    justifyContent: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  bubbleBot: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bubbleUser: {
    backgroundColor: '#22c55e',
    borderTopRightRadius: 4,
  },
  messageImage: {
    width: 220,
    height: 160,
    borderRadius: 12,
    marginBottom: 8,
  },
  userText: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
    fontWeight: '500',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.04)',
    gap: 8,
  },
  timestampBot: {
    fontSize: 11,
    color: '#94a3b8',
  },
  timestampUser: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  botControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  speakerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  speakerBtnActive: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  speakerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803d',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typingText: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
  },
});

export default MessageList;
