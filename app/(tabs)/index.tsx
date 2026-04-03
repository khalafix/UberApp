// app/index.tsx
import { Feather } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { useFocusEffect, useRouter } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import '../firebase';
import { useUser } from '../usercontext/UserContext';

interface ServiceItem {
  id: string;
  name: string;
  icon: string;
}

// ✅ iOS & Android: Show notifications in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,   // new required field
    shouldShowList: true,     // new required field
  }),
});

// Android: create notification channel
const createAndroidChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
};

// Request notification permissions (Android & iOS)
const requestNotificationPermission = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('🚫 Notification permission not granted!');
    return false;
  }
  return true;
};

function HomeScreen() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [soonVisible, setSoonVisible] = useState(false);
  const { user, clearUser } = useUser();
  const [storedToken, setStoredToken] = useState<string | null>(null);

  // Load local token
  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('token');
      setStoredToken(token);
    };
    loadToken();
  }, []);

  // Always setup FCM (RUN ONLY ONCE)
  useEffect(() => {
    let unsubscribeForeground: any;
    let unsubscribeBackground: any;

    const showAlert = (type: string, title: string, body: string) => {
      const icon =
        type === 'success'
          ? 'success'
          : type === 'error'
            ? 'error'
            : type === 'warning'
              ? 'warning'
              : 'info';

      // @ts-ignore
      Alert.alert(
        title || 'Notification',
        body || '',
        [{ text: 'OK' }],
        { cancelable: true }
      );
    };

    const handleAction = (action: string, type: string, title: string, body: string) => {
      switch (action) {
        case 'Normal':
          router.push('/Notification');
          setTimeout(() => {
            showAlert(type, title, body);
          }, 300); // small delay
          break;

        case 'Redirect':
          // extract order id like "#12345" from title "order no #12345"
          const orderIdMatch = title.match(/#\d+/);
          const orderId = orderIdMatch ? orderIdMatch[0] : '';

          router.push(`/order-details/${orderId}`);
          break;

        case 'Popup':
          router.push('/');
          setTimeout(() => {
            showAlert(type, title, body);
          }, 300); // small delay
          break;

        case 'Ads':
          router.push('/');
          setTimeout(() => {
            showAlert(type, title, body);
          }, 300); // small delay
          break;

        default:
          router.push('/');
          showAlert(type, title, body);
      }
    };

    const initFCM = async () => {
      await createAndroidChannel();

      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) return;

      try {
        const fcmToken = await messaging().getToken();
        console.log('🔥 FCM TOKEN:', fcmToken);
      } catch (err) {
        console.error('⚠️ Error fetching FCM token:', err);
      }

      // ✅ Foreground
      unsubscribeForeground = messaging().onMessage(async remoteMessage => {
        console.log('📩 Foreground message:', remoteMessage);

        const action = String(remoteMessage.data?.action ?? 'Normal');
        const type = String(remoteMessage.data?.type ?? 'info');
        const title = remoteMessage.notification?.title ?? '';
        const body = remoteMessage.notification?.body ?? '';

        handleAction(action, type, title, body);

        if (remoteMessage.notification) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: title || 'No title',
              body: body || 'No body',
              sound: 'default',
              attachments: [
                {
                  url: 'https://ubertravelagency.com/img/general/ubertravelagency-light.svg',
                  identifier: null,
                  type: null,
                },
              ],
            },
            trigger: null,
          });
        }
      });

      // ✅ Background
      unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('📲 Opened from background:', remoteMessage);

        const action = String(remoteMessage.data?.action ?? 'Normal');
        const type = String(remoteMessage.data?.type ?? 'info');
        const title = remoteMessage.notification?.title ?? '';
        const body = remoteMessage.notification?.body ?? '';

        handleAction(action, type, title, body);
      });

      // ✅ Quit state
      messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage) {
          console.log('🚀 Opened from quit:', remoteMessage);

          const action = String(remoteMessage.data?.action ?? 'Normal');
          const type = String(remoteMessage.data?.type ?? 'info');
          const title = remoteMessage.notification?.title ?? '';
          const body = remoteMessage.notification?.body ?? '';

          handleAction(action, type, title, body);
        }
      });
    };

    initFCM();

    return () => {
      if (unsubscribeForeground) unsubscribeForeground();
      if (unsubscribeBackground) unsubscribeBackground();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user !== undefined) {
        //fetchServices();
      }
    }, [user])
  );

  const otherServices = [
    {
      id: '3',
      name: 'ILOE Insurance',
      icon: require('../../assets/images/logo.png'),
      route: '/IloepInfoScreen',
    },
  ];

  const handleStaticPress = (route: string) => {
    router.push({ pathname: '/IloepInfoScreen' });
  };

  const topDestinations = [
    { id: '1', name: 'Dubai', image: require('../../assets/images/dubai.png') },
    { id: '2', name: 'Abu Dhabi', image: require('../../assets/images/abudhabi.png') },
    { id: '3', name: 'Sharjah', image: require('../../assets/images/sharjah.png') },
    { id: '4', name: 'Ajman', image: require('../../assets/images/ajman.png') },
  ];

  // const fetchServices = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch('https://uberevisa.com/api/categories');
  //     const data = await response.json();
  //     const items = Array.isArray(data?.data) ? data.data : [];

  //     const isPartner = user?.isPartner === true;
  //     const isApproved = user?.partnerApproved === true;

  //     const finalItems =
  //       isPartner && isApproved
  //         ? items
  //         : items.filter((item: any) => {
  //           const name = item?.name?.toLowerCase?.();
  //           return name === 'visit visa' || name === 'pick & drop';
  //         });

  //     // ❌ hide cruise only
  //     const filteredItems = finalItems.filter(
  //       (item: any) => item?.name?.toLowerCase?.() !== 'cruise'
  //     );

  //     const mapped = filteredItems.map((item: any) => {
  //       const name = item.name || 'Unnamed';
  //       let icon = '';

  //       if (item.image && typeof item.image === 'string' && item.image.startsWith('http')) {
  //         icon = item.image;
  //       }

  //       if (name.toLowerCase() === 'visit visa') {
  //         icon =
  //           'https://uberevisa.com/seed/image/faa3d3a7-47c5-4581-beda-799b64bb0f3b_675b6efc-1f05-4f43-95c2-1b26c24dfe3e_HAMID TOURIST VISA-01-08.png';
  //       } else if (name.toLowerCase() === 'pick & drop') {
  //         icon =
  //           'https://uberevisa.com/seed/image/9b032d83-75f1-4b05-9d78-9ae3cbe63846_fda2b440-8f69-4005-b85a-09750baf3146_pick n drop-011.png';
  //       } else if (name.toLowerCase() === 'cruise') {
  //         icon =
  //           'https://uberevisa.com/seed/image/db6523fb-c5cb-4732-9644-2ed9bdd1ef4a_ppnpn-01.png';
  //       } else if (name.toLowerCase() === 'resorts') {
  //         icon =
  //           'https://uberevisa.com/seed/image/fbd5d51a-dcad-454b-a62a-a609c5977d62_car%20resort-03.png';
  //       }

  //       return {
  //         id: item?.Id?.toString() ?? Math.random().toString(),
  //         name,
  //         icon,
  //       };
  //     });

  //     setServices(mapped);
  //   } catch (e) {
  //     setError('Failed to load services');
  //     console.error('Error fetching categories:', e);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handlePress = (name: string) => {
    if (name.toLowerCase() === 'visit visa') {
      router.push({ pathname: '/visitVisa', params: { serviceName: name } });
    } else if (name.toLowerCase() === 'pick & drop') {
      //router.push({ pathname: '/bookingForm' });
      router.push('/MapScreen');
    } else if (name.toLowerCase() === 'resorts') {
      router.push('/Resorts');
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await clearUser();

      Toast.show({ type: 'success', text1: 'Logout successful' });
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'top']}>
      <ImageBackground
        source={require('../../assets/images/bg123123-02.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/utravelagency-light.png')}
            style={styles.image}
            resizeMode="contain"
          />
          {user ? (
            <View style={styles.loggedInRow}>
              <Text style={styles.welcomeText}>Hi, {user.firstName} {user.lastName}</Text>
              <Pressable
                style={styles.logoutButton}
                onPress={() => logout()}
              >
                <Feather name="log-out" size={24} color="#333" />
              </Pressable>
            </View>
          ) : (
            <TouchableOpacity onPress={() => router.push('/admin-login')}>
              <Feather name="user" size={24} color="#333" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.contentContainer}>
            <Text style={styles.chooseService}>Looking For Travel{'\n'}Services?</Text>

            {/* {loading ? (
              <ActivityIndicator size="large" />
            ) : error ? (
              <Text>{error}</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalServiceRow}
              >
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
              </ScrollView>
            )} */}

            <Text style={styles.chooseOtherService}>UAE Top Destinations</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              style={{ marginBottom: 0 }}
            >
              {topDestinations.map((dest) => (
                <View key={dest.id} style={styles.destinationCard}>
                  <Image source={dest.image} style={styles.destinationImage} />
                  <View style={styles.textContainer}>
                    <Text style={styles.destinationText}>{dest.name}</Text>

                    <TouchableOpacity
                      style={styles.detailsButton}
                      activeOpacity={0.8}
                      onPress={() => setSoonVisible(true)}
                    >
                      <Text style={styles.detailsButtonText}>View Details</Text>
                    </TouchableOpacity>

                  </View>
                </View>
              ))}
            </ScrollView>

            <Modal
              transparent
              animationType="fade"
              visible={soonVisible}
              onRequestClose={() => setSoonVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <View style={styles.iconWrapper}>
                    <Feather name="clock" size={42} color="#cc3093" />
                  </View>

                  <Text style={styles.modalTitle}>Coming Soon</Text>

                  <Text style={styles.modalText}>
                    This feature will be available soon.{'\n'}
                    Stay connected 🚀
                  </Text>

                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setSoonVisible(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalButtonText}>Got it</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* OTHER SERVICES */}
            <Text style={styles.chooseOtherService}>Other Services</Text>
            {otherServices.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.serviceCard}
                onPress={() => handleStaticPress(item.route)}
              >
                <Image source={item.icon} style={styles.icon} />
                <Text style={styles.serviceText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

export default observer(HomeScreen);

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { paddingTop: 20, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  image: { width: 160, height: 60 },
  loggedInRow: { flexDirection: 'row', alignItems: 'center' },
  welcomeText: {
    fontSize: 16,
    marginRight: 8,
    fontWeight: '600',
    color: '#333',
  },
  logoutButton: { padding: 4 },
  contentContainer: { paddingHorizontal: 20, alignItems: 'flex-start', width: '100%' },
  chooseService: {
    fontFamily: 'PentaRounded-SemiBold',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    lineHeight: 34,
  },
  horizontalServiceRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  chooseOtherService: {
    fontFamily: 'PentaRounded-SemiBold',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    lineHeight: 30,
  },
  serviceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
    rowGap: 10,
    columnGap: 10,
  },
  serviceCard: {
    width: 120,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    elevation: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  shimmerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
    rowGap: 10,
    columnGap: 10,
  },
  shimmerCard: {
    width: 120,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  icon: { width: 64, height: 64 },
  serviceText: {
    marginTop: 8,
    fontWeight: '500',
    fontSize: 15,
    fontFamily: 'PentaRounded-SemiBold',
  },
  destinationCard: {
    width: 280,
    height: 350,
    marginRight: 20,
    marginBottom: 15,
    borderRadius: 20,
    backgroundColor: '#fff',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    // Android elevation
    elevation: 8,
    overflow: 'hidden',
  },

  destinationImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  textContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    justifyContent: 'space-between',
  },

  destinationText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    fontFamily: 'PentaRounded-SemiBold',
    marginBottom: 10,
  },

  detailsButton: {
    backgroundColor: '#cc3093',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // shadow for button
    shadowColor: '#cc3093',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },

  detailsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fbe6f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 10,
    fontFamily: 'PentaRounded-SemiBold',
  },

  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },

  modalButton: {
    backgroundColor: '#cc3093',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 14,
    shadowColor: '#cc3093',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },

  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});