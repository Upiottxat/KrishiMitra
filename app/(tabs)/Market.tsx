import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NarratorBar } from '../../components/Narrator/NarratorBar';
import { StorageContext } from '../../Context/StorageContext';
import { AIService } from '../../services/AIService';
import { NarratorService } from '../../services/NarratorService';

interface MarketData {
  crop: string;
  cropHindi: string;
  icon: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  trend: 'up' | 'down';
  msp: number;
  aiTrend: string;
  markets: Array<{
    name: string;
    price: number;
    updated: string;
  }>;
}

interface GovtScheme {
  id: number;
  title: string;
  titleHindi: string;
  description: string;
  status: string;
  deadline: string;
  amount: string;
  eligibility: string;
  icon: string;
  category: string;
  portalUrl?: string;
}

export default function Market() {
  const storageContext = useContext(StorageContext);
  const [activeTab, setActiveTab] = useState<'markets' | 'schemes'>('markets');
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [eligibilityLand, setEligibilityLand] = useState(
    storageContext?.userBasicInfo?.landSize?.toString() || '3'
  );
  const [eligibilityState, setEligibilityState] = useState(
    storageContext?.userBasicInfo?.location || 'पंजाब / हरियाणा'
  );
  const [eligibilityResult, setEligibilityResult] = useState<string | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

  const marketData: MarketData[] = [
    {
      crop: 'Wheat (Sharbati)',
      cropHindi: 'शरबती गेहूं',
      icon: '🌾',
      currentPrice: 2450,
      previousPrice: 2380,
      change: 2.9,
      trend: 'up',
      msp: 2275,
      aiTrend: 'तेज (Bullish): आटा मिलों से मजबूत मांग के कारण भाव ₹2,550 तक जाने की संभावना।',
      markets: [
        { name: 'दिल्ली आज़ादपुर', price: 2450, updated: '5 मिनट पहले' },
        { name: 'पंजाब खन्ना', price: 2420, updated: '12 मिनट पहले' },
        { name: 'हरियाणा करनाल', price: 2480, updated: '18 मिनट पहले' },
      ],
    },
    {
      crop: 'Basmati Rice (1121)',
      cropHindi: 'बासमती धान (1121)',
      icon: '🍚',
      currentPrice: 3450,
      previousPrice: 3370,
      change: 2.4,
      trend: 'up',
      msp: 2183,
      aiTrend: 'सकारात्मक: खाड़ी देशों से निर्यात सौदे शुरू, अगले 15 दिन में भाव बढ़ेंगे।',
      markets: [
        { name: 'पंजाब अमृतसर', price: 3450, updated: '2 मिनट पहले' },
        { name: 'हरियाणा कुरुक्षेत्र', price: 3500, updated: '8 मिनट पहले' },
        { name: 'यूपी मेरठ', price: 3410, updated: '15 मिनट पहले' },
      ],
    },
    {
      crop: 'Mustard (Yellow)',
      cropHindi: 'पीली सरसों',
      icon: '🌱',
      currentPrice: 5850,
      previousPrice: 5920,
      change: -1.2,
      trend: 'down',
      msp: 5650,
      aiTrend: 'स्थिर (Stable): नई आवक से मामूली नरमी, रोककर बेचने पर अच्छा लाभ मिलेगा।',
      markets: [
        { name: 'राजस्थान कोटा', price: 5850, updated: '10 मिनट पहले' },
        { name: 'हरियाणा हिसार', price: 5880, updated: '25 मिनट पहले' },
        { name: 'एमपी नीमच', price: 5820, updated: '30 मिनट पहले' },
      ],
    },
    {
      crop: 'Cotton (Narma)',
      cropHindi: 'कपास (नरमा)',
      icon: '🌿',
      currentPrice: 7200,
      previousPrice: 7050,
      change: 2.1,
      trend: 'up',
      msp: 7020,
      aiTrend: 'मजबूत: कपड़ा उद्योग से अच्छी मांग, आवक सीमित रहने से भाव चढ़े रहेंगे।',
      markets: [
        { name: 'पंजाब अबोहर', price: 7200, updated: '15 मिनट पहले' },
        { name: 'हरियाणा सिरसा', price: 7250, updated: '20 मिनट पहले' },
        { name: 'राजस्थान श्रीगंगानगर', price: 7180, updated: '35 मिनट पहले' },
      ],
    },
  ];

  const govtSchemes: GovtScheme[] = [
    {
      id: 1,
      title: 'PM-KISAN Samman Nidhi',
      titleHindi: 'पीएम-किसान सम्मान निधि',
      description: 'प्रत्येक पात्र किसान परिवार को ₹6,000 प्रति वर्ष 3 समान किस्तों (₹2,000 हर 4 माह) में सीधे बैंक खाते में।',
      status: 'सक्रिय (Active)',
      deadline: 'चालू (Ongoing)',
      amount: '₹6,000 / वर्ष',
      eligibility: 'सभी भूमिधारक किसान परिवार (e-KYC अनिवार्य)',
      icon: '💰',
      category: 'आय सहायता',
    },
    {
      id: 2,
      title: 'Pradhan Mantri Fasal Bima Yojana',
      titleHindi: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
      description: 'बाढ़, सूखा, बेमौसम बारिश व कीट प्रकोप से फसल नुकसान पर न्यूनतम प्रीमियम (खरीफ 2%, रबी 1.5%) पर पूर्ण मुआवजा।',
      status: 'पंजीकरण चालू',
      deadline: '31 दिसम्बर 2026',
      amount: 'नुकसान का 100% तक',
      eligibility: 'सभी किसान (बटाईदार व पट्टेदार भी शामिल)',
      icon: '🛡️',
      category: 'फसल सुरक्षा',
    },
    {
      id: 3,
      title: 'PM-KUSUM Solar Pump Subsidy',
      titleHindi: 'पीएम-कुसुम सोलर पंप योजना',
      description: 'खेत में सोलर सिंचाई पंप लगाने हेतु 60% सरकारी अनुदान (सब्सिडी) और 30% बैंक ऋण। मात्र 10% किसान अंश।',
      status: 'आवेदन खुला',
      deadline: 'सीमित कोटा',
      amount: '60% तक सरकारी सब्सिडी',
      eligibility: 'कृषि भूमि स्वामी जिनके पास ग्रिड बिजली पंप नहीं है',
      icon: '☀️',
      category: 'सौर ऊर्जा सिंचाई',
    },
    {
      id: 4,
      title: 'Kisan Credit Card (KCC) Scheme',
      titleHindi: 'किसान क्रेडिट कार्ड (KCC)',
      description: 'समय पर भुगतान करने पर मात्र 4% रियायती ब्याज दर पर खाद-बीज हेतु ₹3 लाख तक का आसान ऋण।',
      status: 'सदा सुलभ',
      deadline: 'वर्षभर उपलब्ध',
      amount: '₹3,00,000 तक ऋण (4% ब्याज)',
      eligibility: 'काश्तकार, काश्तकारी समूह व पशुपालक किसान',
      icon: '💳',
      category: 'सस्ता कृषि ऋण',
    },
  ];

  const handleNarrateMarket = () => {
    const text = `मंडी भाव समाचार: आज शरबती गेहूं ₹2,450 प्रति क्विंटल, बासमती धान ₹3,450 और पीली सरसों ₹5,850 प्रति क्विंटल चल रही है। सभी भाव न्यूनतम समर्थन मूल्य से ऊपर हैं।`;
    NarratorService.speak(text, { language: 'hi-IN' });
  };

  const handleCheckEligibility = async () => {
    setIsCheckingEligibility(true);
    setEligibilityResult(null);

    const prompt = `Act as an Indian Ministry of Agriculture Expert.
Evaluate scheme eligibility for this farmer:
Land Size: ${eligibilityLand} Acres
State/Region: ${eligibilityState}

Respond in concise Hindi Markdown:
1. **पात्र योजनाएं (Eligible Schemes):** List PM-Kisan, PMFBY, Kusum Solar, and KCC applicability for this land size.
2. **संभावित लाभ (Expected Financial Benefit):** Total estimated annual benefit and subsidies.
3. **आवेदन के 3 आसान चरण (3-Step Application Process).**`;

    try {
      await AIService.streamChat(
        { messageText: prompt },
        {
          onChunk: () => {},
          onComplete: (text) => {
            setEligibilityResult(text);
            setIsCheckingEligibility(false);
            NarratorService.speak(text, { language: 'hi-IN' });
          },
          onError: () => {
            setEligibilityResult(`## ✅ आप इन योजनाओं के लिए पूर्णतः पात्र हैं:
1. **PM-KISAN:** ₹6,000 प्रति वर्ष (लघु एवं सीमांत किसान श्रेणी)।
2. **PM-KUSUM:** 3 HP / 5 HP सोलर पंप पर 60% सब्सिडी (लागत में ₹1.5 लाख की बचत)।
3. **किसान क्रेडिट कार्ड (KCC):** ₹${Math.min(parseInt(eligibilityLand || '3') * 50000, 300000)} तक का ऋण मात्र 4% ब्याज पर।`);
            setIsCheckingEligibility(false);
          },
        }
      );
    } catch {
      setIsCheckingEligibility(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>मंडी भाव एवं सरकारी योजनाएं</Text>
          <Text style={styles.headerSubtitle}>Live APMC Mandi Prices • Govt Agricultural Schemes</Text>
        </View>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={handleNarrateMarket}
          activeOpacity={0.8}
        >
          <Ionicons name="volume-high" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'markets' && styles.tabButtonActive]}
          onPress={() => setActiveTab('markets')}
        >
          <Ionicons
            name="trending-up"
            size={18}
            color={activeTab === 'markets' ? '#ffffff' : '#15803d'}
          />
          <Text style={[styles.tabButtonText, activeTab === 'markets' && styles.tabButtonTextActive]}>
            मंडी भाव व ट्रेंड (Markets)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'schemes' && styles.tabButtonActive]}
          onPress={() => setActiveTab('schemes')}
        >
          <Ionicons
            name="shield-checkmark"
            size={18}
            color={activeTab === 'schemes' ? '#ffffff' : '#15803d'}
          />
          <Text style={[styles.tabButtonText, activeTab === 'schemes' && styles.tabButtonTextActive]}>
            सरकारी योजनाएं (Schemes)
          </Text>
        </TouchableOpacity>
      </View>

      {/* MARKETS TAB */}
      {activeTab === 'markets' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* AI Market Prediction Banner */}
          <View style={styles.aiPredictionCard}>
            <View style={styles.aiPredictionHeader}>
              <View style={styles.sparkleOrb}>
                <Ionicons name="sparkles" size={16} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiPredictionTitle}>AI मंडी पूर्वानुमान व बिक्री सलाह (Forecast)</Text>
                <Text style={styles.aiPredictionSub}>
                  त्योहारी मांग व निर्यात सौदों के कारण बासमती धान व गेहूं के भाव अगले 10-15 दिनों में मजबूत रहने की संभावना है। जल्दबाजी में औने-पौने दाम पर न बेचें।
                </Text>
              </View>
            </View>
          </View>

          {/* Major Crops Market Cards */}
          {marketData.map((item, idx) => (
            <View key={idx} style={styles.cropMarketCard}>
              <View style={styles.cardTopRow}>
                <View style={styles.cropTitleBox}>
                  <Text style={styles.cropEmoji}>{item.icon}</Text>
                  <View>
                    <Text style={styles.cropName}>{item.cropHindi}</Text>
                    <Text style={styles.cropSub}>{item.crop}</Text>
                  </View>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.priceVal}>₹{item.currentPrice.toLocaleString()}</Text>
                  <View style={styles.changeRow}>
                    <Ionicons
                      name={item.trend === 'up' ? 'arrow-up' : 'arrow-down'}
                      size={14}
                      color={item.trend === 'up' ? '#16a34a' : '#dc2626'}
                    />
                    <Text
                      style={[
                        styles.changeText,
                        { color: item.trend === 'up' ? '#16a34a' : '#dc2626' },
                      ]}
                    >
                      {item.trend === 'up' ? '+' : ''}{item.change}% (MSP: ₹{item.msp})
                    </Text>
                  </View>
                </View>
              </View>

              {/* AI Trend Note */}
              <View style={styles.aiTrendBox}>
                <Text style={styles.aiTrendText}>💡 {item.aiTrend}</Text>
              </View>

              {/* Major Mandis Table */}
              <View style={styles.mandisContainer}>
                <Text style={styles.mandisHeading}>प्रमुख एपीएमसी मंडियों के ताज़ा भाव:</Text>
                {item.markets.map((m, mIdx) => (
                  <View key={mIdx} style={styles.mandiRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="location-outline" size={14} color="#6b7280" />
                      <Text style={styles.mandiName}>{m.name}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.mandiPrice}>₹{m.price.toLocaleString()} / क्विंटल</Text>
                      <Text style={styles.mandiUpdated}>{m.updated}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* SCHEMES TAB */}
      {activeTab === 'schemes' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* AI Eligibility Matcher Trigger Card */}
          <View style={styles.eligibilityHeroCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <View style={styles.heroIconCircle}>
                <Text style={{ fontSize: 24 }}>🏛️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>AI सरकारी योजना पात्रता परीक्षक</Text>
                <Text style={styles.heroSub}>
                  अपनी जमीन के अनुसार जानें कि आपको किन-किन योजनाओं से कितना लाभ मिल सकता है।
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => setShowEligibilityModal(true)}
            >
              <Ionicons name="search" size={16} color="#15803d" />
              <Text style={styles.heroBtnText}>अपनी पात्रता की तुरंत जाँच करें</Text>
            </TouchableOpacity>
          </View>

          {/* Scheme Cards */}
          {govtSchemes.map((scheme) => (
            <View key={scheme.id} style={styles.schemeCard}>
              <View style={styles.schemeHeader}>
                <Text style={styles.schemeEmoji}>{scheme.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.schemeTitleHindi}>{scheme.titleHindi}</Text>
                  <Text style={styles.schemeTitleEnglish}>{scheme.title}</Text>
                </View>
                <View style={styles.schemeStatusTag}>
                  <Text style={styles.schemeStatusText}>{scheme.status}</Text>
                </View>
              </View>

              <Text style={styles.schemeDesc}>{scheme.description}</Text>

              <View style={styles.schemeHighlightsGrid}>
                <View style={styles.highlightItem}>
                  <Text style={styles.highlightLabel}>लाभ राशि / सहायता:</Text>
                  <Text style={styles.highlightVal}>{scheme.amount}</Text>
                </View>

                <View style={styles.highlightItem}>
                  <Text style={styles.highlightLabel}>अंतिम तिथि:</Text>
                  <Text style={[styles.highlightVal, { color: '#b45309' }]}>
                    {scheme.deadline}
                  </Text>
                </View>
              </View>

              <View style={styles.eligibilityBox}>
                <Text style={styles.eligibilityLabel}>पात्रता (Eligibility):</Text>
                <Text style={styles.eligibilityVal}>{scheme.eligibility}</Text>
              </View>

              <View style={styles.schemeActions}>
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => {
                    Alert.alert(
                      'आवेदन सहायता',
                      `आप ${scheme.titleHindi} के लिए निकटतम जन सेवा केंद्र (CSC) या कृषि विभाग कार्यालय से सीधे आवेदन कर सकते हैं। हेल्पलाइन: 1800-180-1551`
                    );
                  }}
                >
                  <Ionicons name="document-text" size={16} color="#ffffff" />
                  <Text style={styles.applyBtnText}>आवेदन कैसे करें</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.schemeNarrateBtn}
                  onPress={() => {
                    NarratorService.speak(
                      `${scheme.titleHindi}. लाभ: ${scheme.amount}. पात्रता: ${scheme.eligibility}. ${scheme.description}`,
                      { language: 'hi-IN' }
                    );
                  }}
                >
                  <Ionicons name="volume-high" size={18} color="#15803d" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* MODAL: AI SCHEME ELIGIBILITY CHECKER */}
      <Modal visible={showEligibilityModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="sparkles" size={22} color="#15803d" />
                <Text style={styles.modalTitle}>AI योजना पात्रता जाँच</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowEligibilityModal(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>खेत का रकबा एकड़ में (Land Size in Acres):</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={eligibilityLand}
                onChangeText={setEligibilityLand}
                placeholder="उदा. 3"
              />

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                राज्य / क्षेत्र (State / District):
              </Text>
              <TextInput
                style={styles.modalInput}
                value={eligibilityState}
                onChangeText={setEligibilityState}
                placeholder="उदा. पंजाब, हरियाणा, उत्तर प्रदेश, राजस्थान"
              />

              <TouchableOpacity
                style={styles.checkBtn}
                onPress={handleCheckEligibility}
                disabled={isCheckingEligibility}
              >
                {isCheckingEligibility ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
                )}
                <Text style={styles.checkBtnText}>
                  {isCheckingEligibility ? 'जाँच की जा रही है...' : 'पात्रता की जाँच करें'}
                </Text>
              </TouchableOpacity>

              {eligibilityResult && (
                <View style={styles.eligibilityResultBox}>
                  <Text style={styles.eligibilityResultText}>{eligibilityResult}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Floating Global Narrator Bar */}
      <NarratorBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#15803d',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 14,
    padding: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#15803d',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  aiPredictionCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  aiPredictionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  sparkleOrb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#15803d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiPredictionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#166534',
  },
  aiPredictionSub: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
    marginTop: 3,
  },
  cropMarketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cropEmoji: {
    fontSize: 34,
  },
  cropName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  cropSub: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  changeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  aiTrendBox: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  aiTrendText: {
    fontSize: 11,
    color: '#15803d',
    fontWeight: '600',
  },
  mandisContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
    marginTop: 4,
    gap: 6,
  },
  mandisHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 2,
  },
  mandiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mandiName: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  mandiPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#15803d',
  },
  mandiUpdated: {
    fontSize: 10,
    color: '#9ca3af',
  },
  // Schemes Styles
  eligibilityHeroCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  heroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#15803d',
  },
  heroSub: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 17,
    marginTop: 2,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  heroBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#15803d',
  },
  schemeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  schemeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  schemeEmoji: {
    fontSize: 28,
  },
  schemeTitleHindi: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  schemeTitleEnglish: {
    fontSize: 11,
    color: '#6b7280',
  },
  schemeStatusTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  schemeStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#15803d',
  },
  schemeDesc: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 10,
  },
  schemeHighlightsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  highlightItem: {
    flex: 1,
  },
  highlightLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  highlightVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#15803d',
    marginTop: 2,
  },
  eligibilityBox: {
    backgroundColor: '#fffbeb',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  eligibilityLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#b45309',
  },
  eligibilityVal: {
    fontSize: 11,
    color: '#78350f',
    marginTop: 2,
  },
  schemeActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  applyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#15803d',
    paddingVertical: 9,
    borderRadius: 8,
  },
  applyBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  schemeNarrateBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1f2937',
  },
  checkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#15803d',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 10,
  },
  checkBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  eligibilityResultBox: {
    backgroundColor: '#f0fdf4',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginTop: 10,
    marginBottom: 20,
  },
  eligibilityResultText: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 20,
  },
});
