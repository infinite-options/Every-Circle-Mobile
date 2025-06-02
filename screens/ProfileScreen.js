import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, ScrollView, Image } from "react-native";
// import axios from 'axios';
import MiniCard from "../components/MiniCard";
import BottomNavBar from "../components/BottomNavBar";

// const ProfileScreenAPI = "https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo";
const baseURI = "https://ioec2testsspm.infiniteoptions.com";
const endpointPath = `/api/v1/userprofileinfo`;
const ProfileScreenAPI = baseURI + endpointPath;
console.log(`ProfileScreen - Full endpoint: ${ProfileScreenAPI}`);

const ProfileScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profileUID, setProfileUID] = useState("");

  useEffect(() => {
    console.log("ProfileScreen - useEffect");
    async function fetchUserData(profileUID) {
      try {
        console.log("ProfileScreen - fetchUserData", profileUID);
        const response = await fetch(`${ProfileScreenAPI}/${profileUID}`);
        console.log("Profile Fetch Call:", `${ProfileScreenAPI}/${profileUID}`);
        // console.log("Profile Fetch Response:", response);
        const apiUser = await response.json();
        console.log("API User Profile:", apiUser);
        if (!apiUser || apiUser.message === "Profile not found for this user") {
          console.error("No user data received from API");
          Alert.alert("Error", "Failed to load profile data from server.");
          setLoading(false);
          return;
        }
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
        userData.businesses = apiUser.business_info
          ? (typeof apiUser.business_info === "string" ? JSON.parse(apiUser.business_info) : apiUser.business_info).map((bus) => ({
              profile_business_uid: bus.business_uid || "",
              name: bus.business_name || "",
              // role: bus.profile_business_role || "",
              // isPublic: bus.profile_business_is_visible === 1,
              // isApproved: bus.profile_business_approved === "1",
              // business_uid: bus.profile_business_business_id || "",
            }))
          : [];
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
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    }

    if (route.params?.user) {
      const apiUser = route.params.user;
      console.log(" ProfileScreen - Received API User Data:", JSON.stringify(apiUser, null, 2));
      // console.log(" profile_personal_image:", apiUser?.profile_personal_image);

      const extractedProfileUID = route.params.profile_uid || apiUser.personal_info?.profile_personal_uid || "";
      // console.log(" Extracted Profile UID in ProfileScreen:", extractedProfileUID);

      const extractedEmail = apiUser?.user_email || route.params?.email || "";
      // console.log(" Extracted Email:", extractedEmail);

      if (!extractedProfileUID) {
        console.error(" No profile_uid found in ProfileScreen");
        Alert.alert("Error", "Profile ID is missing.");
        setLoading(false);
        return;
      }

      setProfileUID(extractedProfileUID);

      const userData = {
        profile_uid: extractedProfileUID,
        email: apiUser?.user_email || extractedEmail,
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
        profileImage: apiUser.personal_info?.profile_personal_image ? String(apiUser.personal_info.profile_personal_image) : "what",
        // profileImage: apiUser.personal_info?.profile_personal_image || "",
      };
      // console.log("Tag Line:", apiUser.personal_info?.profile_personal_tag_line);
      // console.log("Tag Line Is Public:", apiUser.personal_info?.profile_personal_tag_line_is_public);
      // console.log("Profile Image from API:", apiUser.personal_info?.profile_personal_image);

      try {
        userData.experience = apiUser.experience_info
          ? (typeof apiUser.experience_info === "string" ? JSON.parse(apiUser.experience_info) : apiUser.experience_info).map((exp) => ({
              profile_experience_uid: exp.profile_experience_uid || "",
              company: exp.profile_experience_company_name || "",
              title: exp.profile_experience_position || "",
              startDate: exp.profile_experience_start_date || "",
              endDate: exp.profile_experience_end_date || "",
              isPublic: exp.profile_experience_is_public === 1 || exp.isPublic === true,
            }))
          : [];
        // console.log("Mapped experience:", userData.experience);

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
        // console.log("Mapped education:", userData.education);

        userData.businesses = apiUser.business_info
          ? (typeof apiUser.business_info === "string" ? JSON.parse(apiUser.business_info) : apiUser.business_info).map((bus) => ({
              profile_business_uid: bus.business_uid || "",
              name: bus.business_name || "",
              // role: bus.profile_business_role || "",
              // isPublic: bus.profile_business_is_visible === 1,
              // isApproved: bus.profile_business_approved === "1",
              // business_uid: bus.profile_business_business_id || "",
            }))
          : [];
        console.log("Mapped businesses:", userData.businesses);

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
        // console.log("Mapped expertise:", userData.expertise);

        userData.wishes = apiUser.wishes_info
          ? (typeof apiUser.wishes_info === "string" ? JSON.parse(apiUser.wishes_info) : apiUser.wishes_info).map((wish) => ({
              profile_wish_uid: wish.profile_wish_uid || "",
              helpNeeds: wish.profile_wish_title || "",
              details: wish.profile_wish_description || "",
              amount: wish.profile_wish_bounty || "",
              isPublic: wish.profile_wish_is_public === 1 || wish.isPublic === true,
            }))
          : [];
        // console.log("Mapped wishes:", userData.wishes);

        const socialLinks = apiUser.social_links && typeof apiUser.social_links === "string" ? JSON.parse(apiUser.social_links) : {};
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

      // console.log(" Setting user data:", JSON.stringify(userData, null, 2));
      // console.log("1");
      setUser(userData);
      // console.log("2");
      setLoading(false);
      // console.log("3");
    } else if (route.params?.profile_uid) {
      fetchUserData(route.params.profile_uid);
    } else {
      console.error(" No user data received in ProfileScreen");
      Alert.alert("Error", "Failed to load profile data.");
      setLoading(false);
    }
  }, [route.params]);

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
    return <ActivityIndicator size='large' color='#007BFF' style={{ marginTop: 50 }} />;
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.pageContainer}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Your Profile</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate("EditProfile", { user: user, profile_uid: profileUID })}>
            <Image source={require("../assets/Edit.png")} style={styles.editIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
          <Image source={user.profileImage && user.profileImage !== "" && user.imageIsPublic ? { uri: String(user.profileImage) } : require("../assets/profile.png")} style={styles.profileImage} />
          <Text style={styles.nameText}>
            {user.firstName} {user.lastName}
          </Text>
          {user.tagLine && user.tagLineIsPublic && <Text style={styles.tagline}>{user.tagLine}</Text>}
          {user.shortBio && user.shortBioIsPublic && <Text style={styles.bio}>{user.shortBio}</Text>}
          {user.phoneNumber && user.phoneIsPublic && <Text style={styles.contact}>{user.phoneNumber}</Text>}
          {user.email && user.emailIsPublic && <Text style={styles.contact}>{user.email}</Text>}
        </View>

        {/* {renderField('First Name (Public)', user?.firstName, true)}
      {renderField('Last Name (Public)', user?.lastName, true)}
      {renderField('Phone Number', user?.phoneNumber, user?.phoneIsPublic)}
      {renderField('Email', user?.email, user?.emailIsPublic)}
      {renderField('Tag Line (40 characters)', user?.tagLine, user?.tagLineIsPublic)}
      {renderField('Short Bio (15 words)', user?.shortBio, user?.shortBioIsPublic)} */}

        <MiniCard user={user} />

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Experience:</Text>
          {user.experience
            ?.filter((exp) => exp.isPublic)
            .map((exp, index, arr) => (
              <View key={index} style={[styles.inputContainer, index > 0 && { marginTop: 4 }]}>
                <Text style={styles.inputText}>{(exp.startDate ? exp.startDate : "") + (exp.startDate && exp.endDate ? " - " : "") + (exp.endDate ? exp.endDate : "")}</Text>
                <Text style={styles.inputText}>{exp.title || ""}</Text>
                <Text style={styles.inputText}>{exp.company || ""}</Text>
              </View>
            ))}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Education:</Text>
          {user.education
            ?.filter((edu) => edu.isPublic)
            .map((edu, index) => (
              <View key={index} style={[styles.inputContainer, index > 0 && { marginTop: 4 }]}>
                <Text style={styles.inputText}>{(edu.startDate ? edu.startDate : "") + (edu.startDate && edu.endDate ? " - " : "") + (edu.endDate ? edu.endDate : "")}</Text>
                <Text style={styles.inputText}>{edu.degree || ""}</Text>
                <Text style={styles.inputText}>{edu.school || ""}</Text>
              </View>
            ))}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Businesses:</Text>
          {user.businesses
            // ?.filter((bus) => bus.isPublic && bus.isApproved)
            .map((bus, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.inputContainer, index > 0 && { marginTop: 4 }]}
                onPress={() => {
                  if (bus.profile_business_uid) {
                    navigation.navigate("BusinessProfile", { business_uid: bus.profile_business_uid });
                  } else {
                    Alert.alert("Error", "Business profile not found.");
                  }
                }}
              >
                <Text style={styles.inputText}>{bus.name || ""}</Text>
                <Text style={styles.inputText}>{bus.role || ""}</Text>
              </TouchableOpacity>
            ))}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Expertise:</Text>
          {user.expertise
            ?.filter((exp) => exp.isPublic)
            .map((exp, index) => (
              <View key={index} style={[styles.inputContainer, index > 0 && { marginTop: 4 }]}>
                <Text style={styles.inputText}>{exp.name || ""}</Text>
                <Text style={styles.inputText}>{exp.description || ""}</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={styles.inputText}>{exp.cost && exp.cost.toLowerCase() !== "free" ? `cost: $${exp.cost}` : exp.cost ? `cost: ${exp.cost}` : ""}</Text>
                  <Text style={[styles.inputText, { textAlign: "right", minWidth: 60 }]}>
                    {exp.bounty && exp.bounty.toLowerCase() !== "free" ? `💰 $${exp.bounty}` : exp.bounty ? `💰 ${exp.bounty}` : ""}
                  </Text>
                </View>
              </View>
            ))}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Wishes:</Text>
          {user.wishes
            ?.filter((wish) => wish.isPublic)
            .map((wish, index) => (
              <View key={index} style={[styles.inputContainer, index > 0 && { marginTop: 4 }]}>
                <Text style={styles.inputText}>{wish.helpNeeds || ""}</Text>
                <Text style={styles.inputText}>{wish.details || ""}</Text>
                <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
                  <Text style={[styles.inputText, { textAlign: "right", minWidth: 60 }]}>{wish.amount ? `💰 $${wish.amount}` : ""}</Text>
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
  headerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingTop: 10 },
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
});

export default ProfileScreen;
