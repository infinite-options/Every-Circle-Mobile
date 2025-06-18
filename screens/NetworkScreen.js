import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import BottomNavBar from "../components/BottomNavBar";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NetworkScreen = ({ navigation }) => {
  const [storageData, setStorageData] = useState([]);

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
    <View style={styles.pageContainer}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Network</Text>
        </View>

        <View style={styles.content}>
          <Text>Fast Router</Text>
        </View>

        {/* AsyncStorage Debug Info */}
        <View style={{ marginTop: 30 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>AsyncStorage Contents:</Text>
          {storageData.length === 0 ? (
            <Text style={{ color: '#888' }}>No data in AsyncStorage.</Text>
          ) : (
            storageData.map(([key, value]) => (
              <View key={key} style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', color: '#333' }}>{key}:</Text>
                <Text style={{ color: '#555', fontSize: 13 }}>{value}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingTop: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  navButton: {
    alignItems: "center",
  },
  navIcon: {
    width: 25,
    height: 25,
  },
  navLabel: {
    fontSize: 12,
    color: "#333",
    marginTop: 4,
  },
});

export default NetworkScreen;
