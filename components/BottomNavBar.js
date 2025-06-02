import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

const BottomNavBar = ({ navigation }) => {
  return (
    <View style={styles.navContainer}>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Profile")}>
        <Image source={require("../assets/profile.png")} style={styles.navIcon} />
        <Text style={styles.navLabel}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Settings")}>
        <Image source={require("../assets/setting.png")} style={styles.navIcon} />
        <Text style={styles.navLabel}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Home")}>
        <Image source={require("../assets/pillar.png")} style={styles.navIcon} />
        <Text style={styles.navLabel}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Network")}>
        <Image source={require("../assets/share.png")} style={styles.navIcon} />
        <Text style={styles.navLabel}>Share</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Search")}>
        <Image source={require("../assets/search.png")} style={styles.navIcon} />
        <Text style={styles.navLabel}>Search</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
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

export default BottomNavBar;
