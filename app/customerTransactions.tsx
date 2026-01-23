import { useStore } from '@/stores/store';
import { BookingData, BookingStatus } from '@/types/booking';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function Transactions() {
    const router = useRouter();
    const { bookingStore, userStore } = useStore();
    const [bookings, setBookings] = useState<BookingData[]>([]);
    const [loading, setLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(5); // Show only 5 initially

    useEffect(() => {
        const loadBookings = async () => {
            const user = userStore.user;
            if (!user || !user.id || !user.email) return;

            setLoading(true);
            try {
                const bookingsById = await bookingStore.getBookingByCustomerId(user.id);
                const bookingsByEmail = await bookingStore.getBookingByEmail(user.email);

                const merged = [...(bookingsById || []), ...(bookingsByEmail || [])];
                const uniqueBookings = Array.from(new Map(merged.map(b => [b.id, b])).values());
                setBookings(uniqueBookings);
            } catch (error) {
                Toast.show({ type: 'error', text1: 'Failed to load bookings' });
            } finally {
                setLoading(false);
            }
        };

        loadBookings();
    }, []);

   const renderStatusLabel = (status: number) => {
        // Map the numeric status (e.g., 0) to its string equivalent using the enum
        switch (status) {
            case 0:
                return <span className="status-pending">{BookingStatus.Pending}</span>;
            case 1:
                return <span className="status-inprocess">{BookingStatus.InProcess}</span>;
            case 2:
                return <span className="status-canceled">{BookingStatus.Canceled}</span>;
            case 3:
                return <span className="status-completed">{BookingStatus.Completed}</span>;
            default:
                return <span>{status}</span>;  // Default case if status doesn't match
        }
    };
    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 5);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Bookings</Text>
                <Ionicons name="close" size={24} onPress={() => router.back()} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#666" style={{ marginTop: 40 }} />
            ) : bookings.length === 0 ? (
                <View style={styles.noBooking}>
                    <Text style={styles.noBookingText}>No bookings found.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {bookings.slice(0, visibleCount).map((booking) => (
                        <View key={booking.id} style={styles.card}>
                            <Text style={styles.serviceName}>{booking.serviceName}</Text>
                            <Text style={styles.detail}>
                                <Text style={styles.label}>Date: </Text>
                    {(booking.bookingDate)}
                            </Text>
                            <Text style={styles.detail}>
                                <Text style={styles.label}>Status: </Text>
                                {(booking.bookingStatus)}
                            </Text>

              
                        </View>
                    ))}

                     {visibleCount < bookings.length && (
                        <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
                            <Text style={styles.loadMoreText}>Load More</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        paddingTop: 60,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#eee',
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
    },
    noBooking: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    noBookingText: {
        fontSize: 16,
        color: '#777',
    },
    scrollContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#cc3093',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    serviceName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#222',
    },
    detail: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
    label: {
        fontWeight: '600',
        color: '#333',
    },
    status: {
        fontWeight: 'bold',
        fontSize: 14,
        marginTop: 2,
    },
    pending: {
        color: '#e67e22',
    },
    inProcess: {
        color: '#2980b9',
    },
    canceled: {
        color: '#e74c3c',
    },
    completed: {
        color: '#27ae60',
    },
loadMoreButton: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#cc3093',
        borderRadius: 8,
        alignItems: 'center',
    },
    loadMoreText: {
        color: '#fff',
        fontWeight: '600',
    },
});
