import { registerSchemaForEmail, RegisterSchemaForEmail } from "@/lib/schemas/loginSchema";
import { useStore } from "@/stores/store";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from "expo-router";
import { observer } from "mobx-react-lite";
import React, { useRef, useState } from "react";
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Debounce
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const CustomerRegisterScreen = () => {
  const { userStore } = useStore();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const lastCheckedEmailRef = useRef<string | null>(null);
const [loginType, setLoginType] = useState<'customer' | 'admin' | 'partner'>('customer');

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterSchemaForEmail>({
    resolver: zodResolver(registerSchemaForEmail),
    mode: "onTouched",
  });

  const checkEmail = async (value: string) => {
    if (!value.includes("@")) return;
    if (lastCheckedEmailRef.current === value) return;

    const MIN_VISIBLE_TIME = 500;
    const start = Date.now();
    setCheckingEmail(true);

    try {
      const exists = await userStore.checkUserExistsByEmail(value);
      setEmailExists(exists);
      lastCheckedEmailRef.current = value;

      if (exists && !otpSent) {
        setEmail(value);
        const result = await userStore.registerWithEmail({ displayName: "", email: value });
        if (result.status === "success") {
          setOtpSent(true);
          Toast.show({ type: "success", text1: "OTP sent to your email." });
        } else {
          Toast.show({ type: "error", text1: "Error sending OTP." });
        }
      }
    } catch (e) {
      Toast.show({ type: "error", text1: "Failed to check email." });
    } finally {
      const elapsed = Date.now() - start;
      const remaining = MIN_VISIBLE_TIME - elapsed;
      setTimeout(() => setCheckingEmail(false), remaining > 0 ? remaining : 0);
    }
  };

  const debouncedCheckEmail = useRef(debounce(checkEmail, 600)).current;

  const onSubmit = async (data: RegisterSchemaForEmail) => {
    const result = await userStore.registerWithEmail(data);
    if (result.status === "success") {
      setEmail(data.email);
      setOtpSent(true);
      Toast.show({ type: "success", text1: "OTP sent to your email." });
    } else {
      Toast.show({ type: "error", text1: "Error during registration." });
    }
  };

  const handleOtpSubmit = async () => {
    const result = await userStore.login({ email, password: otp });
    if (result.status === "success") {
      Toast.show({ type: "success", text1: "Logged in successfully" });
      //router.back();
      router.replace("/");
    } else {
      Toast.show({ type: "error", text1: "Invalid OTP or login failed." });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'top']}>
      <ImageBackground
        source={require('../assets/images/bg123123-02.png')} // replace with your actual image path
        style={styles.background}
        resizeMode="cover"
      >
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Login</Text>
            <Ionicons name="close" size={24} onPress={() => router.back()} />
          </View>

          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
              <Text style={styles.title}>Register or Login</Text>
              <Text style={styles.subtitle}>
                Enter your email to receive an OTP.
              </Text>
              {otpSent ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter OTP"
                    value={otp}
                    onChangeText={setOtp}
                  />
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleOtpSubmit}
                    disabled={!otp}
                  >
                    <Text style={styles.buttonText}>Verify OTP & Login</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {emailExists === false && (
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      onChangeText={(val) => setValue("displayName", val)}
                    />
                  )}
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={(val) => {
                      setValue("email", val);
                      debouncedCheckEmail(val);
                    }}
                  />
                  {checkingEmail && <ActivityIndicator size="small" color="#999" />}

                  {emailExists === false && (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleSubmit(onSubmit)}
                    >
                      <Text style={styles.buttonText}>Send OTP</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <View style={styles.toggleGroup}>
  {['admin', 'partner'].map((type) => (
    <TouchableOpacity
      key={type}
      style={styles.toggleButton}
      onPress={() => {
        // Redirect based on login type
        if (type === 'admin') {
          router.push('/admin-login');
        } else if (type === 'partner') {
          router.push('/admin-login');
        }
      }}
    >
      <Text style={styles.toggleText}>
        {type.charAt(0).toUpperCase() + type.slice(1)} Login
      </Text>
    </TouchableOpacity>
  ))}
</View>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default observer(CustomerRegisterScreen);

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#f9f9fb',
  },

  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  // 🔹 HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e1e1e',
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 20,
    zIndex: 10,
  },

  // 🔹 TOGGLE BUTTONS
  toggleGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#cc3093',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#cc3093',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffffff',
  },
  toggleTextActive: {
    color: '#fff',
  },

  // 🔹 CARD
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },

  // 🔹 TITLES
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1e1e1e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#707070',
    textAlign: 'center',
    marginBottom: 24,
  },

  // 🔹 INPUT
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    backgroundColor: '#fff',
    fontSize: 15,
    color: '#333',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },

  // 🔹 BUTTON
  button: {
    backgroundColor: '#cc3093',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#cc3093',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Byom-Bold',
    letterSpacing: 0.3,
  },
});