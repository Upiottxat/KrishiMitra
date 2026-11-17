import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StorageContext } from '../../Context/StorageContext';
import { NarratorService } from '../../services/NarratorService';

const OrderExpert = () => {
  const storageContext = useContext(StorageContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('कल सुबह 10:00 बजे (Tomorrow 10 AM)');
  const [selectedService, setSelectedService] = useState('मिट्टी एवं फसल स्वास्थ्य परीक्षण (Soil & Crop Testing)');
  const [farmerNotes, setFarmerNotes] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const SLOTS = [
    'आज दोपहर 2:00 बजे (Today 2 PM)',
    'कल सुबह 10:00 बजे (Tomorrow 10 AM)',
    'शनिवार सुबह 11:00 बजे (Saturday 11 AM)',
  ];

  const SERVICES = [
    'मिट्टी एवं फसल स्वास्थ्य परीक्षण (Soil & Crop Testing)',
    'अज्ञात कीट व फफूंद प्रकोप निरीक्षण (Pest & Disease Inspection)',
    'ड्रिप सिंचाई व फर्टिगेशन मार्गदर्शन (Drip & Fertigation Setup)',
    'जैविक प्रमाणीकरण सहायता (Organic Certification Advice)',
  ];

  const handleBook = () => {
    setBookingConfirmed(true);
    const confirmationText = `बधाई हो! आपके खेत के निरीक्षण के लिए कृषि विशेषज्ञ (Dr. A. K. Sharma, Senior Agronomist) का समय निर्धारित हो गया है। समय: ${selectedSlot}।`;
    NarratorService.speak(confirmationText, { language: 'hi-IN' });
  };

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => {
          setBookingConfirmed(false);
          setModalVisible(true);
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🧑‍⚕️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>कृषि विशेषज्ञ को खेत पर बुलाएं</Text>
            <Text style={styles.cardSubtitle}>
              ICAR प्रमाणित विशेषज्ञ सीधे आपके खेत पर आकर मिट्टी, पौधे व कीटों की ऑन-साइट जाँच करेंगे।
            </Text>
          </View>
        </View>

        <View style={styles.orderBtn}>
          <Ionicons name="calendar-outline" size={18} color="#ffffff" />
          <Text style={styles.orderBtnText}>विशेषज्ञ विज़िट बुक करें (Book Visit)</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 24 }}>🧑‍⚕️</Text>
                <Text style={styles.modalTitle}>खेत विज़िट बुकिंग</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {!bookingConfirmed ? (
                <>
                  <Text style={styles.sectionLabel}>1. सेवा का प्रकार चुनें (Select Service):</Text>
                  {SERVICES.map((srv) => (
                    <TouchableOpacity
                      key={srv}
                      style={[
                        styles.selectOption,
                        selectedService === srv && styles.selectOptionActive,
                      ]}
                      onPress={() => setSelectedService(srv)}
                    >
                      <Ionicons
                        name={selectedService === srv ? 'radio-button-on' : 'radio-button-off'}
                        size={18}
                        color={selectedService === srv ? '#15803d' : '#9ca3af'}
                      />
                      <Text
                        style={[
                          styles.selectOptionText,
                          selectedService === srv && styles.selectOptionTextActive,
                        ]}
                      >
                        {srv}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
                    2. विज़िट का समय चुनें (Visit Slot):
                  </Text>
                  {SLOTS.map((slot) => (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.selectOption,
                        selectedSlot === slot && styles.selectOptionActive,
                      ]}
                      onPress={() => setSelectedSlot(slot)}
                    >
                      <Ionicons
                        name={selectedSlot === slot ? 'time' : 'time-outline'}
                        size={18}
                        color={selectedSlot === slot ? '#15803d' : '#9ca3af'}
                      />
                      <Text
                        style={[
                          styles.selectOptionText,
                          selectedSlot === slot && styles.selectOptionTextActive,
                        ]}
                      >
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
                    3. समस्या का संक्षिप्त विवरण (Problem Notes):
                  </Text>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="उदा. पत्तियों का पीलापन व सूखना, 3 एकड़ गेहूं में।"
                    placeholderTextColor="#9ca3af"
                    value={farmerNotes}
                    onChangeText={setFarmerNotes}
                    multiline
                  />

                  <View style={styles.pricingBanner}>
                    <Text style={styles.pricingText}>
                      विज़िट शुल्क: <Text style={{ textDecorationLine: 'line-through', color: '#6b7280' }}>₹500</Text>{' '}
                      <Text style={{ fontWeight: 'bold', color: '#15803d' }}>मुफ़्त (सरकारी कृषि मित्र योजना)</Text>
                    </Text>
                  </View>

                  <TouchableOpacity style={styles.confirmBtn} onPress={handleBook}>
                    <Ionicons name="checkmark-done" size={20} color="#ffffff" />
                    <Text style={styles.confirmBtnText}>बुकिंग कन्फर्म करें</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.confirmedContainer}>
                  <View style={styles.successCircle}>
                    <Ionicons name="checkmark" size={40} color="#ffffff" />
                  </View>
                  <Text style={styles.confirmedTitle}>विज़िट सफलतापूर्वक बुक हो गई! 🎉</Text>
                  <Text style={styles.confirmedSub}>
                    निर्धारित समय: {selectedSlot}
                  </Text>

                  <View style={styles.expertDetailCard}>
                    <Text style={styles.expertName}>👨‍🌾 विशेषज्ञ: Dr. A. K. Sharma</Text>
                    <Text style={styles.expertRole}>Senior Agronomist, KVK Center</Text>
                    <Text style={styles.expertContact}>📞 हेल्पलाइन: 1800-180-1551</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.doneBtnText}>ठीक है</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
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
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  icon: {
    fontSize: 26,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 3,
    lineHeight: 17,
  },
  orderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#15803d',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 14,
  },
  orderBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
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
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  selectOptionActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
  },
  selectOptionText: {
    fontSize: 13,
    color: '#4b5563',
    flex: 1,
  },
  selectOptionTextActive: {
    color: '#15803d',
    fontWeight: '700',
  },
  notesInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#1f2937',
    minHeight: 70,
  },
  pricingBanner: {
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
    alignItems: 'center',
  },
  pricingText: {
    fontSize: 13,
    color: '#374151',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#15803d',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 14,
    marginBottom: 16,
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  confirmedContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  confirmedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#15803d',
    textAlign: 'center',
  },
  confirmedSub: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  expertDetailCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  expertName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  expertRole: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  expertContact: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '600',
    marginTop: 6,
  },
  doneBtn: {
    backgroundColor: '#15803d',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 10,
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default OrderExpert;
