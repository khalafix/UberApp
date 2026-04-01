import { useColorScheme } from '@/hooks/useColorScheme';
import { store, StoreContext } from '@/stores/store';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { enableScreens } from 'react-native-screens';
import Toast from 'react-native-toast-message';
import { toastConfig } from './toastConfig';
import { UserProvider } from './usercontext/UserContext';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Dimensions, PixelRatio } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import * as RNLocalize from 'react-native-localize';

enableScreens();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    Font.loadAsync({
      'PentaRounded-SemiBold': require('../assets/fonts/penta-rounded-semibold.ttf'),
      'Byom-Bold': require('../assets/fonts/Byom-BoldTrial.ttf'),
      'Byom-Regular': require('../assets/fonts/Byom-RegularTrial.ttf'),
      'PentaRounded-light': require('../assets/fonts/penta-rounded-light.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

  // ✅ First Launch & Device Info
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const alreadyLaunched = await AsyncStorage.getItem('alreadyLaunched');
        if (alreadyLaunched === null) {
          await AsyncStorage.setItem('alreadyLaunched', 'true');
          console.log('🔥 First Launch Detected');
          collectDeviceInfo();
        } else {
          console.log('App opened before');
        }
      } catch (e) {
        console.log('Error checking first launch:', e);
      }
    };

    const collectDeviceInfo = async () => {
      try {
        const ipRes = await axios.get('https://ipwhois.app/json/');
        const { width, height } = Dimensions.get('window');

        const deviceData = {
          ip: ipRes.data.ip,
          country: ipRes.data.country,
          city: ipRes.data.city,
          region: ipRes.data.region,
          userAgent: await DeviceInfo.getUserAgent(),
          deviceModel: DeviceInfo.getModel(),
          manufacturer: await DeviceInfo.getManufacturer(),
          os: DeviceInfo.getSystemName(),
          osVersion: DeviceInfo.getSystemVersion(),
          screen: { width, height, density: PixelRatio.get() },
          language: RNLocalize.getLocales()[0].languageTag,
          timezone: RNLocalize.getTimeZone(),
        };

        console.log('🚀 DEVICE INFO:', JSON.stringify(deviceData, null, 2));
        // 🔥 Later: send to API
        // await axios.post('https://your-api.com/device', deviceData);

      } catch (err) {
        console.log('Error collecting device info:', err);
      }
    };

    checkFirstLaunch();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <UserProvider>
      <StoreContext.Provider value={store}>
        <StripeProvider publishableKey="pk_live_51RCmC8CrP5KnRd87a3r2xKsmQyOWHeFYYLkLupCGGhcZ5GBU0GQcFF6xefhY35lPeZqg871fZySqyDeVHhrlpbNy00o2VG0Dgj">
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="SplashScreen" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Toast config={toastConfig} />
          </ThemeProvider>
        </StripeProvider>
      </StoreContext.Provider>
    </UserProvider>
  );
}