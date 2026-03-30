import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

type ConfirmEmailProps = {
    username: string;
};

const ConfirmEmail: React.FC<ConfirmEmailProps> = ({ username }) => {
    const navigation = useNavigation();

    const handleLogin = () => {
        // Navigate to Login screen
        router.push("/admin-login");
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAwareScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    {/* Mail Icon */}
                    <View style={styles.iconWrapper}>
                        <Ionicons name="mail-outline" size={48} color="#1D4ED8" />
                    </View>

                    {/* Welcome Message */}
                    <Text style={styles.title}>Welcome to Uber Travel Agency!</Text>

                    <Text style={styles.text}>
                        Hi <Text style={styles.bold}>{username}</Text>, thank you for registering.
                    </Text>

                    <Text style={styles.textSecondary}>
                        We have sent a confirmation email to your inbox. Please check your email and click the activation link to activate your account. After activation, you will be able to log in and start using your account.
                    </Text>

                    {/* Login Button */}
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};

export default ConfirmEmail;

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#f7f9fc",
    },
    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    card: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#fff",
        borderRadius: 22,
        paddingVertical: 40,
        paddingHorizontal: 30,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
        alignItems: "center",
    },
    iconWrapper: {
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1f2937",
        textAlign: "center",
        marginBottom: 20,
    },
    text: {
        fontSize: 16,
        color: "#1f2937",
        textAlign: "center",
        marginBottom: 10,
    },
    textSecondary: {
        fontSize: 16,
        color: "#6b7280",
        textAlign: "center",
        marginBottom: 30,
    },
    bold: {
        fontWeight: "700",
        color: "#cc3093",
    },
    loginButton: {
        backgroundColor: "#cc3093",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 12,
        alignItems: "center",
        width: "100%",
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
});