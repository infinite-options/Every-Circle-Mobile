import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import BottomNavBar from "../components/BottomNavBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDarkMode } from "../contexts/DarkModeContext";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";

const NetworkScreen = ({ navigation }) => {
  const { darkMode } = useDarkMode();
  const [storageData, setStorageData] = useState([]);
  const [networkData, setNetworkData] = useState([]);
  const [groupedNetwork, setGroupedNetwork] = useState({});
  const [profileUid, setProfileUid] = useState("");
  const [degree, setDegree] = useState("2");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" or "graph"

  useEffect(() => {
    const loadAsyncStorage = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const stores = await AsyncStorage.multiGet(keys);
        setStorageData(stores);

        const profileEntry = stores.find(([key]) => key === "profile_uid");
        if (profileEntry) setProfileUid(profileEntry[1]);
      } catch (e) {
        setStorageData([["error", e.message]]);
      }
    };
    loadAsyncStorage();
  }, []);

  const groupByDegree = (data) => {
    const grouped = {};
    data.forEach((item) => {
      const deg = item.degree || 0;
      if (!grouped[deg]) grouped[deg] = [];
      grouped[deg].push(item);
    });
    return grouped;
  };

  const fetchNetwork = async () => {
    if (!profileUid || !degree) {
      setError("Missing profile UID or degree value");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://192.168.4.51:4090/api/network/${profileUid}/${degree}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setNetworkData(data);
      setGroupedNetwork(groupByDegree(data));
    } catch (err) {
      console.error("Network fetch failed:", err);
      setError("Failed to fetch network data");
    } finally {
      setLoading(false);
    }
  };

  const degreeLabel = (deg) => {
    if (deg === 1) return "1st-Degree Connections";
    if (deg === 2) return "2nd-Degree Connections";
    if (deg === 3) return "3rd-Degree Connections";
    return `${deg}-Degree Connections`;
  };

  return (
    <View style={[styles.pageContainer, darkMode && styles.darkPageContainer]}>
      <SafeAreaView style={[styles.safeArea, darkMode && styles.darkSafeArea]}>
        {/* Header */}
        <View style={[styles.headerBg, darkMode && styles.darkHeaderBg]}>
          <Text style={[styles.header, darkMode && styles.darkHeader]}>
            Network
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.contentCard,
            darkMode && styles.darkContentCard,
          ]}
        >
          {/* AsyncStorage Debug Info */}
          <View>
            <Text
              style={[styles.sectionTitle, darkMode && styles.darkSectionTitle]}
            >
              AsyncStorage Contents:
            </Text>
            {storageData.length === 0 ? (
              <Text
                style={[styles.noDataText, darkMode && styles.darkNoDataText]}
              >
                No data in AsyncStorage.
              </Text>
            ) : (
              storageData.map(([key, value]) => (
                <View key={key} style={{ marginBottom: 8 }}>
                  <Text style={[styles.keyText, darkMode && styles.darkKeyText]}>
                    {key}:
                  </Text>
                  <Text
                    style={[styles.valueText, darkMode && styles.darkValueText]}
                  >
                    {value}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Network Fetch Section */}
          <View style={{ marginTop: 20 }}>
            <Text
              style={[styles.sectionTitle, darkMode && styles.darkSectionTitle]}
            >
              User Network:
            </Text>
            <Text
              style={[styles.valueText, darkMode && styles.darkValueText]}
            >{`Profile UID: ${profileUid || "Not found"}`}</Text>

            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  darkMode && { backgroundColor: "#444", color: "#fff" },
                ]}
                value={degree}
                onChangeText={setDegree}
                placeholder="Enter degree (e.g., 1 or 2)"
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.fetchButton}
                onPress={fetchNetwork}
              >
                <Text style={styles.fetchButtonText}>Fetch</Text>
              </TouchableOpacity>
            </View>

            {/* Toggle List / Graph View */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginVertical: 12,
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  setViewMode(viewMode === "list" ? "graph" : "list")
                }
                style={styles.toggleButton}
              >
                <Text style={styles.toggleButtonText}>
                  {viewMode === "list" ? "View as Graph" : "View as List"}
                </Text>
              </TouchableOpacity>
            </View>

            {loading && <ActivityIndicator size="large" color="#8b58f9" />}
            {error && (
              <Text style={[styles.errorText, darkMode && styles.darkErrorText]}>
                {error}
              </Text>
            )}

            {/* =================== LIST VIEW =================== */}
            {viewMode === "list" ? (
              !loading &&
              !error &&
              Object.keys(groupedNetwork).length > 0 &&
              Object.entries(groupedNetwork).map(([deg, list]) => (
                <View key={deg} style={{ marginTop: 16 }}>
                  <Text
                    style={[
                      styles.degreeHeader,
                      darkMode && styles.darkDegreeHeader,
                    ]}
                  >
                    {degreeLabel(Number(deg))}
                  </Text>

                  {list.map((item, index) => (
                    <View
                      key={index}
                      style={[
                        styles.networkCard,
                        darkMode && styles.darkNetworkCard,
                      ]}
                    >
                      <Text
                        style={[
                          styles.networkText,
                          darkMode && styles.darkNetworkText,
                        ]}
                      >
                        Target UID: {item.target_uid}
                      </Text>
                      <Text
                        style={[
                          styles.networkText,
                          darkMode && styles.darkNetworkText,
                        ]}
                      >
                        Connected UID: {item.network_profile_personal_uid}
                      </Text>
                      <Text
                        style={[
                          styles.networkText,
                          darkMode && styles.darkNetworkText,
                        ]}
                      >
                        Degree: {item.degree}
                      </Text>
                    </View>
                  ))}
                </View>
              ))
            ) : (
              // =================== GRAPH VIEW ===================
              <View style={{ alignItems: "center", marginTop: 10 }}>
                <Svg height="400" width="100%">
                  {/* Center node */}
                  <Circle cx="200" cy="200" r="25" fill="#8b58f9" />
                  <SvgText
                    x="200"
                    y="205"
                    fill="#fff"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    You
                  </SvgText>

                  {/* Draw nodes per degree */}
                  {Object.entries(groupedNetwork).map(([deg, list], i) => {
                    const radius = 80 + i * 70; // ring spacing
                    const nodes = list.length;
                    return list.map((node, index) => {
                      const angle = (2 * Math.PI * index) / nodes;
                      const x = 200 + radius * Math.cos(angle);
                      const y = 200 + radius * Math.sin(angle);
                      const color =
                        i === 0
                          ? "#b894ff"
                          : i === 1
                          ? "#d6b3ff"
                          : "#e9d4ff";

                      return (
                        <React.Fragment key={`${deg}-${index}`}>
                          <Line
                            x1="200"
                            y1="200"
                            x2={x}
                            y2={y}
                            stroke="#ccc"
                            strokeWidth="1"
                          />
                          <Circle cx={x} cy={y} r="15" fill={color} />
                          <SvgText
                            x={x}
                            y={y + 4}
                            fontSize="8"
                            fill="#333"
                            textAnchor="middle"
                          >
                            {node.network_profile_personal_uid}
                          </SvgText>
                        </React.Fragment>
                      );
                    });
                  })}
                </Svg>
              </View>
            )}

            {!loading &&
              !error &&
              Object.keys(groupedNetwork).length === 0 && (
                <Text
                  style={[styles.noDataText, darkMode && styles.darkNoDataText]}
                >
                  No network connections found.
                </Text>
              )}
          </View>
        </ScrollView>

        <BottomNavBar navigation={navigation} />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: { flex: 1, backgroundColor: "#fff" },
  safeArea: { flex: 1, backgroundColor: "#fff" },
  headerBg: {
    backgroundColor: "#8b58f9",
    paddingVertical: 15,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  contentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 20,
    marginHorizontal: 6,
    padding: 10,
    flexGrow: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 10, color: "#333" },
  keyText: { fontWeight: "bold", color: "#333" },
  valueText: { color: "#555", fontSize: 13 },
  inputRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  fetchButton: {
    backgroundColor: "#8b58f9",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  fetchButtonText: { color: "#fff", fontWeight: "600" },
  toggleButton: {
    backgroundColor: "#8b58f9",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  toggleButtonText: { color: "#fff", fontWeight: "600" },
  degreeHeader: { fontWeight: "700", fontSize: 15, color: "#6b46c1", marginBottom: 6 },
  networkCard: {
    backgroundColor: "#f5f3ff",
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  networkText: { color: "#333" },
  noDataText: { color: "#888" },
  errorText: { color: "red", marginTop: 8 },

  // Dark Mode
  darkPageContainer: { backgroundColor: "#1a1a1a" },
  darkSafeArea: { backgroundColor: "#1a1a1a" },
  darkHeaderBg: { backgroundColor: "#6b46c1" },
  darkHeader: { color: "#ffffff" },
  darkContentCard: { backgroundColor: "#2d2d2d", shadowColor: "#000" },
  darkSectionTitle: { color: "#ffffff" },
  darkNoDataText: { color: "#cccccc" },
  darkKeyText: { color: "#ffffff" },
  darkValueText: { color: "#cccccc" },
  darkErrorText: { color: "#ff6b6b" },
  darkNetworkCard: { backgroundColor: "#3b3b3b" },
  darkNetworkText: { color: "#e6e6e6" },
  darkDegreeHeader: { color: "#c7a6ff" },
});

export default NetworkScreen;
