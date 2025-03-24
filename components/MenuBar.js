import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useNavigation } from "../contexts/NavigationContext";

export default function MenuBar() {
  const { navigateTo } = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigateTo("Profile")} style={styles.iconContainer}>
        <Image source={require("../assets/icons/profile.png")} style={styles.icon} resizeMode='contain' />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigateTo("Settings")} style={styles.iconContainer}>
        <Image source={require("../assets/icons/settings.png")} style={styles.icon} resizeMode='contain' />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigateTo("Account")} style={styles.iconContainer}>
        <Image source={require("../assets/icons/account.png")} style={styles.icon} resizeMode='contain' />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigateTo("Network")} style={styles.iconContainer}>
        <Image source={require("../assets/icons/network.png")} style={styles.icon} resizeMode='contain' />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigateTo("Search")} style={styles.iconContainer}>
        <Image source={require("../assets/icons/search.png")} style={styles.icon} resizeMode='contain' />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
  icon: {
    width: 24,
    height: 24,
  },
});
