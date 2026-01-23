import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Button, ImageBackground, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const IloepInfoScreen = () => {
  const handleVisitWebsite = () => {
    Linking.openURL('https://www.iloe.ae/');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'top']}>
      <ImageBackground
        source={require('../assets/images/bg123123-02.png')} // replace with your actual image path
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ILOEP</Text>
          <Ionicons name="close" size={24} onPress={() => router.back()} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.heading}>ILOEP – Involuntary Loss of Employment Protection</Text>

          <Text style={styles.subheading}>What is ILOEP?</Text>
          <Text style={styles.paragraph}>
            The Involuntary Loss of Employment Protection Scheme is a mandatory insurance program introduced in the UAE to provide financial support to employees in the private and federal sectors who lose their jobs unexpectedly due to reasons beyond their control.
          </Text>

          <Text style={styles.subheading}>Who Needs to Register?</Text>
          <Text style={styles.paragraph}>
            All employees working in the UAE (except domestic workers, investors, and retirees with pensions) must register for ILOEP by the government’s deadline.
          </Text>

          <Text style={styles.subheading}>Benefits</Text>
          <Text style={styles.paragraph}>
            If you lose your job involuntarily, the scheme will provide monthly compensation for a limited period, helping you manage basic expenses while looking for a new job.
          </Text>

          <Text style={styles.subheading}>Premiums</Text>
          <Text style={styles.paragraph}>
            The premium varies based on salary brackets:
          </Text>
          <Text style={styles.paragraph}>• AED 5/month for salaries under AED 16,000</Text>
          <Text style={styles.paragraph}>• AED 10/month for salaries AED 16,000 and above</Text>

          <Text style={styles.subheading}>How to Register?</Text>
          <Text style={styles.paragraph}>
            Registration is easy and can be done via the official website, insurance partners, exchange centers, or mobile apps.
          </Text>

          <Button title="Visit ILOE Official Website" onPress={handleVisitWebsite} />

          <Text style={styles.footerNote}>
            Disclaimer: This information is provided as a general overview. Always refer to the official site for the most accurate and updated details.
          </Text>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // ⬅️ separates logo & icon
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // with some opacity
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#cc3093',
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  footerNote: {
    marginTop: 30,
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});

export default IloepInfoScreen;
