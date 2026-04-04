import AppHeader from "@/components/AppHeader";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    FlatList,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Notification() {

    const [notifications] = useState([
        {
            id: "1",
            title: "Booking Confirmed",
            body: "Your trip to Dubai has been successfully booked.",
            unread: true,
            date: new Date().toISOString(),
        },
        {
            id: "2",
            title: "Payment Received",
            body: "We have received your payment successfully.",
            unread: true,
            date: new Date().toISOString(),
        },
        {
            id: "3",
            title: "Special Offer",
            body: "Get 20% discount on your next travel booking.",
            unread: false,
            date: new Date().toISOString(),
        },
    ]);

    const unreadCount = notifications.filter(n => n.unread).length;

    // 🔥 Smart Date Format (Always show date + time)
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();

        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);

        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        const day = String(date.getDate()).padStart(2, "0");
        const month = date.toLocaleString("en-US", { month: "short" });
        const year = date.getFullYear();

        const isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        const isYesterday =
            date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear();

        if (isToday) {
            return `Today ${hours}:${minutes}`;
        }

        if (isYesterday) {
            return `Yesterday ${hours}:${minutes}`;
        }

        return `${day} ${month} ${year} ${hours}:${minutes}`;
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.85}>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>

                {/* 🔥 Meta Row */}
                <View style={styles.metaRow}>

                    {/* LEFT */}
                    <View style={styles.leftMeta}>
                        <Ionicons name="person-circle-outline" size={16} color="#6B7280" />
                        <Text style={styles.metaText}>Admin</Text>
                    </View>

                    {/* RIGHT */}
                    <View style={styles.rightMeta}>
                        <Ionicons name="time-outline" size={14} color="#9CA3AF" />

                        {/* ✅ Show full date + time */}
                        <Text style={styles.metaTextNoFont}>
                            {formatDate(item.date)}
                        </Text>

                        {!item.unread && (
                            <Ionicons
                                name="eye-outline"
                                size={14}
                                color="#9CA3AF"
                                style={{ marginLeft: 6 }}
                            />
                        )}
                    </View>
                </View>
            </View>

            {/* 🔴 Unread Dot */}
            {item.unread && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
            <ImageBackground
                source={require("../assets/images/bg123123-02.png")}
                style={styles.background}
            >
                <AppHeader
                    title="Notifications"
                    logo={require("../assets/images/utravelagency-light.png")}
                    unreadCount={unreadCount}
                />

                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.container}
                    showsVerticalScrollIndicator={false}
                />
            </ImageBackground>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: "#F3F4F6",
    },

    container: {
        paddingVertical: 20,
        paddingHorizontal: 20,
    },

    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        marginBottom: 14,

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },

    textContainer: {
        flex: 1,
    },

    title: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 4,
        fontFamily: "Byom-Bold",
    },

    body: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 10,
    },

    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    leftMeta: {
        flexDirection: "row",
        alignItems: "center",
    },

    rightMeta: {
        flexDirection: "row",
        alignItems: "center",
    },

    metaText: {
        fontSize: 12,
        color: "#9CA3AF",
        marginLeft: 4,
        fontFamily: "Byom-Regular",
    },

    // ✅ SYSTEM FONT (FIX)
    metaTextNoFont: {
        fontSize: 12,
        color: "#9CA3AF",
        marginLeft: 4,
        // no fontFamily → system font used
    },

    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#CC3093",
        marginLeft: 8,
    },
});