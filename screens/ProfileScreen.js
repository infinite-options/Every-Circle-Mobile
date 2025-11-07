import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, ScrollView, Image } from "react-native";
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
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profileUID, setProfileUID] = useState("");
  const [businessesData, setBusinessesData] = useState([]);
  const { darkMode } = useDarkMode();

  useFocusEffect(
    React.useCallback(() => {
      async function loadProfile() {
        console.log("ProfileScreen - useFocusEffect triggered, reloading profile data");
        setLoading(true);
        let profileId = await AsyncStorage.getItem("profile_uid");
        console.log("ProfileScreen - profileId from AsyncStorage:", profileId);
        if (profileId) {
          setProfileUID(profileId);
          console.log("ProfileScreen - Setting profileUID state to:", profileId);
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
    }, [])
  );

  async function fetchUserData(profileUID) {
    try {
      console.log("Fetching user data for profile UID:", profileUID);
      const response = await fetch(`${ProfileScreenAPI}/${profileUID}`);
      const apiUser = await response.json();
      console.log("Profile API Response:", JSON.stringify(apiUser, null, 2));

      if (!apiUser || apiUser.message === "Profile not found for this user") {
        console.log("No profile data found for user");
        setUser(null);
        setLoading(false);
        return;
      }

      // Log each section of the response - turn on or off as needed
      // console.log('Personal Info:', apiUser.personal_info);
      // console.log('Experience Info:', apiUser.experience_info);
      // console.log('Education Info:', apiUser.education_info);
      // console.log('Business Info:', apiUser.business_info);
      // console.log('Expertise Info:', apiUser.expertise_info);
      // console.log('Wishes Info:', apiUser.wishes_info);
      // console.log('Social Links:', apiUser.social_links);
      // console.log('Ratings Info:', apiUser.ratings_info);

      // Map API data to display fields (same as in main logic)
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
      console.log("ProfileScreen - apiUser.business_info (raw):", apiUser.business_info);
      console.log("ProfileScreen - apiUser.business_info type:", typeof apiUser.business_info);

      userData.businesses = apiUser.business_info
        ? (typeof apiUser.business_info === "string" ? JSON.parse(apiUser.business_info) : apiUser.business_info).map((bus) => ({
            profile_business_uid: bus.business_uid || "",
            name: bus.business_name || "",
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

      // Fetch business details for each business
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

  const fetchBusinessesData = async (businesses) => {
    try {
      console.log("ProfileScreen - fetchBusinessesData called with businesses:", JSON.stringify(businesses, null, 2));
      console.log("ProfileScreen - Number of businesses to fetch:", businesses.length);

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
          console.log("ProfileScreen - Business API response for", bus.profile_business_uid, ":", JSON.stringify(result, null, 2));

          if (!result || !result.business) {
            console.log("ProfileScreen - No business data in response for", bus.profile_business_uid);
            return null;
          }

          const rawBusiness = result.business;

          // Process images similar to BusinessProfileScreen
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

          // Handle business_images_url
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

          return {
            business_name: rawBusiness.business_name || "",
            business_address_line_1: rawBusiness.business_address_line_1 || "",
            business_zip_code: rawBusiness.business_zip_code || "",
            business_phone_number: rawBusiness.business_phone_number || "",
            business_email: rawBusiness.business_email_id || "",
            business_website: rawBusiness.business_website || "",
            first_image: businessImages && businessImages.length > 0 ? businessImages[0] : null,
            phoneIsPublic: rawBusiness.business_phone_number_is_public === "1" || rawBusiness.phone_is_public === "1",
            emailIsPublic: rawBusiness.business_email_id_is_public === "1" || rawBusiness.email_is_public === "1",
            business_uid: rawBusiness.business_uid || "",
          };
        } catch (error) {
          console.error(`Error fetching business ${bus.profile_business_uid}:`, error);
          return null;
        }
      });

      const fetchedBusinesses = await Promise.all(businessPromises);
      console.log("ProfileScreen - Fetched businesses (before filter):", JSON.stringify(fetchedBusinesses, null, 2));
      const validBusinesses = fetchedBusinesses.filter(Boolean);
      console.log("ProfileScreen - Valid businesses (after filter):", JSON.stringify(validBusinesses, null, 2));
      console.log("ProfileScreen - Setting businessesData with", validBusinesses.length, "businesses");
      setBusinessesData(validBusinesses);
    } catch (error) {
      console.error("ProfileScreen - Error fetching businesses data:", error);
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
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={{ backgroundColor: "#007AFF", padding: 12, borderRadius: 8 }}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.pageContainer, darkMode && styles.darkPageContainer]}>
      <ScrollView style={[styles.container, darkMode && styles.darkContainer]} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.headerContainer}>
          <Text style={[styles.header, darkMode && styles.darkHeader]}>Your Profile</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate("EditProfile", { user: user, profile_uid: profileUID })}>
            <Image source={require("../assets/Edit.png")} style={[styles.editIcon, darkMode && styles.darkEditIcon]} />
          </TouchableOpacity>
        </View>

        <View style={[styles.cardContainer, darkMode && styles.darkCardContainer]}>
          {/* This is the Profile Image */}
          <Image
            source={user.profileImage && user.profileImage !== "" && String(user.profileImage).trim() !== "" ? { uri: String(user.profileImage) } : require("../assets/profile.png")}
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
          {/* Display Profile ID */}
          <Text style={[styles.profileId, darkMode && styles.darkProfileId]}>Profile ID: {profileUID}</Text>
          {user.tagLine && user.tagLineIsPublic && <Text style={[styles.tagline, darkMode && styles.darkTagline]}>{user.tagLine}</Text>}
          {user.shortBio && user.shortBioIsPublic && <Text style={[styles.bio, darkMode && styles.darkBio]}>{user.shortBio}</Text>}
          {user.phoneNumber && user.phoneIsPublic && <Text style={[styles.contact, darkMode && styles.darkContact]}>{user.phoneNumber}</Text>}
          {user.email && user.emailIsPublic && <Text style={[styles.contact, darkMode && styles.darkContact]}>{user.email}</Text>}
        </View>

        {/* This is the MiniCard */}
        <MiniCard
          user={{
            ...user,
            imageIsPublic: user.imageIsPublic,
            profileImage: user.imageIsPublic ? user.profileImage : "",
          }}
        />

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, darkMode && styles.darkLabel]}>Experience:</Text>
          {user.experience
            ?.filter((exp) => exp.isPublic)
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
            ))}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, darkMode && styles.darkLabel]}>Education:</Text>
          {user.education
            ?.filter((edu) => edu.isPublic)
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
            ))}
        </View>

        {/* Only show Businesses section if there are businesses */}
        {(() => {
          console.log("ProfileScreen - Rendering businesses section. businessesData:", businessesData);
          console.log("ProfileScreen - businessesData.length:", businessesData?.length);
          return null;
        })()}
        {businessesData && businessesData.length > 0 && (
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, darkMode && styles.darkLabel]}>Businesses:</Text>
            {businessesData.map((business, index) => (
              <TouchableOpacity
                key={business.business_uid || index}
                onPress={() => {
                  if (business.business_uid) {
                    navigation.navigate("BusinessProfile", { business_uid: business.business_uid });
                  }
                }}
                style={[styles.businessCardContainer, darkMode && styles.darkBusinessCardContainer]}
              >
                <MiniCard business={business} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, darkMode && styles.darkLabel]}>Expertise:</Text>
          {user.expertise
            ?.filter((exp) => exp.isPublic)
            .map((exp, index) => (
              <View key={index} style={[styles.inputContainer, darkMode && styles.darkInputContainer, index > 0 && { marginTop: 4 }]}>
                <Text style={[styles.inputText, darkMode && styles.darkInputText]}>{exp.name || ""}</Text>
                <Text style={[styles.inputText, darkMode && styles.darkInputText]}>{exp.description || ""}</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={[styles.inputText, darkMode && styles.darkInputText]}>{exp.cost && exp.cost.toLowerCase() !== "free" ? `cost: $${exp.cost}` : exp.cost ? `cost: ${exp.cost}` : ""}</Text>
                  <Text style={[styles.inputText, { textAlign: "right", minWidth: 60 }, darkMode && styles.darkInputText]}>
                    {exp.bounty && exp.bounty.toLowerCase() !== "free" ? `💰 $${exp.bounty}` : exp.bounty ? `💰 ${exp.bounty}` : ""}
                  </Text>
                </View>
              </View>
            ))}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, darkMode && styles.darkLabel]}>Wishes:</Text>
          {user.wishes
            ?.filter((wish) => wish.isPublic)
            .map((wish, index) => (
              <View key={index} style={[styles.inputContainer, darkMode && styles.darkInputContainer, index > 0 && { marginTop: 4 }]}>
                <Text style={[styles.inputText, darkMode && styles.darkInputText]}>{wish.helpNeeds || ""}</Text>
                <Text style={[styles.inputText, darkMode && styles.darkInputText]}>{wish.details || ""}</Text>
                <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
                  <Text style={[styles.inputText, { textAlign: "right", minWidth: 60 }, darkMode && styles.darkInputText]}>{wish.amount ? `💰 $${wish.amount}` : ""}</Text>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: { flex: 1, backgroundColor: "#fff", padding: 0 },
  scrollContainer: {
    paddingBottom: 20,
  },
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  headerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingTop: 40 },
  header: { fontSize: 24, fontWeight: "bold" },
  fieldContainer: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f5f5f5",
    marginBottom: 4,
  },
  inputText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 4,
  },
  plainText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 10,
  },
  editButton: { padding: 10, marginTop: 5, alignItems: "center", justifyContent: "center" },
  editIcon: { width: 30, height: 30 },
  errorText: { fontSize: 18, color: "red", textAlign: "center", marginTop: 20 },

  cardContainer: {
    padding: 10,
    alignItems: "flex-start",
    marginBottom: 20,
  },

  nameText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
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
    marginBottom: 6,
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
  darkContainer: {
    backgroundColor: "#1a1a1a",
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
    marginBottom: 15,
    borderRadius: 10,
    overflow: "hidden",
  },
  darkBusinessCardContainer: {
    backgroundColor: "#2d2d2d",
  },
});

export default ProfileScreen;
