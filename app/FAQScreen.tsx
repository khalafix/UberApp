import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqs = [
  {
    question: 'What is the validity of a Saudi multiple entry tourist visa?',
    answer: '1-year validity with multiple entries allowed. Each stay can be up to 90 days.',
  },
  {
    question: 'Who is eligible to apply?',
    answer: 'Citizens of over 60 countries, including UAE residents and GCC nationals. Other nationalities can apply via consulate or agents.',
  },
  {
    question: 'What documents are required?',
    answer: [
      'Passport (valid for at least 6 months)',
      'Passport photo',
      'GCC/Iqama copy (for residents)',
      'Travel insurance (auto-included for eVisa)',
    ],
  },
  {
    question: 'Can I perform Umrah on a tourist visa?',
    answer: 'Yes, but Hajj is not permitted on a tourist visa.',
  },
  {
    question: 'What activities are allowed on this visa?',
    answer: 'Tourism, family visits, leisure trips, attending events or exhibitions.',
  },
  {
    question: 'Can I overstay my visa?',
    answer: 'No. Overstaying leads to heavy fines and possible bans. You must exit before the allowed 90-day stay per visit.',
  },
  {
    question: 'Can the visa be renewed or extended?',
    answer: 'No. Once the 1-year validity ends, a new visa must be applied for.',
  },
];

const FAQScreen = () => {
const [openIndex, setOpenIndex] = useState<number | null>(null);

const toggleAccordion = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'top']}>
        {/* Header setup */}
                <View style={{ flex: 1, backgroundColor: '#fff' }}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>FAQ</Text>
          <Ionicons name="close" size={24} onPress={() => router.back()} />
        </View>        
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subtitle}>Frequently Asked Questions</Text>
{faqs.map((faq, index: number) => (
          <View key={index} style={styles.faqItem}>
            <TouchableOpacity onPress={() => toggleAccordion(index)}>
              <Text style={styles.question}>Q{index + 1}: {faq.question}</Text>
            </TouchableOpacity>
            {openIndex === index && (
              Array.isArray(faq.answer) ? (
                <View style={styles.answerList}>
                  {faq.answer.map((item, idx) => (
                    <Text key={idx} style={styles.answerBullet}>• {item}</Text>
                  ))}
                </View>
              ) : (
                <Text style={styles.answer}>A: {faq.answer}</Text>
              )
            )}
          </View>
        ))}
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
      subtitle: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 10,
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
  faqItem: {
    marginBottom: 20,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#cc3093',
    marginBottom: 6,
  },
  answer: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  answerList: {
    paddingLeft: 12,
  },
  answerBullet: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 4,
  },
});

export default FAQScreen;