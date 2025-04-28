import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MenuBar from "../components/MenuBar";

export default function FilterScreen({ navigation }) {
  // State for filter switches
  const [distanceEnabled, setDistanceEnabled] = useState(true);
  const [networkEnabled, setNetworkEnabled] = useState(true);
  const [bountyEnabled, setBountyEnabled] = useState(false);
  const [ratingEnabled, setRatingEnabled] = useState(true);

  // State for filter values
  const [distance, setDistance] = useState(15);
  const [network, setNetwork] = useState(4);
  const [bounty, setBounty] = useState("Any");
  const [rating, setRating] = useState(4);

  // State for modals
  const [distanceModalVisible, setDistanceModalVisible] = useState(false);
  const [networkModalVisible, setNetworkModalVisible] = useState(false);
  const [bountyModalVisible, setBountyModalVisible] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);

  // Distance options
  const distanceOptions = [5, 10, 15, 25, 50, 100];
  
  // Network options
  const networkOptions = [1, 2, 3, 4, 5];
  
  // Bounty options
  const bountyOptions = ["Any", "Low", "Medium", "High"];
  
  // Rating options
  const ratingOptions = ["> 1", "> 2", "> 3", "> 4", "> 4.5"];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Filters</Text>
      </View>

      {/* Filter Content */}
      <ScrollView style={styles.filterContent} contentContainerStyle={styles.scrollContent}>
        {/* Distance Filter */}
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Distance</Text>
          <Text style={[styles.filterValue, !distanceEnabled && styles.disabledText]}>{distance} mi</Text>
          <TouchableOpacity 
            style={[styles.circleButton, !distanceEnabled && styles.disabledButton]}
            onPress={() => distanceEnabled && setDistanceModalVisible(true)}
            disabled={!distanceEnabled}
          >
            <Ionicons name="chevron-down" size={24} color={distanceEnabled ? "black" : "#ccc"} />
          </TouchableOpacity>
          <Switch
            value={distanceEnabled}
            onValueChange={setDistanceEnabled}
            trackColor={{ false: "#eee", true: "#222" }}
            thumbColor={distanceEnabled ? "#fff" : "#fff"}
            style={styles.switch}
          />
        </View>

        {/* Network Filter */}
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Network</Text>
          <View style={styles.filterValueContainer}>
            <Text style={[styles.filterValue, !networkEnabled && styles.disabledText]}>{network}</Text>
            {networkEnabled && (
              <View style={styles.ratingIndicator}>
                <View style={styles.ratingLine}></View>
                <View style={styles.ratingDot}></View>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={[styles.circleButton, !networkEnabled && styles.disabledButton]}
            onPress={() => networkEnabled && setNetworkModalVisible(true)}
            disabled={!networkEnabled}
          >
            <Ionicons name="chevron-down" size={24} color={networkEnabled ? "black" : "#ccc"} />
          </TouchableOpacity>
          <Switch
            value={networkEnabled}
            onValueChange={setNetworkEnabled}
            trackColor={{ false: "#eee", true: "#222" }}
            thumbColor={networkEnabled ? "#fff" : "#fff"}
            style={styles.switch}
          />
        </View>

        {/* Bounty Filter */}
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Bounty</Text>
          <Text style={[styles.filterValue, !bountyEnabled && styles.disabledText]}>{bounty}</Text>
          <TouchableOpacity 
            style={[styles.circleButton, !bountyEnabled && styles.disabledButton]}
            onPress={() => bountyEnabled && setBountyModalVisible(true)}
            disabled={!bountyEnabled}
          >
            <Ionicons name="chevron-down" size={24} color={bountyEnabled ? "black" : "#ccc"} />
          </TouchableOpacity>
          <Switch
            value={bountyEnabled}
            onValueChange={setBountyEnabled}
            trackColor={{ false: "#eee", true: "#222" }}
            thumbColor={bountyEnabled ? "#fff" : "#fff"}
            style={styles.switch}
          />
        </View>

        {/* Rating Filter */}
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Rating</Text>
          <View style={styles.filterValueContainer}>
            <Text style={[styles.filterValue, !ratingEnabled && styles.disabledText]}>{"> " + rating}</Text>
            {ratingEnabled && <View style={styles.ratingDot}></View>}
          </View>
          <TouchableOpacity 
            style={[styles.circleButton, !ratingEnabled && styles.disabledButton]}
            onPress={() => ratingEnabled && setRatingModalVisible(true)}
            disabled={!ratingEnabled}
          >
            <Ionicons name="chevron-down" size={24} color={ratingEnabled ? "black" : "#ccc"} />
          </TouchableOpacity>
          <Switch
            value={ratingEnabled}
            onValueChange={setRatingEnabled}
            trackColor={{ false: "#eee", true: "#222" }}
            thumbColor={ratingEnabled ? "#fff" : "#fff"}
            style={styles.switch}
          />
        </View>

        {/* Banner Ad */}
        <View style={styles.bannerAd}>
          <Text style={styles.bannerAdText}>Relevant Banner Ad</Text>
        </View>
      </ScrollView>

      {/* Distance Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={distanceModalVisible}
        onRequestClose={() => setDistanceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Distance</Text>
            <FlatList
              data={distanceOptions}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionItem, distance === item && styles.selectedOption]}
                  onPress={() => {
                    setDistance(item);
                    setDistanceModalVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item} mi</Text>
                  {distance === item && (
                    <Ionicons name="checkmark" size={24} color="#9C45F7" />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setDistanceModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Network Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={networkModalVisible}
        onRequestClose={() => setNetworkModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Network Level</Text>
            <FlatList
              data={networkOptions}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionItem, network === item && styles.selectedOption]}
                  onPress={() => {
                    setNetwork(item);
                    setNetworkModalVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item}</Text>
                  {network === item && (
                    <Ionicons name="checkmark" size={24} color="#9C45F7" />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setNetworkModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bounty Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={bountyModalVisible}
        onRequestClose={() => setBountyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Bounty Level</Text>
            <FlatList
              data={bountyOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionItem, bounty === item && styles.selectedOption]}
                  onPress={() => {
                    setBounty(item);
                    setBountyModalVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item}</Text>
                  {bounty === item && (
                    <Ionicons name="checkmark" size={24} color="#9C45F7" />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setBountyModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rating Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={ratingModalVisible}
        onRequestClose={() => setRatingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Minimum Rating</Text>
            <FlatList
              data={ratingOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const numValue = parseFloat(item.replace("> ", ""));
                return (
                  <TouchableOpacity
                    style={[styles.optionItem, rating === numValue && styles.selectedOption]}
                    onPress={() => {
                      setRating(numValue);
                      setRatingModalVisible(false);
                    }}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                    {rating === numValue && (
                      <Ionicons name="checkmark" size={24} color="#9C45F7" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setRatingModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Menu Bar */}
      <MenuBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#9C45F7",  // Match the bright purple color
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },
  headerText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  filterContent: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80, // Extra space for the MenuBar
  },
  filterItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  filterValue: {
    fontSize: 16,
    marginRight: 20,
    color: "#333",
  },
  disabledText: {
    color: "#ccc",
  },
  filterValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  ratingLine: {
    width: 24,
    height: 2,
    backgroundColor: "#FFD700",
  },
  ratingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFD700",
    marginLeft: -6,
  },
  circleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  disabledButton: {
    borderColor: "#ccc",
  },
  switch: {
    transform: [{ scale: 1.2 }],
  },
  bannerAd: {
    backgroundColor: "#e0e0e0",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 15,
  },
  bannerAdText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    width: "100%",
  },
  selectedOption: {
    backgroundColor: "#f9f9f9",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#333",
  }
});