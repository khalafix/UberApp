import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  logo?: any; // require image
  showClose?: boolean;
  unreadCount?: number;
  onClosePress?: () => void;
};

export default function AppHeader({
  title,
  logo,
  showClose = true,
  unreadCount = 0,
  onClosePress,
}: Props) {
  return (
    <View style={styles.header}>
      {/* LEFT SIDE */}
      <View style={styles.leftHeader}>
        {logo && (
          <Image source={logo} style={styles.headerLogo} />
        )}

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.headerTitle}>{title}</Text>

          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* RIGHT ICON */}
      {showClose && (
        <TouchableOpacity onPress={onClosePress || (() => router.back())}>
          <Ionicons name="close" size={28} color="#111827" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderBottomWidth: 0.5,
    borderColor: "#e5e5e5",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerLogo: {
    width: 50,
    height: 50,
    marginRight: 10,
    resizeMode: "contain",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "PentaRounded-SemiBold",
  },

  badge: {
    backgroundColor: "#CC3093",
    marginLeft: 8,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});