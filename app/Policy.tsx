import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PrivacyPolicyScreen = () => {
    return (

              <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom','top']}>

        <View style={{ flex: 1, backgroundColor: '#fff' }}>

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <Ionicons name="close" size={24} onPress={() => router.back()} /> 
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.section}>
                    Welcome to Uber Travel Agency ("we," "our," "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, or services (collectively, the "Platform").
                </Text>

                <Text style={styles.section}>
                    By accessing or using our Platform, you agree to the terms of this Privacy Policy. If you do not agree with the terms, please do not use our Platform.
                </Text>

                <Text style={styles.title}>1. Information We Collect</Text>
                <Text style={styles.section}>
                    - Personal Information: Name, email address, phone number, and other contact details, etc.{"\n"}
                    - Usage Data: IP address, browser type, device information, pages visited, time spent, etc.{"\n"}
                    - Cookies and Tracking Technologies: We use cookies to enhance your experience, analyze trends, and administer the Platform.
                </Text>

                <Text style={styles.title}>2. How We Use Your Information</Text>
                <Text style={styles.section}>
                    - To provide, operate, and maintain our services.{"\n"}
                    - To process bookings, payments, and service requests.{"\n"}
                    - To communicate with you regarding your bookings, updates, and promotions.{"\n"}
                    - To improve our Platform and services.{"\n"}
                    - To comply with legal and regulatory requirements.{"\n"}
                    - To protect the security and integrity of our Platform.
                </Text>

                <Text style={styles.title}>3. Sharing Your Information</Text>
                <Text style={styles.section}>
                    - Government Authorities{"\n"}
                    - Legal Obligations
                </Text>

                <Text style={styles.title}>4. Data Security</Text>
                <Text style={styles.section}>
                    We implement appropriate technical and organizational measures to protect your information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
                </Text>

                <Text style={styles.title}>5. Your Rights</Text>
                <Text style={styles.section}>
                    - Access: Request a copy of the personal information we hold about you.{"\n"}
                    - Correction: Request corrections to inaccurate or incomplete information.{"\n"}
                    - Deletion: Request deletion of your personal information, subject to legal requirements.
                </Text>

                <Text style={styles.title}>6. Retention of Information</Text>
                <Text style={styles.section}>
                    We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy or as required by law.
                </Text>

                <Text style={styles.title}>7. Third-Party Links</Text>
                <Text style={styles.section}>
                    Our Platform may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these third parties. Please review their privacy policies before providing any information.
                </Text>

                <Text style={styles.title}>8. Children’s Privacy</Text>
                <Text style={styles.section}>
                    Our Platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware of such collection, we will take steps to delete the information.
                </Text>

                <Text style={styles.title}>9. Changes to This Privacy Policy</Text>
                <Text style={styles.section}>
                    We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. Your continued use of the Platform constitutes acceptance of the revised policy.
                </Text>

                <Text style={styles.title}>10. Contact Us</Text>
<View>
  <Text>Email: </Text>
  <TouchableOpacity onPress={() => Linking.openURL('mailto:customercare@uberevisa.com')}>
    <Text style={styles.link}>customercare@uberevisa.com</Text>
  </TouchableOpacity>

  <Text>Phone: </Text>
  <TouchableOpacity onPress={() => Linking.openURL('tel:043426666')}>
    <Text style={styles.link}>04 342 6666</Text>
  </TouchableOpacity>

  <Text>Address: </Text>
  <TouchableOpacity onPress={() => Linking.openURL('https://www.google.com/maps/search/?api=1&query=Karama+Business+Center+Dubai')}>
    <Text style={styles.link}>Karama Business Center, Dubai UAE</Text>
  </TouchableOpacity>
</View>


            </ScrollView>
            
        </View>
        
</SafeAreaView>

    );
};

const styles = StyleSheet.create({
    container:
    {
        flex: 1,
        paddingTop: 10,
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    link: {
  color: '#cc3093',
  textDecorationLine: 'underline',
  fontSize: 15,
  lineHeight: 22,
},
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
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subheading: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 8,
        color: '#cc3093',
    },
    section: {
        fontSize: 15,
        color: '#444',
        lineHeight: 22,
    },
    scrollContent: {
        paddingBottom: 80, // 👈 Ensures space at bottom
    },
});

export default PrivacyPolicyScreen;