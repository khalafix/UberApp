import { useStore } from '@/stores/store';
import { NationalityData } from '@/types/nationality';
import { ServiceData } from '@/types/service';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function VisitVisaDetailsScreen() {
  const PhoneInputComponent = PhoneInput as unknown as React.ComponentType<any>;
  const router = useRouter();
  const { nationalityStore, serviceStore, bookingStore } = useStore();
  const { selectedCountry } = useLocalSearchParams();
  const [children, setChildren] = useState<number>(0);
  const [adults, setAdults] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [entryType, setEntryType] = useState<'single' | 'multiple'>('single');
  const [duration, setDuration] = useState<'30 days' | '60 days'>('30 days');
  const [processingTime, setProcessingTime] = useState<'Express - 1~2 working days' | 'Regular - 3-5 working days'>('Regular - 3-5 working days');
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedNationality, setSelectedNationality] = useState<NationalityData | null>(null);
  const [service, setService] = useState<ServiceData | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [securityDeposit, setSecurityDeposit] = useState<number>(0);
  const [isGccResident, setIsGCCResident] = useState<boolean | null>(null);
  const serviceId =
    selectedCountry === 'United Arab Emirates'
      ? 'C0AB3444-8809-4B93-654B-08DD54A6A9CB'
      : '60E2CB44-78A7-4762-2C16-08DDAFEEEBB7';


  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => {
    nationalityStore.loadNationalities();
    serviceStore.getService(serviceId);
  }, []);

  const filteredNationalities = (nationalityStore.NationalitiesDropdown ?? []).filter((n) =>
    n.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Recalculate total price whenever any of the relevant values change
  useEffect(() => {
    calculateTotalPrice();
  }, [adults, children, entryType, duration, processingTime, selectedNationality, isGccResident]);

  const calculateTotalPrice = () => {
    if (!selectedNationality || !serviceStore.currentService) {
      setTotalPrice(0);
      return;
    }
    const isSaudi = selectedCountry === 'Kingdom of Saudi Arabia';
    const isUAE = selectedCountry === 'United Arab Emirates';

    let nationalityPrice = 0;
    // -----------------------------
    // 1. UAE-style pricing
    // -----------------------------
    if (isUAE) {
      if (entryType === "single" && duration === "30 days") {
        nationalityPrice =
          Number(selectedNationality.singlePriceWithMonth) * Number(adults) +
          Number(selectedNationality.singlePriceWithMonth) * Number(children) || 0;
      } else if (entryType === "single" && duration === "60 days") {
        nationalityPrice =
          Number(selectedNationality.singlePriceWithTwoMonth) * Number(adults) +
          Number(selectedNationality.singlePriceWithTwoMonthForChild) * Number(children) || 0;
      } else if (entryType === "multiple" && duration === "30 days") {
        nationalityPrice =
          Number(selectedNationality.multiplePriceWithMonth) * Number(adults) +
          Number(selectedNationality.multiplePriceWithMonthForChild) * Number(children) || 0;
      } else if (entryType === "multiple" && duration === "60 days") {
        nationalityPrice =
          Number(selectedNationality.multiplePriceWithTwoMonth) * Number(adults) +
          Number(selectedNationality.multiplePriceWithTwoMonthForChild) * Number(children) || 0;
      }

      // Calculate prices for adults, children, and process time
      const processTimePrice =
        processingTime === "Express - 1~2 working days"
          ? Number(serviceStore.currentService?.expressPrice) || 0
          : Number(serviceStore.currentService?.regularPrice) || 0;
      const adultsPrice =
        Number(adults) * Number(serviceStore.currentService?.price) +
        Number(adults) * processTimePrice || 0;
      const childrenPrice =
        Number(children) *
        (Number(serviceStore.currentService?.childPrice) + Number(children) * processTimePrice) || 0;

      const total = nationalityPrice + adultsPrice + childrenPrice + securityDeposit;
      setTotalPrice(total);

    }
    else if (isSaudi) {
      let basePrice = Number(serviceStore.currentService?.price) || 0;

      if (isGccResident === false) {
        // Add 100 for each person
        basePrice += 100;
      }
      let price = (adults + children) * basePrice;
      const total = price + securityDeposit;
      setTotalPrice(total);
    }
  };


  const handleNationalitySelect = (nationality: NationalityData) => {
    setSelectedNationality(nationality);
    setSecurityDeposit(Number(nationality.securityDeposit) || 0);
    setShowModal(false);
    // Reset to default values when nationality changes
    setEntryType('single');
    setDuration('30 days');
    setProcessingTime('Regular - 3-5 working days');
  };

  const handleSubmit = async () => {
    if (!selectedNationality) return;
    if (!phone.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Phone number is required',
      });
      return;
    }

    if (!email.trim()) {
      alert("Email is required.");
      return;
    }

    // Optional: simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      // Prepare booking data similar to the React version
      const data = {
        customerName: name, // You might want to add these fields to your form
        phone: phone,
        email: email,
        adultsNumber: adults,
        childrenNumber: children,
        entryType,
        duration,
        processTime: processingTime,
        nationalityId: selectedNationality.id,
        serviceId: serviceId,
        totalPrice,
        isGccResident,
      };

      // Here you would call your booking store to add the booking
      const result = await bookingStore.addBooking(data);
      if (result.status === "success") {
        console.log("Booking added successfully");
        router.push(`/${result.data}`);
      } else {
        console.error(`Error: ${result.error}`);
      }
      // Navigate to success screen or upload documents screen

    } catch (error) {
      console.error('Booking error:', error);
      // Show error message
    }
  };
  const navigation = useNavigation();
  return (
    <>
      {/* Header setup */}
      <Stack.Screen
        options={{
          title: 'Visit Visa',
          headerRight: () => (
            <Pressable onPress={() => navigation.goBack()} style={{ paddingHorizontal: 12 }}>
              <Ionicons name="close" size={24} color="black" />
            </Pressable>
          ),
        }}
      />
              <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom','top']}>

      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
          <Pressable onPress={() => router.back()} style={styles.backRow}>
            <Ionicons name="chevron-back" size={24} color="black" />
            <Text style={styles.backText}>Choose Package</Text>
          </Pressable>
          {/* Security Deposit Notice */}
          {securityDeposit > 0 && (
            <View style={styles.securityDepositNotice}>
              <Text style={styles.securityDepositTitle}>?? Security Deposit Notice</Text>
              <Text style={styles.securityDepositText}>
                A security deposit of <Text style={{ fontWeight: 'bold' }}>{securityDeposit} AED</Text> will be added based on your nationality selection.
                This amount is refundable, subject to terms and conditions.
              </Text>
            </View>
          )}



          {/* Travellers */}
          <View style={styles.section}>
            {/* Customer Details */}
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Phone Number</Text>
            <PhoneInputComponent
              defaultValue={phone}
              defaultCode="AE"
              layout="first"
              onChangeFormattedText={(text: string) => {
                setPhone(text);
              }}
              containerStyle={{
                backgroundColor: "#fff",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#cc3093",
                marginBottom: 10,
                height: 50, // matches TextInput
                width: '100%', // ensures full width
              }}

              textContainerStyle={{
                backgroundColor: "#fff",
                borderTopRightRadius: 10,
                borderBottomRightRadius: 10,
                paddingVertical: 0,
                paddingHorizontal: 0,
              }}
              textInputStyle={{
                fontSize: 15,
                paddingVertical: 0,
              }}
              codeTextStyle={{
                fontSize: 15,
              }}
              flagButtonStyle={{
                marginLeft: -20,
              }}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.section}>

            <Text style={styles.sectionLabel}>How many travellers?</Text>
            <Text style={styles.sectionSubLabel}>The maximum of total applicants is 9.</Text>

            {/* Adults */}
            <View style={styles.travellerRow}>
              <View>
                <Text style={styles.sectionLabel}>Adults</Text>
                <Text style={styles.subText}>Ages 12+</Text>
              </View>
              <View style={styles.counterControls}>
                <Pressable
                  onPress={() => setAdults(Math.max(1, adults - 1))}
                  style={styles.optionBoxBtn}
                >
                  <Text style={styles.counterIcon}>-</Text>
                </Pressable>
                <Text style={styles.processingText}>{adults}</Text>
                <Pressable
                  onPress={() => adults + children < 9 && setAdults(adults + 1)}
                  style={styles.optionBoxBtnPlus}
                >
                  <Text style={styles.counterIconPlus}>+</Text>
                </Pressable>
              </View>
            </View>

            {/* Children */}
            <View style={styles.travellerRow}>
              <View>
                <Text style={styles.sectionLabel}>Children</Text>
                <Text style={styles.subText}>Ages below 12</Text>
              </View>
              <View style={styles.counterControls}>
                <Pressable
                  onPress={() => setChildren(Math.max(0, children - 1))}
                  style={styles.optionBoxBtn}
                >
                  <Text style={styles.counterIcon}>-</Text>
                </Pressable>
                <Text style={styles.processingText}>{children}</Text>
                <Pressable
                  onPress={() => adults + children < 9 && setChildren(children + 1)}
                  style={styles.optionBoxBtnPlus}
                >
                  <Text style={styles.counterIconPlus}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
          <View style={styles.section}>

            <Text style={styles.sectionLabel}>What is your Nationality?</Text>
            <Pressable style={styles.nationalityBox} onPress={() => setShowModal(true)}>
              <Text style={selectedNationality ? styles.nationalitySelected : styles.nationalityText}>
                {selectedNationality?.name || 'Select your nationality'}
              </Text>
            </Pressable>
          </View>

          {/* Modal for Nationality */}
          <Modal visible={showModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <Pressable style={styles.backdrop} onPress={() => setShowModal(false)} />
              <View style={styles.modalContainer}>
                <Text style={styles.nationalityTitle}>Select Nationality</Text>
                <Ionicons
                  name="close"
                  size={24}
                  color="#6B7280"
                  style={styles.modalCloseIcon}
                  onPress={() => setShowModal(false)}
                />
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                  <TextInput
                    placeholder="Search nationality..."
                    value={search}
                    onChangeText={setSearch}
                    style={styles.searchBox}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <FlatList
                  data={filteredNationalities}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => handleNationalitySelect(item)}
                      style={styles.nationalityItem}
                    >
                      <Text style={styles.nationalityLabel}>{item.name}</Text>
                    </Pressable>
                  )}
                />
              </View>
            </View>
          </Modal>

          {selectedCountry !== 'Kingdom of Saudi Arabia' ? (
            <>
              {/* Entry Type */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Choose entry type</Text>
                <View style={styles.optionRow}>
                  {['single', 'multiple'].map((type) => (
                    <Pressable
                      key={type}
                      onPress={() => setEntryType(type as 'single' | 'multiple')}
                      style={[styles.optionBtn, entryType === type && styles.optionBtnActive]}
                    >
                      <Text style={entryType === type ? styles.optionTextActive : styles.optionTextInactive}>
                        {type.charAt(0).toUpperCase() + type.slice(1)} Entry
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              {/* Duration */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Choose duration</Text>
                <Text style={styles.sectionLabelTitle}>You can only use the visa within 59 days of the issuance date.</Text>
                <View style={styles.optionRow}>
                  {['30 days', '60 days'].map((d) => (
                    <Pressable
                      key={d}
                      onPress={() => setDuration(d as '30 days' | '60 days')}
                      style={[styles.optionBtn, duration === d && styles.optionBtnActive]}
                    >
                      <Text style={duration === d ? styles.optionTextActive : styles.optionTextInactive}>
                        {d}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Processing Time */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Choose processing time</Text>
                {['Express - 1~2 working days', 'Regular - 3-5 working days'].map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setProcessingTime(type as 'Express - 1~2 working days' | 'Regular - 3-5 working days')}
                    style={styles.processingRow}
                  >
                    <Ionicons
                      name={type === 'Express - 1~2 working days' ? 'flash' : 'time'}
                      size={20}
                      color="#cc3093"
                      style={styles.leftIcon}
                    />
                    <Text style={processingTime === type ? styles.optionTextActive : styles.optionTextInactive}>
                      {type}
                    </Text>
                    <Ionicons
                      name={processingTime === type ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={processingTime === type ? '#cc3093' : '#cc3093'}
                      style={styles.rightRadio}
                    />
                  </Pressable>
                ))}
              </View>
            </>) : (

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Are you a GCC resident?</Text>
              <View style={styles.optionRow}>
                {[true, false].map((val) => (
                  <Pressable
                    key={val.toString()}
                    onPress={() => setIsGCCResident(val)}
                    style={[
                      styles.optionBtn,
                      isGccResident === val && styles.optionBtnActive,
                    ]}
                  >
                    <Text
                      style={
                        isGccResident === val
                          ? styles.optionTextActive
                          : styles.optionTextInactive
                      }
                    >
                      {val ? 'Yes' : 'No'}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {/* Processing Time */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Processed within 24-72 hrs</Text>
                <Text style={styles.processingRow}>
                  For further verification, some applicants must visit a Saudi embassy with their printed documents.Processing can take up to 14 days.
                </Text>
              </View>
            </View>
          )

          }


          {/* Checkout Footer */}
          <View style={styles.checkoutFooter}>
            <View style={styles.checkoutInfo}>
              <Text style={styles.checkoutPrice}>
                {adults + children} Traveller{adults + children > 1 ? 's' : ''}
              </Text>
              <Text style={styles.checkoutPrice}>
                From AED {totalPrice}
              </Text>
            </View>
            <Pressable
              disabled={!selectedNationality || loading}
              onPress={handleSubmit}
              style={[
                styles.checkoutBtn,
                { backgroundColor: selectedNationality ? '#cc3093' : '#E5E7EB' },
              ]}
            >
              {loading ? (
                <Text style={[styles.checkoutBtnText, { color: '#FFFFFF' }]}>
                  Processing...
                </Text>
              ) : (
                <Text
                  style={[
                    styles.checkoutBtnText,
                    { color: selectedNationality ? '#FFFFFF' : '#9CA3AF' },
                  ]}
                >
                  Check Out
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container:
  {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 0,
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cc3093",
    marginBottom: 5,
  },
  backRow:
  {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  backText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 4
  },
  section: {
    marginBottom: 10
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  sectionLabelTitle: {
    fontSize: 15,
    marginBottom: 4
  },
  sectionSubLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8
  },
  subText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8
  },
  nationalityBox: {
    padding: 14,
    borderRadius: 10,
    borderColor: '#cc3093',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nationalityText:
  {
    color: '#9CA3AF'
  },
  nationalitySelected:
  {
    color: '#111827'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  },
  backdrop:
  {
    flex: 1
  },
  modalContainer: {
    height: '70%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    marginBottom: 16,
    marginTop: 25,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchBox: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 10,
  },
  nationalityTitle:
  {
    fontSize: 17,
    color: '#111827',
  },
  nationalityItem: {
    paddingVertical: 12,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
  },
  nationalityLabel:
  {
    fontSize: 16,
    color: '#111827'
  },
  modalCloseIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    borderColor: '#cc3093',
  },
  optionBtnActive: {

    backgroundColor: '#rgb(255, 238, 249)',
    borderColor: '#cc3093'
  },
  optionTextActive: {
    fontSize: 16,
    color: '#rgb(31, 31, 31)',
    fontWeight: '400'
  },
  optionTextInactive:
  {
    fontSize: 16,
    color: '#6B7280'

  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8
  },
  processingText: {
    fontSize: 15
  },
  optionBoxBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#c4c7ce',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionBoxBtnPlus: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#cc3093',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterIcon: {
    color: '#cc3093',
    fontSize: 20,
    fontWeight: '600'
  },
  counterIconPlus: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600'
  },
  checkoutFooter: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutInfo: {
    flex: 1,
  },
  checkoutPrice: {
    fontSize: 15,
    color: '#6B7280',
  },
  checkoutBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
    backgroundColor: '#cc3093',
  },
  checkoutBtnText: {
    fontWeight: '600',
    fontSize: 16,
  },
  travellerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f5f6fa',
    paddingHorizontal: 10,
    borderRadius: 8,
    paddingVertical: 5,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightRadio: {
    marginLeft: 'auto',
  },
  securityDepositNotice: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  securityDepositTitle: {
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  securityDepositText: {
    color: '#92400E',
    fontSize: 13,
  },
});