import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, ScrollView, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MiniCard from "../components/MiniCard";

const ProfileScreenAPI = "https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo";

const ProfileScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profileUID, setProfileUID] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // First try to get data from route params
    loadProfileData();
  }, [route.params]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      // First check if we have data from route params
      if (route.params?.user) {
        const apiUser = route.params.user;
        console.log("Received API User Data:", JSON.stringify(apiUser, null, 2));

        const extractedProfileUID = route.params.profile_uid || apiUser.personal_info?.profile_personal_uid || "";
        console.log("Extracted Profile UID in ProfileScreen:", extractedProfileUID);

        const extractedEmail = apiUser?.user_email || route.params?.email || "";
        console.log("Extracted Email:", extractedEmail);

        setProfileUID(extractedProfileUID);
        processUserData(apiUser, extractedProfileUID, extractedEmail);
      } else {
        // If no route params, try to fetch from API using stored user_uid
        const userUid = await AsyncStorage.getItem("user_uid");
        if (!userUid) {
          throw new Error("User ID not found in storage. Please log in again.");
        }

        console.log("Fetching profile for stored user_uid:", userUid);
        const response = await fetch(`${ProfileScreenAPI}/${userUid}`);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const profileData = await response.json();
        console.log("Fetched profile data:", JSON.stringify(profileData, null, 2));

        if (profileData.message === "Profile not found for this user") {
          navigation.navigate("UserInfo");
          return;
        }

        const email = (await AsyncStorage.getItem("user_email_id")) || "";
        const extractedProfileUID = profileData.personal_info?.profile_personal_uid || "";

        setProfileUID(extractedProfileUID);
        processUserData(profileData, extractedProfileUID, email);
      }
    } catch (error) {
      console.error("Profile loading error:", error.message);
      setError(error.message);
      setLoading(false);
    }
  };

  const processUserData = (apiUser, extractedProfileUID, extractedEmail) => {
    try {
      // Always create a default user object with basic fields
      const userData = {
        profile_uid: extractedProfileUID,
        email: apiUser?.user_email || extractedEmail || "",
        firstName: apiUser.personal_info?.profile_personal_first_name || "",
        lastName: apiUser.personal_info?.profile_personal_last_name || "",
        phoneNumber: apiUser.personal_info?.profile_personal_phone_number || "",
        tagLine: apiUser.personal_info?.profile_personal_tagline || "",
        shortBio: apiUser.personal_info?.profile_personal_short_bio || "",
        emailIsPublic: apiUser.personal_info?.profile_personal_email_is_public === "1",
        phoneIsPublic: apiUser.personal_info?.profile_personal_phone_number_is_public === "1",
        tagLineIsPublic: apiUser.personal_info?.profile_personal_tagline_is_public === "1",
        shortBioIsPublic: apiUser.personal_info?.profile_personal_short_bio_is_public === "1",
        experienceIsPublic: apiUser.personal_info?.profile_personal_experience_is_public === "1",
        educationIsPublic: apiUser.personal_info?.profile_personal_education_is_public === "1",
        expertiseIsPublic: apiUser.personal_info?.profile_personal_expertise_is_public === "1",
        wishesIsPublic: apiUser.personal_info?.profile_personal_wishes_is_public === "1",
        businessIsPublic: apiUser.personal_info?.profile_personal_business_is_public === "1",
      };

      // Parse JSON string fields if they exist
      try {
        userData.experience =
          apiUser.experience_info && typeof apiUser.experience_info === "string" ? JSON.parse(apiUser.experience_info) : Array.isArray(apiUser.experience_info) ? apiUser.experience_info : [];
      } catch (e) {
        console.warn("Error parsing experience:", e);
        userData.experience = [];
      }

      try {
        userData.education =
          apiUser.education_info && typeof apiUser.education_info === "string" ? JSON.parse(apiUser.education_info) : Array.isArray(apiUser.education_info) ? apiUser.education_info : [];
      } catch (e) {
        console.warn("Error parsing education:", e);
        userData.education = [];
      }

      try {
        userData.expertise =
          apiUser.expertise_info && typeof apiUser.expertise_info === "string" ? JSON.parse(apiUser.expertise_info) : Array.isArray(apiUser.expertise_info) ? apiUser.expertise_info : [];
      } catch (e) {
        console.warn("Error parsing expertise:", e);
        userData.expertise = [];
      }

      try {
        userData.wishes = apiUser.wishes_info && typeof apiUser.wishes_info === "string" ? JSON.parse(apiUser.wishes_info) : Array.isArray(apiUser.wishes_info) ? apiUser.wishes_info : [];
      } catch (e) {
        console.warn("Error parsing wishes:", e);
        userData.wishes = [];
      }

      try {
        const socialLinks = apiUser.social_links && typeof apiUser.social_links === "string" ? JSON.parse(apiUser.social_links) : typeof apiUser.social_links === "object" ? apiUser.social_links : {};

        userData.facebook = socialLinks.facebook || "";
        userData.twitter = socialLinks.twitter || "";
        userData.linkedin = socialLinks.linkedin || "";
        userData.youtube = socialLinks.youtube || "";
      } catch (error) {
        console.error(" Error parsing JSON data:", error);
        userData.experience = [];
        userData.education = [];
        userData.expertise = [];
        userData.wishes = [];
        userData.businesses = [];
        userData.facebook = "";
        userData.twitter = "";
        userData.linkedin = "";
        userData.youtube = "";
      }

      console.log("Processed user data:", JSON.stringify(userData, null, 2));
      setUser(userData);
      setLoading(false);
    } catch (e) {
      console.error("Error processing user data:", e);
      setError("Error processing profile data");
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
      <View style={styles.centeredContainer}>
        <ActivityIndicator size='large' color='#007BFF' />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfileData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>No user data available.</Text>
        <TouchableOpacity style={styles.createProfileButton} onPress={() => navigation.navigate("UserInfo")}>
          <Text style={styles.createProfileButtonText}>Create Your Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.pageContainer}>
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Your Profile</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate("EditProfile", { user: user, profile_uid: profileUID })}>
            <Image source={require("../assets/Edit.png")} style={styles.editIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.nameText}>
            {user.firstName} {user.lastName}
          </Text>
          {user.tagLine && user.tagLineIsPublic && <Text style={styles.tagline}>{user.tagLine}</Text>}
          {user.shortBio && user.shortBioIsPublic && <Text style={styles.bio}>{user.shortBio}</Text>}
          {user.phoneNumber && user.phoneIsPublic && <Text style={styles.contact}>{user.phoneNumber}</Text>}
          {user.email && user.emailIsPublic && <Text style={styles.contact}>{user.email}</Text>}
        </View>

        <MiniCard user={user} />

        {user.experience?.some((exp) => exp.isPublic) && (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Experience:</Text>
            {user.experience
              .filter((exp) => exp.isPublic)
              .map((exp, index) => (
                <View key={index} style={styles.inputContainer}>
                  <Text style={styles.inputText}>
                    {exp.startDate || "MM/YYYY"} - {exp.endDate || "MM/YYYY"}
                  </Text>
                  <Text style={styles.inputText}>{exp.title || "Title not specified"}</Text>
                  <Text style={styles.inputText}>{exp.company || "Company not specified"}</Text>
                </View>
              ))}
          </View>
        )}

        {user.education?.some((edu) => edu.isPublic) && (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Education:</Text>
            {user.education
              .filter((edu) => edu.isPublic)
              .map((edu, index) => (
                <View key={index} style={styles.inputContainer}>
                  <Text style={styles.inputText}>
                    {edu.startDate || "Start"} - {edu.endDate || "End"}
                  </Text>
                  <Text style={styles.inputText}>{edu.degree || "Degree not specified"}</Text>
                  <Text style={styles.inputText}>{edu.school || "School not specified"}</Text>
                </View>
              ))}
          </View>
        )}

        {user.wishes?.some((wish) => wish.isPublic) && (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Wishes:</Text>
            {user.wishes
              .filter((wish) => wish.isPublic)
              .map((wish, index) => (
                <View key={index} style={styles.inputContainer}>
                  <Text style={styles.inputText}>{wish.helpNeeds || "No Title"}</Text>
                  <Text style={styles.inputText}>{wish.details || "No Description"}</Text>
                  <Text style={styles.inputText}>💰 {wish.amount ? `$${wish.amount}` : "Free"}</Text>
                </View>
              ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.navContainer}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Profile")}>
          <Image source={require("../assets/profile.png")} style={styles.navIcon} />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Settings")}>
          <Image source={require("../assets/setting.png")} style={styles.navIcon} />
          <Text style={styles.navLabel}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Account")}>
          <Image source={require("../assets/pillar.png")} style={styles.navIcon} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Network")}>
          <Image source={require("../assets/share.png")} style={styles.navIcon} />
          <Text style={styles.navLabel}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Search")}>
          <Image source={require("../assets/search.png")} style={styles.navIcon} />
          <Text style={styles.navLabel}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 0,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f5f5f5",
  },
  plainText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 10,
  },
  editButton: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  editIcon: {
    width: 30,
    height: 30,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  createProfileButton: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  createProfileButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  navButton: {
    alignItems: "center",
  },
  navIcon: {
    width: 25,
    height: 25,
  },
  navLabel: {
    fontSize: 12,
    color: "#333",
    marginTop: 4,
  },
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
  inputText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
});

export default ProfileScreen;
