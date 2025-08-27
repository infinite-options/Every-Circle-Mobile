import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, SafeAreaView, ScrollView, Alert, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import BottomNavBar from "../components/BottomNavBar";
// import QRCode from "react-native-qrcode-svg";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, profile_uid } = route.params || {};
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [allowCookies, setAllowCookies] = useState(false);
  const [displayEmail, setDisplayEmail] = useState(true);
  const [displayPhoneNumber, setDisplayPhoneNumber] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  console.log("In SettingsScreen");

  // on mount, pull saved values
  useEffect(() => {
    // console.log('In SettingsScreen');
    (async () => {
      const e = await AsyncStorage.getItem("displayEmail");
      const p = await AsyncStorage.getItem("displayPhone");
      if (e !== null) setDisplayEmail(JSON.parse(e));
      if (p !== null) setDisplayPhoneNumber(JSON.parse(p));
    })();
  }, []);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

  const handleLogout = async () => {
    console.log("SettingsScreen.js - Logout Button pressed ==> handleLogout called");
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // Sign out from Google
            const isSignedIn = await GoogleSignin.isSignedIn();
            if (isSignedIn) {
              await GoogleSignin.signOut();
            }

            // Get all keys to clear Apple authentication data
            const allKeys = await AsyncStorage.getAllKeys();
            const appleKeys = allKeys.filter((key) => key.startsWith("apple_"));

            // Clear all stored data - comprehensive cleanup
            const keysToRemove = [
              // User authentication data
              "user_uid",
              "user_email_id",
              "profile_uid",
              "user_id",
              "user_name",

              // User profile data
              "user_email",
              "user_first_name",
              "user_last_name",
              "user_phone_number",

              // Settings
              "displayEmail",
              "displayPhone",

              // Business data
              "businessFormData",

              // Cart data (all cart keys)
              ...allKeys.filter((key) => key.startsWith("cart_")),

              // Ratings data
              "user_ratings_info",

              // Apple authentication data
              ...appleKeys,
            ];

            console.log("SettingsScreen.js - Clearing AsyncStorage keys:", keysToRemove);
            await AsyncStorage.multiRemove(keysToRemove);
            console.log("SettingsScreen.js - AsyncStorage cleared successfully");

            // Navigate to Home screen
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            });
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const handleNavigateProfile = async () => {
    const user_uid = await AsyncStorage.getItem("user_uid");
    if (user_uid) {
      navigation.navigate("Profile", { profile_uid: user_uid });
    } else {
      navigation.navigate("Profile");
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={[styles.safeArea, darkMode && styles.darkContainer]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Settings</Text>
        </View>

        {/* Settings Options */}
        <ScrollView contentContainerStyle={styles.settingsContainer}>
          {/* Allow Notifications */}
          <View style={[styles.settingItem, darkMode && styles.darkSettingItem]}>
            <View style={styles.itemLabel}>
              <MaterialIcons name='notifications' size={20} style={styles.icon} color={darkMode ? "#fff" : "#666"} />
              <Text style={[styles.itemText, darkMode && styles.darkItemText]}>Allow notifications</Text>
            </View>
            <Switch value={allowNotifications} onValueChange={setAllowNotifications} trackColor={{ false: "#ccc", true: "#8b58f9" }} thumbColor={allowNotifications ? "#fff" : "#f4f3f4"} />
          </View>

          {/* Dark Mode */}
          <View style={[styles.settingItem, darkMode && styles.darkSettingItem]}>
            <View style={styles.itemLabel}>
              <MaterialIcons name='brightness-2' size={20} style={styles.icon} color={darkMode ? "#fff" : "#666"} />
              <Text style={[styles.itemText, darkMode && styles.darkItemText]}>Dark mode</Text>
            </View>
            <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: "#ccc", true: "#8b58f9" }} thumbColor={darkMode ? "#fff" : "#f4f3f4"} />
          </View>

          {/* Allow Cookies */}
          <View style={[styles.settingItem, darkMode && styles.darkSettingItem]}>
            <View style={styles.itemLabel}>
              <MaterialIcons name='cookie' size={20} style={styles.icon} color={darkMode ? "#fff" : "#666"} />
              <Text style={[styles.itemText, darkMode && styles.darkItemText]}>Allow Cookies</Text>
            </View>
            <Switch value={allowCookies} onValueChange={setAllowCookies} trackColor={{ false: "#ccc", true: "#8b58f9" }} thumbColor={allowCookies ? "#fff" : "#f4f3f4"} />
          </View>

          {/* Generate QR Code */}
          <TouchableOpacity style={[styles.settingItem, darkMode && styles.darkSettingItem]} onPress={() => setQrModalVisible(true)}>
            <View style={styles.itemLabel}>
              <MaterialIcons name='qr-code' size={20} style={styles.icon} color={darkMode ? "#fff" : "#666"} />
              <Text style={[styles.itemText, darkMode && styles.darkItemText]}>Generate QR Code</Text>
            </View>
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity style={[styles.settingItem, darkMode && styles.darkSettingItem]} onPress={() => navigation.navigate("PrivacyPolicy")}>
            <View style={styles.itemLabel}>
              <MaterialIcons name='privacy-tip' size={20} style={styles.icon} color={darkMode ? "#fff" : "#666"} />
              <Text style={[styles.itemText, darkMode && styles.darkItemText]}>Privacy Policy</Text>
            </View>
          </TouchableOpacity>

          {/* Terms and Conditions */}
          <TouchableOpacity style={[styles.settingItem, darkMode && styles.darkSettingItem]} onPress={() => navigation.navigate("TermsAndConditions")}>
            <View style={styles.itemLabel}>
              <MaterialIcons name='description' size={20} style={styles.icon} color={darkMode ? "#fff" : "#666"} />
              <Text style={[styles.itemText, darkMode && styles.darkItemText]}>Terms and Conditions</Text>
            </View>
          </TouchableOpacity>

          {/* Edit User Information */}
          <TouchableOpacity style={[styles.settingItem, darkMode && styles.darkSettingItem]} onPress={() => navigation.navigate("BusinessSetup")}>
            <View style={styles.itemLabel}>
              <MaterialIcons name='business' size={20} style={styles.icon} color={darkMode ? "#fff" : "#666"} />
              <Text style={[styles.itemText, darkMode && styles.darkItemText]}>Add a Business</Text>
            </View>
          </TouchableOpacity>

          {/* Change Password */}
          <TouchableOpacity style={[styles.settingItem, darkMode && styles.darkSettingItem]} onPress={() => navigation.navigate("ChangePassword")}>
            <View style={styles.itemLabel}>
              <MaterialIcons name='lock' size={20} style={styles.icon} color={darkMode ? "#fff" : "#666"} />
              <Text style={[styles.itemText, darkMode && styles.darkItemText]}>Change Password</Text>
            </View>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity style={[styles.logoutButton, darkMode && styles.darkLogoutButton]} onPress={handleLogout}>
            <MaterialIcons name='logout' size={20} style={styles.icon} color={darkMode ? "#fff" : "#FF3B30"} />
            <Text style={[styles.logoutText, darkMode && styles.darkLogoutText]}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* QR Code Modal */}
      <Modal visible={qrModalVisible} transparent={true} animationType='fade'>
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalBox}>
            <Text style={styles.qrModalTitle}>QR Code</Text>
            <Text style={styles.qrModalSubtitle}>Scan to visit Infinite Options</Text>
            <View style={styles.qrCodeContainer}>
              {/* QR Code temporarily disabled due to package resolution issue */}
              <Text style={styles.qrCodePlaceholder}>QR Code</Text>
              <Text style={styles.qrCodePlaceholder}>(Temporarily Disabled)</Text>
            </View>
            <TouchableOpacity onPress={() => setQrModalVisible(false)} style={styles.closeModalButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <Modal visible={termsModalVisible} transparent={true} animationType='fade'>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}></Text>
            <TouchableOpacity onPress={() => setTermsModalVisible(false)} style={styles.closeModalButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  darkContainer: {
    backgroundColor: "#222",
  },
  header: {
    backgroundColor: "#8b58f9",
    paddingVertical: 15,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  settingsContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  settingItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  darkSettingItem: {
    backgroundColor: "#333",
  },
  itemLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  darkItemText: {
    color: "#fff",
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#fff", padding: 20, borderRadius: 10, alignItems: "center" },
  modalText: { fontSize: 18, fontWeight: "bold" },
  closeModalButton: { marginTop: 15, backgroundColor: "#8b58f9", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  closeButtonText: { color: "#fff", fontWeight: "bold" },
  qrCodePlaceholder: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginVertical: 5,
  },
  logoutButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  darkLogoutButton: {
    backgroundColor: "#333",
    borderColor: "#FF3B30",
  },
  logoutText: {
    fontSize: 16,
    color: "#FF3B30",
    marginLeft: 10,
  },
  darkLogoutText: {
    color: "#FF3B30",
  },
  qrModalBox: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
    minWidth: 300,
  },
  qrModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  qrModalSubtitle: {
    fontSize: 16,
    marginBottom: 25,
    color: "#666",
    textAlign: "center",
  },
  qrCodeContainer: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
  },
});
