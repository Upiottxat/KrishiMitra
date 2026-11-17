import { useState } from 'react';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useTranslation } from 'react-i18next';
import { usePermissions } from './usePermissions';
import { AIService } from '../services/AIService';

interface AudioRecorderProps {
  langCode: string;
  onTranscriptionComplete: (text: string) => void;
  customGroqKey?: string;
  customGeminiKey?: string;
}

export const useAudioRecorder = ({
  langCode,
  onTranscriptionComplete,
  customGroqKey,
  customGeminiKey,
}: AudioRecorderProps) => {
  const { t } = useTranslation();
  const [recording, setRecording] = useState<Audio.Recording | undefined>(undefined);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { requestAudioPermission } = usePermissions();

  const startRecording = async () => {
    const granted = await requestAudioPermission();
    if (!granted) {
      Alert.alert(t('alerts.permission') || 'Permission Required', t('alerts.micPermission') || 'Microphone access is needed for voice assistance.');
      return;
    }
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsListening(true);
    } catch (err) {
      console.warn('[useAudioRecorder] Start error:', err);
      Alert.alert(t('alerts.error') || 'Error', t('alerts.startRecordingError') || 'Could not start voice recording.');
    }
  };

  const stopRecordingAndTranscribe = async () => {
    if (!recording) return;
    setIsListening(false);
    setIsTranscribing(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) throw new Error('No recording URI available');

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64' as any,
      });

      const transcribed = await AIService.transcribeAudio(
        uri,
        base64,
        langCode,
        customGroqKey,
        customGeminiKey
      );

      if (transcribed && transcribed.trim()) {
        onTranscriptionComplete(transcribed.trim());
      } else {
        Alert.alert(
          t('alerts.transcription') || 'Voice Assistant',
          t('alerts.transcriptionNoText') || 'No speech detected. Please speak clearly.'
        );
      }
    } catch (err: any) {
      console.warn('[useAudioRecorder] Transcribe error:', err);
      Alert.alert(
        t('alerts.error') || 'Transcription Notice',
        err.message || 'Voice recognition completed. Please try again or type.'
      );
    } finally {
      setRecording(undefined);
      setIsTranscribing(false);
    }
  };

  const handleMicPress = () => (isListening ? stopRecordingAndTranscribe() : startRecording());

  return { isListening, isTranscribing, handleMicPress, startRecording, stopRecordingAndTranscribe };
};
