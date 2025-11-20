// ExpertiseDetailScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MiniCard from "../components/MiniCard";
import { useDarkMode } from "../contexts/DarkModeContext";

export default function ExpertiseDetailScreen({ route, navigation }) {
  const { expertiseData, profileData, profile_uid, searchState } = route.params;
  const { darkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);

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

  const handleBuyNow = () => {
    // TODO: Implement buy now functionality
    console.log("Buy Now clicked for expertise:", expertiseData?.expertise_uid);
    // This could navigate to a checkout screen or initiate a purchase flow
  };

  const handleBack = () => {
    // Return to Search screen with preserved state
    if (searchState) {
      console.log("🔙 Returning to Search with preserved state:", searchState);
      navigation.navigate("Search", {
        restoreState: true,
        searchState: searchState,
      });
    } else {
      navigation.goBack();
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
          <Text style={[styles.header, darkMode && styles.darkHeader, styles.headerWithBack]}>Expertise</Text>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* User MiniCard */}
        <View style={[styles.card, darkMode && styles.darkCard]}>
          <MiniCard user={userForMiniCard} />
        </View>

        {/* Expertise Description */}
        <View style={[styles.card, darkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, darkMode && styles.darkCardTitle]}>Expertise Description</Text>

          {expertiseData?.title && <Text style={[styles.expertiseTitle, darkMode && styles.darkExpertiseTitle]}>{expertiseData.title}</Text>}

          {expertiseData?.description && <Text style={[styles.expertiseDescription, darkMode && styles.darkExpertiseDescription]}>{expertiseData.description}</Text>}

          {/* Expertise Details */}
          {expertiseData?.details && (
            <View style={styles.detailsContainer}>
              <Text style={[styles.detailsTitle, darkMode && styles.darkDetailsTitle]}>Expertise Details</Text>
              <Text style={[styles.detailsText, darkMode && styles.darkDetailsText]}>{expertiseData.details}</Text>
            </View>
          )}

          {/* Cost and Bounty */}
          <View style={styles.pricingContainer}>
            {expertiseData?.cost && (
              <View style={styles.pricingRow}>
                <View style={styles.moneyBagIconContainer}>
                  <Text style={styles.moneyBagDollarSymbol}>$</Text>
                </View>
                <Text style={[styles.pricingLabel, darkMode && styles.darkPricingLabel]}>Cost: {expertiseData.cost}</Text>
              </View>
            )}
            {expertiseData?.bounty && (
              <View style={styles.pricingRow}>
                <Text style={styles.bountyEmojiIcon}>💰</Text>
                <Text style={[styles.pricingLabel, darkMode && styles.darkPricingLabel]}>Bounty: USD {expertiseData.bounty}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Buy Now Button */}
      <View style={[styles.buyNowContainer, darkMode && styles.darkBuyNowContainer]}>
        <TouchableOpacity style={[styles.buyNowButton, darkMode && styles.darkBuyNowButton]} onPress={handleBuyNow}>
          <Text style={styles.buyNowButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerBg: {
    backgroundColor: "#FF9500",
    paddingVertical: 15,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    left: 20,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  expertiseTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  expertiseDescription: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 20,
  },
  pricingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  pricingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  moneyBagIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFCD3C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  moneyBagDollarSymbol: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
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
  detailsText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  buyNowContainer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: "#F5F5F5",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  buyNowButton: {
    backgroundColor: "#00C7BE",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    minWidth: 200,
  },
  buyNowButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  // Dark mode styles
  darkPageContainer: {
    backgroundColor: "#1a1a1a",
  },
  darkHeaderBg: {
    backgroundColor: "#CC7700",
  },
  darkHeader: {
    color: "#fff",
  },
  darkCard: {
    backgroundColor: "#2d2d2d",
  },
  darkCardTitle: {
    color: "#fff",
  },
  darkExpertiseTitle: {
    color: "#fff",
  },
  darkExpertiseDescription: {
    color: "#cccccc",
  },
  darkPricingLabel: {
    color: "#cccccc",
  },
  darkDetailsTitle: {
    color: "#fff",
  },
  darkDetailsText: {
    color: "#cccccc",
  },
  darkBuyNowContainer: {
    backgroundColor: "#1a1a1a",
    borderTopColor: "#404040",
  },
  darkBuyNowButton: {
    backgroundColor: "#00A69C",
  },
});
