import AppHeader from '@/components/AppHeader';
import React from 'react';
import { ImageBackground, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PrivacyPolicyScreen = () => {
  return (

    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'top']}>
      <ImageBackground
        source={require('../assets/images/bg123123-02.png')} // replace with your actual image path
        style={styles.background}
        resizeMode="cover"
      >
        <View style={{ flex: 1 }}>

          <AppHeader
            title="Privacy Policy"
            logo={require("../assets/images/utravelagency-light.png")}
          />

          <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.section}>
              Welcome to UTA ("we," "our," "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, or services (collectively, the "Platform").
            </Text>

            <Text style={styles.section}>
              By accessing or using our Platform, you agree to the terms of this Privacy Policy. If you do not agree with the terms, please do not use our Platform.
            </Text>

            <Text style={styles.title}>Information We Collect</Text>
            <Text style={styles.section}>
              - Personal Information: Name, email address, phone number, and other contact details, etc.{"\n"}
              - Usage Data: IP address, browser type, device information, pages visited, time spent, etc.{"\n"}
              - Cookies and Tracking Technologies: We use cookies to enhance your experience, analyze trends, and administer the Platform.
            </Text>

            <Text style={styles.title}>How We Use Your Information</Text>
            <Text style={styles.section}>
              - To provide, operate, and maintain our services.{"\n"}
              - To process bookings, payments, and service requests.{"\n"}
              - To communicate with you regarding your bookings, updates, and promotions.{"\n"}
              - To improve our Platform and services.{"\n"}
              - To comply with legal and regulatory requirements.{"\n"}
              - To protect the security and integrity of our Platform.
            </Text>

            <Text style={styles.title}>Sharing Your Information</Text>
            <Text style={styles.section}>
              - Government Authorities{"\n"}
              - Legal Obligations
            </Text>

            <Text style={styles.title}>Data Security</Text>
            <Text style={styles.section}>
              We implement appropriate technical and organizational measures to protect your information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is fully secure.
            </Text>

            <Text style={styles.title}>Your Rights</Text>
            <Text style={styles.section}>
              - Access: Request a copy of the personal information we hold about you.{"\n"}
              - Correction: Request corrections to inaccurate or incomplete information.{"\n"}
              - Deletion: Request deletion of your personal information, subject to legal requirements.
            </Text>

            <Text style={styles.title}>Retention of Information</Text>
            <Text style={styles.section}>
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy or as required by law.
            </Text>

            <Text style={styles.title}>Third-Party Links</Text>
            <Text style={styles.section}>
              Our Platform may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these third parties. Please review their privacy policies before providing any information.
            </Text>

            <Text style={styles.title}>Children’s Privacy</Text>
            <Text style={styles.section}>
              Our Platform is not intended for individuals under the age of Eignteen. We do not knowingly collect personal information from children. If we become aware of such collection, we will take steps to delete the information.
            </Text>

            <Text style={styles.title}>Changes to This Privacy Policy</Text>
            <Text style={styles.section}>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. Your continued use of the Platform constitutes acceptance of the revised policy.
            </Text>

            <Text style={styles.title}>Contact Us</Text>
            <View>
              <Text style={styles.title}>Email: </Text>
              <TouchableOpacity onPress={() => Linking.openURL('mailto:customercare@uberevisa.com')}>
                <Text style={styles.link}>customercare@uberevisa.com</Text>
              </TouchableOpacity>

              <Text style={styles.title}>Phone: </Text>
              <TouchableOpacity onPress={() => Linking.openURL('tel:043426666')}>
                <Text style={styles.link}>04 342 6666</Text>
              </TouchableOpacity>

              <Text style={styles.title}>Address: </Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://www.google.com/maps/search/?api=1&query=Karama+Business+Center+Dubai')}>
                <Text style={styles.link}>Karama Business Center, Dubai UAE</Text>
              </TouchableOpacity>
            </View>


          </ScrollView>

        </View>
      </ImageBackground>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 50,
    paddingHorizontal: 24,
    backgroundColor: "#f9f9fb",
  },

  background: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  closeButton: {
    position: "absolute",
    top: 12,
    right: 20,
    zIndex: 10,
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
    fontFamily: "Byom-Bold",
  },

  subheading: {
    fontSize: 15,
    color: "#888",
    marginBottom: 24,
    lineHeight: 22,
    fontFamily: "Byom-Regular",
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#cc3093",
    marginTop: 12,
    marginBottom: 12,
    letterSpacing: 0.3,
    fontFamily: "Byom-Bold",
  },

  section: {
    fontSize: 15,
    color: "#333",
    lineHeight: 24,
    fontFamily: "Byom-Regular",
  },

  link: {
    color: "#cc3093",
    textDecorationLine: "underline",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },

  scrollContent: {
    paddingBottom: 100,
  },
});

export default PrivacyPolicyScreen;