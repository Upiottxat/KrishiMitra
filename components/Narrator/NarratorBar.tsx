import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NarratorService } from '../../services/NarratorService';

export const NarratorBar: React.FC = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const unsubscribe = NarratorService.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return unsubscribe;
  }, []);

  if (!isSpeaking) return null;

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <View style={styles.iconCircle}>
          <Ionicons name="volume-high" size={18} color="#ffffff" />
        </View>
        <View>
          <Text style={styles.title}>कृषि मित्र वाचक (Narrator Active)</Text>
          <Text style={styles.subtitle}>स्क्रीन की जानकारी सुनाई जा रही है...</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.stopButton}
        onPress={() => NarratorService.stop()}
        activeOpacity={0.8}
      >
        <Ionicons name="stop" size={14} color="#ffffff" />
        <Text style={styles.stopText}>रोकें (Stop)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 75,
    left: 16,
    right: 16,
    backgroundColor: '#15803d',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    zIndex: 9999,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  stopText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
