// app/Account.tsx
import { useStore } from '@/stores/store';
import { BookingData } from '@/types/booking';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function Account() {
    const router = useRouter();
    const { bookingStore, userStore } = useStore();
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState<BookingData[]>([]);
    const {
        userStore: {
            isAdmin,
            logout,
            isLoggedIn,
            user,
            isUser,
        }
    } = useStore();
    



    return (
        <>
              <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'top']}>
        
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Account</Text>
                <Ionicons name="close" size={24} onPress={() => router.back()} />
            </View>

            {userStore.isLoggedIn ? (
                <View style={styles.container}>

                    <View style={styles.iconTextRow}>
                        <Ionicons name="person-outline" size={24} />
                        <Text style={styles.headerTitle}>     {user?.displayName}</Text>
                    </View>




                    <Pressable style={styles.button} onPress={() => router.push('/customerTransactions')}>
                        <View style={styles.iconTextRow}>
                            <Ionicons name="calendar-outline" size={24} />
                            <Text style={styles.buttonText}>Booking Details</Text>
                        </View>
                    </Pressable>


                    <Pressable style={styles.button} onPress={() => router.push('/Policy')}>
                        <View style={styles.iconTextRow}>
                            <Ionicons name="shield-checkmark-outline" size={24} />
                            <Text style={styles.buttonText}>Privacy Policy</Text>
                        </View>
                    </Pressable>
         <Pressable style={styles.button} onPress={() => router.push('/FAQScreen')}>
                    <View style={styles.iconTextRow}>
                        <Ionicons name="shield-checkmark-outline" size={24} />
                        <Text style={styles.buttonText}>FAQ</Text>
                    </View>
                </Pressable>
                    <Pressable style={styles.button} onPress={() => router.push('/Contact')}>
                        <View style={styles.iconTextRow}>
                            <Ionicons name="call-outline" size={24} />
                            <Text style={styles.buttonText}>Contact</Text>
                        </View>
                    </Pressable>

                    <Pressable style={styles.button} onPress={async () => {
                        await logout(); // clear state
                        Toast.show({ type: 'success', text1: 'Logout successful' });
                        router.replace('/'); // redirect to home
                    }}>
                        <View style={styles.iconTextRow}>
                            <Ionicons name="log-out-outline" size={24} />
                            <Text style={styles.buttonText}>Logout</Text>
                        </View>
                    </Pressable>

                </View>

            ) : (<View style={styles.container}>

                <Pressable style={styles.button} onPress={() => router.push('/Policy')}>
                    <View style={styles.iconTextRow}>
                        <Ionicons name="shield-checkmark-outline" size={24} />
                        <Text style={styles.buttonText}>Privacy Policy</Text>
                    </View>
                </Pressable>

                       <Pressable style={styles.button} onPress={() => router.push('/FAQScreen')}>
                    <View style={styles.iconTextRow}>
                        <Ionicons name="shield-checkmark-outline" size={24} />
                        <Text style={styles.buttonText}>FAQ</Text>
                    </View>
                </Pressable>

                <Pressable style={styles.button} onPress={() => router.push('/Contact')}>
                    <View style={styles.iconTextRow}>
                        <Ionicons name="call-outline" size={24} />
                        <Text style={styles.buttonText}>Contact</Text>
                    </View>
                </Pressable>

                <Pressable style={styles.button} onPress={() => router.push('/Login')}>
                    <View style={styles.iconTextRow}>
                        <Ionicons name="log-in-outline" size={24} />
                        <Text style={styles.buttonText}>Login</Text>
                    </View>
                </Pressable>


            </View>
            )}
</SafeAreaView>
        </>

    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: '#fff' },
    header: {
        padding: 10,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderColor: "#eee",
        backgroundColor: '#fff'

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
    button: {
        borderBottomWidth: 1,
        borderColor: "#f3f3f3",
        textAlign: 'left',
        marginTop: 10,
    },
    buttonText: {
        color: '#434343',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
        padding: 8,
        // fallback if `gap` doesn't work
    },
    iconTextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8, // if you're using React Native 0.71+, otherwise use `marginLeft`
    },

});