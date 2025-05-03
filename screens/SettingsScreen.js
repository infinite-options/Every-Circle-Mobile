import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Modal } from "react-native";


export default function SettingsScreen() {
  const navigation = useNavigation();
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [allowCookies, setAllowCookies] = useState(false);
  const [displayEmail, setDisplayEmail] = useState(true);
  const [displayPhoneNumber, setDisplayPhoneNumber] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

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
              <MaterialIcons
                name="notifications"
                size={20}
                style={styles.icon}
                color={darkMode ? "#fff" : "#666"}
              />
              <Text style={[styles.itemText, darkMode && styles.darkItemText]}>
                Allow notifications
              </Text>
            </View>
            <Switch
              value={allowNotifications}
              onValueChange={setAllowNotifications}
              trackColor={{ false: "#ccc", true: "#8b58f9" }}
              thumbColor={allowNotifications ? "#fff" : "#f4f3f4"}
            />
          </View>

          {/* Dark Mode */}
          <View style={[styles.settingItem, darkMode && styles.darkSettingItem]}>
            <View style={styles.itemLabel}>
              <MaterialIcons
                name="brightness-2"
                size={20}
                style={styles.icon}
                color={darkMode ? "#fff" : "#666"}
              />
              <Text style={[styles.itemText, darkMode && styles.darkItemText]}>
                Dark mode
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#ccc", true: "#8b58f9" }}
              thumbColor={darkMode ? "#fff" : "#f4f3f4"}
            />
          </View>

          {/* Allow Cookies */}
          <View style={[styles.settingItem, darkMode && styles.darkSettingItem]}>
            <View style={styles.itemLabel}>
              <MaterialIcons
                name="cookie"
                size={20}
                style={styles.icon}
                color={darkMode ? "#fff" : "#666"}
              />
              <Text style={[styles.itemText, darkMode && styles.darkItemText]}>
                Allow Cookies
              </Text>
            </View>
            <Switch
              value={allowCookies}
              onValueChange={setAllowCookies}
              trackColor={{ false: "#ccc", true: "#8b58f9" }}
              thumbColor={allowCookies ? "#fff" : "#f4f3f4"}
            />
          </View>

          {/* Privacy Policy */}
          <TouchableOpacity
            style={[styles.settingItem, darkMode && styles.darkSettingItem]}
            onPress={() => navigation.navigate("PrivacyPolicy")}
          >
            <View style={styles.itemLabel}>
              <MaterialIcons
                name="privacy-tip"
                size={20}
                style={styles.icon}
                color={darkMode ? "#fff" : "#666"}
              />
              <Text style={[styles.itemText, darkMode && styles.darkItemText]}>
                Privacy Policy
              </Text>
            </View>
          </TouchableOpacity>

          {/* Terms and Conditions */}
          <TouchableOpacity
            style={[styles.settingItem, darkMode && styles.darkSettingItem]}
            onPress={() => navigation.navigate('TermsAndConditions')}
          >
            <View style={styles.itemLabel}>
              <MaterialIcons
                name="description"
                size={20}
                style={styles.icon}
                color={darkMode ? "#fff" : "#666"}
              />
              <Text style={[styles.itemText, darkMode && styles.darkItemText]}>
                Terms and Conditions
              </Text>
            </View>
          </TouchableOpacity>

          {/* Edit User Information */}
          <TouchableOpacity
            style={[styles.settingItem, darkMode && styles.darkSettingItem]}
            onPress={() => navigation.navigate("EditUserInfo")}
          >
            <View style={styles.itemLabel}>
              <MaterialIcons
                name="edit"
                size={20}
                style={styles.icon}
                color={darkMode ? "#fff" : "#666"}
              />
              <Text style={[styles.itemText, darkMode && styles.darkItemText]}>
                Edit User Information
              </Text>
            </View>
          </TouchableOpacity>

          {/* Change Password */}
          <TouchableOpacity
            style={[styles.settingItem, darkMode && styles.darkSettingItem]}
            onPress={() => navigation.navigate("ChangePassword")}
          >
            <View style={styles.itemLabel}>
              <MaterialIcons
                name="lock"
                size={20}
                style={styles.icon}
                color={darkMode ? "#fff" : "#666"}
              />
              <Text style={[styles.itemText, darkMode && styles.darkItemText]}>
                Change Password
              </Text>
            </View>
          </TouchableOpacity>

          {/* Display Email */}
          <View style={[styles.settingItem, darkMode && styles.darkSettingItem]}>
            <View style={styles.itemLabel}>
              <MaterialIcons
                name="email"
                size={20}
                style={styles.icon}
                color={darkMode ? "#fff" : "#666"}
              />
              <Text style={[styles.itemText, darkMode && styles.darkItemText]}>
                Display Email
              </Text>
            </View>
            <Switch
              value={displayEmail}
              onValueChange={setDisplayEmail}
              trackColor={{ false: "#ccc", true: "#8b58f9" }}
              thumbColor={displayEmail ? "#fff" : "#f4f3f4"}
            />
          </View>

          {/* Display Phone Number */}
          <View style={[styles.settingItem, darkMode && styles.darkSettingItem]}>
            <View style={styles.itemLabel}>
              <MaterialIcons
                name="phone"
                size={20}
                style={styles.icon}
                color={darkMode ? "#fff" : "#666"}
              />
              <Text style={[styles.itemText, darkMode && styles.darkItemText]}>
                Display Phone Number
              </Text>
            </View>
            <Switch
              value={displayPhoneNumber}
              onValueChange={setDisplayPhoneNumber}
              trackColor={{ false: "#ccc", true: "#8b58f9" }}
              thumbColor={displayPhoneNumber ? "#fff" : "#f4f3f4"}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Bottom Navigation */}
      <Modal visible={termsModalVisible} transparent={true} animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>
      <Text style={styles.modalText}>IRamya’m </Text>
      <TouchableOpacity onPress={() => setTermsModalVisible(false)} style={styles.closeModalButton}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      <View style={styles.navContainer}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Profile')}>
          <MaterialIcons name="person" size={24} color="#333" />
          <Text style={styles.navLabel}></Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Settings')}>
          <MaterialIcons name="settings" size={24} color="#333" />
          <Text style={styles.navLabel}></Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Home')}>
          <MaterialIcons name="home" size={24} color="#333" />
          <Text style={styles.navLabel}></Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Network')}>
          <MaterialIcons name="share" size={24} color="#333" />
          <Text style={styles.navLabel}></Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Search')}>
          <MaterialIcons name="search" size={24} color="#333" />
          <Text style={styles.navLabel}></Text>
        </TouchableOpacity>
      </View>
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
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  navButton: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
modalBox: { backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center' },
modalText: { fontSize: 18, fontWeight: 'bold' },
closeModalButton: { marginTop: 15, backgroundColor: '#8b58f9', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
closeButtonText: { color: '#fff', fontWeight: 'bold' }

});
