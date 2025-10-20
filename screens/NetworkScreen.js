import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import BottomNavBar from "../components/BottomNavBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDarkMode } from "../contexts/DarkModeContext";

const NetworkScreen = ({ navigation }) => {
  const { darkMode } = useDarkMode();
  const [storageData, setStorageData] = useState([]);

  console.log("In NetworkScreen");

  useEffect(() => {
    const loadAsyncStorage = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const stores = await AsyncStorage.multiGet(keys);
        setStorageData(stores);
      } catch (e) {
        setStorageData([["error", e.message]]);
      }
    };
    loadAsyncStorage();
  }, []);

  return (
    <View style={[styles.pageContainer, darkMode && styles.darkPageContainer]}>
      <SafeAreaView style={[styles.safeArea, darkMode && styles.darkSafeArea]}>
        {/* Header */}
        <View style={[styles.headerBg, darkMode && styles.darkHeaderBg]}>
          <Text style={[styles.header, darkMode && styles.darkHeader]}>Network</Text>
        </View>
        {/* Main Content Card */}
        <ScrollView contentContainerStyle={[styles.contentCard, darkMode && styles.darkContentCard]}>
          {/* AsyncStorage Debug Info */}
          <View style={{ marginTop: 0 }}>
            <Text style={[styles.sectionTitle, darkMode && styles.darkSectionTitle]}>AsyncStorage Contents:</Text>
            {storageData.length === 0 ? (
              <Text style={[styles.noDataText, darkMode && styles.darkNoDataText]}>No data in AsyncStorage.</Text>
            ) : (
              storageData.map(([key, value]) => (
                <View key={key} style={{ marginBottom: 8 }}>
                  <Text style={[styles.keyText, darkMode && styles.darkKeyText]}>{key}:</Text>
                  <Text style={[styles.valueText, darkMode && styles.darkValueText]}>{value}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
        <BottomNavBar navigation={navigation} />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 0,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerBg: {
    backgroundColor: "#8b58f9",
    paddingVertical: 15,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 0,
  },
  header: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  contentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 20,
    marginHorizontal: 6,
    padding: 4,
    flexGrow: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Text styles for dark mode
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  noDataText: {
    color: "#888",
  },
  keyText: {
    fontWeight: "bold",
    color: "#333",
  },
  valueText: {
    color: "#555",
    fontSize: 13,
  },
  loadingText: {
    color: "#888",
  },
  errorText: {
    color: "red",
  },

  // Dark mode styles
  darkPageContainer: {
    backgroundColor: "#1a1a1a",
  },
  darkSafeArea: {
    backgroundColor: "#1a1a1a",
  },
  darkHeaderBg: {
    backgroundColor: "#6b46c1", // Slightly darker purple for dark mode
  },
  darkHeader: {
    color: "#ffffff",
  },
  darkContentCard: {
    backgroundColor: "#2d2d2d",
    shadowColor: "#000",
    shadowOpacity: 0.2,
  },
  darkSectionTitle: {
    color: "#ffffff",
  },
  darkNoDataText: {
    color: "#cccccc",
  },
  darkKeyText: {
    color: "#ffffff",
  },
  darkValueText: {
    color: "#cccccc",
  },
  darkLoadingText: {
    color: "#cccccc",
  },
  darkErrorText: {
    color: "#ff6b6b",
  },
});

export default NetworkScreen;
