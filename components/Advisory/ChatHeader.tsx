import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AIProviderTier } from '../../services/AIService';

interface ChatHeaderProps {
  langCode: string;
  getLangObj: (code: string) => { native: string; name?: string };
  onLanguagePress: () => void;
  onCameraPress?: () => void;
  onVoiceAssistantPress?: () => void;
  activeTier?: AIProviderTier;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  langCode,
  getLangObj,
  onLanguagePress,
  onCameraPress,
  onVoiceAssistantPress,
  activeTier = 'groq/openai/gpt-oss-20b',
}) => {
  const getBadgeInfo = () => {
    if (activeTier === 'offline/rule-engine') {
      return { label: '📶 ऑफ़लाइन AI मोड', bg: '#fef3c7', text: '#854d0e' };
    }
    return { label: '🟢 ऑनलाइन AI सक्रिय', bg: '#dcfce7', text: '#166534' };
  };

  const badge = getBadgeInfo();

  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.leftSection}>
        <View style={headerStyles.avatar}>
          <Text style={{ fontSize: 22 }}>🌾</Text>
        </View>
        <View>
          <Text style={headerStyles.title}>कृषि मित्र AI (KrishiMitra)</Text>
          <View style={[headerStyles.tierPill, { backgroundColor: badge.bg }]}>
            <Text style={[headerStyles.tierPillText, { color: badge.text }]}>
              {badge.label}
            </Text>
          </View>
        </View>
      </View>

      <View style={headerStyles.rightSection}>
        {onVoiceAssistantPress && (
          <TouchableOpacity
            style={headerStyles.actionBtn}
            onPress={onVoiceAssistantPress}
            activeOpacity={0.8}
          >
            <Ionicons name="mic" size={20} color="#ffffff" />
          </TouchableOpacity>
        )}

        {onCameraPress && (
          <TouchableOpacity
            style={headerStyles.actionBtn}
            onPress={onCameraPress}
            activeOpacity={0.8}
          >
            <Ionicons name="camera-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={headerStyles.langBtn}
          onPress={onLanguagePress}
          activeOpacity={0.8}
        >
          <Ionicons name="language" size={16} color="#ffffff" />
          <Text style={headerStyles.langText}>{getLangObj(langCode).native || 'हिंदी'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    backgroundColor: '#15803d',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tierPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  tierPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
  },
  langText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ChatHeader;
