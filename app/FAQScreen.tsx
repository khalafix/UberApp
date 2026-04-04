import AppHeader from '@/components/AppHeader';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Animated,
  ImageBackground,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqs = [
  {
    question: 'What is the validity of a Saudi multiple entry tourist visa?',
    answer: 'One-year validity with multiple entries allowed. Each stay can be up to Ninety days.',
  },
  {
    question: 'Who is eligible to apply?',
    answer: 'Citizens of over sixty countries, including UAE residents and GCC nationals. Other nationalities can apply via consulate or agents.',
  },
  {
    question: 'What documents are required?',
    answer: [
      'Passport (valid for at least six months)',
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
    answer: 'No. Overstaying leads to heavy fines and possible bans. You must exit before the allowed Ninety-day stay per visit.',
  },
];

const FAQScreen = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }} edges={['bottom', 'top']}>
      <ImageBackground
        source={require('../assets/images/bg123123-02.png')} // replace with your actual image path
        style={styles.background}
        resizeMode="cover"
      >
        <AppHeader
          title="FAQ"
          logo={require("../assets/images/utravelagency-light.png")}
        />

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.subtitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.questionRow}
                  activeOpacity={0.7}
                  onPress={() => toggleAccordion(index)}
                >
                  <Text style={styles.question}>Q: {faq.question}</Text>
                  <Animated.View
                    style={{
                      transform: [{ rotate: isOpen ? '180deg' : '0deg' }],
                    }}
                  >
                    <Ionicons name="chevron-down" size={20} color="#CC3093" />
                  </Animated.View>
                </TouchableOpacity>

                {isOpen && (
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
            );
          })}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#374151',
    fontFamily: 'PentaRounded-SemiBold',
  },
  faqItem: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 17,
    fontWeight: '700',
    color: '#CC3093',
    flex: 1,
    marginRight: 10,
    fontFamily: 'Byom-Bold',
  },
  answer: {
    fontSize: 15.5,
    color: '#4B5563',
    lineHeight: 22,
    marginTop: 8,
    fontFamily: 'Byom-Regular',
  },
  answerList: {
    paddingLeft: 16,
    marginTop: 8,
  },
  answerBullet: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 6,
    fontFamily: 'Byom-Regular',
  },
});

export default FAQScreen;
