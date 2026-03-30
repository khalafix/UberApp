import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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

type RegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  phonenumber: string;
};

const Register = () => {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>();

  // 🔐 Generate password
  const generateRandomPassword = () => {
    return "Aa@" + Math.random().toString(36).slice(-8);
  };

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);

    try {
      const randomPassword = generateRandomPassword();

      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phonenumber,
        username: data.phonenumber,
        password: randomPassword,
        confirmPassword: randomPassword,
      };

      const res = await fetch(
        `${NEXT_PUBLIC_API_BASE_URL_NEW}register/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        Toast.show({
          type: "error",
          text1: json?.message || "Registration failed",
        });
        return;
      }

      if (json?.token) {
        await AsyncStorage.setItem("token", json.token);
      }

      Toast.show({
        type: "success",
        text1: "Account created 🎉",
        text2: `Password: ${randomPassword}`,
      });

      router.replace("/admin-login");
    } catch (err) {
      console.log(err);
      Toast.show({ type: "error", text1: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Create Account ✨</Text>

          {/* First Name */}
          <Controller
            control={control}
            name="firstName"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          {errors.firstName && (
            <Text style={styles.error}>This field is required</Text>
          )}

          {/* Last Name */}
          <Controller
            control={control}
            name="lastName"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          {errors.lastName && (
            <Text style={styles.error}>This field is required</Text>
          )}

          {/* Email */}
          <Controller
            control={control}
            name="email"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          {errors.email && (
            <Text style={styles.error}>This field is required</Text>
          )}

          {/* Phone */}
          <Controller
            control={control}
            name="phonenumber"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          {errors.phonenumber && (
            <Text style={styles.error}>This field is required</Text>
          )}

          {/* Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.disabledBtn]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            <Text style={styles.loginText}>
              {loading ? "Creating..." : "Register"}
            </Text>
          </TouchableOpacity>

          {/* Login */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/admin-login")}>
              <Text style={styles.registerLink}> Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default Register;

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