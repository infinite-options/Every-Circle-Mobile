import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, ScrollView, Image, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
// import axios from 'axios';
import MiniCard from "../components/MiniCard";
import BottomNavBar from "../components/BottomNavBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { API_BASE_URL, USER_PROFILE_INFO_ENDPOINT, BUSINESS_INFO_ENDPOINT } from "../apiConfig";
import { useDarkMode } from "../contexts/DarkModeContext";

const ProfileScreenAPI = USER_PROFILE_INFO_ENDPOINT;
console.log(`ProfileScreen - Full endpoint: ${ProfileScreenAPI}`);

const ProfileScreen = ({ route, navigation }) => {
  // modified on 11/08 - for network profile navigation
  // Allows opening a specific user's profile when navigating from the Network screen
  const { profile_uid: routeProfileUID, returnTo, searchState } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profileUID, setProfileUID] = useState("");
  const [businessesData, setBusinessesData] = useState([]);
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(false);
  const { darkMode } = useDarkMode();

  useFocusEffect(
    React.useCallback(() => {
      async function loadProfile() {
        console.log("ProfileScreen - useFocusEffect triggered, reloading profile data");
        setLoading(true);

        // Check if a specific profile_uid was passed via route params (for viewing other users' profiles)
        const loggedInProfileUID = await AsyncStorage.getItem("profile_uid");

        if (routeProfileUID) {
          console.log("ProfileScreen - Loading profile from route params:", routeProfileUID);
          console.log("ProfileScreen - Logged in profile UID:", loggedInProfileUID);
          setProfileUID(routeProfileUID);
          // Check if the profile being viewed matches the logged-in user's profile
          setIsCurrentUserProfile(routeProfileUID === loggedInProfileUID);
          await fetchUserData(routeProfileUID);
          return;
        }

        let profileId = loggedInProfileUID;
        console.log("ProfileScreen - profileId from AsyncStorage:", profileId);
        if (profileId) {
          setProfileUID(profileId);
          console.log("ProfileScreen - Setting profileUID state to:", profileId);
          // This is the logged-in user's own profile
          setIsCurrentUserProfile(true);
          await fetchUserData(profileId);
          return;
        }

        // If no profile_uid, try to get user_uid and fetch profile
        const userId = await AsyncStorage.getItem("user_uid");
        console.log("ProfileScreen - userId:", userId);
        if (userId) {
          try {
            const response = await fetch(`${ProfileScreenAPI}/${userId}`);
            const apiUser = await response.json();
            if (apiUser && apiUser.personal_info?.profile_personal_uid) {
              profileId = apiUser.personal_info.profile_personal_uid;
              setProfileUID(profileId);
              // This is the logged-in user's own profile (fetched via user_uid)
              setIsCurrentUserProfile(true);
              await AsyncStorage.setItem("profile_uid", profileId);
              await fetchUserData(profileId);
              return;
            }
          } catch (err) {
            console.error("Error fetching profile by user_uid:", err);
          }
        }

        // If still not found, show error
        setLoading(false);
        Alert.alert("Error", "Failed to load profile data. Please log in again.");
      }
      loadProfile();
    }, [routeProfileUID]) // modified on 11/08 - dependency added
  );

  async function fetchUserData(profileUID) {
    try {
      console.log("Fetching user data for profile UID:", profileUID);
      const response = await fetch(`${ProfileScreenAPI}/${profileUID}`);
      const apiUser = await response.json();
      console.log("ProfileScreen.js - Profile API Response:", JSON.stringify(apiUser, null, 2));

      if (!apiUser || apiUser.message === "Profile not found for this user") {
        console.log("No profile data found for user");
        setUser(null);
        setLoading(false);
        return;
      }

      const userData = {
        profile_uid: profileUID,
        email: apiUser?.user_email || "",
        firstName: apiUser.personal_info?.profile_personal_first_name || "",
        lastName: apiUser.personal_info?.profile_personal_last_name || "",
        phoneNumber: apiUser.personal_info?.profile_personal_phone_number || "",
        tagLine: apiUser.personal_info?.profile_personal_tag_line || "",
        shortBio: apiUser.personal_info?.profile_personal_short_bio || "",
        emailIsPublic: apiUser.personal_info?.profile_personal_email_is_public === 1,
        phoneIsPublic: apiUser.personal_info?.profile_personal_phone_number_is_public === 1,
        imageIsPublic: apiUser.personal_info?.profile_personal_image_is_public === 1,
        tagLineIsPublic: apiUser.personal_info?.profile_personal_tag_line_is_public === 1,
        shortBioIsPublic: apiUser.personal_info?.profile_personal_short_bio_is_public === 1,
        experienceIsPublic: apiUser.personal_info?.profile_personal_experience_is_public === 1,
        educationIsPublic: apiUser.personal_info?.profile_personal_education_is_public === 1,
        expertiseIsPublic: apiUser.personal_info?.profile_personal_expertise_is_public === 1,
        wishesIsPublic: apiUser.personal_info?.profile_personal_wishes_is_public === 1,
        businessIsPublic: apiUser.personal_info?.profile_personal_business_is_public === 1,
        profileImage: apiUser.personal_info?.profile_personal_image ? String(apiUser.personal_info.profile_personal_image) : "",
      };
      userData.experience = apiUser.experience_info
        ? (typeof apiUser.experience_info === "string" ? JSON.parse(apiUser.experience_info) : apiUser.experience_info).map((exp) => ({
            profile_experience_uid: exp.profile_experience_uid || "",
            company: exp.profile_experience_company_name || "",
            title: exp.profile_experience_position || "",
            description: exp.profile_experience_description || "",
            startDate: exp.profile_experience_start_date || "",
            endDate: exp.profile_experience_end_date || "",
            isPublic: exp.profile_experience_is_public === 1 || exp.isPublic === true,
          }))
        : [];
      userData.education = apiUser.education_info
        ? (typeof apiUser.education_info === "string" ? JSON.parse(apiUser.education_info) : apiUser.education_info).map((edu) => ({
            profile_education_uid: edu.profile_education_uid || "",
            school: edu.profile_education_school_name || "",
            degree: edu.profile_education_degree || "",
            startDate: edu.profile_education_start_date || "",
            endDate: edu.profile_education_end_date || "",
            isPublic: edu.profile_education_is_public === 1 || edu.isPublic === true,
          }))
        : [];
      // Log business_info from API
      // console.log("ProfileScreen - apiUser.business_info (raw):", apiUser.business_info);
      // console.log("ProfileScreen - apiUser.business_info type:", typeof apiUser.business_info);

      userData.businesses = apiUser.business_info
        ? (typeof apiUser.business_info === "string" ? JSON.parse(apiUser.business_info) : apiUser.business_info).map((bus) => ({
            profile_business_uid: bus.business_uid || bus.profile_business_uid || "",
            name: bus.business_name || bus.profile_business_name || "",
            role: bus.profile_business_role || bus.role || bus.bu_role || "",
            isApproved: bus.profile_business_approved === "1" || bus.profile_business_approved === 1 || bus.isApproved === true || bus.isApproved === "1",
            isPublic: bus.profile_business_is_visible === "1" || bus.profile_business_is_visible === 1 || bus.isPublic === true || bus.isPublic === "1",
          }))
        : [];

      console.log("ProfileScreen - userData.businesses (after mapping):", JSON.stringify(userData.businesses, null, 2));
      console.log("ProfileScreen - userData.businesses.length:", userData.businesses.length);

      userData.expertise = apiUser.expertise_info
        ? (typeof apiUser.expertise_info === "string" ? JSON.parse(apiUser.expertise_info) : apiUser.expertise_info).map((exp) => ({
            profile_expertise_uid: exp.profile_expertise_uid || "",
            name: exp.profile_expertise_title || "",
            description: exp.profile_expertise_description || "",
            cost: exp.profile_expertise_cost || "",
            bounty: exp.profile_expertise_bounty || "",
            isPublic: exp.profile_expertise_is_public === 1 || exp.isPublic === true,
          }))
        : [];
      userData.wishes = apiUser.wishes_info
        ? (typeof apiUser.wishes_info === "string" ? JSON.parse(apiUser.wishes_info) : apiUser.wishes_info).map((wish) => ({
            profile_wish_uid: wish.profile_wish_uid || "",
            helpNeeds: wish.profile_wish_title || "",
            details: wish.profile_wish_description || "",
            amount: wish.profile_wish_bounty || "",
            isPublic: wish.profile_wish_is_public === 1 || wish.isPublic === true,
            wish_responses: wish.wish_responses || 0,
          }))
        : [];
      const socialLinks = apiUser.social_links && typeof apiUser.social_links === "string" ? JSON.parse(apiUser.social_links) : {};
      userData.facebook = socialLinks.facebook || "";
      userData.twitter = socialLinks.twitter || "";
      userData.linkedin = socialLinks.linkedin || "";
      userData.youtube = socialLinks.youtube || "";
      console.log("ProfileScreen - Setting user data:", userData);
      console.log("ProfileScreen - Profile UID in userData:", userData.profile_uid);
      setUser(userData);

      if (userData.businesses && userData.businesses.length > 0) {
        console.log("ProfileScreen - Calling fetchBusinessesData with businesses:", userData.businesses);
        fetchBusinessesData(userData.businesses);
      } else {
        console.log("ProfileScreen - No businesses found or empty array. Setting businessesData to []");
        console.log("ProfileScreen - userData.businesses:", userData.businesses);
        setBusinessesData([]);
        setLoading(false);
      }
    } catch (error) {
      setUser(null);
      setLoading(false);
    }
  }

  // Log businessesData changes for debugging (runs only when businessesData changes, not on every render)
  useEffect(() => {
    console.log("ProfileScreen - businessesData changed:", businessesData);
    console.log("ProfileScreen - businessesData.length:", businessesData?.length);
  }, [businessesData]);

  const fetchBusinessesData = async (businesses) => {
    try {
      // console.log("ProfileScreen - fetchBusinessesData called with businesses:", JSON.stringify(businesses, null, 2));
      // console.log("ProfileScreen - Number of businesses to fetch:", businesses.length);

      const businessPromises = businesses.map(async (bus) => {
        console.log("ProfileScreen - Processing business:", bus);
        if (!bus.profile_business_uid) {
          console.log("ProfileScreen - Skipping business - no profile_business_uid:", bus);
          return null;
        }

        try {
          const businessEndpoint = `${BUSINESS_INFO_ENDPOINT}/${bus.profile_business_uid}`;
          console.log("ProfileScreen - Fetching business from:", businessEndpoint);
          const response = await fetch(businessEndpoint);
          const result = await response.json();
          // console.log("ProfileScreen - Business API response for", bus.profile_business_uid, ":", JSON.stringify(result, null, 2));

          if (!result || !result.business) {
            console.log("ProfileScreen - No business data in response for", bus.profile_business_uid);
            return null;
          }

          const rawBusiness = result.business;

          let businessImages = [];
          if (rawBusiness.business_google_photos) {
            if (typeof rawBusiness.business_google_photos === "string") {
              try {
                businessImages = JSON.parse(rawBusiness.business_google_photos);
              } catch (e) {
                businessImages = [rawBusiness.business_google_photos];
              }
            } else if (Array.isArray(rawBusiness.business_google_photos)) {
              businessImages = rawBusiness.business_google_photos;
            }
          }

          if (rawBusiness.business_images_url) {
            let uploadedImages = [];
            if (typeof rawBusiness.business_images_url === "string") {
              try {
                uploadedImages = JSON.parse(rawBusiness.business_images_url);
              } catch (e) {
                uploadedImages = [];
              }
            } else if (Array.isArray(rawBusiness.business_images_url)) {
              uploadedImages = rawBusiness.business_images_url;
            }
            uploadedImages = uploadedImages
              .map((img) => {
                if (img && typeof img === "string") {
                  if (img.startsWith("http://") || img.startsWith("https://")) {
                    return img;
                  }
                  return `https://s3-us-west-1.amazonaws.com/every-circle/business_personal/${rawBusiness.business_uid}/${img}`;
                }
                return null;
              })
              .filter(Boolean);
            businessImages = [...uploadedImages, ...businessImages];
          }

          // Get role and approval status from the original business_info entry
          const originalBusiness = businesses.find((b) => b.profile_business_uid === bus.profile_business_uid);

          // Return business object matching BusinessProfileScreen structure for MiniCard
          return {
            business_name: rawBusiness.business_name || "",
            business_address_line_1: rawBusiness.business_address_line_1 || "",
            business_zip_code: rawBusiness.business_zip_code || "",
            business_phone_number: rawBusiness.business_phone_number || "",
            business_email: rawBusiness.business_email_id || "",
            business_website: rawBusiness.business_website || "",
            first_image: businessImages && businessImages.length > 0 ? businessImages[0] : null,
            phoneIsPublic:
              rawBusiness.business_phone_number_is_public === "1" || rawBusiness.business_phone_number_is_public === 1 || rawBusiness.phone_is_public === "1" || rawBusiness.phone_is_public === 1,
            emailIsPublic: rawBusiness.business_email_id_is_public === "1" || rawBusiness.business_email_id_is_public === 1 || rawBusiness.email_is_public === "1" || rawBusiness.email_is_public === 1,
            business_uid: rawBusiness.business_uid || "",
            role: originalBusiness?.role || "",
            isApproved: originalBusiness?.isApproved || false,
          };
        } catch (error) {
          console.error(`Error fetching business ${bus.profile_business_uid}:`, error);
          return null;
        }
      });
      const fetchedBusinesses = await Promise.all(businessPromises);
      // console.log("ProfileScreen - Fetched businesses (before filter):", JSON.stringify(fetchedBusinesses, null, 2));
      const validBusinesses = fetchedBusinesses.filter(Boolean);
      // console.log("ProfileScreen - Valid businesses (after filter):", JSON.stringify(validBusinesses, null, 2));
      // console.log("ProfileScreen - Setting businessesData with", validBusinesses.length, "businesses");
      setBusinessesData(validBusinesses);
    } catch (error) {
      // console.error("ProfileScreen - Error fetching businesses data:", error);
      setBusinessesData([]);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label, value, isPublic) => {
    if (isPublic && value && value.trim() !== "") {
      return (
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>{label}:</Text>
          <Text style={styles.plainText}>{value}</Text>
        </View>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <View style={[styles.pageContainer, darkMode && styles.darkPageContainer, { flex: 1, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size='large' color={darkMode ? "#ffffff" : "#007BFF"} style={{ marginTop: 50 }} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.pageContainer, darkMode && styles.darkPageContainer, { flex: 1, justifyContent: "center", alignItems: "center" }]}>
        <Text style={[styles.errorText, darkMode && styles.darkErrorText]}>No user data available. Please try again.</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={{
            backgroundColor: "#007AFF",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.pageContainer, darkMode && styles.darkPageContainer]}>
      {/* Header */}
      <View
        style={[
          styles.headerBg,
          darkMode && styles.darkHeaderBg,
          routeProfileUID && !isCurrentUserProfile && styles.headerBgOtherUser,
          routeProfileUID && !isCurrentUserProfile && darkMode && styles.darkHeaderBgOtherUser,
        ]}
      >
        <View style={styles.headerContent}>
          {routeProfileUID && !isCurrentUserProfile && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                // Navigate back to the screen we came from with preserved state
                if (returnTo === "Search" && searchState) {
                  console.log("🔙 Returning to Search with preserved state:", searchState);
                  navigation.navigate("Search", {
                    restoreState: true,
                    searchState: searchState,
                  });
                } else if (returnTo === "ExpertiseDetail" && route.params?.expertiseDetailState) {
                  // Navigate back to ExpertiseDetail screen
                  console.log("🔙 Returning to ExpertiseDetail");
                  const { expertiseData, profileData, profile_uid, searchState, returnTo: detailReturnTo, profileState: detailProfileState } = route.params.expertiseDetailState;
                  navigation.navigate("ExpertiseDetail", {
                    expertiseData,
                    profileData,
                    profile_uid,
                    searchState,
                    returnTo: detailReturnTo,
                    profileState: detailProfileState,
                  });
                } else if (returnTo === "WishDetail" && route.params?.wishDetailState) {
                  // Navigate back to WishDetail screen
                  console.log("🔙 Returning to WishDetail");
                  const { wishData, profileData, profile_uid, searchState, returnTo: detailReturnTo, profileState: detailProfileState } = route.params.wishDetailState;
                  navigation.navigate("WishDetail", {
                    wishData,
                    profileData,
                    profile_uid,
                    searchState,
                    returnTo: detailReturnTo,
                    profileState: detailProfileState,
                  });
                } else if (returnTo === "WishResponses" && route.params?.wishResponsesState) {
                  // Navigate back to WishResponses screen
                  console.log("🔙 Returning to WishResponses");
                  const { wishData, profileData, profile_uid, profileState: wishResponsesProfileState } = route.params.wishResponsesState;
                  navigation.navigate("WishResponses", {
                    wishData,
                    profileData,
                    profile_uid,
                    profileState: wishResponsesProfileState,
                  });
                } else if (returnTo === "Network") {
                  // Navigate back to Network screen
                  console.log("🔙 Returning to Network");
                  navigation.navigate("Network");
                } else {
                  // Default: Navigate to Network screen when viewing another user's profile
                  navigation.navigate("Network");
                }
              }}
            >
              <Ionicons name='arrow-back' size={24} color='#fff' />
            </TouchableOpacity>
          )}
          <Text style={[styles.header, darkMode && styles.darkHeader, routeProfileUID && !isCurrentUserProfile && styles.headerWithBack]}>{isCurrentUserProfile ? "Your Profile" : "Profile"}</Text>
          {isCurrentUserProfile && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                navigation.navigate("EditProfile", {
                  user: user,
                  profile_uid: profileUID,
                })
              }
            >
              <Image source={require("../assets/Edit.png")} style={[styles.editIcon, darkMode && styles.darkEditIcon]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <SafeAreaView style={[styles.safeArea, darkMode && styles.darkSafeArea]}>
        <ScrollView style={[styles.scrollContainer, darkMode && styles.darkScrollContainer]} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
          <View style={[styles.cardContainer, darkMode && styles.darkCardContainer]}>
            <Image
              source={
                user.profileImage && (isCurrentUserProfile || user.imageIsPublic) && user.profileImage !== "" && String(user.profileImage).trim() !== ""
                  ? { uri: String(user.profileImage) }
                  : require("../assets/profile.png")
              }
              style={styles.profileImage}
              onError={(error) => {
                console.log("ProfileScreen image failed to load:", error.nativeEvent.error);
                console.log("Problematic profile image URI:", user.profileImage);
              }}
              defaultSource={require("../assets/profile.png")}
            />
            <Text style={[styles.nameText, darkMode && styles.darkNameText]}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={[styles.profileId, darkMode && styles.darkProfileId]}>Profile ID: {profileUID}</Text>
            {user.tagLine && (isCurrentUserProfile || user.tagLineIsPublic) && <Text style={[styles.tagline, darkMode && styles.darkTagline]}>{user.tagLine}</Text>}
            {user.shortBio && (isCurrentUserProfile || user.shortBioIsPublic) && <Text style={[styles.bio, darkMode && styles.darkBio]}>{user.shortBio}</Text>}
            {user.phoneNumber && (isCurrentUserProfile || user.phoneIsPublic) && <Text style={[styles.contact, darkMode && styles.darkContact]}>{user.phoneNumber}</Text>}
            {user.email && (isCurrentUserProfile || user.emailIsPublic) && <Text style={[styles.contact, darkMode && styles.darkContact]}>{user.email}</Text>}
          </View>

          <MiniCard
            user={{
              ...user,
              imageIsPublic: user.imageIsPublic,
              profileImage: isCurrentUserProfile || user.imageIsPublic ? user.profileImage : "",
            }}
          />

          {/* Only show Experience section if there are public experiences, or if viewing own profile */}
          {(isCurrentUserProfile || (user.experience && user.experience.filter((exp) => exp.isPublic).length > 0)) && (
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, darkMode && styles.darkLabel]}>Experience:</Text>
              {user.experience && user.experience.filter((exp) => exp.isPublic).length > 0 ? (
                user.experience
                  .filter((exp) => exp.isPublic)
                  .map((exp, index, arr) => (
                    <View key={index} style={[styles.inputContainer, darkMode && styles.darkInputContainer, index > 0 && { marginTop: 4 }]}>
                      {exp.startDate || exp.endDate ? (
                        <Text style={[styles.inputText, darkMode && styles.darkInputText]}>
                          {(exp.startDate ? exp.startDate : "") + (exp.startDate && exp.endDate ? " - " : "") + (exp.endDate ? exp.endDate : "")}
                        </Text>
                      ) : null}
                      <Text style={[styles.inputText, darkMode && styles.darkInputText]}>{exp.company || ""}</Text>
                      <Text style={[styles.inputText, darkMode && styles.darkInputText]}>{exp.title || ""}</Text>
                      {exp.description && <Text style={[styles.inputText, darkMode && styles.darkInputText]}>{exp.description}</Text>}
                    </View>
                  ))
              ) : (
                <Text style={[styles.inputText, darkMode && styles.darkInputText, { fontStyle: "italic", color: darkMode ? "#999" : "#666" }]}>No experience added yet</Text>
              )}
            </View>
          )}

          {/* Only show Education section if there are public education entries, or if viewing own profile */}
          {(isCurrentUserProfile || (user.education && user.education.filter((edu) => edu.isPublic).length > 0)) && (
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, darkMode && styles.darkLabel]}>Education:</Text>
              {user.education && user.education.filter((edu) => edu.isPublic).length > 0 ? (
                user.education
                  .filter((edu) => edu.isPublic)
                  .map((edu, index) => (
                    <View key={index} style={[styles.inputContainer, darkMode && styles.darkInputContainer, index > 0 && { marginTop: 4 }]}>
                      {edu.startDate || edu.endDate ? (
                        <Text style={[styles.inputText, darkMode && styles.darkInputText]}>
                          {(edu.startDate ? edu.startDate : "") + (edu.startDate && edu.endDate ? " - " : "") + (edu.endDate ? edu.endDate : "")}
                        </Text>
                      ) : null}
                      <Text style={[styles.inputText, darkMode && styles.darkInputText]}>{edu.school || ""}</Text>
                      <Text style={[styles.inputText, darkMode && styles.darkInputText]}>{edu.degree || ""}</Text>
                    </View>
                  ))
              ) : (
                <Text style={[styles.inputText, darkMode && styles.darkInputText, { fontStyle: "italic", color: darkMode ? "#999" : "#666" }]}>No education added yet</Text>
              )}
            </View>
          )}

          {/* Only show Expertise section if there are public expertise entries, or if viewing own profile */}
          {(isCurrentUserProfile || (user.expertise && user.expertise.filter((exp) => exp.isPublic).length > 0)) && (
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, darkMode && styles.darkLabel]}>Expertise:</Text>
              {user.expertise && user.expertise.filter((exp) => exp.isPublic).length > 0 ? (
                user.expertise
                  .filter((exp) => exp.isPublic)
                  .map((exp, index) => {
                    const expertiseItem = (
                      <View key={index} style={[styles.inputContainer, darkMode && styles.darkInputContainer, index > 0 && { marginTop: 4 }]}>
                        <Text style={[styles.inputText, darkMode && styles.darkInputText]}>{exp.name || ""}</Text>
                        <Text style={[styles.inputText, darkMode && styles.darkInputText]}>{exp.description || ""}</Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          {exp.cost && (
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                              <View style={styles.moneyBagIconContainer}>
                                <Text style={styles.moneyBagDollarSymbol}>$</Text>
                              </View>
                              <Text style={[styles.inputText, darkMode && styles.darkInputText]}>{exp.cost.toLowerCase() !== "free" ? `Cost: ${exp.cost}` : `Cost: ${exp.cost}`}</Text>
                            </View>
                          )}
                          {exp.bounty && (
                            <Text style={[styles.inputText, { textAlign: "right", minWidth: 60 }, darkMode && styles.darkInputText]}>
                              {exp.bounty.toLowerCase() !== "free" ? `💰 $${exp.bounty}` : `💰 ${exp.bounty}`}
                            </Text>
                          )}
                        </View>
                      </View>
                    );

                    // Make clickable when viewing another user's profile
                    if (routeProfileUID && !isCurrentUserProfile) {
                      return (
                        <TouchableOpacity
                          key={index}
                          activeOpacity={0.7}
                          onPress={() => {
                            console.log("🏢 Navigating to ExpertiseDetail from Profile expertise:", exp.name, "Profile ID:", profileUID);
                            // Prepare expertise data in the format expected by ExpertiseDetailScreen
                            const expertiseData = {
                              expertise_uid: exp.profile_expertise_uid,
                              title: exp.name,
                              description: exp.description,
                              cost: exp.cost,
                              bounty: exp.bounty,
                            };
                            // Prepare profile data
                            const profileData = {
                              firstName: user.firstName,
                              lastName: user.lastName,
                              email: user.email,
                              phone: user.phoneNumber,
                              image: user.profileImage,
                              tagLine: user.tagLine,
                              emailIsPublic: user.emailIsPublic,
                              phoneIsPublic: user.phoneIsPublic,
                              imageIsPublic: user.imageIsPublic,
                              tagLineIsPublic: user.tagLineIsPublic,
                            };
                            navigation.navigate("ExpertiseDetail", {
                              expertiseData,
                              profileData,
                              profile_uid: profileUID,
                              returnTo: "Profile",
                              profileState: {
                                profile_uid: profileUID,
                                returnTo,
                                searchState,
                              },
                            });
                          }}
                        >
                          {expertiseItem}
                        </TouchableOpacity>
                      );
                    }
                    return expertiseItem;
                  })
              ) : (
                <Text style={[styles.inputText, darkMode && styles.darkInputText, { fontStyle: "italic", color: darkMode ? "#999" : "#666" }]}>No expertise added yet</Text>
              )}
            </View>
          )}

          {/* Only show Seeking section if there are public wishes, or if viewing own profile */}
          {(isCurrentUserProfile || (user.wishes && user.wishes.filter((wish) => wish.isPublic).length > 0)) && (
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, darkMode && styles.darkLabel]}>Seeking:</Text>
              {user.wishes && user.wishes.filter((wish) => wish.isPublic).length > 0 ? (
                user.wishes
                  .filter((wish) => wish.isPublic)
                  .map((wish, index) => {
                    const wishItem = (
                      <View key={index} style={[styles.inputContainer, darkMode && styles.darkInputContainer, index > 0 && { marginTop: 4 }]}>
                        {/* Wish Responses Badge - Only show for logged in user's own profile */}
                        {isCurrentUserProfile && wish.wish_responses !== undefined && wish.wish_responses > 0 && (
                          <TouchableOpacity
                            style={styles.wishResponseBadge}
                            onPress={() => {
                              console.log("Wish responses badge clicked for wish:", wish.profile_wish_uid);
                              // Prepare wish data for navigation
                              const wishDataForNavigation = {
                                wish_uid: wish.profile_wish_uid,
                                title: wish.helpNeeds,
                                description: wish.details,
                                bounty: wish.amount,
                              };
                              // Prepare profile data
                              const profileDataForNavigation = {
                                firstName: user.firstName,
                                lastName: user.lastName,
                                email: user.email,
                                phone: user.phoneNumber,
                                image: user.profileImage,
                                tagLine: user.tagLine,
                                emailIsPublic: user.emailIsPublic,
                                phoneIsPublic: user.phoneIsPublic,
                                imageIsPublic: user.imageIsPublic,
                                tagLineIsPublic: user.tagLineIsPublic,
                              };
                              navigation.navigate("WishResponses", {
                                wishData: wishDataForNavigation,
                                profileData: profileDataForNavigation,
                                profile_uid: profileUID,
                                profileState: {
                                  profile_uid: profileUID,
                                  returnTo,
                                  searchState,
                                },
                              });
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.wishResponseBadgeText}>{wish.wish_responses || 0}</Text>
                          </TouchableOpacity>
                        )}
                        <Text style={[styles.inputText, darkMode && styles.darkInputText]}>{wish.helpNeeds || ""}</Text>
                        <Text style={[styles.inputText, darkMode && styles.darkInputText]}>{wish.details || ""}</Text>
                        <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
                          <Text style={[styles.inputText, { textAlign: "right", minWidth: 60 }, darkMode && styles.darkInputText]}>{wish.amount ? `💰 $${wish.amount}` : ""}</Text>
                        </View>
                      </View>
                    );

                    // Make clickable when viewing another user's profile
                    if (routeProfileUID && !isCurrentUserProfile) {
                      return (
                        <TouchableOpacity
                          key={index}
                          activeOpacity={0.7}
                          onPress={() => {
                            console.log("🏢 Navigating to WishDetail from Profile wish:", wish.helpNeeds, "Profile ID:", profileUID);
                            // Prepare wish data in the format expected by WishDetailScreen
                            const wishData = {
                              wish_uid: wish.profile_wish_uid,
                              title: wish.helpNeeds,
                              description: wish.details,
                              bounty: wish.amount,
                            };
                            // Prepare profile data
                            const profileData = {
                              firstName: user.firstName,
                              lastName: user.lastName,
                              email: user.email,
                              phone: user.phoneNumber,
                              image: user.profileImage,
                              tagLine: user.tagLine,
                              emailIsPublic: user.emailIsPublic,
                              phoneIsPublic: user.phoneIsPublic,
                              imageIsPublic: user.imageIsPublic,
                              tagLineIsPublic: user.tagLineIsPublic,
                            };
                            navigation.navigate("WishDetail", {
                              wishData,
                              profileData,
                              profile_uid: profileUID,
                              returnTo: "Profile",
                              profileState: {
                                profile_uid: profileUID,
                                returnTo,
                                searchState,
                              },
                            });
                          }}
                        >
                          {wishItem}
                        </TouchableOpacity>
                      );
                    }
                    return wishItem;
                  })
              ) : (
                <Text style={[styles.inputText, darkMode && styles.darkInputText, { fontStyle: "italic", color: darkMode ? "#999" : "#666" }]}>No seeking added yet</Text>
              )}
            </View>
          )}

          {/* Only show Businesses section if there are businesses, or if viewing own profile */}
          {(isCurrentUserProfile || (businessesData && businessesData.length > 0)) && (
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, darkMode && styles.darkLabel]}>Businesses:</Text>
              {businessesData && businessesData.length > 0 ? (
                businessesData.map((business, index) => (
                  <TouchableOpacity
                    key={business.business_uid || index}
                    onPress={() => {
                      if (business.business_uid) {
                        navigation.navigate("BusinessProfile", { business_uid: business.business_uid });
                      }
                    }}
                    style={[styles.businessCardContainer, darkMode && styles.darkBusinessCardContainer, index > 0 && { marginTop: 10 }]}
                  >
                    <MiniCard business={business} />
                    {business.role && (
                      <View style={styles.roleContainer}>
                        <Text style={[styles.roleText, darkMode && styles.darkRoleText]}>Role: {business.role}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={[styles.inputText, darkMode && styles.darkInputText, { fontStyle: "italic", color: darkMode ? "#999" : "#666" }]}>No businesses added yet</Text>
              )}
            </View>
          )}
        </ScrollView>

        <BottomNavBar navigation={navigation} />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: { flex: 1, backgroundColor: "#fff", padding: 0 },
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { flex: 1 },
  headerBg: {
    backgroundColor: "#AF52DE",
    paddingTop: 30,
    paddingBottom: 15,
    alignItems: "center",
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },
  headerBgOtherUser: {
    backgroundColor: "#FF9500",
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
  header: { color: "#fff", fontSize: 20, fontWeight: "bold", flex: 1, textAlign: "center" },
  headerWithBack: {
    marginLeft: 0,
  },
  fieldContainer: { marginTop: 15, marginBottom: 0 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f5f5f5",
    marginBottom: 4,
  },
  inputText: { fontSize: 15, color: "#333", marginBottom: 4 },
  plainText: { fontSize: 15, color: "#333", marginBottom: 10 },
  editButton: {
    position: "absolute",
    right: 53,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  editIcon: { width: 20, height: 20 },
  errorText: { fontSize: 18, color: "red", textAlign: "center", marginTop: 20 },
  cardContainer: {
    padding: 0,
    alignItems: "flex-start",
    marginBottom: 0,
  },
  nameText: { fontSize: 26, fontWeight: "bold", color: "#000", marginBottom: 8 },
  profileId: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontStyle: "italic",
  },
  tagline: {
    fontSize: 18,
    fontWeight: "600",
    color: "#777",
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: "#777",
    marginBottom: 20,
  },
  contact: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: "#eee",
  },
  // Dark mode styles
  darkPageContainer: {
    backgroundColor: "#1a1a1a",
  },
  darkSafeArea: {
    backgroundColor: "#1a1a1a",
  },
  darkScrollContainer: {
    backgroundColor: "#1a1a1a",
  },
  darkHeaderBg: {
    backgroundColor: "#8B4C9F",
  },
  darkHeaderBgOtherUser: {
    backgroundColor: "#CC7700",
  },
  darkHeader: {
    color: "#ffffff",
  },
  darkCardContainer: {
    backgroundColor: "#2d2d2d",
  },
  darkNameText: {
    color: "#ffffff",
  },
  darkProfileId: {
    color: "#cccccc",
  },
  darkTagline: {
    color: "#cccccc",
  },
  darkBio: {
    color: "#cccccc",
  },
  darkContact: {
    color: "#cccccc",
  },
  darkLabel: {
    color: "#ffffff",
  },
  darkInputContainer: {
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
  },
  darkInputText: {
    color: "#ffffff",
  },
  darkErrorText: {
    color: "#ff6b6b",
  },
  darkEditIcon: {
    tintColor: "#ffffff",
  },
  businessCardContainer: {
    marginBottom: 10,
    borderRadius: 10,
    overflow: "visible",
  },
  darkBusinessCardContainer: {
    backgroundColor: "transparent",
  },
  roleContainer: {
    marginTop: 8,
    paddingLeft: 10,
  },
  roleText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#666",
  },
  darkRoleText: {
    color: "#999",
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
  wishResponseBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#AF52DE",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  wishResponseBadgeText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
