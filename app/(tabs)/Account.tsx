// app/Account.tsx
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useUser } from '../usercontext/UserContext';

function Account() {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const { user, clearUser } = useUser();

  // const handleDeleteAccount = async () => {
  //   console.log("------------User info before delete:", userStore.user);

  //   try {
  //     setLoadingDelete(true);
  //     await deleteAccount();
  //     setDeleteModalVisible(false);
  //     Toast.show({
  //       type: "success",
  //       text1: "Account deleted successfully",
  //     });
  //     router.replace("/");
  //   } catch (error) {
  //     Toast.show({
  //       type: "error",
  //       text1: "Failed to delete account",
  //     });
  //   } finally {
  //     setLoadingDelete(false);
  //   }
  // };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await clearUser();

      Toast.show({ type: 'success', text1: 'Logout successful' });
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      <ImageBackground
        source={require("../../assets/images/bg123123-02.png")}
        style={styles.background}
      >
        <View style={styles.container}>
          {/* Logo at the top */}
          <View style={styles.logoTopWrapper}>
            <Image
              source={require("../../assets/images/utravelagency-light.png")}
              style={styles.logoTop}
              resizeMode="contain"
            />
          </View>

          {/* Profile Card */}
          {user ? (
            <View style={styles.profileCard}>
              <View style={styles.imageWrapper}>
                <Image
                  source={require("../../assets/images/user.png")}
                  style={styles.profileImage}
                  onLoadStart={() => setImageLoaded(false)}
                  onLoadEnd={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                  <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                  </View>
                )}
              </View>

              <View>
                <Text style={styles.nameText}>{user.firstName} {user.lastName}</Text>
                <Text style={styles.emailText}>{user?.email}</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.profileCard, { justifyContent: "center" }]}>
              <Text style={styles.nameTextWelcome}>Welcome Guest</Text>
            </View>
          )}

          <Text style={styles.settingsHeader}>Settings</Text>

          <View style={styles.settingsCard}>
            {user && (
              <>
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => router.push("/customerTransactions")}
                >
                  <Ionicons name="calendar-outline" size={24} color="#4CAF50" />
                  <Text style={styles.settingText}>Booking Details</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
                <View style={styles.rowSeparator} />
              </>
            )}

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push("/Policy")}
            >
              <Ionicons name="shield-checkmark-outline" size={24} color="#2196F3" />
              <Text style={styles.settingText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <View style={styles.rowSeparator} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push("/FAQScreen")}
            >
              <Ionicons name="help-circle-outline" size={24} color="#9C27B0" />
              <Text style={styles.settingText}>FAQ</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <View style={styles.rowSeparator} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push("/Contact")}
            >
              <Ionicons name="call-outline" size={24} color="#009688" />
              <Text style={styles.settingText}>Contact</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <View style={styles.rowSeparator} />

            {/* إذا المستخدم مسجل دخول: عرض Logout و Delete */}
            {user ? (
              <>
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => logout()}
                >
                  <Feather name="log-out" size={24} color="#FF5722" />
                  <Text style={[styles.settingText, { color: "#FF5722" }]}>
                    Logout
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>

                <View style={styles.rowSeparator} />

                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => setDeleteModalVisible(true)}
                >
                  <MaterialIcons name="delete-outline" size={24} color="#E53935" />
                  <Text style={[styles.settingText, { color: "#E53935" }]}>
                    Delete Account
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              </>
            ) : (
              // إذا المستخدم غير مسجل دخول: عرض زر Login
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => router.push("/admin-login")}
              >
                <MaterialIcons name="login" size={24} color="#4CAF50" />
                <Text style={[styles.settingText, { color: "#4CAF50" }]}>Login</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Delete Modal */}
        <Modal transparent visible={deleteModalVisible} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <MaterialIcons name="warning" size={50} color="#E53935" />
              <Text style={styles.modalTitle}>Delete Account?</Text>
              <Text style={styles.modalText}>
                This action is permanent and cannot be undone.
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  //onPress={handleDeleteAccount}
                  disabled={loadingDelete}
                >
                  {loadingDelete ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.deleteText}>Delete</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
}

export default observer(Account);

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 35,
  },

  /* ================= Profile ================= */
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  loaderOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  nameText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  nameTextWelcome: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  emailText: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },

  /* ================= Settings ================= */
  settingsHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
  },
  settingsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
    color: "#333",
  },
  rowSeparator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginLeft: 40,
  },

  /* ================= Modal ================= */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 15,
  },
  modalText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginVertical: 15,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingVertical: 12,
    marginRight: 10,
    alignItems: "center",
  },
  cancelText: {
    color: "#555",
    fontWeight: "600",
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#E53935",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  deleteText: {
    color: "#fff",
    fontWeight: "700",
  },
  logoTopWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },

  logoTop: {
    width: 220,
    height: 100,
  },
});
