// app/Contact.tsx
import AppHeader from "@/components/AppHeader";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  ImageBackground,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContactScreen() {
  const handlePhonePress = () => Linking.openURL("tel:+97143426666");
  const handleEmailPress = () =>
    Linking.openURL("mailto:customercare@uberevisa.com");
  const handleLocationPress = () =>
    Linking.openURL(
      "https://maps.app.goo.gl/RQvEEx9jCvrAsshn6"
    );

  const phoneNumber = "+971043426666";
  const openWhatsApp = async () => {
    const url = `https://wa.me/${phoneNumber}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert("Error", "WhatsApp is not installed on this device");
    }
  };

  // Animation for WhatsApp button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground
        source={require("../assets/images/bg123123-02.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <AppHeader
          title="Contact Us"
          logo={require("../assets/images/utravelagency-light.png")}
        />

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <TouchableOpacity style={styles.item} onPress={handlePhonePress}>
              <View style={styles.iconContainer}>
                <Ionicons name="call-outline" size={24} color="#fff" />
              </View>
              <Text style={styles.text}>+971 4 342 6666</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={handleEmailPress}>
              <View style={[styles.iconContainer, { backgroundColor: "#cc3093" }]}>
                <Ionicons name="mail-outline" size={24} color="#fff" />
              </View>
              <Text style={styles.text}>customercare@uberevisa.com</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={handleLocationPress}>
              <View style={[styles.iconContainer, { backgroundColor: "#0097a7" }]}>
                <Ionicons name="location-outline" size={24} color="#fff" />
              </View>
              <Text style={styles.text}>Karama Business Center, Dubai, UAE</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Animated Floating WhatsApp Button */}
        <Animated.View
          style={[
            styles.floatingButton,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <TouchableOpacity onPress={openWhatsApp} activeOpacity={0.8}>
            <Ionicons name="logo-whatsapp" size={28} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  background: {
    flex: 1,
    justifyContent: "center",
  },
  container: {
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginVertical: 10,
    padding: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#25D366",
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    color: "#222",
    flex: 1,
    fontWeight: "500",
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#25D366",
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
});
