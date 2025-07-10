import { useColorScheme } from '@/hooks/useColorScheme';
import { store, StoreContext } from '@/stores/store';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';
import { enableScreens } from 'react-native-screens';
import Toast from 'react-native-toast-message';
import { toastConfig } from './toastConfig';

enableScreens();
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <StoreContext.Provider value={store}>
      <StripeProvider
        publishableKey="pk_test_51RCmC8CrP5KnRd87yL0tvQMXvZn0suHFx9J7wsVDTI6OgYrk9mCaDM0ms6IwYTSsHf4bmWqT43kYYAOB1UHfbhhw00GBwnBOPr"
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