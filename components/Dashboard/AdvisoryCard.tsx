import { useTodayAdisory } from '@/hooks/useTodayAdisory';
import { NarratorService } from '@/services/NarratorService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AdvisoryCard = () => {
  const router = useRouter();
  const { Advisory, loading, tier, refetch } = useTodayAdisory();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleToggleNarrate = () => {
    if (isSpeaking) {
      NarratorService.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      NarratorService.speak(Advisory, {
        language: 'hi-IN',
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const getTierLabel = () => {
    if (tier === 'offline/rule-engine') {
      return '📶 ऑफ़लाइन AI सलाह';
    }
    return '✨ AI प्रमाणित सलाह (Verified Advisory)';
  };

  return (
    <View style={styles.advisoryCard}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.advisoryIconContainer}>
            <Ionicons name="sparkles" size={18} color="#d97706" />
          </View>
          <View>
            <Text style={styles.advisoryTitle}>दैनिक AI फसल सलाह (Daily Advisory)</Text>
            <Text style={styles.tierText}>{getTierLabel()}</Text>
          </View>
        </View>

        <View style={styles.headerRightControls}>
          <TouchableOpacity
            style={styles.controlIconBtn}
            onPress={refetch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#d97706" />
            ) : (
              <Ionicons name="refresh" size={16} color="#b45309" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlIconBtn, isSpeaking && styles.controlSpeaking]}
            onPress={handleToggleNarrate}
          >
            <Ionicons
              name={isSpeaking ? 'volume-mute' : 'volume-high'}
              size={18}
              color={isSpeaking ? '#ef4444' : '#b45309'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.advisoryText}>{Advisory}</Text>

      <TouchableOpacity
        style={styles.advisoryButton}
        onPress={() => router.push('/(tabs)/Advisory')}
        activeOpacity={0.8}
      >
        <Text style={styles.advisoryButtonText}>कृषि मित्र से पूरा परामर्श लें</Text>
        <Ionicons name="arrow-forward" size={16} color="#15803d" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  advisoryCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#fde68a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  advisoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  advisoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
  },
  tierText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b45309',
    marginTop: 1,
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controlIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlSpeaking: {
    backgroundColor: '#fee2e2',
  },
  advisoryText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 21,
    marginBottom: 12,
  },
  advisoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  advisoryButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#15803d',
  },
});

export default AdvisoryCard;
