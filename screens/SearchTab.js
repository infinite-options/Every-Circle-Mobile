import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MenuBar from "../components/MenuBar";
import { useNavigation } from "@react-navigation/native";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function SearchTab() {
  const navigation = useNavigation();
  
  // This company will be in the center
  const centerCompany = {
    id: "center",
    name: "Speedy Roto",
    rating: 4,
    color: "#F4A900" // Orange color
  };
  
  // Connected companies (direct and 1-away connections)
  const connections = [
    { id: "1", type: "1 Away", color: "#3F8CFF", position: { x: -65, y: -140 } }, // Blue, top left
    { id: "2", type: "Direct", color: "#F4A900", position: { x: -95, y: -60 } }, // Orange, left
    { id: "3", type: "Direct", color: "#F4A900", position: { x: 0, y: -110 } }, // Orange, top
    { id: "4", type: "1 Away", color: "#F4A900", position: { x: 85, y: -130 } }, // Orange, top right
    { id: "5", type: "Direct", color: "#3F8CFF", position: { x: 105, y: -40 } }, // Blue, right
    { id: "6", type: "Direct", color: "#F4A900", position: { x: 130, y: 20 } }, // Orange, right
    { id: "7", type: "Direct", color: "#3F8CFF", position: { x: 70, y: 90 } }, // Blue, bottom right
    { id: "8", type: "1 Away", color: "#F4A900", position: { x: 10, y: 150 } }, // Orange, bottom
  ];

  return (
    <View style={styles.container}>
      {/* Purple Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Center circle and connections */}
        <View style={styles.networkContainer}>
          {/* Connection lines first (so they're behind the nodes) */}
          {connections.map((node) => (
            <View
              key={`line-${node.id}`}
              style={[
                styles.connectionLine,
                {
                  width: Math.sqrt(Math.pow(node.position.x, 2) + Math.pow(node.position.y, 2)),
                  left: windowWidth / 2,
                  top: windowHeight / 2 - 170, // Adjust to center in the screen area
                  transform: [
                    { 
                      rotate: `${Math.atan2(
                        node.position.y,
                        node.position.x
                      )}rad` 
                    }
                  ]
                }
              ]}
            />
          ))}
          
          {/* Center company circle */}
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
          
          {/* Connection nodes */}
          {connections.map((node) => (
            <View
              key={`node-${node.id}`}
              style={[
                styles.nodeCircle,
                {
                  backgroundColor: node.color,
                  left: windowWidth / 2 + node.position.x - 30, // Adjust for node width
                  top: windowHeight / 2 + node.position.y - 170, // Adjust to center in screen area and node height
                }
              ]}
            >
              <Text style={styles.nodeText}>{node.type}</Text>
            </View>
          ))}
        </View>
        
        {/* Banner Ad */}
        <View style={styles.bannerAd}>
          <Text style={styles.bannerAdText}>Relevant Banner Ad</Text>
        </View>
      </View>

      {/* Bottom Menu Bar */}
      <MenuBar navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    padding: 20,
    paddingTop: 30,
    paddingBottom: 80,
    position: 'relative',
  },
  networkContainer: {
    flex: 1,
    position: 'relative',
  },
  centerCircleContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F4A900",
    left: windowWidth / 2 - 60, // Center horizontally
    top: windowHeight / 2 - 230, // Position center circle
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  centerCircleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  dollarIconContainer: {
    position: 'absolute',
    top: 30,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: 'center',
    justifyContent: 'center',
  },
  dollarIcon: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  ratingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFF99", // Light yellow
    marginHorizontal: 2,
  },
  connectionLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#000',
    transformOrigin: 'left center',
    zIndex: 1,
  },
  nodeCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  nodeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  bannerAd: {
    backgroundColor: "#e0e0e0",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  bannerAdText: {
    fontSize: 16,
    fontWeight: "bold",
  }
});