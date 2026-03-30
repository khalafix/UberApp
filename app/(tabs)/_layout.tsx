import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NEXT_PUBLIC_API_BASE_URL_NEW } from '../environment';
import { useUser } from '../usercontext/UserContext';

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

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [storedToken, setStoredToken] = useState<string | null>(null);

  // Load local token
  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('token');
      setStoredToken(token);
    };
    loadToken();
  }, []);

  useEffect(() => {
    if (!user?.username) return;

    const setupFCM = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      // Android channel
      await createAndroidChannel();

      // Request permissions
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) return;

      // Get FCM token
      const fcmToken = await messaging().getToken();
      console.log('🔥 FCM TOKEN:', fcmToken);

      // Send token to backend
      await fetch(`${NEXT_PUBLIC_API_BASE_URL_NEW}notifications/${user.username}`, {
        method: 'POST',
        headers: {
          'fcm-token': fcmToken,
        },
      });
    };

    setupFCM();

    // Foreground messages
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('📩 Foreground message:', remoteMessage);

      if (remoteMessage.notification) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification.title || 'No title',
            body: remoteMessage.notification.body || 'No body',
            sound: 'default',
          },
          trigger: null, // show immediately
        });
      }
    });

    // Background messages
    const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('📲 Opened from background:', remoteMessage);
    });

    // App killed (cold start)
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('🚀 Opened from quit:', remoteMessage);
      }
    });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }, [user]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#cc3093',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 60 + insets.bottom, // 👈 Add safe area bottom inset
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: insets.bottom, // 👈 Respect bottom safe area
          paddingTop: 6,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
          fontFamily: 'PentaRounded-SemiBold',
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              borderTopWidth: focused ? 3 : 0,
              borderTopColor: '#cc3093',
              width: '100%',
              paddingTop: 2,
            }}>
              <Ionicons name="home-outline" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="Track"
        options={{
          title: 'Track',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              borderTopWidth: focused ? 3 : 0,
              borderTopColor: '#cc3093',
              width: '100%',
              paddingTop: 2,
            }}>
              <Ionicons name="search-outline" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="Account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              borderTopWidth: focused ? 3 : 0,
              borderTopColor: '#cc3093',
              width: '100%',
              paddingTop: 2,
            }}>
              <Ionicons name="person-outline" size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}