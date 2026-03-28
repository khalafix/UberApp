import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserProvider } from '../usercontext/UserContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets(); // <- 👈 get device safe area insets

  return (
    <UserProvider>
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
    </UserProvider>
  );
}