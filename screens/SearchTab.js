import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function SearchTab() {
  const navigation = useNavigation();

  const centerCompany = {
    id: "center",
    name: "Speedy Roto",
    rating: 4,
    color: "#F4A900",
  };

  const connections = [
    { id: "1", type: "1 Away", color: "#3F8CFF", position: { x: -65, y: -240 } },
    { id: "2", type: "Direct", color: "#F4A900", position: { x: -95, y: -150 } },
    { id: "3", type: "Direct", color: "#F4A900", position: { x: 20, y: -180 } },
    { id: "4", type: "1 Away", color: "#F4A900", position: { x: 100, y: -230 } },
    { id: "5", type: "Direct", color: "#3F8CFF", position: { x: 120, y: -120 } },
    { id: "6", type: "Direct", color: "#F4A900", position: { x: 140, y: 0 } },
    { id: "7", type: "Direct", color: "#3F8CFF", position: { x: 120, y: 100 } },
    { id: "8", type: "1 Away", color: "#F4A900", position: { x: 130, y: 180 } },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <View style={styles.networkContainer}>
          {/* Connection lines */}
          {connections.map((node) => (
            <View
              key={`line-${node.id}`}
              style={[
                styles.connectionLine,
                {
                  width: Math.sqrt(Math.pow(node.position.x, 2) + Math.pow(node.position.y, 2)),
                  left: windowWidth / 2,
                  top: windowHeight / 2 - 170,
                  transform: [
                    {
                      rotate: `${Math.atan2(node.position.y, node.position.x)}rad`,
                    },
                  ],
                },
              ]}
            />
          ))}

          {/* Center node */}
          <View style={styles.centerCircleContainer}>
            <View style={styles.dollarIconContainer}>
              <Text style={styles.dollarIcon}>$</Text>
            </View>
            <Text style={styles.centerCircleText}>{centerCompany.name}</Text>
            <View style={styles.ratingContainer}>
              {[...Array(centerCompany.rating)].map((_, index) => (
                <View key={index} style={styles.ratingDot} />
              ))}
            </View>
          </View>

          {/* Node circles */}
          {connections.map((node) => (
            <View
              key={`node-${node.id}`}
              style={[
                styles.nodeCircle,
                {
                  backgroundColor: node.color,
                  left: windowWidth / 2 + node.position.x - 30,
                  top: windowHeight / 2 + node.position.y - 200,
                },
              ]}
            >
              <Text style={styles.nodeText}>{node.type}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Banner Ad (moved below graph) */}
      <View style={styles.bannerAd}>
        <Text style={styles.bannerAdText}>Relevant Banner Ad</Text>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.navContainer}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Profile")}>
          <MaterialIcons name="person" size={24} color="#333" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Settings")}>
          <MaterialIcons name="settings" size={24} color="#333" />
          <Text style={styles.navLabel}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Home")}>
          <MaterialIcons name="home" size={24} color="#333" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Share")}>
          <MaterialIcons name="share" size={24} color="#333" />
          <Text style={styles.navLabel}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Search")}>
          <MaterialIcons name="search" size={24} color="#333" />
          <Text style={styles.navLabel}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-between", // pushes banner + nav bar down
  },
  header: {
    backgroundColor: "#9C45F7",
    paddingTop: 50,
    paddingBottom: 80,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    position: "relative",
  },
  networkContainer: {
    flex: 1,
    position: "relative",
  },
  centerCircleContainer: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F4A900",
    left: windowWidth / 2 - 60,
    top: windowHeight / 2 - 230,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  centerCircleText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
    marginTop: 30,
  },
  dollarIconContainer: {
    position: "absolute",
    top: 30,
    width: 15,
    height: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  dollarIcon: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  ratingDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: "#FFFF99",
    marginHorizontal: 2,
  },
  connectionLine: {
    position: "absolute",
    height: 1,
    backgroundColor: "#000",
    transformOrigin: "left center",
    zIndex: 1,
  },
  nodeCircle: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  nodeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  bannerAd: {
    backgroundColor: "#e0e0e0",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  bannerAdText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  navButton: {
    alignItems: "center",
  },
  navLabel: {
    fontSize: 12,
    color: "#333",
    marginTop: 4,
  },
});
