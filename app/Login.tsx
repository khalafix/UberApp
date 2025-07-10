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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
      router.back();
    } else {
      Toast.show({ type: "error", text1: "Invalid OTP or login failed." });
    }
  };

  return (

              <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom','top']}>


    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>

    </SafeAreaView>
  );
};

export default observer(CustomerRegisterScreen);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
        padding: 10,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderColor: "#eee",
            backgroundColor: "#fff",

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
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#cc3093",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

});
