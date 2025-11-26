// NetworkScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, TextInput, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNavBar from "../components/BottomNavBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDarkMode } from "../contexts/DarkModeContext";
import { useFocusEffect } from "@react-navigation/native";
import { API_BASE_URL, USER_PROFILE_INFO_ENDPOINT } from "../apiConfig";
import MiniCard from "../components/MiniCard";
import QRCode from "react-native-qrcode-svg";

// Lazy load WebView to avoid initialization issues
let WebView = null;
let webViewError = null;
let webViewChecked = false;

const loadWebView = () => {
  // If we've already checked and failed, don't try again
  if (webViewError) {
    return null;
  }

  // If we've already loaded it successfully, return it
  if (WebView) {
    return WebView;
  }

  // If we haven't checked yet, try to load it
  if (!webViewChecked) {
    webViewChecked = true;
    try {
      // Try to require the module - this will fail if native module isn't linked
      const webviewModule = require("react-native-webview");
      if (webviewModule && webviewModule.WebView) {
        WebView = webviewModule.WebView;
        return WebView;
      } else {
        throw new Error("WebView component not found in react-native-webview module");
      }
    } catch (e) {
      // Catch any error (including TurboModuleRegistry errors)
      const errorMessage = e.message || String(e);
      console.warn("WebView not available:", errorMessage);
      webViewError = new Error("WebView native module not linked. Please rebuild the app: npx expo prebuild --clean && npx expo run:android");
      return null;
    }
  }

  return WebView;
};

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
  const [WebViewComponent, setWebViewComponent] = useState(null);
  const [userProfileData, setUserProfileData] = useState(null);
  const [qrCodeData, setQrCodeData] = useState("");
  const [showAsyncStorage, setShowAsyncStorage] = useState(true);

  // Load persisted Network screen settings
  const loadNetworkSettings = async () => {
    try {
      console.log("📥 Loading Network screen settings from AsyncStorage...");
      const [showAsyncStorageValue, degreeValue, viewModeValue, networkDataValue, groupedNetworkValue] = await Promise.all([
        AsyncStorage.getItem("network_showAsyncStorage"),
        AsyncStorage.getItem("network_degree"),
        AsyncStorage.getItem("network_viewMode"),
        AsyncStorage.getItem("network_data"),
        AsyncStorage.getItem("network_grouped"),
      ]);

      console.log("📥 Loaded values:", {
        showAsyncStorage: showAsyncStorageValue,
        degree: degreeValue,
        viewMode: viewModeValue,
        hasNetworkData: networkDataValue !== null,
        hasGroupedNetwork: groupedNetworkValue !== null,
      });

      if (showAsyncStorageValue !== null) {
        const parsedValue = JSON.parse(showAsyncStorageValue);
        console.log("📥 Setting showAsyncStorage to:", parsedValue);
        setShowAsyncStorage(parsedValue);
      } else {
        console.log("📥 No persisted showAsyncStorage value, using default: true");
      }
      if (degreeValue !== null) {
        console.log("📥 Setting degree to:", degreeValue);
        setDegree(degreeValue);
      } else {
        console.log("📥 No persisted degree value, using default: 2");
      }
      if (viewModeValue !== null) {
        console.log("📥 Setting viewMode to:", viewModeValue);
        setViewMode(viewModeValue);
      } else {
        console.log("📥 No persisted viewMode value, using default: list");
      }

      // Load network data if available
      if (networkDataValue !== null) {
        try {
          const parsedNetworkData = JSON.parse(networkDataValue);
          console.log("📥 Loading network data, items:", parsedNetworkData.length);
          setNetworkData(parsedNetworkData);
        } catch (e) {
          console.error("❌ Error parsing network data:", e);
        }
      } else {
        console.log("📥 No persisted network data");
      }

      if (groupedNetworkValue !== null) {
        try {
          const parsedGroupedNetwork = JSON.parse(groupedNetworkValue);
          console.log("📥 Loading grouped network data, degrees:", Object.keys(parsedGroupedNetwork).length);
          setGroupedNetwork(parsedGroupedNetwork);
        } catch (e) {
          console.error("❌ Error parsing grouped network data:", e);
        }
      } else {
        console.log("📥 No persisted grouped network data");
      }

      // Mark settings as loaded so we can start saving changes
      setSettingsLoaded(true);
      console.log("✅ Settings loaded, now tracking changes for persistence");
    } catch (e) {
      console.error("❌ Error loading network settings:", e);
    }
  };

  // Track if settings have been loaded to avoid saving defaults
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Save Network screen settings when they change (but only after initial load)
  useEffect(() => {
    if (!settingsLoaded) {
      // Don't save on initial render before settings are loaded
      return;
    }
    const saveSettings = async () => {
      try {
        console.log("💾 Saving Network screen settings:", {
          showAsyncStorage,
          degree,
          viewMode,
        });
        await Promise.all([
          AsyncStorage.setItem("network_showAsyncStorage", JSON.stringify(showAsyncStorage)),
          AsyncStorage.setItem("network_degree", degree),
          AsyncStorage.setItem("network_viewMode", viewMode),
        ]);
        console.log("✅ Network screen settings saved successfully");
      } catch (e) {
        console.error("❌ Error saving network settings:", e);
      }
    };
    saveSettings();
  }, [showAsyncStorage, degree, viewMode, settingsLoaded]);

  useEffect(() => {
    const loadAsyncStorage = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const stores = await AsyncStorage.multiGet(keys);
        setStorageData(stores);
        const profileEntry = stores.find(([key]) => key === "profile_uid");
        if (profileEntry) {
          const uid = profileEntry[1];
          setProfileUid(uid);
          // Fetch user profile data for QR code
          fetchUserProfileForQR(uid);
        }
      } catch (e) {
        setStorageData([["error", e.message]]);
      }
    };
    loadAsyncStorage();
  }, []);

  // Load settings when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log("🔄 Network screen focused - loading settings...");
      loadNetworkSettings();
    }, [])
  );

  // Also load settings on initial mount
  useEffect(() => {
    console.log("🔄 Network screen mounted - loading settings...");
    loadNetworkSettings();
  }, []);

  // Fetch user profile data to create QR code with public miniCard info
  const fetchUserProfileForQR = async (profileUID) => {
    try {
      const response = await fetch(`${USER_PROFILE_INFO_ENDPOINT}/${profileUID}`);
      if (!response.ok) return;
      const apiUser = await response.json();

      // Extract public miniCard information
      const p = apiUser?.personal_info || {};
      const tagLineIsPublic = p.profile_personal_tag_line_is_public === 1 || p.profile_personal_tagline_is_public === 1;
      const emailIsPublic = p.profile_personal_email_is_public === 1;
      const phoneIsPublic = p.profile_personal_phone_number_is_public === 1;
      const imageIsPublic = p.profile_personal_image_is_public === 1;

      const publicData = {
        profile_uid: profileUID,
        firstName: p.profile_personal_first_name || "",
        lastName: p.profile_personal_last_name || "",
        tagLine: tagLineIsPublic ? p.profile_personal_tag_line || p.profile_personal_tagline || "" : "",
        email: emailIsPublic ? apiUser?.user_email || "" : "",
        phoneNumber: phoneIsPublic ? p.profile_personal_phone_number || "" : "",
        profileImage: imageIsPublic ? (p.profile_personal_image ? String(p.profile_personal_image) : "") : "",
        // Include visibility flags for MiniCard
        tagLineIsPublic,
        emailIsPublic,
        phoneIsPublic,
        imageIsPublic,
      };

      setUserProfileData(publicData);
      // Create vCard format for QR code (standard contact card format)
      const vCard = createVCard(publicData);
      setQrCodeData(vCard);
    } catch (error) {
      console.error("Error fetching user profile for QR code:", error);
    }
  };

  // Create vCard format (standard contact card format that QR scanners recognize)
  const createVCard = (data) => {
    const lines = ["BEGIN:VCARD", "VERSION:3.0"];

    // Name (required)
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    if (fullName) {
      lines.push(`FN:${fullName}`);
      lines.push(`N:${data.lastName || ""};${data.firstName || ""};;;`);
    }

    // Organization/Title (using tagLine)
    if (data.tagLine) {
      lines.push(`ORG:${escapeVCardValue(data.tagLine)}`);
    }

    // Email
    if (data.email) {
      lines.push(`EMAIL:${data.email}`);
    }

    // Phone
    if (data.phoneNumber) {
      // Remove any non-digit characters for phone
      const phone = data.phoneNumber.replace(/\D/g, "");
      lines.push(`TEL:${phone}`);
    }

    // Profile UID as a note
    if (data.profile_uid) {
      lines.push(`NOTE:Profile ID: ${data.profile_uid}`);
    }

    // Profile Image URL (if available)
    if (data.profileImage) {
      lines.push(`PHOTO;TYPE=URL:${data.profileImage}`);
    }

    lines.push("END:VCARD");
    return lines.join("\n");
  };

  // Escape special characters in vCard values
  const escapeVCardValue = (value) => {
    if (!value) return "";
    return String(value).replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
  };

  // Lazy load WebView when graph mode is selected
  useEffect(() => {
    if (viewMode === "graph" && !WebViewComponent && !webViewError) {
      // Use setTimeout to ensure React context is ready
      const timer = setTimeout(() => {
        try {
          const WebView = loadWebView();
          if (WebView) {
            setWebViewComponent(() => WebView);
          } else if (webViewError) {
            // Error already set in loadWebView, component will show error message
            console.log("WebView not available, showing error message");
          }
        } catch (error) {
          console.error("Error loading WebView component:", error);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [viewMode, WebViewComponent]);

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
      profileImage: p.profile_personal_image ? String(p.profile_personal_image) : "",
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
      (Array.isArray(n.path) ? (n.path.length >= 2 ? n.path[n.path.length - 2] : null) : null) ||
      tryJsonArray(n.path) ||
      tryJsonArray(n.connection_path) ||
      null
    );
  };

  const fetchNetwork = async () => {
    console.log("============================================");
    console.log("🔘 Fetch Button Clicked");
    console.log("============================================");

    if (!profileUid || !degree) {
      const errorMsg = "Missing profile UID or degree value";
      console.log("❌ Error:", errorMsg);
      console.log("Profile UID:", profileUid);
      console.log("Degree:", degree);
      setError(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    // Construct endpoint using base URL
    const endpoint = `${API_BASE_URL}/api/network/${profileUid}/${degree}`;

    console.log("🔗 Endpoint:", endpoint);
    console.log("📋 Profile UID:", profileUid);
    console.log("📋 Degree:", degree);
    console.log("📋 Base URL:", API_BASE_URL);
    console.log("============================================");

    try {
      console.log("📡 Making fetch request...");
      const response = await fetch(endpoint);

      console.log("📥 Response status:", response.status);
      console.log("📥 Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Response error:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Network data received:", JSON.stringify(data, null, 2));
      console.log("✅ Data count:", Array.isArray(data) ? data.length : "Not an array");

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

            const { firstName, lastName, tagLine, email, phoneNumber, profileImage } = pluckMiniCardFields(userData);

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

      // Save network data for persistence
      try {
        console.log("💾 Saving network data for persistence...");
        await AsyncStorage.setItem("network_data", JSON.stringify(enrichedData));
        await AsyncStorage.setItem("network_grouped", JSON.stringify(groupByDegree(enrichedData)));
        console.log("✅ Network data saved successfully");
      } catch (e) {
        console.error("❌ Error saving network data:", e);
      }
    } catch (err) {
      console.error("❌ Network fetch failed:", err);
      console.error("❌ Error message:", err.message);
      console.error("❌ Error stack:", err.stack);
      setError(`Failed to fetch network data: ${err.message}`);
    } finally {
      setLoading(false);
      console.log("============================================");
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
    // Get user's profile image if available
    const userImage = userProfileData?.profileImage || "";
    const hasUserImage = userImage && String(userImage).trim() !== "";

    // Calculate base size for other nodes (max of image nodes or dot nodes)
    const otherNodeSizes = data.map((n) => {
      const img = n.__mc?.personal_info?.profile_personal_image || n.__mc?.profileImage || n.profile_image || "";
      const hasImg = img && String(img).trim() !== "";
      return hasImg ? 18 : 10;
    });
    const maxOtherSize = otherNodeSizes.length > 0 ? Math.max(...otherNodeSizes) : 18;

    // User's node should be 150% of the max other node size
    const userNodeSize = Math.round(maxOtherSize * 1.5);

    const nodes = [
      {
        id: youId || "YOU",
        label: "You",
        shape: hasUserImage ? "image" : "dot",
        image: hasUserImage ? userImage : undefined,
        size: userNodeSize,
        color: hasUserImage ? undefined : { border: "#AF52DE", background: "#b894ff" },
        font: { color: "#ffffff", size: 10 },
        level: 0,
      },
    ];

    const allUids = new Set([youId]);
    data.forEach((n) => allUids.add(n.network_profile_personal_uid));

    data.forEach((n) => {
      const name = n.__mc?.personal_info?.profile_personal_first_name || n.__mc?.firstName || "";
      const last = n.__mc?.personal_info?.profile_personal_last_name || n.__mc?.lastName || "";
      const label = [name, last].filter(Boolean).join(" ") || (n.network_profile_personal_uid ? n.network_profile_personal_uid.slice(-3) : "???");

      const img = n.__mc?.personal_info?.profile_personal_image || n.__mc?.profileImage || n.profile_image || "";

      const hasImg = img && String(img).trim() !== "";
      nodes.push({
        id: n.network_profile_personal_uid,
        label,
        shape: hasImg ? "image" : "dot",
        image: hasImg ? img : undefined,
        size: hasImg ? 18 : 10,
        color: hasImg ? undefined : { border: "#AF52DE", background: "#e9d4ff" },
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
          from: possibleParent ? possibleParent.network_profile_personal_uid : youId || "YOU",
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
      {/* Header */}
      <View style={[styles.headerBg, darkMode && styles.darkHeaderBg]}>
        <Text style={[styles.header, darkMode && styles.darkHeader]}>Connect</Text>
      </View>

      <SafeAreaView style={[styles.safeArea, darkMode && styles.darkSafeArea]}>
        <ScrollView
          style={[styles.scrollContainer, darkMode && styles.darkScrollContainer]}
          contentContainerStyle={{ padding: 10, paddingBottom: 120 }}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator
        >
          {/* QR Code Section */}
          {qrCodeData && userProfileData && (
            <View style={[styles.qrCodeContainer, darkMode && styles.darkQrCodeContainer]}>
              <Text style={[styles.qrCodeTitle, darkMode && styles.darkQrCodeTitle]}>My Contact QR Code</Text>
              <Text style={[styles.qrCodeSubtitle, darkMode && styles.darkQrCodeSubtitle]}>Let others scan this to share your public contact information</Text>
              <View style={[styles.qrCodeWrapper, darkMode && styles.darkQrCodeWrapper]}>
                <QRCode value={qrCodeData} size={200} color={darkMode ? "#ffffff" : "#000000"} backgroundColor={darkMode ? "#1a1a1a" : "#ffffff"} />
              </View>

              {/* Display MiniCard showing what information will be transferred */}
              <View style={styles.qrCodeMiniCardContainer}>
                <MiniCard user={userProfileData} />
              </View>
            </View>
          )}

          <View>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, darkMode && styles.darkSectionTitle]}>AsyncStorage Contents:</Text>
              <TouchableOpacity
                onPress={() => {
                  const newValue = !showAsyncStorage;
                  console.log("👁️ Toggling AsyncStorage visibility from", showAsyncStorage, "to", newValue);
                  setShowAsyncStorage(newValue);
                }}
                style={styles.eyeIconButton}
              >
                <Ionicons name={showAsyncStorage ? "eye" : "eye-off"} size={20} color={darkMode ? "#ffffff" : "#333"} />
              </TouchableOpacity>
            </View>
            {(() => {
              console.log("🎨 Rendering AsyncStorage section, showAsyncStorage =", showAsyncStorage);
              return null;
            })()}
            {showAsyncStorage && (
              <>
                {storageData.length === 0 ? (
                  <Text style={[styles.noDataText, darkMode && styles.darkNoDataText]}>No data in AsyncStorage.</Text>
                ) : (
                  storageData.map(([key, value]) => (
                    <View key={key} style={{ marginBottom: 8 }}>
                      <Text style={[styles.keyText, darkMode && styles.darkKeyText]}>{key}:</Text>
                      <Text style={[styles.valueText, darkMode && styles.darkValueText]}>{value}</Text>
                    </View>
                  ))
                )}
              </>
            )}
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={[styles.sectionTitle, darkMode && styles.darkSectionTitle]}>My Network{profileUid ? ` (${profileUid})` : ""}</Text>

            <View style={styles.networkControlsRow}>
              <Text style={[styles.networkControlLabel, darkMode && styles.darkNetworkControlLabel]}>Levels to Display:</Text>
              <TextInput style={[styles.networkInput, darkMode && styles.darkNetworkInput]} value={degree} onChangeText={setDegree} placeholder='1' keyboardType='numeric' />
              <TouchableOpacity style={styles.fetchButton} onPress={fetchNetwork}>
                <Text style={styles.fetchButtonText}>Show Connections</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setViewMode(viewMode === "list" ? "graph" : "list")} style={styles.toggleButton}>
                <Text style={styles.toggleButtonText}>{viewMode === "list" ? "View as Graph" : "View as List"}</Text>
              </TouchableOpacity>
            </View>

            {loading && <ActivityIndicator size='large' color='#AF52DE' />}
            {error && <Text style={[styles.errorText, darkMode && styles.darkErrorText]}>{error}</Text>}

            {viewMode === "graph" && networkData.length > 0 && (
              <View
                style={{
                  height: 400,
                  borderRadius: 10,
                  overflow: "hidden",
                  borderWidth: 0,
                }}
              >
                {WebViewComponent ? (
                  <WebViewComponent
                    originWhitelist={["*"]}
                    source={{ html: generateVisHTML(networkData, profileUid || "YOU") }}
                    onMessage={(event) => {
                      const uid = event?.nativeEvent?.data;
                      if (uid && uid !== (profileUid || "YOU")) {
                        navigation.navigate("Profile", {
                          profile_uid: uid,
                          returnTo: "Network",
                        });
                      }
                    }}
                    javaScriptEnabled
                    domStorageEnabled
                    automaticallyAdjustContentInsets
                    allowsInlineMediaPlayback
                    androidLayerType={Platform.OS === "android" ? "hardware" : "none"}
                  />
                ) : webViewError ? (
                  <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
                    <Text style={[styles.errorText, darkMode && styles.darkErrorText, { textAlign: "center", marginBottom: 10 }]}>WebView is not available. The native module needs to be linked.</Text>
                    <Text style={[styles.helperText, darkMode && styles.darkHelperText, { textAlign: "center", marginTop: 5 }]}>
                      To fix: Run {"\n"}
                      npx expo prebuild --clean{"\n"}
                      npx expo run:android
                    </Text>
                    <Text style={[styles.helperText, darkMode && styles.darkHelperText, { textAlign: "center", marginTop: 5, fontSize: 10 }]}>(or run:ios for iOS)</Text>
                  </View>
                ) : (
                  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size='large' color='#AF52DE' />
                    <Text style={[styles.loadingText, darkMode && styles.darkLoadingText]}>Loading graph view...</Text>
                  </View>
                )}
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
                        <Text style={[styles.degreeHeader, darkMode && styles.darkDegreeHeader]}>{degreeLabel(Number(deg))}</Text>

                        {list.map((node, index) => (
                          <TouchableOpacity
                            key={`${deg}-${index}`}
                            onPress={() =>
                              navigation.navigate("Profile", {
                                profile_uid: node.network_profile_personal_uid,
                                returnTo: "Network",
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

            {!loading && !error && Object.keys(groupedNetwork).length === 0 && <Text style={[styles.noDataText, darkMode && styles.darkNoDataText]}>No network connections found.</Text>}
          </View>
        </ScrollView>

        <BottomNavBar navigation={navigation} />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: { flex: 1, backgroundColor: "#fff" },
  safeArea: { flex: 1 },
  headerBg: {
    backgroundColor: "#AF52DE",
    paddingTop: 30,
    paddingBottom: 15,
    alignItems: "center",
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },
  header: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  scrollContainer: { flex: 1 },
  darkScrollContainer: { backgroundColor: "#1a1a1a" },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: { fontWeight: "bold", fontSize: 16, color: "#333" },
  eyeIconButton: {
    padding: 4,
  },
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
  networkControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    flexWrap: "wrap",
    gap: 8,
  },
  networkControlLabel: {
    fontSize: 14,
    color: "#333",
    marginRight: 8,
  },
  darkNetworkControlLabel: {
    color: "#cccccc",
  },
  networkInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    width: 35,
    textAlign: "center",
    backgroundColor: "#fff",
    height: 36, // Match Fetch button height (8px padding top + 8px padding bottom + ~20px text height)
  },
  darkNetworkInput: {
    backgroundColor: "#444",
    color: "#fff",
    borderColor: "#666",
  },
  fetchButton: {
    backgroundColor: "#AF52DE",
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
    backgroundColor: "#AF52DE",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    height: 36, // Match Fetch button height
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
  loadingText: { color: "#666", marginTop: 10 },
  darkLoadingText: { color: "#aaa" },
  helperText: { color: "#888", fontSize: 12, marginTop: 5 },
  darkHelperText: { color: "#999" },
  qrCodeContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkQrCodeContainer: {
    backgroundColor: "#2d2d2d",
  },
  qrCodeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  darkQrCodeTitle: {
    color: "#ffffff",
  },
  qrCodeSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
  darkQrCodeSubtitle: {
    color: "#aaa",
  },
  qrCodeWrapper: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
  },
  darkQrCodeWrapper: {
    backgroundColor: "#1a1a1a",
  },
  qrCodeInfo: {
    marginTop: 10,
    alignItems: "center",
  },
  qrCodeInfoText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 4,
  },
  darkQrCodeInfoText: {
    color: "#cccccc",
  },
  qrCodeMiniCardContainer: {
    marginTop: 15,
    width: "100%",
  },
});

export default NetworkScreen;
