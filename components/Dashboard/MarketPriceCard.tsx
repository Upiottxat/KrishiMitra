import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NarratorService } from '../../services/NarratorService';

const MARKET_DATA = [
  { crop: 'गेहूं शरबती (Wheat)', icon: '🌾', price: 2450, change: 45, isPositive: true },
  { crop: 'बासमती धान (Rice 1121)', icon: '🍚', price: 3450, change: 80, isPositive: true },
  { crop: 'सरसों पीली (Mustard)', icon: '🌱', price: 5850, change: -30, isPositive: false },
  { crop: 'कपास (Cotton)', icon: '🌿', price: 7200, change: 110, isPositive: true },
];

const MarketPriceCard = () => {
  const router = useRouter();

  const handleNarratePrices = () => {
    const text = `आज के प्रमुख मंडी भाव: शरबती गेहूं ₹2,450 प्रति क्विंटल (45 रुपये तेज), बासमती धान ₹3,450 प्रति क्विंटल (80 रुपये तेज), सरसों ₹5,850 प्रति क्विंटल। आने वाले सप्ताह में धान और कपास के भाव मजबूत रहने का AI अनुमान है।`;
    NarratorService.speak(text, { language: 'hi-IN' });
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Ionicons name="trending-up-outline" size={20} color="#16a34a" />
          <Text style={styles.cardTitle}>मंडी भाव व AI ट्रेंड (Market Trends)</Text>
        </View>
        <TouchableOpacity onPress={handleNarratePrices} style={styles.listenBtn}>
          <Ionicons name="volume-high" size={16} color="#15803d" />
        </TouchableOpacity>
      </View>

      {/* AI Trend Alert Banner */}
      <View style={styles.trendBanner}>
        <Ionicons name="sparkles" size={14} color="#15803d" />
        <Text style={styles.trendBannerText}>
          AI अनुमान: निर्यात मांग बढ़ने से बासमती धान में +4% तेजी की संभावना
        </Text>
      </View>

      <View style={styles.marketList}>
        {MARKET_DATA.map((item, index) => (
          <View key={index} style={styles.marketItem}>
            <View style={styles.marketItemLeft}>
              <Text style={styles.marketIcon}>{item.icon}</Text>
              <Text style={styles.marketCrop}>{item.crop}</Text>
            </View>
            <View style={styles.marketItemRight}>
              <Text style={styles.marketPrice}>₹{item.price.toLocaleString()}/qtl</Text>
              <View style={styles.marketChange}>
                <Ionicons
                  name={item.isPositive ? 'arrow-up' : 'arrow-down'}
                  size={12}
                  color={item.isPositive ? '#22c55e' : '#ef4444'}
                />
                <Text
                  style={[
                    styles.marketChangeText,
                    { color: item.isPositive ? '#22c55e' : '#ef4444' },
                  ]}
                >
                  {item.isPositive ? '+' : ''}₹{Math.abs(item.change)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.viewMoreBtn}
        onPress={() => router.push('/(tabs)/Market')}
      >
        <Text style={styles.viewMoreText}>सभी मंडियों के भाव व सरकारी योजनाएं देखें</Text>
        <Ionicons name="arrow-forward" size={14} color="#15803d" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 6,
  },
  listenBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
  },
  trendBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  trendBannerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
    flex: 1,
  },
  marketList: {
    gap: 8,
  },
  marketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  marketItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  marketIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  marketCrop: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
  },
  marketItemRight: {
    alignItems: 'flex-end',
  },
  marketPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  marketChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  marketChangeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  viewMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  viewMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },
});

export default MarketPriceCard;
