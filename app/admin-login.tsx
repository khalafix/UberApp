import { loginSchema, LoginSchema } from "@/lib/schemas/loginSchema";
import { useStore } from "@/stores/store";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
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
import { z } from "zod";

/* Fallback Schema */
const fallbackSchema = z.object({
  email: z.string().email("Invalid email").nonempty("Email is required"),
  password: z.string().nonempty("Password is required"),
});

const AdminLogin = () => {
  const { userStore } = useStore();
  const [secure, setSecure] = useState(true);

  const {
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema || fallbackSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginSchema) => {
    const result = await userStore.login(data);

    if (result.status === "success") {
      Toast.show({ type: "success", text1: "Login Successful 🎉" });

      const isPartner = userStore.user?.isPartner === true;
      const isApproved = userStore.user?.partnerApproved === true;

      if (isPartner && !isApproved) {
        Toast.show({
          type: "info",
          text1: "Your partner account is under review",
        });
        return;
      }

      router.replace("/");
    } else {
      Toast.show({ type: "error", text1: "Invalid credentials" });
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
          <Text style={styles.subtitle}>Admin Login</Text>

          {/* Email */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(v) => setValue("email", v)}
            />
          </View>
          {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry={secure}
              autoCapitalize="none"
              onChangeText={(v) => setValue("password", v)}
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
            <Text style={styles.error}>{errors.password.message}</Text>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, isSubmitting && styles.disabledBtn]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text style={styles.loginText}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>

          {/* Register */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don’t have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/Login")}>
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

export default observer(AdminLogin);

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
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginVertical: 10,
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
