import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { StorageContext } from '../../Context/StorageContext';
import { AIService, AIProviderTier } from '../../services/AIService';
import { NarratorService } from '../../services/NarratorService';

export default function CropRecommendationScreen() {
  const storageContext = useContext(StorageContext);
  const [activeTab, setActiveTab] = useState<'recommend' | 'fertilizer' | 'pest' | 'calendar'>('recommend');

  // Recommendation Form State
  const [soilType, setSoilType] = useState('दोमट मिट्टी (Alluvial Loam)');
  const [season, setSeason] = useState('रबी (Rabi / Winter)');
  const [waterSource, setWaterSource] = useState('नलकूप / बोरवेल (Tube well)');
  const [investment, setInvestment] = useState('मध्यम (Medium)');
  const [recommendationResult, setRecommendationResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultTier, setResultTier] = useState<AIProviderTier>('groq/openai/gpt-oss-20b');

  // Fertilizer Calculator State
  const [calcCrop, setCalcCrop] = useState('गेहूं (Wheat)');
  const [calcAcres, setCalcAcres] = useState('2');
  const [fertilizerResult, setFertilizerResult] = useState<{
    ureaBags: number;
    dapBags: number;
    potashBags: number;
    zincKg: number;
    schedule: string[];
  } | null>(null);

  const SOIL_TYPES = [
    'दोमट मिट्टी (Alluvial Loam)',
    'काली मिट्टी (Black Soil)',
    'लाल मिट्टी (Red Soil)',
    'बलुई मिट्टी (Sandy Loam)',
    'चिकनी मिट्टी (Clay Loam)',
  ];

  const SEASONS = [
    'रबी (Rabi / Winter)',
    'खरीफ (Kharif / Monsoon)',
    'जायद (Zaid / Summer)',
  ];

  const WATER_SOURCES = [
    'नलकूप / बोरवेल (Tube well)',
    'नहर सिंचाई (Canal)',
    'वर्षा आधारित (Rainfed)',
    'ड्रिप / फव्वारा (Drip/Sprinkler)',
  ];

  const FERTILIZER_CROPS = [
    'गेहूं (Wheat)',
    'धान (Paddy/Rice)',
    'मक्का (Corn/Maize)',
    'सरसों (Mustard)',
    'कपास (Cotton)',
    'आलू (Potato)',
    'गन्ना (Sugarcane)',
  ];

  const handleGenerateCropPlan = async () => {
    setIsGenerating(true);
    setRecommendationResult(null);

    const prompt = `Act as an expert agricultural scientist. Provide a top crop recommendation plan based on:
Soil Type: ${soilType}
Season: ${season}
Water Source: ${waterSource}
Farmer Investment: ${investment}
Location: ${storageContext?.userBasicInfo?.location || 'North India'}

Format your answer in clear, farmer-friendly Markdown in Hindi with these exact sections:
## 🌾 शीर्ष 2 अनुशंसित फसलें (Top 2 Recommended Crops)
1. **फसल 1**: नाम, किस्म (Variety), अनुमानित उपज (Yield per acre), और शुद्ध मुनाफा (₹ Net Profit per acre).
2. **फसल 2**: नाम, किस्म (Variety), अनुमानित उपज, और शुद्ध मुनाफा.
## 💧 जल व सिंचाई प्रबंधन (Water Management)
- मुख्य सिंचाई चरण.
## 🧪 खाद एवं पोषण योजना (Fertilizer Plan)
- प्रति एकड़ यूरिया, डीएपी और पोटाश का शेड्यूल.
## 🌟 कृषि मित्र विशेष सलाह (Doctor's Special Tip)`;

    try {
      await AIService.streamChat(
        {
          messageText: prompt,
          langInstruction: 'Important: Respond in clear conversational Hindi in Markdown.',
          customGroqKey: storageContext?.customGroqKey,
          customGeminiKey: storageContext?.customGeminiKey,
        },
        {
          onModelSelected: (tier) => setResultTier(tier),
          onChunk: (chunk) => setRecommendationResult(chunk),
          onComplete: (text, tier) => {
            setRecommendationResult(text);
            setResultTier(tier);
            setIsGenerating(false);
            NarratorService.speak(text, { language: 'hi-IN' });
          },
          onError: () => {
            const fallback = `## 🌾 शीर्ष 2 अनुशंसित फसलें
1. **उन्नत गेहूं (HD-3086 / PBW-550)**:
   - अनुमानित उपज: 22-25 क्विंटल/एकड़
   - शुद्ध लाभ: ₹40,000 - ₹50,000 / एकड़
2. **पीली सरसों (गिरिराज / पूसा बोल्ड)**:
   - अनुमानित उपज: 10-12 क्विंटल/एकड़
   - शुद्ध लाभ: ₹45,000 - ₹55,000 / एकड़
## 💧 जल प्रबंधन
- गेहूं में प्रथम सिंचाई (CRI चरण) 21 दिन पर अति आवश्यक है।
## 🧪 खाद प्रबंधन
- प्रति एकड़ 2 बोरी यूरिया + 1 बोरी डीएपी + 25 किलो पोटाश का प्रयोग करें।`;
            setRecommendationResult(fallback);
            setIsGenerating(false);
          },
        }
      );
    } catch {
      setIsGenerating(false);
    }
  };

  const handleCalculateFertilizer = () => {
    const acres = parseFloat(calcAcres) || 1;
    let ureaPerAcre = 2; // bags
    let dapPerAcre = 1; // bags
    let potashPerAcre = 0.5; // bags
    let zincPerAcre = 5; // kg
    let schedule = [
      'बुवाई के समय: सम्पूर्ण DAP और पोटाश + 1/3 यूरिया बेसल डोज के रूप में दें।',
      'प्रथम सिंचाई (21-25 दिन): 1/3 यूरिया + जिंक सल्फेट छिड़कें।',
      'द्वितीय सिंचाई (45-50 दिन): शेष 1/3 यूरिया कल्ले निकलते समय डालें।',
    ];

    if (calcCrop.includes('धान') || calcCrop.includes('Paddy')) {
      ureaPerAcre = 2.5;
      dapPerAcre = 1.2;
      potashPerAcre = 0.8;
      zincPerAcre = 8;
      schedule = [
        'रोपाई के समय: पूरी DAP, पोटाश और जिंक बेसल खाद के रूप में।',
        'रोपाई के 20 दिन बाद: आधा यूरिया कल्ले फूटते समय।',
        'रोपाई के 42 दिन बाद: शेष यूरिया बाली निकलने से पूर्व।',
      ];
    } else if (calcCrop.includes('सरसों') || calcCrop.includes('Mustard')) {
      ureaPerAcre = 1.5;
      dapPerAcre = 1.0;
      potashPerAcre = 0.5;
      zincPerAcre = 4;
      schedule = [
        'बुवाई के समय: सम्पूर्ण DAP, पोटाश और 10 किलो बेंटोनाइट सल्फर।',
        'पहली सिंचाई (फूल आने से पहले): सम्पूर्ण शेष यूरिया दें।',
      ];
    } else if (calcCrop.includes('आलू') || calcCrop.includes('Potato')) {
      ureaPerAcre = 3.5;
      dapPerAcre = 2.0;
      potashPerAcre = 1.5;
      zincPerAcre = 10;
      schedule = [
        'बुवाई के समय: पूरी DAP, पोटाश और 1/3 यूरिया।',
        'मिट्टी चढ़ाते समय (30 दिन): 1/3 यूरिया।',
        'कंद बनते समय (50 दिन): शेष यूरिया व 0:0:50 का पर्णीय छिड़काव।',
      ];
    }

    const result = {
      ureaBags: Math.round(ureaPerAcre * acres * 10) / 10,
      dapBags: Math.round(dapPerAcre * acres * 10) / 10,
      potashBags: Math.round(potashPerAcre * acres * 10) / 10,
      zincKg: Math.round(zincPerAcre * acres),
      schedule,
    };

    setFertilizerResult(result);

    const speech = `${acres} एकड़ ${calcCrop} के लिए अनुशंसित मात्रा: यूरिया ${result.ureaBags} बोरी, डीएपी ${result.dapBags} बोरी, पोटाश ${result.potashBags} बोरी और जिंक ${result.zincKg} किलोग्राम।`;
    NarratorService.speak(speech, { language: 'hi-IN' });
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'recommend' && styles.tabItemActive]}
          onPress={() => setActiveTab('recommend')}
        >
          <Ionicons
            name="leaf"
            size={16}
            color={activeTab === 'recommend' ? '#ffffff' : '#15803d'}
          />
          <Text style={[styles.tabLabel, activeTab === 'recommend' && styles.tabLabelActive]}>
            फसल सुझाव
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'fertilizer' && styles.tabItemActive]}
          onPress={() => setActiveTab('fertilizer')}
        >
          <Ionicons
            name="calculator"
            size={16}
            color={activeTab === 'fertilizer' ? '#ffffff' : '#15803d'}
          />
          <Text style={[styles.tabLabel, activeTab === 'fertilizer' && styles.tabLabelActive]}>
            खाद कैलकुलेटर
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'pest' && styles.tabItemActive]}
          onPress={() => setActiveTab('pest')}
        >
          <Ionicons
            name="bug"
            size={16}
            color={activeTab === 'pest' ? '#ffffff' : '#15803d'}
          />
          <Text style={[styles.tabLabel, activeTab === 'pest' && styles.tabLabelActive]}>
            कीट व रोग
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'calendar' && styles.tabItemActive]}
          onPress={() => setActiveTab('calendar')}
        >
          <Ionicons
            name="calendar"
            size={16}
            color={activeTab === 'calendar' ? '#ffffff' : '#15803d'}
          />
          <Text style={[styles.tabLabel, activeTab === 'calendar' && styles.tabLabelActive]}>
            कैलेंडर
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* TAB 1: CROP RECOMMENDATION WIZARD */}
        {activeTab === 'recommend' && (
          <View style={styles.tabContent}>
            <View style={styles.headerBox}>
              <View style={styles.headerIconCircle}>
                <Text style={{ fontSize: 22 }}>🌱</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>AI फसल चयन सलाहकार</Text>
                <Text style={styles.headerSubtitle}>
                  मिट्टी व मौसम के अनुसार सर्वाधिक मुनाफे वाली फसलों की सिफारिश
                </Text>
              </View>
            </View>

            {/* Selectors */}
            <Text style={styles.fieldLabel}>1. खेत की मिट्टी का प्रकार (Soil Type)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
              {SOIL_TYPES.map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.optionPill, soilType === st && styles.optionPillActive]}
                  onPress={() => setSoilType(st)}
                >
                  <Text style={[styles.optionPillText, soilType === st && styles.optionPillTextActive]}>
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>2. बुवाई का मौसम (Season)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
              {SEASONS.map((sn) => (
                <TouchableOpacity
                  key={sn}
                  style={[styles.optionPill, season === sn && styles.optionPillActive]}
                  onPress={() => setSeason(sn)}
                >
                  <Text style={[styles.optionPillText, season === sn && styles.optionPillTextActive]}>
                    {sn}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>3. पानी व सिंचाई की सुविधा (Water Source)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
              {WATER_SOURCES.map((ws) => (
                <TouchableOpacity
                  key={ws}
                  style={[styles.optionPill, waterSource === ws && styles.optionPillActive]}
                  onPress={() => setWaterSource(ws)}
                >
                  <Text style={[styles.optionPillText, waterSource === ws && styles.optionPillTextActive]}>
                    {ws}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Generate Button */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleGenerateCropPlan}
              disabled={isGenerating}
              activeOpacity={0.85}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="sparkles" size={20} color="#ffffff" />
              )}
              <Text style={styles.actionBtnText}>
                {isGenerating ? 'AI फसल योजना बन रही है...' : 'AI से सर्वश्रेष्ठ फसल सुझाव पाएं'}
              </Text>
            </TouchableOpacity>

            {/* Results Card */}
            {recommendationResult ? (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={styles.aiTag}>
                    <Text style={styles.aiTagText}>
                      {resultTier === 'offline/rule-engine' ? '📶 ऑफ़लाइन AI' : '✨ कृषि मित्र AI सुझाव'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.listenBtn}
                    onPress={() => NarratorService.speak(recommendationResult, { language: 'hi-IN' })}
                  >
                    <Ionicons name="volume-high" size={16} color="#15803d" />
                    <Text style={styles.listenBtnText}>योजना सुनें</Text>
                  </TouchableOpacity>
                </View>

                <Markdown
                  style={{
                    body: { fontSize: 14, color: '#1f2937', lineHeight: 22 },
                    heading2: { fontSize: 16, fontWeight: 'bold', color: '#15803d', marginTop: 10, marginBottom: 4 },
                    heading3: { fontSize: 15, fontWeight: '600', color: '#166534', marginTop: 6 },
                  }}
                >
                  {recommendationResult}
                </Markdown>
              </View>
            ) : null}
          </View>
        )}

        {/* TAB 2: FERTILIZER & NPK CALCULATOR */}
        {activeTab === 'fertilizer' && (
          <View style={styles.tabContent}>
            <View style={styles.headerBox}>
              <View style={[styles.headerIconCircle, { backgroundColor: '#fef3c7' }]}>
                <Text style={{ fontSize: 22 }}>🧪</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>संतुलित NPK खाद कैलकुलेटर</Text>
                <Text style={styles.headerSubtitle}>
                  फसल व एकड़ के अनुसार यूरिया, डीएपी और पोटाश की सही गणना
                </Text>
              </View>
            </View>

            <Text style={styles.fieldLabel}>फसल चुनें (Select Crop)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
              {FERTILIZER_CROPS.map((cr) => (
                <TouchableOpacity
                  key={cr}
                  style={[styles.optionPill, calcCrop === cr && styles.optionPillActive]}
                  onPress={() => setCalcCrop(cr)}
                >
                  <Text style={[styles.optionPillText, calcCrop === cr && styles.optionPillTextActive]}>
                    {cr}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>खेत का रकबा एकड़ में (Land in Acres)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={calcAcres}
              onChangeText={setCalcAcres}
              placeholder="उदा. 2"
            />

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#0284c7' }]}
              onPress={handleCalculateFertilizer}
            >
              <Ionicons name="calculator-outline" size={20} color="#ffffff" />
              <Text style={styles.actionBtnText}>खाद की मात्रा की गणना करें</Text>
            </TouchableOpacity>

            {fertilizerResult && (
              <View style={styles.fertilizerResultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.fertilizerResultTitle}>
                    {calcAcres} एकड़ {calcCrop} के लिए आवश्यक खाद:
                  </Text>
                  <TouchableOpacity
                    style={styles.listenBtn}
                    onPress={() => {
                      const msg = `यूरिया ${fertilizerResult.ureaBags} बोरी, डीएपी ${fertilizerResult.dapBags} बोरी, पोटाश ${fertilizerResult.potashBags} बोरी।`;
                      NarratorService.speak(msg, { language: 'hi-IN' });
                    }}
                  >
                    <Ionicons name="volume-high" size={16} color="#15803d" />
                    <Text style={styles.listenBtnText}>सुनें</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.nutrientGrid}>
                  <View style={[styles.nutrientBox, { backgroundColor: '#eff6ff' }]}>
                    <Text style={styles.nutrientEmoji}>🌾</Text>
                    <Text style={styles.nutrientVal}>{fertilizerResult.ureaBags} बोरी</Text>
                    <Text style={styles.nutrientLabel}>यूरिया (45 kg)</Text>
                  </View>

                  <View style={[styles.nutrientBox, { backgroundColor: '#f0fdf4' }]}>
                    <Text style={styles.nutrientEmoji}>🌿</Text>
                    <Text style={styles.nutrientVal}>{fertilizerResult.dapBags} बोरी</Text>
                    <Text style={styles.nutrientLabel}>डीएपी (50 kg)</Text>
                  </View>

                  <View style={[styles.nutrientBox, { backgroundColor: '#faf5ff' }]}>
                    <Text style={styles.nutrientEmoji}>🧪</Text>
                    <Text style={styles.nutrientVal}>{fertilizerResult.potashBags} बोरी</Text>
                    <Text style={styles.nutrientLabel}>एमओपी पोटाश</Text>
                  </View>

                  <View style={[styles.nutrientBox, { backgroundColor: '#fffbeb' }]}>
                    <Text style={styles.nutrientEmoji}>⚡</Text>
                    <Text style={styles.nutrientVal}>{fertilizerResult.zincKg} kg</Text>
                    <Text style={styles.nutrientLabel}>जिंक सल्फेट</Text>
                  </View>
                </View>

                <Text style={[styles.fieldLabel, { marginTop: 14 }]}>📅 खाद देने का सही समय व तरीका:</Text>
                {fertilizerResult.schedule.map((step, idx) => (
                  <View key={idx} style={styles.scheduleRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#15803d" />
                    <Text style={styles.scheduleText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* TAB 3: PEST & DISEASE QUICK GUIDE */}
        {activeTab === 'pest' && (
          <View style={styles.tabContent}>
            <View style={styles.headerBox}>
              <View style={[styles.headerIconCircle, { backgroundColor: '#fee2e2' }]}>
                <Text style={{ fontSize: 22 }}>🐞</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>कीट एवं रोग नियंत्रण गाइड</Text>
                <Text style={styles.headerSubtitle}>
                  प्रमुख फसलों के रोगों के लक्षण व जैविक-रासायनिक उपचार
                </Text>
              </View>
            </View>

            {[
              {
                title: 'गेहूं का पीला रतुआ (Yellow Rust in Wheat)',
                symptoms: 'पत्तियों पर हल्दी जैसे पीले रंग की धारियाँ या पाउडर दिखाई देना।',
                organic: 'खट्टी छाछ (5L) + नीम तेल (3ml/L) का छिड़काव।',
                chemical: 'प्रोपिकोनाज़ोल 25% EC (टिल्ट) @ 1ml प्रति लीटर पानी।',
              },
              {
                title: 'धान का झुलसा रोग (Blast in Rice)',
                symptoms: 'पत्तियों पर नाव के आकार के बीच में धूसर और किनारे भूरे धब्बे।',
                organic: 'स्यूडोमोनास फ्लोरेसेंस (10g/L) का छिड़काव।',
                chemical: 'ट्राइसाइक्लाज़ोल 75% WP @ 0.6g प्रति लीटर पानी।',
              },
              {
                title: 'टमाटर का अगेती व पछेती झुलसा (Blight in Tomato)',
                symptoms: 'निचली पत्तियों पर गोल छल्लेदार काले-भूरे धब्बे और सूखना।',
                organic: 'ट्राइकोडर्मा विरिडी (5g/L) + गौमूत्र अर्क (10%)।',
                chemical: 'कॉपर ऑक्सीक्लोराइड 50% WP @ 2.5g प्रति लीटर पानी।',
              },
              {
                title: 'सफेद मक्खी व चेपा (Whitefly & Aphids)',
                symptoms: 'पत्तियों से रस चूसना, पत्तियों का मुड़ना और पीला पड़ना।',
                organic: '10,000 PPM नीम तेल @ 3-5ml प्रति लीटर पानी + पीला स्टिकी ट्रैप (8/एकड़)।',
                chemical: 'इमिडाक्लोप्रिड 17.8% SL @ 0.5ml प्रति लीटर पानी।',
              },
            ].map((pest, index) => (
              <View key={index} style={styles.pestCard}>
                <View style={styles.pestHeader}>
                  <Text style={styles.pestTitle}>{pest.title}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      NarratorService.speak(`${pest.title}. लक्षण: ${pest.symptoms}. जैविक उपाय: ${pest.organic}`, { language: 'hi-IN' });
                    }}
                  >
                    <Ionicons name="volume-high" size={18} color="#15803d" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.pestSubtitle}>🔍 लक्षण:</Text>
                <Text style={styles.pestDesc}>{pest.symptoms}</Text>

                <View style={styles.cureBoxOrganic}>
                  <Text style={styles.cureLabelOrganic}>🌱 जैविक उपाय (Organic):</Text>
                  <Text style={styles.cureTextOrganic}>{pest.organic}</Text>
                </View>

                <View style={styles.cureBoxChemical}>
                  <Text style={styles.cureLabelChemical}>💊 रासायनिक उपाय (Chemical):</Text>
                  <Text style={styles.cureTextChemical}>{pest.chemical}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 4: CROP CALENDAR */}
        {activeTab === 'calendar' && (
          <View style={styles.tabContent}>
            <View style={styles.headerBox}>
              <View style={[styles.headerIconCircle, { backgroundColor: '#ede9fe' }]}>
                <Text style={{ fontSize: 22 }}>🗓️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>वार्षिक फसल कैलेंडर (Crop Calendar)</Text>
                <Text style={styles.headerSubtitle}>
                  बुवाई, निराई-गुड़ाई और कटाई का सर्वोत्तम समय चक्र
                </Text>
              </View>
            </View>

            {[
              {
                crop: 'गेहूं (Wheat)',
                sowing: '25 अक्टूबर - 20 नवम्बर',
                irrigation: '21 दिन (CRI), 45 दिन, 65 दिन, 85 दिन',
                harvest: 'मार्च - अप्रैल',
                tag: 'रबी प्रमुख',
              },
              {
                crop: 'सरसों (Mustard)',
                sowing: '15 सितम्बर - 25 अक्टूबर',
                irrigation: 'फूल आने से पहले (35 दिन) और फली बनते समय (65 दिन)',
                harvest: 'फरवरी - मार्च',
                tag: 'तिलहन',
              },
              {
                crop: 'धान (Paddy/Rice)',
                sowing: 'नर्सरी: 20 मई - 15 जून | रोपाई: 20 जून - 15 जुलाई',
                irrigation: 'दाने भरने तक 2-3 सेमी जल भराव',
                harvest: 'अक्टूबर - नवम्बर',
                tag: 'खरीफ प्रमुख',
              },
              {
                crop: 'कपास (Cotton)',
                sowing: '15 अप्रैल - 15 मई',
                irrigation: 'फूल व गूलर बनते समय नियमित अंतराल पर',
                harvest: 'अक्टूबर - दिसम्बर (3-4 चुनाई)',
                tag: 'नकदी फसल',
              },
            ].map((cal, idx) => (
              <View key={idx} style={styles.calendarCard}>
                <View style={styles.calendarHeader}>
                  <Text style={styles.calCropName}>{cal.crop}</Text>
                  <View style={styles.calTag}>
                    <Text style={styles.calTagText}>{cal.tag}</Text>
                  </View>
                </View>

                <View style={styles.calRow}>
                  <Text style={styles.calLabel}>🌱 बुवाई का समय:</Text>
                  <Text style={styles.calVal}>{cal.sowing}</Text>
                </View>

                <View style={styles.calRow}>
                  <Text style={styles.calLabel}>💧 सिंचाई चक्र:</Text>
                  <Text style={styles.calVal}>{cal.irrigation}</Text>
                </View>

                <View style={styles.calRow}>
                  <Text style={styles.calLabel}>🌾 कटाई समय:</Text>
                  <Text style={styles.calVal}>{cal.harvest}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 14,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: '#15803d',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#15803d',
  },
  tabLabelActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabContent: {
    paddingBottom: 30,
  },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginTop: 12,
    marginBottom: 6,
  },
  optionsScroll: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  optionPill: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
  },
  optionPillActive: {
    backgroundColor: '#15803d',
    borderColor: '#15803d',
  },
  optionPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  optionPillTextActive: {
    color: '#ffffff',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#15803d',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 16,
    marginBottom: 14,
    elevation: 3,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  aiTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#15803d',
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  listenBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#15803d',
  },
  // Fertilizer Card
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  fertilizerResultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginTop: 8,
  },
  fertilizerResultTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  nutrientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  nutrientBox: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  nutrientEmoji: {
    fontSize: 24,
  },
  nutrientVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  nutrientLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 6,
  },
  scheduleText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
  },
  // Pest Guide
  pestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pestTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#b91c1c',
  },
  pestSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginTop: 4,
  },
  pestDesc: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 8,
  },
  cureBoxOrganic: {
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e',
  },
  cureLabelOrganic: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#15803d',
  },
  cureTextOrganic: {
    fontSize: 12,
    color: '#166534',
    marginTop: 2,
  },
  cureBoxChemical: {
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  cureLabelChemical: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#b91c1c',
  },
  cureTextChemical: {
    fontSize: 12,
    color: '#991b1b',
    marginTop: 2,
  },
  // Calendar
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 6,
  },
  calCropName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#15803d',
  },
  calTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  calTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4b5563',
  },
  calRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  calLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  calVal: {
    fontSize: 12,
    color: '#1f2937',
    maxWidth: '60%',
    textAlign: 'right',
  },
});
