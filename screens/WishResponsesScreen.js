// WishResponsesScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MiniCard from "../components/MiniCard";
import { useDarkMode } from "../contexts/DarkModeContext";
import { PROFILE_WISH_INFO_ENDPOINT } from "../apiConfig";

const WishResponsesScreen = ({ route, navigation }) => {
  const { wishData, profileData, profile_uid, profileState } = route.params;
  const { darkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState([]);
  const [accepting, setAccepting] = useState(null);

  // Create user object for MiniCard
  const userForMiniCard = {
    firstName: profileData?.firstName || "",
    lastName: profileData?.lastName || "",
    email: profileData?.email || "",
    phoneNumber: profileData?.phone || "",
    profileImage: profileData?.image || "",
    tagLine: profileData?.tagLine || "",
    emailIsPublic: profileData?.emailIsPublic || false,
    phoneIsPublic: profileData?.phoneIsPublic || false,
    tagLineIsPublic: profileData?.tagLineIsPublic || false,
    imageIsPublic: profileData?.imageIsPublic || false,
  };

  useEffect(() => {
    fetchWishResponses();
  }, []);

  const fetchWishResponses = async () => {
    try {
      setLoading(true);
      const profile_wish_id = wishData?.wish_uid || wishData?.profile_wish_id;
      if (!profile_wish_id) {
        Alert.alert("Error", "Wish information not found.");
        setLoading(false);
        return;
      }

      const endpoint = `${PROFILE_WISH_INFO_ENDPOINT}/${profile_wish_id}`;
      console.log("Fetching wish responses from:", endpoint);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      console.log("Wish responses result:", JSON.stringify(result, null, 2));

      if (response.ok && result.code === 200 && result.data) {
        setResponses(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch responses");
      }
    } catch (error) {
      console.error("Error fetching wish responses:", error);
      Alert.alert("Error", error.message || "Failed to load responses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (response) => {
    try {
      setAccepting(response.wish_response_uid);
      // TODO: Implement accept functionality - this might require a new endpoint
      console.log("Accepting response:", response.wish_response_uid);
      Alert.alert("Success", "Response accepted! This feature will be implemented soon.");
      // After accepting, you might want to refresh the list or navigate away
    } catch (error) {
      console.error("Error accepting response:", error);
      Alert.alert("Error", "Failed to accept response. Please try again.");
    } finally {
      setAccepting(null);
    }
  };

  const handleBack = () => {
    // Return to Profile screen with preserved state
    if (profileState) {
      console.log("🔙 Returning to Profile with preserved state");
      navigation.navigate("Profile", profileState);
    } else {
      navigation.navigate("Profile", {
        profile_uid: profile_uid,
      });
    }
  };

  return (
    <SafeAreaView style={[styles.pageContainer, darkMode && styles.darkPageContainer]}>
      {/* Header with Back Button */}
      <View style={[styles.headerBg, darkMode && styles.darkHeaderBg]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name='arrow-back' size={24} color='#fff' />
          </TouchableOpacity>
          <Text style={[styles.header, darkMode && styles.darkHeader, styles.headerWithBack]}>Seeking Responses</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={darkMode ? "#AF52DE" : "#AF52DE"} />
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {/* Wish Card */}
          <View style={[styles.card, darkMode && styles.darkCard]}>
            <Text style={[styles.cardTitle, darkMode && styles.darkCardTitle]}>Seeking</Text>
            {wishData?.title && <Text style={[styles.wishTitle, darkMode && styles.darkWishTitle]}>{wishData.title}</Text>}
            {wishData?.description && <Text style={[styles.wishDescription, darkMode && styles.darkWishDescription]}>{wishData.description}</Text>}
            {wishData?.details && (
              <View style={styles.detailsContainer}>
                <Text style={[styles.detailsTitle, darkMode && styles.darkDetailsTitle]}>Details</Text>
                <Text style={[styles.detailsText, darkMode && styles.darkDetailsText]}>{wishData.details}</Text>
              </View>
            )}
            {wishData?.bounty && (
              <View style={styles.pricingContainer}>
                <View style={styles.pricingRow}>
                  <Text style={styles.bountyEmojiIcon}>💰</Text>
                  <Text style={[styles.pricingLabel, darkMode && styles.darkPricingLabel]}>Bounty: USD {wishData.bounty}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Responses */}
          {responses.length > 0 ? (
            <>
              <Text style={[styles.responsesTitle, darkMode && styles.darkResponsesTitle]}>Responses ({responses.length})</Text>
              {responses.map((response, index) => {
                const responderUser = {
                  firstName: response.profile_personal_first_name || "",
                  lastName: response.profile_personal_last_name || "",
                  email: "",
                  phoneNumber: response.profile_personal_phone_number || "",
                  profileImage: response.profile_personal_image || "",
                  tagLine: response.profile_personal_tag_line || "",
                  emailIsPublic: response.profile_personal_email_is_public === 1,
                  phoneIsPublic: response.profile_personal_phone_number_is_public === 1,
                  tagLineIsPublic: response.profile_personal_tag_line_is_public === 1,
                  imageIsPublic: response.profile_personal_image_is_public === 1,
                };

                return (
                  <View key={response.wish_response_uid || index} style={[styles.responseCard, darkMode && styles.darkResponseCard]}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        console.log("🏢 Navigating to Profile from MiniCard in WishResponses");
                        if (response.profile_personal_uid) {
                          navigation.navigate("Profile", {
                            profile_uid: response.profile_personal_uid,
                            returnTo: "WishResponses",
                            wishResponsesState: {
                              wishData,
                              profileData,
                              profile_uid,
                              profileState,
                            },
                          });
                        }
                      }}
                    >
                      <View style={[styles.miniCardContainer, darkMode && styles.darkMiniCardContainer]}>
                        <MiniCard user={responderUser} />
                      </View>
                    </TouchableOpacity>
                    <View style={[styles.responseNoteContainer, darkMode && styles.darkResponseNoteContainer]}>
                      <Text style={[styles.responseNoteLabel, darkMode && styles.darkResponseNoteLabel]}>Response:</Text>
                      <Text style={[styles.responseNote, darkMode && styles.darkResponseNote]}>{response.wr_responder_note || "No note provided"}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.acceptButton, darkMode && styles.darkAcceptButton, accepting === response.wish_response_uid && styles.disabledButton]}
                      onPress={() => handleAccept(response)}
                      disabled={accepting === response.wish_response_uid}
                    >
                      {accepting === response.wish_response_uid ? (
                        <ActivityIndicator size='small' color='#fff' />
                      ) : (
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </>
          ) : (
            <View style={styles.noResponsesContainer}>
              <Text style={[styles.noResponsesText, darkMode && styles.darkNoResponsesText]}>No responses yet</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerBg: {
    backgroundColor: "#AF52DE",
    paddingTop: 30,
    paddingBottom: 15,
    alignItems: "center",
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },
  darkHeaderBg: {
    backgroundColor: "#8B4C9F",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 53,
    padding: 4,
    zIndex: 1,
  },
  header: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  headerWithBack: {
    marginLeft: 0,
  },
  darkHeader: {
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: "#2d2d2d",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  darkCardTitle: {
    color: "#fff",
  },
  wishTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  darkWishTitle: {
    color: "#fff",
  },
  wishDescription: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 20,
  },
  darkWishDescription: {
    color: "#cccccc",
  },
  detailsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  darkDetailsTitle: {
    color: "#fff",
  },
  detailsText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  darkDetailsText: {
    color: "#cccccc",
  },
  pricingContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 10,
  },
  pricingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bountyEmojiIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  pricingLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  darkPricingLabel: {
    color: "#cccccc",
  },
  responsesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 15,
    color: "#333",
  },
  darkResponsesTitle: {
    color: "#fff",
  },
  responseCard: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  darkResponseCard: {
    backgroundColor: "#2d2d2d",
  },
  miniCardContainer: {
    marginBottom: 15,
  },
  darkMiniCardContainer: {
    backgroundColor: "transparent",
  },
  responseNoteContainer: {
    marginBottom: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  darkResponseNoteContainer: {
    borderTopColor: "#404040",
  },
  responseNoteLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  darkResponseNoteLabel: {
    color: "#fff",
  },
  responseNote: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  darkResponseNote: {
    color: "#cccccc",
  },
  acceptButton: {
    backgroundColor: "#00C7BE",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    minWidth: 150,
  },
  darkAcceptButton: {
    backgroundColor: "#00A69C",
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
  noResponsesContainer: {
    padding: 40,
    alignItems: "center",
  },
  noResponsesText: {
    fontSize: 16,
    color: "#999",
    fontStyle: "italic",
  },
  darkNoResponsesText: {
    color: "#666",
  },
  darkPageContainer: {
    backgroundColor: "#1a1a1a",
  },
});

export default WishResponsesScreen;

