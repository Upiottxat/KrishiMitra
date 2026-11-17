import { StorageContext } from '@/Context/StorageContext';
import { offlineModelService, OfflineModelStatus } from '@/services/OfflineModelService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Achievement {
  id: number;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
}

interface Stat {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface Activity {
  action: string;
  time: string;
  icon: string;
}

const achievements: Achievement[] = [
  { id: 1, name: 'Water Saver', icon: '💧', description: 'Saved 30% water this season', earned: true },
  { id: 2, name: 'Healthy Crops', icon: '🌱', description: 'Maintained 95% crop health', earned: true },
  { id: 3, name: 'Community Helper', icon: '🤝', description: 'Helped 10+ farmers in Mandi & Q&A', earned: true },
  { id: 4, name: 'Early Adopter', icon: '⚡', description: 'Tried 3+ new organic AI techniques', earned: false },
  { id: 5, name: 'Expert Advisor', icon: '🎓', description: 'Provide expert agricultural guidance', earned: false },
];

const stats: Stat[] = [
  { label: 'Seasons Tracked', value: '3', icon: 'calendar-outline', color: '#2196F3' },
  { label: 'Yield Improvement', value: '+15%', icon: 'trending-up-outline', color: '#4CAF50' },
  { label: 'Water Saved', value: '30%', icon: 'leaf-outline', color: '#2196F3' },
  { label: 'Community Points', value: '245', icon: 'star-outline', color: '#FF9800' },
];

const recentActivity: Activity[] = [
  { action: 'Completed irrigation task', time: '2 hours ago', icon: '💧' },
  { action: 'Shared pest control tip', time: '1 day ago', icon: '🐛' },
  { action: 'Updated crop health status', time: '2 days ago', icon: '🌱' },
  { action: 'Applied for PM-KISAN scheme', time: '3 days ago', icon: '🏛️' },
];

export default function ProfileModel() {
  const { userBasicInfo, setUserBasicInfo } = useContext(StorageContext) ?? {};
  const router = useRouter();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [modelStatus, setModelStatus] = useState<OfflineModelStatus>(offlineModelService.getStatus());

  useEffect(() => {
    // Subscribe to offline model download progress & status
    const unsubscribe = offlineModelService.subscribe((status) => {
      setModelStatus(status);
    });
    offlineModelService.checkModelStatus();
    return () => unsubscribe();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'KS';
    return name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const farmerDisplayName = userBasicInfo?.farmerName || 'सरदार हरप्रीत सिंह';
  const farmerLocation = userBasicInfo?.location || 'लुधियाना, पंजाब';
  const cropTypeDisplay = userBasicInfo?.cropType || 'गेहूं (Wheat)';
  const landSizeDisplay = userBasicInfo?.landSize || 4;

  const handleStartDownload = () => {
    if (Platform.OS === 'web') {
      offlineModelService.startDownload();
      return;
    }

    Alert.alert(
      'ऑफ़लाइन AI मॉडल डाउनलोड करें',
      'SmolLM2-135M (Q2 GGUF ~80MB) डाउनलोड होगा। इसके बाद इंटरनेट न होने पर भी आप AI सलाह ले सकेंगे। क्या आप शुरू करना चाहते हैं?',
      [
        { text: 'रद्द करें', style: 'cancel' },
        {
          text: 'डाउनलोड करें (80MB)',
          onPress: () => {
            offlineModelService.startDownload();
          },
        },
      ]
    );
  };

  const handleDeleteModel = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm) {
        if (window.confirm('क्या आप ऑफ़लाइन AI मॉडल हटाकर स्पेस खाली करना चाहते हैं?')) {
          offlineModelService.deleteModel();
        }
      } else {
        offlineModelService.deleteModel();
      }
      return;
    }

    Alert.alert(
      'मॉडल हटाएं',
      'क्या आप ऑफ़लाइन AI मॉडल हटाकर 84 MB स्पेस खाली करना चाहते हैं?',
      [
        { text: 'नहीं', style: 'cancel' },
        {
          text: 'हटाएं',
          style: 'destructive',
          onPress: () => {
            offlineModelService.deleteModel();
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    const doSignOut = () => {
      if (setUserBasicInfo) {
        setUserBasicInfo({
          language: 'hi',
          cropType: '',
          landSize: 0,
          location: '',
          locationCoordinates: { long: 0, lati: 0 },
        });
      }
      router.replace('/');
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm) {
        if (window.confirm('क्या आप KrishiMitra से बाहर जाना चाहते हैं?')) {
          doSignOut();
        }
      } else {
        doSignOut();
      }
      return;
    }

    Alert.alert('साइन आउट', 'क्या आप KrishiMitra से बाहर जाना चाहते हैं?', [
      { text: 'नहीं', style: 'cancel' },
      {
        text: 'साइन आउट करें',
        style: 'destructive',
        onPress: doSignOut,
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(farmerDisplayName)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{farmerDisplayName}</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.locationText}>{farmerLocation}</Text>
              </View>
              <View style={styles.badgesContainer}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cropTypeDisplay} Farmer</Text>
                </View>
                <View style={[styles.badge, styles.badgeOutline]}>
                  <Text style={styles.badgeOutlineText}>{landSizeDisplay} acres</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => router.push('/')}>
              <Ionicons name="pencil-outline" size={18} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Ionicons name={stat.icon} size={24} color={stat.color} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Ionicons name="trophy-outline" size={20} color="#FF9800" />
              <Text style={styles.cardTitle}>Achievements</Text>
            </View>
          </View>
          <View style={styles.achievementsContainer}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementItem,
                  achievement.earned ? styles.achievementEarned : styles.achievementLocked,
                ]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
                {achievement.earned && (
                  <View style={styles.earnedBadge}>
                    <Text style={styles.earnedBadgeText}>Earned</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Ionicons name="time-outline" size={20} color="#2196F3" />
              <Text style={styles.cardTitle}>Recent Activity</Text>
            </View>
          </View>
          <View style={styles.activityContainer}>
            {recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <Text style={styles.activityIcon}>{activity.icon}</Text>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityAction}>{activity.action}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Settings & Preferences */}
        <View style={styles.settingsCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Ionicons name="settings-outline" size={20} color="#666" />
              <Text style={styles.cardTitle}>Settings & Preferences</Text>
            </View>
          </View>
          <View style={styles.settingsContainer}>
            {/* Push Notifications */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={20} color="#666" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>Weather alerts & farming reminders</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor="#fff"
              />
            </View>

            {/* Language */}
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="globe-outline" size={20} color="#666" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Language / भाषा</Text>
                  <Text style={styles.settingDescription}>हिंदी (Hindi) / English</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={16} color="#666" />
            </TouchableOpacity>

            {/* Offline AI Model Download Section (SmolLM2-135M Q2 ~80MB) */}
            <View style={styles.offlineModelSection}>
              <View style={styles.offlineModelHeader}>
                <View style={styles.settingInfo}>
                  <Ionicons
                    name={modelStatus.status === 'ready' ? 'cloud-done-outline' : 'cloud-download-outline'}
                    size={22}
                    color={modelStatus.status === 'ready' ? '#15803d' : '#2563eb'}
                  />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>
                      ऑफ़लाइन AI मॉडल (Offline AI)
                    </Text>
                    <Text style={styles.settingDescription}>
                      SmolLM2-135M (Q2 GGUF ~80MB)
                    </Text>
                  </View>
                </View>
                {modelStatus.status === 'ready' ? (
                  <View style={styles.readyBadge}>
                    <Text style={styles.readyBadgeText}>✓ सक्रिय</Text>
                  </View>
                ) : null}
              </View>

              {/* Status details & download action */}
              {modelStatus.status === 'ready' ? (
                <View style={styles.modelReadyBox}>
                  <Text style={styles.modelReadyText}>
                    ✓ ऑफ़लाइन AI मॉडल फ़ोन में सुरक्षित है ({modelStatus.fileSizeFormatted})। बिना इंटरनेट भी तुरंत सलाह मिलेगी।
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteModelBtn}
                    onPress={handleDeleteModel}
                  >
                    <Ionicons name="trash-outline" size={15} color="#dc2626" />
                    <Text style={styles.deleteModelBtnText}>मॉडल हटाएं (Free 84MB)</Text>
                  </TouchableOpacity>
                </View>
              ) : modelStatus.status === 'downloading' ? (
                <View style={styles.downloadingBox}>
                  <View style={styles.progressHeaderRow}>
                    <Text style={styles.progressPercentText}>
                      डाउनलोड हो रहा है: {modelStatus.progress}%
                    </Text>
                    <Text style={styles.progressBytesText}>
                      {modelStatus.fileSizeFormatted}
                    </Text>
                  </View>
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${modelStatus.progress}%` },
                      ]}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.cancelDownloadBtn}
                    onPress={() => offlineModelService.cancelDownload()}
                  >
                    <Text style={styles.cancelDownloadBtnText}>रद्द करें</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.notDownloadedBox}>
                  <Text style={styles.notDownloadedText}>
                    कमज़ोर नेटवर्क या बिना इंटरनेट के भी स्मार्ट AI सलाह पाने के लिए ऑन-डिवाइस मॉडल डाउनलोड करें।
                  </Text>
                  {modelStatus.status === 'error' && modelStatus.error ? (
                    <Text style={styles.errorText}>{modelStatus.error}</Text>
                  ) : null}
                  <TouchableOpacity
                    style={styles.downloadModelBtn}
                    onPress={handleStartDownload}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="download-outline" size={18} color="#ffffff" />
                    <Text style={styles.downloadModelBtnText}>
                      मॉडल डाउनलोड करें (~80 MB)
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Support */}
        <View style={styles.supportCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Ionicons name="help-circle-outline" size={20} color="#666" />
              <Text style={styles.cardTitle}>Support & Help</Text>
            </View>
          </View>
          <View style={styles.supportContainer}>
            <TouchableOpacity style={styles.supportItem}>
              <Ionicons name="help-circle-outline" size={16} color="#666" />
              <Text style={styles.supportText}>FAQ & Help Center (अक्सर पूछे जाने वाले सवाल)</Text>
              <Ionicons name="chevron-forward-outline" size={16} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.supportItem}>
              <Ionicons name="mail-outline" size={16} color="#666" />
              <Text style={styles.supportText}>Contact Kisan Helpline (किसान सहायता नंबर: 1800-180-1551)</Text>
              <Ionicons name="chevron-forward-outline" size={16} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.supportItem}>
              <Ionicons name="star-outline" size={16} color="#666" />
              <Text style={styles.supportText}>Rate KrishiMitra (रेटिंग दें)</Text>
              <Ionicons name="chevron-forward-outline" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={16} color="#F44336" />
            <Text style={styles.logoutText}>Sign Out (लॉग आउट करें)</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>कृषि मित्र (KrishiMitra) AI v2.2.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#15803d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  badgeOutline: {
    backgroundColor: 'transparent',
    borderColor: '#E0E0E0',
  },
  badgeText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
  },
  badgeOutlineText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  editButton: {
    padding: 8,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  achievementsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 14,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  achievementsContainer: {
    gap: 8,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  achievementEarned: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  achievementLocked: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    opacity: 0.65,
  },
  achievementIcon: {
    fontSize: 22,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  achievementDescription: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  earnedBadge: {
    backgroundColor: '#15803d',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  earnedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  activityCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  activityContainer: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    fontSize: 20,
  },
  activityInfo: {
    flex: 1,
  },
  activityAction: {
    fontSize: 13,
    color: '#1a1a1a',
  },
  activityTime: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  settingsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsContainer: {
    gap: 14,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  offlineModelSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginTop: 6,
  },
  offlineModelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readyBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  readyBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#166534',
  },
  modelReadyBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  modelReadyText: {
    fontSize: 12,
    color: '#15803d',
    lineHeight: 18,
    marginBottom: 8,
  },
  deleteModelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#fee2e2',
  },
  deleteModelBtnText: {
    fontSize: 12,
    color: '#b91c1c',
    fontWeight: '600',
  },
  downloadingBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  progressBytesText: {
    fontSize: 12,
    color: '#64748b',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  cancelDownloadBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cancelDownloadBtnText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
  },
  notDownloadedBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  notDownloadedText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginBottom: 8,
  },
  downloadModelBtn: {
    backgroundColor: '#15803d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  downloadModelBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  supportCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  supportContainer: {
    gap: 12,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  supportText: {
    flex: 1,
    fontSize: 13,
    color: '#1a1a1a',
  },
  logoutContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    backgroundColor: '#FFEBEE',
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
});
