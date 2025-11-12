// NetworkScreen.js
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
  Platform,
} from "react-native";
import BottomNavBar from "../components/BottomNavBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDarkMode } from "../contexts/DarkModeContext";
import { WebView } from "react-native-webview";
import { USER_PROFILE_INFO_ENDPOINT } from "../apiConfig";
import MiniCard from "../components/MiniCard";

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
      const deg = Number(item.degree) || 0;
      if (!grouped[deg]) grouped[deg] = [];
      grouped[deg].push(item);
    });
    return grouped;
  };

  const pluckMiniCardFields = (apiUser) => {
    const p = apiUser?.personal_info || {};
    return {
      firstName: p.profile_personal_first_name || "",
      lastName: p.profile_personal_last_name || "",
      tagLine: p.profile_personal_tag_line || p.profile_personal_tagline || "",
      email: apiUser?.user_email || "",
      phoneNumber: p.profile_personal_phone_number || "",
      profileImage: p.profile_personal_image
        ? String(p.profile_personal_image)
        : "",
    };
  };

  const getParentUid = (n) => {
    if (!n) return null;
    const tryJsonArray = (val) => {
      try {
        const arr = typeof val === "string" ? JSON.parse(val) : val;
        return Array.isArray(arr) && arr.length >= 2 ? arr[arr.length - 2] : null;
      } catch {
        return null;
      }
    };
    return (
      n.parent_uid ||
      n.via_uid ||
      n.source_uid ||
      n.connection_uid ||
      (Array.isArray(n.path)
        ? n.path.length >= 2
          ? n.path[n.path.length - 2]
          : null
        : null) ||
      tryJsonArray(n.path) ||
      tryJsonArray(n.connection_path) ||
      null
    );
  };

  const fetchNetwork = async () => {
    console.log(
      "Fetching from:",
      `http://192.168.4.51:4090/api/network/${profileUid}/${degree}`
    );

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

      const enrichedData = await Promise.all(
        data.map(async (node) => {
          const uid = node?.network_profile_personal_uid;
          if (!uid || uid === "110-000000") {
            return { ...node, profile_image: "", __mc: {} };
          }
          try {
            const userRes = await fetch(`${USER_PROFILE_INFO_ENDPOINT}/${uid}`);
            if (!userRes.ok) throw new Error(`Failed to load profile ${uid}`);
            const userData = await userRes.json();

            const {
              firstName,
              lastName,
              tagLine,
              email,
              phoneNumber,
              profileImage,
            } = pluckMiniCardFields(userData);

            return {
              ...node,
              profile_image: profileImage || "",
              __mc: {
                personal_info: {
                  profile_personal_first_name: firstName || "",
                  profile_personal_last_name: lastName || "",
                  profile_personal_tagline: tagLine || "",
                  profile_personal_tag_line: tagLine || "",
                  profile_personal_phone_number: phoneNumber || "",
                  profile_personal_image: profileImage || "",
                },
                user_email: email || "",
                profileImage: profileImage || "",
              },
            };
          } catch (err) {
            console.log("Profile fetch failed for uid:", uid);
            return { ...node, profile_image: "", __mc: {} };
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

  /** ✅ Build vis-network HTML (hierarchical layout by degree) */
  const generateVisHTML = (data, youId) => {
    const nodes = [
      {
        id: youId || "YOU",
        label: "You",
        shape: "dot",
        size: 14,
        color: { border: "#8b58f9", background: "#b894ff" },
        font: { color: "#ffffff", size: 10 },
        level: 0,
      },
    ];

    const allUids = new Set([youId]);
    data.forEach((n) => allUids.add(n.network_profile_personal_uid));

    data.forEach((n) => {
      const name =
        n.__mc?.personal_info?.profile_personal_first_name ||
        n.__mc?.firstName ||
        "";
      const last =
        n.__mc?.personal_info?.profile_personal_last_name ||
        n.__mc?.lastName ||
        "";
      const label =
        [name, last].filter(Boolean).join(" ") ||
        (n.network_profile_personal_uid
          ? n.network_profile_personal_uid.slice(-3)
          : "???");

      const img =
        n.__mc?.personal_info?.profile_personal_image ||
        n.__mc?.profileImage ||
        n.profile_image ||
        "";

      const hasImg = img && String(img).trim() !== "";
      nodes.push({
        id: n.network_profile_personal_uid,
        label,
        shape: hasImg ? "image" : "dot",
        image: hasImg ? img : undefined,
        size: hasImg ? 18 : 10,
        color: hasImg
          ? undefined
          : { border: "#8b58f9", background: "#e9d4ff" },
        font: { size: 10, color: "#444" },
        level: Number(n.degree) || 1,
      });
    });

    const edges = [];
    data.forEach((n) => {
      const deg = Number(n.degree) || 1;
      const parent = (function () {
        try {
          const p = getParentUid(n);
          if (p && allUids.has(p)) return p;
        } catch {}
        return null;
      })();

      if (parent) {
        edges.push({
          from: parent,
          to: n.network_profile_personal_uid,
          color: { color: "#cccccc" },
          width: 0.6,
          smooth: true,
        });
      } else if (deg === 1) {
        edges.push({
          from: youId || "YOU",
          to: n.network_profile_personal_uid,
          color: { color: "#bbbbbb" },
          width: 0.8,
          smooth: true,
        });
      } else {
        const possibleParent = data.find((x) => Number(x.degree) === deg - 1);
        edges.push({
          from: possibleParent
            ? possibleParent.network_profile_personal_uid
            : youId || "YOU",
          to: n.network_profile_personal_uid,
          color: { color: "#dddddd" },
          width: 0.5,
          smooth: true,
        });
      }
    });

    const payload = { nodes, edges };

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
<style>
  html, body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#ffffff; }
  #mynetwork { width:100%; height:100%; background:#ffffff; }
</style>
<script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
</head>
<body>
  <div id="mynetwork"></div>
  <script>
    (function() {
      const data = ${JSON.stringify(payload)};
      const container = document.getElementById('mynetwork');

      const options = {
        layout: {
          improvedLayout: true
        },
        physics: {
          enabled: true,
          solver: "repulsion",
          repulsion: {
            nodeDistance: 180,     // controls how far apart the rings are
            centralGravity: 0.3,
            springLength: 100,
            springConstant: 0.02,
            damping: 0.15
          },
          stabilization: {
            iterations: 200,
            updateInterval: 25
          }
        },

        edges: {
          color: '#cccccc',
          width: 0.5,
          smooth: { enabled: true, type: 'continuous', roundness: 0.3 }
        },
        interaction: {
          hover: true,
          zoomView: true,
          dragView: true,
          dragNodes: true
        }
      };

      const network = new vis.Network(container, data, options);

      network.once('stabilizationIterationsDone', () => {
        network.fit({ animation: { duration: 200 }});
      });

      network.on('click', function(params) {
        if (params && params.nodes && params.nodes.length > 0) {
          const id = params.nodes[0];
          if (id && window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(String(id));
          }
        }
      });

      window.addEventListener('resize', () => {
        network.fit({ animation: false });
      });
    })();
  </script>
</body>
</html>
`;
  };

  return (
    <View style={[styles.pageContainer, darkMode && styles.darkPageContainer]}>
      <SafeAreaView style={[styles.safeArea, darkMode && styles.darkSafeArea]}>
        <View style={[styles.headerBg, darkMode && styles.darkHeaderBg]}>
          <Text style={[styles.header, darkMode && styles.darkHeader]}>
            Network
          </Text>
        </View>

        <ScrollView
          style={[styles.scrollContainer, darkMode && styles.darkScrollContainer]}
          contentContainerStyle={{ padding: 10, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
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

            {viewMode === "graph" && networkData.length > 0 && (
              <View
                style={{
                  height: 400,
                  borderRadius: 10,
                  overflow: "hidden",
                  borderWidth: 0,
                }}
              >
                <WebView
                  originWhitelist={["*"]}
                  source={{ html: generateVisHTML(networkData, profileUid || "YOU") }}
                  onMessage={(event) => {
                    const uid = event?.nativeEvent?.data;
                    if (uid && uid !== (profileUid || "YOU")) {
                      navigation.navigate("Profile", { profile_uid: uid });
                    }
                  }}
                  javaScriptEnabled
                  domStorageEnabled
                  automaticallyAdjustContentInsets
                  allowsInlineMediaPlayback
                  androidLayerType={Platform.OS === "android" ? "hardware" : "none"}
                />
              </View>
            )}

            {viewMode === "list" && Object.keys(groupedNetwork).length > 0 && (
              <View style={{ marginTop: 10 }}>
                {Object.keys(groupedNetwork)
                  .map((d) => Number(d))
                  .sort((a, b) => a - b)
                  .map((deg) => {
                    const list = groupedNetwork[deg];
                    return (
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
                            onPress={() =>
                              navigation.navigate("Profile", {
                                profile_uid: node.network_profile_personal_uid,
                              })
                            }
                            style={{ marginVertical: 6 }}
                          >
                            <MiniCard user={node.__mc} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    );
                  })}
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
  noDataText: { color: "#888" },
  errorText: { color: "red", marginTop: 8 },
  darkPageContainer: { backgroundColor: "#1a1a1a" },
  darkSafeArea: { backgroundColor: "#1a1a1a" },
  darkHeaderBg: { backgroundColor: "#4b2c91" },
  darkHeader: { color: "#fff" },
  darkSectionTitle: { color: "#ccc" },
  darkKeyText: { color: "#ccc" },
  darkValueText: { color: "#aaa" },
  darkNoDataText: { color: "#888" },
  darkDegreeHeader: { color: "#a78bfa" },
  darkErrorText: { color: "#f87171" },
});

export default NetworkScreen;
