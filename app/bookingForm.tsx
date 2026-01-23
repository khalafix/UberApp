import { BookingSchema } from "@/lib/schemas/bookingSchema";
import { useStore } from "@/stores/store";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function BookingForm() {
  const { bookingStore, serviceStore } = useStore();
  const [slots, setSlots] = useState<string[] | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("");

  // ✅ Receive values from map screen
  const { latitude, longitude, addressName } = useLocalSearchParams();

  // ✅ Initialize address & location using map params — NOT default city values
  const [address, setAddress] = useState(addressName ? String(addressName) : "");
  const [location, setLocation] = useState({
    latitude: latitude ? Number(latitude) : 25.2048,
    longitude: longitude ? Number(longitude) : 55.2708,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);

  const serviceId = "E92BC586-D35C-4365-2258-08DD773EDD03";
  const serviceOptionId = undefined;
  const IsAtHome = false;

  useEffect(() => {
    // ✅ Slot loading
    const fetchSlots = async () => {
      await bookingStore.getAvailableSlots(moment(date).format("YYYY-MM-DD"));
      setSlots(bookingStore.availableSlots);
    };
    fetchSlots();
  }, [date]);

  useEffect(() => {
    // ✅ Only load service details — do NOT override location again
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
      nationalityId: "B6A1B0F8-936A-4DD6-B8B6-30931B4B237C",
    };

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["bottom", "top"]}>
      <ImageBackground
        source={require("../assets/images/bg123123-02.png")}
        style={styles.background}
        resizeMode="cover"
      >
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
              />
            )}

            <Text style={styles.label}>Available Slots</Text>
            <View style={styles.slotsContainer}>
              {slots === null ? (
                <ActivityIndicator color="#cc3093" />
              ) : slots.length ? (
                slots.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.slot, selectedTime === slot && styles.slotSelected]}
                    onPress={() => setSelectedTime(slot)}
                  >
                    <Text
                      style={[styles.slotText, selectedTime === slot && styles.slotTextSelected]}
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
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your Name" />

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
            <Text style={styles.totalPrice}>AED {serviceStore.currentService?.price}</Text>
            <Pressable
              style={[styles.bookBtn, (!slots || submitting) && styles.bookBtnDisabled]}
              onPress={onSubmit}
              disabled={!slots || submitting}
            >
              <Text style={styles.bookBtnText}>{submitting ? "Processing..." : "Book Now"}</Text>
            </Pressable>
          </View>

          <Toast />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  wrapper: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  content: { padding: 10, paddingBottom: 120 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },

  header: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#000" },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    borderColor: "#cc3093",
  },
  selector: {
    marginTop: 8,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cc3093",
  },
  selectorText: { color: "#444" },

  slotsContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  slot: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f7e3efff",
    borderRadius: 6,
    margin: 4,
    borderColor: "#cc3093",
    borderWidth: 1,
  },
  slotSelected: { backgroundColor: "#cc3093" },
  slotText: { color: "#333" },
  slotTextSelected: { color: "#fff" },
  emptySlotText: { color: "#888", marginTop: 8 },

  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  totalPrice: { flex: 1, fontSize: 18, fontWeight: "600", color: "#333" },

  bookBtn: {
    backgroundColor: "#cc3093",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  bookBtnDisabled: { opacity: 0.6 },
  bookBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
