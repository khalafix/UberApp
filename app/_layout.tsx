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

enableScreens();
export default function RootLayout() {
 const [fontsLoaded, setFontsLoaded] = useState(false);
useEffect(() => {
    Font.loadAsync({
    'PentaRounded-SemiBold': require('../assets/fonts/penta-rounded-semibold.ttf'),
      'Byom-Bold': require('../assets/fonts/Byom-BoldTrial.ttf'),
      'Byom-Regular': require('../assets/fonts/Byom-RegularTrial.ttf'),
      'PentaRounded-light': require('../assets/fonts/penta-rounded-light.ttf'),

    }).then(() => setFontsLoaded(true));
  }, []);
  const colorScheme = useColorScheme();


  return (
    
    <StoreContext.Provider value={store}>
      <StripeProvider
        publishableKey="pk_live_51RCmC8CrP5KnRd87a3r2xKsmQyOWHeFYYLkLupCGGhcZ5GBU0GQcFF6xefhY35lPeZqg871fZySqyDeVHhrlpbNy00o2VG0Dgj"
      >
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
  );
}