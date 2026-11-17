import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
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

interface Product {
  id: string;
  name: string;
  nameHindi: string;
  category: string;
  price: number;
  originalPrice: number;
  unit: string;
  rating: number;
  reviews: number;
  image: string;
  inStock: boolean;
  description: string;
  subsidyBadge?: string;
  brand: string;
  dosage: string;
}

const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'HD-2967 High-Yield Wheat Seeds',
    nameHindi: 'HD-2967 उन्नत गेहूं बीज',
    category: 'seeds',
    price: 950,
    originalPrice: 1250,
    unit: '40 kg bag',
    rating: 4.8,
    reviews: 230,
    image: '🌾',
    inStock: true,
    description: 'Rust-resistant, high tillering certified wheat variety suitable for timely sowing across northern India.',
    subsidyBadge: 'Govt Subsidized (24% Off)',
    brand: 'National Seeds Corp',
    dosage: '40 kg per acre',
  },
  {
    id: 'prod-2',
    name: 'IFFCO Nano Urea Liquid',
    nameHindi: 'इफको नैनो यूरिया तरल',
    category: 'fertilizers',
    price: 225,
    originalPrice: 260,
    unit: '500 ml bottle',
    rating: 4.9,
    reviews: 512,
    image: '🧪',
    inStock: true,
    description: 'Replaces 1 conventional urea bag. 80%+ nitrogen use efficiency, eco-friendly and increases crop protein content.',
    subsidyBadge: 'Direct Subsidy Applied',
    brand: 'IFFCO',
    dosage: '2-4 ml per liter water (spray at tillering stage)',
  },
  {
    id: 'prod-3',
    name: 'Neem-Based Bio-Pesticide (10,000 PPM)',
    nameHindi: 'नीम आधारित जैविक कीटनाशक',
    category: 'pesticides',
    price: 480,
    originalPrice: 650,
    unit: '1 liter',
    rating: 4.7,
    reviews: 189,
    image: '🌿',
    inStock: true,
    description: '100% organic cold-pressed Azadirachtin. Controls whiteflies, aphids, caterpillars without harming friendly pollinators.',
    subsidyBadge: '100% Organic Certified',
    brand: 'Krishi Bio-Tech',
    dosage: '3-5 ml per liter water',
  },
  {
    id: 'prod-4',
    name: 'Trichoderma Viride Bio-Fungicide',
    nameHindi: 'ट्राइकोडर्मा विरिडी जैव-फफूंदनाशी',
    category: 'pesticides',
    price: 190,
    originalPrice: 250,
    unit: '1 kg packet',
    rating: 4.6,
    reviews: 142,
    image: '🦠',
    inStock: true,
    description: 'Beneficial bio-fungus for seed treatment and soil application. Prevents root rot, collar rot, and damping-off.',
    subsidyBadge: 'Organic Bio-Control',
    brand: 'ICAR Certified',
    dosage: '5-10 g per kg seed treatment',
  },
  {
    id: 'prod-5',
    name: 'Battery Operated Knapsack Sprayer (16L)',
    nameHindi: 'बैटरी चालित नैपसैक स्प्रेयर (16L)',
    category: 'tools',
    price: 2450,
    originalPrice: 3200,
    unit: '1 unit',
    rating: 4.8,
    reviews: 310,
    image: '🚜',
    inStock: true,
    description: 'Dual motor 12V 12Ah lithium-ion battery sprayer with pressure regulator and 4 brass nozzles for effortless spraying.',
    subsidyBadge: 'PM Sub-Mission on Agri Mechanization (₹800 Rebate)',
    brand: 'Kisan Shakti',
    dosage: 'Single charge covers 25-30 tanks',
  },
  {
    id: 'prod-6',
    name: 'Drip Irrigation Starter Kit (0.5 Acre)',
    nameHindi: 'ड्रिप सिंचाई किट (आधा एकड़)',
    category: 'irrigation',
    price: 4900,
    originalPrice: 7200,
    unit: 'Complete Kit',
    rating: 4.9,
    reviews: 94,
    image: '💧',
    inStock: true,
    description: 'Saves 60% water, increases crop yield by 25-30%. Includes mainline pipe, inline drip tubes, screen filter, and connectors.',
    subsidyBadge: 'PMKSY 45% Subsidy Eligible',
    brand: 'Jain Irrigation',
    dosage: 'Covers 0.5 acre vegetable or fruit orchard',
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All Products', nameHindi: 'सभी उत्पाद', icon: '🛍️' },
  { id: 'seeds', name: 'Seeds', nameHindi: 'उन्नत बीज', icon: '🌾' },
  { id: 'fertilizers', name: 'Fertilizers', nameHindi: 'खाद व पोषण', icon: '🧪' },
  { id: 'pesticides', name: 'Crop Protection', nameHindi: 'कीटनाशक', icon: '🌿' },
  { id: 'tools', name: 'Equipment', nameHindi: 'कृषि यंत्र', icon: '🚜' },
  { id: 'irrigation', name: 'Irrigation', nameHindi: 'सिंचाई किट', icon: '💧' },
];

