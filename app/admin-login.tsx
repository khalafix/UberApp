import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { NEXT_PUBLIC_API_BASE_URL_NEW } from "./environment";

type LoginForm = {
  username: string;
  password: string;
};

const AdminLogin = () => {
  const [secure, setSecure] = useState(true);

  const {
    register,
    setValue,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    mode: "onTouched",
  });

  // ✅ REGISTER FIELDS (IMPORTANT)
  useEffect(() => {
    register("username", { required: true });
    register("password", { required: true });
  }, [register]);

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await fetch(
        `${NEXT_PUBLIC_API_BASE_URL_NEW}login/authenticate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: data.username,
            password: data.password,
          }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        Toast.show({ type: "error", text1: "Invalid credentials" });
        return;
      }

      await AsyncStorage.setItem("token", json.token);
      console.log("🔥 TOKEN:", json.token);

      await AsyncStorage.setItem("user", JSON.stringify(json));
      await AsyncStorage.setItem("finger_user", JSON.stringify(json));

      Toast.show({ type: "success", text1: "Login Successful 🎉" });

      router.replace("/");
    } catch (err) {
      console.log(err);
      Toast.show({ type: "error", text1: "Something went wrong" });
    }
  };

  // ================= Fingerprint Login =================
  const handleFingerprintLogin = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Toast.show({ type: "error", text1: "No biometric hardware found" });
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Toast.show({ type: "error", text1: "No biometrics enrolled" });
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Login with Fingerprint",
        fallbackLabel: "Enter Password",
      });

      if (result.success) {
        const userData = await AsyncStorage.getItem("finger_user");
        if (!userData) {
          Toast.show({ type: "error", text1: "Please login manually first" });
          return;
        }

        Toast.show({ type: "success", text1: "Login Successful 🎉" });
        router.replace("/");
      } else {
        Toast.show({
          type: "error",
          text1: "Fingerprint Authentication Failed",
        });
      }
    } catch (err) {
      console.log(err);
      Toast.show({ type: "error", text1: "Something went wrong" });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back 👋</Text>

          {/* Username */}
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#aaa"
              autoCapitalize="none"
              onChangeText={(v) =>
                setValue("username", v, { shouldValidate: true })
              }
            />
          </View>
          {errors.username && (
            <Text style={styles.error}>This field is required</Text>
          )}

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry={secure}
              autoCapitalize="none"
              onChangeText={(v) =>
                setValue("password", v, { shouldValidate: true })
              }
            />
            <TouchableOpacity onPress={() => setSecure(!secure)}>
              <Ionicons
                name={secure ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.error}>This field is required</Text>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, isSubmitting && styles.disabledBtn]}
            onPress={handleSubmit(onSubmit, async () => {
              await trigger(); // 🔥 force validation
            })}
            disabled={isSubmitting}
          >
            <Text style={styles.loginText}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>

          {/* Fingerprint Login */}
          <TouchableOpacity
            style={[
              styles.loginBtn,
              {
                backgroundColor: "#4CAF50",
                marginTop: 12,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
            onPress={handleFingerprintLogin}
          >
            <Ionicons
              name="finger-print-outline"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.loginText}>Login with Fingerprint</Text>
          </TouchableOpacity>

          {/* Register */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>
              Don’t have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/Register")}>
              <Text style={styles.registerLink}> Register</Text>
            </TouchableOpacity>
          </View>

          {/* Back */}
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AdminLogin;

/* ================== STYLES ================== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f7f9fc",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 26,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#111827",
  },
  loginBtn: {
    backgroundColor: "#cc3093",
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 24,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  loginText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  registerText: {
    color: "#6b7280",
    fontSize: 14,
  },
  registerLink: {
    color: "#cc3093",
    fontWeight: "600",
    fontSize: 14,
  },
  backText: {
    textAlign: "center",
    marginTop: 16,
    color: "#6b7280",
    fontSize: 14,
  },
  error: {
    color: "#ef4444",
    fontSize: 13,
    marginLeft: 8,
    marginTop: 6,
  },
});