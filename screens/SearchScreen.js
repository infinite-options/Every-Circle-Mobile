import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import MenuBar from "../components/MenuBar";

export default function SearchScreen() {
  const handleMenuPress = (menuItem) => {
    console.log(`${menuItem} pressed`);
    // Navigation will be implemented in the next step
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Search</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput style={styles.searchInput} placeholder='Search...' placeholderTextColor='#999' />
        </View>

        <View style={styles.content}>
          <Text>Search results will appear here</Text>
        </View>
      </View>

      <MenuBar
        onProfilePress={() => handleMenuPress("Profile")}
        onSettingsPress={() => handleMenuPress("Settings")}
        onAccountPress={() => handleMenuPress("Account")}
        onNetworkPress={() => handleMenuPress("Network")}
        onSearchPress={() => handleMenuPress("Search")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    width: "100%",
  },
  contentContainer: {
    flex: 1,
    paddingTop: 60, // Manual safe area handling
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
});
