// app/index.tsx
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ServiceItem {
  id: string;
  name: string;
  icon: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('https://uberevisa.com/api/categories');
      const data = await response.json();
      const items = Array.isArray(data?.data) ? data.data : [];

      const filtered = items
        .filter((item: any) => {
          const name = item?.name?.toLowerCase?.();
          return name === 'visit visa' || name === 'pick & drop';
        })
        .map((item: any) => {
          const name = item.name || 'Unnamed';
          let icon = '';
          if (name.toLowerCase() === 'visit visa') {
            icon =
              'https://uberevisa.com/seed/image/faa3d3a7-47c5-4581-beda-799b64bb0f3b_675b6efc-1f05-4f43-95c2-1b26c24dfe3e_HAMID TOURIST VISA-01-08.png';
          } else if (name.toLowerCase() === 'pick & drop') {
            icon =
              'https://uberevisa.com/seed/image/9b032d83-75f1-4b05-9d78-9ae3cbe63846_fda2b440-8f69-4005-b85a-09750baf3146_pick n drop-011.png';
          }

          return {
            id: item?.Id?.toString() ?? Math.random().toString(),
            name,
            icon,
          };
        });

      setServices(filtered);
    } catch (e) {
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (name: string) => {
    if (name.toLowerCase() === 'visit visa') {
      router.push({ pathname: '/visitVisa', params: { serviceName: name } });
    } else if (name.toLowerCase() === 'pick & drop') {
      router.push({ pathname: '/bookingForm' });
    }
  };

  return (
              <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom','top']}>
    
    <ImageBackground
      source={require('../../assets/images/bg-01.png')}
      style={styles.background}
      resizeMode="cover"
    >
<ScrollView contentContainerStyle={styles.container}>
          <Image
          source={require('../../assets/images/UBER-01.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.chooseService}>All Services</Text>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : error ? (
          <Text>{error}</Text>
        ) : (
          <View style={styles.serviceRow}>
            {services.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.serviceCard}
                onPress={() => handlePress(item.name)}
              >
                <Image source={{ uri: item.icon }} style={styles.icon} />
                <Text style={styles.serviceText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { paddingTop: 60, alignItems: 'center'},
  image: { width: 200 },
  chooseService: { fontSize: 18, fontWeight: 'bold', marginVertical: 20 },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    gap: 20,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    padding: 10,
    flex: 1,
    elevation: 4,
  },
  icon: { width: 64, height: 64 },
  serviceText: { marginTop: 8, fontWeight: '500', fontSize: 14 },
});