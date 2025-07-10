// app/Contact.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function ContactScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [chatVisible, setChatVisible] = useState(false);
    const handlePhonePress = () => Linking.openURL('tel:+97143426666');
    const handleEmailPress = () => Linking.openURL('mailto:customercare@uberevisa.com');
    const handleLocationPress = () => {
        Linking.openURL('https://www.google.com/maps?q=Karama+Business+Center,+Dubai,+UAE');
    };

    const phoneNumber = '+971043426666';
    const openWhatsApp = async () => {
        const url = `https://wa.me/${phoneNumber}`;

        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
            Linking.openURL(url);
        } else {
            Alert.alert('Error', 'WhatsApp is not installed on this device');
        }
    };

    return (
              <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'top']}>
        
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Contact Us</Text>
                <Ionicons name="close" size={24} onPress={() => router.push("/")} />
            </View>
            <ScrollView style={styles.container}>
                <TouchableOpacity style={styles.item} onPress={handlePhonePress}>
                    <Ionicons name="call-outline" size={24} color="#cc3093" />
                    <Text style={styles.text}>+971 4 342 6666</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.item} onPress={handleEmailPress}>
                    <Ionicons name="mail-outline" size={24} color="#cc3093" />
                    <Text style={styles.text}>customercare@uberevisa.com</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.item} onPress={handleLocationPress}>
                    <Ionicons name="location-outline" size={24} color="#cc3093" />
                    <Text style={styles.text}>Karama Business Center, Dubai, UAE</Text>
                </TouchableOpacity>
                {/* <View style={styles.wrapper}>

                    <Pressable style={styles.chatButton} onPress={() => setChatVisible(true)}>                  
                           <Text style={styles.chatText}>Chat</Text>

                    <ChatModal visible={chatVisible} onClose={() => setChatVisible(false)} /> </Pressable>
                </View> */}

 
            </ScrollView>
                 <TouchableOpacity style={styles.floatingButton} onPress={openWhatsApp}>
      <Ionicons name="logo-whatsapp" size={28} color="#fff" />
    </TouchableOpacity>
        </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flexGrow: 1,
        paddingTop: 10,
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
      floatingButton: {
  position: 'absolute',
  bottom: 30, // distance from bottom
  right: 20,  // distance from right
  backgroundColor: '#25D366', // WhatsApp green
  borderRadius: 30,
  width: 60,
  height: 60,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 5, // for Android shadow
  shadowColor: '#000', // for iOS shadow
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 3,

  },
    wrapper: {
width:100,
        padding: 12,

        zIndex: 999,
    },
    chatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#cc3093',
        padding: 12,
        borderRadius: 24,
        elevation: 5,
    },
    chatText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 6,
    },
    modalHeader: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    header: {
        padding: 10,
        paddingHorizontal: 16,
        paddingBottom: 12,
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
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    text: {
        marginLeft: 12,
        fontSize: 16,
        color: '#333',
    },
});