import { useStore } from "@/stores/store";
import { Ionicons } from "@expo/vector-icons";
import { CardField, confirmPayment } from "@stripe/stripe-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { Image, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const CheckoutScreen = observer(() => {
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

  const handlePayment = async () => {
    if (processing) return; // Prevent double submission
    setProcessing(true);

    try {
      // Request clientSecret from backend
      const res = await fetch("https://kbc.center/api/payment/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(total * 100), // amount in smallest currency unit
          currency: "aed",
          orderId: booking.id,
          orderName: "Visa Service"
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Failed to create payment intent");
      }

      const json = await res.json();
      console.log("--------clientSecret from backend:", json.clientSecret);

      // Validate clientSecret format
      if (!json.clientSecret || !json.clientSecret.includes("_secret_")) {
        throw new Error("Invalid client secret from backend");
      }

      // Confirm payment with Stripe SDK
      const { error, paymentIntent } = await confirmPayment(json.clientSecret, {
        paymentMethodType: "Card",
      });

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
          router.replace("/"); // Navigate home after success
        }, 2000);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      alert(`Payment error: ${err?.message || "An error occurred while processing the payment."}`);
    } finally {
      setProcessing(false);
      setShowModal(false);
    }
  };

  if (loading || !booking) return <Text>Loading...</Text>;

  const { requiredFiles, adultsNumber, childrenNumber, entryType, duration, processTime, totalPrice, vatPercentage = 5 } = booking;
  const vatAmount = (totalPrice * vatPercentage) / 100;
  //const transactionFee = 3;
  //const total = totalPrice + vatAmount + transactionFee;
  const total = totalPrice + vatAmount;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'top']}>
      <ImageBackground
        source={require('../../assets/images/bg123123-02.png')} // replace with your actual image path
        style={styles.background}
        resizeMode="cover"
      >
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Check Out</Text>
            <Ionicons name="close" size={24} onPress={() => router.push("/")} />
          </View>

          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.sectionTitle}>Visa Detail</Text>
            <View style={styles.visaBox}>
              <View style={styles.visaLeft}>
                <View style={styles.visaHeader}>
                  <Text style={styles.visaTitle}>United Arab Emirates Visa</Text>
                  <Text style={styles.visaCount}>👤 x{adultsNumber + childrenNumber}</Text>
                </View>

                <View style={styles.iconRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#cc3093" />
                  <Text style={styles.visaItem}> {entryType.charAt(0).toUpperCase() + entryType.slice(1)}</Text>
                </View>
                <View style={styles.iconRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#cc3093" />
                  <Text style={styles.visaItem}> {duration}</Text>
                </View>
                <View style={styles.iconRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#cc3093" />
                  <Text style={styles.visaItem}> Medical Insurance</Text>
                </View>
                <View style={styles.iconRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#cc3093" />
                  <Text style={styles.visaItem}> {processTime}</Text>
                </View>

              </View>
              <Image source={require("../../assets/images/payment.png")} style={styles.visaImage} />
            </View>

            <View style={styles.docBox}>
              <View style={styles.docTextContainer}>
                <Text style={styles.docText}>Once payment is complete, please check the email for the Booking Confirmation. One of our representative will contact you soon.</Text>
                <Pressable>
                  <Text style={styles.linkText}>Documents Requirements →</Text>
                </Pressable>
              </View>
              <Image source={require("../../assets/images/pngtree.png")} style={styles.docImage} />
            </View>

            <View style={styles.priceRow}><Text>Adult x {adultsNumber}</Text><Text>AED {totalPrice}</Text></View>
            {childrenNumber > 0 && (<View style={styles.priceRow}><Text>Child x {childrenNumber}</Text><Text>AED {totalPrice}</Text></View>)}
            <View style={styles.priceRow}><Text style={styles.bold}>Grand Total</Text><Text style={styles.bold}>AED {totalPrice}</Text></View>
            <View style={styles.priceRow}><Text>Estimated VAT ({vatPercentage}%)</Text><Text>AED {vatAmount}</Text></View>
          </ScrollView>

          <View style={styles.footer}>
            <View>
              <Text style={styles.totalLabel}>Total (incl. VAT)</Text>
              <Text style={styles.totalAmount}>AED {total}</Text>
            </View>
            <Pressable
              style={[
                styles.payButton,
                processing && { opacity: 0.6 }
              ]}
              onPress={() => !processing && setShowModal(true)}
              disabled={processing}
            >
              <Text style={styles.payButtonText}>
                {processing ? "Processing..." : "Confirm & Pay"}
              </Text>
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

          {/* <PaymentModal
            amount={total}
            visible={showModal}
            title="Confirm Payment"
            description={`Total amount AED ${total.toFixed(2)}`}
            currency="AED"
            callbackUrl="https://uberevisa.com"
            publicKey="2258188d-9b2e-4bbf-817a-bd74a85e0c9c"
            apiPassword="e8374eaa-a151-47a6-b967-99dc482ecaaf"
            onRequestClose={() => setShowModal(false)}
            onPaymentSuccess={(data) => {
              console.log("Payment Success:", data);
              setShowModal(false);
              Toast.show({ type: "success", text1: "Payment Successful" });
              router.replace("/");
            }}
            onPaymentFailure={(error) => {
              console.error("Payment Failure:", error);
              setShowModal(false);
              Toast.show({ type: "error", text1: "Payment Failed" });
            }}
          /> */}

        </View>
      </ImageBackground>
    </SafeAreaView>
  );
});

export default CheckoutScreen;


const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // or use `gap` if your React Native version supports it
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: '#eee',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 10,
    width: '100%',
    height: '70%', // Half screen height
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
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  paymentOption: {
    backgroundColor: "#f1f1f1",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  paymentOptionDisabled: {
    backgroundColor: "#f1f1f1",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    opacity: 0.5,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: "500",
  },
  paymentSubText: {
    fontSize: 12,
    color: "red",
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
    fontFamily: 'Byom-Bold',

  },

  container: {
    padding: 16,
    paddingBottom: 100, // Add space for footer
  },
  header: {
    paddingTop: 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    fontSize: 18,
    fontWeight: "500",
    color: "#555",
    marginBottom: 12,
    marginTop: 2,
    fontFamily: 'PentaRounded-SemiBold',

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
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },
  visaCount: {
    fontSize: 14,
    color: "#000",
  },
  visaItem: {
    fontSize: 16,
    color: "#000",
    marginBottom: 0,
  },
  visaImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  docBox: {
    flexDirection: "row",
    backgroundColor: "#f5f7fb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  docTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  docText: {
    fontSize: 15,
    color: "#000",
    marginBottom: 8,
  },
  linkText: {
    color: "#007aff",
    fontWeight: "500",
  },
  docImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  priceContainer: {
    backgroundColor: "#f5f7fb",
    borderRadius: 16,
    padding: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#000",
  },
  priceValue: {
    fontSize: 14,
    color: "#000",
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
    fontFamily: 'Byom-Bold',

  },
});

