import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDarkMode } from "../contexts/DarkModeContext";

const { width, height } = Dimensions.get("window");

const BottomNavBar = ({ navigation, onSharePress }) => {
  const { darkMode } = useDarkMode();

  return (
    <SafeAreaView edges={["bottom"]} style={[styles.safeArea, darkMode && styles.darkSafeArea]}>
      <View style={[styles.navContainer, darkMode && styles.darkNavContainer]}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Profile")}>
          <Image source={require("../assets/profile.png")} style={[styles.navIcon, darkMode && styles.darkNavIcon]} />
          <Text style={[styles.navLabel, darkMode && styles.darkNavLabel]}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Settings")}>
          <Image source={require("../assets/setting.png")} style={[styles.navIcon, darkMode && styles.darkNavIcon]} />
          <Text style={[styles.navLabel, darkMode && styles.darkNavLabel]}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Home")}>
          <Image source={require("../assets/pillar.png")} style={[styles.navIcon, darkMode && styles.darkNavIcon]} />
          <Text style={[styles.navLabel, darkMode && styles.darkNavLabel]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            if (onSharePress) onSharePress();
            navigation.navigate("Network");
          }}
        >
          <Image source={require("../assets/share.png")} style={[styles.navIcon, darkMode && styles.darkNavIcon]} />
          <Text style={[styles.navLabel, darkMode && styles.darkNavLabel]}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Search")}>
          <Image source={require("../assets/search.png")} style={[styles.navIcon, darkMode && styles.darkNavIcon]} />
          <Text style={[styles.navLabel, darkMode && styles.darkNavLabel]}>Search</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    width: width,
  },
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    paddingTop: 6,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  navIcon: {
    width: 28,
    height: 28,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 13,
    color: "#222",
    marginTop: 2,
    fontWeight: "400",
    letterSpacing: 0.2,
  },

  // Dark mode styles
  darkSafeArea: {
    backgroundColor: "#1a1a1a",
  },
  darkNavContainer: {
    backgroundColor: "#1a1a1a",
    borderColor: "#404040",
  },
  darkNavLabel: {
    color: "#ffffff",
  },
  darkNavIcon: {
    tintColor: "#ffffff",
  },
});

export default BottomNavBar;
