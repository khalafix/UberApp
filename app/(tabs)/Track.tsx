import { BookingDetailsData } from '@/types/booking';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDateTime } from '../../lib/schemas/utils';

const BookingSearchScreen = () => {
  const [bookingCode, setBookingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<BookingDetailsData | undefined>();

  const trackOrder = async () => {
    if (!bookingCode) {
      setError('Please enter a booking code.');
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const res = await fetch(`https://uberevisa.com/api/booking/TrackOrder/${bookingCode}`);
      const data = await res.json();

      if (!data || data.error || !data.serviceName) {
        throw new Error('Invalid booking code or booking not found');
      }
      setOrder(data);
    } catch (err) {
      console.error(err);
      setError('Order not found or there was an error fetching the order.');
    } finally {
      setLoading(false);
    }
  };

  return (
              <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom','top']}>

    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Track your Booking</Text>
        <Ionicons name="close" size={24} onPress={() => router.push("/")} />
      </View>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>


        <View style={styles.searchBox}>
          <TextInput
            style={styles.input}
            placeholder="Enter Booking Code"
            value={bookingCode}
            onChangeText={setBookingCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.button} onPress={trackOrder}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="#cc3093" style={{ marginTop: 20 }} />}
        {error && <Text style={styles.error}>{error}</Text>}

        {order && (
          <View style={styles.resultCard}>
            <Text style={styles.serviceTitle}>{order.serviceName}</Text>
            <Text style={styles.bookingCode}>{order.bookingCode}</Text>
            <Text style={styles.bookingCode}>{order.paymentStatus}</Text>

            <View style={styles.timelineItem}>
              <Ionicons name="checkmark-circle" size={24} color="#cc3093" style={styles.timelineIcon} />
              <View>
                <Text style={styles.statusTitle}>Booking Created</Text>
                <Text style={styles.statusDate}>{formatDateTime(order.createDate!.toString())}</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <MaterialIcons name="file-upload" size={24} color="#cc3093" style={styles.timelineIcon} />
              <View>
                <Text style={styles.statusTitle}>Documents Submitted</Text>
                <Text style={styles.statusDate}> {Array.isArray(order?.fileEntities) && order.fileEntities.length > 0
                  ? 'Documents Submitted'
                  : 'Waiting for Documents. Kindly please contact us if your are looking for Tourist Visa Service'}
                </Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <FontAwesome5 name="passport" size={20} color="#cc3093" style={styles.timelineIcon} />
              <View>
                <Text style={styles.statusTitle}>Processing Visa</Text>
                <Text style={styles.statusDate}>{order.updateDate ? formatDateTime(order.updateDate) : 'Pending'}</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <Ionicons name="checkmark-done-circle" size={24} color="#cc3093" style={styles.timelineIcon} />
              <View>
                <Text style={styles.statusTitle}>Visa Approved</Text>
                <Text style={styles.statusDate}>{order.bookingStatus === 2 ? formatDateTime(order.updateDate!.toString()) : 'Pending'}</Text>
              </View>
            </View>
          </View>
        )}

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
  header: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",
    padding: 10,

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
  scrollContent: {
    paddingBottom: 80, // 👈 Ensures space at bottom
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 30,
  },

  searchBox: {
    backgroundColor: '#fafafa',
    padding: 0,
    borderRadius: 16,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#cc3093',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  bookingCode: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  timelineIcon: {
    marginRight: 10,
    marginTop: 4,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusDate: {
    fontSize: 13,
    color: '#777',
  },
});

export default BookingSearchScreen;