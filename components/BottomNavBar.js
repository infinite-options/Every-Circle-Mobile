import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get('window');

const BottomNavBar = ({ navigation }) => {
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
    position: 'absolute',
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
});

export default BottomNavBar;
