import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Company Logo */}
      <Image
        source={require('../assets/images/utravelagency-light.png')} // adjust path if needed
        style={styles.logoImage}
        resizeMode="contain"
      />
      
      {/* App Name */}
      <Text style={styles.logoText}>Welcome To UTA</Text>

      {/* Spinner */}
      <ActivityIndicator size="large" color="#cc3093" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoImage: {
    width: 180,
    height: 100,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#40403f',
    
  },
});
