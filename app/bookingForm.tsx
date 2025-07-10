import { BookingSchema } from "@/lib/schemas/bookingSchema";
import { useStore } from "@/stores/store";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { router } from 'expo-router';

import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function BookingForm({ serviceOptionId, IsAtHome }: any) {
  const { bookingStore, serviceStore } = useStore();
  const [slots, setSlots] = useState<string[] | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState({
    latitude: 25.2048,
    longitude: 55.2708,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [price, setPrice] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const serviceId = "E92BC586-D35C-4365-2258-08DD773EDD03";
  const [selectedPrice, setSelectedPrice] = useState<number>(0);

  useEffect(() => {
    const fetch = async () => {
      await bookingStore.getAvailableSlots(moment(date).format("YYYY-MM-DD"));
      setSlots(bookingStore.availableSlots);
    };
    fetch();
  }, [date]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        const region = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        };
        setLocation(region);
        const [place] = await Location.reverseGeocodeAsync(region);
        setAddress(`${place.name} ${place.street}, ${place.city}`);
      }
    })();
    serviceStore.getService(serviceId);

  }, []);

  useEffect(() => {
    if (serviceStore.currentService?.price) {
      setSelectedPrice(Number(serviceStore.currentService.price));
    }
  }, [serviceStore.currentService?.id]);

  const onSubmit = async () => {
    if (!name || !phone || !address || !selectedTime) {
      Toast.show({ type: "error", text1: "Please complete all fields." });
      return;
    }
    setSubmitting(true);
    const data: BookingSchema = {
      customerName: name,
      phone,
      email,
      address,
      latitude: location.latitude,
      longitude: location.longitude,
      bookingDate: moment(date).format("YYYY-MM-DD"),
      bookingTime: selectedTime,
      totalPrice: selectedPrice,
      serviceId,
      serviceOptionId,
      isVIP: IsAtHome,
    };
    console.log("Booking Payload:", data);
    const result = await bookingStore.addBooking(data);
    setSubmitting(false);

    if (result.status === "success") {
      Toast.show({ type: "success", text1: "Booking successful!" });
      router.push(`/OtherCheckout/${result.data}`);
    } else {
      Toast.show({ type: "error", text1: "Booking failed" });
    }
  };

  return (
    <>

      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'top']}>
        {/* Header setup */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <Ionicons name="close" size={24} onPress={() => router.back()} />
        </View>

        <View style={styles.wrapper}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Tap map or enter manually"
            />

            <MapView
              style={styles.map}
              region={location}
              showsUserLocation
              onPress={e =>
                setLocation(prev => ({
                  ...prev,
                  latitude: e.nativeEvent.coordinate.latitude,
                  longitude: e.nativeEvent.coordinate.longitude
                }))
              }
            >
              <Marker coordinate={location} />
            </MapView>

            <Text style={styles.label}>Pick-up Date</Text>
            <TouchableOpacity style={styles.selector} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.selectorText}>{moment(date).format("MMMM D, YYYY")}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                mode="date"
                value={date}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(e, d) => {
                  if (d) setDate(d);
                  setShowDatePicker(false);
                }}
                style={styles.datePicker}
              />
            )}

            <Text style={styles.label}>Available Slots</Text>
            <View style={styles.slotsContainer}>
              {slots === null ? (
                <ActivityIndicator color="#cc3093" />
              ) : slots.length ? (
                slots.map(slot => (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.slot,
                      selectedTime === slot && styles.slotSelected
                    ]}
                    onPress={() => setSelectedTime(slot)}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        selectedTime === slot && styles.slotTextSelected
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptySlotText}>No slots available.</Text>
              )}
            </View>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+971 5XX XXX XXXX"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="your@email.com"
            />
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.totalPrice}>AED  {serviceStore.currentService?.price}
            </Text>
            <Pressable
              style={[styles.bookBtn, (!slots || submitting) && styles.bookBtnDisabled]}
              onPress={onSubmit}
              disabled={!slots || submitting}
            >
              <Text style={styles.bookBtnText}>
                {submitting ? "Processing..." : "Book Now"}
              </Text>
            </Pressable>
          </View>

          <Toast />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#f9f9f9" },
  content: { padding: 10, paddingBottom: 120 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginTop: 10 },
  header: {
    padding: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",

  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 20,
    zIndex: 10,

  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
    marginTop: 8
  },
  map: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginTop: 12
  },
  selector: {
    marginTop: 8,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1
  },
  selectorText: { color: "#444" },
  datePicker: { width: "100%", marginTop: -8 },
  slotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8
  },
  slot: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#eee",
    borderRadius: 6,
    margin: 4
  },
  slotSelected: { backgroundColor: "#cc3093" },
  slotText: { color: "#333" },
  slotTextSelected: { color: "#fff" },
  emptySlotText: { color: "#888", marginTop: 8 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopColor: "#ddd",
    borderTopWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center"
  },
  totalPrice: { flex: 1, fontSize: 18, fontWeight: "600", color: "#333" },
  bookBtn: {
    backgroundColor: "#cc3093",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  bookBtnDisabled: { opacity: 0.6 },
  bookBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" }
});