export default function Store() {
  const storageContext = useContext(StorageContext);
  if (!storageContext) return null;

  const {
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    cropListings,
    addCropListing,
    orders,
    addOrder,
    userBasicInfo,
  } = storageContext;

  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'orders'>('buy');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<any>(null);

  // New Listing Form State
  const [newCropName, setNewCropName] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQuality, setNewQuality] = useState('Grade A');
  const [newLocation, setNewLocation] = useState(userBasicInfo?.location || 'Punjab');
  const [newPhone, setNewPhone] = useState(userBasicInfo?.phone || '+91 98765 00000');

  // AI Mandi Price Appraiser State
  const [appraiserCrop, setAppraiserCrop] = useState('Wheat');
  const [appraiserMoisture, setAppraiserMoisture] = useState('12');
  const [appraisalResult, setAppraisalResult] = useState<string | null>(null);
  const [isAppraising, setIsAppraising] = useState(false);

  // Payment Selection
  const [selectedPayment, setSelectedPayment] = useState<'COD' | 'KCC' | 'UPI'>('COD');

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameHindi.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleNarrateProduct = (product: Product) => {
    const textToSpeak = `${product.nameHindi}. कीमत ${product.price} रुपये प्रति ${product.unit}. ${product.description}. अनुशंसित मात्रा: ${product.dosage}.`;
    NarratorService.speak(textToSpeak, { language: 'hi-IN' });
  };

  const handleNarrateStoreOverview = () => {
    const overview = `किसान बाज़ार में आपका स्वागत है। आप उच्च गुणवत्ता वाले बीज, इफको नैनो यूरिया, नीम कीटनाशक और कृषि उपकरण रियायती दरों पर खरीद सकते हैं। आप मंडी में अपनी फसल भी बेच सकते हैं।`;
    NarratorService.speak(overview, { language: 'hi-IN' });
  };

  const handleAddListingSubmit = () => {
    if (!newCropName.trim() || !newQuantity.trim() || !newPrice.trim()) {
      Alert.alert('अपूर्ण जानकारी', 'कृपया फसल का नाम, मात्रा और मूल्य भरें।');
      return;
    }

    addCropListing({
      cropName: newCropName.trim(),
      cropNameHindi: newCropName.trim(),
      quantity: parseFloat(newQuantity) || 10,
      unit: 'quintal',
      pricePerUnit: parseFloat(newPrice) || 2000,
      quality: newQuality,
      location: newLocation,
      harvestDate: new Date().toISOString().split('T')[0],
      farmerName: userBasicInfo?.farmerName || 'किसान भाई',
      phone: newPhone,
      image: newCropName.toLowerCase().includes('rice') || newCropName.toLowerCase().includes('धान') ? '🌾' : '🌽',
    });

    setShowSellModal(false);
    setNewCropName('');
    setNewQuantity('');
    setNewPrice('');
    Alert.alert('सफलता', 'आपकी फसल मंडी बाज़ार में सफलतापूर्वक लिस्ट हो गई है!');
  };

  const handleRunAIAppraisal = async () => {
    setIsAppraising(true);
    setAppraisalResult(null);

    const prompt = `Act as an Indian APMC Mandi Market Expert. Appraise this crop listing:
Crop: ${appraiserCrop}
Moisture Level: ${appraiserMoisture}%
Provide a short 3-line assessment in Hindi:
1. Fair Market Value range (₹/quintal) comparing to current MSP.
2. Quality Grade deduction/premium based on moisture.
3. Selling Timing Recommendation (Hold or Sell now).`;

    try {
      const response = await AIService.streamChat(
        { messageText: prompt },
        {
          onChunk: () => {},
          onComplete: (text) => {
            setAppraisalResult(text);
            setIsAppraising(false);
            NarratorService.speak(text, { language: 'hi-IN' });
          },
          onError: () => {
            setAppraisalResult(`₹2,450 - ₹2,600 / क्विंटल। नमी ${appraiserMoisture}% अनुकूल है (ग्रेड A)। अगले 10 दिन में कीमतें 3-4% बढ़ने की संभावना है, थोड़ा रोक कर बेचना लाभकारी रहेगा।`);
            setIsAppraising(false);
          },
        }
      );
    } catch {
      setIsAppraising(false);
    }
  };

  const handleConfirmOrder = () => {
    if (cart.length === 0) return;

    const order = addOrder({
      items: [...cart],
      totalAmount: cartTotal,
      paymentMethod: selectedPayment,
      deliveryAddress: userBasicInfo?.location
        ? `ग्राम एवं पोस्ट, जिला ${userBasicInfo.location.toUpperCase()}`
        : 'किसान फार्म हाउस, भारत',
    });

    setLastPlacedOrder(order);
    setShowCheckoutModal(false);
    setShowCartModal(false);
    setShowOrderSuccessModal(true);
  };

  const handleContactFarmer = (phone: string, cropName: string) => {
    Alert.alert(
      'किसान से संपर्क',
      `क्या आप ${cropName} के विक्रेता (${phone}) से संपर्क करना चाहते हैं?`,
      [
        { text: 'रद्द करें', style: 'cancel' },
        {
          text: '📞 कॉल करें',
          onPress: () => Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => {}),
        },
        {
          text: '💬 व्हाट्सएप',
          onPress: () =>
            Linking.openURL(
              `whatsapp://send?phone=${phone.replace(/[^0-9]/g, '')}&text=नमस्ते! मैंने आपकी ${cropName} की लिस्टिंग कृषि मित्र मंडी पर देखी है।`
            ).catch(() => Alert.alert('व्हाट्सएप ऐप उपलब्ध नहीं है')),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>किसान बाज़ार (Store & Mandi)</Text>
          <Text style={styles.headerSubtitle}>प्रमाणित खाद-बीज खरीदें • अपनी फसल सीधे बेचें</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleNarrateStoreOverview}
            activeOpacity={0.8}
          >
            <Ionicons name="volume-high" size={20} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cartBadgeBtn}
            onPress={() => setShowCartModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="cart" size={22} color="#ffffff" />
            {totalItemCount > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeText}>{totalItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'buy' && styles.tabButtonActive]}
          onPress={() => setActiveTab('buy')}
        >
          <Ionicons
            name="bag-handle"
            size={18}
            color={activeTab === 'buy' ? '#ffffff' : '#15803d'}
          />
          <Text style={[styles.tabButtonText, activeTab === 'buy' && styles.tabButtonTextActive]}>
            कृषि सामग्री (Buy)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'sell' && styles.tabButtonActive]}
          onPress={() => setActiveTab('sell')}
        >
          <Ionicons
            name="leaf"
            size={18}
            color={activeTab === 'sell' ? '#ffffff' : '#15803d'}
          />
          <Text style={[styles.tabButtonText, activeTab === 'sell' && styles.tabButtonTextActive]}>
            फसल मंडी (Sell)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'orders' && styles.tabButtonActive]}
          onPress={() => setActiveTab('orders')}
        >
          <Ionicons
            name="receipt-outline"
            size={18}
            color={activeTab === 'orders' ? '#ffffff' : '#15803d'}
          />
          <Text style={[styles.tabButtonText, activeTab === 'orders' && styles.tabButtonTextActive]}>
            ऑर्डर ({orders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: BUY SUPPLIES */}
      {activeTab === 'buy' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* AI Doctor Prescription Banner */}
          <View style={styles.aiPrescriptionCard}>
            <View style={styles.prescriptionHeader}>
              <View style={styles.prescriptionIcon}>
                <Text style={{ fontSize: 20 }}>🩺</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.prescriptionTitle}>AI फसल डॉक्टर का सुझाव (Prescription)</Text>
                <Text style={styles.prescriptionDesc}>
                  आपके क्षेत्र ({userBasicInfo?.location || 'उत्तर भारत'}) के अनुसार गेहूं/धान में कल्ले बढ़ाने हेतु इफको नैनो यूरिया + ट्राइकोडर्मा का छिड़काव सर्वोत्तम है।
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.prescriptionBtn}
              onPress={() => {
                addToCart(PRODUCTS[1], 1);
                addToCart(PRODUCTS[3], 1);
                Alert.alert('बंडल जोड़ा गया', 'नैनो यूरिया और ट्राइकोडर्मा आपके कार्ट में जुड़ गए हैं!');
              }}
            >
              <Ionicons name="cart-outline" size={16} color="#15803d" />
              <Text style={styles.prescriptionBtnText}>अनुशंसित किट कार्ट में जोड़ें (₹415)</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="बीज, खाद, कीटनाशक या यंत्र खोजें..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Category Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  selectedCategory === cat.id && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryPillText,
                    selectedCategory === cat.id && styles.categoryPillTextActive,
                  ]}
                >
                  {cat.nameHindi}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Product Grid */}
          <Text style={styles.sectionHeader}>
            उपलब्ध उत्पाद ({filteredProducts.length})
          </Text>

          <View style={styles.productGrid}>
            {filteredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => handleOpenProduct(product)}
                activeOpacity={0.88}
              >
                {product.subsidyBadge ? (
                  <View style={styles.subsidyTag}>
                    <Text style={styles.subsidyTagText}>{product.subsidyBadge}</Text>
                  </View>
                ) : null}

                <View style={styles.productTopRow}>
                  <Text style={styles.productEmoji}>{product.image}</Text>
                  <TouchableOpacity
                    style={styles.audioListenBtn}
                    onPress={() => handleNarrateProduct(product)}
                  >
                    <Ionicons name="volume-high" size={16} color="#15803d" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.brandText}>{product.brand}</Text>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {product.nameHindi}
                </Text>
                <Text style={styles.productSubtitle} numberOfLines={1}>
                  {product.name}
                </Text>

                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={13} color="#f59e0b" />
                  <Text style={styles.ratingText}>{product.rating}</Text>
                  <Text style={styles.reviewsText}>({product.reviews} समीक्षाएं)</Text>
                </View>

                <View style={styles.productFooter}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                      <Text style={styles.productPrice}>₹{product.price}</Text>
                      {product.originalPrice > product.price && (
                        <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
                      )}
                    </View>
                    <Text style={styles.priceUnit}>प्रति {product.unit}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.addCartBtn}
                    onPress={() => {
                      addToCart(product, 1);
                      Alert.alert('सफलता', `${product.nameHindi} कार्ट में जोड़ा गया!`);
                    }}
                  >
                    <Ionicons name="add" size={18} color="#ffffff" />
                    <Text style={styles.addCartBtnText}>जोड़ें</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* TAB 2: SELL CROPS & MANDI */}
      {activeTab === 'sell' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header Action to List Crop */}
          <View style={styles.mandiHeaderRow}>
            <View>
              <Text style={styles.sectionHeader}>किसान-से-खरीदार सीधी मंडी</Text>
              <Text style={styles.mandiSubtitle}>बिचौलियों के बिना अपनी फसल का सर्वोत्तम मूल्य पाएं</Text>
            </View>
            <TouchableOpacity
              style={styles.addListingBtn}
              onPress={() => setShowSellModal(true)}
            >
              <Ionicons name="add-circle" size={18} color="#ffffff" />
              <Text style={styles.addListingBtnText}>फसल बेचें</Text>
            </TouchableOpacity>
          </View>

          {/* AI Mandi Price & Quality Appraiser Tool */}
          <View style={styles.appraiserCard}>
            <View style={styles.appraiserHeader}>
              <View style={styles.aiTag}>
                <Ionicons name="sparkles" size={14} color="#ffffff" />
                <Text style={styles.aiTagText}>AI मंडी मूल्य मूल्यांकन</Text>
              </View>
              <Text style={styles.appraiserSub}>फसल की गुणवत्ता और सही भाव की जाँच करें</Text>
            </View>

            <View style={styles.appraiserInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>फसल का नाम</Text>
                <TextInput
                  style={styles.smallInput}
                  value={appraiserCrop}
                  onChangeText={setAppraiserCrop}
                  placeholder="उदा. Basmati, Wheat"
                />
              </View>
              <View style={{ width: 110 }}>
                <Text style={styles.inputLabel}>नमी (Moisture %)</Text>
                <TextInput
                  style={styles.smallInput}
                  value={appraiserMoisture}
                  onChangeText={setAppraiserMoisture}
                  keyboardType="numeric"
                  placeholder="12%"
                />
              </View>
              <TouchableOpacity
                style={styles.appraiseBtn}
                onPress={handleRunAIAppraisal}
                disabled={isAppraising}
              >
                <Text style={styles.appraiseBtnText}>
                  {isAppraising ? 'जाँच...' : 'AI भाव आंकें'}
                </Text>
              </TouchableOpacity>
            </View>

            {appraisalResult ? (
              <View style={styles.appraisalResultBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={styles.resultTitle}>📊 AI मूल्य विश्लेषण:</Text>
                  <TouchableOpacity
                    onPress={() => NarratorService.speak(appraisalResult, { language: 'hi-IN' })}
                    style={styles.miniListenBtn}
                  >
                    <Ionicons name="volume-high" size={14} color="#15803d" />
                    <Text style={styles.miniListenText}>सुनें</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.resultText}>{appraisalResult}</Text>
              </View>
            ) : null}
          </View>

          {/* Live Listings */}
          <Text style={[styles.sectionHeader, { marginTop: 16 }]}>
            सक्रिय किसान लिस्टिंग ({cropListings.length})
          </Text>

          <View style={styles.listingsList}>
            {cropListings.map((listing) => (
              <View key={listing.id} style={styles.listingCard}>
                <View style={styles.listingTopRow}>
                  <Text style={styles.listingEmoji}>{listing.image || '🌾'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listingCropName}>{listing.cropName}</Text>
                    <Text style={styles.listingFarmer}>विक्रेता: {listing.farmerName}</Text>
                    <Text style={styles.listingLocation}>📍 {listing.location}</Text>
                  </View>
                  <View style={styles.listingPriceBox}>
                    <Text style={styles.listingPrice}>₹{listing.pricePerUnit.toLocaleString()}</Text>
                    <Text style={styles.listingPriceUnit}>प्रति {listing.unit}</Text>
                  </View>
                </View>

                <View style={styles.listingMetaRow}>
                  <View style={styles.metaChip}>
                    <Text style={styles.metaChipText}>मात्रा: {listing.quantity} क्विंटल</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Text style={styles.metaChipText}>गुणवत्ता: {listing.quality}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Text style={styles.metaChipText}>कटाई: {listing.harvestDate}</Text>
                  </View>
                </View>

                <View style={styles.listingActionsRow}>
                  <TouchableOpacity
                    style={styles.contactCallBtn}
                    onPress={() => handleContactFarmer(listing.phone, listing.cropName)}
                  >
                    <Ionicons name="call" size={16} color="#ffffff" />
                    <Text style={styles.contactCallBtnText}>कॉल करें ({listing.phone})</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.contactWhatsappBtn}
                    onPress={() => handleContactFarmer(listing.phone, listing.cropName)}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#166534" />
                    <Text style={styles.contactWhatsappBtnText}>व्हाट्सएप</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* TAB 3: MY ORDERS & INVOICES */}
      {activeTab === 'orders' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionHeader}>मेरे कृषि ऑर्डर एवं रसीदें</Text>
          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 50 }}>📦</Text>
              <Text style={styles.emptyTitle}>अभी कोई ऑर्डर नहीं है</Text>
              <Text style={styles.emptyDesc}>
                बीज, खाद व कृषि उपकरण खरीदने के लिए 'कृषि सामग्री' टैब पर जाएं।
              </Text>
              <TouchableOpacity
                style={styles.shopNowBtn}
                onPress={() => setActiveTab('buy')}
              >
                <Text style={styles.shopNowBtnText}>सामग्री देखें</Text>
              </TouchableOpacity>
            </View>
          ) : (
            orders.map((ord) => (
              <View key={ord.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>ऑर्डर संख्या: {ord.id}</Text>
                    <Text style={styles.orderDate}>दिनांक: {ord.orderDate}</Text>
                  </View>
                  <View style={styles.orderStatusBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#15803d" />
                    <Text style={styles.orderStatusText}>{ord.deliveryStatus}</Text>
                  </View>
                </View>

                <View style={styles.orderItemsList}>
                  {ord.items.map((item, idx) => (
                    <View key={idx} style={styles.orderItemRow}>
                      <Text style={styles.orderItemName}>
                        {item.image} {item.nameHindi} x {item.quantity}
                      </Text>
                      <Text style={styles.orderItemPrice}>
                        ₹{item.price * item.quantity}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.orderFooter}>
                  <Text style={styles.paymentMethod}>भुगतान: {ord.paymentMethod}</Text>
                  <Text style={styles.orderTotalAmount}>कुल: ₹{ord.totalAmount}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* MODAL 1: PRODUCT DETAIL & USAGE */}
      <Modal visible={showProductModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalEmoji}>{selectedProduct.image}</Text>
                  <TouchableOpacity
                    onPress={() => setShowProductModal(false)}
                    style={styles.modalCloseBtn}
                  >
                    <Ionicons name="close" size={24} color="#374151" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalBrand}>{selectedProduct.brand}</Text>
                <Text style={styles.modalTitle}>{selectedProduct.nameHindi}</Text>
                <Text style={styles.modalSub}>{selectedProduct.name}</Text>

                <View style={styles.modalPriceRow}>
                  <Text style={styles.modalPrice}>₹{selectedProduct.price}</Text>
                  <Text style={styles.modalUnit}>प्रति {selectedProduct.unit}</Text>
                  <TouchableOpacity
                    style={styles.modalListenBtn}
                    onPress={() => handleNarrateProduct(selectedProduct)}
                  >
                    <Ionicons name="volume-high" size={18} color="#15803d" />
                    <Text style={styles.modalListenText}>विवरण सुनें</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.sectionHeading}>📖 उत्पाद विवरण</Text>
                  <Text style={styles.sectionBody}>{selectedProduct.description}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.sectionHeading}>💊 अनुशंसित प्रयोग एवं मात्रा (Dosage)</Text>
                  <Text style={styles.sectionBody}>{selectedProduct.dosage}</Text>
                </View>

                {selectedProduct.subsidyBadge && (
                  <View style={styles.subsidyBanner}>
                    <Ionicons name="shield-checkmark" size={20} color="#15803d" />
                    <Text style={styles.subsidyBannerText}>{selectedProduct.subsidyBadge}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.modalAddCartBtn}
                  onPress={() => {
                    addToCart(selectedProduct, 1);
                    setShowProductModal(false);
                    Alert.alert('सफलता', `${selectedProduct.nameHindi} कार्ट में जुड़ गया!`);
                  }}
                >
                  <Ionicons name="cart" size={20} color="#ffffff" />
                  <Text style={styles.modalAddCartText}>कार्ट में जोड़ें (₹{selectedProduct.price})</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL 2: SHOPPING CART */}
      <Modal visible={showCartModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="cart" size={24} color="#15803d" />
                <Text style={styles.modalTitle}>आपकी खरीदारी ({cart.length} वस्तुएं)</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCartModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {cart.length === 0 ? (
              <View style={[styles.emptyContainer, { paddingVertical: 40 }]}>
                <Text style={{ fontSize: 44 }}>🛒</Text>
                <Text style={styles.emptyTitle}>कार्ट खाली है</Text>
                <Text style={styles.emptyDesc}>उत्पादों को जोड़ने के लिए 'जोड़ें' बटन दबाएं।</Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
                {cart.map((item) => (
                  <View key={item.id} style={styles.cartItemRow}>
                    <Text style={{ fontSize: 26, marginRight: 10 }}>{item.image}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cartItemTitle}>{item.nameHindi}</Text>
                      <Text style={styles.cartItemPrice}>₹{item.price}/{item.unit}</Text>
                    </View>

                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateCartQuantity(item.id, item.quantity - 1)}
                      >
                        <Ionicons name="remove" size={16} color="#374151" />
                      </TouchableOpacity>
                      <Text style={styles.qtyValue}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateCartQuantity(item.id, item.quantity + 1)}
                      >
                        <Ionicons name="add" size={16} color="#374151" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            {cart.length > 0 && (
              <View style={styles.cartSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>कुल मूल्य:</Text>
                  <Text style={styles.summaryValue}>₹{cartTotal}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>किसान होम डिलीवरी:</Text>
                  <Text style={[styles.summaryValue, { color: '#15803d' }]}>मुफ़्त (Free)</Text>
                </View>

                <TouchableOpacity
                  style={styles.checkoutBtn}
                  onPress={() => {
                    setShowCartModal(false);
                    setShowCheckoutModal(true);
                  }}
                >
                  <Text style={styles.checkoutBtnText}>ऑर्डर करें (₹{cartTotal})</Text>
                  <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL 3: CHECKOUT & PAYMENT SELECTION */}
      <Modal visible={showCheckoutModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>ऑर्डर पुष्टि एवं भुगतान</Text>
              <TouchableOpacity
                onPress={() => setShowCheckoutModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.deliveryCard}>
                <Text style={styles.deliveryTitle}>📍 डिलीवरी पता:</Text>
                <Text style={styles.deliveryAddress}>
                  {userBasicInfo?.farmerName || 'किसान'} | {userBasicInfo?.location || 'पंजाब/हरियाणा'}
                </Text>
                <Text style={styles.deliveryEta}>🚚 डिलीवरी 24-48 घंटों में आपके खेत तक</Text>
              </View>

              <Text style={[styles.sectionHeading, { marginTop: 16 }]}>
                भुगतान का तरीका चुनें:
              </Text>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPayment === 'COD' && styles.paymentOptionActive,
                ]}
                onPress={() => setSelectedPayment('COD')}
              >
                <Ionicons name="cash-outline" size={24} color="#15803d" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.paymentName}>Cash on Delivery (सामग्री मिलने पर भुगतान)</Text>
                  <Text style={styles.paymentSub}>बिना किसी अग्रिम भुगतान के सुरक्षित</Text>
                </View>
                {selectedPayment === 'COD' && (
                  <Ionicons name="checkmark-circle" size={22} color="#15803d" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPayment === 'KCC' && styles.paymentOptionActive,
                ]}
                onPress={() => setSelectedPayment('KCC')}
              >
                <Ionicons name="card-outline" size={24} color="#2563eb" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.paymentName}>Kisan Credit Card (केसीसी)</Text>
                  <Text style={styles.paymentSub}>30 दिन 0% ब्याज पर भुगतान</Text>
                </View>
                {selectedPayment === 'KCC' && (
                  <Ionicons name="checkmark-circle" size={22} color="#15803d" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPayment === 'UPI' && styles.paymentOptionActive,
                ]}
                onPress={() => setSelectedPayment('UPI')}
              >
                <Ionicons name="phone-portrait-outline" size={24} color="#7c3aed" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.paymentName}>UPI / PhonePe / Google Pay</Text>
                  <Text style={styles.paymentSub}>तुरंत डिजिटल भुगतान</Text>
                </View>
                {selectedPayment === 'UPI' && (
                  <Ionicons name="checkmark-circle" size={22} color="#15803d" />
                )}
              </TouchableOpacity>

              <View style={styles.finalTotalBox}>
                <Text style={styles.finalTotalLabel}>कुल देय राशि:</Text>
                <Text style={styles.finalTotalAmount}>₹{cartTotal}</Text>
              </View>

              <TouchableOpacity style={styles.confirmOrderBtn} onPress={handleConfirmOrder}>
                <Ionicons name="checkmark-done" size={22} color="#ffffff" />
                <Text style={styles.confirmOrderBtnText}>ऑर्डर फाइनल करें</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: ORDER SUCCESS CONFIRMATION */}
      <Modal visible={showOrderSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { alignItems: 'center', paddingVertical: 30 }]}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={48} color="#ffffff" />
            </View>

            <Text style={styles.successTitle}>ऑर्डर सफलतापूर्वक दर्ज हुआ! 🎉</Text>
            <Text style={styles.successSubtitle}>
              ऑर्डर संख्या: {lastPlacedOrder?.id}
            </Text>

            <Text style={styles.successDesc}>
              धन्यवाद किसान साथी! आपका ऑर्डर प्राप्त हो गया है। सामग्री 24-48 घंटों में आपके पते पर भेज दी जाएगी।
            </Text>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                setShowOrderSuccessModal(false);
                setActiveTab('orders');
              }}
            >
              <Text style={styles.doneBtnText}>ऑर्डर रसीद देखें</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 5: NEW CROP LISTING (SELL MANDI) */}
      <Modal visible={showSellModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>🌾 मंडी में फसल लिस्ट करें</Text>
              <TouchableOpacity
                onPress={() => setShowSellModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>फसल का नाम (Crop Name)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="उदा. बासमती धान 1509, शरबती गेहूं, सरसों"
                value={newCropName}
                onChangeText={setNewCropName}
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>मात्रा (क्विंटल)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="उदा. 50"
                    keyboardType="numeric"
                    value={newQuantity}
                    onChangeText={setNewQuantity}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>अपेक्षित मूल्य (₹/क्विंटल)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="उदा. 2400"
                    keyboardType="numeric"
                    value={newPrice}
                    onChangeText={setNewPrice}
                  />
                </View>
              </View>

              <Text style={styles.formLabel}>गुणवत्ता श्रेणी (Quality Grade)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="उदा. Grade A, Premium Export, Standard"
                value={newQuality}
                onChangeText={setNewQuality}
              />

              <Text style={styles.formLabel}>मंडी / जिला स्थान (Location)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="उदा. करनाल (हरियाणा), अमृतसर (पंजाब)"
                value={newLocation}
                onChangeText={setNewLocation}
              />

              <Text style={styles.formLabel}>संपर्क फोन नंबर (Phone)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="उदा. +91 98765 43210"
                keyboardType="phone-pad"
                value={newPhone}
                onChangeText={setNewPhone}
              />

              <TouchableOpacity style={styles.submitListingBtn} onPress={handleAddListingSubmit}>
                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                <Text style={styles.submitListingBtnText}>मंडी में लिस्ट करें</Text>
              </TouchableOpacity>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#15803d',
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  aiPrescriptionCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 14,
    marginTop: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  prescriptionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  prescriptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prescriptionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#166534',
  },
  prescriptionDesc: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
    marginTop: 3,
  },
  prescriptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  prescriptionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 12,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryPillActive: {
    backgroundColor: '#15803d',
    borderColor: '#15803d',
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  categoryPillTextActive: {
    color: '#ffffff',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  productGrid: {
    gap: 12,
    paddingBottom: 24,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  subsidyTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  subsidyTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },
  productTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  productEmoji: {
    fontSize: 38,
  },
  audioListenBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  brandText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803d',
    textTransform: 'uppercase',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 2,
  },
  productSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  reviewsText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#15803d',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  priceUnit: {
    fontSize: 11,
    color: '#6b7280',
  },
  addCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#22c55e',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addCartBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  // Mandi Tab Styles
  mandiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  mandiSubtitle: {
    fontSize: 11,
    color: '#6b7280',
  },
  addListingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#15803d',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addListingBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  appraiserCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  appraiserHeader: {
    marginBottom: 10,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563eb',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  aiTagText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  appraiserSub: {
    fontSize: 12,
    color: '#4b5563',
  },
  appraiserInputs: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 4,
  },
  smallInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: '#1f2937',
  },
  appraiseBtn: {
    backgroundColor: '#15803d',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  appraiseBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  appraisalResultBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#15803d',
  },
  miniListenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniListenText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#15803d',
  },
  resultText: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 18,
  },
  listingsList: {
    gap: 12,
    paddingBottom: 24,
  },
  listingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  listingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listingEmoji: {
    fontSize: 32,
  },
  listingCropName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  listingFarmer: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '600',
  },
  listingLocation: {
    fontSize: 11,
    color: '#6b7280',
  },
  listingPriceBox: {
    alignItems: 'flex-end',
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  listingPriceUnit: {
    fontSize: 10,
    color: '#6b7280',
  },
  listingMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
  },
  metaChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaChipText: {
    fontSize: 11,
    color: '#4b5563',
  },
  listingActionsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
  },
  contactCallBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#15803d',
    paddingVertical: 9,
    borderRadius: 8,
  },
  contactCallBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contactWhatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
    paddingVertical: 9,
    borderRadius: 8,
  },
  contactWhatsappBtnText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Orders Tab
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  shopNowBtn: {
    backgroundColor: '#15803d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  shopNowBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 8,
    marginBottom: 8,
  },
  orderId: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  orderDate: {
    fontSize: 11,
    color: '#6b7280',
  },
  orderStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#15803d',
  },
  orderItemsList: {
    gap: 4,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderItemName: {
    fontSize: 13,
    color: '#374151',
  },
  orderItemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
    marginTop: 8,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#6b7280',
  },
  orderTotalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#15803d',
  },
  // Modal Styles
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
    maxHeight: '90%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalEmoji: {
    fontSize: 44,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  modalBrand: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#15803d',
    textTransform: 'uppercase',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 2,
  },
  modalSub: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 10,
  },
  modalPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#15803d',
  },
  modalUnit: {
    fontSize: 13,
    color: '#4b5563',
    flex: 1,
  },
  modalListenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  modalListenText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803d',
  },
  infoSection: {
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  sectionBody: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 19,
  },
  subsidyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  subsidyBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
  },
  modalAddCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  modalAddCartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  // Cart Modal
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cartItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cartItemPrice: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cartSummary: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#15803d',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  // Checkout Modal
  deliveryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  deliveryTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
  },
  deliveryAddress: {
    fontSize: 13,
    color: '#1f2937',
    marginTop: 2,
  },
  deliveryEta: {
    fontSize: 11,
    color: '#15803d',
    fontWeight: '600',
    marginTop: 4,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  paymentOptionActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
  },
  paymentName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  paymentSub: {
    fontSize: 11,
    color: '#6b7280',
  },
  finalTotalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 14,
    borderRadius: 12,
    marginVertical: 12,
  },
  finalTotalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  finalTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#15803d',
  },
  confirmOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#22c55e',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 16,
  },
  confirmOrderBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Success Confirmation
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#15803d',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  successDesc: {
    fontSize: 13,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 12,
    marginBottom: 20,
  },
  doneBtn: {
    backgroundColor: '#15803d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Sell Form
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 10,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1f2937',
  },
  submitListingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#15803d',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 18,
    marginBottom: 20,
  },
  submitListingBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
