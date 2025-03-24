import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MenuBar from "../components/MenuBar";

export default function NetworkScreen() {
  const handleMenuPress = (menuItem) => {
    console.log(`${menuItem} pressed`);
    // Navigation will be implemented in the next step
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Network</Text>
        </View>

        <View style={styles.content}>
          <Text>Network content goes here</Text>
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
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
});
