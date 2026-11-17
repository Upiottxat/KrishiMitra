import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { usePermissions } from '../../hooks/usePermissions';

interface ChatInputProps {
  currentMessage: string;
  setCurrentMessage: (text: string) => void;
  handleSendMessage: (text?: string, imageAsset?: ImagePicker.ImagePickerAsset) => void;
  handleMicPress: () => void;
  isListening: boolean;
  isTranscribing: boolean;
  loading: boolean;
  onOpenVoiceModal?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  currentMessage,
  setCurrentMessage,
  handleSendMessage,
  handleMicPress,
  isListening,
  isTranscribing,
  loading,
  onOpenVoiceModal,
}) => {
  const { t } = useTranslation();
  const { requestCameraPermission } = usePermissions();

  const handleCameraPress = async () => {
    const granted = await requestCameraPermission();
    if (!granted) {
      Alert.alert(t('alerts.permission') || 'Permission Required', t('alerts.cameraPermission') || 'Camera access needed.');
      return;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled) {
        await handleSendMessage(undefined, result.assets[0]);
      }
    } catch (err) {
      Alert.alert(t('alerts.error') || 'Error', t('alerts.cameraError') || 'Camera could not be opened.');
    }
  };

  const handleGalleryPress = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled) {
        await handleSendMessage(undefined, result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not select photo from gallery');
    }
  };

  const quickActions = [
    { id: 1, text: '🐛 कीट पहचान (Pest ID)', query: 'मेरी फसल में कीट लगे हैं, पहचान और नियंत्रण बताएं।' },
    { id: 2, text: '🌿 पत्ती रोग जाँच (Disease Check)', query: 'पौधे की पत्तियों पर धब्बे और पीलापन है, क्या उपाय करें?' },
    { id: 3, text: '💧 सिंचाई सलाह (Irrigation Advice)', query: 'वर्तमान मौसम को देखते हुए सिंचाई कब और कितनी करनी चाहिए?' },
    { id: 4, text: '🧪 NPK खाद की मात्रा (Fertilizer Dosage)', query: '1 एकड़ के लिए संतुलित यूरिया, डीएपी और पोटाश का शेड्यूल बताएं।' },
    { id: 5, text: '💰 आज का मंडी भाव (Mandi Prices)', query: 'आज की प्रमुख मंडियों में गेहूं, धान और सरसों के भाव क्या हैं?' },
  ];

  return (
    <View style={styles.inputArea}>
      {/* Quick Suggestion Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickScroll}
      >
        {quickActions.map((q) => (
          <TouchableOpacity
            key={q.id}
            style={styles.quickChip}
            onPress={() => handleSendMessage(q.query)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickText}>{q.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main Input Row */}
      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.iconButton} onPress={handleCameraPress} activeOpacity={0.7}>
          <Ionicons name="camera" size={24} color="#15803d" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={handleGalleryPress} activeOpacity={0.7}>
          <Ionicons name="images-outline" size={24} color="#15803d" />
        </TouchableOpacity>

        <TextInput
          value={currentMessage}
          onChangeText={setCurrentMessage}
          placeholder="फसल का सवाल लिखें या बोलें..."
          placeholderTextColor="#9ca3af"
          style={styles.input}
          multiline
          maxLength={500}
          editable={!isTranscribing && !loading}
        />

        {/* Voice Input Button */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            styles.micButton,
            isListening && styles.micButtonActive,
          ]}
          onPress={onOpenVoiceModal || handleMicPress}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isListening ? 'radio-button-on' : 'mic'}
            size={22}
            color="#ffffff"
          />
        </TouchableOpacity>

        {/* Send Button */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            styles.sendButton,
            (!currentMessage.trim() || loading) && styles.sendButtonDisabled,
          ]}
          disabled={!currentMessage.trim() || loading}
          onPress={() => handleSendMessage()}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="send" size={18} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Active Listening / Transcribing Indicator Banner */}
      {(isListening || isTranscribing) && (
        <View style={styles.listeningBox}>
          <ActivityIndicator size="small" color="#15803d" />
          <Text style={styles.listeningText}>
            {isTranscribing ? 'आवाज को टेक्स्ट में बदल रहे हैं...' : 'सुन रहे हैं... बोलिए'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputArea: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingBottom: 8,
    paddingTop: 6,
  },
  quickScroll: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },
  quickChip: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  quickText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    backgroundColor: '#f8fafc',
    borderRadius: 21,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  micButton: {
    backgroundColor: '#16a34a',
  },
  micButtonActive: {
    backgroundColor: '#dc2626',
  },
  sendButton: {
    backgroundColor: '#22c55e',
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  listeningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dcfce7',
    paddingVertical: 6,
    marginTop: 6,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  listeningText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
});

export default ChatInput;
