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
  Image,
} from "react-native";
import BottomNavBar from "../components/BottomNavBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDarkMode } from "../contexts/DarkModeContext";
import Svg, { Circle, Line, Text as SvgText, Image as SvgImage } from "react-native-svg";
import { USER_PROFILE_INFO_ENDPOINT } from "../apiConfig";

const NetworkScreen = ({ navigation }) => {
  const { darkMode } = useDarkMode();
  const [storageData, setStorageData] = useState([]);
  const [networkData, setNetworkData] = useState([]);
  const [groupedNetwork, setGroupedNetwork] = useState({});
  const [profileUid, setProfileUid] = useState("");
  const [degree, setDegree] = useState("2");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("list");

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

  // ✅ Fetch network and enrich with profile images
  const fetchNetwork = async () => {
    if (!profileUid || !degree) {
      setError("Missing profile UID or degree value");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Fetch network
      const response = await fetch(
        `http://192.168.4.51:4090/api/network/${profileUid}/${degree}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      // Step 2: Enrich each node with profile image
      const enrichedData = await Promise.all(
        data.map(async (node) => {
          try {
            const userRes = await fetch(
              `${USER_PROFILE_INFO_ENDPOINT}/${node.network_profile_personal_uid}`
            );
            if (!userRes.ok)
              throw new Error(
                `Failed to load profile ${node.network_profile_personal_uid}`
              );
            const userData = await userRes.json();

            const profileImage =
              userData?.personal_info?.profile_personal_image
                ? String(userData.personal_info.profile_personal_image)
                : "";

            console.log(
              `Profile image for ${node.network_profile_personal_uid}:`,
              profileImage
            );

            return { ...node, profile_image: profileImage };
          } catch (err) {
            console.error(
              "Error fetching profile for node:",
              node.network_profile_personal_uid,
              err
            );
            return { ...node, profile_image: "" };
          }
        })
      );

      setNetworkData(enrichedData);
      setGroupedNetwork(groupByDegree(enrichedData));
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

        {/* Main Scroll */}
        <ScrollView
          style={[styles.scrollContainer, darkMode && styles.darkScrollContainer]}
          contentContainerStyle={{ padding: 10, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          {/* AsyncStorage Info */}
          <View>
            <Text style={[styles.sectionTitle, darkMode && styles.darkSectionTitle]}>
              AsyncStorage Contents:
            </Text>
            {storageData.length === 0 ? (
              <Text style={[styles.noDataText, darkMode && styles.darkNoDataText]}>
                No data in AsyncStorage.
              </Text>
            ) : (
              storageData.map(([key, value]) => (
                <View key={key} style={{ marginBottom: 8 }}>
                  <Text style={[styles.keyText, darkMode && styles.darkKeyText]}>
                    {key}:
                  </Text>
                  <Text style={[styles.valueText, darkMode && styles.darkValueText]}>
                    {value}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Fetch Controls */}
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.sectionTitle, darkMode && styles.darkSectionTitle]}>
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
              <TouchableOpacity style={styles.fetchButton} onPress={fetchNetwork}>
                <Text style={styles.fetchButtonText}>Fetch</Text>
              </TouchableOpacity>
            </View>

            {/* View toggle */}
            <View style={styles.toggleContainer}>
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

            {/* =================== GRAPH VIEW =================== */}
            {viewMode === "graph" && (
              <ScrollView horizontal contentContainerStyle={{ padding: 20 }}>
                <ScrollView>
                  {Object.keys(groupedNetwork).length > 0 && (() => {
                    const degreeLevels = Object.keys(groupedNetwork).length;
                    const maxRadius = 120 + (degreeLevels - 1) * 120;
                    const margin = 200;
                    const canvasSize = maxRadius * 2 + margin * 2;
                    const centerX = canvasSize / 2;
                    const centerY = canvasSize / 2;

                    return (
                      <Svg
                        height={canvasSize}
                        width={canvasSize}
                        viewBox={`0 0 ${canvasSize} ${canvasSize}`}
                      >
                        {/* Center node */}
                        <Circle cx={centerX} cy={centerY} r="25" fill="#8b58f9" />
                        <SvgText
                          x={centerX}
                          y={centerY + 4}
                          fill="#fff"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          You
                        </SvgText>

                        {/* Outer connections */}
                        {Object.entries(groupedNetwork).map(([deg, list], i) => {
                          const radius = 120 + i * 120;
                          const nodes = list.length;

                          return list.map((node, index) => {
                            const angle = (2 * Math.PI * index) / nodes;
                            const x = centerX + radius * Math.cos(angle);
                            const y = centerY + radius * Math.sin(angle);
                            const color =
                              i === 0
                                ? "#b894ff"
                                : i === 1
                                ? "#d6b3ff"
                                : "#e9d4ff";

                            const profileImage = node.profile_image || "";
                            const hasImage = profileImage.trim() !== "";
                            const label = node.network_profile_personal_uid
                              ? node.network_profile_personal_uid.slice(-3)
                              : "???";

                            return (
                              <React.Fragment key={`${deg}-${index}`}>
                                <Line
                                  x1={centerX}
                                  y1={centerY}
                                  x2={x}
                                  y2={y}
                                  stroke="#ccc"
                                  strokeWidth="1"
                                />
                                {hasImage ? (
                                  <>
                                    <SvgImage
                                      href={profileImage}
                                      x={x - 15}
                                      y={y - 15}
                                      width={30}
                                      height={30}
                                      onPress={() =>
                                        navigation.navigate("Profile", {
                                          profile_uid:
                                            node.network_profile_personal_uid,
                                        })
                                      }
                                    />
                                    <Circle
                                      cx={x}
                                      cy={y}
                                      r="15"
                                      stroke="#8b58f9"
                                      strokeWidth="1.5"
                                      fill="none"
                                    />
                                  </>
                                ) : (
                                  <>
                                    <Circle
                                      cx={x}
                                      cy={y}
                                      r="15"
                                      fill={color}
                                      onPress={() =>
                                        navigation.navigate("Profile", {
                                          profile_uid:
                                            node.network_profile_personal_uid,
                                        })
                                      }
                                    />
                                    <SvgText
                                      x={x}
                                      y={y + 3}
                                      fontSize="8"
                                      fill="#333"
                                      textAnchor="middle"
                                    >
                                      {label}
                                    </SvgText>
                                  </>
                                )}
                              </React.Fragment>
                            );
                          });
                        })}
                      </Svg>
                    );
                  })()}
                </ScrollView>
              </ScrollView>
            )}

            {/* =================== LIST VIEW =================== */}
            {viewMode === "list" && Object.keys(groupedNetwork).length > 0 && (
              <View style={{ marginTop: 10 }}>
                {Object.entries(groupedNetwork).map(([deg, list]) => (
                  <View key={deg} style={{ marginBottom: 20 }}>
                    <Text
                      style={[
                        styles.degreeHeader,
                        darkMode && styles.darkDegreeHeader,
                      ]}
                    >
                      {degreeLabel(Number(deg))}
                    </Text>

                    {list.map((node, index) => (
                      <TouchableOpacity
                        key={`${deg}-${index}`}
                        style={[
                          styles.networkCard,
                          darkMode && styles.darkNetworkCard,
                        ]}
                        onPress={() =>
                          navigation.navigate("Profile", {
                            profile_uid: node.network_profile_personal_uid,
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.networkText,
                            darkMode && styles.darkNetworkText,
                          ]}
                        >
                          Target UID: {node.target_uid}
                        </Text>
                        <Text
                          style={[
                            styles.networkText,
                            darkMode && styles.darkNetworkText,
                          ]}
                        >
                          Connected UID: {node.network_profile_personal_uid}
                        </Text>
                        <Text
                          style={[
                            styles.networkText,
                            darkMode && styles.darkNetworkText,
                          ]}
                        >
                          Degree: {node.degree}
                        </Text>

                        {node.profile_image ? (
                          <Image
                            source={{ uri: node.profile_image }}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 20,
                              marginTop: 8,
                            }}
                          />
                        ) : (
                          <Text
                            style={[
                              styles.networkText,
                              darkMode && styles.darkNetworkText,
                            ]}
                          >
                            No profile image
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
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
  scrollContainer: { flex: 1 },
  darkScrollContainer: { backgroundColor: "#1a1a1a" },
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
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 12,
  },
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
  darkPageContainer: { backgroundColor: "#1a1a1a" },
  darkSafeArea: { backgroundColor: "#1a1a1a" },
  darkHeaderBg: { backgroundColor: "#6b46c1" },
  darkHeader: { color: "#ffffff" },
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
