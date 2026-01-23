import { paymentType } from "@/lib/schemas/utils";
import { useStore } from "@/stores/store";
import { Ionicons } from "@expo/vector-icons";
import { CardField, confirmPayment } from "@stripe/stripe-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { Image, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const OtherCheckoutScreen = observer(() => {
  const { id } = useLocalSearchParams();
  const ids = id as string;
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const { bookingStore } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!ids) return;
      const booking = await bookingStore.getBooking(ids);
      setBooking(booking);
      setLoading(false);
    };
    fetchBooking();
  }, [ids]);

  if (loading || !booking) return <Text>Loading...</Text>;

  const { email, phone, customerName, serviceName, totalPrice, vatPercentage = 5 } = booking;
  const vatAmount = (totalPrice * vatPercentage) / 100;
  const total = totalPrice + vatAmount;

  const handlePayment = async () => {
       const type: paymentType = "Online";

    setProcessing(true);
    try {
      const res = await fetch("https://kbc.center/api/payment/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: "aed",
          orderId: `ORD-${Date.now()}`,
          orderName: "Pick & Drop",
        }),
      });

      const json = await res.json();
      console.log("clientSecret", json);

      if (!json.clientSecret || !json.clientSecret.startsWith("pi_")) {
        throw new Error("Invalid client secret from backend");
      }

      const { error, paymentIntent } = await confirmPayment(json.clientSecret, {
        paymentMethodType: "Card",
      });
      
      bookingStore.setPaymentTypeOfBooking(ids ?? "", type)

      if (error) {
        console.error("Stripe Payment Error:", error);
        alert(`Payment failed: ${error.message || "An unexpected error occurred"}`);
      } else if (paymentIntent) {
        setShowModal(false);

        Toast.show({
          type: "success",
          text1: "Payment Successful",
          text2: "Thank you for your booking 🎉",
          position: "bottom",
        });

        setTimeout(() => {
          router.replace("/");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Payment error:", err);

      if (err?.message) {
        alert(`Payment error: ${err.message}`);
      } else {
        alert("An error occurred while processing the payment.");
      }
    } finally {
      setProcessing(false);
      setShowModal(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["bottom", "top"]}>
             <ImageBackground
                  source={require('../../assets/images/bg123123-02.png')} // replace with your actual image path
                  style={styles.background}
                  resizeMode="cover"
                >
      <View style={{ flex: 1}}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Check Out</Text>
          <Ionicons
            name="close"
            size={24}
            color="#000"
            onPress={() => router.push("/")}
            accessibilityLabel="Close"
          />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.visaBox}>
            <View style={styles.visaLeft}>
              <View style={styles.visaHeader}>
                <View>
                  <View style={styles.iconRow}>
                    <Ionicons name="checkmark-circle" size={20} color="#cc3093" />
                    <Text style={styles.visaTitle}> {customerName}</Text>
                  </View>
                  <View style={styles.iconRow}>
                    <Ionicons name="checkmark-circle" size={20} color="#cc3093" />
                    <Text style={styles.visaTitle}> {phone}</Text>
                  </View>
                  <View style={styles.iconRow}>
                    <Ionicons name="checkmark-circle" size={20} color="#cc3093" />
                    <Text style={styles.visaTitle}> {email}</Text>
                  </View>
                  <View style={styles.iconRow}>
                    <Ionicons name="checkmark-circle" size={20} color="#cc3093" />
                    <Text style={styles.visaTitle}> {serviceName}</Text>
                  </View>
                </View>
              </View>
            </View>
            <Image
              source={require("../../assets/images/payment.png")}
              style={styles.visaImage}
            />
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.bold}>Total</Text>
            <Text style={styles.bold}>AED {totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text>Estimated VAT ({vatPercentage}%)</Text>
            <Text>AED {vatAmount.toFixed(2)}</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View>
            <Text style={styles.totalLabel}>Total (incl. VAT)</Text>
            <Text style={styles.totalAmount}>AED {total.toFixed(2)}</Text>
          </View>
          <Pressable style={styles.payButton} onPress={() => setShowModal(true)}>
            <Text style={styles.payButtonText}>Confirm &amp; Pay</Text>
          </Pressable>
        </View>
  <Modal animationType="slide" transparent={true} visible={showModal} onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Pressable style={styles.closeButton} onPress={() => setShowModal(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Confirmation</Text>
            <Text style={styles.modalAmount}>AED {total.toFixed(2)}</Text>
            <Text style={styles.modalSubText}>UBER TRAVEL AGENCY L.L.C</Text>

            <View style={styles.paymentOption}>
              <Text style={styles.paymentText}>Add New Card</Text>
      <CardField
  postalCodeEnabled={false}
  cardStyle={{
    backgroundColor: '#ffffff',
    textColor: '#000000',
    placeholderColor: '#999999',
    borderColor: '#cccccc', // optional
  }}
  style={{
    width: '100%',
    height: 50,
    marginVertical: 10,
  }}
  onCardChange={(cardDetails) => setCardDetails(cardDetails)}
/>
            </View>
                 <Pressable
          style={[
            styles.applePayButton,
            processing && { opacity: 0.6 }
          ]}
          onPress={handlePayment}
          disabled={processing}
        >
          <Text style={styles.applePayText}>
            {processing ? "Processing..." : "Pay"}
          </Text>
        </Pressable>
            <Pressable onPress={() => setShowModal(false)}>
              <Text style={{ textAlign: "center", marginTop: 12, color: "#007aff" }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      </View>
      </ImageBackground>
    </SafeAreaView>
  );
});

export default OtherCheckoutScreen;

const styles = StyleSheet.create({
    background: {
    flex: 1,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "#eee",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.67)", // fixed from #000000AA
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    width: "100%",
    height: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  modalAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  modalSubText: {
    fontSize: 14,
    color: "#777",
    marginBottom: 16,
  },
  paymentOption: {
    backgroundColor: "#f1f1f1",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: "500",
  },
  applePayButton: {
    backgroundColor: "#cc3093",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  applePayText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  container: {
    padding: 16,
    paddingBottom: 100, // space for footer
  },
  header: {
    padding: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",

  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
        fontFamily: 'PentaRounded-SemiBold',

  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 12,
    marginTop: 8,
  },
  visaBox: {
    flexDirection: "row",
    backgroundColor: "#f5f7fb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  visaLeft: {
    flex: 1,
  },
  visaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  visaTitle: {
    fontSize: 15,
    color: "#000",
  },
  visaImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  bold: {
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  totalLabel: {
    fontSize: 14,
    color: "#666",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  payButton: {
    backgroundColor: "#cc3093",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  payButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
