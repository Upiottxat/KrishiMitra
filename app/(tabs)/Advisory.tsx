import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChatHeader from '../../components/Advisory/ChatHeader';
import ChatInput from '../../components/Advisory/ChatInput';
import ImagePreviewModal from '../../components/Advisory/ImagePreviewModal';
import LanguageModal from '../../components/Advisory/LanguageModal';
import MessageList from '../../components/Advisory/MessageList';
import { KisanVaniModal } from '../../components/VoiceAssistant/KisanVaniModal';
import { NarratorBar } from '../../components/Narrator/NarratorBar';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useKrishiAI } from '../../hooks/useKrishiAI';

export default function Advisory() {
  const {
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
    speakingMessageId,
  } = useKrishiAI();

  const { t } = useTranslation();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);

  const { isListening, isTranscribing, handleMicPress } = useAudioRecorder({
    langCode,
    onTranscriptionComplete: (text) => setCurrentMessage(text),
  });

  const handleCameraPress = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('alerts.permission') || 'अनुमति आवश्यक',
        t('alerts.cameraPermission') || 'पौधे की फोटो लेने के लिए कैमरा अनुमति दें।'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      const imageAsset = result.assets[0];
      handleSendMessage(
        'कृपया इस पौधे की फोटो की जाँच करें। इसमें क्या बीमारी या कीट के लक्षण हैं? जैविक व रासायनिक उपाय बताएं।',
        imageAsset
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ChatHeader
          langCode={langCode}
          getLangObj={getLangObj}
          activeTier={activeTier}
          onLanguagePress={() => setLangModalVisible(true)}
          onCameraPress={handleCameraPress}
          onVoiceAssistantPress={() => setVoiceModalVisible(true)}
        />

        <MessageList
          messages={messages}
          scrollViewRef={scrollViewRef}
          loading={loading}
          onImagePress={(uri) => setPreviewImage(uri)}
          speakingMessageId={speakingMessageId}
          onSpeakPress={speakMessage}
        />

        <ChatInput
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          handleSendMessage={handleSendMessage}
          handleMicPress={handleMicPress}
          isListening={isListening}
          isTranscribing={isTranscribing}
          loading={loading}
          onOpenVoiceModal={() => setVoiceModalVisible(true)}
        />

        <LanguageModal
          visible={langModalVisible}
          onClose={() => setLangModalVisible(false)}
          currentLangCode={langCode}
          onSaveLanguage={(code) => {
            setLangCode(code);
            const base = code.split('-')[0];
            if (base !== 'auto') i18n.changeLanguage(base);
          }}
        />

        <ImagePreviewModal
          visible={!!previewImage}
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />

        {/* Dedicated Kisan Vani Interactive Voice Assistant Modal */}
        <KisanVaniModal
          visible={voiceModalVisible}
          onClose={() => setVoiceModalVisible(false)}
          langCode={langCode}
        />

        {/* Global Floating Narrator Bar */}
        <NarratorBar />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});
