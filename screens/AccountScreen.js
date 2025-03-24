import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MenuBar from "../components/MenuBar";

export default function AccountScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Account</Text>
        </View>

        <View style={styles.content}>
          <Text>Account content goes here</Text>
        </View>
      </View>

      <MenuBar />
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
